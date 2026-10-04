from utils.data_structures import Scenario, Event, Breach
from CurveRandomGeneration import *

def call_power(scenario: Scenario):
    kwargs = {
        "duration" : scenario.duration,
        "scenario": "nominal",
        "severity": getattr(scenario, "severity", 0.0),
        "onset_time_ratio": getattr(scenario, "onset_time_ratio", 0.0),
        "seed": scenario.seed,
    }

    for event in scenario.events:
        if event.target == "power":
            if event.event in ("power_increase", "power_decrease", "reactor_scram"):
                kwargs["scenario"] = event.event
            kwargs["severity"] = event.severity
            kwargs["onset_time_ratio"] = event.onset_time_ratio
            break

    return power.generate_power_curve(**kwargs)


def call_rod(scenario: Scenario):
    kwargs = {
        "scenario": "nominal",
        "severity": getattr(scenario, "severity", 0.0),
        "seed": scenario.seed,
        "duration" : scenario.duration
    }

    for event in scenario.events:
        if event.target == "control_rod_position":
            if event.event in ("control_rod_insertion", "control_rod_withdrawal", "reactor_scram"):
                kwargs["scenario"] = event.event
                kwargs["onset_time_ratio"] = event.onset_time_ratio
            kwargs["severity"] = event.severity
            break

    return rod.generate_control_insertion_curve(**kwargs)


def call_pump(scenario: Scenario):
    kwargs = {
        "scenario": "nominal",
        "duration": scenario.duration,
        "severity": getattr(scenario, "severity", 0.0),
        "seed": scenario.seed,
    }

    for event in scenario.events:
        if event.target == "pump_state":
            if event.event in ("pump_start", "pump_trip"):
                kwargs["scenario"] = event.event
                kwargs["onset_time_ratio"] = event.onset_time_ratio
            kwargs["severity"] = event.severity
            break

    return pump.generate_pump_state_curve(**kwargs)


def call_coolant(perfect_pump_curve, scenario: Scenario, breaches):
    for breach in breaches:
        if "coolant_flow" in breach.relevant_columns and "pump_state" in breach.relevant_columns:

            return coolant.generate_coolant_curve(
                scenario.duration,
                None,
                seed=scenario.seed,
            )
    return coolant.generate_coolant_curve(
                    scenario.duration,
                    perfect_pump_curve,
                    seed=scenario.seed,
                )    


def call_temperature(perfect_power_curve, perfect_coolant_curve, scenario: Scenario, breaches ):
    kwargs = {
        "scenario": "nominal",
        "duration": scenario.duration,
        "perfect_coolant_curve": perfect_coolant_curve,
        "perfect_power_curve": perfect_power_curve,
        "severity": getattr(scenario, "severity", 0.0),
        "seed": scenario.seed,
    }
    

    for event in scenario.events:
        if event.target == "temperature":
            if event.event == "temperature_elevation":
                kwargs["scenario"] = event.event
            kwargs["severity"] = event.severity
            break
    for breach in breaches:
        cols = breach.relevant_columns
        if "temperature" in cols:
            if "perfect_coolant_curve" in cols:
                kwargs.pop("perfect_coolant_curve")
            if "perfect_power_curve" in cols:
                kwargs.pop("power")

    return temperature.generate_temperature_curve(**kwargs)


def call_pressure(perfect_temperature_curve,  scenario: Scenario, breaches):
    kwargs = {
        "duration" : scenario.duration,
        "scenario": "nominal",
        "perfect_temperature_curve": perfect_temperature_curve,
        "severity": getattr(scenario, "severity", 0.0),
        "seed": scenario.seed,
    }

    for event in scenario.events:
        if event.target == "pressure":
            if event.event in ("pressure_increase", "pressure_decrease"):
                kwargs["scenario"] = event.event
            kwargs["severity"] = event.severity
            break

    for breach in breaches:
        cols = breach.relevant_columns
        if "pressure" in cols and "temperature" in cols:
            kwargs["perfect_temperature_curve"] = None



    return pressure.generate_pressure_curve(**kwargs)


def call_neutron(scenario, perfect_power_t, breaches):
    for breach in breaches:
        if "neutron_flux" in breach:
            if "power" in breach:
                return neutron.generate_neutron_flux_curve(
                    scenario.duration, None, scenario.seed
                )
    return neutron.generate_neutron_flux_curve(
                        scenario.duration, perfect_power_t, scenario.seed
                    )




def get_events() -> list[Event]:

    return [
        # 0 → 135 s
        Event(
            target="power",
            event="power_increase",
            severity=0.35,
            onset_time_ratio=0.15,
        ),

        # 225 s
        Event(
            target="pump_state",
            event="pump_start",
            severity=0.60,
            onset_time_ratio=0.25,
        ),

        # 360 s
        Event(
            target="temperature",
            event="temperature_elevation",
            severity=0.25,
            onset_time_ratio=0.40,
        ),

        # 495 s
        Event(
            target="control_rod_position",
            event="control_rod_insertion",
            severity=0.30,
            onset_time_ratio=0.55,
        ),

        # 630 s
        Event(
            target="power",
            event="power_decrease",
            severity=0.20,
            onset_time_ratio=0.70,
        ),

        # 765 s
        Event(
            target="pump_state",
            event="pump_trip",
            severity=0.50,
            onset_time_ratio=0.85,
        ),
    ]


def get_breaches() -> list[Breach]:
    return []
    return [
        Breach(
            relevant_columns=[
                "temperature",
                "pressure",
            ]
        ),

        Breach(
            relevant_columns=[
                "power",
                "neutron_flux",
            ]
        ),
    ]