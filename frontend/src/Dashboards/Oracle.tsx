import { useState } from 'react';
import { LogFileUpload } from './../Components/Oracle/UploadLogFileForm';
import { ModelFileUpload } from './../Components/User/UploadModelFileForm';

type Form = 'log' | 'model' | null;

export function OracleDashboard() {
  const [form, setForm] = useState<Form>(null);

  return (
    <div>
      <button onClick={() => setForm('log')}>Log file form</button>
      <button onClick={() => setForm('model')}>Model upload form</button>
      <button onClick={() => setForm(null)}>X</button>
      <div>
        {form === 'log' && <LogFileUpload />}
        {form === 'model' && <ModelFileUpload />}
      </div>
    </div>
  );
}
