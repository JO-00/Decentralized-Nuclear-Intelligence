from config import POSSIBLE_EVENTS
from utils.helpers import *
from utils.data_structures import Scenario, Event, Breach
from CurveRandomGeneration import *


def generate_functions(scenario: Scenario, breaches : list[Breach]) -> dict:
    assert isinstance(scenario, Scenario), "invalid scenario"

    _, perfect_power_t, noisy_power_t = call_power(scenario)

    perfect_neutron_flux, noisy_neutron_flux = call_neutron(scenario, perfect_power_t,breaches)
    

    _, perfect_rod_insertion, noisy_rod_insertion = call_rod(scenario)

    _, perfect_pump_curve, noisy_pump_curve = call_pump(scenario)

    _, perfect_coolant_curve, noisy_coolant_curve = call_coolant(perfect_pump_curve, scenario, breaches)

    _, perfect_temperature_curve, noisy_temperature_curve = call_temperature(
        perfect_power_t, perfect_coolant_curve, scenario, breaches
    )

    perfect_pressure_curve, noisy_pressure_curve = call_pressure(
        perfect_temperature_curve, scenario, breaches
    )

    return {
        "power": noisy_power_t,
        "neutron_flux": noisy_neutron_flux,
        "control_rod_position": noisy_rod_insertion,
        "pump_state": noisy_pump_curve,
        "coolant_flow": noisy_coolant_curve,
        "temperature": noisy_temperature_curve,
        "pressure": noisy_pressure_curve,
    }



if __name__ == '__main__':
    scenario = Scenario(
        seed=42,
        duration=60,
        events=[
            Event(
                target="power",
                event="power_increase",
                severity=0.4,
                onset_time_ratio=0.2,
            ),
            Event(
                target="control_rod_position",
                event="control_rod_withdrawal",
                severity=0.4,
                onset_time_ratio=0.2,
            ),
        ],
    )


    functions = generate_functions(scenario)
    for key in functions:
        print(f"\n\n{key}\n\n")
        print(functions[key])