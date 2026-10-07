import { useEffect, useState } from 'react';
import { ContractCall } from '../../HashGraphUtils/ContractCall';
import { SystemOverview } from '../../HashGraphUtils/types';

export function SystemOverviewCard() {
  const [data, setData] = useState<SystemOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ContractCall.getSystemOverview()
      .then(setData)
      .catch((e: unknown) => {
        if (e instanceof Error) {
          console.error("getSystemOverview failed:", e);
          console.error("Stack:", e.stack);
          setError(e.message);
        } else {
          console.error("Non-Error thrown:", e);
          setError(String(e));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Error: {error}</p>;
  if (!data) return null;

  return (
    <div>
      <p>Total oracles: {data.totalOracles}</p>
      <p>Request fee: {data.requestFee.toString()}</p>
      <p>Model proposal fee: {data.modelProposalFee.toString()}</p>
      <p>Owner: {data.owner}</p>
    </div>
  );
}
