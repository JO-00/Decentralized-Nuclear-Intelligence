import { useRef } from 'react';

interface Props {
  onFiles: (files: FileList) => void;
}

export function FileUploader({ onFiles }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onFiles(e.target.files);
            e.target.value = ''; // allow re-uploading the same file
          }
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-md border border-dashed border-slate-600 bg-slate-800/60 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-indigo-500 hover:bg-slate-800"
      >
        + Upload log file(s)
      </button>
    </div>
  );
}