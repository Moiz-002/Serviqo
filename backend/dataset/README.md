# Serviqo Marketplace Dataset — SMD-2026

A reproducible, labelled dataset for Serviqo (branch `Moiz-002`), built to match the Mongoose
models in `backend/models/*.js` field-for-field. This dataset lives in `backend/dataset/`.

| | |
|---|---|
| Users | 420 workers, 1,600 customers (Islamabad + Rawalpindi, 28 real areas) |
| Jobs | 6,500 jobs over Jan 2025 – Oct 2026 (5,025 completed, 1,065 cancelled, 395 open, 15 active) |
| Bids | 26,910 bids (≈4 per job), 5,301 accepted |
| Reviews | 3,957 (1–5 stars) |
| Recommendation feedback | 5,650 helpful / not-helpful labels |
| Chat | 5,301 conversations, 21,250 messages · 34 disputes |
| Price anchor | 60 service types with published Islamabad/Rawalpindi rates (`reference/market_rates.csv`) |

## Folder layout

```
reference/market_rates.csv      source price table, one URL per row (43 published, 12 derived, 5 assumptions)
generator/generate_dataset.py   the generator (seeded: same command = same dataset)
output/mongo/*.json             MongoDB Extended JSON, one file per collection, ready to seed
output/csv/*.csv                flat tables for ML and for the report
output/summary.json             record counts
seed/seed-synthetic.js          loads output/mongo into your MongoDB using your backend's bcrypt + mongoose
ml/train_pricing_advisor.py     trains + evaluates the Pricing Advisor (Module 10)
ml/evaluate_recruiter.py        evaluates the Recruiter AI (Module 9), incl. your recommendations.py scorer
ml/results/*.json               the metrics quoted in the dataset card
ml/models/pricing_advisor.joblib trained pricing model
```

## 1. Regenerate (optional — output/ is already generated)

```bash
pip install numpy pandas scikit-learn joblib
python generator/generate_dataset.py --out output --seed 2026
```
Change `--jobs`, `--workers`, `--customers` to scale. Same seed always gives identical files.

## 2. Load into MongoDB (from the repository root)

```bash
npm --prefix backend run seed:demo       # insert synthetic data
npm --prefix backend run seed:reset      # remove ONLY seeded docs
npm --prefix backend run seed:replace    # remove and replace synthetic data
```
The demo seeder defaults to `backend/dataset/output/mongo` when no `--data` argument is supplied.
* Uses `MONGODB_URI` from `backend/.env`. Point it at a dev/demo database, not your live one.
* Every seeded document has `isSynthetic: true`; `--reset` deletes nothing else.
* All seeded customers and workers log in with **`Serviqo@2026`** (override with `SEED_PASSWORD`).
  Pick a phone from `db.users.findOne({role:"worker", isSynthetic:true, cnicVerified:true})`.
* Seeded users whose phone/email already exists are skipped, together with their jobs/bids.
* ~14% of workers are deliberately left `cnicVerified: false` (pending or rejected) so the
  admin verification screen has data.

## 3. Train / evaluate the AI modules

```bash
cd backend/dataset/ml
python train_pricing_advisor.py                                   # ~1 min
python evaluate_recruiter.py                                      # ~1 min, offline
# real Gemini (uses your GEMINI_API_KEY, ~3 API calls per job):
python evaluate_recruiter.py --gemini --limit 150
```
Install evaluator-only dependencies with `pip install -r requirements.txt`. `--gemini` must run in the
`backend/ai_service/.venv` with its service requirements installed.

## Labels

| Label | Where | Used for |
|---|---|---|
| Accepted bid amount (PKR) | `jobs.csv: accepted_amount_pkr`, `bids.status = accepted` | Pricing Advisor regression target |
| Hired / not hired | `bids.csv: is_hired` | Recruiter ranking ground truth |
| Review 1–5 | `reviews.csv: rating` | worker quality signal |
| Helpful / not helpful | `recommendation_feedback.csv: helpful` | Recruiter relevance (matches your `RecommendationFeedback` model) |

`jobs.csv` also carries `service_type` and `quantity` (not stored in Mongo — the app has no such
fields) so you can analyse errors per service; the models do **not** use them as inputs.
