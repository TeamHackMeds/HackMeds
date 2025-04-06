from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

# Load the model and preprocessing objects
model = joblib.load("final_model.pkl")
scaler = joblib.load("scaler.pkl")
encoders = joblib.load("encoders.pkl")
disease_encoder = encoders['Disease']  # Assuming this maps disease index -> label

# FastAPI app
app = FastAPI()

# Input model for the API
class SymptomInput(BaseModel):
    symptoms: list[str]  # Exactly 6 symptoms expected

@app.post("/predict")
def predict_disease(data: SymptomInput):
    symptoms = data.symptoms
    if len(symptoms) != 6:
        return {"error": "Exactly 6 symptoms are required"}

    encoded = []
    for i, val in enumerate(symptoms):
        key = f"Symptom_{i+1}"
        le = encoders[key]
        try:
            encoded_val = le.transform([val])[0]
        except:
            encoded_val = 0  # Fallback for unknown/blank input
        encoded.append(encoded_val)

    # Prepare for model
    X = np.array(encoded).reshape(1, -1)
    X_scaled = scaler.transform(X)
    prediction = model.predict(X_scaled)[0]
    disease_label = disease_encoder.inverse_transform([prediction])[0]

    return {"predicted_disease": disease_label}
