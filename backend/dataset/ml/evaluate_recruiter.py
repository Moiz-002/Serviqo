#!/usr/bin/env python3
"""
Recruiter AI (Module 9) - offline evaluation on SMD-2026.

Question answered: "When a customer posts a job, is the worker they finally hire
ranked near the top of the recommendations?"

Ground truth labels
  * hire label      - bids.csv is_hired (the accepted bid) for each job
  * relevance label - recommendation_feedback.csv helpful (1) / not helpful (0)

Protocol
  * Chronological split: train on the oldest 80% of hired jobs, test on the newest 20%.
  * Every worker feature (rating, totalReviews, completedJobs, feedback counts) is
    recomputed AS OF the job's posting time, so no future information leaks in.
  * Candidate pools:
      as_implemented - mirrors controllers/recommendation.js: all active+verified+cnicVerified
                       workers in the job category, sorted by rating then completedJobs, first 100
      legacy_no_category_filter - previous all-category candidate pool, first 100 after sorting
      category_pool  - same, but only workers whose serviceCategory == job.category

Rankers
  random            - expected value, analytic
  report_table_4_1  - "Worker Match Scoring" pseudocode in the FYP report
  serviqo_hybrid    - backend/ai_service/app/recommendations.py _score_candidate().
                      Offline mode replaces the two Gemini calls with local stand-ins
                      (keyword skill extraction + TF-IDF cosine instead of embeddings).
  serviqo_keyword_fallback - calls the production keyword-only fallback directly.
                      Use --gemini to call the real Gemini API (needs GEMINI_API_KEY + the
                      service's requirements installed); --limit keeps API usage small.
  learned_logreg    - logistic-regression ranker trained on the training period's hire labels

Metrics: HitRate@5, HitRate@10, MRR, and ROC-AUC against helpful/not-helpful feedback.

Usage:  python evaluate_recruiter.py
"""
import argparse
import bisect
import importlib.util
import json
import math
import os
import re
import sys
import types
from collections import defaultdict
from datetime import datetime

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.preprocessing import StandardScaler

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "generator"))
from generate_dataset import REPO_CATEGORIES  # noqa: E402  (same skill vocabulary as the app)

ALL_SKILLS = sorted({s for v in REPO_CATEGORIES.values() for s in v})
GENERIC = {"installation", "repair", "cleaning", "maintenance", "setup", "replacement", "work", "service",
           "services", "systems", "system", "design", "construction", "routine", "need", "needed", "required"}
TOK = re.compile(r"[a-z0-9]+")
DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]


