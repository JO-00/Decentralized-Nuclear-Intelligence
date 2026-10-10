import { useState } from "react";
import { fetchLogFilesVotes, fetchModelVotes } from "../../Features/User/Voting";

export function VoteSearchPanel() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-100">
          Search votes
        </h2>
        <p className="text-xs text-slate-500">
          Look up reputation for a model or a specific log file.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ModelVoteSearch />
        <LogFileVoteSearch />
      </div>
    </div>
  );
}

/* ---------- Model search ---------- */

function ModelVoteSearch() {
  const [owner, setOwner] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<unknown>(null);

  const search = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const r = await fetchModelVotes(owner.trim());
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold text-slate-100">Model reputation</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Search by model owner.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && owner.trim()) search();
          }}
          placeholder="0.0.1234567 or 0x…"
          spellCheck={false}
          autoComplete="off"
          className="flex-1 rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 font-mono text-xs text-slate-100 placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
        />
        <button
          type="button"
          onClick={search}
          disabled={!owner.trim() || loading}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-500/30 transition hover:from-indigo-400 hover:to-fuchsia-400 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 disabled:shadow-none"
        >
          {loading && (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          Search
        </button>
      </div>

      {error && <ErrorBox message={error} />}
      {result != null && <ReputationDisplay data={result} />}
    </div>
  );
}

/* ---------- Log file search ---------- */

function LogFileVoteSearch() {
  const [ipfsRef, setIpfsRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<unknown>(null);

  const search = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const r = await fetchLogFilesVotes(ipfsRef.trim());
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold text-slate-100">Log file reputation</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Search by IPFS reference.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          value={ipfsRef}
          onChange={(e) => setIpfsRef(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && ipfsRef.trim()) search();
          }}
          placeholder="Qm… or bafy…"
          spellCheck={false}
          autoComplete="off"
          className="flex-1 rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 font-mono text-xs text-slate-100 placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
        />
        <button
          type="button"
          onClick={search}
          disabled={!ipfsRef.trim() || loading}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-500/30 transition hover:from-indigo-400 hover:to-fuchsia-400 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 disabled:shadow-none"
        >
          {loading && (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          Search
        </button>
      </div>

      {error && <ErrorBox message={error} />}
      {result != null && <ReputationDisplay data={result} />}
    </div>
  );
}

/* ---------- shared presentational ---------- */

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-red-300">
        Error
      </p>
      <pre className="whitespace-pre-wrap break-words font-mono text-xs text-red-200">
        {message}
      </pre>
    </div>
  );
}

/**
 * Generic renderer for whatever `getModelReputation` / `getLogFileReputation`
 * return. Handles: number, bigint, boolean, object of primitives, fallback JSON.
 */
function ReputationDisplay({ data }: { data: unknown }) {
  // number / bigint
  if (typeof data === "number" || typeof data === "bigint") {
    return (
      <div className="rounded-md border border-slate-700 bg-slate-950/60 px-3 py-4 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Reputation
        </p>
        <p className="mt-1 font-mono text-2xl font-semibold text-slate-100">
          {data.toString()}
        </p>
      </div>
    );
  }

  // boolean
  if (typeof data === "boolean") {
    return (
      <div className="rounded-md border border-slate-700 bg-slate-950/60 px-3 py-4 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Reputation
        </p>
        <p
          className={`mt-1 font-mono text-2xl font-semibold ${
            data ? "text-emerald-300" : "text-rose-300"
          }`}
        >
          {data ? "true" : "false"}
        </p>
      </div>
    );
  }

  // object of primitives → stat grid
  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    const entries = Object.entries(data as Record<string, unknown>);
    const allPrimitive = entries.every(
      ([, v]) =>
        v === null ||
        ["string", "number", "bigint", "boolean"].includes(typeof v)
    );

    if (allPrimitive && entries.length > 0) {
      return (
        <div className="grid grid-cols-2 gap-2">
          {entries.map(([k, v]) => (
            <div
              key={k}
              className="rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2"
            >
              <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {k}
              </p>
              <p className="mt-0.5 truncate font-mono text-sm text-slate-100">
                {v === null
                  ? "null"
                  : typeof v === "boolean"
                  ? v
                    ? "true"
                    : "false"
                  : String(v)}
              </p>
            </div>
          ))}
        </div>
      );
    }
  }

  // fallback
  return (
    <pre className="max-h-48 overflow-auto rounded-md border border-slate-700 bg-slate-950/60 p-3 font-mono text-xs text-slate-300">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}