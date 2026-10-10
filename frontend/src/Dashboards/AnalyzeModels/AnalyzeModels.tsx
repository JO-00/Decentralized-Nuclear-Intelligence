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

const smallInputClass =
  "w-24 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm " +
  "text-slate-100 shadow-sm transition " +
  "focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30";

export function GenerateDataset() {
  const API = import.meta.env.VITE_DATASET_API;

  const [nSamples, setNSamples] = useState(500);
  const [seed, setSeed] = useState(42);
  const [fractions, setFractions] = useState({
    nominal: 0.2,
    power_increase: 0.2,
    power_increase_with_rod_withdrawal: 0.3,
    reactor_scram: 0.3,
  });
  const [status, setStatus] = useState(null); // null | "loading" | "ok" | "error"
  const [message, setMessage] = useState("");

  const sum = Object.values(fractions).reduce((a, b) => a + b, 0);
  const sumOk = Math.abs(sum - 1) < 1e-6;

  function updateFraction(name, value) {
    setFractions((f) => ({ ...f, [name]: value }));
  }

  function addRow() {
    const name = window.prompt("Scenario name (exact, e.g. power_decrease):");
    if (!name) return;
    if (name in fractions) return alert("Already added.");
    setFractions((f) => ({ ...f, [name]: 0 }));
  }

  function removeRow(name) {
    setFractions((f) => {
      const { [name]: _, ...rest } = f;
      return rest;
    });
  }

  async function handleGenerate() {
    setStatus("loading");
    setMessage("");

    if (!sumOk) {
      setStatus("error");
      setMessage(`Fractions must sum to 1.0 (currently ${sum.toFixed(4)}).`);
      return;
    }

    const filePath = `dataset_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}.csv`;

    let blobUrl = null;

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
      setMessage(err.message);
    } finally {
      if (blobUrl) {
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      {/* subtle radial glow behind the card */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.15),_transparent_60%)]" />

      <div className="relative mx-auto w-full max-w-2xl">
        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-black/40 backdrop-blur">
          {/* Header */}
          <div className="border-b border-slate-800 px-6 py-5">
            <h1 className="text-xl font-semibold tracking-tight text-slate-100">
              Dataset Generator
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Configure scenario distribution and download the generated CSV.
            </p>
          </div>

          {/* Body */}
          <div className="space-y-6 px-6 py-6">
            {/* Top row: n_samples + seed */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Number of samples
                </label>
                <input
                  type="number"
                  min={1}
                  value={nSamples}
                  onChange={(e) => setNSamples(e.target.value)}
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
                  onChange={(e) => setSeed(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Fractions */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-200">
                  Scenario fractions
                </h2>
                <span
                  className={
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 " +
                    (sumOk
                      ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30"
                      : "bg-rose-500/10 text-rose-400 ring-rose-500/30")
                  }
                >
                  <span
                    className={
                      "h-1.5 w-1.5 rounded-full " +
                      (sumOk ? "bg-emerald-400" : "bg-rose-400")
                    }
                  />
                  sum = {sum.toFixed(4)}
                </span>
              </div>

              <ul className="space-y-2">
                {Object.entries(fractions).map(([name, value]) => (
                  <li
                    key={name}
                    className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2"
                  >
                    <span className="flex-1 truncate font-mono text-sm text-slate-300">
                      {name}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={value}
                      onChange={(e) =>
                        updateFraction(name, Number(e.target.value))
                      }
                      className={smallInputClass}
                    />
                    <button
                      type="button"
                      onClick={() => removeRow(name)}
                      className="rounded-md p-1.5 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400"
                      aria-label={`Remove ${name}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.75 1A2.75 2.75 0 006 3.75V4H3.75a.75.75 0 000 1.5h.3l.815 10.6A2.75 2.75 0 007.605 18.5h4.79a2.75 2.75 0 002.74-2.4l.815-10.6h.3a.75.75 0 000-1.5H14V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4h1.5V3.75a1.25 1.25 0 00-1.25-1.25h-2.5A1.25 1.25 0 006.5 3.75V4H10zm-2.5 3a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0v-6A.75.75 0 017.5 7zm5.75.75a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0v-6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={addRow}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-400 transition hover:border-indigo-500 hover:text-indigo-400"
              >
                <span className="text-base leading-none">+</span>
                Add scenario
              </button>
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

            {/* Status message */}
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

        <p className="mt-6 text-center text-xs text-slate-500">
          Requests are sent to{" "}
          <code className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-slate-400">
            {API}
          </code>
        </p>
      </div>
    </div>
  );
}