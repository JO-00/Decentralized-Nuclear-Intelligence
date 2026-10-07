import { useState } from 'react';
import { ContractCall } from '../../HashGraphUtils/ContractCall';
import { ModelDetails } from '../../HashGraphUtils/types';

export function ModelPage() {
  const [address, setAddress] = useState('');
  const [model, setModel] = useState<ModelDetails | null>(null);
  const [registered, setRegistered] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [batchInput, setBatchInput] = useState('');
  const [batch, setBatch] = useState<ModelDetails[] | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setModel(null);
    setRegistered(null);

    try {
      const exists = await ContractCall.isModelRegistered(address);
      setRegistered(exists);

      if (exists) {
        const details = await ContractCall.getModelFullDetails(address);
        setModel(details);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleFetchBatch = async () => {
    setBatchLoading(true);
    setBatchError(null);
    setBatch(null);

    try {
      const owners = batchInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const results = await ContractCall.getBatchModelDetails(owners);
      setBatch(results);
    } catch (e) {
      setBatchError(e instanceof Error ? e.message : String(e));
    } finally {
      setBatchLoading(false);
    }
  };

  return (
    <div>
      <h2>Model Lookup</h2>

      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Model owner address"
      />
      <button onClick={handleSearch} disabled={!address || loading}>
        {loading ? 'Searching…' : 'Search'}
      </button>

      {error && <p>Error: {error}</p>}

      {registered === false && <p>Not registered.</p>}

      {registered === true && model && (
        <div>
          <p>Registered: yes</p>
          <p>Owner: {model.modelOwner}</p>
          <p>IPFS ref: {model.ipfsRef}</p>
          <p>Reputation: {model.reputation.toString()}</p>
          <p>Report count: {model.reportCount.toNumber()}</p>
          <p>Exists: {model.exists ? 'yes' : 'no'}</p>
        </div>
      )}

      <hr />

      <h2>Batch Models</h2>

      <input
        value={batchInput}
        onChange={(e) => setBatchInput(e.target.value)}
        placeholder="Comma-separated addresses"
        style={{ width: 400 }}
      />
      <button onClick={handleFetchBatch} disabled={!batchInput || batchLoading}>
        {batchLoading ? 'Fetching…' : 'Fetch Batch'}
      </button>

      {batchError && <p>Error: {batchError}</p>}

      {batch && (
        <ul>
          {batch.map((m, i) => (
            <li key={i}>
              {m.modelOwner} — rep {m.reputation.toString()} — reports {m.reportCount.toNumber()} —{' '}
              {m.exists ? 'registered' : 'not registered'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
