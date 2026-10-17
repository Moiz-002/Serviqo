# Serviqo Module 9 Recommendation Service

This Python service performs bounded AI-assisted worker recommendations for the Express backend. The central backend authenticates the Customer, verifies job ownership, loads only active and verified workers who are eligible to bid, and returns the final public profile data. The Python service analyzes the request with Gemini, retrieves semantically relevant skill/category profiles using Gemini embeddings, and ranks candidates using deterministic category, skill, location, experience, rating-confidence, and category-specific feedback features.

Gemini is not allowed to select an ineligible worker or access MongoDB. It receives the job's category, title, and description after common email, phone-number, and CNIC patterns are redacted. Embeddings are created only from worker service-category and skill phrases; names, account IDs, contact details, ratings, addresses, identity documents, and portfolio URLs are excluded. A Customer must explicitly request recommendations in the job page before the backend sends the request for AI processing. Avoid placing personal or sensitive details in a job description.

## Local setup

From the repository root, install the Python dependencies into the backend-local virtual environment:

```powershell
python -m venv backend\ai_service\.venv
backend\ai_service\.venv\Scripts\python.exe -m pip install -r backend\ai_service\requirements.txt
```

The implementation was installed and tested with Python 3.14.3 on Windows. The Gemini API key is read from `backend\.env` as `GEMINI_API_KEY`; do not add it to source control or frontend variables.

Start the Python recommendation service in one terminal:

```powershell
cd backend
npm run ai:dev
```

Start the Express backend and Next.js frontend in their usual development terminals. The Node service calls `http://127.0.0.1:8001` by default.

## Optional configuration

The following variables may be set in `backend\.env`:

| Variable | Default | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | — | Server-side Gemini API key; required for recommendations. |
| `GEMINI_MODEL` | `gemini-3.5-flash-lite` | Gemini model used to extract service requirements via the Interactions API. |
| `GEMINI_EMBEDDING_MODEL` | `gemini-embedding-001` | Embedding model used for hybrid semantic retrieval. |
| `AI_SERVICE_URL` | `http://127.0.0.1:8001` | Base URL of the Python service. |
| `AI_SERVICE_TOKEN` | unset for loopback development | Shared bearer token between the Node and Python services. Required when the Python service is hosted remotely. |

Keep the Python service bound to loopback for local development. For a remotely reachable deployment, configure the same strong `AI_SERVICE_TOKEN` in both services, use HTTPS/private networking, and restrict network access. Never expose the Gemini key or AI service token in `NEXT_PUBLIC_*` settings.

## API

- `GET /healthz` — liveness check.
- `POST /v1/recommendations` — internal backend-to-AI request; requires `Authorization: Bearer <AI_SERVICE_TOKEN>` when a token is configured.

The public application endpoints are authenticated and mounted under `/api/jobs`:

- `GET /:jobId/recommendations` — Customer-owned open job recommendations.
- `PUT /:jobId/recommendations/feedback` — save or update the Customer's helpful/not-helpful rating for a recommended Worker.

Each Customer can update feedback once per worker per job. Category-specific feedback aggregates contribute a small, smoothed ranking signal; the service does not perform online model training. The weighted ranking is reproducible for the same inputs and embedding responses.

## Tests

```powershell
backend\ai_service\.venv\Scripts\python.exe -m pytest backend\ai_service\tests -q
cd backend
npm test
```
