import { useMemo, useState } from 'react';
import { colorForIndex } from './ChartColors';
import { ComparisonChart } from './components/ComparisonChart';
import { FileList } from './components/FileList';
import { FileUploader } from './components/FileUploader';
import { SamplingSlider } from './components/SamplingSlider';
import { VariableInfoPanel } from './components/VariableInfoPanel';
import { VariableSelector } from './components/VariableSelector';
import {
  computeFs,
  downsampleByBucketAvg,
  findDurationMismatches,
} from './LogFileUtils';
import { useLogFiles } from './useLogFiles';
import {
  type Curve,
  type LogFileVariable,
} from './types';
import { VARIABLE_META } from './VariableMeta';

export function LogFileComparison() {
  const { files, rejected, addFiles, removeFile, dismissRejected } =
    useLogFiles();

  const [variable, setVariable] = useState<LogFileVariable>('temperature');
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [viewFs, setViewFs] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const checkedFiles = useMemo(
    () => files.filter((f) => checkedIds.has(f.id)),
    [files, checkedIds]
  );

  // Stable color per file id (assigned by upload order).
  const colorByFileId = useMemo(() => {
    const m = new Map<string, string>();
    files.forEach((f, i) => m.set(f.id, colorForIndex(i)));
    return m;
  }, [files]);

  // Discrete fs stops for the checked group for the current variable.
  const fsStops = useMemo(() => {
    const set = new Set<number>();
    for (const f of checkedFiles) {
      const fs = computeFs(f, variable);
      if (fs != null) set.add(Math.round(fs * 1000) / 1000);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [checkedFiles, variable]);

  // Effective view fs: user's choice if valid, otherwise the max stop.
  const effectiveFs =
    viewFs != null && fsStops.includes(viewFs)
      ? viewFs
      : fsStops.length > 0
      ? fsStops[fsStops.length - 1]
      : null;

  // Build the curves.
  const curves: Curve[] = useMemo(() => {
    if (!effectiveFs) return [];
    const out: Curve[] = [];
    for (const f of checkedFiles) {
      const arr = f.variables[variable];
      if (!arr) continue;
      const nativeFs = arr.length / f.duration;
      const points = downsampleByBucketAvg(
        arr,
        nativeFs,
        effectiveFs,
        f.duration
      );
      out.push({
        fileId: f.id,
        fileName: f.name,
        color: colorByFileId.get(f.id) ?? '#94a3b8',
        points,
      });
    }
    return out;
  }, [checkedFiles, variable, effectiveFs, colorByFileId]);

  // Files whose duration differs from the first checked file → disable them.
  const mismatchedFiles = useMemo(
    () => findDurationMismatches(checkedFiles),
    [checkedFiles]
  );
  const mismatchedIds = useMemo(
    () => new Set(mismatchedFiles.map((f) => f.id)),
    [mismatchedFiles]
  );

  const handleToggle = (id: string) => {
    const next = new Set(checkedIds);
    if (next.has(id)) {
      next.delete(id);
      setErrorMsg(null);
      setCheckedIds(next);
      // reset view fs if it's no longer a valid stop
      setViewFs(null);
      return;
    }

    const candidate = files.find((f) => f.id === id);
    if (!candidate) return;

    // Enforce same duration across all checked files.
    if (checkedFiles.length > 0) {
      const ref = checkedFiles[0].duration;
      if (candidate.duration !== ref) {
        setErrorMsg(
          `✖ "${candidate.name}" has duration ${candidate.duration}s but the ` +
            `selected group uses ${ref}s. Curves with different durations ` +
            `cannot be compared. Uncheck the others first.`
        );
        return;
      }
    }

    next.add(id);
    setErrorMsg(null);
    setCheckedIds(next);
    setViewFs(null); // recompute to new max by default
  };

  const handleRemove = (id: string) => {
    removeFile(id);
    setCheckedIds((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
    setViewFs(null);
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 p-4 text-slate-100">
      <h4 className="text-2xl font-semibold">Log file comparison</h4>

      {/* Rejected files banner */}
      {rejected.length > 0 && (
        <div className="rounded-md border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-200">
          <div className="mb-1 flex items-center justify-between">
            <strong>Some files were rejected:</strong>
            <button
              onClick={dismissRejected}
              className="text-xs text-red-300 hover:text-red-100"
            >
              dismiss
            </button>
          </div>
          <ul className="list-disc space-y-0.5 pl-5">
            {rejected.map((r, i) => (
              <li key={i}>
                <span className="font-mono">{r.name}</span> —{' '}
                {r.errors.join('; ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Duration mismatch red banner */}
      {errorMsg && (
        <div className="flex items-start gap-2 rounded-md border-2 border-red-500 bg-red-600/20 p-3 text-sm font-medium text-red-100">
          <span className="text-lg leading-none">⛔</span>
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-6">
        {/* Left column: chart + slider + info */}
        <div className="min-w-0 space-y-3">
          <VariableSelector value={variable} onChange={setVariable} />

          <ComparisonChart
            curves={curves}
            duration={checkedFiles[0]?.duration ?? 0}
            meta={VARIABLE_META[variable]}
          />

          {effectiveFs != null && (
            <SamplingSlider
              stops={fsStops}
              value={effectiveFs}
              onChange={setViewFs}
            />
          )}

          <VariableInfoPanel variable={variable} />
        </div>

        {/* Right column: files */}
        <aside className="space-y-3 self-start rounded-md border border-slate-700 bg-slate-900/60 p-3 lg:sticky lg:top-4">
          <h2 className="text-sm font-semibold text-slate-200">
            Log files ({files.length})
          </h2>

          <FileList
            files={files}
            checkedIds={checkedIds}
            colorByFileId={colorByFileId}
            onToggle={handleToggle}
            onRemove={handleRemove}
            disabledIds={mismatchedIds}
          />

          <FileUploader onFiles={addFiles} />
        </aside>
      </div>
    </div>
  );
}