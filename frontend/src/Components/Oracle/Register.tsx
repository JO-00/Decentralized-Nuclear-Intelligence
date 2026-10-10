import { useState } from "react";
import { HederaWalletConnect } from "./../../HashGraphUtils/getHederaSigner";
import { HandleForm } from "../../Features/Oracle/Apply";

type Phase = "idle" | "checking";



export function Register() {
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const { signer, isConnected } = HederaWalletConnect();

  const busy = phase !== "idle";

  const handleApply = async () => {
    setError(null);
    setPhase("checking");

    try {
      if (!signer) {
        throw new Error(
          "Wallet not connected. Please connect your wallet first."
        );
      }
      await HandleForm(signer);
      setPhase("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPhase("idle");
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold text-slate-100">
          Register as oracle
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Apply to become an oracle. Your connected wallet will be submitted.
        </p>
      </div>

      <button
        type="button"
        onClick={handleApply}
        disabled={busy || !isConnected}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-500/30 transition hover:from-indigo-400 hover:to-fuchsia-400 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 disabled:shadow-none"
      >
        {busy && (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        Apply
      </button>

      {!isConnected && (
        <StatusRow tone="muted" icon="◌">
          Connecting wallet…
        </StatusRow>
      )}
      {phase === "checking" && (
        <StatusRow tone="info" icon="◌" spin>
          Submitting application…
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