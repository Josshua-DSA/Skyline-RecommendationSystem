# Skyline-RecommendationSystem : Airline Service Recommendation Dashboard

**B2C Hybrid/Ensemble Recommendation System — Director-Level Reporting Dashboard**

---

## 📌 Overview

A professional, interactive Proof of Concept (PoC) dashboard for airline service recommendations using a **Hybrid Ensemble approach** combining CatBoost ML model + rule-based logic.

Designed for **B2C airline operations** to surface personalized service recommendations that improve passenger satisfaction and revenue.

---

## 🗂️ Dashboard Sections

| Section | Description |
|---|---|
| 📊 Executive Summary | KPIs: total passengers, satisfaction rate, predicted uplift, revenue lift |
| 🎯 Recommendation Confidence | CatBoost model metrics translated into business language |
| 🧩 Personalized Demo | Interactive per-passenger recommendation with before/after analysis |
| 📐 Segment Analysis | Satisfaction & opportunity by travel type, class, age, distance |
| 💡 Satisfaction Impact | Service gap analysis, delay impact, correlation heatmap |
| 💰 Business Impact Simulation | Adjustable ROI simulation (conservative / expected / aggressive) |

---

## 🔀 Hybrid Ensemble Method

```
Final Score = 40% × Rule-Based Score + 60% × CatBoost Feature-Importance Score
```

- **Rule-based**: Triggers on low service ratings (≤3/5) or delays ≥30 min  
- **Model-based**: Uses CatBoost-derived feature importance to rank service gaps  
- **Output**: Top-5 ranked recommendations per passenger with confidence score

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Train the model (optional — mock data included)
```bash
jupyter notebook notebooks/01_train_model_and_export_artifacts.ipynb
```

### 3. Run the backend server
```bash
python -m backend.app
```

### 4. Open the dashboard
```
http://localhost:5000
```

> **Note:** The dashboard runs fully on mock data if no trained model or dataset is present. All sections are functional out of the box.

---

## 📊 Dataset Features

| Feature | Type |
|---|---|
| Gender, Age, Customer Type | Demographic |
| Type of Travel, Class, Flight Distance | Journey |
| Departure/Arrival Delay | Operations |
| Online Boarding, Wifi, Entertainment, Seat Comfort, ... | Service (14 features) |
| **Satisfaction** | **Target** |

**Dataset:** 129,880 passengers · 23 features · Binary classification

---

## 🤖 Model Performance

| Metric | Score |
|---|---|
| Accuracy | **96.12%** |
| Precision | **95.88%** |
| Recall | **96.41%** |
| F1-Score | **96.14%** |
| ROC-AUC | **99.23%** |

---

## ⚠️ Disclaimers

- Revenue and ROI figures in the Business Simulation are **assumption-based** and for planning purposes only
- Actual impact requires booking, fare, conversion, and A/B test data
- Model metrics shown are based on the training/validation dataset

---

## 📁 Project Structure

```
airline_service_recommendation/
├── backend/        # Flask API + ML pipeline
│   ├── api/        # Route handlers
│   ├── src/        # Business logic
│   └── utils/      # Helpers
├── frontend/       # Dashboard UI
│   ├── pages/      # Per-section HTML
│   ├── js/         # Per-section JS
│   └── css/        # Styles
├── data/           # Raw + processed datasets
├── models/         # Trained model artifacts
└── notebooks/      # Training notebook
```