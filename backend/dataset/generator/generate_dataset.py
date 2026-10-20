#!/usr/bin/env python3
"""
Serviqo Marketplace Dataset generator (SMD-2026)
================================================

Builds a reproducible, labelled dataset for the Serviqo home-services
marketplace that matches the Mongoose models on branch `Moiz-002`
(backend/models/*.js) field-for-field.

How the data is produced
------------------------
1. Real market prices: every job is priced from `reference/market_rates.csv`,
   a table of published Islamabad/Rawalpindi labour rates (findworker.pk and
   The Handyman), with the source URL on every row.
2. Agent-based simulation: workers and customers are simulated. Customers post
   jobs, eligible workers decide whether to bid (category, skills, distance,
   responsiveness), each bid is priced off the market rate, and the customer
   picks one bid with a choice model (price vs. quality vs. skills vs. distance).
3. Labels come out of that process, the same way they would on the live
   platform: the accepted bid amount (price label), which bid was accepted
   (hire label), the 1-5 review (quality label) and helpful / not-helpful
   recommendation feedback (relevance label).

Everything is seeded, so the same command always produces the same dataset.

Usage:  python generate_dataset.py --out ../output [--seed 2026] [--jobs 6500]
"""
from __future__ import annotations

import argparse
import csv
import json
import math
import os
from collections import defaultdict
from datetime import datetime, timedelta, timezone

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
RATES_CSV = os.path.join(HERE, "..", "reference", "market_rates.csv")

# --------------------------------------------------------------------------
# Constants copied from the repo so stored values match what the app writes
# --------------------------------------------------------------------------
# frontend/src/config/worker-constants.js -> CATEGORIES (name, skills)
REPO_CATEGORIES = {
    "Electrical": ["Circuit breaker repair", "LED installation", "Inverter wiring", "CCTV installation",
                   "Solar panel wiring", "Generator maintenance", "Ceiling fan installation",
                   "Electrical troubleshooting", "Home automation setup", "Backup power systems"],
    "Plumbing": ["Pipe fitting", "Leak detection", "Water heater installation", "Bathroom fitting",
                 "Drainage cleaning", "Tap replacement", "Sewer line repair", "Water pressure regulation",
                 "Geyser installation", "Underground pipe work"],
    "Carpentry": ["Furniture assembly", "Custom cabinet making", "Door installation", "Wooden flooring",
                  "Shelving design", "Bed frame construction", "Wood finishing", "Repair restoration",
                  "Deck building", "Interior woodwork"],
    "Cleaning": ["Deep cleaning", "Routine maintenance", "Carpet cleaning", "Window cleaning",
                 "Post-construction cleanup", "Move-in/out cleaning", "Commercial cleaning", "Stain removal",
                 "Upholstery cleaning", "Pressure washing"],
    "Appliance Repair": ["Washing machine repair", "Refrigerator repair", "Microwave repair", "Dishwasher repair",
                         "Oven repair", "Dryer repair", "Water dispenser maintenance", "Appliance diagnostics",
                         "Parts replacement", "Electrical troubleshooting"],
    "AC & HVAC": ["AC installation", "AC servicing", "Gas refill", "Compressor repair", "Ductwork installation",
                  "Thermostat setup", "Preventive maintenance", "Refrigerant charging", "Condenser cleaning",
                  "Air quality assessment"],
}
# frontend/src/config/job-constants.js -> BUDGET_RANGES[].range (what post-job stores)
BUDGET_RANGES = [(0, 2000, "500 - 2,000 PKR"), (2000, 10000, "2,000 - 10,000 PKR"),
                 (10000, 50000, "10,000 - 50,000 PKR"), (50000, 1e12, "Above 50,000 PKR")]
# URGENCY_LEVELS[].id (what post-job stores)
URGENCY = ["emergency", "today", "scheduled", "flexible"]
URGENCY_P = [0.10, 0.27, 0.33, 0.30]
URGENCY_PREMIUM = {"emergency": 1.25, "today": 1.10, "scheduled": 1.00, "flexible": 0.96}  # latent, see dataset card
RESPONSE_TIMES = ["Within 1 hour", "Within 4 hours", "Same day", "Within 24 hours"]
EXPERIENCE_VALUES = [0, 1, 3, 6, 10]          # what onboarding stores for each dropdown option
EXPERIENCE_P = [0.10, 0.22, 0.30, 0.23, 0.15]
HOURS = ["07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM"], ["05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM"]
DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

