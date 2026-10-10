import { useState } from 'react';
import { ContractCall } from '../../HashGraphUtils/ContractCall';
import { InquirerDetails } from '../../HashGraphUtils/types';
import { HederaWalletConnect } from '../../HashGraphUtils/getHederaSigner';
import { ContractModify } from '../../HashGraphUtils/ContractModify';

export function RequestsOverview() {
  const { signer, isConnected } = HederaWalletConnect();

  const [address, setAddress] = useState('');
  const [profile, setProfile] = useState<InquirerDetails | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileFetched, setProfileFetched] = useState(false);

  // Responses state (strings)
  const [responses, setResponses] = useState<string[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [responsesError, setResponsesError] = useState<string | null>(null);
  const [responsesFetched, setResponsesFetched] = useState(false);

  // Respond state
  const [respondRef, setRespondRef] = useState('');
  const [responding, setResponding] = useState(false);
  const [respondError, setRespondError] = useState<string | null>(null);
  const [respondSuccess, setRespondSuccess] = useState(false);

  const PAGE_SIZE = 5;

  const handleFetchProfile = async () => {
    setLoadingProfile(true);
    setProfileError(null);
    setProfile(null);
    setResponses([]);
    setTotal(0);
    setProfileFetched(false);

    try {
      const details = await ContractCall.getInquirerFullProfile(address);
      setProfile(details);
      setTotal(details.totalRequests.toNumber());
      setProfileFetched(true);
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleFetchResponses = async () => {
    if (!profile) return;

    setLoadingResponses(true);
    setResponsesError(null);
    setResponsesFetched(false);

    try {
      const result = await ContractCall.getPaginatedInquirerResponses(
        address,
        0,
        PAGE_SIZE
      );
      setResponses(result.paginatedRequests);
      setTotal(result.total.toNumber());
      setResponsesFetched(true);
    } catch (e) {
      setResponsesError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingResponses(false);
    }
  };

  const handleFetchMore = async () => {
    if (!profile) return;

    setLoadingResponses(true);
    setResponsesError(null);

    try {
      const result = await ContractCall.getPaginatedInquirerResponses(
        address,
        responses.length,
        PAGE_SIZE
      );
      setResponses((prev) => [...prev, ...result.paginatedRequests]);
      setTotal(result.total.toNumber());
    } catch (e) {
      setResponsesError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingResponses(false);
    }
  };

  const handleRespond = async () => {
    setResponding(true);
    setRespondError(null);
    setRespondSuccess(false);

    try {
      if (!signer) {
        throw new Error("Wallet not connected. Please connect your wallet first.");
      }
      await ContractModify.handleResponse(signer, address, respondRef.trim());
      setRespondSuccess(true);
      setRespondRef('');
    } catch (e) {
      setRespondError(e instanceof Error ? e.message : String(e));
    } finally {
      setResponding(false);
    }
  };
  function checkSubmit(event: string) {
    handleFetchProfile();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-lg">
        <h2 className="mb-4 text-2xl font-semibold text-slate-100">
          Requests Overview
        </h2>

        {/* Inquirer fetch */}
        <div className="flex gap-2">
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(event) => checkSubmit(event.key)}
            placeholder="Inquirer address"
            className="flex-1 rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
          />
          <button
            onClick={handleFetchProfile}
            disabled={!address || loadingProfile}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {loadingProfile ? 'Loading…' : 'Fetch Inquirer'}
          </button>
        </div>

        {profileError && (
          <p className="mt-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            Error: {profileError}
          </p>
        )}

        {profileFetched && !profile && (
          <p className="mt-3 rounded-md border border-slate-700 bg-slate-800/40 px-3 py-6 text-center text-xs text-slate-500">
            No inquirer found at this address.
          </p>
        )}

        {profile && (
          <div className="mt-4 space-y-1 rounded-md border border-slate-700 bg-slate-800/60 p-4 text-sm text-slate-300">
            <p>
              <span className="font-medium text-slate-100">Inquirer:</span>{' '}
              <span className="break-all font-mono text-xs text-slate-200">
                {profile.inquirer}
              </span>
            </p>
            <p>
              <span className="font-medium text-slate-100">Total requests:</span>{' '}
              {profile.totalRequests.toString()}
            </p>
            <p>
              <span className="font-medium text-slate-100">Has active request:</span>{' '}
              <span
                className={
                  profile.hasActiveRequest
                    ? 'font-medium text-amber-400'
                    : 'font-medium text-emerald-400'
                }
              >
                {profile.hasActiveRequest ? 'yes' : 'no'}
              </span>
            </p>
            <p>
              <span className="font-medium text-slate-100">Log files:</span>{' '}
              {profile.logFiles.length}
            </p>

            <button
              onClick={handleFetchResponses}
              disabled={loadingResponses}
              className="mt-3 rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
            >
              {loadingResponses && responses.length === 0 ? 'Loading…' : 'Get Responses'}
            </button>

            {/* Respond — CID input + Respond button */}
            <div className="mt-3 space-y-2">
              <input
                value={respondRef}
                onChange={(e) => setRespondRef(e.target.value)}
                placeholder="IPFS reference (Qm… or bafy…)"
                spellCheck={false}
                autoComplete="off"
                className="w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 font-mono text-xs text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
              />
              <button
                onClick={handleRespond}
                disabled={!respondRef.trim() || responding || !isConnected}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-500/30 transition hover:from-indigo-400 hover:to-fuchsia-400 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 disabled:shadow-none"
              >
                {responding && (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                Respond
              </button>

              {!isConnected && (
                <StatusRow tone="muted" icon="◌">
                  Connecting wallet…
                </StatusRow>
              )}
              {respondError && (
                <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  Error: {respondError}
                </p>
              )}
              {respondSuccess && (
                <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                  Response submitted.
                </p>
              )}
            </div>
          </div>
        )}

        {responsesError && (
          <p className="mt-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            Error: {responsesError}
          </p>
        )}

        {responsesFetched && responses.length === 0 && (
          <p className="mt-3 rounded-md border border-slate-700 bg-slate-800/40 px-3 py-6 text-center text-xs text-slate-500">
            No responses found.
          </p>
        )}

        {responses.length > 0 && (
          <>
            <div className="mt-3 max-h-[300px] overflow-y-auto rounded-md border border-slate-700 bg-slate-800/40">
              <ul className="divide-y divide-slate-700/60">
                {responses.map((ref, i) => (
                  <li
                    key={i}
                    className="break-all px-3 py-2 font-mono text-xs text-slate-300 transition hover:bg-slate-700/40"
                  >
                    {ref}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={handleFetchMore}
                disabled={loadingResponses || responses.length >= total}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                {loadingResponses ? 'Loading…' : '+5'}
              </button>

              <span className="text-sm text-slate-400">
                {responses.length} / {total}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Independent bubble */}
      <RecentInquiriesBubble />
    </div>
  );
}

/* ---------- Independent bubble ---------- */

function RecentInquiriesBubble() {
  const [profiles, setProfiles] = useState<InquirerDetails[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    setProfiles(null);

    try {
      const result = await ContractCall.handleFetchRecentRequests();
      setProfiles(result as InquirerDetails[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-lg">
      <div>
        <h3 className="text-sm font-semibold text-slate-100">
          Recent inquiries
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Pull the latest inquirers and their profiles.
        </p>
      </div>

      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-500/30 transition hover:from-indigo-400 hover:to-fuchsia-400 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 disabled:shadow-none"
      >
        {loading && (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        Fetch most recent 10 requests
      </button>

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

      {profiles && profiles.length === 0 && (
        <p className="rounded-md border border-slate-700 bg-slate-800/40 px-3 py-6 text-center text-xs text-slate-500">
          No recent inquiries.
        </p>
      )}

      {profiles && profiles.length > 0 && (
        <div className="max-h-[360px] overflow-y-auto rounded-md border border-slate-700 bg-slate-800/40">
          <ul className="divide-y divide-slate-700/60">
            {profiles.map((p, i) => (
              <li
                key={`${p.inquirer}-${i}`}
                className="space-y-1 px-3 py-2.5 transition hover:bg-slate-700/30"
              >
                <p className="break-all font-mono text-xs text-slate-200">
                  {p.inquirer}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                  <span>
                    <span className="text-slate-500">requests:</span>{' '}
                    <span className="font-mono text-slate-200">
                      {p.totalRequests.toString()}
                    </span>
                  </span>
                  <span>
                    <span className="text-slate-500">active:</span>{' '}
                    <span
                      className={
                        p.hasActiveRequest
                          ? 'font-medium text-amber-400'
                          : 'font-medium text-emerald-400'
                      }
                    >
                      {p.hasActiveRequest ? 'yes' : 'no'}
                    </span>
                  </span>
                  <span>
                    <span className="text-slate-500">log files:</span>{' '}
                    <span className="font-mono text-slate-200">
                      {p.logFiles.length}
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ---------- Small status pill ---------- */

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