# ---------------------------------------------------------------------------
def load_serviqo_module(ai_service_dir, offline):
    """Import the team's recommendations.py. Offline: stub fastapi/google-genai/dotenv if missing."""
    path = os.path.join(ai_service_dir, "app", "recommendations.py")
    if not os.path.exists(path):
        raise SystemExit(f"Could not find {path}. Pass --ai-service <repo>/backend/ai_service")
    if offline:
        for name in ("fastapi", "dotenv", "google", "google.genai", "google.genai.types"):
            try:
                __import__(name)
            except ImportError:
                mod = types.ModuleType(name)
                sys.modules[name] = mod
        fa = sys.modules["fastapi"]
        if not hasattr(fa, "FastAPI"):
            class _App:
                def __init__(self, *a, **k): pass
                def get(self, *a, **k): return lambda f: f
                post = get
            class _HTTPException(Exception):
                def __init__(self, status_code=500, detail=""): super().__init__(detail); self.status_code = status_code
            fa.FastAPI, fa.Header, fa.HTTPException = _App, (lambda default=None, **k: default), _HTTPException
        dv = sys.modules["dotenv"]
        if not hasattr(dv, "load_dotenv"):
            dv.load_dotenv = lambda *a, **k: None
        g = sys.modules["google"]
        if not hasattr(g, "genai"):
            g.genai = sys.modules["google.genai"]
            g.genai.Client = object
            g.genai.types = sys.modules["google.genai.types"]
    spec = importlib.util.spec_from_file_location("serviqo_recommendations", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def stems(text):
    return {t[:5] for t in TOK.findall(text.lower()) if len(t) > 2 and t not in GENERIC}


def keyword_requirements(title, description):
    """Offline stand-in for Gemini's requirement extraction: app skills whose content words appear in the job."""
    words = stems(title + " " + description)
    return [s for s in ALL_SKILLS if stems(s) and stems(s) <= words or len(stems(s) & words) >= 2][:12]


# ---------------------------------------------------------------------------
class PointInTime:
    """Worker stats as of a timestamp, computed from review / feedback history."""
    def __init__(self, reviews, feedback):
        self.rev = defaultdict(list)
        for r in reviews.sort_values("created_at").itertuples():
            self.rev[r.worker_id].append((r.created_at, r.rating))
        self.fb = defaultdict(list)
        for f in feedback.sort_values("created_at").itertuples():
            self.fb[(f.worker_id, f.category)].append((f.created_at, f.helpful))

    def stats(self, wid, cat, t):
        rs = self.rev.get(wid, [])
        k = bisect.bisect_left([x[0] for x in rs], t)
        ratings = [x[1] for x in rs[:k]]
        fb = self.fb.get((wid, cat), [])
        j = bisect.bisect_left([x[0] for x in fb], t)
        hv = [x[1] for x in fb[:j]]
        return dict(rating=round(np.mean(ratings) * 10) / 10 if ratings else 0.0, totalReviews=len(ratings),
                    completedJobs=len(ratings), positiveFeedback=int(sum(hv)), negativeFeedback=int(len(hv) - sum(hv)))


def rank_metrics(ranks, pool_sizes):
    r = np.array(ranks, float)  # 1-based rank of hired worker, inf if not in pool
    return {"HitRate@5": round(float(np.mean(r <= 5)), 4), "HitRate@10": round(float(np.mean(r <= 10)), 4),
            "MRR": round(float(np.mean(np.where(np.isfinite(r), 1 / r, 0))), 4),
            "hired_not_in_pool_pct": round(float(np.mean(~np.isfinite(r)) * 100), 2),
            "mean_pool_size": round(float(np.mean(pool_sizes)), 1), "n_jobs": len(ranks)}


# ---------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", default=os.path.join(HERE, "..", "output", "csv"))
    ap.add_argument("--ai-service", default=os.path.join(HERE, "..", "..", "ai_service"))
    ap.add_argument("--gemini", action="store_true", help="use the real Gemini API for serviqo_hybrid")
    ap.add_argument("--limit", type=int, default=0, help="evaluate only the first N test jobs")
    args = ap.parse_args()

    rec = load_serviqo_module(args.ai_service, offline=not args.gemini)
    d = args.data
    jobs = pd.read_csv(os.path.join(d, "jobs.csv"), parse_dates=["created_at"])
    workers = pd.read_csv(os.path.join(d, "workers.csv"), parse_dates=["created_at"])
    reviews = pd.read_csv(os.path.join(d, "reviews.csv"), parse_dates=["created_at"])
    feedback = pd.read_csv(os.path.join(d, "recommendation_feedback.csv"), parse_dates=["created_at"])
    pit = PointInTime(reviews, feedback)

    workers["skills"] = workers["skills"].fillna("").str.split("|")
    workers = workers[(workers.is_active == 1) & (workers.is_verified == 1) & (workers.cnic_verified == 1)]
    wrows = workers.to_dict("records")
    # availability: workers.csv keeps only the count of working days; rebuild the dict from the Mongo export
    users_json = os.path.join(d, "..", "mongo", "users.json")
    avail = {}
    if os.path.exists(users_json):
        for u in json.load(open(users_json, encoding="utf-8")):
            if u["role"] == "worker":
                avail[u["_id"]["$oid"]] = u.get("availability", {})

    hired = jobs.dropna(subset=["assigned_worker_id"]).sort_values("created_at").reset_index(drop=True)
    cut = int(len(hired) * 0.8)
    train_jobs, test_jobs = hired.iloc[:cut], hired.iloc[cut:]
    if args.limit:
        test_jobs = test_jobs.iloc[:args.limit]

    # TF-IDF stand-in for Gemini embeddings (fit on job texts + worker skill texts)
    worker_text = {w["worker_id"]: (" ".join([w["service_category"], *w["skills"]]).strip() or "service professional")
                   for w in wrows}
    tfidf = TfidfVectorizer(sublinear_tf=True).fit(list(hired.title + " " + hired.description) + list(worker_text.values()))
    W_ids = list(worker_text)
    W_mat = tfidf.transform([worker_text[i] for i in W_ids])
    W_idx = {wid: i for i, wid in enumerate(W_ids)}

    class _FixedDate(datetime):
        current = datetime(2026, 1, 1)
        @classmethod
        def now(cls, tz=None):
            return cls.current
    rec.datetime = _FixedDate   # availability "today" check uses the job's posting date, not the real clock

    gemini_client = None
    if args.gemini:
        gemini_client = rec._client()

    def candidates_for(job, mode):
        t = job.created_at
        pool = []
        for w in wrows:
            if w["created_at"] > t:
                continue
            if mode != "legacy_no_category_filter" and w["service_category"] != job.category:
                continue
            st = pit.stats(w["worker_id"], job.category, t)
            pool.append((w, st))
        if mode in ("as_implemented", "legacy_no_category_filter"):
            pool.sort(key=lambda x: (-x[1]["rating"], -x[1]["completedJobs"]))
            pool = pool[:100]
        return pool

    def feature_rows(job, pool, req_skills, qv):
        rows = []
        sims = (W_mat[[W_idx[w["worker_id"]] for w, _ in pool]] @ qv.T).toarray().ravel() if pool else []
        for (w, st), sim in zip(pool, sims):
            cand = rec.CandidateInput(id=w["worker_id"], serviceCategory=w["service_category"], skills=w["skills"],
                                      city=w["city"], availability=avail.get(w["worker_id"], {}),
                                      experience=w["experience"], **st)
            rows.append((w, st, cand, float(sim)))
        return rows

    def serviqo_scores(job, rows, req_skills, qv_list):
        jin = rec.JobInput(title=job.title[:120], description=job.description[:5000], category=job.category,
                           city=job.city, urgency=job.urgency)
        _FixedDate.current = job.created_at.to_pydatetime().replace(tzinfo=None)
        if args.gemini:
            req = rec.RecommendationRequest(job=jin, candidates=[c for _, _, c, _ in rows], limit=20)
            resp = rec.build_recommendations(req, client=gemini_client)
            sc = {r.workerId: r.score for r in resp.recommendations}
            return [sc.get(c.id, -1.0) for _, _, c, _ in rows]
        return [
            rec._score_candidate(
                jin,
                c,
                req_skills,
                "any",
                [1.0, 0.0],
                [sim, math.sqrt(max(0.0, 1.0 - sim * sim))],
            ).score
            for _, _, c, sim in rows
        ]

    def keyword_fallback_scores(job, rows):
        jin = rec.JobInput(title=job.title[:120], description=job.description[:5000], category=job.category,
                           city=job.city, urgency=job.urgency)
        request = rec.RecommendationRequest(
            job=jin,
            candidates=[candidate for _, _, candidate, _ in rows],
            limit=20,
        )
        response = rec.build_keyword_recommendations(request)
        score_by_id = {item.workerId: item.score for item in response.recommendations}
        return [score_by_id.get(candidate.id, -1.0) for _, _, candidate, _ in rows]

    def report_scores(job, rows, req_skills):
        # Table 4.1: category filter, SkillScore*0.4 + Proximity*0.3 + Performance*0.3,
        # Performance = rating*0.6 + completedJobs*0.4 (min-max normalised, as section 4.1 says)
        req = {t for s in req_skills for t in stems(s)}
        if not rows:
            return []
        cj = np.array([st["completedJobs"] for _, st, _, _ in rows], float)
        cj = (cj - cj.min()) / (cj.max() - cj.min()) if cj.max() > cj.min() else np.zeros_like(cj)
        out = []
        for (w, st, c, _), cjn in zip(rows, cj):
            if w["service_category"] != job.category:
                out.append(-1.0); continue
            ws = {t for s in w["skills"] for t in stems(s)}
            skill = len(req & ws) / len(req) if req else 0.0
            prox = 1.0 if w["city"] == job.city else 0.5
            perf = (st["rating"] / 5) * 0.6 + cjn * 0.4
            out.append(skill * 0.4 + prox * 0.3 + perf * 0.3)
        return out

    def learned_features(job, rows, req_skills):
        req = {t for s in req_skills for t in stems(s)}
        X = []
        for w, st, c, sim in rows:
            ws = {t for s in w["skills"] for t in stems(s)}
            fb_n = st["positiveFeedback"] + st["negativeFeedback"]
            X.append([float(w["service_category"] == job.category), sim, len(req & ws) / len(req) if req else 0.0,
                      float(w["city"] == job.city), math.log1p(w["experience"]), st["rating"] / 5,
                      math.log1p(st["totalReviews"]), (st["positiveFeedback"] + 1) / (fb_n + 2),
                      math.log1p(w["hourly_rate"])])
        return np.array(X)

    # ---- train learned ranker on training-period hires (category pool, sampled negatives) ----
    rng = np.random.default_rng(0)
    Xtr, ytr = [], []
    for job in train_jobs.itertuples():
        pool = candidates_for(job, "category_pool")
        if len(pool) > 25:
            keep = [p for p in pool if p[0]["worker_id"] == job.assigned_worker_id]
            others = [p for p in pool if p[0]["worker_id"] != job.assigned_worker_id]
            pool = keep + [others[i] for i in rng.choice(len(others), 24, replace=False)]
        req = keyword_requirements(job.title, job.description)
        qv = tfidf.transform([" ".join([job.category, job.title, job.description, *req])])
        rows = feature_rows(job, pool, req, qv)
        Xtr.append(learned_features(job, rows, req))
        ytr += [int(w["worker_id"] == job.assigned_worker_id) for w, *_ in rows]
    scaler = StandardScaler().fit(np.vstack(Xtr))
    clf = LogisticRegression(max_iter=2000, C=1.0).fit(scaler.transform(np.vstack(Xtr)), ytr)

    # ---- evaluate ----
    results = {}
    for mode in ("as_implemented", "legacy_no_category_filter", "category_pool"):
        ranks = defaultdict(list); sizes = []
        for job in test_jobs.itertuples():
            pool = candidates_for(job, mode)
            req = keyword_requirements(job.title, job.description)
            qv = tfidf.transform([" ".join([job.category, job.title, job.description, *req])])
            rows = feature_rows(job, pool, req, qv)
            sizes.append(len(rows))
            ids = [w["worker_id"] for w, *_ in rows]
            scorers = {"report_table_4_1": report_scores(job, rows, req),
                       "serviqo_hybrid" + ("_gemini" if args.gemini else "_offline"): serviqo_scores(job, rows, req, None),
                       "serviqo_keyword_fallback": keyword_fallback_scores(job, rows),
                       "learned_logreg": list(clf.decision_function(scaler.transform(learned_features(job, rows, req))))
                       if rows else []}
            for name, sc in scorers.items():
                order = sorted(range(len(ids)), key=lambda i: (-sc[i], ids[i]))
                pos = next((k + 1 for k, i in enumerate(order) if ids[i] == job.assigned_worker_id), math.inf)
                ranks[name].append(pos)
            in_pool = job.assigned_worker_id in ids
            ranks["random (expected)"].append(((len(ids) + 1) / 2) if in_pool else math.inf)
        res = {name: rank_metrics(r, sizes) for name, r in ranks.items()}
        # analytic random HitRate@k instead of the median-rank shortcut
        n = np.array(sizes, float); inp = np.array([np.isfinite(x) for x in ranks["random (expected)"]])
        res["random (expected)"].update({"HitRate@5": round(float(np.mean(inp * np.minimum(5 / n, 1))), 4),
                                         "HitRate@10": round(float(np.mean(inp * np.minimum(10 / n, 1))), 4),
                                         "MRR": round(float(np.mean(inp * np.array([sum(1 / k for k in range(1, int(s) + 1)) / s if s else 0 for s in n]))), 4)})
        results[mode] = res

    # ---- agreement with helpful / not-helpful feedback (test period) ----
    t0 = test_jobs.created_at.min()
    fb_test = feedback[feedback.created_at >= t0].merge(jobs[["job_id", "title", "description", "city", "urgency",
                                                              "created_at"]].rename(columns={"created_at": "job_created"}),
                                                        on="job_id")
    wmap = {w["worker_id"]: w for w in wrows}
    s_hyb, s_keyword, s_rep, s_lr, ys = [], [], [], [], []
    for f in fb_test.itertuples():
        w = wmap.get(f.worker_id)
        if w is None:
            continue
        job = types.SimpleNamespace(title=f.title, description=f.description, category=f.category, city=f.city,
                                    urgency=f.urgency, created_at=f.job_created)
        st = pit.stats(w["worker_id"], f.category, f.job_created)
        req = keyword_requirements(f.title, f.description)
        qv = tfidf.transform([" ".join([f.category, f.title, f.description, *req])])
        rows = feature_rows(job, [(w, st)], req, qv)
        s_keyword.append(keyword_fallback_scores(job, rows)[0])
        if not args.gemini:
            s_hyb.append(serviqo_scores(job, rows, req, None)[0])
        s_rep.append(report_scores(job, rows, req)[0])
        s_lr.append(float(clf.decision_function(scaler.transform(learned_features(job, rows, req)))[0]))
        ys.append(f.helpful)
    auc = {"report_table_4_1": round(float(roc_auc_score(ys, s_rep)), 4),
           "learned_logreg": round(float(roc_auc_score(ys, s_lr)), 4), "n_feedback": len(ys),
           "helpful_rate": round(float(np.mean(ys)), 4)}
    if s_hyb:
        auc["serviqo_hybrid_offline"] = round(float(roc_auc_score(ys, s_hyb)), 4)
    if s_keyword:
        auc["serviqo_keyword_fallback"] = round(float(roc_auc_score(ys, s_keyword)), 4)

    out = {"dataset": "SMD-2026", "split": "chronological, newest 20% of hired jobs as test",
           "n_train_jobs": len(train_jobs), "n_test_jobs": len(test_jobs),
           "mode": "gemini" if args.gemini else "offline (Gemini replaced by keyword extraction + TF-IDF)",
           "ranking": results, "feedback_auc": auc,
           "learned_logreg_coefficients": dict(zip(
               ["category_match", "text_similarity", "skill_overlap", "same_city", "log_experience", "rating/5",
                "log_reviews", "feedback_score", "log_hourly_rate"], [round(float(c), 3) for c in clf.coef_[0]]))}
    os.makedirs(os.path.join(HERE, "results"), exist_ok=True)
    with open(os.path.join(HERE, "results", "recruiter_metrics.json"), "w") as fh:
        json.dump(out, fh, indent=2)

    for mode, res in results.items():
        print(f"\nCandidate pool: {mode}")
        print(f"  {'ranker':28s} {'Hit@5':>7s} {'Hit@10':>7s} {'MRR':>7s} {'notInPool%':>10s} {'pool':>6s}")
        for name, m in res.items():
            print(f"  {name:28s} {m['HitRate@5']:7.3f} {m['HitRate@10']:7.3f} {m['MRR']:7.3f} "
                  f"{m['hired_not_in_pool_pct']:10.1f} {m['mean_pool_size']:6.1f}")
    print("\nAUC vs helpful/not-helpful feedback:", auc)
    print("Saved results/recruiter_metrics.json")


if __name__ == "__main__":
    main()
