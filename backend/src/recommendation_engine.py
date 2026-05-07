"""Hybrid/Ensemble Recommendation Engine combining model-based + rule-based approaches."""
import numpy as np
from .prediction import predict_single, get_feature_importance
from .recommendation_rules import get_rule_based_recommendations, RECOMMENDATIONS_CATALOG
from .config import SERVICE_FEATURES


def _get_model_based_recommendations(passenger_data: dict) -> list:
    """Use feature importance + passenger ratings to rank recommendations."""
    fi = get_feature_importance()
    fi_dict = dict(zip(fi["features"], fi["importance"]))
    
    recommendations = []
    for rec_name, rec_config in RECOMMENDATIONS_CATALOG.items():
        feat = rec_config.get("trigger_feature")
        if feat and feat in fi_dict:
            rating = passenger_data.get(feat, 3)
            if rating <= 3:
                gap = (5 - rating) / 5
                fi_score = fi_dict.get(feat, 0) / 100
                confidence = round(gap * fi_score * 10 + 0.5, 3)
                recommendations.append({
                    "name": rec_name,
                    "description": rec_config["description"],
                    "satisfaction_uplift": rec_config["satisfaction_uplift"],
                    "model_confidence": min(0.99, confidence),
                    "icon": rec_config["icon"],
                    "category": rec_config["category"],
                    "source": "model_based",
                    "feature_gap": round(gap, 3),
                    "feature_importance": round(fi_score * 100, 2)
                })
    return sorted(recommendations, key=lambda x: x["model_confidence"], reverse=True)


def get_ensemble_recommendations(passenger_data: dict) -> dict:
    """Hybrid ensemble: combines rule-based + model-based with weighted scoring."""
    rule_recs = get_rule_based_recommendations(passenger_data)
    model_recs = _get_model_based_recommendations(passenger_data)
    
    rule_dict = {r["name"]: r for r in rule_recs}
    model_dict = {r["name"]: r for r in model_recs}
    all_names = set(list(rule_dict.keys()) + list(model_dict.keys()))
    
    combined = []
    for name in all_names:
        rule_r = rule_dict.get(name, {})
        model_r = model_dict.get(name, {})
        
        rule_score = 1.0 if rule_r else 0.0
        model_score = model_r.get("model_confidence", 0.0)
        
        # Ensemble weight: 40% rule-based + 60% model-based
        ensemble_score = (0.40 * rule_score + 0.60 * model_score)
        
        base = rule_r if rule_r else model_r
        combined.append({
            "name": name,
            "description": base.get("description", ""),
            "satisfaction_uplift": base.get("satisfaction_uplift", 0.05),
            "icon": base.get("icon", "⚡"),
            "category": base.get("category", "general"),
            "ensemble_score": round(ensemble_score, 3),
            "rule_triggered": bool(rule_r),
            "model_triggered": bool(model_r),
            "model_confidence": model_r.get("model_confidence", 0.0),
            "feature_importance": model_r.get("feature_importance", 0.0),
            "feature_gap": model_r.get("feature_gap", 0.0),
            "source": "hybrid_ensemble"
        })
    
    combined_sorted = sorted(combined, key=lambda x: x["ensemble_score"], reverse=True)
    top_recs = combined_sorted[:5]
    
    # Predict before & after
    pred_before = predict_single(passenger_data)
    
    total_uplift = sum(r["satisfaction_uplift"] for r in top_recs)
    prob_after = min(0.98, pred_before["probability_satisfied"] + total_uplift * 0.6)
    
    return {
        "passenger_profile": _summarize_profile(passenger_data),
        "prediction_before": pred_before,
        "prediction_after": {
            "probability_satisfied": round(prob_after, 4),
            "probability_dissatisfied": round(1 - prob_after, 4),
            "prediction": 1 if prob_after >= 0.5 else 0
        },
        "satisfaction_uplift": round(prob_after - pred_before["probability_satisfied"], 4),
        "recommendations": top_recs,
        "all_recommendations": combined_sorted,
        "problematic_services": _get_problematic_services(passenger_data),
        "ensemble_method": "Hybrid: 40% Rule-Based + 60% CatBoost Feature-Importance"
    }


def _get_problematic_services(passenger_data: dict) -> list:
    problems = []
    for feat in SERVICE_FEATURES:
        rating = passenger_data.get(feat, 3)
        if rating <= 2:
            problems.append({"feature": feat, "rating": rating, "severity": "critical"})
        elif rating == 3:
            problems.append({"feature": feat, "rating": rating, "severity": "moderate"})
    return sorted(problems, key=lambda x: x["rating"])


def _summarize_profile(pd: dict) -> dict:
    return {
        "customer_type": pd.get("Customer Type", "N/A"),
        "travel_type": pd.get("Type of Travel", "N/A"),
        "class": pd.get("Class", "N/A"),
        "age": pd.get("Age", "N/A"),
        "gender": pd.get("Gender", "N/A"),
        "flight_distance": pd.get("Flight Distance", 0),
        "departure_delay": pd.get("Departure Delay", 0),
        "arrival_delay": pd.get("Arrival Delay", 0)
    }