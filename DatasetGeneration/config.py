DEFAULT_SIMULATION_DURATION = 60 # in seconds
DEFAULT_SAMPLING_FREQUENCY = 1
POSSIBLE_EVENTS = [
    "nominal",
    "power_increase",
    "power_decrease",
    "control_rod_insertion",
    "control_rod_withdrawal",
    "pump_start",
    "pump_trip",
    "coolant_flow_increase",
    "coolant_flow_reduction",
    "temperature_elevation",
    "pressure_increase",
    "pressure_decrease",
    "coolant_loss",
    "reactor_scram",
]

STATE = [
    "power",
    "neutron_flux" ,
    "control_rod_position" ,
    "coolant_flow",
    "temperature",
    "pressure",
    "pump_state"
]


POWER_CONFIGS = {
    "capacity_factor" : 0.9,
    "max_rated_power" : 1000, # in MW
    "min_power" : 0,
    "sampling_frequency" : 1,
    "slope_range" : (0.01 , 0.2),
    "noise_std" : 2
}

NEUTRON_FLUX_NOMINALS = {
    "flux_nominal" : 1e13, # neutrons / (cm² * s)
    "noise_std": 1e11,
    "sampling_frequency" : 1
}

CONTROL_ROD_CONFIGS = {
    "sampling_frequency": 1,          # Hz

    "initial_position_range": (
        0.2,                           # 20% inserted
        0.8                            # 80% inserted
    ),

    "slope_range": (
        0.05,                          # s^-1
        0.20                           # s^-1
    ),

    "noise_std": 0.005,                # 0.5% of full travel
}  

PUMP_CONFIGS = {
    "sampling_frequency": 1,

    "min_valve_position": 0.0,
    "max_valve_position": 1.0,

    "initial_valve_position_range": (0.2, 0.8),

    "slope_range": (0.05, 0.20),

    "noise_std": 0.002,
}

COOLANT_CONFIGS = {
    "min_flow" : 0, #fully closed valve
    "max_flow": 1000, # in kg/s
    "noise_std" : 2,
    "sampling_frequency" : 1,
    "nominal_flow" : 900
}

TEMPERATURE_CONFIGS = {
    "sampling_frequency": 1,

    "ambient_temperature": 25.0,
    "nominal_temperature": 300.0,
    "minimum_temperature" : 200.0,
    "initial_temperature": 300.0,

    "nominal_power": 900.0,
    "nominal_flow": 900.0,
    "ks" : (0.03, 0.01, 0.005), #
    "k_power" : 0.03,
    "k_flow" : 0.01,
    "k_loss" : 0.005,

    "noise_std" : 0.5
}


PRESSURE_CONFIGS = {
    "sampling_frequency": 1,
    "nominal_pressure": 150.0,
    "noise_std": 0.5,
    "k_T" : 0.2,
    "max_disturbance" : 30
}


