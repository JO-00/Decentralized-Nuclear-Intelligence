import { LogFileComparison } from './Dashboards/LogFileCharts/LogFileComparison';
import { AnalyzeModels  , GenerateDataset} from './Dashboards/AnalyzeModels/AnalyzeModels';
type LabView = 'files' | 'models' | 'dataset';

export function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
        active
          ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/40'
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

export function SegButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
        active
          ? 'bg-slate-100 text-slate-900'
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

/* ---------- Lab screen ---------- */

export function LabView({
  view,
  onChangeView,
}: {
  view: LabView;
  onChangeView: (v: LabView) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Lab</h2>
        <p className="text-sm text-slate-400">
          Explore log files or trained models.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900/60 p-1">
        <LabTab active={view === 'files'} onClick={() => onChangeView('files')}>
          Analyze log files
        </LabTab>
        <LabTab active={view === 'models'} onClick={() => onChangeView('models')}>
          Analyze models
        </LabTab>
        <LabTab active={view === 'dataset'} onClick={() => onChangeView('dataset')}>
          Customize Dataset
        </LabTab>
      </div>

      <section>
        {view === 'files' && <LogFileComparison />}
        {view === 'models' && <AnalyzeModels />}
        {view === 'dataset' && <GenerateDataset /> }
      </section>
    </div>
  );
}

function LabTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
        active
          ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-sm shadow-indigo-500/40'
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}