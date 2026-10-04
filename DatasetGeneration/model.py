import random
import numpy as np
import pandas as pd
from sklearn.metrics import confusion_matrix, precision_score, recall_score
from sklearn.ensemble import IsolationForest
import joblib
from utils.possible_scenarios import *
import config
from DatasetGeneration.dataset_helpers import generate_dataset_scenarios
from DatasetGeneration.dataset_helpers import generate_curves
from main_generator import build_csv_rows
from utils.possible_scenarios import SCENARIOS

DATASET_PATH = "dataset.csv"
MODEL_PATH = "isolation_forest.joblib"

SEED = 123456789


def load_training_data(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)

    # All columns are features for the first MVP.
    # The CSV contains exactly 70 feature columns:
    # 7 variables × 10 measurements.
    return df


def train_model(df: pd.DataFrame) -> IsolationForest:
    model = IsolationForest(
        n_estimators=300,
        max_samples="auto",
        max_features=1.0,
        contamination="auto",
        random_state=SEED,
    )

    model.fit(df)

    return model


def save_model(model: IsolationForest, path: str = MODEL_PATH) -> None:
    joblib.dump(model, path)
    print(f"[✓] Model saved -> {path}")


def generate_contradictory_dataset():
    """
    Generate scenarios with physical relationship breaches.

    These samples are NOT used for training.
    They are only used to evaluate whether the trained
    Isolation Forest considers breached relationships suspicious.
    """

    rng = random.Random(SEED)

    contradictory_scenarios = []

    breaches = SCENARIOS["multi_event"]["contradictory"]

    for _ in range(100):

        breach = rng.choice(breaches)

        scenario_name = rng.choice(
            list(SCENARIOS["multi_event"]["coherent"].keys())
        )

        template = SCENARIOS[
            "multi_event"
        ]["coherent"][scenario_name][0]

        n_events = len(template.events)

        severities = tuple(
            rng.uniform(0.0, 1.0)
            for _ in range(n_events)
        )

        onset_time_ratios = tuple(
            rng.uniform(0.0, 0.2)
            for _ in range(n_events)
        )

        scenario = generate_multi(
            scenario_name=scenario_name,
            severities=severities,
            onset_time_ratios=onset_time_ratios,
            seed=rng.randint(0, 10000),
        )

        contradictory_scenarios.append(
            (scenario, [breach])
        )

    return contradictory_scenarios


def scenarios_to_dataframe(
    scenarios,
    rng: random.Random,
) -> pd.DataFrame:

    rows = []

    for scenario, breaches in scenarios:

        curves = generate_curves(
            scenario=scenario,
            breaches=breaches,
        )

        scenario_rows, _ = build_csv_rows(
            curves=curves,
            sampling_frequency=config.DEFAULT_SAMPLING_FREQUENCY,
            rng=rng,
        )

        rows.extend(scenario_rows)

    headers = [
        f"{variable}{i}"
        for variable in config.STATE
        for i in range(1, 11)
    ]

    return pd.DataFrame(rows, columns=headers)


def main():

    print("Loading training dataset...")
    train_df = load_training_data(DATASET_PATH)
    print(f"Training samples: {len(train_df)}")
    print(f"Features: {train_df.shape[1]}")

    print("\nTraining Isolation Forest...")
    model = train_model(train_df)
    print("Training complete.")

    # ---------------------------------------------------------
    # Persist the model
    # ---------------------------------------------------------

    save_model(model, MODEL_PATH)

    # ---------------------------------------------------------
    # Generate contradictory evaluation samples
    # ---------------------------------------------------------

    print("\nGenerating contradictory samples...")
    contradictory_scenarios = generate_contradictory_dataset()

    contradictory_rng = random.Random(SEED)

    contradictory_df = scenarios_to_dataframe(
        contradictory_scenarios,
        contradictory_rng,
    )

    print(f"Contradictory samples: {len(contradictory_df)}")

    # ---------------------------------------------------------
    # Build evaluation dataset
    #
    # 0 = normal
    # 1 = contradictory
    #
    # Training data is used as the normal class.
    # Contradictory samples are the positive class.
    # ---------------------------------------------------------

    X_eval = pd.concat(
        [
            train_df,
            contradictory_df,
        ],
        ignore_index=True,
    )

    y_true = np.concatenate(
        [
            np.zeros(len(train_df), dtype=int),
            np.ones(len(contradictory_df), dtype=int),
        ]
    )

    # ---------------------------------------------------------
    # Get Isolation Forest scores
    # ---------------------------------------------------------

    scores = model.decision_function(X_eval)

    # Scores corresponding only to contradictory samples
    contradictory_scores = scores[len(train_df):]

    print("\n==============================")
    print("Confusion matrix evaluation")
    print("==============================")

    # ---------------------------------------------------------
    # Test several thresholds
    # ---------------------------------------------------------

    thresholds = [0.00, 0.02, 0.05]

    for threshold in thresholds:

        # Lower score = more suspicious
        y_pred = (scores < threshold).astype(int)

        tn, fp, fn, tp = confusion_matrix(
            y_true,
            y_pred,
            labels=[0, 1],
        ).ravel()

        precision = precision_score(
            y_true,
            y_pred,
            zero_division=0,
        )

        recall = recall_score(
            y_true,
            y_pred,
            zero_division=0,
        )

        false_positive_rate = fp / (fp + tn)

        print("\n------------------------------")
        print(f"Threshold: {threshold:.2f}")
        print("------------------------------")

        print("                 Predicted")
        print("                 Normal  Suspicious")
        print(f"Actual Normal    {tn:6d}  {fp:9d}")
        print(f"Actual Contrad.  {fn:6d}  {tp:9d}")

        print()
        print(f"TP : {tp}")
        print(f"FP : {fp}")
        print(f"TN : {tn}")
        print(f"FN : {fn}")

        print()
        print(f"Precision          : {precision * 100:.2f}%")
        print(f"Recall             : {recall * 100:.2f}%")
        print(f"False positive rate: {false_positive_rate * 100:.2f}%")

        # -----------------------------------------------------
        # Inspect false negatives
        #
        # A false negative is a contradictory sample that
        # Isolation Forest classified as normal.
        # -----------------------------------------------------

        false_negative_indices = np.where(
            contradictory_scores >= threshold
        )[0]


if __name__ == "__main__":
    main()