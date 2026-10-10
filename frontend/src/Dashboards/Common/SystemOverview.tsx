import { useEffect, useState } from 'react';
import { ContractCall } from '../../HashGraphUtils/ContractCall';
import { SystemOverview } from '../../HashGraphUtils/types';

export function SystemOverviewCard() {
  const [data, setData] = useState<SystemOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ContractCall.getSystemOverview()
      .then(setData)
      .catch((e: unknown) => {
        if (e instanceof Error) {
          console.error("getSystemOverview failed:", e);
          console.error("Stack:", e.stack);
          setError(e.message);
        } else {
          console.error("Non-Error thrown:", e);
          setError(String(e));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <SectionHeader />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <SectionHeader />
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-red-300">
            Failed to load system overview
          </p>
          <pre className="whitespace-pre-wrap break-words font-mono text-xs text-red-200">
            {error}
          </pre>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      <SectionHeader />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon="◈"
          label="Total oracles"
          value={data.totalOracles.toString()}
          accent="from-indigo-500 to-blue-500"
        />
        <StatCard
          icon="⧫"
          label="Request fee"
          value={data.requestFee.toString()}
          accent="from-fuchsia-500 to-purple-500"
        />
        <StatCard
          icon="◆"
          label="Model proposal fee"
          value={data.modelProposalFee.toString()}
          accent="from-emerald-500 to-teal-500"
        />
      </div>
    </div>
  );
}

/* ---------- presentational ---------- */

function SectionHeader() {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight text-slate-100">
        System overview
      </h2>
      <p className="text-xs text-slate-500">
        Live state read from the contract.
      </p>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-slate-700 hover:bg-slate-900/80">
      <span
        className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${accent} opacity-70 transition-opacity group-hover:opacity-100`}
      />
      <div className="flex items-start justify-between gap-3">
        <span
          className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${accent} text-sm text-white shadow-md`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-[11px] font-medium uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 truncate font-mono text-xl font-semibold text-slate-100" title={value}>
        {value}
      </p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="h-9 w-9 rounded-lg bg-slate-800" />
      <div className="mt-3 h-3 w-20 rounded bg-slate-800" />
      <div className="mt-2 h-6 w-24 rounded bg-slate-800" />
    </div>
  );
}