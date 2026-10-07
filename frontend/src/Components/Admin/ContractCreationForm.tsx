import type { ContractForm } from "./../types";
import { HandleForm } from "../../Features/Admin/ContractCreationFormHandler";
import { HederaWalletConnect } from "../../HashGraphUtils/getHederaSigner";









export function ContractCreationForm() {
    
    const { signer, isConnected } = HederaWalletConnect();
    console.log(signer);

    const handleSubmit = async (formData: FormData): Promise<void> => {
        const contract = parseContractForm(formData);
        try {
            await HandleForm(signer, isConnected, contract.RequestFee, contract.ModelFee);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.stack ?? error.message : String(error);
            console.log("GLOBAL ERROR:", errorMessage);
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
        <form action={handleSubmit}>
            <input name="ContractName" placeholder="Contract Name" required />
            <input name="RequestFee" type="number" min="0" step="1" placeholder="Request Fee" required />
            <input name="ModelFee"  type="number" min="0" step="1" placeholder="Model Fee" required />
            <button type="submit">Submit</button>
        </form>
    );
}
