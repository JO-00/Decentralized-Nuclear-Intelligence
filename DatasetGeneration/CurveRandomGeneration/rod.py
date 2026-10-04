import numpy as np

from config import CONTROL_ROD_CONFIGS
from CurveRandomGeneration.curve_plotter import plot_curve


def validate_inputs(
        scenario: str,
        severity: float,
        onset_time_ratio: float
):
    assert scenario in (
        "nominal",
        "control_rod_insertion",
        "control_rod_withdrawal",
        "reactor_scram",
    )
    assert 0.0 <= severity <= 1.0
    assert 0.0 <= onset_time_ratio <= 1.0


def generate_initial_position(rng):
    return rng.uniform(
        CONTROL_ROD_CONFIGS["initial_position_range"][0],
        CONTROL_ROD_CONFIGS["initial_position_range"][1]
    )


def get_target_position(
        scenario: str,
        initial_position: float,
        severity: float
):
    if scenario == "control_rod_insertion":
        return (
            initial_position
            + severity * (1.0 - initial_position)
        ), severity

    elif scenario == "control_rod_withdrawal":
        return (
            initial_position
            - severity * initial_position
        ), severity

    elif scenario == "reactor_scram":
        return 1.0, 5

    else:
        return initial_position, severity


def generate_transition(
        time: np.ndarray,
        onset_time: float,
        initial_position: float,
        target_position: float,
        severity: float,
        rng
):
    transition_time = np.maximum(
        time - onset_time,
        0.0
    )

    slope_range = CONTROL_ROD_CONFIGS["slope_range"]

    slope = (
        slope_range[0]
        + severity * (slope_range[1] - slope_range[0])
    )

    slope *= (1.0 + rng.normal(0.0, 0.05))

    sigmoid_function = 1.0 / (
        1.0 + np.exp(-slope * transition_time)
    )

    sigmoid_function = (
        sigmoid_function - 0.5
    ) / 0.5

    sigmoid_function = np.clip(
        sigmoid_function,
        0.0,
        1.0
    )

    return (
        initial_position
        + (target_position - initial_position)
        * sigmoid_function
    )


def add_noise(
        perfect_rod_function: np.ndarray,
        sample_count: int,
        rng
):
    noise_std = CONTROL_ROD_CONFIGS["noise_std"]

    noise = rng.normal(
        loc=0.0,
        scale=noise_std,
        size=sample_count
    )

    noisy_rod_position = perfect_rod_function + noise

    return np.clip(
        noisy_rod_position,
        0.0,
        1.0
    )


def generate_control_insertion_curve(
        duration : int,
        scenario: str,
        severity: float,
        seed: int,
        onset_time_ratio: float = 0
):
    validate_inputs(
        scenario,
        severity,
        onset_time_ratio
    )

    rng = np.random.default_rng(seed)

    sampling_frequency = CONTROL_ROD_CONFIGS["sampling_frequency"]

    sample_count = int(
        duration * sampling_frequency
    )

    time = np.arange(sample_count) / sampling_frequency

    initial_position = generate_initial_position(rng)

    target_position, severity = get_target_position(
        scenario,
        initial_position,
        severity
    )

    onset_time = onset_time_ratio * duration

    perfect_rod_function = generate_transition(
        time,
        onset_time,
        initial_position,
        target_position,
        severity,
        rng
    )

    noisy_rod_position = add_noise(
        perfect_rod_function,
        sample_count,
        rng
    )

    return (
        time,
        perfect_rod_function,
        noisy_rod_position
    )



if __name__ == "__main__":
    time, perfect_rod_function, noisy_rod_position = (
        generate_control_insertion_curve(
            60,
            scenario="reactor_scram",
            severity=0.2,
            onset_time_ratio=0.2,
            seed=2
        )
    )

    plot_curve(
        time,
        perfect_rod_function,
        "perfect rod position"
    )

    plot_curve(
        time,
        noisy_rod_position,
        "noisy rod position"
    )