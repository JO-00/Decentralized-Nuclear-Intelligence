import joblib
import numpy as np
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

# 1. Load the model from the .joblib file
model = joblib.load("isolation_forest.joblib")

# 2. Define the input shape and data type
# Replace 'num_features' with the actual number of input features your model expects
num_features = 70
initial_type = [("float_input", FloatTensorType([None, num_features]))]

# 3. Convert the Scikit-Learn model to ONNX format
onnx_model = convert_sklearn(model, initial_types=initial_type, target_opset={
    "": 12,
    "ai.onnx.ml": 3
})

# 4. Save the converted model to disk
with open("model.onnx", "wb") as f:
    f.write(onnx_model.SerializeToString())