import {IpfsRepository} from "../../HashGraphUtils/IPFS"
import { ContractModify } from "../../HashGraphUtils/ContractModify";
import { Signer } from "@hiero-ledger/sdk";

type HandleFormCallbacks = {
  onCidVerified?: () => void | Promise<void>;
};

export async function HandleForm(signer : Signer , formdata: FormData, callbacks?: HandleFormCallbacks) {
  if (!signer) throw new Error("Couldn't connect to wallet")
  const ModelIpfsRef: string | undefined = formdata.get("ModelIpfsRef")?.toString();
  if (!ModelIpfsRef) throw new Error("Please provide the IPFS ref");

  if (!(await IpfsRepository.assertCidExists(ModelIpfsRef))) {
    throw new Error("Model File does not exist on IPFS, you must upload it there first");
  }

  // let the UI show "found" for a beat before we move on
  await callbacks?.onCidVerified?.();

  await ContractModify.UploadModel(signer , ModelIpfsRef);
}
export async function handleQueryReactorState(signer: Signer): Promise<void> {
  if (!signer) throw new Error("Couldn't connect to wallet")
  await ContractModify.requestReactorState(signer);
}