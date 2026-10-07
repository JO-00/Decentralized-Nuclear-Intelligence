import { ContractCallQuery, ContractId, ContractFunctionParameters, Signer } from "@hiero-ledger/sdk";
import { HederaWalletConnect } from "./../getHederaSigner";
import {IpfsRepository} from "./../IPFS"

interface HederaWalletConnection {
    signer: Signer | null;
}

export class RegisterRepository {
    signer: Signer | null = null;

    init_signer(): void {
        const { signer }: HederaWalletConnection = HederaWalletConnect();
        this.signer = signer;
    }

    async RegisterModel(contract_id: string, model_ipfs_ref: string): Promise<boolean> {
        if (!this.signer) {
            this.init_signer();
            if (!this.signer) throw new Error("Couldn't get signer");
        }
        if (!await IpfsRepository.assertCidExists(model_ipfs_ref)) throw new Error("Save the model on IPFS first");

        const function_params = new ContractFunctionParameters()
            .addString(model_ipfs_ref);

        try {
            const transaction = new ContractCallQuery()
                .setContractId(ContractId.fromString(contract_id))
                .setFunction("ProposeModel", function_params);

            const response = await transaction.executeWithSigner(this.signer);
            return response.getBool(0);
        } catch (error: unknown) {
            console.log((error as { stack?: string }).stack);
            return false;
        }
    }




}
