import type { LogFileVariable } from './types';

export interface VariableMeta {
  label: string;
  unit: string;
  description: string;
  /** Hard value bounds used by checkBounds. */
  min: number;
  max: number;
  /** Optional config excerpt to show in the collapsible panel. */
  config: Record<string, unknown>;
}

export const VARIABLE_META: Record<LogFileVariable, VariableMeta> = {
  power: {
    label: 'Power',
    unit: 'MW',
    description:
      'Thermal reactor power. Bounded by rated capacity (1000 MW); typical capacity factor 0.9.',
    min: 0,
    max: 1000,
    config: {
      capacity_factor: 0.9,
      max_rated_power: 1000,
      min_power: 0,
      sampling_frequency: 1,
      slope_range: [0.01, 0.2],
      noise_std: 2,
    },
  },
  neutron_flux: {
    label: 'Neutron flux',
    unit: '1e12 n/(cm²·s)',
    description:
      'Neutron population density, proportional to fission rate. Nominal 1e13 n/(cm²·s).',
    min: 0,
    max: 2e13,
    config: {
      flux_nominal: 1e13,
      noise_std: 1e11,
      sampling_frequency: 1,
    },
  },
  control_rod_position: {
    label: 'Control rod position',
    unit: 'fraction',
    description:
      'Rod insertion, 0 = fully withdrawn, 1 = fully inserted. Drives reactivity.',
    min: 0,
    max: 1,
    config: {
      sampling_frequency: 1,
      initial_position_range: [0.2, 0.8],
      slope_range: [0.05, 0.2],
      noise_std: 0.005,
    },
  },
  pump_state: {
    label: 'Pump state',
    unit: 'fraction',
    description:
      'Coolant pump valve position, 0 = closed, 1 = fully open.',
    min: 0,
    max: 1,
    config: {
      sampling_frequency: 1,
      min_valve_position: 0,
      max_valve_position: 1,
      initial_valve_position_range: [0.2, 0.8],
      slope_range: [0.05, 0.2],
      noise_std: 0.002,
    },
  },
  coolant_flow: {
    label: 'Coolant flow',
    unit: 'kg/s',
    description:
      'Primary loop mass flow rate. Nominal 900 kg/s, max 1000 kg/s.',
    min: 0,
    max: 1000,
    config: {
      min_flow: 0,
      max_flow: 1000,
      nominal_flow: 900,
      noise_std: 2,
      sampling_frequency: 1,
    },
  },
  temperature: {
    label: 'Temperature',
    unit: '°C',
    description:
      'Core coolant temperature. Ambient 25 °C, nominal 300 °C. (Max value is a placeholder — tune in variableMeta.)',
    min: 200,
    max: 600,
    config: {
      sampling_frequency: 1,
      ambient_temperature: 25,
      nominal_temperature: 300,
      minimum_temperature: 200,
      initial_temperature: 300,
      nominal_power: 900,
      nominal_flow: 900,
      ks: [0.03, 0.01, 0.005],
      k_power: 0.03,
      k_flow: 0.01,
      k_loss: 0.005,
      noise_std: 0.5,
    },
  },
  pressure: {
    label: 'Pressure',
    unit: 'bar',
    description:
      'Primary loop pressure. Nominal 150 bar, max disturbance ±30 bar. (Bounds are placeholders — tune in variableMeta.)',
    min: 120,
    max: 180,
    config: {
      sampling_frequency: 1,
      nominal_pressure: 150,
      noise_std: 0.5,
      k_T: 0.2,
      max_disturbance: 30,
    },
  },
};