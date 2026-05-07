"""Rule-based recommendation engine component."""

RECOMMENDATIONS_CATALOG = {
    "Priority Online Boarding": {
        "trigger_feature": "Online Boarding",
        "threshold": 3,
        "description": "Upgrade to priority boarding with dedicated lane & early access",
        "satisfaction_uplift": 0.08,
        "icon": "✈️",
        "category": "boarding"
    },
    "Wifi Upgrade Package": {
        "trigger_feature": "In-flight Wifi Service",
        "threshold": 3,
        "description": "High-speed in-flight wifi with streaming capabilities",
        "satisfaction_uplift": 0.07,
        "icon": "📶",
        "category": "connectivity"
    },
    "Seat Comfort Upgrade": {
        "trigger_feature": "Seat Comfort",
        "threshold": 3,
        "description": "Upgrade to extra legroom or premium seat selection",
        "satisfaction_uplift": 0.09,
        "icon": "💺",
        "category": "comfort"
    },
    "Fast Check-in Support": {
        "trigger_feature": "Check-in Service",
        "threshold": 3,
        "description": "Dedicated check-in counter with personal service assistant",
        "satisfaction_uplift": 0.06,
        "icon": "🎫",
        "category": "checkin"
    },
    "Delay Recovery Voucher": {
        "trigger_feature": None,
        "threshold": None,
        "description": "Compensation voucher for flight disruptions and delays",
        "satisfaction_uplift": 0.10,
        "icon": "🎁",
        "category": "compensation",
        "delay_threshold": 30
    },
    "Baggage Priority Handling": {
        "trigger_feature": "Baggage Handling",
        "threshold": 3,
        "description": "First-off-carousel baggage with real-time tracking",
        "satisfaction_uplift": 0.05,
        "icon": "🧳",
        "category": "baggage"
    },
    "Premium In-flight Entertainment": {
        "trigger_feature": "In-flight Entertainment",
        "threshold": 3,
        "description": "Access to premium content library and noise-cancelling headphones",
        "satisfaction_uplift": 0.06,
        "icon": "🎬",
        "category": "entertainment"
    },
    "Enhanced Meal Package": {
        "trigger_feature": "Food and Drink",
        "threshold": 3,
        "description": "Premium meal selection with dietary preference customization",
        "satisfaction_uplift": 0.05,
        "icon": "🍽️",
        "category": "food"
    },
    "Lounge Access Pass": {
        "trigger_feature": None,
        "threshold": None,
        "description": "Access to airport lounge with complimentary refreshments",
        "satisfaction_uplift": 0.07,
        "icon": "🏢",
        "category": "lounge",
        "class_trigger": ["Economy", "Eco Plus"]
    },
    "Loyalty Points Booster": {
        "trigger_feature": None,
        "threshold": None,
        "description": "3x loyalty points on this flight for returning customers",
        "satisfaction_uplift": 0.04,
        "icon": "⭐",
        "category": "loyalty",
        "customer_type": "Returning Customer"
    }
}


def get_rule_based_recommendations(passenger_data: dict) -> list:
    """Generate rule-based recommendations for a passenger."""
    recommendations = []
    delay_total = passenger_data.get("Departure Delay", 0) + passenger_data.get("Arrival Delay", 0)

    for rec_name, rec_config in RECOMMENDATIONS_CATALOG.items():
        triggered = False

        if rec_config.get("trigger_feature"):
            rating = passenger_data.get(rec_config["trigger_feature"], 3)
            if rating <= rec_config["threshold"]:
                triggered = True

        if rec_config.get("delay_threshold") and delay_total >= rec_config["delay_threshold"]:
            triggered = True

        if rec_config.get("class_trigger"):
            if passenger_data.get("Class") in rec_config["class_trigger"]:
                triggered = True

        if rec_config.get("customer_type"):
            if passenger_data.get("Customer Type") == rec_config["customer_type"]:
                triggered = True

        if triggered:
            recommendations.append({
                "name": rec_name,
                "description": rec_config["description"],
                "satisfaction_uplift": rec_config["satisfaction_uplift"],
                "icon": rec_config["icon"],
                "category": rec_config["category"],
                "source": "rule_based"
            })

    return sorted(recommendations, key=lambda x: x["satisfaction_uplift"], reverse=True)