# Areas (approx. centroid lat/lon). Zone follows The Handyman's published zoning:
# Zone 1 = E/F/G/H/I sectors of Islamabad; Zone 2 = Bahria, DHA, Bani Gala, PWD, Rawalpindi etc.
AREAS = [
    # city, area, zone, lat, lon, weight
    ("Islamabad", "F-6", 1, 33.727, 73.075, 3), ("Islamabad", "F-7", 1, 33.721, 73.056, 3),
    ("Islamabad", "F-8", 1, 33.710, 73.037, 3), ("Islamabad", "F-10", 1, 33.695, 73.012, 4),
    ("Islamabad", "F-11", 1, 33.684, 72.990, 4), ("Islamabad", "G-6", 1, 33.712, 73.090, 3),
    ("Islamabad", "G-9", 1, 33.690, 73.035, 4), ("Islamabad", "G-10", 1, 33.677, 73.015, 4),
    ("Islamabad", "G-11", 1, 33.668, 72.995, 4), ("Islamabad", "G-13", 1, 33.650, 72.965, 4),
    ("Islamabad", "E-11", 1, 33.700, 72.975, 3), ("Islamabad", "I-8", 1, 33.668, 73.075, 4),
    ("Islamabad", "I-10", 1, 33.647, 73.040, 4), ("Islamabad", "H-13", 1, 33.640, 72.990, 2),
    ("Islamabad", "Bani Gala", 2, 33.715, 73.150, 2), ("Islamabad", "Bhara Kahu", 2, 33.735, 73.185, 2),
    ("Islamabad", "PWD", 2, 33.575, 73.140, 3), ("Islamabad", "DHA Phase 2", 2, 33.535, 73.155, 4),
    ("Islamabad", "Gulberg Greens", 2, 33.600, 73.190, 2), ("Islamabad", "Bahria Enclave", 2, 33.765, 73.215, 2),
    ("Rawalpindi", "Saddar", 2, 33.597, 73.050, 3), ("Rawalpindi", "Satellite Town", 2, 33.636, 73.071, 4),
    ("Rawalpindi", "Chaklala Scheme III", 2, 33.585, 73.090, 3), ("Rawalpindi", "Westridge", 2, 33.610, 73.020, 3),
    ("Rawalpindi", "Bahria Town Phase 7", 2, 33.520, 73.100, 4), ("Rawalpindi", "Gulraiz", 2, 33.585, 73.118, 2),
    ("Rawalpindi", "Adiala Road", 2, 33.555, 73.030, 2), ("Rawalpindi", "Peshawar Road", 2, 33.620, 73.005, 2),
]
ZONE_PREMIUM = {1: 1.00, 2: 1.08}   # Handyman Zone-2 minimum is Rs 2,000 vs Rs 1,500 -> modest premium

CATEGORY_WEIGHT = {"Electrical": 0.21, "Plumbing": 0.22, "AC & HVAC": 0.18, "Cleaning": 0.16,
                   "Carpentry": 0.10, "Appliance Repair": 0.13}
# Month-of-year demand multipliers (index 1..12). AC peaks in summer, geysers in winter.
SEASON = {
    "AC & HVAC": [0, .35, .4, .8, 1.5, 2.2, 2.4, 2.1, 1.7, 1.0, .5, .35, .3],
    "Plumbing": [0, 1.3, 1.1, 1, .9, .9, .9, 1, 1, 1, 1.1, 1.3, 1.4],
    "Electrical": [0, .9, .9, 1, 1.1, 1.2, 1.3, 1.3, 1.2, 1, .9, .9, .9],
    "Cleaning": [0, .8, .9, 1.3, 1.1, 1, .9, .9, .9, 1, 1.1, 1, 1.2],
    "Carpentry": [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    "Appliance Repair": [0, .9, .9, 1, 1.1, 1.2, 1.3, 1.2, 1.1, 1, .9, .9, .9],
}
WINTER_ITEMS = {"Gas Geyser Installation", "Geyser Service", "Electric Geyser Installation"}
SUMMER_ITEMS = {"Water Dispenser Repair (labour)", "Refrigerator Repair (labour)"}
MONTHLY_INFLATION = 0.006       # ~7.4% / year drift in labour prices

MALE = ["Ahmed", "Ali", "Usman", "Bilal", "Hamza", "Imran", "Kashif", "Faisal", "Asad", "Zeeshan", "Naveed", "Tariq",
        "Shahid", "Waqas", "Adeel", "Rizwan", "Junaid", "Saad", "Hassan", "Hussain", "Arslan", "Umair", "Danish",
        "Noman", "Kamran", "Sajid", "Irfan", "Fahad", "Moiz", "Talha", "Haris", "Owais", "Sohail", "Nadeem", "Javed",
        "Rashid", "Zubair", "Shoaib", "Yasir", "Aamir", "Iftikhar", "Ghulam", "Akram", "Mushtaq", "Khalid", "Babar"]
FEMALE = ["Ayesha", "Fatima", "Zainab", "Maryam", "Hira", "Sana", "Amna", "Sadia", "Nida", "Rabia", "Mahnoor", "Iqra",
          "Maria", "Sidra", "Kiran", "Saima", "Uzma", "Bushra", "Farah", "Hina", "Anum", "Komal", "Mehwish", "Aliya"]
SURNAMES = ["Khan", "Malik", "Butt", "Qureshi", "Raja", "Abbasi", "Chaudhry", "Sheikh", "Awan", "Mirza", "Siddiqui",
            "Hashmi", "Gondal", "Janjua", "Bhatti", "Kiani", "Satti", "Akhtar", "Iqbal", "Hussain", "Shah", "Rana",
            "Mughal", "Durrani", "Yousafzai", "Afridi", "Khattak", "Niazi", "Jadoon", "Tanoli"]

NOW = datetime(2026, 10, 19, 12, 0, tzinfo=timezone.utc)
START = datetime(2025, 1, 1, tzinfo=timezone.utc)
END = datetime(2026, 10, 18, tzinfo=timezone.utc)


# --------------------------------------------------------------------------
def load_rates():
    with open(RATES_CSV, newline="", encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh))
    for r in rows:
        for k in ("min_pkr", "max_pkr", "qty_min", "qty_max"):
            r[k] = float(r[k])
        r["related_skills"] = [s.strip() for s in r["related_skills"].split(";") if s.strip()]
    by_cat = defaultdict(list)
    for r in rows:
        by_cat[r["category"]].append(r)
    return rows, by_cat


