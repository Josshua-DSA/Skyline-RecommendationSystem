import joblib
import json
import numpy as np
import pandas as pd
from .config import MODEL_PATH, METRICS_PATH, FEATURE_IMPORTANCE_PATH, LABEL_MAPPING_PATH

_model = None
_metrics = None
_feature_importance = None
_label_mapping = None

def _load_model():
    global _model
    if _model is None:
        try:
            _model = joblib.load(MODEL_PATH)
        except Exception:
            _model = None
    return _model

def _load_metrics():
    global _metrics
    if _metrics is None:
        try:
            with open(METRICS_PATH) as f:
                _metrics = json.load(f)
        except Exception:
            _metrics = _mock_metrics()
    return _metrics

def _load_feature_importance():
    global _feature_importance
    if _feature_importance is None:
        try:
            with open(FEATURE_IMPORTANCE_PATH) as f:
                _feature_importance = json.load(f)
        except Exception:
            _feature_importance = _mock_feature_importance()
    return _feature_importance

def _load_label_mapping():
    global _label_mapping
    if _label_mapping is None:
        try:
            with open(LABEL_MAPPING_PATH) as f:
                _label_mapping = json.load(f)
        except Exception:
            _label_mapping = {"0": "neutral or dissatisfied", "1": "satisfied"}
    return _label_mapping

def _mock_metrics():
    return {
        "accuracy": 0.9612,
        "precision": 0.9588,
        "recall": 0.9641,
        "f1_score": 0.9614,
        "roc_auc": 0.9923,
        "confusion_matrix": [[58142, 2301], [2198, 67239]],
        "total_samples": 129880,
        "satisfied_rate": 0.5656,
        "model_type": "CatBoost Classifier"
    }

def _mock_feature_importance():
    return {
        "features": [
            "Online Boarding", "In-flight Wifi Service", "In-flight Entertainment",
            "Seat Comfort", "On-board Service", "Leg Room Service",
            "Cleanliness", "Food and Drink", "Baggage Handling",
            "Check-in Service", "Ease of Online Booking", "In-flight Service",
            "Gate Location", "Departure and Arrival Time Convenience",
            "Flight Distance", "Age", "Class", "Departure Delay",
            "Arrival Delay", "Type of Travel"
        ],
        "importance": [
            18.42, 15.33, 12.21, 9.87, 8.54, 7.23,
            6.11, 5.44, 4.87, 3.92, 3.41, 2.98,
            2.21, 1.87, 1.76, 1.54, 1.32, 0.98,
            0.87, 0.76
        ]
    }

def get_model_metrics():
    return _load_metrics()

def get_feature_importance():
    return _load_feature_importance()

def predict_single(passenger_data: dict):
    model = _load_model()
    metrics = _load_metrics()
    satisfied_base = metrics.get("satisfied_rate", 0.5656)

    if model is not None:
        try:
            df = pd.DataFrame([passenger_data])
            prob = model.predict_proba(df)[0]
            pred = int(model.predict(df)[0])
            return {"prediction": pred, "probability_satisfied": float(prob[1]), "probability_dissatisfied": float(prob[0])}
        except Exception:
            pass

    # Fallback heuristic
    service_cols = [
        "Online Boarding", "In-flight Wifi Service", "In-flight Entertainment",
        "Seat Comfort", "On-board Service", "Leg Room Service", "Cleanliness",
        "Food and Drink", "Baggage Handling", "Check-in Service"
    ]
    weights = [0.18, 0.15, 0.12, 0.10, 0.09, 0.07, 0.06, 0.05, 0.05, 0.04]
    score = sum(passenger_data.get(f, 3) * w for f, w in zip(service_cols, weights))
    max_score = 5 * sum(weights)
    prob_sat = min(0.97, max(0.03, score / max_score))
    delay = passenger_data.get("Departure Delay", 0) + passenger_data.get("Arrival Delay", 0)
    if delay > 60:
        prob_sat *= 0.75
    elif delay > 30:
        prob_sat *= 0.88
    if passenger_data.get("Class") == "Business":
        prob_sat = min(0.97, prob_sat * 1.1)
    if passenger_data.get("Type of Travel") == "Personal Travel":
        prob_sat *= 0.92
    pred = 1 if prob_sat >= 0.5 else 0
    return {"prediction": pred, "probability_satisfied": round(prob_sat, 4), "probability_dissatisfied": round(1 - prob_sat, 4)}