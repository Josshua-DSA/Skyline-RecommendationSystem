from flask import jsonify

def success(data, message="OK", status=200):
    return jsonify({"status": "success", "message": message, "data": data}), status

def error(message, status=400):
    return jsonify({"status": "error", "message": message, "data": None}), status