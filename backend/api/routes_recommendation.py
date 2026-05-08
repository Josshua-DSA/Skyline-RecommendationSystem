from flask import Blueprint, request
from ..src.recommendation_engine import get_ensemble_recommendations
from ..utils.response_formatter import success, error

bp = Blueprint("recommendation", __name__, url_prefix="/api")

SAMPLE_PASSENGERS = [
    {
        "id": 1, "label": "Business Traveler – Frequent Flyer",
        "Gender": "Male", "Age": 42, "Customer Type": "Returning",
        "Type of Travel": "Business", "Class": "Business",
        "Flight Distance": 1850, "Departure Delay": 0, "Arrival Delay": 0,
        "Departure and Arrival Time Convenience": 4, "Ease of Online Booking": 3,
        "Check-in Service": 4, "Online Boarding": 2, "Gate Location": 3,
        "On-board Service": 4, "Seat Comfort": 4, "Leg Room Service": 4,
        "Cleanliness": 4, "Food and Drink": 3, "In-flight Service": 4,
        "In-flight Wifi Service": 2, "In-flight Entertainment": 3, "Baggage Handling": 4
    },
    {
        "id": 2, "label": "Economy Passenger – First-time Customer",
        "Gender": "Female", "Age": 27, "Customer Type": "First-time",
        "Type of Travel": "Personal", "Class": "Economy",
        "Flight Distance": 420, "Departure Delay": 45, "Arrival Delay": 52,
        "Departure and Arrival Time Convenience": 2, "Ease of Online Booking": 2,
        "Check-in Service": 2, "Online Boarding": 2, "Gate Location": 3,
        "On-board Service": 3, "Seat Comfort": 2, "Leg Room Service": 2,
        "Cleanliness": 3, "Food and Drink": 2, "In-flight Service": 3,
        "In-flight Wifi Service": 1, "In-flight Entertainment": 2, "Baggage Handling": 2
    },
    {
        "id": 3, "label": "Economy Plus – Returning Leisure Traveler",
        "Gender": "Male", "Age": 55, "Customer Type": "Returning",
        "Type of Travel": "Personal", "Class": "Economy Plus",
        "Flight Distance": 980, "Departure Delay": 15, "Arrival Delay": 12,
        "Departure and Arrival Time Convenience": 3, "Ease of Online Booking": 3,
        "Check-in Service": 3, "Online Boarding": 3, "Gate Location": 4,
        "On-board Service": 3, "Seat Comfort": 3, "Leg Room Service": 3,
        "Cleanliness": 4, "Food and Drink": 3, "In-flight Service": 3,
        "In-flight Wifi Service": 3, "In-flight Entertainment": 3, "Baggage Handling": 3
    },
    {
        "id": 4, "label": "High Satisfaction Business Class",
        "Gender": "Female", "Age": 38, "Customer Type": "Returning",
        "Type of Travel": "Business", "Class": "Business",
        "Flight Distance": 3200, "Departure Delay": 0, "Arrival Delay": 0,
        "Departure and Arrival Time Convenience": 5, "Ease of Online Booking": 4,
        "Check-in Service": 5, "Online Boarding": 4, "Gate Location": 4,
        "On-board Service": 5, "Seat Comfort": 5, "Leg Room Service": 5,
        "Cleanliness": 5, "Food and Drink": 4, "In-flight Service": 5,
        "In-flight Wifi Service": 3, "In-flight Entertainment": 4, "Baggage Handling": 5
    },
    {
        "id": 5, "label": "Senior Economy – Delayed Flight",
        "Gender": "Male", "Age": 67, "Customer Type": "Returning",
        "Type of Travel": "Personal", "Class": "Economy",
        "Flight Distance": 750, "Departure Delay": 90, "Arrival Delay": 95,
        "Departure and Arrival Time Convenience": 1, "Ease of Online Booking": 2,
        "Check-in Service": 2, "Online Boarding": 2, "Gate Location": 2,
        "On-board Service": 3, "Seat Comfort": 2, "Leg Room Service": 1,
        "Cleanliness": 3, "Food and Drink": 2, "In-flight Service": 3,
        "In-flight Wifi Service": 1, "In-flight Entertainment": 1, "Baggage Handling": 2
    }
]

@bp.route("/sample-passengers", methods=["GET"])
def sample_passengers():
    return success([{"id": p["id"], "label": p["label"]} for p in SAMPLE_PASSENGERS])

@bp.route("/recommend/<int:passenger_id>", methods=["GET"])
def recommend(passenger_id):
    passenger = next((p for p in SAMPLE_PASSENGERS if p["id"] == passenger_id), None)
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
