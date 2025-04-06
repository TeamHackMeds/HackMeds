import joblib
import numpy as np

# Load the model, scaler, and encoders
model = joblib.load("final_model.pkl")
scaler = joblib.load("scaler.pkl")
encoders = joblib.load("encoders.pkl")  # This is a dict

# Input symptoms (you can change these)
input_symptoms = ['itching', 'skin_rash', 'nodal_skin_eruptions', 'dischromic _patches', '', '']

# Encode each symptom using the corresponding LabelEncoder
encoded = []
for i, val in enumerate(input_symptoms):
    col_name = f"Symptom_{i+1}"  # Keys like 'Symptom_1', ..., 'Symptom_6'
    le = encoders[col_name]
    try:
        encoded_val = le.transform([val])[0]
    except:
        encoded_val = 0  # fallback for unknown or blank values
    encoded.append(encoded_val)

# Prepare input for prediction
X = np.array(encoded).reshape(1, -1)
X_scaled = scaler.transform(X)
prediction = model.predict(X_scaled)

print("Predicted disease:", prediction[0])
# Decode disease label
disease_label = encoders["Disease"].inverse_transform([prediction[0]])[0]
print("Predicted disease:", disease_label)
