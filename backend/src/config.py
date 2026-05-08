import os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]

MODELS_DIR = ROOT_DIR / "models"
DATA_DIR = ROOT_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "Raw"
REPORTS_DIR = ROOT_DIR / "reports"

MODEL_PATH = MODELS_DIR / "catboost_satisfaction_model.cbm"
METADATA_PATH = MODELS_DIR / "model_metadata.json"
METRICS_PATH = MODELS_DIR / "model_metrics.json"
FEATURE_IMPORTANCE_PATH = MODELS_DIR / "feature_importance.csv"
SAMPLE_PASSENGERS_PATH = MODELS_DIR / "sample_passengers.csv"

RAW_DATA_PATH = RAW_DATA_DIR / "Airline Quality Ratings.csv"


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