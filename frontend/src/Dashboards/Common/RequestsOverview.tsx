import { useState } from 'react';
import { ContractCall } from '../../HashGraphUtils/ContractCall';
import { InquirerDetails } from '../../HashGraphUtils/types';

export function RequestsOverview() {
  const [address, setAddress] = useState('');
  const [profile, setProfile] = useState<InquirerDetails | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [requests, setRequests] = useState<string[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  const PAGE_SIZE = 5;

  const handleFetchProfile = async () => {
    setLoadingProfile(true);
    setProfileError(null);
    setProfile(null);
    setRequests([]);
    setTotal(0);

    try {
      const details = await ContractCall.getInquirerFullProfile(address);
      setProfile(details);
      setTotal(details.totalRequests.toNumber());
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleFetchRequests = async () => {
    if (!profile) return;

    setLoadingRequests(true);
    setRequestsError(null);

    try {
      const result = await ContractCall.getPaginatedInquirerRequests(
        address,
        0,
        PAGE_SIZE
      );
      setRequests(result.paginatedRequests);
      setTotal(result.total.toNumber());
    } catch (e) {
      setRequestsError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleFetchMore = async () => {
    if (!profile) return;

    setLoadingRequests(true);
    setRequestsError(null);

    try {
      const result = await ContractCall.getPaginatedInquirerRequests(
        address,
        requests.length,
        PAGE_SIZE
      );
      setRequests((prev) => [...prev, ...result.paginatedRequests]);
      setTotal(result.total.toNumber());
    } catch (e) {
      setRequestsError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingRequests(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-lg">
      <h2 className="mb-4 text-2xl font-semibold text-slate-100">
        Requests Overview
      </h2>

      <div className="flex gap-2">
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
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
            onClick={handleFetchRequests}
            disabled={loadingRequests}
            className="mt-3 rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
          >
            {loadingRequests && requests.length === 0 ? 'Loading…' : 'Get Requests'}
          </button>
        </div>
      )}

      {requestsError && (
        <p className="mt-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          Error: {requestsError}
        </p>
      )}

      {requests.length > 0 && (
        <>
          <div className="mt-3 max-h-[300px] overflow-y-auto rounded-md border border-slate-700 bg-slate-800/40">
            <ul className="divide-y divide-slate-700/60">
              {requests.map((ref, i) => (
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
              disabled={loadingRequests || requests.length >= total}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {loadingRequests ? 'Loading…' : '+5'}
            </button>

            <span className="text-sm text-slate-400">
              {requests.length} / {total}
            </span>
          </div>
        </>
      )}
    </div>
  );
}