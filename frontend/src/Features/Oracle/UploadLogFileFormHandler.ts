import { IpfsRepository } from "../../HashGraphUtils/IPFS";
import { ContractModify } from "../../HashGraphUtils/ContractModify";
import { Signer } from "@hiero-ledger/sdk";
import { ContractViewer } from "../../HashGraphUtils/ContractViewer";

export async function HandleForm(isconnected : boolean , signer : Signer | null , data: FormData) {
  if (!signer) throw new Error("wallet not connected")
  if (!isconnected) throw new Error("wallet not connected");
  const ipfsRef = data.get("ipfsRef");
  const inquirer = data.get("inquirer")
  if (typeof ipfsRef !== "string" || !ipfsRef || typeof inquirer !== "string" || !inquirer) throw new Error("missing IPFS REF or invalid inquirer address");
  await ContractViewer.getEvmAddress(inquirer);
  if (!await IpfsRepository.assertCidExists(ipfsRef)) throw new Error("file with associated IPFS REF does not exist");
  

  await ContractModify.submitLogFile(signer , inquirer , ipfsRef)
}

