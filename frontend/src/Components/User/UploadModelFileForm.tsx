import { useState } from "react";
import { HandleForm  , handleQueryReactorState} from "./../../Features/User/UploadModelFileFormHandler";
import { HederaWalletConnect } from "./../../HashGraphUtils/getHederaSigner";

type Phase = "idle" | "checking" | "found" | "saving";
type QueryPhase = "idle" | "querying";


export function ModelFileUpload() {
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const { signer, isConnected } = HederaWalletConnect();

  const busy = phase !== "idle";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setPhase("checking");

    const data = new FormData(e.currentTarget);
    try {
      if (!signer) {
        throw new Error("Wallet not connected. Please connect your wallet first.");
      }

      await HandleForm(signer, data, {
        onCidVerified: () => {
          setPhase("found");
          // hold "found" for ~1s before switching to "saving"
          return new Promise<void>((resolve) => setTimeout(resolve, 1000));
        },
      });
      setPhase("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPhase("idle");
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4">
      {/* Model upload form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm"
      >
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            Upload model file
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Reference an existing model on IPFS.
          </p>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="ModelIpfsRef"
            className="block text-[11px] font-medium uppercase tracking-wider text-slate-400"
          >
            Model IPFS Ref (CID)
          </label>
          <input
            id="ModelIpfsRef"
            name="ModelIpfsRef"
            placeholder="Qm… or bafy…"
            required
            className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 font-mono text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        <button
          type="submit"
          disabled={busy || !isConnected}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-500/30 transition hover:from-indigo-400 hover:to-fuchsia-400 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 disabled:shadow-none"
        >
          {busy && (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          Submit
        </button>

        {/* Status line */}
        {!isConnected && (
          <StatusRow tone="muted" icon="◌">
            Connecting wallet…
          </StatusRow>
        )}
        {phase === "checking" && (
          <StatusRow tone="info" icon="◌" spin>
            Checking model…
          </StatusRow>
        )}
        {phase === "found" && (
          <StatusRow tone="success" icon="✓">
            Model successfully found
          </StatusRow>
        )}
        {phase === "saving" && (
          <StatusRow tone="info" icon="◌" spin>
            Saving model…
          </StatusRow>
        )}

        {error && (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-red-300">
              Error
            </p>
            <pre className="whitespace-pre-wrap break-words font-mono text-xs text-red-200">
              {error}
            </pre>
          </div>
        )}
      </form>

      {/* Query reactor state — independent bubble */}
      <QueryReactorStateCard />
    </div>
  );
}

/* ---------- independent query card ---------- */

function QueryReactorStateCard() {
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<QueryPhase>("idle");
  const { signer, isConnected } = HederaWalletConnect();

  const busy = phase !== "idle";

  const handleQuery = async () => {
    setError(null);
    setPhase("querying");

    try {
      if (!signer) {
        throw new Error("Wallet not connected. Please connect your wallet first.");
      }
      await handleQueryReactorState(signer);
      setPhase("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPhase("idle");
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold text-slate-100">
          Reactor state
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Fetch the current state from the contract.
        </p>
      </div>

      <button
        type="button"
        onClick={handleQuery}
        disabled={busy || !isConnected}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-500/30 transition hover:from-indigo-400 hover:to-fuchsia-400 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 disabled:shadow-none"
      >
        {busy && (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        Query reactor state
      </button>

      {!isConnected && (
        <StatusRow tone="muted" icon="◌">
          Connecting wallet…
        </StatusRow>
      )}
      {phase === "querying" && (
        <StatusRow tone="info" icon="◌" spin>
          Querying reactor state…
        </StatusRow>
      )}

      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-red-300">
            Error
          </p>
          <pre className="whitespace-pre-wrap break-words font-mono text-xs text-red-200">
            {error}
          </pre>
        </div>
      )}
    </div>
  );
}

/* Small status pill used for wallet/phase feedback */
function StatusRow({
  tone,
  icon,
  spin = false,
  children,
}: {
  tone: "muted" | "info" | "success";
  icon: string;
  spin?: boolean;
  children: React.ReactNode;
}) {
  const tones: Record<typeof tone, string> = {
    muted: "border-slate-700 bg-slate-800/50 text-slate-400",
    info: "border-indigo-500/40 bg-indigo-500/10 text-indigo-200",
    success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  };
  return (
    <div
      className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs ${tones[tone]}`}
    >
      <span className={spin ? "animate-spin" : ""}>{icon}</span>
      <span>{children}</span>
    </div>
  );
}