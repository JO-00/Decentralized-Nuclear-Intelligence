import { ContractModify  } from "../../HashGraphUtils/ContractModify";
import { Signer , ReceiptStatusError , Status} from "@hiero-ledger/sdk";

export async function HandleForm(signer : Signer | null){
    if (!signer) throw new Error("wallet not connected");
    try{
        await ContractModify.ApplyAsOracle(signer);
    }catch(err){
        throw new Error(err.stack, {cause :err})
        if (
            err instanceof ReceiptStatusError &&
            err.status === Status.ContractRevertExecuted
        ) throw new Error("Must submit at least your first Anomaly Detection Model to apply as Oracle", {cause: err})
    }
    
}