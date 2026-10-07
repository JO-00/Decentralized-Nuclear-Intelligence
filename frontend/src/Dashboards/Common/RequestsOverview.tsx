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
    <div>
      <h2>Requests Overview</h2>

      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Inquirer address"
      />
      <button onClick={handleFetchProfile} disabled={!address || loadingProfile}>
        {loadingProfile ? 'Loading…' : 'Fetch Inquirer'}
      </button>

      {profileError && <p>Error: {profileError}</p>}

      {profile && (
        <div>
          <p>Inquirer: {profile.inquirer}</p>
          <p>Total requests: {profile.totalRequests.toString()}</p>
          <p>Has active request: {profile.hasActiveRequest ? 'yes' : 'no'}</p>
          <p>Log files: {profile.logFiles.length}</p>

          <button onClick={handleFetchRequests} disabled={loadingRequests}>
            {loadingRequests && requests.length === 0 ? 'Loading…' : 'Get Requests'}
          </button>
        </div>
      )}

      {requestsError && <p>Error: {requestsError}</p>}

      {requests.length > 0 && (
        <>
          <div
            style={{
              maxHeight: 300,
              overflowY: 'auto',
              border: '1px solid #ccc',
              marginTop: 12,
            }}
          >
            <ul>
              {requests.map((ref, i) => (
                <li key={i}>{ref}</li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleFetchMore}
            disabled={loadingRequests || requests.length >= total}
          >
            {loadingRequests ? 'Loading…' : '+5'}
          </button>

          <span>
            {' '}
            {requests.length} / {total}
          </span>
        </>
      )}
    </div>
  );
}
