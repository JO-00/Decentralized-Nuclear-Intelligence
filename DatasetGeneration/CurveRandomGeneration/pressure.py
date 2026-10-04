from config import PRESSURE_CONFIGS, TEMPERATURE_CONFIGS
from CurveRandomGeneration.power import generate_power_curve
from CurveRandomGeneration.pump import generate_pump_state_curve
from CurveRandomGeneration.coolant import generate_coolant_curve
from CurveRandomGeneration.temperature import generate_temperature_curve
import numpy as np


def generate_default_pressure(
        target: float,
        sample_count: int,
        seed: int,
):
    """
    Generate a smooth pressure trajectory around the target,
    independently of temperature.
    """

    rng = np.random.default_rng(seed)

    pressure = np.zeros(sample_count)
    pressure[0] = target

    drift_std = 0.15
    mean_reversion = 0.05

    for t in range(sample_count - 1):

        drift = rng.normal(
            loc=0.0,
            scale=drift_std,
        )

        correction = (
            target - pressure[t]
        ) * mean_reversion

        pressure[t + 1] = (
            pressure[t]
            + correction
            + drift
        )

    return pressure


def generate_pressure_curve(
        duration : int,
        scenario: str,
        perfect_temperature_curve: list[float] | None,
        severity: float,
        seed: int
):
    assert scenario in (
        "nominal",
        "pressure_increase",
        "pressure_decrease",
    )

    nominal_pressure = PRESSURE_CONFIGS["nominal_pressure"]
    max_disturbance = PRESSURE_CONFIGS["max_disturbance"]
    k_T = PRESSURE_CONFIGS["k_T"]

    if scenario == "nominal":
        pressure_target = nominal_pressure

    elif scenario == "pressure_increase":
        pressure_target = (
            nominal_pressure
            + severity * max_disturbance
        )

    else:  # pressure_decrease
        pressure_target = (
            nominal_pressure
            - severity * max_disturbance
        )

    if perfect_temperature_curve is not None:
        perfect_pressure = (
            pressure_target
            + (
                perfect_temperature_curve
                - TEMPERATURE_CONFIGS["nominal_temperature"]
            )
            * k_T
        )
    else:
        perfect_pressure = generate_default_pressure(pressure_target, duration * PRESSURE_CONFIGS["sampling_frequency"], seed)

    rng = np.random.default_rng(seed)

    noise = rng.normal(
        loc=0.0,
        scale=PRESSURE_CONFIGS["noise_std"],
        size=duration * PRESSURE_CONFIGS["sampling_frequency"],
    )

    return perfect_pressure, perfect_pressure + noise







if __name__ == '__main__':
    power_event = "power_increase"
    power_severity = 1
    power_onset = 0
    power_seed = 2

    pump_event = "pump_trip"
    pump_severity = 1
    pump_onset = 0
    pump_seed = 2

    _, perfect_power_curve, _ = generate_power_curve(
        60,
        power_event,
        power_severity,
        power_onset,
        power_seed
    )

    _, perfect_valve_curve, _ = generate_pump_state_curve(
        60,
        pump_event,
        pump_severity,
        pump_seed,
        pump_onset
        
    )

    _, perfect_coolant_curve, _ = generate_coolant_curve(
        60,
        perfect_valve_curve,
        2
    )

    print(f"power curve = {perfect_power_curve}")
    print(f"valve curve = {perfect_valve_curve}")
    print(f"coolant curve = {perfect_coolant_curve}")


    time, temperature , noisy_T = generate_temperature_curve(
        60,
        "temperature_elevation",
        perfect_power_curve,
        perfect_coolant_curve,
        1,
        2
    )
    print(temperature)
    test_ks = [
    0.05,
    0.10,
    0.15,
    0.20,
    0.25,
    0.30,
]
    for k in [test_ks]:
        print(f"k = {k}")
        print(
            generate_pressure_curve(
                "pressure_decrease",
                temperature,
                1,
                2,
#               k
            )[1]
        )
        