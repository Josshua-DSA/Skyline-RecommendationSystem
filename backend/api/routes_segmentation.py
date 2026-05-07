from flask import Blueprint
from ..src.segmentation import get_all_segments, get_segment_detail, get_executive_summary
from ..src.satisfaction_impact import get_service_gap_analysis, get_delay_impact, get_correlation_matrix, get_class_travel_impact
from ..utils.response_formatter import success

bp = Blueprint("segmentation", __name__, url_prefix="/api")

@bp.route("/executive-summary", methods=["GET"])
def executive_summary():
    return success(get_executive_summary())

@bp.route("/segments", methods=["GET"])
def segments():
    return success(get_all_segments())

@bp.route("/segments/<segment_type>", methods=["GET"])
def segment_detail(segment_type):
    return success(get_segment_detail(segment_type))

@bp.route("/satisfaction-impact", methods=["GET"])
def satisfaction_impact():
    return success({
        "service_gap": get_service_gap_analysis(),
        "delay_impact": get_delay_impact(),
        "correlation_matrix": get_correlation_matrix(),
        "class_travel_impact": get_class_travel_impact()
    })