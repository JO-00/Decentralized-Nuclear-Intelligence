from utils.data_structures import DatasetConfig
from utils.possible_scenarios import *
import random
from DatasetGeneration.generator import generate_functions
import csv
import json
from tqdm import tqdm
from DatasetGeneration.dataset_helpers import *

import config

dataset_config = DatasetConfig(
    n_samples = 20_000,
    distribution={
        "nominal": 0,
        "single_event": 0.2,
        "multi_event_coherent": 0.8,
    }
)



VARIABLES = [
    "power",
    "neutron_flux",
    "rod_insertion",
    "pump",
    "coolant",
    "temperature",
    "pressure",
]






# ============================================================
# DATASET ROW CONSTRUCTION
# ============================================================

def build_csv_rows(
    curves,
    sampling_frequency: float,
    rng: random.Random,
):
    """
    Sample every reactor variable.

    Returns:
        rows
        sampling metadata
    """

    row = []
    sampling_metadata = {}

    for variable in config.STATE:

        result = sample_curve(
            curve=curves[variable],
            sampling_frequency=sampling_frequency,
            rng=rng,
            n_points=10,
        )

        # Add the 10 sampled values to the single row
        row.extend(result["values"])

        sampling_metadata[variable] = {
            "start_index": result["start_index"],
            "timestamp_offsets": result["offsets"],
            "indices": result["indices"],
        }

    return [row], sampling_metadata

import os

def save_csv(
    rows,
    path: str = None,
):
    if path is None:
        path = os.path.join(os.environ.get("DATASET_OUTPUT_DIR", "/tmp"), "dataset.csv")

    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)

    headers = [
        f"{variable}{i}"
        for variable in config.STATE
        for i in range(1, 11)
    ]

    with open(path, "w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(headers)
        writer.writerows(rows)




def save_json(
    seed,
    path: str = None,
):
    """
    Save reproducibility metadata.
    """
    if path is None:
        path = os.path.join(
            os.environ.get("DATASET_OUTPUT_DIR", "/tmp"),
            "dataset.json",
        )

    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)

    with open(path, "w") as file:
        json.dump({"seed": seed}, file)

# ============================================================
# MAIN DATASET GENERATOR
# ============================================================

def generate_dataset(
    dataset_config: DatasetConfig,
    seed: int,
):
    """
    Generate the complete dataset.

    One generated scenario produces one 70-row CSV block.

    Returns:
        csv_path
        json_path
    """

    rng = random.Random(seed)

    sampling_frequency = (
        config.DEFAULT_SAMPLING_FREQUENCY
    )

    simulation_duration = (
        config.DEFAULT_SIMULATION_DURATION
    )

    scenarios = generate_dataset_scenarios(
        dataset_config=dataset_config,
        rng=rng,
    )

    all_rows = []
    scenario_metadata = []


    for scenario, metadata in tqdm(
        scenarios,
        desc="Generating dataset",
    ):

        curves = generate_curves(
            scenario,
            []
        )

        rows, sampling_metadata = build_csv_rows(
            curves=curves,
            sampling_frequency=sampling_frequency,
            rng=rng,
        )

        all_rows.extend(rows)

        metadata["sampling"] = sampling_metadata

        scenario_metadata.append(
            metadata
        )
    # --------------------------------------------------------
    # Save CSV
    # --------------------------------------------------------


    save_csv(
        rows=all_rows
    )

    # --------------------------------------------------------
    # Save JSON
    # --------------------------------------------------------

    json_metadata = {
        "dataset_seed": seed,
        "simulation_duration": simulation_duration,
        "sampling_frequency": sampling_frequency,
        "scenarios": scenario_metadata,
    }


    save_json(
        seed=seed
    )

import hashlib

def hash_test(seed):
    def hash_file(path: str):
        with open(path, "rb") as file:
            return hashlib.sha256(file.read()).hexdigest()


    generate_dataset(dataset_config, seed=seed)

    hash_1 = hash_file("dataset.csv")

    generate_dataset(dataset_config, seed=seed)

    hash_2 = hash_file("dataset.csv")

    assert hash_1 == hash_2

if __name__ == '__main__':
    generate_dataset(dataset_config , 2)