def haversine_km(a, b):
    lat1, lon1, lat2, lon2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((lat2 - lat1) / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin((lon2 - lon1) / 2) ** 2
    return 6371 * 2 * math.asin(math.sqrt(h))


class Ids:
    """Mongo-style ObjectIds whose embedded timestamp equals the record's createdAt."""
    def __init__(self, rng):
        self.rng = rng
        self.counter = int(rng.integers(0, 2 ** 24))

    def new(self, ts: datetime) -> str:
        self.counter = (self.counter + 1) % (2 ** 24)
        rand = int(self.rng.integers(0, 2 ** 40))
        return f"{int(ts.timestamp()):08x}{rand:010x}{self.counter:06x}"


def iso(ts: datetime) -> str:
    return ts.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")


def oid(x):
    return {"$oid": x} if x else None


def dt(x):
    return {"$date": iso(x)} if x else None


def round_to(x, step=50):
    return int(max(step, round(x / step) * step))


# --------------------------------------------------------------------------
# Text templates
# --------------------------------------------------------------------------
TITLE_TPL = {
    "per unit": ["{svc} for {q} unit{s}", "Need {svc} ({q} unit{s})", "{svc} required - {q} unit{s}"],
    "per piece": ["{svc} ({q} piece{s})", "Need {svc} x{q}", "{svc} needed for {q} item{s}"],
    "per point": ["{svc} - {q} point{s}", "Need {q} new point{s}: {svc}"],
    "per job": ["{svc}", "Need {svc}", "{svc} required", "Looking for {svc}"],
    "per drain": ["{svc} - {q} drain{s}", "Blocked drain{s}, need {svc}"],
    "per bathroom": ["{svc} for {q} bathroom{s}", "{svc} ({q} bathroom{s})"],
    "per seat": ["{svc} - {q} seater", "{svc} for {q}-seater sofa"],
    "per tank": ["{svc} ({q} tank{s})", "Need {svc}"],
    "per door": ["{svc} - {q} door{s}", "{svc} for {q} door{s}"],
    "per set": ["{svc} - {q} set{s}", "{svc} for {q} drawer{s}"],
    "per item": ["{svc} - {q} item{s}", "Need {q} item{s} fixed on wall"],
    "per camera": ["{svc} - {q} camera{s}", "Install {q} CCTV camera{s}"],
}
DESC_OPENERS = ["Assalam o Alaikum, ", "Hi, ", "Hello, ", "", "", "Salam, "]
DESC_DETAIL = {
    "AC & HVAC": ["The AC is not cooling properly and makes noise.", "Cooling has dropped since last summer.",
                  "Water is dripping from the indoor unit.", "Inverter AC, 1.5 ton.", "Unit is 1 ton, about 4 years old."],
    "Plumbing": ["Water is leaking and the floor stays wet.", "Old fitting is broken and needs replacing.",
                 "Water pressure is very low.", "Material is available at home.", "Please bring your own tools."],
    "Electrical": ["Wiring is already in place.", "Sparks came from the board yesterday.", "Need neat and safe work.",
                   "Fixtures are purchased, only installation needed.", "Breaker trips frequently."],
    "Cleaning": ["House was closed for a few months.", "Shifting into this house next week.",
                 "Please bring your own chemicals and equipment.", "Some tough stains on the floor.", "Ground floor only."],
    "Carpentry": ["Wood is fine, only fittings need work.", "Door is not closing properly.",
                  "Hardware is available, only labour needed.", "Furniture was recently shifted.", "Need it done neatly."],
    "Appliance Repair": ["Machine stopped working suddenly.", "Showing an error code on the display.",
                         "It is making a loud noise.", "Appliance is about 5 years old.", "Not under warranty."],
}
TIMING = {"emergency": "This is urgent, please come within 2 hours.", "today": "Need it done today before evening.",
          "scheduled": "Can schedule on a convenient date this week.", "flexible": "Timing is flexible, next 2-3 days is fine."}
PROPOSALS = [
    "I have {exp} years of experience in {cat}. I can complete the {svc} work neatly and on time.",
    "Salam, I can do this {svc} job. Price includes labour only, parts extra if needed.",
    "Experienced {cat} professional. I will inspect first and finish the job the same visit.",
    "I can come {when}. Rate covers complete {svc} work with clean finishing.",
    "Available {when}. I have done many similar {svc} jobs in {area}.",
    "Price is for labour. I bring my own tools and will test everything before leaving.",
]
REVIEWS = {
    5: ["Excellent work, very professional.", "Highly recommended, came on time.", "Great job, very neat work.",
        "Very polite and skilled. Will hire again.", "Problem fixed perfectly, thank you!"],
    4: ["Good work, slight delay in arrival.", "Did the job well.", "Satisfied with the work.", "Good service overall."],
    3: ["Work was okay, could be cleaner.", "Average experience.", "Job done but took longer than expected."],
    2: ["Not satisfied, had to call again.", "Came late and work was rushed.", "Overcharged for the work."],
    1: ["Very poor work, problem not fixed.", "Did not come on time and work was bad.", "Would not recommend."],
}
BIOS = ["{exp}+ years of experience in {cat_l} work across {city}. Honest pricing and neat work.",
        "Professional {cat_l} technician serving {city}. Available for home and office jobs.",
        "Skilled in {skills}. Customer satisfaction is my priority.",
        "Reliable {cat_l} services in {area} and nearby areas. Quick response."]
CHAT = [("customer", "Salam, when can you come?"), ("worker", "Wa alaikum salam, I can come {when}."),
        ("customer", "Okay, please confirm the address in {area}."), ("worker", "Confirmed, I will be there on time."),
        ("customer", "Thank you."), ("worker", "Work completed, please check and mark the job complete.")]


# --------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=os.path.join(HERE, "..", "output"))
    ap.add_argument("--seed", type=int, default=2026)
    ap.add_argument("--jobs", type=int, default=6500)
    ap.add_argument("--workers", type=int, default=420)
    ap.add_argument("--customers", type=int, default=1600)
    args = ap.parse_args()

    rng = np.random.default_rng(args.seed)
    ids = Ids(rng)
    rates, rates_by_cat = load_rates()
    cats = list(CATEGORY_WEIGHT)
    area_w = np.array([a[5] for a in AREAS], float); area_w /= area_w.sum()

    def pick(seq, p=None):
        return seq[int(rng.choice(len(seq), p=p))]

    def rand_time(a, b):
        return a + timedelta(seconds=float(rng.uniform(0, (b - a).total_seconds())))

    used_phones, used_emails = set(), set()

    def person(gender_p_female):
        female = rng.random() < gender_p_female
        first = pick(FEMALE if female else MALE)
        name = f"{first} {pick(SURNAMES)}"
        while True:
            phone = "+923" + "".join(str(d) for d in rng.integers(0, 10, 9))
            if phone not in used_phones:
                used_phones.add(phone); break
        email = None
        if rng.random() < 0.7:
            base = name.lower().replace(" ", ".")
            email = f"{base}{int(rng.integers(1, 999))}@example.com"
            while email in used_emails:
                email = f"{base}{int(rng.integers(1, 9999))}@example.com"
            used_emails.add(email)
        return name, phone, email

    # ---------------- Workers ----------------
    workers = []
    for _ in range(args.workers):
        cat = pick(cats, p=np.array(list(CATEGORY_WEIGHT.values())))
        a = AREAS[int(rng.choice(len(AREAS), p=area_w))]
        name, phone, email = person(0.35 if cat == "Cleaning" else 0.0)
        exp = int(pick(EXPERIENCE_VALUES, p=EXPERIENCE_P))
        # latent quality: partly experience, mostly individual
        q = 0.35 * (exp - 4) / 3.4 + 0.94 * rng.normal()
        price_factor = math.exp(0.07 * q + 0.03 * (exp - 4) / 3.4 + rng.normal(0, 0.07))
        resp = float(rng.beta(2.2, 3.0))     # how often they bid when they see a matching job
        repo_skills = REPO_CATEGORIES[cat]
        k = int(rng.integers(3, 8))
        skills = list(rng.choice(repo_skills, size=min(k, len(repo_skills)), replace=False))
        if rng.random() < 0.12:              # some cross-skilled workers (e.g. electrician who services ACs)
            other = pick([c for c in cats if c != cat])
            skills.append(pick(REPO_CATEGORIES[other]))
        joined = rand_time(START - timedelta(days=200), END - timedelta(days=45))
        n_days = int(rng.integers(4, 8))
        workdays = set(rng.choice(DAYS, size=n_days, replace=False))
        start_h, end_h = pick(HOURS[0]), pick(HOURS[1])
        cnic_status = rng.choice(["verified", "pending", "rejected"], p=[0.86, 0.10, 0.04])
        base_hr = {"Cleaning": 450, "Carpentry": 600, "Plumbing": 650, "Electrical": 700,
                   "Appliance Repair": 800, "AC & HVAC": 900}[cat]
        workers.append(dict(
            _id=ids.new(joined), name=name, phone=phone, email=email, role="worker", city=a[0], address=a[1],
            zone=a[2], lat=a[3], lon=a[4], isVerified=bool(rng.random() < 0.97), isActive=bool(rng.random() < 0.95),
            serviceCategory=cat, skills=[str(s) for s in skills], experience=exp,
            hourlyRate=round_to(base_hr * price_factor * rng.uniform(0.85, 1.25), 50),
            availability={d: {"available": d in workdays, "from": start_h, "to": end_h} for d in DAYS},
            cnic_status=str(cnic_status), responseTime=RESPONSE_TIMES[min(3, int((1 - resp) * 4))],
            bio=pick(BIOS).format(exp=max(exp, 1), cat_l=cat.lower(), city=a[0], area=a[1],
                                  skills=", ".join(skills[:3]).lower()),
            createdAt=joined, q=q, price_factor=price_factor, resp=resp,
        ))
    workers_by_cat = defaultdict(list)
    for w in workers:
        workers_by_cat[w["serviceCategory"]].append(w)

    # ---------------- Customers ----------------
    customers = []
    for _ in range(args.customers):
        a = AREAS[int(rng.choice(len(AREAS), p=area_w))]
        name, phone, email = person(0.40)
        customers.append(dict(_id=None, name=name, phone=phone, email=email, role="customer", city=a[0],
                              address=a[1], zone=a[2], lat=a[3], lon=a[4], isVerified=bool(rng.random() < 0.98),
                              isActive=True, activity=float(rng.pareto(1.6) + 0.2), first_job=None))
    cust_p = np.array([c["activity"] for c in customers]); cust_p /= cust_p.sum()

    # ---------------- Job timeline (seasonal) ----------------
    days = [(START + timedelta(days=i)) for i in range((END - START).days + 1)]
    growth = np.array([0.55 + 0.9 * i / len(days) for i in range(len(days))])  # platform grows over time
    day_w = growth / growth.sum()
    job_days = sorted(rng.choice(len(days), size=args.jobs, p=day_w))

    jobs, bids, reviews, feedback, convs, msgs, disputes = [], [], [], [], [], [], []
    worker_reviews = defaultdict(list)

    for di in job_days:
        day = days[di]
        created = day + timedelta(hours=float(rng.uniform(7, 23)))
        m = created.month
        cw = np.array([CATEGORY_WEIGHT[c] * SEASON[c][m] for c in cats]); cw /= cw.sum()
        cat = pick(cats, p=cw)
        items = rates_by_cat[cat]
        iw = np.array([(2.5 if (r["service_type"] in WINTER_ITEMS and m in (11, 12, 1, 2)) else
                        2.0 if (r["service_type"] in SUMMER_ITEMS and m in (5, 6, 7, 8)) else 1.0) for r in items])
        item = items[int(rng.choice(len(items), p=iw / iw.sum()))]
        qty = int(rng.integers(int(item["qty_min"]), int(item["qty_max"]) + 1))

        cust = customers[int(rng.choice(len(customers), p=cust_p))]
        if cust["first_job"] is None:
            cust["first_job"] = created
            cust["createdAt"] = created - timedelta(days=float(rng.uniform(0.05, 40)))
            cust["_id"] = ids.new(cust["createdAt"])
        if rng.random() < 0.88:
            loc = (cust["city"], cust["address"], cust["zone"], cust["lat"], cust["lon"])
        else:
            a = AREAS[int(rng.choice(len(AREAS), p=area_w))]
            loc = a[:5]
        urgency = pick(URGENCY, p=URGENCY_P)

        # ---- latent fair market price for this job (never stored; drives bids) ----
        lo, hi = item["min_pkr"], item["max_pkr"]
        unit_price = math.exp(rng.normal(math.log(math.sqrt(lo * hi)), math.log(hi / lo) / 3.3))
        eff_qty = qty ** 0.92 if qty > 1 else 1
        months_in = (created.year - START.year) * 12 + created.month - 1
        market = (unit_price * eff_qty * ZONE_PREMIUM[loc[2]]
                  * URGENCY_PREMIUM[urgency] * math.exp(rng.normal(0, 0.03))
                  * (1 + MONTHLY_INFLATION) ** months_in)
        market = max(market, 500.0)

        svc = item["service_type"].replace(" (labour)", "")   # customer-facing wording
        s = "s" if qty > 1 else ""
        title = pick(TITLE_TPL.get(item["unit"], TITLE_TPL["per job"])).format(svc=svc, q=qty, s=s)[:120]
        if len(title) < 5:
            title = f"Need {svc}"
        detail = " ".join(rng.choice(DESC_DETAIL[cat], size=2, replace=False))
        qty_txt = f" Quantity: {qty}." if qty > 1 else ""
        description = (f"{pick(DESC_OPENERS)}I need {svc.lower()} at my place in {loc[1]}, {loc[0]}.{qty_txt} "
                       f"{detail} {TIMING[urgency]}")
        guess = market * math.exp(rng.normal(0, 0.35))
        budget = next(b[2] for b in BUDGET_RANGES if b[0] <= guess < b[1])

        job_id = ids.new(created)
        job = dict(_id=job_id, title=title, description=description, category=cat, budgetRange=budget,
                   urgency=urgency, city=loc[0], area=loc[1], zone=loc[2], customer=cust["_id"],
                   createdAt=created, updatedAt=created, status="open", assignedWorker=None, acceptedBid=None,
                   totalBids=0, service_type=item["service_type"], quantity=qty, market_price=round(market))
        jobs.append(job)

        # ---- which workers bid ----
        age_days = (NOW - created).total_seconds() / 86400
        cands = []
        for w in workers_by_cat[cat]:
            if not (w["isActive"] and w["isVerified"] and w["cnic_status"] == "verified"):
                continue              # mirrors controllers/bid.js eligibility check
            if w["createdAt"] > created:
                continue
            dist = haversine_km((w["lat"], w["lon"]), (loc[3], loc[4]))
            has_skill = bool(set(w["skills"]) & set(item["related_skills"]))
            p = w["resp"] * (1.0 if has_skill else 0.3) * math.exp(-dist / 14) * 0.55
            if urgency == "emergency":
                p *= 0.7 if w["responseTime"] in ("Same day", "Within 24 hours") else 1.2
            if rng.random() < min(p, 0.95):
                cands.append((w, dist, has_skill))
        rng.shuffle(cands)
        cands = cands[:10]

        job_bids = []
        for w, dist, has_skill in cands:
            amount = round_to(market * w["price_factor"] * (1.0 if has_skill else 1.06)
                              * math.exp(rng.normal(0, 0.11)), 50)
            bcreated = created + timedelta(hours=float(rng.exponential(5 if urgency in ("emergency", "today") else 16)))
            if bcreated > NOW:
                continue
            est_days = 1
            if cat == "Cleaning" and "Deep Cleaning" in svc:
                est_days = int(rng.integers(1, 3))
            if "Renovation" in svc:
                est_days = int(rng.integers(3, 8))
            when = {"emergency": "within 2 hours", "today": "today", "scheduled": "tomorrow morning",
                    "flexible": "in the next 2 days"}[urgency]
            proposal = pick(PROPOSALS).format(exp=max(1, w["experience"]), cat=cat.lower(), svc=svc.lower(),
                                              when=when, area=loc[1])
            b = dict(_id=ids.new(bcreated), job=job_id, worker=w["_id"], amount=amount, proposal=proposal,
                     estimatedDays=est_days, status="pending", createdAt=bcreated, updatedAt=bcreated,
                     dist_km=round(dist, 2), has_skill=has_skill, is_hired=0)
            job_bids.append((b, w))
        job["totalBids"] = len(job_bids)

        # ---- customer decision (ground-truth hire label) ----
        if job_bids and (age_days > 2 or rng.random() < 0.3) and rng.random() < 0.86:
            med = float(np.median([b["amount"] for b, _ in job_bids]))
            util = []
            for b, w in job_bids:
                shown_rating = (np.mean(worker_reviews[w["_id"]]) if worker_reviews[w["_id"]] else 3.0)
                n_rev = len(worker_reviews[w["_id"]])
                u = (-2.2 * math.log(b["amount"] / med)
                     + 0.55 * w["q"]                                   # unobserved competence
                     + 0.35 * (shown_rating - 3.0) * min(n_rev / 5, 1)   # visible rating, trusted after ~5 reviews
                     + 0.45 * b["has_skill"]
                     - 0.04 * b["dist_km"]
                     + 0.08 * w["experience"] / 3
                     + rng.gumbel(0, 0.7))
                util.append(u)
            win = int(np.argmax(util))
            wb, ww = job_bids[win]
            accept_time = max(b["createdAt"] for b, _ in job_bids) + timedelta(hours=float(rng.exponential(6)))
            if accept_time < NOW:
                wb["status"] = "accepted"; wb["is_hired"] = 1; wb["updatedAt"] = accept_time
                for b, _ in job_bids:
                    if b is not wb:
                        b["status"] = "rejected"; b["updatedAt"] = accept_time
                job.update(status="active", assignedWorker=ww["_id"], acceptedBid=wb["_id"], updatedAt=accept_time,
                           accepted_at=accept_time)
                done_time = accept_time + timedelta(hours=float(rng.uniform(2, 30)) + 24 * (wb["estimatedDays"] - 1))
                # conversation between customer and hired worker
                cv_id = ids.new(accept_time)
                when = "today" if urgency in ("emergency", "today") else "tomorrow"
                n_msgs = int(rng.integers(2, len(CHAT) + 1))
                t = accept_time
                for i in range(n_msgs):
                    role, text = CHAT[i]
                    t = t + timedelta(minutes=float(rng.uniform(2, 90)))
                    if t > NOW:
                        break
                    msgs.append(dict(_id=ids.new(t), conversation=cv_id,
                                     sender=cust["_id"] if role == "customer" else ww["_id"],
                                     text=text.format(when=when, area=loc[1]), isRead=True,
                                     deliveryStatus="read", createdAt=t, updatedAt=t))
                convs.append(dict(_id=cv_id, participants=[cust["_id"], ww["_id"]], job=job_id,
                                  lastMessage=msgs[-1]["text"] if msgs and msgs[-1]["conversation"] == cv_id else "",
                                  lastMessageAt=t, createdAt=accept_time, updatedAt=t))
                if done_time < NOW - timedelta(days=1) and rng.random() < 0.95:
                    job.update(status="completed", updatedAt=done_time)
                    # review (quality label). Overcharging vs market lowers satisfaction a bit.
                    if rng.random() < 0.78:
                        over = wb["amount"] / market - 1
                        r = 3.9 + 0.75 * ww["q"] - 1.2 * max(0, over - 0.15) + rng.normal(0, 0.65)
                        rating = int(min(5, max(1, round(r))))
                        rt = done_time + timedelta(hours=float(rng.exponential(20)))
                        if rt < NOW:
                            reviews.append(dict(_id=ids.new(rt), job=job_id, customer=cust["_id"],
                                                worker=ww["_id"], rating=rating, comment=pick(REVIEWS[rating]),
                                                createdAt=rt, updatedAt=rt))
                            worker_reviews[ww["_id"]].append(rating)
                            if rating <= 2 and rng.random() < 0.25:
                                dt_ = rt + timedelta(hours=float(rng.uniform(1, 48)))
                                st = str(rng.choice(["open", "under-review", "resolved", "dismissed"],
                                                    p=[.2, .2, .4, .2])) if dt_ < NOW else "open"
                                disputes.append(dict(_id=ids.new(dt_), job=job_id, raisedBy=cust["_id"],
                                                     against=ww["_id"],
                                                     reason=pick(["Poor quality work", "Work not completed",
                                                                  "Overcharged", "Worker arrived very late"]),
                                                     description="Raised after job completion. " + reviews[-1]["comment"],
                                                     status=st, createdAt=dt_, updatedAt=dt_))
                elif done_time < NOW - timedelta(days=1):
                    job.update(status="cancelled", updatedAt=done_time)   # assigned but called off
                elif rng.random() < 0.04:
                    job.update(status="cancelled")
        elif age_days > 6:
            job["status"] = "cancelled" if (not job_bids or rng.random() < 0.6) else "open"
            if job["status"] == "cancelled":
                job["updatedAt"] = created + timedelta(days=float(rng.uniform(2, 6)))

        for b, _ in job_bids:
            bids.append(b)

        # ---- Recommendation feedback (relevance labels) ----
        # On ~35% of jobs the customer opened "AI recommendations" and rated 1-4 suggested workers.
        if rng.random() < 0.35:
            pool = [w for w in workers_by_cat[cat]
                    if w["isActive"] and w["isVerified"] and w["cnic_status"] == "verified" and w["createdAt"] <= created]
            if pool:
                n = min(len(pool), int(rng.integers(1, 5)))
                shown = list(rng.choice(len(pool), size=n, replace=False))
                for idx in shown:
                    w = pool[int(idx)]
                    has_skill = bool(set(w["skills"]) & set(item["related_skills"]))
                    dist = haversine_km((w["lat"], w["lon"]), (loc[3], loc[4]))
                    z = -0.4 + 1.3 * has_skill + 0.7 * w["q"] - 0.05 * dist + rng.normal(0, 0.6)
                    if job["assignedWorker"] == w["_id"]:
                        z += 2.0
                    ft = created + timedelta(minutes=float(rng.uniform(5, 300)))
                    if ft < NOW:
                        feedback.append(dict(_id=ids.new(ft), job=job_id, customer=cust["_id"], worker=w["_id"],
                                             category=cat, helpful=bool(z > 0), createdAt=ft, updatedAt=ft))

    # ---------------- Worker aggregates exactly as controllers/review.js computes them ----------------
    for w in workers:
        rs = worker_reviews[w["_id"]]
        w["rating"] = round(float(np.mean(rs)) * 10) / 10 if rs else 0
        w["totalReviews"] = len(rs)
        w["completedJobs"] = len(rs)     # review.js increments completedJobs when a review is posted
    for c in customers:
        if c["_id"] is None:             # customers who never posted: signed up, browsed only
            c["createdAt"] = rand_time(START, END)
            c["_id"] = ids.new(c["createdAt"])

    write_outputs(args.out, workers, customers, jobs, bids, reviews, feedback, convs, msgs, disputes, args.seed)


# --------------------------------------------------------------------------
def write_outputs(out, workers, customers, jobs, bids, reviews, feedback, convs, msgs, disputes, seed):
    mongo_dir = os.path.join(out, "mongo"); csv_dir = os.path.join(out, "csv")
    os.makedirs(mongo_dir, exist_ok=True); os.makedirs(csv_dir, exist_ok=True)

    def user_doc(u):
        d = {"_id": oid(u["_id"]), "name": u["name"], "phone": u["phone"], "password": "__SEED_PASSWORD__",
             "role": u["role"], "city": u["city"], "address": u["address"], "isVerified": u["isVerified"],
             "isActive": u["isActive"], "passwordResetOtpAttempts": 0, "experience": 0,
             "skills": [], "portfolio": [], "rating": 0, "totalReviews": 0, "completedJobs": 0,
             "cnicVerified": False, "isSynthetic": True,
             "createdAt": dt(u["createdAt"]), "updatedAt": dt(u["createdAt"])}
        if u.get("email"):
            d["email"] = u["email"]
        if u["role"] == "customer":
            d["availability"] = {day: {"available": False, "from": "09:00", "to": "17:00"} for day in DAYS}
        if u["role"] == "worker":
            st = u["cnic_status"]
            d.update(serviceCategory=u["serviceCategory"], skills=u["skills"], bio=u["bio"],
                     experience=u["experience"], hourlyRate=u["hourlyRate"], availability=u["availability"],
                     responseTime=u["responseTime"], rating=u["rating"], totalReviews=u["totalReviews"],
                     completedJobs=u["completedJobs"], cnicVerified=(st == "verified"),
                     cnicFront="seed/placeholder-cnic-front.png", cnicBack="seed/placeholder-cnic-back.png")
            if st == "rejected":
                d["cnicRejectionReason"] = "Image is blurry, please upload a clearer photo"
        return d

    users = [user_doc(u) for u in workers] + [user_doc(c) for c in customers]
    job_docs = [{"_id": oid(j["_id"]), "title": j["title"], "description": j["description"], "category": j["category"],
                 "budgetRange": j["budgetRange"], "urgency": j["urgency"],
                 "location": {"city": j["city"], "area": j["area"]}, "status": j["status"],
                 "customer": oid(j["customer"]), "images": [], "totalBids": j["totalBids"], "isSynthetic": True,
                 **({"assignedWorker": oid(j["assignedWorker"]), "acceptedBid": oid(j["acceptedBid"])}
                    if j["assignedWorker"] else {}),
                 "createdAt": dt(j["createdAt"]), "updatedAt": dt(j["updatedAt"])} for j in jobs]
    bid_docs = [{"_id": oid(b["_id"]), "job": oid(b["job"]), "worker": oid(b["worker"]), "amount": b["amount"],
                 "proposal": b["proposal"], "estimatedDays": b["estimatedDays"], "status": b["status"],
                 "isSynthetic": True, "createdAt": dt(b["createdAt"]), "updatedAt": dt(b["updatedAt"])} for b in bids]

    def simple(rows, ref_fields, extra=()):
        res = []
        for r in rows:
            d = {"_id": oid(r["_id"])}
            for k, v in r.items():
                if k == "_id":
                    continue
                if k in ref_fields:
                    d[k] = [oid(x) for x in v] if isinstance(v, list) else oid(v)
                elif isinstance(v, datetime):
                    d[k] = dt(v)
                else:
                    d[k] = v
            d["isSynthetic"] = True
            res.append(d)
        return res

    collections = {
        "users": users, "jobs": job_docs, "bids": bid_docs,
        "reviews": simple(reviews, {"job", "customer", "worker"}),
        "recommendationfeedbacks": simple(feedback, {"job", "customer", "worker"}),
        "conversations": simple(convs, {"participants", "job"}),
        "messages": simple(msgs, {"conversation", "sender"}),
        "disputes": simple(disputes, {"job", "raisedBy", "against"}),
    }
    for name, docs in collections.items():
        with open(os.path.join(mongo_dir, f"{name}.json"), "w", encoding="utf-8") as fh:
            json.dump(docs, fh, ensure_ascii=False)

    # ---------------- Flat CSVs for ML / the report ----------------
    def wcsv(name, header, rows):
        with open(os.path.join(csv_dir, name), "w", newline="", encoding="utf-8") as fh:
            wr = csv.writer(fh); wr.writerow(header); wr.writerows(rows)

    wcsv("workers.csv", ["worker_id", "created_at", "city", "area", "zone", "service_category", "skills",
                         "experience", "hourly_rate", "response_time", "working_days", "is_active", "is_verified",
                         "cnic_verified", "rating", "total_reviews", "completed_jobs"],
         [[w["_id"], iso(w["createdAt"]), w["city"], w["address"], w["zone"], w["serviceCategory"],
           "|".join(w["skills"]), w["experience"], w["hourlyRate"], w["responseTime"],
           sum(v["available"] for v in w["availability"].values()), int(w["isActive"]), int(w["isVerified"]),
           int(w["cnic_status"] == "verified"), w["rating"], w["totalReviews"], w["completedJobs"]] for w in workers])
    wcsv("customers.csv", ["customer_id", "created_at", "city", "area", "zone"],
         [[c["_id"], iso(c["createdAt"]), c["city"], c["address"], c["zone"]] for c in customers])
    hired_amount = {b["job"]: b["amount"] for b in bids if b["is_hired"]}
    wcsv("jobs.csv", ["job_id", "created_at", "category", "service_type", "quantity", "title", "description", "city",
                      "area", "zone", "urgency", "budget_range", "status", "total_bids", "customer_id",
                      "assigned_worker_id", "accepted_amount_pkr"],
         [[j["_id"], iso(j["createdAt"]), j["category"], j["service_type"], j["quantity"], j["title"],
           j["description"], j["city"], j["area"], j["zone"], j["urgency"], j["budgetRange"], j["status"],
           j["totalBids"], j["customer"], j["assignedWorker"] or "", hired_amount.get(j["_id"], "")] for j in jobs])
    wcsv("bids.csv", ["bid_id", "job_id", "worker_id", "created_at", "amount_pkr", "estimated_days", "status",
                      "distance_km", "worker_has_matching_skill", "is_hired"],
         [[b["_id"], b["job"], b["worker"], iso(b["createdAt"]), b["amount"], b["estimatedDays"], b["status"],
           b["dist_km"], int(b["has_skill"]), b["is_hired"]] for b in bids])
    wcsv("reviews.csv", ["review_id", "job_id", "customer_id", "worker_id", "created_at", "rating", "comment"],
         [[r["_id"], r["job"], r["customer"], r["worker"], iso(r["createdAt"]), r["rating"], r["comment"]]
          for r in reviews])
    wcsv("recommendation_feedback.csv", ["feedback_id", "job_id", "customer_id", "worker_id", "category",
                                         "created_at", "helpful"],
         [[f["_id"], f["job"], f["customer"], f["worker"], f["category"], iso(f["createdAt"]), int(f["helpful"])]
          for f in feedback])

    summary = {"seed": seed, "generated_for": "Moiz-002/serviqo @ branch Moiz-002",
               **{k: len(v) for k, v in collections.items()},
               "workers": len(workers), "customers": len(customers),
               "jobs_by_status": {s: sum(j["status"] == s for j in jobs) for s in ("open", "active", "completed", "cancelled")},
               "accepted_bids (price labels)": sum(b["is_hired"] for b in bids)}
    with open(os.path.join(out, "summary.json"), "w") as fh:
        json.dump(summary, fh, indent=2)
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
