import {
  LOG_FILE_VARIABLES,
  type BoundsViolation,
  type LogFile,
  type LogFileVariable,
  type ValidationResult,
} from './types';
import { VARIABLE_META } from './variableMeta';

const ALLOWED = new Set<string>(LOG_FILE_VARIABLES);

/** Validate shape only — no cross-file duration check here. */
export function validateLogFile(raw: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { valid: false, errors: ['Root must be a JSON object.'], warnings };
  }

  const obj = raw as Record<string, unknown>;

  // duration
  if (!('duration' in obj)) {
    errors.push('Missing "duration".');
  } else if (
    typeof obj.duration !== 'number' ||
    !Number.isFinite(obj.duration) ||
    !Number.isInteger(obj.duration) ||
    obj.duration <= 0
  ) {
    errors.push('"duration" must be a positive integer (seconds).');
  }

  // variables
  if (!('variables' in obj)) {
    errors.push('Missing "variables".');
  } else if (
    typeof obj.variables !== 'object' ||
    obj.variables === null ||
    Array.isArray(obj.variables)
  ) {
    errors.push('"variables" must be an object.');
  } else {
    const vars = obj.variables as Record<string, unknown>;
    const keys = Object.keys(vars);

    if (keys.length === 0) {
      errors.push('"variables" is empty.');
    }

    const unknownKeys = keys.filter((k) => !ALLOWED.has(k));
    if (unknownKeys.length > 0) {
      errors.push(`Unknown variable(s): ${unknownKeys.join(', ')}.`);
    }

    const lengths: number[] = [];
    for (const key of keys) {
      if (!ALLOWED.has(key)) continue;
      const arr = vars[key];
      if (!Array.isArray(arr)) {
        errors.push(`"${key}" must be an array.`);
        continue;
      }
      if (arr.length === 0) {
        errors.push(`"${key}" is empty.`);
        continue;
      }
      for (let i = 0; i < arr.length; i++) {
        const v = arr[i];
        if (typeof v !== 'number' || !Number.isFinite(v)) {
          errors.push(`"${key}[${i}]" is not a finite number.`);
          break;
        }
      }
      lengths.push(arr.length);
    }

    if (lengths.length > 1) {
      const first = lengths[0];
      if (lengths.some((l) => l !== first)) {
        errors.push(
          'All variable arrays in one file must have equal length (same sampling rate).'
        );
      }
    }

    const missing = LOG_FILE_VARIABLES.filter((v) => !(v in vars));
    if (missing.length > 0) {
      warnings.push(`Missing variable(s): ${missing.join(', ')}.`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/** Value-bounds check using VARIABLE_META. */
export function checkBounds(file: LogFile): BoundsViolation[] {
  const out: BoundsViolation[] = [];
  for (const key of LOG_FILE_VARIABLES) {
    const arr = file.variables[key];
    if (!arr) continue;
    const { min, max } = VARIABLE_META[key];
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i];
      if (v < min || v > max) {
        out.push({ variable: key, index: i, value: v, min, max });
      }
    }
  }
  return out;
}

/** Native sampling frequency of a file for a given variable. */
export function computeFs(file: LogFile, variable: LogFileVariable): number | null {
  const arr = file.variables[variable];
  if (!arr || arr.length === 0) return null;
  return arr.length / file.duration;
}

/** Bucket-average downsample to target frequency. */
export function downsampleByBucketAvg(
  values: number[],
  sourceFs: number,
  targetFs: number,
  duration: number
): { t: number; v: number }[] {
  if (targetFs >= sourceFs || values.length === 0) {
    // No resampling — return native points on a time axis.
    return values.map((v, i) => ({
      t: (i / sourceFs),
      v,
    }));
  }

  const ratio = sourceFs / targetFs; // > 1
  const outLen = Math.max(1, Math.floor(values.length / ratio));
  const bucketSize = values.length / outLen;
  const points: { t: number; v: number }[] = [];

  for (let b = 0; b < outLen; b++) {
    const start = Math.floor(b * bucketSize);
    const end = Math.min(values.length, Math.floor((b + 1) * bucketSize));
    let sum = 0;
    let n = 0;
    for (let i = start; i < end; i++) {
      sum += values[i];
      n++;
    }
    const v = n > 0 ? sum / n : values[start] ?? 0;
    const t = (b + 0.5) * (1 / targetFs);
    points.push({ t: Math.min(t, duration), v });
  }
  return points;
}

/** Throws-free check: which checked files have a different duration than the first? */
export function findDurationMismatches(files: LogFile[]): LogFile[] {
  if (files.length < 2) return [];
  const ref = files[0].duration;
  return files.filter((f) => f.duration !== ref);
}

export function makeLogFile(raw: unknown, name: string): LogFile | null {
  const res = validateLogFile(raw);
  if (!res.valid) return null;
  const obj = raw as { duration: number; variables: Record<string, number[]> };
  const variables: Partial<Record<LogFileVariable, number[]>> = {};
  for (const k of Object.keys(obj.variables)) {
    if (ALLOWED.has(k)) {
      variables[k as LogFileVariable] = obj.variables[k];
    }
  }
  return {
    id: `${name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    duration: obj.duration,
    variables,
  };
}