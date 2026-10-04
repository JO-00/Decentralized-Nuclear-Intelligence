from matplotlib import pyplot as plt
import numpy as np
import config
from CurveRandomGeneration.curve_plotter import plot_curve
from CurveRandomGeneration.neutron import generate_neutron_flux_curve


def get_power_configs():
    P_nominal = (
            config.POWER_CONFIGS["max_rated_power"]
            * config.POWER_CONFIGS["capacity_factor"]
        )
    
    P_min = config.POWER_CONFIGS["min_power"]
    P_max = config.POWER_CONFIGS["max_rated_power"]

    sampling_frequency = config.POWER_CONFIGS["sampling_frequency"]

    return P_nominal, P_min, P_max, sampling_frequency


def sigmoid(time: np.ndarray, severity: float, rng):
    slope_range = config.POWER_CONFIGS["slope_range"]

    # Severity determines the nominal transition speed
    sigmoid_slope = (
        slope_range[0]
        + severity * (slope_range[1] - slope_range[0])
    )

    # Small stochastic variation around the chosen slope
    slope_noise = rng.normal(0.0, 0.05)
    sigmoid_slope *= (1.0 + slope_noise)

    return 1.0 / (1.0 + np.exp(-sigmoid_slope * time))


def generate_power_curve(
        duration : int,
        scenario: str,
        severity: float,
        onset_time_ratio: float,
        seed: int
):
    assert scenario in ("power_increase", "power_decrease", "nominal", "reactor_scram")
    assert 0.0 <= severity <= 1.0
    assert 0.0 <= onset_time_ratio <= 1.0

    rng = np.random.default_rng(seed)

    P_nominal, P_min, P_max, sampling_frequency = get_power_configs()

    sample_count = int(duration * sampling_frequency)

    time = np.arange(sample_count) / sampling_frequency

    onset_time = onset_time_ratio * duration

    if scenario == "reactor_scram" :
        scenario = "power_decrease"
        severity = 1

    match scenario:
        case "nominal":
            pass

    # Determine target
    if scenario == "power_decrease":
        P_target = P_nominal - severity * (P_nominal - P_min)

    elif scenario == "power_increase":
        P_target = P_nominal + severity * (P_max - P_nominal)

    else:
        P_target = P_nominal

    # Time elapsed since scenario onset
    transition_time = np.maximum(time - onset_time, 0.0)

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

    sigmoid_function = np.clip(sigmoid_function, 0.0, 1.0)

    # Controlled transition
    perfect_power = P_nominal + (
        P_target - P_nominal
    ) * sigmoid_function

    # ---- STOCHASTIC REALISM ----

    noise_std = config.POWER_CONFIGS["noise_std"]

    noise = rng.normal(
        loc=0.0,
        scale=noise_std,
        size=sample_count
    )

    # Noise applies to the ENTIRE curve
    noisy_power = perfect_power + noise


    # Keep power physically valid
    noisy_power = np.clip(noisy_power, P_min, P_max)

    return time, perfect_power , noisy_power

if __name__ == "__main__":
    time, perfect_power , noisy_power = generate_power_curve(
        scenario="power_increase",
        severity=0.3,
        onset_time_ratio=0.2,
        seed=2
    )
    plot_curve(time,perfect_power , "power")
    perfect_neutron , noisy_neutron = generate_neutron_flux_curve(perfect_power , seed = 2)
    plot_curve(time, noisy_neutron , "neutron")

"""
the severity for power_increase can be comfortably chosen between 0 and 1
for the severity for power_decrease, we tend to put very small numbers between 0 and 0.05
putting severity = 1 would basically means SCRAM 
"""