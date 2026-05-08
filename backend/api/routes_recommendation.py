import pandas as pd
from flask import Blueprint, request

from ..src.config import ALL_FEATURES, SAMPLE_PASSENGERS_PATH
from ..src.recommendation_engine import get_ensemble_recommendations
from ..utils.response_formatter import error, success

bp = Blueprint("recommendation", __name__, url_prefix="/api")

_sample_passengers_cache = None


def _to_json_value(value):
    if pd.isna(value):
        return None

    if hasattr(value, "item"):
        value = value.item()

    if isinstance(value, float) and value.is_integer():
        return int(value)

    return value


def _build_passenger_label(passenger):
    base = (
        f"Passenger {passenger['id']} - "
        f"{passenger.get('Class', 'Unknown')} / "
        f"{passenger.get('Type of Travel', 'Unknown')} / "
        f"{passenger.get('Customer Type', 'Unknown')}"
    )

    prediction = passenger.get("predicted_satisfaction")
    probability = passenger.get("satisfied_probability")
    details = []

    if prediction:
        details.append(f"predicted {prediction}")

    if isinstance(probability, (int, float)):
        details.append(f"P(satisfied) {probability:.1%}")

    return f"{base} ({', '.join(details)})" if details else base


def _load_sample_passengers():
    global _sample_passengers_cache

    if _sample_passengers_cache is not None:
        return _sample_passengers_cache

    if not SAMPLE_PASSENGERS_PATH.exists():
        raise FileNotFoundError(f"Sample passengers file not found: {SAMPLE_PASSENGERS_PATH}")

    df = pd.read_csv(SAMPLE_PASSENGERS_PATH)
    passengers = []
    optional_columns = [
        "actual_satisfaction",
        "predicted_satisfaction",
        "satisfied_probability",
    ]

    for idx, row in df.iterrows():
        passenger = {
            feature: _to_json_value(row[feature])
            for feature in ALL_FEATURES
            if feature in df.columns
        }

        for column in optional_columns:
            if column in df.columns:
                passenger[column] = _to_json_value(row[column])

        passenger["id"] = int(idx) + 1
        passenger["label"] = _build_passenger_label(passenger)
        passengers.append(passenger)

    _sample_passengers_cache = passengers
    return passengers


@bp.route("/sample-passengers", methods=["GET"])
def sample_passengers():
    try:
        passengers = _load_sample_passengers()
    except Exception as exc:
        return error(f"Failed to load sample passengers: {exc}", 500)

    limit = request.args.get("limit", default=20, type=int)
    limit = max(1, min(limit, len(passengers)))

    return success([
        {
            "id": passenger["id"],
            "label": passenger["label"],
            "actual_satisfaction": passenger.get("actual_satisfaction"),
            "predicted_satisfaction": passenger.get("predicted_satisfaction"),
            "satisfied_probability": passenger.get("satisfied_probability"),
        }
        for passenger in passengers[:limit]
    ])


@bp.route("/recommend/<int:passenger_id>", methods=["GET"])
def recommend(passenger_id):
    try:
        passengers = _load_sample_passengers()
    except Exception as exc:
        return error(f"Failed to load sample passengers: {exc}", 500)

    passenger = next((p for p in passengers if p["id"] == passenger_id), None)
    if not passenger:
        return error("Passenger not found", 404)

    result = get_ensemble_recommendations(passenger)
    return success(result)


@bp.route("/recommend/custom", methods=["POST"])
def recommend_custom():
    data = request.get_json()
    if not data:
        return error("No data provided")

    result = get_ensemble_recommendations(data)
    return success(result)
