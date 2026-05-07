from flask import Flask, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__, static_folder="../frontend", static_url_path="")
CORS(app)

from backend.api.routes_prediction import bp as pred_bp
from backend.api.routes_recommendation import bp as rec_bp
from backend.api.routes_segmentation import bp as seg_bp
from backend.api.routes_simulation import bp as sim_bp

app.register_blueprint(pred_bp)
app.register_blueprint(rec_bp)
app.register_blueprint(seg_bp)
app.register_blueprint(sim_bp)

@app.route("/")
def index():
    return send_from_directory("../frontend", "index.html")

@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory("../frontend", path)

if __name__ == "__main__":
    app.run(debug=True, port=5000)