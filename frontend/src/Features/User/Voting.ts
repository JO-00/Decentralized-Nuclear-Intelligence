import {ContractModify} from "../../HashGraphUtils/ContractModify"
import { Signer } from "@hiero-ledger/sdk"
import { ContractCall } from "../../HashGraphUtils/ContractCall";


export async function handleLogFileVote(
    signer : Signer | null,
    vote : number,
    inquirer : string,
    ipfs_ref : string

){
    if (!signer) throw new Error("invalid signer")
    await ContractModify.VoteLogFile(signer , vote , inquirer , ipfs_ref);

}
export async function handleModelVote(
    signer : Signer | null,
    vote : number,
    model_owner : string
){
    if (!signer) throw new Error("invalid signer")
    await ContractModify.VoteModelFile(signer , vote , model_owner);

}


export async function fetchModelVotes(
    model_owner : string
){
    return await ContractCall.getModelReputation(model_owner)
    
}
export async function fetchLogFilesVotes(ipfs_ref : string){
    return await ContractCall.getLogFileReputation(ipfs_ref)

}