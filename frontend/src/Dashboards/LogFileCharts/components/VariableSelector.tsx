import { LOG_FILE_VARIABLES, type LogFileVariable } from '../types';
import { VARIABLE_META } from '../VariableMeta';

interface Props {
  value: LogFileVariable;
  onChange: (v: LogFileVariable) => void;
}

export function VariableSelector({ value, onChange }: Props) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-slate-400">Variable:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as LogFileVariable)}
        className="rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
      >
        {LOG_FILE_VARIABLES.map((v) => (
          <option key={v} value={v}>
            {VARIABLE_META[v].label}
          </option>
        ))}
      </select>
    </label>
  );
}