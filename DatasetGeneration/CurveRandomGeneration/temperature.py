import numpy as np

from config import TEMPERATURE_CONFIGS
from CurveRandomGeneration.power import generate_power_curve
from CurveRandomGeneration.coolant import generate_coolant_curve   
from CurveRandomGeneration.pump import generate_pump_state_curve
from CurveRandomGeneration.curve_plotter import  plot_curve




def calculate_next_temperature(
    current_temperature,
    power,
    coolant_flow,
    target_temperature,
    relationship_strength=1.0,
):
    k_power, k_flow, k_loss = TEMPERATURE_CONFIGS["ks"]

    nominal_power = TEMPERATURE_CONFIGS["nominal_power"]
    nominal_flow = TEMPERATURE_CONFIGS["nominal_flow"]
    minimum_temperature = TEMPERATURE_CONFIGS["minimum_temperature"]

    power_effect = relationship_strength * k_power * (
        power - nominal_power
    )

    flow_effect = relationship_strength * k_flow * (
        coolant_flow - nominal_flow
    )

    thermal_relaxation = k_loss * (
        current_temperature - target_temperature
    )

    temperature_change = (
        power_effect
        - flow_effect
        - thermal_relaxation
    )

    next_temperature = current_temperature + temperature_change

    return max(minimum_temperature, next_temperature)




def generate_temperature_curve(
        duration : int,
        scenario: str,
        perfect_power_curve: list[float],
        perfect_coolant_curve: list[float],
        severity: float,
        seed : int
):
    assert scenario in (
        "nominal",
        "temperature_elevation",
    )

    assert 0.0 <= severity <= 1.0

    sampling_frequency = TEMPERATURE_CONFIGS["sampling_frequency"]

    nominal_temperature = TEMPERATURE_CONFIGS["nominal_temperature"]
    initial_temperature = TEMPERATURE_CONFIGS["initial_temperature"]

    sample_count = int(
        duration * sampling_frequency
    )

    power = np.asarray(perfect_power_curve)
    coolant_flow = np.asarray(perfect_coolant_curve)

    assert len(power) == sample_count
    assert len(coolant_flow) == sample_count

    # Determine the temperature the system tends to return toward
    if scenario == "temperature_elevation":
        target_temperature = (
            nominal_temperature
            + severity * (700.0 - nominal_temperature)
        )
    else:
        target_temperature = nominal_temperature

    temperature = np.zeros(sample_count)

    temperature[0] = initial_temperature

    for t in range(sample_count - 1):

        temperature[t + 1] = calculate_next_temperature(
            current_temperature=temperature[t],
            power=power[t],
            coolant_flow=coolant_flow[t],
            target_temperature=target_temperature,
            relationship_strength=0.3 if scenario != "nominal" else 1.0
        )

    time = np.arange(sample_count) / sampling_frequency

    rng = np.random.default_rng(seed)
    noise = rng.normal(
        loc=0.0,
        scale=TEMPERATURE_CONFIGS["noise_std"],
        size=sample_count
    )


    return time, temperature, temperature + noise




if __name__ == "__main__":

    test_ks = [
        (0.02, 0.01, 0.005),
        (0.03, 0.01, 0.005),
        (0.04, 0.01, 0.005),
        (0.05, 0.01, 0.005), # the chosen one

        (0.03, 0.015, 0.005),
        (0.04, 0.015, 0.005)
    ]

    power_event = "power_increase"
    power_severity = 1
    power_onset = 0.2
    power_seed = 2

    pump_event = "pump_start"
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
        pump_onset,
        pump_seed
    )

    _, perfect_coolant_curve, _ = generate_coolant_curve(
        perfect_valve_curve,
        2
    )

    print(f"power curve = {perfect_power_curve}")
    print(f"valve curve = {perfect_valve_curve}")
    print(f"coolant curve = {perfect_coolant_curve}")


    time, temperature , noisy_T = generate_temperature_curve(
        "nominal",
        perfect_power_curve,
        perfect_coolant_curve,
        1,
        2
    )
    print(temperature)

    plot_curve(time, noisy_T, "temperature")