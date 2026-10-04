from utils.data_structures import DatasetConfig
import random
from utils.possible_scenarios import *
from DatasetGeneration.generator import generate_functions

def generate_dataset_scenarios(
    dataset_config: DatasetConfig,
    rng: random.Random,
):
    """
    Generate all scenarios according to the requested distribution.

    Returns:
        list[tuple[Scenario, dict]]
    
    The dict contains the random choices used to create
    the corresponding scenario.
    """

    scenarios = []

    n_samples = dataset_config.n_samples
    distribution = dataset_config.distribution

    # --------------------------------------------------------
    # Nominal
    # --------------------------------------------------------

    n_nominal = round(
        n_samples * distribution["nominal"]
    )

    for _ in range(n_nominal):

        seed = rng.randint(1, 1_000_000)

        scenario = generate_nominal(
            seed=seed
        )

        scenarios.append(
            (
                scenario,
                {
                    "seed": seed,
                    "events": [],
                    "severities": [],
                    "onset_time_ratios": [],
                },
            )
        )

    # --------------------------------------------------------
    # Single events
    # --------------------------------------------------------

    n_single = round(
        n_samples * distribution["single_event"]
    )

    single_event_names = list(
        SCENARIOS["single_event"].keys()
    )

    for _ in range(n_single):

        seed = rng.randint(1, 1_000_000)

        event_name = rng.choice(
            single_event_names
        )

        severity = rng.uniform(
            0.5,
            1.0
        )

        onset_time_ratio = rng.uniform(
            0.0,
            0.2
        )

        scenario = generate_single_event(
            event_name=event_name,
            severity=severity,
            onset_time_ratio=onset_time_ratio,
            seed=seed,
        )

        scenarios.append(
            (
                scenario,
                {
                    "seed": seed,
                    "events": [event_name],
                    "severities": [severity],
                    "onset_time_ratios": [onset_time_ratio],
                },
            )
        )

    # --------------------------------------------------------
    # Coherent multi-events
    # --------------------------------------------------------

    n_multi = round(
        n_samples * distribution["multi_event_coherent"]
    )

    coherent_names = list(
        SCENARIOS["multi_event"]["coherent"].keys()
    )

    for _ in range(n_multi):

        seed = rng.randint(
            1,
            1_000_000
        )

        scenario_name = rng.choice(
            coherent_names
        )

        template = (
            SCENARIOS
            ["multi_event"]
            ["coherent"]
            [scenario_name][0]
        )

        n_events = len(
            template.events
        )

        severities = tuple(
            rng.uniform(0.0, 1.0)
            for _ in range(n_events)
        )

        onset_time_ratios = tuple(
            rng.uniform(0.0, 1.0)
            for _ in range(n_events)
        )

        scenario = generate_multi(
            scenario_name=scenario_name,
            severities=severities,
            onset_time_ratios=onset_time_ratios,
            seed=seed,
        )

        scenarios.append(
            (
                scenario,
                {
                    "seed": seed,
                    "scenario_name": scenario_name,
                    "events": [
                        event.event
                        for event in template.events
                    ],
                    "severities": list(severities),
                    "onset_time_ratios": list(
                        onset_time_ratios
                    ),
                },
            )
        )

    return scenarios



# ============================================================
# CURVE GENERATION
# ============================================================

def generate_curves(
    scenario: Scenario,
    breaches : list[Breach] | None
):
    """
    Generate all reactor curves for a scenario.
    """

    return generate_functions(
        scenario,
        breaches
    )


# ============================================================
# TEMPORAL SAMPLING
# ============================================================

def generate_timestamp_offsets(
    rng: random.Random,
    n_offsets: int = 9,
):
    """
    Generate temporal gaps in seconds.

    Distribution:
        Normal(mean=1s, std=1s)

    Negative values are clamped to zero.
    """

    return [
        max(
            0.0,
            rng.gauss(1.0, 1.0)
        )
        for _ in range(n_offsets)
    ]


def sample_curve(
    curve,
    sampling_frequency: float,
    rng: random.Random,
    n_points: int = 10,
):
    """
    Select n_points from a curve using randomly generated
    temporal offsets.

    Returns:
        values
        start_index
        offsets
        indices
    """

    n_samples = len(curve)

    if n_samples < n_points:
        raise ValueError(
            "Curve does not contain enough samples."
        )

    while True:

        # Random starting timestamp.
        start_index = rng.randint(
            0,
            n_samples - 1
        )

        offsets = generate_timestamp_offsets(
            rng,
            n_offsets=n_points - 1,
        )

        indices = [start_index]

        current_time = (
            start_index / sampling_frequency
        )

        valid = True

        for offset in offsets:

            current_time += offset

            index = round(
                current_time * sampling_frequency
            )

            if index >= n_samples:
                valid = False
                break

            indices.append(index)

        if not valid:
            continue

        values = [
            curve[index]
            for index in indices
        ]

        return {
            "values": values,
            "start_index": start_index,
            "offsets": offsets,
            "indices": indices,
        }



