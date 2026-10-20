import asyncio
import time
from types import SimpleNamespace

import httpx
import pytest
from fastapi import HTTPException

from backend.ai_service.app import recommendations as service


class FakeModels:
    def embed_content(self, *, contents, **_kwargs):
        texts = [contents] if isinstance(contents, str) else contents
        embeddings = []
        for text in texts:
            value = text.lower()
            if "plumb" in value or "pipe" in value:
                vector = [1.0, 0.0, 0.0]
            elif "electric" in value or "wiring" in value:
                vector = [0.0, 1.0, 0.0]
            else:
                vector = [0.0, 0.0, 1.0]
            embeddings.append(SimpleNamespace(values=vector))
        return SimpleNamespace(embeddings=embeddings)


class FakeInteractions:
    def create(self, **_kwargs):
        return SimpleNamespace(
            output_text='{"skills":["pipe repair","plumbing"],"experience_level":"intermediate"}',
        )


class FakeClient:
    def __init__(self):
        self.models = FakeModels()
        self.interactions = FakeInteractions()


@pytest.fixture(autouse=True)
def clear_embedding_cache():
    service._embedding_cache.clear()
    yield
    service._embedding_cache.clear()


def test_pii_is_removed_before_job_text_is_sent_to_gemini():
    safe_text = service.sanitize_for_ai(
        "Call me at +92 300 1234567 or worker@example.com. CNIC 12345-1234567-1"
    )
    assert "1234567" not in safe_text
    assert "worker@example.com" not in safe_text
    assert "12345-1234567-1" not in safe_text
    assert safe_text.count("[redacted]") == 3


def test_hybrid_ranker_orders_relevant_workers_and_returns_evidence():
    request = service.RecommendationRequest(
        job=service.JobInput(
            title="Repair a leaking kitchen tap",
            description="A leaking kitchen tap needs plumbing repair.",
            category="Plumbing",
            city="Lahore",
            urgency="flexible",
        ),
        candidates=[
            service.CandidateInput(
                id="plumber",
                serviceCategory="Plumbing",
                skills=["pipe repair", "tap installation"],
                city="Lahore",
                availability={"monday": {"available": True}},
                experience=8,
                rating=4.8,
                totalReviews=10,
                positiveFeedback=4,
                negativeFeedback=0,
            ),
            service.CandidateInput(
                id="electrician",
                serviceCategory="Electrical",
                skills=["wiring", "light installation"],
                city="Karachi",
                experience=4,
            ),
        ],
        limit=2,
    )

    result = service.build_recommendations(request, FakeClient())

    assert result.analysisMode == "gemini_hybrid"
    assert result.requiredSkills == ["pipe repair", "plumbing"]
    assert [item.workerId for item in result.recommendations] == ["plumber", "electrician"]
    assert result.recommendations[0].score > result.recommendations[1].score
    assert any("Plumbing" in reason for reason in result.recommendations[0].reasons)
    assert any("Skills match" in reason for reason in result.recommendations[0].reasons)


def test_empty_candidate_pool_does_not_call_gemini():
    request = service.RecommendationRequest(
        job=service.JobInput(title="Repair a tap", description="The tap is leaking.", category="Plumbing"),
        candidates=[],
    )

    result = service.build_recommendations(request)

    assert result.recommendations == []
    assert result.analysisMode == "no_candidates"


def test_invalid_ai_output_is_a_visible_gateway_error(monkeypatch):
    class InvalidInteractions(FakeInteractions):
        def create(self, **_kwargs):
            return SimpleNamespace(output_text='{"skills": "not a list"}')

    client = SimpleNamespace(models=FakeModels(), interactions=InvalidInteractions())
    request = service.RecommendationRequest(
        job=service.JobInput(title="Repair a tap", description="The tap is leaking.", category="Plumbing"),
        candidates=[service.CandidateInput(id="worker", serviceCategory="Plumbing")],
    )
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")

    with pytest.raises(HTTPException) as error:
        service.build_recommendations(request, client)

    assert error.value.status_code == 502


