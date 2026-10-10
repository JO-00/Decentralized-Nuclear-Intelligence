import { useState } from 'react';
import { CommonDashboard } from './Dashboards/Common/CommonDashboard';
import { RoleIdentification } from './Dashboards/Auth';

import { LabView , SegButton , TabButton } from './utils';
import './App.css';

type Mode = 'observe' | 'mutate';
type Tab = 'dashboard' | 'lab';
type LabView = 'files' | 'models';

function App() {
  const [mode, setMode] = useState<Mode>('observe');
  const [tab, setTab] = useState<Tab>('dashboard');
  const [labView, setLabView] = useState<LabView>('files');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top nav */}
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/30">
              N
            </span>
            <h1 className="text-base font-semibold tracking-tight">
              Nuclear Control
            </h1>
          </div>

          {/* Main tabs */}
          <nav className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1">
            <TabButton active={tab === 'dashboard'} onClick={() => setTab('dashboard')}>
              Dashboard
            </TabButton>
            <TabButton active={tab === 'lab'} onClick={() => setTab('lab')}>
              Lab
            </TabButton>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-[1600px] px-6 py-6">
        {tab === 'dashboard' && (
          <div className="space-y-6">
            {/* Observe / Mutate switch */}
            <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900/60 p-1">
              <SegButton active={mode === 'observe'} onClick={() => setMode('observe')}>
                Observe
              </SegButton>
              <SegButton active={mode === 'mutate'} onClick={() => setMode('mutate')}>
                Mutate
              </SegButton>
            </div>

            <section>
              {mode === 'observe' && <CommonDashboard />}
              {mode === 'mutate' && <RoleIdentification />}
            </section>
          </div>
        )}

        {tab === 'lab' && (
          <LabView
            view={labView}
            onChangeView={setLabView}
          />
        )}
      </main>
    </div>
  );
}

export default App;

/* ---------- Small presentational bits ---------- */

