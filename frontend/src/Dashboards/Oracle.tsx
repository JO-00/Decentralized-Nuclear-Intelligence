import { useState } from 'react';
import { LogFileUpload } from './../Components/Oracle/UploadLogFileForm';
import { ModelFileUpload } from './../Components/User/UploadModelFileForm';
import {Register} from '../Components/Oracle/Register';

type Form = 'log' | 'model' | 'register' | null;

export function OracleDashboard() {
  const [form, setForm] = useState<Form>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-100">
          Oracle dashboard
        </h2>
        <p className="text-xs text-slate-500">
          Register IPFS references for log files and models. Upload your files
          to IPFS first, then submit the CID here.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <ActionButton
          active={form === 'log'}
          onClick={() => setForm('log')}
          icon="≡"
          label="Log file reference"
        />
        <ActionButton
          active={form === 'model'}
          onClick={() => setForm('model')}
          icon="◈"
          label="Model reference"
        />
        <ActionButton
          active={form === 'register'}
          onClick={() => setForm('register')}
          icon="≡"
          label="Not an Oracle yet ?"
        />
        {form !== null && (
          <button
            onClick={() => setForm(null)}
            className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-700 bg-slate-900/60 text-slate-400 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300"
            title="Close"
            aria-label="Close form"
          >
            ✕
          </button>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0">
        {form === 'log' && <LogFileUpload />}
        {form === 'model' && <ModelFileUpload />}
        {form === 'register' && <Register />}

        {form === null && (
          <div className="grid place-items-center rounded-lg border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center">
            <p className="text-xs text-slate-500">
              Pick a reference type above to register it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`group inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition ${
        active
          ? 'border-transparent bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-sm shadow-indigo-500/30'
          : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800/70 hover:text-slate-100'
      }`}
    >
      <span
        className={`grid h-6 w-6 place-items-center rounded text-xs ${
          active
            ? 'bg-white/15 text-white'
            : 'bg-slate-800/70 text-slate-400 group-hover:text-slate-200'
        }`}
      >
        {icon}
      </span>
      {label}
    </button>
  );
}