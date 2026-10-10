import { ContractFunctionParameters, ContractId, Hbar , ContractCallQuery, Client, TransactionResponse , ContractExecuteTransaction } from "@hiero-ledger/sdk";
import {ContractCall} from "./ContractCall"
import { getContractIds } from "./api";
import { Signer } from "@hiero-ledger/sdk";
import { ContractViewer } from "./ContractViewer";


export class ContractModify{
    static contractId: ContractId | null = null;

    static async init_contract(): Promise<ContractId | null> {
        if (!ContractModify.contractId) {
        const contractIds = await getContractIds();
        ContractModify.contractId = ContractId.fromString(contractIds?.[0].contract_address);
        }
        return ContractModify.contractId;
    }

    private static async require_contract_id(): Promise<ContractId> {
        ContractModify.contractId = await ContractModify.init_contract();
        if (!ContractModify.contractId) {
        throw new Error("ContractModify.contractId is not set");
        }
        return ContractModify.contractId;
    }

    static async UploadModel(
        signer: Signer,
        ModelIpfsRef: string
    ) {
        const contract_id: ContractId =
            await ContractModify.require_contract_id();

        const transaction = new ContractExecuteTransaction()
            .setContractId(contract_id)
            .setFunction(
                "ProposeModel",
                new ContractFunctionParameters()
                    .addString(ModelIpfsRef)
            )
            .setGas(1_000_000)
            .setPayableAmount((await ContractCall.getSystemOverview()).modelProposalFee);

        const response: TransactionResponse =
            await transaction.executeWithSigner(signer);

        console.log("Transaction ID:", response.transactionId.toString());

        const receipt = await response.getReceipt(Client.forTestnet());

        console.log("Transaction status:", receipt.status.toString());

        return receipt;
    }

    static async submitLogFile(
        signer : Signer,
        inquirer : string,
        cid : string
    ) {
        if (! await ContractCall.isOracle(signer)) throw new Error("You must be an oracle to submit log files")
        const contract_id: ContractId = await ContractModify.require_contract_id();

        const transaction = new ContractExecuteTransaction()
            .setContractId(contract_id)
            .setFunction(
                "submitLogFile",
                new ContractFunctionParameters()
                    .addAddress((await ContractViewer.getEvmAddress(inquirer)))
                    .addString(cid)
            )
            .setGas(1_000_000)

        const response: TransactionResponse =
            await transaction.executeWithSigner(signer);

        console.log("Transaction ID:", response.transactionId.toString());

        const receipt = await response.getReceipt(Client.forTestnet());

        console.log("Transaction status:", receipt.status.toString());

        return receipt;
    
    }

    static async ApplyAsOracle(signer : Signer){
        if (await ContractCall.isOracle(signer)) throw new Error("You're already an oracle'");
        const contract_id: ContractId = await ContractModify.require_contract_id();
        const transaction = new ContractExecuteTransaction()
            .setContractId(contract_id)
            .setFunction(
                "ApplyAsOracle")
            .setGas(1_000_000)
            .setPayableAmount(Hbar.fromTinybars(1000));

        const response: TransactionResponse =
            await transaction.executeWithSigner(signer);

        console.log("Transaction ID:", response.transactionId.toString());

        const receipt = await response.getReceipt(Client.forTestnet());

        console.log("Transaction status:", receipt.status.toString());

        return receipt;
    }


    static async requestReactorState(signer : Signer){
        const contract_id: ContractId = await ContractModify.require_contract_id();
        const transaction = new ContractExecuteTransaction()
            .setContractId(contract_id)
            .setFunction(
                "requestReactorState")
            .setGas(1_000_000)
            .setPayableAmount(Hbar.fromTinybars(1000));

        const response: TransactionResponse =
            await transaction.executeWithSigner(signer);

        console.log("Transaction ID:", response.transactionId.toString());

        const receipt = await response.getReceipt(Client.forTestnet());

        console.log("Transaction status:", receipt.status.toString());

        return receipt;
    }


    
}


