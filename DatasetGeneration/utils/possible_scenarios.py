from utils.data_structures import *
from random import randint

SCENARIOS = {

    # ============================================================
    # NOMINAL
    # ============================================================

    "nominal": [
        Scenario(
            events=[],
            seed=1,
            duration=600,
        ),
    ],


    # ============================================================
    # SINGLE EVENT
    # ============================================================

    "single_event": {

        "power_increase": [
            Scenario(
                events=[
                    Event(
                        target="power",
                        event="power_increase",
                        severity=0.5,
                        onset_time_ratio=0.2,
                    )
                ],
                seed=2,
                duration=600,
            )
        ],

        "power_decrease": [
            Scenario(
                events=[
                    Event(
                        target="power",
                        event="power_decrease",
                        severity=0.5,
                        onset_time_ratio=0.2,
                    )
                ],
                seed=3,
                duration=600,
            )
        ],

        "control_rod_insertion": [
            Scenario(
                events=[
                    Event(
                        target="control_rod_position",
                        event="control_rod_insertion",
                        severity=0.5,
                        onset_time_ratio=0.2,
                    )
                ],
                seed=4,
                duration=600,
            )
        ],

        "control_rod_withdrawal": [
            Scenario(
                events=[
                    Event(
                        target="control_rod_position",
                        event="control_rod_withdrawal",
                        severity=0.5,
                        onset_time_ratio=0.2,
                    )
                ],
                seed=5,
                duration=600,
            )
        ],

        "pump_start": [
            Scenario(
                events=[
                    Event(
                        target="pump_state",
                        event="pump_start",
                        severity=0.5,
                        onset_time_ratio=0.2,
                    )
                ],
                seed=6,
                duration=600,
            )
        ],

        "pump_trip": [
            Scenario(
                events=[
                    Event(
                        target="pump_state",
                        event="pump_trip",
                        severity=0.5,
                        onset_time_ratio=0.2,
                    )
                ],
                seed=7,
                duration=600,
            )
        ],

        "temperature_elevation": [
            Scenario(
                events=[
                    Event(
                        target="temperature",
                        event="temperature_elevation",
                        severity=0.5,
                        onset_time_ratio=0.2,
                    )
                ],
                seed=8,
                duration=600,
            )
        ],

        "pressure_increase": [
            Scenario(
                events=[
                    Event(
                        target="pressure",
                        event="pressure_increase",
                        severity=0.5,
                        onset_time_ratio=0.2,
                    )
                ],
                seed=9,
                duration=600,
            )
        ],

        "pressure_decrease": [
            Scenario(
                events=[
                    Event(
                        target="pressure",
                        event="pressure_decrease",
                        severity=0.5,
                        onset_time_ratio=0.2,
                    )
                ],
                seed=10,
                duration=600,
            )
        ],
    },


    # ============================================================
    # MULTI EVENT
    # ============================================================

    "multi_event": {

        # ========================================================
        # COHERENT
        # ========================================================

        "coherent": {

            "power_increase_with_rod_withdrawal": [
                Scenario(
                    events=[
                        Event(
                            target="power",
                            event="power_increase",
                            severity=0.5,
                            onset_time_ratio=0.2,
                        ),
                        Event(
                            target="control_rod_position",
                            event="control_rod_withdrawal",
                            severity=0.5,
                            onset_time_ratio=0.2,
                        ),
                    ],
                    seed=11,
                    duration=600,
                )
            ],

            "power_increase_with_pump_start": [
                Scenario(
                    events=[
                        Event(
                            target="power",
                            event="power_increase",
                            severity=0.5,
                            onset_time_ratio=0.2,
                        ),
                        Event(
                            target="pump_state",
                            event="pump_start",
                            severity=0.5,
                            onset_time_ratio=0.2,
                        ),
                    ],
                    seed=12,
                    duration=600,
                )
            ],

            "power_decrease_with_rod_insertion": [
                Scenario(
                    events=[
                        Event(
                            target="power",
                            event="power_decrease",
                            severity=0.5,
                            onset_time_ratio=0.2,
                        ),
                        Event(
                            target="control_rod_position",
                            event="control_rod_insertion",
                            severity=0.5,
                            onset_time_ratio=0.2,
                        ),
                    ],
                    seed=13,
                    duration=600,
                )
            ],

            "power_increase_with_pump_trip": [
                Scenario(
                    events=[
                        Event(
                            target="power",
                            event="power_increase",
                            severity=0.5,
                            onset_time_ratio=0.2,
                        ),
                        Event(
                            target="pump_state",
                            event="pump_trip",
                            severity=0.7,
                            onset_time_ratio=0.3,
                        ),
                    ],
                    seed=14,
                    duration=600,
                )
            ],

            "power_decrease_with_pump_start": [
                Scenario(
                    events=[
                        Event(
                            target="power",
                            event="power_decrease",
                            severity=0.5,
                            onset_time_ratio=0.2,
                        ),
                        Event(
                            target="pump_state",
                            event="pump_start",
                            severity=0.5,
                            onset_time_ratio=0.2,
                        ),
                    ],
                    seed=15,
                    duration=600,
                )
            ],

            "temperature_elevation_with_power_increase": [
                Scenario(
                    events=[
                        Event(
                            target="power",
                            event="power_increase",
                            severity=0.5,
                            onset_time_ratio=0.2,
                        ),
                        Event(
                            target="temperature",
                            event="temperature_elevation",
                            severity=0.5,
                            onset_time_ratio=0.2,
                        ),
                    ],
                    seed=16,
                    duration=600,
                )
            ],

            "pressure_increase_with_temperature_elevation": [
                Scenario(
                    events=[
                        Event(
                            target="temperature",
                            event="temperature_elevation",
                            severity=0.5,
                            onset_time_ratio=0.2,
                        ),
                        Event(
                            target="pressure",
                            event="pressure_increase",
                            severity=0.5,
                            onset_time_ratio=0.2,
                        ),
                    ],
                    seed=17,
                    duration=600,
                )
            ],

            "pressure_decrease_with_power_decrease": [
                Scenario(
                    events=[
                        Event(
                            target="power",
                            event="power_decrease",
                            severity=0.5,
                            onset_time_ratio=0.2,
                        ),
                        Event(
                            target="pressure",
                            event="pressure_decrease",
                            severity=0.5,
                            onset_time_ratio=0.2,
                        ),
                    ],
                    seed=18,
                    duration=600,
                )
            ],

            "reactor_scram": [
                Scenario(
                    events=[
                        Event(
                            target="power",
                            event="reactor_scram",
                            severity=1.0,
                            onset_time_ratio=0.5,
                        ),
                        Event(
                            target="control_rod_position",
                            event="reactor_scram",
                            severity=1.0,
                            onset_time_ratio=0.5,
                        ),
                    ],
                    seed=19,
                    duration=600,
                )
            ],
        },
        # ========================================================
        # ADDITIONAL COHERENT MULTI-EVENT SCENARIOS
        # ========================================================

        "power_increase_with_rod_withdrawal_and_pump_start": [
            Scenario(
                events=[
                    Event(
                        target="power",
                        event="power_increase",
                        severity=0.5,
                        onset_time_ratio=0.2,
                    ),
                    Event(
                        target="control_rod_position",
                        event="control_rod_withdrawal",
                        severity=0.5,
                        onset_time_ratio=0.2,
                    ),
                    Event(
                        target="pump_state",
                        event="pump_start",
                        severity=0.5,
                        onset_time_ratio=0.25,
                    ),
                ],
                seed=20,
                duration=600,
            )
        ],

        "power_decrease_with_rod_insertion_and_pump_trip": [
            Scenario(
                events=[
                    Event(
                        target="power",
                        event="power_decrease",
                        severity=0.5,
                        onset_time_ratio=0.2,
                    ),
                    Event(
                        target="control_rod_position",
                        event="control_rod_insertion",
                        severity=0.5,
                        onset_time_ratio=0.2,
                    ),
                    Event(
                        target="pump_state",
                        event="pump_trip",
                        severity=0.5,
                        onset_time_ratio=0.25,
                    ),
                ],
                seed=21,
                duration=600,
            )
        ],

        "power_increase_with_temperature_elevation_and_pressure_increase": [
            Scenario(
                events=[
                    Event(
                        target="power",
                        event="power_increase",
                        severity=0.5,
                        onset_time_ratio=0.2,
                    ),
                    Event(
                        target="temperature",
                        event="temperature_elevation",
                        severity=0.5,
                        onset_time_ratio=0.3,
                    ),
                    Event(
                        target="pressure",
                        event="pressure_increase",
                        severity=0.5,
                        onset_time_ratio=0.35,
                    ),
                ],
                seed=22,
                duration=600,
            )
        ],

        "power_decrease_with_temperature_elevation_and_pressure_decrease": [
            Scenario(
                events=[
                    Event(
                        target="power",
                        event="power_decrease",
                        severity=0.5,
                        onset_time_ratio=0.2,
                    ),
                    Event(
                        target="temperature",
                        event="temperature_elevation",
                        severity=0.3,
                        onset_time_ratio=0.3,
                    ),
                    Event(
                        target="pressure",
                        event="pressure_decrease",
                        severity=0.5,
                        onset_time_ratio=0.35,
                    ),
                ],
                seed=23,
                duration=600,
            )
        ],

        "power_increase_with_pump_start_temperature_elevation": [
            Scenario(
                events=[
                    Event(
                        target="power",
                        event="power_increase",
                        severity=0.5,
                        onset_time_ratio=0.2,
                    ),
                    Event(
                        target="pump_state",
                        event="pump_start",
                        severity=0.5,
                        onset_time_ratio=0.25,
                    ),
                    Event(
                        target="temperature",
                        event="temperature_elevation",
                        severity=0.4,
                        onset_time_ratio=0.35,
                    ),
                ],
                seed=24,
                duration=600,
            )
        ],

        "power_increase_with_pump_start_temperature_elevation_pressure_increase": [
            Scenario(
                events=[
                    Event(
                        target="power",
                        event="power_increase",
                        severity=0.5,
                        onset_time_ratio=0.15,
                    ),
                    Event(
                        target="pump_state",
                        event="pump_start",
                        severity=0.5,
                        onset_time_ratio=0.25,
                    ),
                    Event(
                        target="temperature",
                        event="temperature_elevation",
                        severity=0.4,
                        onset_time_ratio=0.35,
                    ),
                    Event(
                        target="pressure",
                        event="pressure_increase",
                        severity=0.4,
                        onset_time_ratio=0.45,
                    ),
                ],
                seed=25,
                duration=600,
            )
        ],

        "power_increase_with_rod_withdrawal_temperature_elevation": [
            Scenario(
                events=[
                    Event(
                        target="power",
                        event="power_increase",
                        severity=0.5,
                        onset_time_ratio=0.2,
                    ),
                    Event(
                        target="control_rod_position",
                        event="control_rod_withdrawal",
                        severity=0.5,
                        onset_time_ratio=0.2,
                    ),
                    Event(
                        target="temperature",
                        event="temperature_elevation",
                        severity=0.4,
                        onset_time_ratio=0.35,
                    ),
                ],
                seed=26,
                duration=600,
            )
        ],

        "power_increase_with_rod_withdrawal_temperature_elevation_pressure_increase": [
            Scenario(
                events=[
                    Event(
                        target="power",
                        event="power_increase",
                        severity=0.5,
                        onset_time_ratio=0.15,
                    ),
                    Event(
                        target="control_rod_position",
                        event="control_rod_withdrawal",
                        severity=0.5,
                        onset_time_ratio=0.15,
                    ),
                    Event(
                        target="temperature",
                        event="temperature_elevation",
                        severity=0.4,
                        onset_time_ratio=0.30,
                    ),
                    Event(
                        target="pressure",
                        event="pressure_increase",
                        severity=0.4,
                        onset_time_ratio=0.40,
                    ),
                ],
                seed=27,
                duration=600,
            )
        ],

        "power_decrease_with_rod_insertion_pump_start": [
            Scenario(
                events=[
                    Event(
                        target="power",
                        event="power_decrease",
                        severity=0.5,
                        onset_time_ratio=0.2,
                    ),
                    Event(
                        target="control_rod_position",
                        event="control_rod_insertion",
                        severity=0.5,
                        onset_time_ratio=0.2,
                    ),
                    Event(
                        target="pump_state",
                        event="pump_start",
                        severity=0.5,
                        onset_time_ratio=0.3,
                    ),
                ],
                seed=28,
                duration=600,
            )
        ],

        "power_decrease_with_rod_insertion_pump_start_temperature_decrease": [
            Scenario(
                events=[
                    Event(
                        target="power",
                        event="power_decrease",
                        severity=0.5,
                        onset_time_ratio=0.2,
                    ),
                    Event(
                        target="control_rod_position",
                        event="control_rod_insertion",
                        severity=0.5,
                        onset_time_ratio=0.2,
                    ),
                    Event(
                        target="pump_state",
                        event="pump_start",
                        severity=0.5,
                        onset_time_ratio=0.3,
                    ),
                    Event(
                        target="pressure",
                        event="pressure_decrease",
                        severity=0.4,
                        onset_time_ratio=0.45,
                    ),
                ],
                seed=29,
                duration=600,
            )
        ],

        "power_increase_pump_start_temperature_elevation_rod_withdrawal": [
            Scenario(
                events=[
                    Event(
                        target="power",
                        event="power_increase",
                        severity=0.5,
                        onset_time_ratio=0.15,
                    ),
                    Event(
                        target="pump_state",
                        event="pump_start",
                        severity=0.5,
                        onset_time_ratio=0.25,
                    ),
                    Event(
                        target="temperature",
                        event="temperature_elevation",
                        severity=0.4,
                        onset_time_ratio=0.35,
                    ),
                    Event(
                        target="control_rod_position",
                        event="control_rod_withdrawal",
                        severity=0.3,
                        onset_time_ratio=0.45,
                    ),
                ],
                seed=30,
                duration=600,
            )
        ],

        "power_decrease_pump_trip_temperature_elevation_pressure_increase": [
            Scenario(
                events=[
                    Event(
                        target="power",
                        event="power_decrease",
                        severity=0.4,
                        onset_time_ratio=0.15,
                    ),
                    Event(
                        target="pump_state",
                        event="pump_trip",
                        severity=0.5,
                        onset_time_ratio=0.25,
                    ),
                    Event(
                        target="temperature",
                        event="temperature_elevation",
                        severity=0.4,
                        onset_time_ratio=0.35,
                    ),
                    Event(
                        target="pressure",
                        event="pressure_increase",
                        severity=0.4,
                        onset_time_ratio=0.45,
                    ),
                ],
                seed=31,
                duration=600,
            )
        ],

        "long_coherent_operation": [
            Scenario(
                events=[
                    Event(
                        target="power",
                        event="power_increase",
                        severity=0.4,
                        onset_time_ratio=0.10,
                    ),
                    Event(
                        target="control_rod_position",
                        event="control_rod_withdrawal",
                        severity=0.4,
                        onset_time_ratio=0.10,
                    ),
                    Event(
                        target="pump_state",
                        event="pump_start",
                        severity=0.4,
                        onset_time_ratio=0.20,
                    ),
                    Event(
                        target="temperature",
                        event="temperature_elevation",
                        severity=0.3,
                        onset_time_ratio=0.35,
                    ),
                    Event(
                        target="pressure",
                        event="pressure_increase",
                        severity=0.3,
                        onset_time_ratio=0.45,
                    ),
                    Event(
                        target="control_rod_position",
                        event="control_rod_insertion",
                        severity=0.3,
                        onset_time_ratio=0.65,
                    ),
                ],
                seed=32,
                duration=600,
            )
        ],


        # ========================================================
        # CONTRADICTORY
        # ========================================================

        "contradictory": [
                Breach(
                    relevant_columns=["temperature", "pressure"]
                ),
                Breach(
                    relevant_columns=["power", "neutron_flux"]
                ),
                Breach(
                    relevant_columns=["pump_state", "coolant_flow"]
                ),
                Breach(
                    relevant_columns=["power", "coolant_flow", "temperature"]
                )
        ],
    },
}

