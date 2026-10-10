import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Curve } from '../types';
import type { VariableMeta } from '../VariableMeta';

interface Props {
  curves: Curve[];
  duration: number;
  meta: VariableMeta;
}

/** Compute a padded [min, max] domain from all plotted values. */
function computeYDomain(curves: Curve[]): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (const c of curves) {
    for (const p of c.points) {
      if (p.v < lo) lo = p.v;
      if (p.v > hi) hi = p.v;
    }
  }
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return [0, 1];
  if (lo === hi) {
    const pad = Math.abs(lo) * 0.05 || 1;
    return [lo - pad, hi + pad];
  }
  const pad = (hi - lo) * 0.05;
  return [lo - pad, hi + pad];
}

export function ComparisonChart({ curves, duration, meta }: Props) {
  if (curves.length === 0) {
    return (
      <div className="flex h-[560px] items-center justify-center rounded-md border border-slate-700 bg-slate-800/40 text-sm text-slate-500">
        Check one or more log files to plot them.
      </div>
    );
  }

  type Row = { t: number; [seriesId: string]: number };
  const byT = new Map<number, Row>();
  for (const c of curves) {
    for (const p of c.points) {
      const key = Math.round(p.t * 1e4) / 1e4;
      const row = byT.get(key) ?? { t: key };
      row[c.fileId] = p.v;
      byT.set(key, row);
    }
  }
  const data = Array.from(byT.values()).sort((a, b) => a.t - b.t);
  const [yMin, yMax] = computeYDomain(curves);

  return (
    <div className="h-[560px] w-full rounded-md border border-slate-700 bg-slate-900/40 p-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
          <XAxis
            dataKey="t"
            type="number"
            domain={[0, duration]}
            tickFormatter={(v) => `${v.toFixed(0)}s`}
            stroke="#94a3b8"
            fontSize={11}
          />
          <YAxis
            type="number"
            domain={[yMin, yMax]}
            allowDataOverflow={false}
            stroke="#94a3b8"
            fontSize={11}
            tickFormatter={(v) =>
              Math.abs(v) >= 1e4 ? v.toExponential(1) : String(Number(v.toFixed(3)))
            }
            label={{
              value: meta.unit,
              angle: -90,
              position: 'insideLeft',
              fill: '#94a3b8',
              fontSize: 11,
            }}
          />
          <Tooltip
            contentStyle={{
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: 6,
              fontSize: 12,
            }}
            labelStyle={{ color: '#94a3b8' }}
            labelFormatter={(v) => `t = ${Number(v).toFixed(2)} s`}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: '#cbd5e1' }}
            formatter={(value) =>
              curves.find((c) => c.fileId === value)?.fileName ?? value
            }
          />
          {curves.map((c) => (
            <Line
              key={c.fileId}
              type="monotone"
              dataKey={c.fileId}
              stroke={c.color}
              dot={false}
              isAnimationActive={false}
              strokeWidth={1.5}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}