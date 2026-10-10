import { useCallback, useState } from 'react';
import type { LogFile } from './types';
import { makeLogFile } from './LogFileUtils';

export interface RejectedFile {
  name: string;
  errors: string[];
}

export function useLogFiles() {
  const [files, setFiles] = useState<LogFile[]>([]);
  const [rejected, setRejected] = useState<RejectedFile[]>([]);

  const addFiles = useCallback(async (fileList: FileList | File[]) => {
    const arr = Array.from(fileList);
    const newFiles: LogFile[] = [];
    const newRejected: RejectedFile[] = [];

    for (const f of arr) {
      try {
        const text = await f.text();
        const json = JSON.parse(text);
        const res = makeLogFile(json, f.name);
        if (res) {
          newFiles.push(res);
        } else {
          // re-validate to get errors
          const { validateLogFile } = await import('./LogFileUtils');
          const v = validateLogFile(json);
          newRejected.push({ name: f.name, errors: v.errors });
        }
      } catch (e) {
        newRejected.push({
          name: f.name,
          errors: [e instanceof Error ? e.message : 'Invalid JSON'],
        });
      }
    }

    if (newFiles.length) setFiles((prev) => [...prev, ...newFiles]);
    if (newRejected.length) setRejected((prev) => [...prev, ...newRejected]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const dismissRejected = useCallback(() => setRejected([]), []);

  return { files, rejected, addFiles, removeFile, dismissRejected };
}