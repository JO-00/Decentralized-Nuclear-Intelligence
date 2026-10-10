import type { LogFile } from '../types';
import { colorForIndex } from '../ChartColors';

interface Props {
  files: LogFile[];
  checkedIds: Set<string>;
  colorByFileId: Map<string, string>;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  disabledIds: Set<string>;
}

export function FileList({
  files,
  checkedIds,
  colorByFileId,
  onToggle,
  onRemove,
  disabledIds,
}: Props) {
  if (files.length === 0) {
    return (
      <p className="text-xs text-slate-500">
        No files uploaded yet.
      </p>
    );
  }

  return (
    <ul className="space-y-1">
      {files.map((f, i) => {
        const checked = checkedIds.has(f.id);
        const disabled = disabledIds.has(f.id) && !checked;
        const color = colorByFileId.get(f.id) ?? colorForIndex(i);
        return (
          <li
            key={f.id}
            className={`flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm transition ${
              checked
                ? 'border-indigo-500/60 bg-indigo-500/10'
                : 'border-slate-700 bg-slate-800/40 hover:bg-slate-800'
            } ${disabled ? 'opacity-40' : ''}`}
          >
            <input
              type="checkbox"
              checked={checked}
              disabled={disabled}
              onChange={() => onToggle(f.id)}
              className="h-4 w-4 accent-indigo-500"
            />
            <span
              className="h-3 w-3 shrink-0 rounded-sm"
              style={{ backgroundColor: checked ? color : '#475569' }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-slate-200" title={f.name}>
                {f.name}
              </p>
              <p className="text-[11px] text-slate-500">
                {f.duration}s ·{' '}
                {Object.keys(f.variables).length} var
                {Object.keys(f.variables).length === 1 ? '' : 's'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRemove(f.id)}
              className="rounded px-1.5 text-xs text-slate-500 hover:bg-slate-700 hover:text-red-300"
              title="Remove"
            >
              ✕
            </button>
          </li>
        );
      })}
    </ul>
  );
}