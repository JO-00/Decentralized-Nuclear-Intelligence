import { useState } from 'react';
import { IpfsRepository } from './../../HashGraphUtils/IPFS';

export function FetchIPFSCID() {
  const [cid, setCid] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!cid) return;
    setLoading(true);
    const exists = await IpfsRepository.assertCidExists(cid);
    setLoading(false);

    if (!exists) {
      alert('CID not found');
      return;
    }

    setFiles((prev) => [...prev, cid]);
    setCid('');
  };

  const handleDownload = async (cid: string) => {
    await IpfsRepository.downloadFile(cid, cid);
  };

  const handleRemove = (cid: string) => {
    setFiles((prev) => prev.filter((c) => c !== cid));
  };

  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={cid}
          onChange={(e) => setCid(e.target.value)}
          placeholder="Enter CID"
          style={{ flex: 1, padding: 6 }}
        />
        <button onClick={handleAdd} disabled={loading || !cid}>
          {loading ? 'Checking…' : 'Add'}
        </button>
      </div>

      <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #ccc', borderRadius: 4 }}>
        {files.length === 0 ? (
          <p style={{ padding: 12, color: '#888' }}>No files yet.</p>
        ) : (
          files.map((c) => (
            <div
              key={c}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, borderBottom: '1px solid #eee' }}
            >
              <div style={{ flex: 1, minWidth: 0, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {c}
              </div>
              <button onClick={() => handleDownload(c)}>Download</button>
              <button onClick={() => handleRemove(c)}>✕</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
