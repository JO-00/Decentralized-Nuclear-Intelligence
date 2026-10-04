import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd


_HERE = Path(__file__).resolve().parent
MODEL_PATH = _HERE / "isolation_forest.joblib"
PREDICTIONS_PATH = _HERE.parent / "predictions.json"

# Load — the file contains a bare IsolationForest, nothing else.
_model = joblib.load(MODEL_PATH)

# These are NOT in the file; they must be set here.
_threshold = 0.05
_seed = 123456789
VARIABLES  = [
    "power",
    "neutron_flux" ,
    "control_rod_position" ,
    "coolant_flow",
    "temperature",
    "pressure",
    "pump_state"
]
_features = [f"{v}{i}" for v in VARIABLES for i in range(1, 11)]


N_MEASUREMENTS = 10


def predict(curves: dict) -> dict:
    assert isinstance(curves, dict), \
        f"curves must be a dict, got {type(curves).__name__}"

    assert set(curves.keys()) == set(VARIABLES), (
        f"invalid keys: expected {set(VARIABLES)}, "
        f"got {set(curves.keys())}"
    )

    for var in VARIABLES:
        values = curves[var]
        assert isinstance(values, (list, tuple, np.ndarray)), \
            f"{var} must be a sequence, got {type(values).__name__}"
        assert len(values) == N_MEASUREMENTS, \
            f"{var} must have {N_MEASUREMENTS} elements, got {len(values)}"

    row = []
    for var in VARIABLES:
        row.extend(curves[var])

    X = pd.DataFrame([row], columns=_features)

    score = float(_model.decision_function(X)[0])
    is_anomaly = score < _threshold

    return {
        "is_anomaly": is_anomaly,
        "score": score,
        "threshold": _threshold,
    }


def save_predictions(predictions: list[dict], path: str | Path = PREDICTIONS_PATH):
    path = Path(path)

    existing = []
    if path.exists() and path.stat().st_size > 0:
        try:
            with open(path, "r", encoding="utf-8") as f:
                existing = json.load(f)
            if not isinstance(existing, list):
                existing = [existing]
        except json.JSONDecodeError:
            existing = []

    existing.extend(predictions)

    with open(path, "w", encoding="utf-8") as f:
        json.dump(existing, f, indent=2)