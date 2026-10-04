from config import COOLANT_CONFIGS , PUMP_CONFIGS
import numpy as np
from CurveRandomGeneration.pump import generate_pump_state_curve
from CurveRandomGeneration.curve_plotter import plot_curve
def get_coolant_configs():
    return (
        COOLANT_CONFIGS["min_flow"],
        COOLANT_CONFIGS["max_flow"],
        COOLANT_CONFIGS["noise_std"],
        COOLANT_CONFIGS["sampling_frequency"]
    )




def generate_default_coolant_curve(sample_count: int, seed: int):
    min_flow, max_flow, _, _ = get_coolant_configs()

    rng = np.random.default_rng(seed)

    # Choose a plausible starting flow
    current = rng.uniform(0.7 * max_flow, 0.95 * max_flow)

    curve = np.zeros(sample_count)
    curve[0] = current

    for t in range(sample_count - 1):
        # Small independent hydraulic fluctuation
        change = rng.normal(0.0, 5.0)

        current += change
        current = np.clip(current, min_flow, max_flow)

        curve[t + 1] = current

    return curve





def generate_coolant_curve(
        duration : int,
        perfect_valve_curve : list[float] | None,
        seed : int
):
    min_flow , max_flow , noise_std , sampling_frequency = get_coolant_configs()
    sample_count = int(duration * sampling_frequency)
    assert sampling_frequency == PUMP_CONFIGS["sampling_frequency"]

    if perfect_valve_curve is None:
        perfect_coolant_flow = generate_default_coolant_curve(sample_count , seed)
    else:
        perfect_coolant_flow =  min_flow + (max_flow - min_flow) * perfect_valve_curve

    rng = np.random.default_rng(seed)
    noise = rng.normal(
        loc=0.0,
        scale=noise_std,
        size=sample_count
    )

    # Noise applies to the ENTIRE curve
    noisy_coolant_flow = perfect_coolant_flow + noise


    # Keep power physically valid
    noisy_coolant_flow = np.clip(noisy_coolant_flow, min_flow, max_flow)
    time = np.arange(sample_count) / sampling_frequency

    return time, perfect_coolant_flow , noisy_coolant_flow


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
    time,perfect_coolant , noisy_coolant = generate_coolant_curve(
        perfect_valve,
        seed = 2
    )
    plot_curve(
        time,
        perfect_coolant,
        "perfect coolant"
    )

    plot_curve(
        time,
        noisy_coolant,
        "noisy coolant"
    )