from copy import deepcopy
from random import randint


def generate_nominal(
    seed: int = None,
    randomize: bool = False
) -> Scenario:

    scenario = deepcopy(SCENARIOS["nominal"][0])

    if randomize:
        scenario.seed = randint(0, 100000)
    elif seed is not None:
        scenario.seed = seed

    return scenario


def generate_single_event(
    event_name: str,
    severity: float = None,
    onset_time_ratio: float = None,
    seed: int = None,
    randomize: bool = False
) -> Scenario:

    assert event_name in SCENARIOS["single_event"]

    scenario = deepcopy(
        SCENARIOS["single_event"][event_name][0]
    )

    event = scenario.events[0]

    if severity is not None:
        event.severity = severity

    if onset_time_ratio is not None:
        event.onset_time_ratio = onset_time_ratio

    if randomize:
        scenario.seed = randint(0, 100000)
    elif seed is not None:
        scenario.seed = seed

    return scenario


def generate_multi(
    scenario_name: str,
    severities: tuple[float, ...] = None,
    onset_time_ratios: tuple[float, ...] = None,
    seed: int = None,
    randomize: bool = False
) -> Scenario:

    if scenario_name in SCENARIOS["multi_event"]["coherent"]:
        type_ = "coherent"

    elif scenario_name in SCENARIOS["multi_event"]["contradictory"]:
        type_ = "contradictory"

    else:
        raise ValueError(f"Unknown multi-event scenario: {scenario_name}")

    scenario = deepcopy(
        SCENARIOS["multi_event"][type_][scenario_name][0]
    )

    events = scenario.events

    if severities is not None:
        assert len(severities) == len(events)

        for event, severity in zip(events, severities):
            event.severity = severity

    if onset_time_ratios is not None:
        assert len(onset_time_ratios) == len(events)

        for event, onset in zip(events, onset_time_ratios):
            event.onset_time_ratio = onset

    if randomize:
        scenario.seed = randint(0, 100000)
    elif seed is not None:
        scenario.seed = seed

    return scenario



    