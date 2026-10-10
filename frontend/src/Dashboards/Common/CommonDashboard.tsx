import { useState } from 'react';
import { SystemOverviewCard } from './SystemOverview';
import { ModelPage } from './ModelOverview';
import { RequestsOverview } from './RequestsOverview';
import { VotePage } from './../../Components/Files/FetchModelFile';

type Tab = 'overview' | 'models' | 'requests' | 'vote';

const TABS: { id: Tab; label: string; hint: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', hint: 'System state at a glance', icon: '◎' },
  { id: 'models', label: 'Models', hint: 'Registered ML models', icon: '◈' },
  { id: 'requests', label: 'Requests', hint: 'Inquirer activity', icon: '⇄' },
  { id: 'vote', label: 'Vote', hint: 'upvote/downvote a model or a logfile', icon: '⬡' },
];

export function CommonDashboard() {
  const [tab, setTab] = useState<Tab>('overview');
  const active = TABS.find((t) => t.id === tab)!;

  return (
    <div className="grid min-h-[80vh] grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      {/* Sidebar */}
      <aside className="self-start rounded-xl border border-slate-800 bg-slate-900/60 p-2 lg:sticky lg:top-4">
        <nav className="flex flex-row gap-1 lg:flex-col">
          {TABS.map((t) => {
            const isActive = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`group relative flex flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition lg:flex-none ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/20 to-fuchsia-500/10 text-white'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                }`}
              >
                {/* Active accent bar */}
                <span
                  className={`absolute left-0 top-1/2 hidden h-6 -translate-y-1/2 rounded-r-full transition-all lg:block ${
                    isActive
                      ? 'w-1 bg-gradient-to-b from-indigo-400 to-fuchsia-400'
                      : 'w-0 bg-transparent'
                  }`}
                />
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-md text-xs transition ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-200'
                      : 'bg-slate-800/60 text-slate-500 group-hover:text-slate-300'
                  }`}
                >
                  {t.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{t.label}</span>
                  <span
                    className={`hidden text-[11px] leading-tight lg:block ${
                      isActive ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {t.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <section className="min-w-0">
        <header className="mb-4 flex items-baseline justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-100">
              {active.label}
            </h2>
            <p className="text-xs text-slate-500">{active.hint}</p>
          </div>
          <span className="rounded-full border border-slate-700 bg-slate-900/70 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-400">
            observe
          </span>
        </header>

        <div className="min-w-0">
          {tab === 'overview' && <SystemOverviewCard />}
          {tab === 'models' && <ModelPage />}
          {tab === 'requests' && <RequestsOverview />}
          {tab === 'vote' && <VotePage />}
        </div>
      </section>
    </div>
  );
}