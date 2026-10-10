from DatasetGeneration.generator import generate_functions
from utils.data_structures import Scenario, Breach, Event
import random
from utils.possible_scenarios import generate_multi, SCENARIOS
import json
import os
import numpy as np

random.seed(4)

COHERENT = SCENARIOS["multi_event"]["coherent"]

def random_coherent_scenario(seed: int | None = None) -> Scenario:
    name = random.choice(list(COHERENT.keys()))
    n_events = len(COHERENT[name][0].events)

    severities = tuple(random.uniform(0.2, 1.0) for _ in range(n_events))
    onsets      = tuple(sorted(random.uniform(0.1, 0.6) for _ in range(n_events)))

    return generate_multi(
        scenario_name=name,
        severities=severities,
        onset_time_ratios=onsets,
        seed=seed if seed is not None else random.randint(0, 2**31 - 1),
    )


def to_jsonable(x):
    """Convert numpy arrays / scalars / nested lists to plain JSON-safe Python."""
    if isinstance(x, np.ndarray):
        return x.tolist()
    if isinstance(x, (np.floating, np.integer)):
        return x.item()
    if isinstance(x, (list, tuple)):
        return [to_jsonable(v) for v in x]
    if isinstance(x, dict):
        return {k: to_jsonable(v) for k, v in x.items()}
    return x


# ---------------- generation ----------------

scenario = random_coherent_scenario()

OUT_DIR = "logs/generated"
os.makedirs(OUT_DIR, exist_ok=True)

breaches: list[Breach] = []

variables = generate_functions(scenario, breaches)

payload = {
    "duration": scenario.duration,             # seconds
    "variables": to_jsonable(variables),
}

path = os.path.join(OUT_DIR, f"scenario3.json")
with open(path, "w") as f:
    json.dump(payload, f)
