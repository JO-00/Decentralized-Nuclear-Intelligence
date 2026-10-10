import { ModelInterpretabilityGuide } from "./ModelGuide";
import { useState } from "react";

export function AnalyzeModels() {
  return (
    <div>
      <ModelInterpretabilityGuide />
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm " +
  "text-slate-100 placeholder-slate-500 shadow-sm transition " +
  "focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

// Hardcoded — mirrors SCENARIOS on the backend.
const ALL_SCENARIOS = [
  "nominal",
  // single events
  "power_increase",
  "power_decrease",
  "control_rod_insertion",
  "control_rod_withdrawal",
  "pump_start",
  "pump_trip",
  "temperature_elevation",
  "pressure_increase",
  "pressure_decrease",
  // coherent multi-events
  "power_increase_with_rod_withdrawal",
  "power_increase_with_pump_start",
  "power_decrease_with_rod_insertion",
  "power_increase_with_pump_trip",
  "power_decrease_with_pump_start",
  "temperature_elevation_with_power_increase",
  "pressure_increase_with_temperature_elevation",
  "pressure_decrease_with_power_decrease",
  "reactor_scram",
  "power_increase_with_rod_withdrawal_and_pump_start",
  "power_decrease_with_rod_insertion_and_pump_trip",
  "power_increase_with_temperature_elevation_and_pressure_increase",
  "power_decrease_with_temperature_elevation_and_pressure_decrease",
  "power_increase_with_pump_start_temperature_elevation",
  "power_increase_with_pump_start_temperature_elevation_pressure_increase",
  "power_increase_with_rod_withdrawal_temperature_elevation",
  "power_increase_with_rod_withdrawal_temperature_elevation_pressure_increase",
  "power_decrease_with_rod_insertion_pump_start",
  "power_decrease_with_rod_insertion_pump_start_temperature_decrease",
  "power_increase_pump_start_temperature_elevation_rod_withdrawal",
  "power_decrease_pump_trip_temperature_elevation_pressure_increase",
  "long_coherent_operation",
];

const scrollAreaClass = `
  max-h-80 overflow-y-auto pr-2
  [scrollbar-width:thin]
  [scrollbar-color:theme(colors.slate.700)_transparent]
  hover:[scrollbar-color:theme(colors.slate.600)_transparent]
  [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:bg-transparent
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-slate-700
  [&::-webkit-scrollbar-thumb:hover]:bg-slate-600
`;

export function GenerateDataset() {
  const API = import.meta.env.VITE_BACKEND_URL;

  const [nSamples, setNSamples] = useState(500);
  const [seed, setSeed] = useState(42);
  const [weights, setWeights] = useState<Record<string, number>>(() =>
    Object.fromEntries(ALL_SCENARIOS.map((n) => [n, 0]))
  );
  const [status, setStatus] = useState<null | "loading" | "ok" | "error">(null);
  const [message, setMessage] = useState("");

  const usedTotal = Object.values(weights).reduce((a, b) => a + b, 0);
  const remaining = 100 - usedTotal;
  const sumOk = remaining === 0;

  function setWeightAt(name: string, value: number) {
    setWeights((prev) => {
      const othersSum = Object.entries(prev).reduce(
        (s, [k, v]) => (k === name ? s : s + v),
        0
      );
      const max = Math.max(0, 100 - othersSum);
      const clamped = Math.min(Math.max(0, value), max);
      return { ...prev, [name]: clamped };
    });
  }

  function reset() {
    setWeights(Object.fromEntries(ALL_SCENARIOS.map((n) => [n, 0])));
  }

  function distributeEvenly() {
    const active = Object.keys(weights).length;
    if (active === 0) return;
    const base = Math.floor(100 / active);
    const leftover = 100 - base * active;
    const next: Record<string, number> = {};
    ALL_SCENARIOS.forEach((n, i) => {
      next[n] = base + (i < leftover ? 1 : 0);
    });
    setWeights(next);
  }

  async function handleGenerate() {
    setStatus("loading");
    setMessage("");

    if (!sumOk) {
      setStatus("error");
      setMessage(
        `Weights must sum to 100% (currently ${usedTotal}%). ${remaining}% remaining.`
      );
      return;
    }

    const fractions = Object.fromEntries(
      Object.entries(weights)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => [k, v / 100])
    );

    const filePath = `dataset_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}.csv`;

    let blobUrl: string | null = null;

    try {
      const res = await fetch(`${API}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          n_samples: Number(nSamples),
          fractions,
          seed: Number(seed),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${res.statusText}\n${text}`);
      }

      const blob = await res.blob();
      blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filePath;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setStatus("ok");
      setMessage(`Downloaded ${filePath}`);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      if (blobUrl) {
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.15),_transparent_60%)]" />

      <div className="relative mx-auto w-full max-w-2xl">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-black/40 backdrop-blur">
          {/* Header */}
          <div className="border-b border-slate-800 px-6 py-5">
            <h1 className="text-xl font-semibold tracking-tight text-slate-100">
              Dataset Generator
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Distribute scenario weights and download the generated CSV.
            </p>
          </div>

          {/* Body */}
          <div className="space-y-6 px-6 py-6">
            {/* Top row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Number of samples
                </label>
                <input
                  type="number"
                  min={1}
                  value={nSamples}
                  onChange={(e) => setNSamples(Number(e.target.value))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Seed
                </label>
                <input
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Weight allocation */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-slate-200">
                  Scenario weights
                </h2>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-md border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={distributeEvenly}
                    className="rounded-md border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
                  >
                    Even
                  </button>
                  <span
                    className={
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 " +
                      (sumOk
                        ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30"
                        : "bg-amber-500/10 text-amber-400 ring-amber-500/30")
                    }
                  >
                    <span
                      className={
                        "h-1.5 w-1.5 rounded-full " +
                        (sumOk ? "bg-emerald-400" : "bg-amber-400")
                      }
                    />
                    {usedTotal} / 100
                  </span>
                </div>
              </div>

              <ul className={`space-y-2 ${scrollAreaClass}`}>
                {ALL_SCENARIOS.map((name) => {
                  const value = weights[name] ?? 0;
                  const othersSum = usedTotal - value;
                  const max = Math.max(0, 100 - othersSum);
                  return (
                    <li
                      key={name}
                      className="flex items-center gap-4 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2"
                    >
                      <span
                        className="w-56 shrink-0 truncate font-mono text-xs text-slate-300"
                        title={name}
                      >
                        {name}
                      </span>

                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={value}
                        onChange={(e) =>
                          setWeightAt(name, Number(e.target.value))
                        }
                        className="flex-1 accent-indigo-500"
                      />

                      <span className="w-10 shrink-0 text-right font-mono text-xs text-slate-400">
                        {value}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Submit */}
            <button
              onClick={handleGenerate}
              disabled={status === "loading" || !sumOk}
              className={
                "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 " +
                "text-sm font-semibold text-white shadow-lg transition " +
                "focus:outline-none focus:ring-2 focus:ring-indigo-500/40 " +
                (status === "loading" || !sumOk
                  ? "cursor-not-allowed bg-slate-700 text-slate-400 shadow-none"
                  : "bg-indigo-600 shadow-indigo-900/40 hover:bg-indigo-500 active:bg-indigo-700")
              }
            >
              {status === "loading" && (
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="opacity-25"
                  />
                  <path
                    fill="currentColor"
                    className="opacity-75"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              )}
              {status === "loading" ? "Generating…" : "Generate & Download"}
            </button>

            {/* Status */}
            {message && (
              <div
                className={
                  "rounded-lg border px-4 py-3 text-sm " +
                  (status === "ok"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-300")
                }
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">
                    {status === "ok" ? "✓" : "!"}
                  </span>
                  <pre className="whitespace-pre-wrap font-sans">{message}</pre>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}