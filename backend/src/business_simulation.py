"""Business impact simulation with scenario analysis."""


def run_simulation(params: dict) -> dict:
    avg_ticket = params.get("avg_ticket_value", 850)
    monthly_passengers = params.get("monthly_passengers", 10000)
    adoption_rate = params.get("adoption_rate", 0.30)
    conversion_lift = params.get("conversion_lift", 0.05)
    retention_lift = params.get("retention_lift", 0.03)
    ancillary_revenue = params.get("ancillary_revenue_per_passenger", 120)
    implementation_cost = params.get("implementation_cost", 500_000)
    monthly_op_cost = params.get("monthly_operating_cost", 80_000)

    def calc_scenario(conv_mult, ret_mult, adopt_mult):
        targeted = monthly_passengers * adopt_mult
        converted = targeted * (conversion_lift * conv_mult)
        retained = targeted * (retention_lift * ret_mult)
        
        rev_conversion = converted * avg_ticket
        rev_retention = retained * avg_ticket * 0.15
        rev_ancillary = targeted * (ancillary_revenue * 0.3)
        
        monthly_lift = rev_conversion + rev_retention + rev_ancillary
        annual_lift = monthly_lift * 12
        
        total_annual_cost = implementation_cost + (monthly_op_cost * 12)
        roi = ((annual_lift - total_annual_cost) / total_annual_cost) * 100
        payback_months = implementation_cost / max(1, monthly_lift - monthly_op_cost)
        
        return {
            "monthly_revenue_lift": round(monthly_lift),
            "annual_revenue_lift": round(annual_lift),
            "roi_percent": round(roi, 1),
            "payback_months": round(payback_months, 1),
            "passengers_targeted": int(targeted),
            "new_conversions": int(converted),
            "retained_passengers": int(retained)
        }

    scenarios = {
        "conservative": calc_scenario(0.6, 0.6, adoption_rate * 0.6),
        "expected":     calc_scenario(1.0, 1.0, adoption_rate),
        "aggressive":   calc_scenario(1.5, 1.4, min(0.8, adoption_rate * 1.5))
    }

    return {
        "scenarios": scenarios,
        "assumptions": {
            "avg_ticket_value": avg_ticket,
            "monthly_passengers": monthly_passengers,
            "adoption_rate": adoption_rate,
            "conversion_lift": conversion_lift,
            "retention_lift": retention_lift,
            "ancillary_revenue_per_passenger": ancillary_revenue,
            "implementation_cost": implementation_cost,
            "monthly_operating_cost": monthly_op_cost
        },
        "disclaimer": (
            "This is an assumption-based simulation for strategic planning purposes only. "
            "Actual impact requires booking, fare, conversion, and A/B test data. "
            "Revenue figures are estimates and should not be used for financial reporting."
        )
    }