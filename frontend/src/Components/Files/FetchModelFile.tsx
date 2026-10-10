import { useState } from 'react';
import { IpfsRepository } from './../../HashGraphUtils/IPFS';

export function FetchIPFSCID() {
  const [cid, setCid] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!cid) return;
    setLoading(true);
    const exists = await IpfsRepository.assertCidExists(cid);
    setLoading(false);

    if (!exists) {
      alert('CID not found');
      return;
    }

    setFiles((prev) => [...prev, cid]);
    setCid('');
  };

  const handleDownload = async (cid: string) => {
    await IpfsRepository.downloadFile(cid, cid);
  };

  const handleRemove = (cid: string) => {
    setFiles((prev) => prev.filter((c) => c !== cid));
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-100">
          Fetch from IPFS
        </h2>
        <p className="text-xs text-slate-500">
          Look up a CID, add it to your list, then download it.
        </p>
      </div>

      {/* Add row */}
      <div className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3 sm:flex-row sm:items-center">
        <input
          value={cid}
          onChange={(e) => setCid(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
          }}
          placeholder="Qm… or bafy…"
          spellCheck={false}
          autoComplete="off"
          className="flex-1 rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 font-mono text-xs text-slate-100 placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
        />
        <button
          onClick={handleAdd}
          disabled={loading || !cid}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-500/30 transition hover:from-indigo-400 hover:to-fuchsia-400 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 disabled:shadow-none"
        >
          {loading && (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {loading ? 'Checking…' : 'Add'}
        </button>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between border-b border-slate-800/80 px-3 py-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Files
          </span>
          <span className="rounded-full bg-slate-800/80 px-2 py-0.5 font-mono text-[10px] text-slate-400">
            {files.length}
          </span>
        </div>

        <div className="max-h-[320px] overflow-y-auto">
          {files.length === 0 ? (
            <p className="px-4 py-10 text-center text-xs text-slate-500">
              No files yet.
            </p>
          ) : (
            <ul className="divide-y divide-slate-800/80">
              {files.map((c) => (
                <li
                  key={c}
                  className="group flex items-center gap-3 px-3 py-2.5 transition hover:bg-slate-800/40"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-slate-800/70 text-xs text-slate-400 group-hover:text-indigo-300">
                    ⬡
                  </span>
                  <span
                    className="min-w-0 flex-1 truncate font-mono text-xs text-slate-300"
                    title={c}
                  >
                    {c}
                  </span>
                  <button
                    onClick={() => handleDownload(c)}
                    className="rounded-md border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-[11px] font-medium text-slate-300 transition hover:border-indigo-500/60 hover:bg-indigo-500/10 hover:text-indigo-200"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleRemove(c)}
                    aria-label={`Remove ${c}`}
                    className="grid h-7 w-7 place-items-center rounded-md text-slate-500 transition hover:bg-red-500/10 hover:text-red-300"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}