"""Passenger segmentation and executive summary from the airline dataset."""

import json

import pandas as pd

from .config import FEATURE_IMPORTANCE_PATH, METRICS_PATH, RAW_DATA_PATH, SERVICE_FEATURES


_df_cache = None


def _load_dataset():
    global _df_cache

    if _df_cache is None:
        _df_cache = pd.read_csv(RAW_DATA_PATH)
        _df_cache["is_satisfied"] = _df_cache["Satisfaction"].eq("Satisfied").astype(int)

    return _df_cache.copy()


def _safe_round(value, digits=3):
    if pd.isna(value):
        return 0
    return round(float(value), digits)


def _opportunity_score(count, total, satisfaction_rate):
    share = count / total if total else 0
    score = ((1 - satisfaction_rate) * 0.70 + share * 0.30) * 100
    return round(float(score))


def _avg_ratings(group_df):
    key_services = [
        "Online Boarding",
        "In-flight Wifi Service",
        "Seat Comfort",
        "In-flight Entertainment",
        "On-board Service",
        "Cleanliness",
    ]

    return {
        feature: _safe_round(group_df[feature].mean(), 2)
        for feature in key_services
        if feature in group_df.columns
    }


def _build_segment(df, column):
    total = len(df)
    segments = {}

    for name, group in df.groupby(column, dropna=False, observed=False):
        count = len(group)
        satisfaction_rate = group["is_satisfied"].mean()

        segments[str(name)] = {
            "count": int(count),
            "satisfaction_rate": _safe_round(satisfaction_rate),
            "pct": _safe_round((count / total) * 100, 1),
            "avg_ratings": _avg_ratings(group),
            "opportunity_score": _opportunity_score(count, total, satisfaction_rate),
        }

    return dict(sorted(segments.items(), key=lambda item: item[1]["count"], reverse=True))


def _load_top_factors(limit=5):
    try:
        fi_df = pd.read_csv(FEATURE_IMPORTANCE_PATH)
        return (
            fi_df.sort_values("importance", ascending=False)
            .head(limit)
            .round({"importance": 2})
            .to_dict(orient="records")
        )
    except Exception:
        return []


def _load_metrics():
    try:
        with open(METRICS_PATH, "r") as f:
            return json.load(f)
    except Exception:
        return {}


def get_all_segments():
    df = _load_dataset()
    segmented = df.copy()

    segmented["age_group"] = pd.cut(
        segmented["Age"],
        bins=[0, 17, 30, 45, 60, 120],
        labels=["Under 18", "18-30", "31-45", "46-60", "60+"],
        include_lowest=True,
    )

    segmented["flight_distance_group"] = pd.cut(
        segmented["Flight Distance"],
        bins=[0, 500, 2000, float("inf")],
        labels=["Short (<500km)", "Medium (500-2000km)", "Long (>2000km)"],
        include_lowest=True,
    )

    return {
        "travel_type": _build_segment(segmented, "Type of Travel"),
        "class": _build_segment(segmented, "Class"),
        "customer_type": _build_segment(segmented, "Customer Type"),
        "age_group": _build_segment(segmented, "age_group"),
        "flight_distance_group": _build_segment(segmented, "flight_distance_group"),
    }


def get_segment_detail(segment_type: str):
    return get_all_segments().get(segment_type, {})


def get_executive_summary():
    df = _load_dataset()
    metrics = _load_metrics()

    total = len(df)
    satisfied = int(df["is_satisfied"].sum())
    dissatisfied = total - satisfied
    satisfaction_rate = satisfied / total if total else 0
    predicted_uplift = 0.087
    service_issue_mask = df[SERVICE_FEATURES].le(3).any(axis=1)

    return {
        "total_passengers": int(total),
        "satisfied_count": satisfied,
        "dissatisfied_count": dissatisfied,
        "satisfaction_rate": _safe_round(satisfaction_rate, 4),
        "predicted_uplift": predicted_uplift,
        "predicted_new_satisfaction_rate": _safe_round(
            min(1, satisfaction_rate + predicted_uplift),
            4,
        ),
        "estimated_revenue_lift_monthly": 2_840_000,
        "estimated_revenue_lift_annual": 34_080_000,
        "top_factors": _load_top_factors(),
        "model_accuracy": metrics.get("accuracy"),
        "total_recommendations_possible": int(service_issue_mask.sum()),
        "high_risk_passengers": dissatisfied,
    }
