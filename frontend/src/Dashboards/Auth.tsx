import { useState } from 'react';
import { AdminDashboard } from './Admin';
import { OracleDashboard } from './Oracle';
import { UserDashboard } from './User';

const ROLES = ['admin', 'oracle', 'user'] as const;
type Role = (typeof ROLES)[number];

const ROLE_META: Record<Role, { label: string; hint: string; icon: string; accent: string }> = {
  admin: {
    label: 'Admin',
    hint: 'Manage roles, contracts and system config',
    icon: '⚙',
    accent: 'from-indigo-500 to-blue-500',
  },
  oracle: {
    label: 'Oracle',
    hint: 'Feed and validate external data',
    icon: '◈',
    accent: 'from-fuchsia-500 to-purple-500',
  },
  user: {
    label: 'User',
    hint: 'Submit queries and view results',
    icon: '◉',
    accent: 'from-emerald-500 to-teal-500',
  },
};

export function RoleIdentification() {
  const [role, setRole] = useState<Role | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-100">
          Choose a role
        </h2>
        <p className="text-xs text-slate-500">
          Select the interface you want to enter.
        </p>
      </div>

      {/* Role picker */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {ROLES.map((r) => {
          const meta = ROLE_META[r];
          const isActive = role === r;
          return (
            <label
              key={r}
              className={`group relative cursor-pointer overflow-hidden rounded-xl border p-4 transition ${
                isActive
                  ? 'border-transparent bg-slate-900/80 ring-2 ring-indigo-500/60'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/70'
              }`}
            >
              {/* Gradient accent strip */}
              <span
                className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${meta.accent} transition-opacity ${
                  isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                }`}
              />

              <input
                type="radio"
                name="role"
                value={r}
                checked={isActive}
                onChange={() => setRole(r)}
                className="sr-only"
              />

              <div className="flex items-start gap-3">
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${meta.accent} text-white shadow-lg transition ${
                    isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-70 group-hover:opacity-100'
                  }`}
                >
                  {meta.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-100">
                      {meta.label}
                    </span>
                    {isActive && (
                      <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-indigo-300">
                        selected
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug text-slate-400">
                    {meta.hint}
                  </p>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {/* Content */}
      <div className="min-w-0">
        {role === 'admin' && <AdminDashboard />}
        {role === 'oracle' && <OracleDashboard />}
        {role === 'user' && <UserDashboard />}

        {role === null && (
          <div className="grid place-items-center rounded-lg border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center">
            <p className="text-xs text-slate-500">
              Pick a role above to open its dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}