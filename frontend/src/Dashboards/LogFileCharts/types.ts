export const LOG_FILE_VARIABLES = [
  'power',
  'neutron_flux',
  'control_rod_position',
  'pump_state',
  'coolant_flow',
  'temperature',
  'pressure',
] as const;

export type LogFileVariable = (typeof LOG_FILE_VARIABLES)[number];

export interface LogFile {
  id: string;
  name: string;
  duration: number;
  variables: Partial<Record<LogFileVariable, number[]>>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BoundsViolation {
  variable: LogFileVariable;
  index: number;
  value: number;
  min: number;
  max: number;
}

/** One resampled curve ready to plot. */
export interface Curve {
  fileId: string;
  fileName: string;
  color: string;
  points: { t: number; v: number }[];
}