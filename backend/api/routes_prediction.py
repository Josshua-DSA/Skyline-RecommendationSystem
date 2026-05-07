from flask import Blueprint, request
from ..src.prediction import get_model_metrics, get_feature_importance, predict_single
from ..utils.response_formatter import success, error

bp = Blueprint("prediction", __name__, url_prefix="/api")

@bp.route("/metrics", methods=["GET"])
def metrics():
    return success(get_model_metrics())

@bp.route("/feature-importance", methods=["GET"])
def feature_importance():
    return success(get_feature_importance())

@bp.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    if not data:
        return error("No data provided")
    result = predict_single(data)
    return success(result)