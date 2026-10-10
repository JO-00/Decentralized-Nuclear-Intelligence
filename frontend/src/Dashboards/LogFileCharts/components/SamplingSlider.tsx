interface Props {
  /** Discrete fs values present in the checked group, sorted ascending. */
  stops: number[];
  /** Current selected fs. */
  value: number;
  onChange: (fs: number) => void;
}

export function SamplingSlider({ stops, value, onChange }: Props) {
  if (stops.length < 2) return null;

  const min = stops[0];
  const max = stops[stops.length - 1];
  const index = Math.max(0, stops.findIndex((s) => s === value));
  const maxIndex = stops.length - 1;

  return (
    <div className="rounded-md border border-slate-700 bg-slate-800/60 px-3 py-2">
      <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
        <span>View sampling frequency</span>
        <span className="font-mono text-slate-200">
          {value.toFixed(2)} Hz
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={maxIndex}
        step={1}
        value={index}
        onChange={(e) => onChange(stops[Number(e.target.value)])}
        className="w-full accent-indigo-500"
      />
      <div className="mt-1 flex justify-between text-[11px] text-slate-500">
        <span>{min.toFixed(2)} Hz (min)</span>
        <span>{max.toFixed(2)} Hz (max)</span>
      </div>
    </div>
  );
}