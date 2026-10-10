import { useState } from "react";
import { handleLogFileVote, handleModelVote } from "./../../Features/User/Voting";
import { VoteSearchPanel } from "./../../Features/User/VoteSearchPanel";
import { HederaWalletConnect } from "./../../HashGraphUtils/getHederaSigner";

type Vote = 1 | -1;

export function VotePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
          Vote
        </h1>
        <p className="text-xs text-slate-500">
          Upvote or downvote log files and models registered on the network.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <LogFileVoteBubble />
        <ModelVoteBubble />
      </div>

      <VoteSearchPanel />
    </div>
  );
}

/* ---------- Log file vote ---------- */

function LogFileVoteBubble() {
  const { signer, isConnected } = HederaWalletConnect();
  const [inquirer, setInquirer] = useState("");
  const [ipfsRef, setIpfsRef] = useState("");
  const [loading, setLoading] = useState<Vote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Vote | null>(null);

  const busy = loading !== null;
  const canVote =
    inquirer.trim() !== "" && ipfsRef.trim() !== "" && !busy && isConnected;

  const submit = async (vote: Vote) => {
    setLoading(vote);
    setError(null);
    setSuccess(null);

    try {
      if (!signer) {
        throw new Error("Wallet not connected. Please connect your wallet first.");
      }
      await handleLogFileVote(signer, vote, inquirer.trim(), ipfsRef.trim());
      setSuccess(vote);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold text-slate-100">Log file</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Cast a vote on a specific inquirer's log file.
        </p>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="vote-inquirer"
          className="block text-[11px] font-medium uppercase tracking-wider text-slate-400"
        >
          Inquirer
        </label>
        <input
          id="vote-inquirer"
          value={inquirer}
          onChange={(e) => setInquirer(e.target.value)}
          placeholder="0.0.1234567 or 0x…"
          spellCheck={false}
          autoComplete="off"
          className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 font-mono text-xs text-slate-100 placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="vote-ipfsRef"
          className="block text-[11px] font-medium uppercase tracking-wider text-slate-400"
        >
          Log file IPFS reference (CID)
        </label>
        <input
          id="vote-ipfsRef"
          value={ipfsRef}
          onChange={(e) => setIpfsRef(e.target.value)}
          placeholder="Qm… or bafy…"
          spellCheck={false}
          autoComplete="off"
          className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 font-mono text-xs text-slate-100 placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => submit(1)}
          disabled={!canVote}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:border-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-100 disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-900/40 disabled:text-slate-500"
        >
          {loading === 1 ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-300/40 border-t-emerald-200" />
          ) : (
            <span>▲</span>
          )}
          Upvote
        </button>

        <button
          type="button"
          onClick={() => submit(-1)}
          disabled={!canVote}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition hover:border-red-400 hover:bg-red-500/20 hover:text-red-100 disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-900/40 disabled:text-slate-500"
        >
          {loading === -1 ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-300/40 border-t-red-200" />
          ) : (
            <span>▼</span>
          )}
          Downvote
        </button>
      </div>

      {!isConnected && (
        <StatusRow tone="muted" icon="◌">
          Connecting wallet…
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

      {success !== null && (
        <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
          {success === 1 ? "Upvote" : "Downvote"} recorded.
        </p>
      )}
    </div>
  );
}

/* ---------- Model vote ---------- */

function ModelVoteBubble() {
  const { signer, isConnected } = HederaWalletConnect();
  const [owner, setOwner] = useState("");
  const [loading, setLoading] = useState<Vote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Vote | null>(null);

  const busy = loading !== null;
  const canVote = owner.trim() !== "" && !busy && isConnected;

  const submit = async (vote: Vote) => {
    setLoading(vote);
    setError(null);
    setSuccess(null);

    try {
      if (!signer) {
        throw new Error("Wallet not connected. Please connect your wallet first.");
      }
      await handleModelVote(signer, vote, owner.trim());
      setSuccess(vote);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold text-slate-100">Model</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Cast a vote on a model by its owner's address.
        </p>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="vote-owner"
          className="block text-[11px] font-medium uppercase tracking-wider text-slate-400"
        >
          Model owner
        </label>
        <input
          id="vote-owner"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          placeholder="0.0.1234567 or 0x…"
          spellCheck={false}
          autoComplete="off"
          className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 font-mono text-xs text-slate-100 placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => submit(1)}
          disabled={!canVote}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:border-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-100 disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-900/40 disabled:text-slate-500"
        >
          {loading === 1 ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-300/40 border-t-emerald-200" />
          ) : (
            <span>▲</span>
          )}
          Upvote
        </button>

        <button
          type="button"
          onClick={() => submit(-1)}
          disabled={!canVote}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition hover:border-red-400 hover:bg-red-500/20 hover:text-red-100 disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-900/40 disabled:text-slate-500"
        >
          {loading === -1 ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-300/40 border-t-red-200" />
          ) : (
            <span>▼</span>
          )}
          Downvote
        </button>
      </div>

      {!isConnected && (
        <StatusRow tone="muted" icon="◌">
          Connecting wallet…
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

      {success !== null && (
        <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
          {success === 1 ? "Upvote" : "Downvote"} recorded.
        </p>
      )}
    </div>
  );
}

/* ---------- Small status pill (copied from ModelFileUpload) ---------- */

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