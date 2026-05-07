"""Passenger segmentation analysis."""
import numpy as np

MOCK_SEGMENTS = {
    "travel_type": {
        "Business Travel": {
            "count": 73645, "satisfaction_rate": 0.693, "pct": 56.7,
            "avg_ratings": {
                "Online Boarding": 3.6, "In-flight Wifi Service": 3.1,
                "Seat Comfort": 3.8, "In-flight Entertainment": 3.5,
                "On-board Service": 3.7, "Cleanliness": 3.6
            },
            "opportunity_score": 72
        },
        "Personal Travel": {
            "count": 56235, "satisfaction_rate": 0.394, "pct": 43.3,
            "avg_ratings": {
                "Online Boarding": 2.9, "In-flight Wifi Service": 2.6,
                "Seat Comfort": 3.2, "In-flight Entertainment": 3.1,
                "On-board Service": 3.3, "Cleanliness": 3.4
            },
            "opportunity_score": 88
        }
    },
    "class": {
        "Business": {
            "count": 47564, "satisfaction_rate": 0.718, "pct": 36.6,
            "avg_ratings": {
                "Online Boarding": 4.0, "In-flight Wifi Service": 3.4,
                "Seat Comfort": 4.2, "In-flight Entertainment": 3.9,
                "On-board Service": 4.1, "Cleanliness": 4.0
            },
            "opportunity_score": 55
        },
        "Eco Plus": {
            "count": 13542, "satisfaction_rate": 0.487, "pct": 10.4,
            "avg_ratings": {
                "Online Boarding": 3.1, "In-flight Wifi Service": 2.9,
                "Seat Comfort": 3.5, "In-flight Entertainment": 3.2,
                "On-board Service": 3.4, "Cleanliness": 3.5
            },
            "opportunity_score": 78
        },
        "Economy": {
            "count": 68774, "satisfaction_rate": 0.432, "pct": 52.9,
            "avg_ratings": {
                "Online Boarding": 2.8, "In-flight Wifi Service": 2.5,
                "Seat Comfort": 3.0, "In-flight Entertainment": 2.9,
                "On-board Service": 3.2, "Cleanliness": 3.3
            },
            "opportunity_score": 92
        }
    },
    "customer_type": {
        "Returning Customer": {
            "count": 106100, "satisfaction_rate": 0.600, "pct": 81.7,
            "avg_ratings": {
                "Online Boarding": 3.5, "In-flight Wifi Service": 3.0,
                "Seat Comfort": 3.7, "In-flight Entertainment": 3.4,
                "On-board Service": 3.6, "Cleanliness": 3.7
            },
            "opportunity_score": 65
        },
        "First-time Customer": {
            "count": 23780, "satisfaction_rate": 0.241, "pct": 18.3,
            "avg_ratings": {
                "Online Boarding": 2.7, "In-flight Wifi Service": 2.4,
                "Seat Comfort": 2.9, "In-flight Entertainment": 2.8,
                "On-board Service": 3.0, "Cleanliness": 3.1
            },
            "opportunity_score": 96
        }
    },
    "age_group": {
        "18-30": {"count": 27845, "satisfaction_rate": 0.521, "pct": 21.4, "opportunity_score": 79},
        "31-45": {"count": 42340, "satisfaction_rate": 0.587, "pct": 32.6, "opportunity_score": 71},
        "46-60": {"count": 38920, "satisfaction_rate": 0.594, "pct": 30.0, "opportunity_score": 69},
        "60+":   {"count": 20775, "satisfaction_rate": 0.482, "pct": 16.0, "opportunity_score": 83}
    },
    "flight_distance_group": {
        "Short (<500km)":   {"count": 31245, "satisfaction_rate": 0.467, "pct": 24.1, "opportunity_score": 85},
        "Medium (500-2000km)": {"count": 58320, "satisfaction_rate": 0.548, "pct": 44.9, "opportunity_score": 74},
        "Long (>2000km)":   {"count": 40315, "satisfaction_rate": 0.631, "pct": 31.0, "opportunity_score": 62}
    }
}


def get_all_segments():
    return MOCK_SEGMENTS


def get_segment_detail(segment_type: str):
    return MOCK_SEGMENTS.get(segment_type, {})


def get_executive_summary():
    total = 129880
    satisfied = int(total * 0.5656)
    dissatisfied = total - satisfied
    return {
        "total_passengers": total,
        "satisfied_count": satisfied,
        "dissatisfied_count": dissatisfied,
        "satisfaction_rate": 0.5656,
        "predicted_uplift": 0.087,
        "predicted_new_satisfaction_rate": 0.5656 + 0.087,
        "estimated_revenue_lift_monthly": 2_840_000,
        "estimated_revenue_lift_annual": 34_080_000,
        "top_factors": [
            {"feature": "Online Boarding", "importance": 18.42},
            {"feature": "In-flight Wifi Service", "importance": 15.33},
            {"feature": "In-flight Entertainment", "importance": 12.21},
            {"feature": "Seat Comfort", "importance": 9.87},
            {"feature": "On-board Service", "importance": 8.54}
        ],
        "model_accuracy": 0.9612,
        "total_recommendations_possible": 56235,
        "high_risk_passengers": 34120
    }