def test_transient_gemini_outage_is_reported_as_service_unavailable():
    class BusyInteractions(FakeInteractions):
        def create(self, **_kwargs):
            error = RuntimeError("temporarily unavailable")
            error.status_code = 503
            raise error

    client = SimpleNamespace(models=FakeModels(), interactions=BusyInteractions())
    job = service.JobInput(
        title="Repair a tap",
        description="The kitchen tap is leaking.",
        category="Plumbing",
    )

    with pytest.raises(HTTPException) as error:
        service._extract_requirements(client, job)

    assert error.value.status_code == 503


def test_keyword_fallback_ranks_matching_ac_hvac_worker_above_electrician():
    request = service.RecommendationRequest(
        job=service.JobInput(
            title="Repair AC cooling",
            description="The HVAC unit is not cooling and needs an AC repair.",
            category="AC & HVAC",
            city="Lahore",
        ),
        candidates=[
            service.CandidateInput(
                id="hvac",
                serviceCategory="AC & HVAC",
                skills=["AC repair", "HVAC maintenance"],
                city="Lahore",
                experience=6,
                rating=4.8,
                totalReviews=10,
            ),
            service.CandidateInput(
                id="electrician",
                serviceCategory="Electrical",
                skills=["wiring", "light installation"],
                city="Karachi",
                experience=4,
            ),
        ],
        limit=2,
    )

    result = service.build_keyword_recommendations(request)

    assert result.analysisMode == "keyword_fallback"
    assert result.recommendations[0].workerId == "hvac"
    assert result.recommendations[0].score > result.recommendations[1].score
    assert "AC repair" in result.requiredSkills


def test_recommendation_endpoint_falls_back_when_gemini_key_is_unset(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.setenv("AI_SERVICE_TOKEN", "test-service-token")
    request = service.RecommendationRequest(
        job=service.JobInput(title="Fix AC", description="AC is not cooling.", category="AC & HVAC"),
        candidates=[
            service.CandidateInput(id="hvac", serviceCategory="AC & HVAC", skills=["AC repair"]),
        ],
    )

    result = service.recommend(request, authorization="Bearer test-service-token")

    assert result.analysisMode == "keyword_fallback"
    assert result.recommendations[0].workerId == "hvac"


def test_recommendation_endpoint_falls_back_when_gemini_exceeds_timeout(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setenv("AI_SERVICE_TOKEN", "test-service-token")
    monkeypatch.setattr(service, "RECOMMENDATION_TIMEOUT_SECONDS", 0.01)

    def slow_gemini(_request):
        time.sleep(0.05)
        raise AssertionError("Gemini result should be discarded after the timeout")

    monkeypatch.setattr(service, "build_recommendations", slow_gemini)
    request = service.RecommendationRequest(
        job=service.JobInput(title="Fix AC", description="AC is not cooling.", category="AC & HVAC"),
        candidates=[
            service.CandidateInput(id="hvac", serviceCategory="AC & HVAC", skills=["AC repair"]),
        ],
    )

    result = service.recommend(request, authorization="Bearer test-service-token")

    assert result.analysisMode == "keyword_fallback"
    assert result.recommendations[0].workerId == "hvac"


def test_internal_api_requires_backend_token_and_returns_schema(monkeypatch):
    monkeypatch.setenv("AI_SERVICE_TOKEN", "test-service-token")
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setattr(
        service,
        "build_recommendations",
        lambda _request: service.RecommendationResponse(
            analysisMode="gemini_hybrid",
            requiredSkills=["plumbing"],
            recommendations=[
                service.RecommendationResult(workerId="worker", score=78.5, reasons=["Relevant skills"])
            ],
        ),
    )
    payload = {
        "job": {"title": "Repair a tap", "description": "A leaking tap requires repair.", "category": "Plumbing"},
        "candidates": [{"id": "worker", "serviceCategory": "Plumbing", "skills": ["pipe repair"]}],
    }
    async def post_requests():
        transport = httpx.ASGITransport(app=service.app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            unauthorized = await client.post("/v1/recommendations", json=payload)
            authorized = await client.post(
                "/v1/recommendations",
                headers={"Authorization": "Bearer test-service-token"},
                json=payload,
            )
            return unauthorized, authorized

    unauthorized, authorized = asyncio.run(post_requests())

    assert unauthorized.status_code == 401
    assert authorized.status_code == 200
    assert authorized.json()["recommendations"][0]["score"] == 78.5
