#!/usr/bin/env python3
"""
Pricing Advisor (Module 10) - training + evaluation on SMD-2026.

Target  : accepted bid amount (PKR) of each hired job          -> the price label
Inputs  : only what the post-job form collects - title, description, category,
          city, area, urgency, posting month. (budgetRange is NOT used: it is the
          customer's own guess, and the advisor is meant to suggest it.)
Split   : chronological 80/20 holdout (train on older jobs, test on the newest),
          plus 5-fold cross-validation inside the training period.

Models compared
  A. Report formula (Table 4.1 "Dynamic Price Suggestion"): mean accepted bid for
     category+city x urgency multiplier.
  B. Ridge regression on TF-IDF text + one-hot fields (log-price target).
  C. Gradient-boosted trees on the same features (log-price target).

Outputs ml/results/pricing_metrics.json and ml/models/pricing_advisor.joblib
Usage:  python train_pricing_advisor.py --data ../output/csv
"""
import argparse
import json
import os

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.decomposition import TruncatedSVD
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import KFold, cross_val_predict
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer, OneHotEncoder

HERE = os.path.dirname(os.path.abspath(__file__))
TEXT, CATS = "text", ["category", "city", "area", "urgency", "month"]


def load(data_dir):
    jobs = pd.read_csv(os.path.join(data_dir, "jobs.csv"), parse_dates=["created_at"])
    df = jobs.dropna(subset=["accepted_amount_pkr"]).copy()
    df[TEXT] = df["title"] + ". " + df["description"]
    df["month"] = df["created_at"].dt.month.astype(str)
    df["t"] = (df["created_at"] - df["created_at"].min()).dt.days.astype(float)
    df["y"] = df["accepted_amount_pkr"].astype(float)
    return df.sort_values("created_at").reset_index(drop=True)


def metrics(y, p):
    y, p = np.asarray(y, float), np.asarray(p, float)
    ape = np.abs(p - y) / y
    return {
        "MAE_PKR": round(float(mean_absolute_error(y, p)), 1),
        "MedianAE_PKR": round(float(np.median(np.abs(p - y))), 1),
        "MAPE_pct": round(float(ape.mean() * 100), 2),
        "MedianAPE_pct": round(float(np.median(ape) * 100), 2),
        "R2": round(float(r2_score(y, p)), 4),
        "R2_log": round(float(r2_score(np.log(y), np.log(np.maximum(p, 1)))), 4),
        # The advisor shows a range [0.8*avg, 1.2*avg] (report Table 4.1). How often does the real price land in it?
        "range_hit_rate_pct": round(float(np.mean((y >= 0.8 * p) & (y <= 1.2 * p)) * 100), 2),
        "n": int(len(y)),
    }


def report_formula(train, test):
    """Table 4.1 pseudocode. Report says High/Medium urgency; app uses emergency/today/scheduled/flexible."""
    mult = {"emergency": 1.25, "today": 1.10, "scheduled": 1.0, "flexible": 1.0}
    base_cc = train.groupby(["category", "city"])["y"].mean()
    base_c = train.groupby("category")["y"].mean()
    return np.array([
        base_cc.get((r.category, r.city), base_c.get(r.category, train["y"].mean())) * mult.get(r.urgency, 1.0)
        for r in test.itertuples()
    ])


def years(x):
    return x / 365.0


def features(dense=False):
    text = TfidfVectorizer(ngram_range=(1, 2), min_df=2, sublinear_tf=True)
    text_pipe = Pipeline([("tfidf", text), ("svd", TruncatedSVD(120, random_state=0))]) if dense else text
    onehot = OneHotEncoder(handle_unknown="ignore", sparse_output=not dense)
    return ColumnTransformer([("text", text_pipe, TEXT), ("cat", onehot, CATS),
                              ("t", FunctionTransformer(years), ["t"])])


def models():
    return {
        "ridge_tfidf": Pipeline([("f", features()), ("m", Ridge(alpha=1.0))]),
        "gbm_tfidf_svd": Pipeline([("f", features(dense=True)),
                                   ("m", HistGradientBoostingRegressor(max_iter=500, learning_rate=0.06,
                                                                       l2_regularization=1.0, random_state=0))]),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", default=os.path.join(HERE, "..", "output", "csv"))
    args = ap.parse_args()
    df = load(args.data)
    cut = int(len(df) * 0.8)
    train, test = df.iloc[:cut], df.iloc[cut:]
    X_cols = [TEXT, *CATS, "t"]
    print(f"Labelled jobs: {len(df)} | train {len(train)} ({train.created_at.min():%Y-%m-%d} .. "
          f"{train.created_at.max():%Y-%m-%d}) | test {len(test)} (.. {test.created_at.max():%Y-%m-%d})")

    out = {"dataset": "SMD-2026 jobs.csv (accepted bids)", "split": "chronological 80/20 + 5-fold CV on train",
           "n_train": len(train), "n_test": len(test), "results": {}}
    out["results"]["A_report_formula_table_4_1"] = {"holdout": metrics(test.y, report_formula(train, test))}

    best_name, best_mape, fitted = None, 1e9, {}
    for name, model in models().items():
        cv = cross_val_predict(model, train[X_cols], np.log(train.y), cv=KFold(5, shuffle=True, random_state=0))
        model.fit(train[X_cols], np.log(train.y))
        pred = np.exp(model.predict(test[X_cols]))
        out["results"][name] = {"cv5_train": metrics(train.y, np.exp(cv)), "holdout": metrics(test.y, pred)}
        fitted[name] = model
        if out["results"][name]["holdout"]["MAPE_pct"] < best_mape:
            best_name, best_mape = name, out["results"][name]["holdout"]["MAPE_pct"]

    # per-category breakdown for the best model
    best_pred = np.exp(fitted[best_name].predict(test[X_cols]))
    out["best_model"] = best_name
    out["best_model_by_category"] = {c: metrics(test.y[test.category == c], best_pred[(test.category == c).values])
                                     for c in sorted(test.category.unique())}
    # refit best on all labelled data for deployment
    final = models()[best_name].fit(df[X_cols], np.log(df.y))
    os.makedirs(os.path.join(HERE, "models"), exist_ok=True)
    os.makedirs(os.path.join(HERE, "results"), exist_ok=True)
    joblib.dump({"model": final, "target": "log(PKR)", "features": X_cols,
                 "t0": str(df.created_at.min())}, os.path.join(HERE, "models", "pricing_advisor.joblib"))
    with open(os.path.join(HERE, "results", "pricing_metrics.json"), "w") as fh:
        json.dump(out, fh, indent=2)

    print(f"\n{'model':32s} {'MAE(PKR)':>9s} {'MAPE%':>7s} {'MdAPE%':>7s} {'R2':>7s} {'R2log':>7s} {'in±20%':>7s}")
    for name, r in out["results"].items():
        h = r["holdout"]
        print(f"{name:32s} {h['MAE_PKR']:9.0f} {h['MAPE_pct']:7.1f} {h['MedianAPE_pct']:7.1f} {h['R2']:7.3f} "
              f"{h['R2_log']:7.3f} {h['range_hit_rate_pct']:7.1f}")
    print(f"\nBest: {best_name}. Saved models/pricing_advisor.joblib and results/pricing_metrics.json")


if __name__ == "__main__":
    main()
