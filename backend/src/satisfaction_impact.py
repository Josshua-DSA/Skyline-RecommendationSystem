"""Satisfaction impact analysis from the airline dataset."""

import pandas as pd

from .config import RAW_DATA_PATH, SERVICE_FEATURES


_df_cache = None


def _load_dataset():
    global _df_cache

    if _df_cache is None:
        _df_cache = pd.read_csv(RAW_DATA_PATH)
        _df_cache["is_satisfied"] = _df_cache["Satisfaction"].eq("Satisfied").astype(int)
        _df_cache["total_delay"] = (
            pd.to_numeric(_df_cache["Departure Delay"], errors="coerce").fillna(0)
            + pd.to_numeric(_df_cache["Arrival Delay"], errors="coerce").fillna(0)
        )

    return _df_cache.copy()


def _safe_round(value, digits=3):
    if pd.isna(value):
        return 0
    return round(float(value), digits)


def _avg_service_rating(group_df):
    return _safe_round(group_df[SERVICE_FEATURES].mean(axis=1).mean(), 2)


def get_service_gap_analysis():
    df = _load_dataset()
    satisfied_df = df[df["Satisfaction"].eq("Satisfied")]
    dissatisfied_df = df[df["Satisfaction"].eq("Neutral or Dissatisfied")]

    gaps = {}
    for feature in SERVICE_FEATURES:
        sat_avg = satisfied_df[feature].mean()
        dis_avg = dissatisfied_df[feature].mean()
        gaps[feature] = {
            "satisfied_avg": _safe_round(sat_avg, 2),
            "dissatisfied_avg": _safe_round(dis_avg, 2),
            "gap": _safe_round(sat_avg - dis_avg, 2),
        }

    return dict(sorted(gaps.items(), key=lambda item: item[1]["gap"], reverse=True))


def get_delay_impact():
    df = _load_dataset()
    bins = [-1, 0, 15, 45, 120, float("inf")]
    labels = [
        "No Delay (0 min)",
        "Minor (1-15 min)",
        "Moderate (16-45 min)",
        "Significant (46-120 min)",
        "Severe (>120 min)",
    ]

    df["delay_group"] = pd.cut(df["total_delay"], bins=bins, labels=labels)
    delay_impact = {}

    for label in labels:
        group = df[df["delay_group"].eq(label)]
        delay_impact[label] = {
            "satisfaction_rate": _safe_round(group["is_satisfied"].mean(), 3),
            "count": int(len(group)),
        }

    return delay_impact


def get_correlation_matrix():
    df = _load_dataset()
    features = [
        "Online Boarding",
        "In-flight Wifi Service",
        "In-flight Entertainment",
        "Seat Comfort",
        "On-board Service",
        "Leg Room Service",
        "Cleanliness",
        "Food and Drink",
        "Baggage Handling",
    ]
    labels = [
        "Online Boarding",
        "Wifi",
        "Entertainment",
        "Seat Comfort",
        "On-board Service",
        "Leg Room",
        "Cleanliness",
        "Food",
        "Baggage",
    ]

    corr = df[features].corr().fillna(0).round(3)

    return {
        "features": labels,
        "matrix": corr.values.tolist(),
    }


def _group_impact(df, column):
    impact = {}

    for name, group in df.groupby(column, dropna=False):
        impact[str(name)] = {
            "satisfaction_rate": _safe_round(group["is_satisfied"].mean(), 3),
            "avg_rating": _avg_service_rating(group),
        }

    return dict(sorted(impact.items(), key=lambda item: item[1]["satisfaction_rate"], reverse=True))


def get_class_travel_impact():
    df = _load_dataset()

    return {
        "by_class": _group_impact(df, "Class"),
        "by_travel_type": _group_impact(df, "Type of Travel"),
    }
