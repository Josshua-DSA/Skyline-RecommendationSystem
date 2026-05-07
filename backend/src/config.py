import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(BASE_DIR, "models", "model_pipeline.pkl")
METRICS_PATH = os.path.join(BASE_DIR, "models", "model_metrics.json")
FEATURE_IMPORTANCE_PATH = os.path.join(BASE_DIR, "models", "feature_importance.json")
LABEL_MAPPING_PATH = os.path.join(BASE_DIR, "models", "label_mapping.json")
DATA_PATH = os.path.join(BASE_DIR, "data", "processed", "airline_cleaned.csv")
RAW_DATA_PATH = os.path.join(BASE_DIR, "data", "raw", "airline_passenger_satisfaction.csv")

SERVICE_FEATURES = [
    "Departure and Arrival Time Convenience",
    "Ease of Online Booking",
    "Check-in Service",
    "Online Boarding",
    "Gate Location",
    "On-board Service",
    "Seat Comfort",
    "Leg Room Service",
    "Cleanliness",
    "Food and Drink",
    "In-flight Service",
    "In-flight Wifi Service",
    "In-flight Entertainment",
    "Baggage Handling",
]

DEMOGRAPHIC_FEATURES = [
    "Gender", "Age", "Customer Type", "Type of Travel",
    "Class", "Flight Distance", "Departure Delay", "Arrival Delay"
]

ALL_FEATURES = DEMOGRAPHIC_FEATURES + SERVICE_FEATURES
TARGET = "Satisfaction"