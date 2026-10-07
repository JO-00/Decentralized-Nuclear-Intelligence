import { useState } from 'react';
import { SystemOverviewCard } from './SystemOverview';
import { ModelPage } from './ModelOverview';
import { RequestsOverview } from './RequestsOverview';
import {FetchIPFSCID} from "./../../Components/Files/FetchModelFile";

type Tab = 'overview' | 'models' | 'requests' | 'ipfs';

export function CommonDashboard() {
  const [tab, setTab] = useState<Tab>('overview');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div
        style={{
          width: 180,
          borderRight: '1px solid #ccc',
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <button onClick={() => setTab('overview')}>Overview</button>
        <button onClick={() => setTab('models')}>Models</button>
        <button onClick={() => setTab('requests')}>Requests</button>
        <button onClick={() => setTab('ipfs')}>IPFS</button>
      </div>

      <div style={{ flex: 1, padding: 16 }}>
        {tab === 'overview' && <SystemOverviewCard />}
        {tab === 'models' && <ModelPage />}
        {tab === 'requests' && <RequestsOverview />}
        {tab == 'ipfs' && <FetchIPFSCID /> }
      </div>
    </div>
  );
}
