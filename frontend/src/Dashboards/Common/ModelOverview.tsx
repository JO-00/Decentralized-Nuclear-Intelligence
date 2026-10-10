import { useState } from 'react';
import { ContractCall } from '../../HashGraphUtils/ContractCall';
import { ModelDetails } from '../../HashGraphUtils/types';

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

function toIpfsUrl(ref: string): string | null {
  if (!ref) return null;
  const cid = ref.replace(/^ipfs:\/\//, '').replace(/^\/?ipfs\//, '').trim();
  if (!cid) return null;
  return `${IPFS_GATEWAY}${cid}`;
}

function IpfsLink({ ipfsRef }: { ipfsRef: string }) {
  const url = toIpfsUrl(ipfsRef);
  if (!url) return <span className="text-neutral-500">—</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="text-sky-400 underline hover:text-sky-300 break-all"
    >
      Download
    </a>
  );
}

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

  

  return (
    <div className="mx-auto max-w-2xl rounded-lg bg-neutral-900 p-6 font-sans text-neutral-200">
      <h2 className="mb-3 text-lg font-semibold">Model Lookup</h2>

      <div className="mb-3 flex gap-2">
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Model owner address"
          className="flex-1 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-500"
        />
        <button
          onClick={handleSearch}
          disabled={!address || loading}
          className="rounded-md bg-green-700 px-4 py-2 text-sm text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      {error && <p className="text-sm text-red-400">Error: {error}</p>}

      {registered === false && (
        <p className="text-sm text-neutral-500">Not registered.</p>
      )}

      {registered === true && model && (
        <div className="mt-3 flex flex-col gap-2 rounded-md border border-neutral-800 bg-neutral-950 p-4 text-sm">
          <Row label="Owner">
            <span className="break-all font-mono">{model.modelOwner}</span>
          </Row>
          <Row label="IPFS">
            <IpfsLink ipfsRef={model.ipfsRef} />
          </Row>
          <Row label="Reputation">{model.reputation.toString()}</Row>
          <Row label="Report count">{model.reportCount.toNumber()}</Row>
          <Row label="Exists">{model.exists ? 'yes' : 'no'}</Row>
        </div>
      )}

      <hr className="my-6 border-neutral-800" />


    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="min-w-[110px] text-neutral-500">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}