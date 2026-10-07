import { useState } from 'react';
import {HandleForm} from "./../../Features/User/UploadModelFileFormHandler"


export function ModelFileUpload() {
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const data = new FormData();
    data.append('file', file);
    HandleForm(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button type="submit" disabled={!file}>
        Upload
      </button>
    </form>
  );
}
