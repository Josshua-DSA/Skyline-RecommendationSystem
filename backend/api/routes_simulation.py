from flask import Blueprint, request
from ..src.business_simulation import run_simulation
from ..utils.response_formatter import success, error

bp = Blueprint("simulation", __name__, url_prefix="/api")

@bp.route("/simulate", methods=["POST"])
def simulate():
    params = request.get_json() or {}
    result = run_simulation(params)
    return success(result)