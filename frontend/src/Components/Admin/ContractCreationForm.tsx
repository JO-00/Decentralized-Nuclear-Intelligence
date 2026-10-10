import { useState } from "react";
import type { ContractForm } from "./../types";
import { HandleForm } from "../../Features/Admin/ContractCreationFormHandler";
import { HederaWalletConnect } from "../../HashGraphUtils/getHederaSigner";

type ContractResult = {
  contractId: string;
  fileId: string;
  transactionId: string;
};

export function ContractCreationForm() {
  const { signer, isConnected } = HederaWalletConnect();
  const [result, setResult] = useState<ContractResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  console.log(signer);

  const handleSubmit = async (formData: FormData): Promise<void> => {
    setError(null);
    setResult(null);

    const contract = parseContractForm(formData);
    try {
      const res = await HandleForm(
        signer,
        isConnected,
        contract.RequestFee,
        contract.ModelFee
      );
      setResult(res);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.stack ?? err.message : String(err);
      console.log("GLOBAL ERROR:", errorMessage);
      setError(errorMessage);
    }
  };

  const parseContractForm = (formData: FormData): ContractForm => {
    const toBigInt = (v: FormDataEntryValue | null): bigint => {
      const s = v?.toString().trim() ?? '';
      return /^\d+$/.test(s) ? BigInt(s) : 0n;
    };

    return {
      ContractName: (formData.get('ContractName') as string) ?? '',
      RequestFee: toBigInt(formData.get('RequestFee')),
      ModelFee: toBigInt(formData.get('ModelFee')),
    };
  };

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold text-slate-100">
          Create contract
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Deploy a new contract to Hedera.
        </p>
      </div>

      <form action={handleSubmit} className="space-y-3">
        <Field label="Contract name" htmlFor="ContractName">
          <input
            id="ContractName"
            name="ContractName"
            placeholder="My contract"
            required
            className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Request fee" htmlFor="RequestFee">
            <input
              id="RequestFee"
              name="RequestFee"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              required
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 font-mono text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
            />
          </Field>

          <Field label="Model fee" htmlFor="ModelFee">
            <input
              id="ModelFee"
              name="ModelFee"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              required
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 font-mono text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
            />
          </Field>
        </div>

        <button
          type="submit"
          disabled={!isConnected}
          className="inline-flex w-full items-center justify-center rounded-md bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-500/30 transition hover:from-indigo-400 hover:to-fuchsia-400 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 disabled:shadow-none"
        >
          Submit
        </button>
      </form>

      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-red-300">
            Error
          </p>
          <pre className="whitespace-pre-wrap break-words font-mono text-xs text-red-200">
            {error}
          </pre>
        </div>
      )}

      {result && (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/20 text-xs text-emerald-300">
              ✓
            </span>
            <h3 className="text-sm font-semibold text-emerald-200">
              Contract created
            </h3>
          </div>
          <dl className="space-y-1.5 text-xs">
            <ResultRow label="Contract ID" value={result.contractId} />
            <ResultRow label="File ID" value={result.fileId} />
            <ResultRow label="Transaction ID" value={result.transactionId} />
          </dl>
        </div>
      )}
    </div>
  );
}

/* ---------- Small presentational helpers ---------- */

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-[11px] font-medium uppercase tracking-wider text-slate-400"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-slate-400">{label}</dt>
      <dd
        className="min-w-0 break-all text-right font-mono text-emerald-100"
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}