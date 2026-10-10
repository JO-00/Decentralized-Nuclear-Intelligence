import { useState } from 'react';
import type { LogFileVariable } from '../types';
import { VARIABLE_META } from '../VariableMeta';

interface Props {
  variable: LogFileVariable;
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`h-3.5 w-3.5 transition-transform duration-200 ${
        open ? 'rotate-90' : ''
      }`}
    >
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.17 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function formatNum(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  const abs = Math.abs(n);
  if (abs !== 0 && (abs >= 1e5 || abs < 1e-3)) return n.toExponential(2);
  return String(n);
}

/** Human-friendly label for a config key: slope_range → "Slope range". */
function prettyKey(key: string): string {
  const s = key.replace(/_/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** A value renderer for anything inside the config tree. */
function ConfigValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <span className="italic text-slate-500">null</span>;
  }
  if (typeof value === 'boolean') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium ${
          value
            ? 'bg-emerald-500/10 text-emerald-300'
            : 'bg-rose-500/10 text-rose-300'
        }`}
      >
        {value ? 'true' : 'false'}
      </span>
    );
  }
  if (typeof value === 'number') {
    return (
      <span className="rounded bg-slate-800/80 px-1.5 py-0.5 font-mono text-[11px] text-indigo-200">
        {formatNum(value)}
      </span>
    );
  }
  if (typeof value === 'string') {
    return <span className="text-amber-200">"{value}"</span>;
  }

  if (Array.isArray(value)) {
    // Tuple of two numbers → range chip
    if (
      value.length === 2 &&
      typeof value[0] === 'number' &&
      typeof value[1] === 'number'
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded border border-slate-700 bg-slate-800/60 px-2 py-0.5 font-mono text-[11px] text-slate-200">
          <span className="text-slate-500">range</span>
          <span className="text-indigo-200">{formatNum(value[0])}</span>
          <span className="text-slate-600">→</span>
          <span className="text-indigo-200">{formatNum(value[1])}</span>
        </span>
      );
    }
    // Short array → pill list
    if (value.length <= 6) {
      return (
        <span className="inline-flex flex-wrap gap-1">
          {value.map((v, i) => (
            <span
              key={i}
              className="rounded bg-slate-800/80 px-1.5 py-0.5 font-mono text-[11px] text-slate-200"
            >
              {typeof v === 'number' ? formatNum(v) : String(v)}
            </span>
          ))}
        </span>
      );
    }
    // Long array → count
    return (
      <span className="rounded bg-slate-800/80 px-1.5 py-0.5 font-mono text-[11px] text-slate-300">
        [{value.length} items]
      </span>
    );
  }

  if (typeof value === 'object') {
    return <ConfigTree data={value as Record<string, unknown>} />;
  }

  return <span className="text-slate-400">{String(value)}</span>;
}

/** Renders a flat object as a list of key/value rows. */
function ConfigTree({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data);
  return (
    <div className="divide-y divide-slate-800/80">
      {entries.map(([k, v]) => (
        <div
          key={k}
          className="flex items-start justify-between gap-4 py-1.5 first:pt-0 last:pb-0"
        >
          <span className="shrink-0 text-[11px] text-slate-400">
            {prettyKey(k)}
          </span>
          <div className="min-w-0 text-right">
            <ConfigValue value={v} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function VariableInfoPanel({ variable }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const meta = VARIABLE_META[variable];

  const copyConfig = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(meta.config, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-900/60 shadow-sm">
      {/* Header strip */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-700/70 bg-slate-800/50 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
          <h3 className="truncate text-sm font-semibold text-slate-100">
            {meta.label}
          </h3>
          <span className="shrink-0 rounded-full bg-slate-700/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-300">
            {meta.unit}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2 rounded-md border border-slate-700 bg-slate-900/70 px-2 py-1 text-[11px]">
          <span className="text-slate-500">range</span>
          <span className="font-mono text-slate-300">
            {formatNum(meta.min)}
          </span>
          <span className="text-slate-600">–</span>
          <span className="font-mono text-slate-300">
            {formatNum(meta.max)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-2.5 px-4 py-3">
        <p className="text-xs leading-relaxed text-slate-400">
          {meta.description}
        </p>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="group -ml-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-indigo-300 transition hover:bg-indigo-500/10 hover:text-indigo-200"
        >
          <Chevron open={open} />
          {open ? 'Hide configuration' : 'Show configuration'}
        </button>

        {open && (
          <div className="overflow-hidden rounded-md border border-slate-700/80 bg-slate-950/60">
            <div className="flex items-center justify-between border-b border-slate-700/60 bg-slate-900/60 px-3 py-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Config
              </span>
              <button
                type="button"
                onClick={copyConfig}
                className="rounded px-1.5 py-0.5 text-[10px] font-medium text-slate-400 transition hover:bg-slate-700/60 hover:text-slate-200"
              >
                {copied ? '✓ Copied' : 'Copy JSON'}
              </button>
            </div>
            <div className="max-h-64 overflow-auto p-3">
              <ConfigTree data={meta.config} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}