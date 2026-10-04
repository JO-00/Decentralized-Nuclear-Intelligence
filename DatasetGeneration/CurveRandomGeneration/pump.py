import numpy as np

import config
from CurveRandomGeneration.curve_plotter import plot_curve


def get_pump_configs():
    min_valve_position = config.PUMP_CONFIGS["min_valve_position"]
    max_valve_position = config.PUMP_CONFIGS["max_valve_position"]

    initial_valve_position_range = (
        config.PUMP_CONFIGS["initial_valve_position_range"]
    )

    sampling_frequency = config.PUMP_CONFIGS["sampling_frequency"]

    return (
        min_valve_position,
        max_valve_position,
        initial_valve_position_range,
        sampling_frequency
    )


def sigmoid(time: np.ndarray, severity: float, rng):
    slope_range = config.PUMP_CONFIGS["slope_range"]

    # Severity determines the nominal transition speed
    sigmoid_slope = (
        slope_range[0]
        + severity * (slope_range[1] - slope_range[0])
    )

    # Small stochastic variation around the chosen slope
    slope_noise = rng.normal(0.0, 0.05)
    sigmoid_slope *= (1.0 + slope_noise)

    return 1.0 / (
        1.0 + np.exp(-sigmoid_slope * time)
    )


def generate_pump_state_curve(
        duration : int,
        scenario: str,
        severity: float,
        seed: int,
        onset_time_ratio: float = 0
):
    assert scenario in (
        "nominal",
        "pump_start",
        "pump_trip"
    )

    assert 0.0 <= severity <= 1.0
    assert 0.0 <= onset_time_ratio <= 1.0

    rng = np.random.default_rng(seed)

    (
        min_valve_position,
        max_valve_position,
        initial_valve_position_range,
        sampling_frequency
    ) = get_pump_configs()

    sample_count = int(
        duration * sampling_frequency
    )

    time = np.arange(sample_count) / sampling_frequency

    onset_time = onset_time_ratio * duration

    
    # Determine initial valve position
    initial_valve_position = 1.0 # opened at max

    # Determine target
    if scenario == "pump_start":

        target_valve_position = (
            initial_valve_position
            + severity
            * (max_valve_position - initial_valve_position)
        )

    elif scenario == "pump_trip":

        target_valve_position = (
            initial_valve_position
            - severity
            * (initial_valve_position - min_valve_position)
        )

    else:
        target_valve_position = initial_valve_position
    
    # Time elapsed since scenario onset
    transition_time = np.maximum(
        time - onset_time,
        0.0
    )

    # Sigmoid
    sigmoid_function = sigmoid(
        transition_time,
        severity,
        rng
    )

    # Normalize sigmoid so transition starts at 0
    sigmoid_function = (
        sigmoid_function - 0.5
    ) / 0.5

    sigmoid_function = np.clip(
        sigmoid_function,
        0.0,
        1.0
    )

    # Controlled transition
    perfect_valve_position = (
        initial_valve_position
        + (
            target_valve_position
            - initial_valve_position
        )
        * sigmoid_function
    )

    # ---- STOCHASTIC REALISM ----

    noise_std = config.PUMP_CONFIGS["noise_std"]

    noise = rng.normal(
        loc=0.0,
        scale=noise_std,
        size=sample_count
    )

    # Noise applies to the ENTIRE curve
    noisy_valve_position = (
        perfect_valve_position + noise
    )

    # Keep valve position physically valid
    noisy_valve_position = np.clip(
        noisy_valve_position,
        min_valve_position,
        max_valve_position
    )

    return (
        time,
        perfect_valve_position,
        noisy_valve_position
    )



if __name__ == "__main__":
    time, perfect_valve, noisy_valve = generate_pump_state_curve(
        60,
        scenario="pump_start",
        severity=0.2,
        onset_time_ratio=0.2,
        seed=2
    )

    plot_curve(
        time,
        perfect_valve,
        "perfect valve position"
    )

    plot_curve(
        time,
        noisy_valve,
        "noisy valve position"
    )