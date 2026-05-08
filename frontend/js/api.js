const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : '/api';

async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    const json = await res.json();
    if (json.status === 'success') return json.data;
    throw new Error(json.message || 'API error');
  } catch (err) {
    console.warn(`API call failed for ${endpoint}:`, err.message);
    return null;
  }
}

const API = {
  getExecutiveSummary: () => apiFetch('/executive-summary'),
  getMetrics: () => apiFetch('/metrics'),
  getFeatureImportance: () => apiFetch('/feature-importance'),
  getSamplePassengers: () => apiFetch('/sample-passengers'),
  getRecommendation: (id) => apiFetch(`/recommend/${id}`),
  getCustomRecommendation: (data) => apiFetch('/recommend/custom', { method: 'POST', body: JSON.stringify(data) }),
  getSegments: () => apiFetch('/segments'),
  getSatisfactionImpact: () => apiFetch('/satisfaction-impact'),
  runSimulation: (params) => apiFetch('/simulate', { method: 'POST', body: JSON.stringify(params) }),
  predict: (data) => apiFetch('/predict', { method: 'POST', body: JSON.stringify(data) })
};

// ── MOCK DATA FALLBACKS ──
const MOCK = {
  executiveSummary: {
    total_passengers: 129880,
    satisfied_count: 56428,
    dissatisfied_count: 73452,
    satisfaction_rate: 0.4345,
    predicted_uplift: 0.087,
    predicted_new_satisfaction_rate: 0.5215,
    estimated_revenue_lift_monthly: 2840000,
    estimated_revenue_lift_annual: 34080000,
    top_factors: [
      { feature: "In-flight Wifi Service", importance: 22.07 },
      { feature: "Type of Travel", importance: 20.88 },
      { feature: "Customer Type", importance: 7.65 },
      { feature: "Online Boarding", importance: 6.72 },
      { feature: "Class", importance: 5.37 }
    ],
    model_accuracy: 0.9654,
    total_recommendations_possible: 129820,
    high_risk_passengers: 73452
  },
  metrics: {
    accuracy: 0.9654,
    precision: 0.9739,
    precision_satisfied: 0.9739,
    recall: 0.9805,
    recall_satisfied: 0.9456,
    f1_score: 0.9595,
    f1_satisfied: 0.9595,
    roc_auc: 0.9955,
    at_risk_detection_rate: 0.9805,
    confusion_matrix: null,
    confusion_matrix_available: false,
    total_samples: 129880,
    satisfied_rate: 0.4345,
    model_type: "CatBoost Classifier"
  },
  featureImportance: {
    features: ["In-flight Wifi Service","Type of Travel","Customer Type","Online Boarding","Class","Baggage Handling","Check-in Service","Age","Seat Comfort","In-flight Entertainment","Gate Location","In-flight Service","Flight Distance","On-board Service","Cleanliness","Leg Room Service","Departure and Arrival Time Convenience","Ease of Online Booking","Arrival Delay","Food and Drink","Departure Delay","Gender"],
    importance: [22.07,20.88,7.65,6.72,5.37,4.63,3.92,3.54,3.52,3.31,3.17,3.06,1.92,1.84,1.72,1.62,1.43,1.40,1.07,0.50,0.45,0.21]
  },
  samplePassengers: [
    { id: 1, label: "Business Traveler – Frequent Flyer" },
    { id: 2, label: "Economy Passenger – First-time Customer" },
    { id: 3, label: "Economy Plus – Returning Leisure Traveler" },
    { id: 4, label: "High Satisfaction Business Class" },
    { id: 5, label: "Senior Economy – Delayed Flight" }
  ],
  recommendations: {
    1: {
      passenger_profile: { customer_type: "Returning", travel_type: "Business", class: "Business", age: 42, gender: "Male", flight_distance: 1850, departure_delay: 0, arrival_delay: 0 },
      prediction_before: { probability_satisfied: 0.62, probability_dissatisfied: 0.38, prediction: 1 },
      prediction_after: { probability_satisfied: 0.89, probability_dissatisfied: 0.11, prediction: 1 },
      satisfaction_uplift: 0.27,
      problematic_services: [
        { feature: "Online Boarding", rating: 2, severity: "critical" },
        { feature: "In-flight Wifi Service", rating: 2, severity: "critical" },
        { feature: "Ease of Online Booking", rating: 3, severity: "moderate" }
      ],
      recommendations: [
        { name: "Priority Online Boarding", description: "Upgrade to priority boarding with dedicated lane & early access", satisfaction_uplift: 0.08, icon: "✈️", ensemble_score: 0.82, rule_triggered: true, model_triggered: true },
        { name: "Wifi Upgrade Package", description: "High-speed in-flight wifi with streaming capabilities", satisfaction_uplift: 0.07, icon: "📶", ensemble_score: 0.75, rule_triggered: true, model_triggered: true },
        { name: "Loyalty Points Booster", description: "3x loyalty points on this flight for returning customers", satisfaction_uplift: 0.04, icon: "⭐", ensemble_score: 0.55, rule_triggered: true, model_triggered: false },
        { name: "Premium In-flight Entertainment", description: "Access to premium content library", satisfaction_uplift: 0.06, icon: "🎬", ensemble_score: 0.58, rule_triggered: false, model_triggered: true },
        { name: "Enhanced Meal Package", description: "Premium meal with dietary customization", satisfaction_uplift: 0.05, icon: "🍽️", ensemble_score: 0.48, rule_triggered: false, model_triggered: true }
      ],
      ensemble_method: "Hybrid: 40% Rule-Based + 60% CatBoost Feature-Importance"
    },
    2: {
      passenger_profile: { customer_type: "First-time", travel_type: "Personal", class: "Economy", age: 27, gender: "Female", flight_distance: 420, departure_delay: 45, arrival_delay: 52 },
      prediction_before: { probability_satisfied: 0.18, probability_dissatisfied: 0.82, prediction: 0 },
      prediction_after: { probability_satisfied: 0.54, probability_dissatisfied: 0.46, prediction: 1 },
      satisfaction_uplift: 0.36,
      problematic_services: [
        { feature: "In-flight Wifi Service", rating: 1, severity: "critical" },
        { feature: "Seat Comfort", rating: 2, severity: "critical" },
        { feature: "Online Boarding", rating: 2, severity: "critical" },
        { feature: "Ease of Online Booking", rating: 2, severity: "critical" },
        { feature: "In-flight Entertainment", rating: 2, severity: "critical" }
      ],
      recommendations: [
        { name: "Delay Recovery Voucher", description: "Compensation voucher for flight disruptions", satisfaction_uplift: 0.10, icon: "🎁", ensemble_score: 0.90, rule_triggered: true, model_triggered: true },
        { name: "Wifi Upgrade Package", description: "High-speed in-flight wifi with streaming", satisfaction_uplift: 0.07, icon: "📶", ensemble_score: 0.85, rule_triggered: true, model_triggered: true },
        { name: "Seat Comfort Upgrade", description: "Upgrade to extra legroom or premium seat", satisfaction_uplift: 0.09, icon: "💺", ensemble_score: 0.80, rule_triggered: true, model_triggered: true },
        { name: "Priority Online Boarding", description: "Priority boarding with dedicated lane", satisfaction_uplift: 0.08, icon: "✈️", ensemble_score: 0.75, rule_triggered: true, model_triggered: true },
        { name: "Lounge Access Pass", description: "Airport lounge with complimentary refreshments", satisfaction_uplift: 0.07, icon: "🏢", ensemble_score: 0.62, rule_triggered: true, model_triggered: false }
      ],
      ensemble_method: "Hybrid: 40% Rule-Based + 60% CatBoost Feature-Importance"
    },
    3: {
      passenger_profile: { customer_type: "Returning", travel_type: "Personal", class: "Economy Plus", age: 55, gender: "Male", flight_distance: 980, departure_delay: 15, arrival_delay: 12 },
      prediction_before: { probability_satisfied: 0.48, probability_dissatisfied: 0.52, prediction: 0 },
      prediction_after: { probability_satisfied: 0.71, probability_dissatisfied: 0.29, prediction: 1 },
      satisfaction_uplift: 0.23,
      problematic_services: [
        { feature: "Online Boarding", rating: 3, severity: "moderate" },
        { feature: "In-flight Wifi Service", rating: 3, severity: "moderate" },
        { feature: "Seat Comfort", rating: 3, severity: "moderate" }
      ],
      recommendations: [
        { name: "Seat Comfort Upgrade", description: "Upgrade to extra legroom", satisfaction_uplift: 0.09, icon: "💺", ensemble_score: 0.70, rule_triggered: true, model_triggered: true },
        { name: "Wifi Upgrade Package", description: "High-speed in-flight wifi", satisfaction_uplift: 0.07, icon: "📶", ensemble_score: 0.65, rule_triggered: true, model_triggered: true },
        { name: "Priority Online Boarding", description: "Priority boarding experience", satisfaction_uplift: 0.08, icon: "✈️", ensemble_score: 0.62, rule_triggered: true, model_triggered: true },
        { name: "Loyalty Points Booster", description: "3x loyalty points", satisfaction_uplift: 0.04, icon: "⭐", ensemble_score: 0.52, rule_triggered: true, model_triggered: false },
        { name: "Lounge Access Pass", description: "Airport lounge access", satisfaction_uplift: 0.07, icon: "🏢", ensemble_score: 0.60, rule_triggered: true, model_triggered: false }
      ],
      ensemble_method: "Hybrid: 40% Rule-Based + 60% CatBoost Feature-Importance"
    },
    4: {
      passenger_profile: { customer_type: "Returning", travel_type: "Business", class: "Business", age: 38, gender: "Female", flight_distance: 3200, departure_delay: 0, arrival_delay: 0 },
      prediction_before: { probability_satisfied: 0.91, probability_dissatisfied: 0.09, prediction: 1 },
      prediction_after: { probability_satisfied: 0.96, probability_dissatisfied: 0.04, prediction: 1 },
      satisfaction_uplift: 0.05,
      problematic_services: [
        { feature: "In-flight Wifi Service", rating: 3, severity: "moderate" }
      ],
      recommendations: [
        { name: "Wifi Upgrade Package", description: "High-speed wifi for the long-haul flight", satisfaction_uplift: 0.07, icon: "📶", ensemble_score: 0.65, rule_triggered: true, model_triggered: true },
        { name: "Loyalty Points Booster", description: "3x loyalty points on this flight", satisfaction_uplift: 0.04, icon: "⭐", ensemble_score: 0.55, rule_triggered: true, model_triggered: false }
      ],
      ensemble_method: "Hybrid: 40% Rule-Based + 60% CatBoost Feature-Importance"
    },
    5: {
      passenger_profile: { customer_type: "Returning", travel_type: "Personal", class: "Economy", age: 67, gender: "Male", flight_distance: 750, departure_delay: 90, arrival_delay: 95 },
      prediction_before: { probability_satisfied: 0.09, probability_dissatisfied: 0.91, prediction: 0 },
      prediction_after: { probability_satisfied: 0.45, probability_dissatisfied: 0.55, prediction: 0 },
      satisfaction_uplift: 0.36,
      problematic_services: [
        { feature: "In-flight Wifi Service", rating: 1, severity: "critical" },
        { feature: "In-flight Entertainment", rating: 1, severity: "critical" },
        { feature: "Leg Room Service", rating: 1, severity: "critical" },
        { feature: "Seat Comfort", rating: 2, severity: "critical" },
        { feature: "Check-in Service", rating: 2, severity: "critical" }
      ],
      recommendations: [
        { name: "Delay Recovery Voucher", description: "Compensation for severe delay (90+ min)", satisfaction_uplift: 0.10, icon: "🎁", ensemble_score: 0.95, rule_triggered: true, model_triggered: true },
        { name: "Seat Comfort Upgrade", description: "Extra legroom critical for senior passengers", satisfaction_uplift: 0.09, icon: "💺", ensemble_score: 0.88, rule_triggered: true, model_triggered: true },
        { name: "Fast Check-in Support", description: "Personal service for assisted boarding", satisfaction_uplift: 0.06, icon: "🎫", ensemble_score: 0.80, rule_triggered: true, model_triggered: true },
        { name: "Wifi Upgrade Package", description: "High-speed wifi with easy interface", satisfaction_uplift: 0.07, icon: "📶", ensemble_score: 0.78, rule_triggered: true, model_triggered: true },
        { name: "Baggage Priority Handling", description: "First-off-carousel for ease of travel", satisfaction_uplift: 0.05, icon: "🧳", ensemble_score: 0.68, rule_triggered: true, model_triggered: true }
      ],
      ensemble_method: "Hybrid: 40% Rule-Based + 60% CatBoost Feature-Importance"
    }
  },
  segments: {
    travel_type: {
      "Business": { count: 73645, satisfaction_rate: 0.693, pct: 56.7, opportunity_score: 72, avg_ratings: { "Online Boarding": 3.6, "In-flight Wifi Service": 3.1, "Seat Comfort": 3.8, "In-flight Entertainment": 3.5, "On-board Service": 3.7, "Cleanliness": 3.6 } },
      "Personal": { count: 56235, satisfaction_rate: 0.394, pct: 43.3, opportunity_score: 88, avg_ratings: { "Online Boarding": 2.9, "In-flight Wifi Service": 2.6, "Seat Comfort": 3.2, "In-flight Entertainment": 3.1, "On-board Service": 3.3, "Cleanliness": 3.4 } }
    },
    class: {
      "Business": { count: 47564, satisfaction_rate: 0.718, pct: 36.6, opportunity_score: 55, avg_ratings: { "Online Boarding": 4.0, "In-flight Wifi Service": 3.4, "Seat Comfort": 4.2, "In-flight Entertainment": 3.9, "On-board Service": 4.1, "Cleanliness": 4.0 } },
      "Economy Plus": { count: 13542, satisfaction_rate: 0.487, pct: 10.4, opportunity_score: 78, avg_ratings: { "Online Boarding": 3.1, "In-flight Wifi Service": 2.9, "Seat Comfort": 3.5, "In-flight Entertainment": 3.2, "On-board Service": 3.4, "Cleanliness": 3.5 } },
      "Economy": { count: 68774, satisfaction_rate: 0.432, pct: 52.9, opportunity_score: 92, avg_ratings: { "Online Boarding": 2.8, "In-flight Wifi Service": 2.5, "Seat Comfort": 3.0, "In-flight Entertainment": 2.9, "On-board Service": 3.2, "Cleanliness": 3.3 } }
    },
    customer_type: {
      "Returning": { count: 106100, satisfaction_rate: 0.600, pct: 81.7, opportunity_score: 65 },
      "First-time": { count: 23780, satisfaction_rate: 0.241, pct: 18.3, opportunity_score: 96 }
    },
    age_group: {
      "18-30": { count: 27845, satisfaction_rate: 0.521, pct: 21.4, opportunity_score: 79 },
      "31-45": { count: 42340, satisfaction_rate: 0.587, pct: 32.6, opportunity_score: 71 },
      "46-60": { count: 38920, satisfaction_rate: 0.594, pct: 30.0, opportunity_score: 69 },
      "60+":   { count: 20775, satisfaction_rate: 0.482, pct: 16.0, opportunity_score: 83 }
    },
    flight_distance_group: {
      "Short (<500km)":       { count: 31245, satisfaction_rate: 0.467, pct: 24.1, opportunity_score: 85 },
      "Medium (500-2000km)":  { count: 58320, satisfaction_rate: 0.548, pct: 44.9, opportunity_score: 74 },
      "Long (>2000km)":       { count: 40315, satisfaction_rate: 0.631, pct: 31.0, opportunity_score: 62 }
    }
  },
  satisfactionImpact: {
    service_gap: {
      "Online Boarding":    { satisfied_avg: 4.25, dissatisfied_avg: 2.55, gap: 1.70 },
      "In-flight Wifi Service": { satisfied_avg: 3.65, dissatisfied_avg: 2.08, gap: 1.57 },
      "In-flight Entertainment": { satisfied_avg: 4.10, dissatisfied_avg: 2.71, gap: 1.39 },
      "Seat Comfort":       { satisfied_avg: 4.18, dissatisfied_avg: 2.98, gap: 1.20 },
      "On-board Service":   { satisfied_avg: 4.22, dissatisfied_avg: 3.10, gap: 1.12 },
      "Leg Room Service":   { satisfied_avg: 3.98, dissatisfied_avg: 2.88, gap: 1.10 },
      "Ease of Online Booking": { satisfied_avg: 3.78, dissatisfied_avg: 2.61, gap: 1.17 },
      "Food and Drink":     { satisfied_avg: 3.87, dissatisfied_avg: 2.73, gap: 1.14 },
      "Cleanliness":        { satisfied_avg: 4.15, dissatisfied_avg: 3.21, gap: 0.94 },
      "Baggage Handling":   { satisfied_avg: 3.95, dissatisfied_avg: 2.99, gap: 0.96 },
      "Check-in Service":   { satisfied_avg: 3.92, dissatisfied_avg: 3.02, gap: 0.90 },
      "In-flight Service":  { satisfied_avg: 4.08, dissatisfied_avg: 3.08, gap: 1.00 },
      "Gate Location":      { satisfied_avg: 3.65, dissatisfied_avg: 3.02, gap: 0.63 },
      "Departure and Arrival Time Convenience": { satisfied_avg: 3.72, dissatisfied_avg: 2.95, gap: 0.77 }
    },
    delay_impact: {
      "No Delay (0 min)":         { satisfaction_rate: 0.621, count: 62450 },
      "Minor (1-15 min)":         { satisfaction_rate: 0.598, count: 28340 },
      "Moderate (16-45 min)":     { satisfaction_rate: 0.501, count: 24150 },
      "Significant (46-120 min)": { satisfaction_rate: 0.387, count: 12380 },
      "Severe (>120 min)":        { satisfaction_rate: 0.218, count: 2560 }
    },
    correlation_matrix: {
      features: ["Online Boarding","Wifi","Entertainment","Seat Comfort","On-board Svc","Leg Room","Cleanliness","Food","Baggage"],
      matrix: [[1.00,0.42,0.51,0.38,0.45,0.34,0.40,0.35,0.38],[0.42,1.00,0.39,0.31,0.36,0.28,0.33,0.29,0.31],[0.51,0.39,1.00,0.47,0.52,0.41,0.48,0.44,0.42],[0.38,0.31,0.47,1.00,0.58,0.61,0.54,0.48,0.45],[0.45,0.36,0.52,0.58,1.00,0.55,0.62,0.57,0.53],[0.34,0.28,0.41,0.61,0.55,1.00,0.49,0.44,0.41],[0.40,0.33,0.48,0.54,0.62,0.49,1.00,0.59,0.55],[0.35,0.29,0.44,0.48,0.57,0.44,0.59,1.00,0.51],[0.38,0.31,0.42,0.45,0.53,0.41,0.55,0.51,1.00]]
    },
    class_travel_impact: {
      by_class: { "Business": { satisfaction_rate: 0.718, avg_rating: 3.98 }, "Economy Plus": { satisfaction_rate: 0.487, avg_rating: 3.35 }, "Economy": { satisfaction_rate: 0.432, avg_rating: 2.97 } },
      by_travel_type: { "Business": { satisfaction_rate: 0.693, avg_rating: 3.62 }, "Personal": { satisfaction_rate: 0.394, avg_rating: 3.01 } }
    }
  }
};

async function getData(apiCall, fallback) {
  const result = await apiCall();
  return result || fallback;
}
