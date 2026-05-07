"""Satisfaction impact analysis."""

MOCK_SERVICE_RATINGS = {
    "satisfied": {
        "Online Boarding": 4.25, "In-flight Wifi Service": 3.65,
        "In-flight Entertainment": 4.10, "Seat Comfort": 4.18,
        "On-board Service": 4.22, "Leg Room Service": 3.98,
        "Cleanliness": 4.15, "Food and Drink": 3.87,
        "Baggage Handling": 3.95, "Check-in Service": 3.92,
        "Ease of Online Booking": 3.78, "In-flight Service": 4.08,
        "Gate Location": 3.65, "Departure and Arrival Time Convenience": 3.72
    },
    "dissatisfied": {
        "Online Boarding": 2.55, "In-flight Wifi Service": 2.08,
        "In-flight Entertainment": 2.71, "Seat Comfort": 2.98,
        "On-board Service": 3.10, "Leg Room Service": 2.88,
        "Cleanliness": 3.21, "Food and Drink": 2.73,
        "Baggage Handling": 2.99, "Check-in Service": 3.02,
        "Ease of Online Booking": 2.61, "In-flight Service": 3.08,
        "Gate Location": 3.02, "Departure and Arrival Time Convenience": 2.95
    }
}

DELAY_IMPACT = {
    "No Delay (0 min)":        {"satisfaction_rate": 0.621, "count": 62450},
    "Minor (1-15 min)":        {"satisfaction_rate": 0.598, "count": 28340},
    "Moderate (16-45 min)":    {"satisfaction_rate": 0.501, "count": 24150},
    "Significant (46-120 min)":{"satisfaction_rate": 0.387, "count": 12380},
    "Severe (>120 min)":       {"satisfaction_rate": 0.218, "count": 2560}
}

CORRELATION_MATRIX = {
    "features": ["Online Boarding", "Wifi", "Entertainment", "Seat Comfort",
                 "On-board Service", "Leg Room", "Cleanliness", "Food", "Baggage"],
    "matrix": [
        [1.00, 0.42, 0.51, 0.38, 0.45, 0.34, 0.40, 0.35, 0.38],
        [0.42, 1.00, 0.39, 0.31, 0.36, 0.28, 0.33, 0.29, 0.31],
        [0.51, 0.39, 1.00, 0.47, 0.52, 0.41, 0.48, 0.44, 0.42],
        [0.38, 0.31, 0.47, 1.00, 0.58, 0.61, 0.54, 0.48, 0.45],
        [0.45, 0.36, 0.52, 0.58, 1.00, 0.55, 0.62, 0.57, 0.53],
        [0.34, 0.28, 0.41, 0.61, 0.55, 1.00, 0.49, 0.44, 0.41],
        [0.40, 0.33, 0.48, 0.54, 0.62, 0.49, 1.00, 0.59, 0.55],
        [0.35, 0.29, 0.44, 0.48, 0.57, 0.44, 0.59, 1.00, 0.51],
        [0.38, 0.31, 0.42, 0.45, 0.53, 0.41, 0.55, 0.51, 1.00],
    ]
}


def get_service_gap_analysis():
    gaps = {}
    for feat in MOCK_SERVICE_RATINGS["satisfied"]:
        sat = MOCK_SERVICE_RATINGS["satisfied"][feat]
        dis = MOCK_SERVICE_RATINGS["dissatisfied"][feat]
        gaps[feat] = {
            "satisfied_avg": sat,
            "dissatisfied_avg": dis,
            "gap": round(sat - dis, 2)
        }
    return dict(sorted(gaps.items(), key=lambda x: x[1]["gap"], reverse=True))


def get_delay_impact():
    return DELAY_IMPACT


def get_correlation_matrix():
    return CORRELATION_MATRIX


def get_class_travel_impact():
    return {
        "by_class": {
            "Business":  {"satisfaction_rate": 0.718, "avg_rating": 3.98},
            "Eco Plus":  {"satisfaction_rate": 0.487, "avg_rating": 3.35},
            "Economy":   {"satisfaction_rate": 0.432, "avg_rating": 2.97}
        },
        "by_travel_type": {
            "Business Travel": {"satisfaction_rate": 0.693, "avg_rating": 3.62},
            "Personal Travel": {"satisfaction_rate": 0.394, "avg_rating": 3.01}
        }
    }