import { ContractFunctionParameters, ContractId, Hbar , ContractCallQuery, Transaction, Client, TransactionResponse , ContractExecuteTransaction } from "@hiero-ledger/sdk";
import {ContractCall} from "./ContractCall"
import { getContractIds } from "./api";
import { Signer } from "@hiero-ledger/sdk";
import { ContractViewer } from "./ContractViewer";
import { IpfsRepository } from "./IPFS";


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
static async VoteLogFile(
  signer: Signer,
  vote: number,
  inquirer: string,
  ipfs_ref: string
) {
  const contract_id: ContractId =
    await ContractModify.require_contract_id();

  if (!(await IpfsRepository.assertCidExists(ipfs_ref))) {
    throw new Error("file with associated ipfs doesn't exist");
  }

  const address = await ContractViewer.getEvmAddress(inquirer);

  const functionName =
    vote === 1
      ? "upvote_logfile"
      : vote === -1
        ? "downvote_logfile"
        : (() => {
            throw new Error("invalid vote");
          })();

  const transaction = new ContractExecuteTransaction()
    .setContractId(contract_id)
    .setFunction(
      functionName,
      new ContractFunctionParameters()
        .addAddress(address)
        .addString(ipfs_ref)
    )
    .setGas(1_000_000);

  const response: TransactionResponse =
    await transaction.executeWithSigner(signer);

  console.log("Transaction ID:", response.transactionId.toString());

  const receipt = await response.getReceipt(Client.forTestnet());

  console.log("Transaction status:", receipt.status.toString());

  return receipt;
}



static async VoteModelFile(
  signer: Signer,
  vote: number,
  model_owner: string
) {
  const contract_id: ContractId =
    await ContractModify.require_contract_id();

  const address = await ContractViewer.getEvmAddress(model_owner);

  const functionName =
    vote === 1
      ? "upvote_model"
      : vote === -1
        ? "downvote_model"
        : (() => {
            throw new Error("invalid vote");
          })();

  const transaction = new ContractExecuteTransaction()
    .setContractId(contract_id)
    .setFunction(
      functionName,
      new ContractFunctionParameters().addAddress(address)
    )
    .setGas(1_000_000);

  const response: TransactionResponse =
    await transaction.executeWithSigner(signer);

  console.log("Transaction ID:", response.transactionId.toString());

  const receipt = await response.getReceipt(Client.forTestnet());

  console.log("Transaction status:", receipt.status.toString());

  return receipt;
}
static async handleResponse(
      signer : Signer |null,
      inquirer: string,
      ipfsRef: string
    ): Promise<void> {
      if (!IpfsRepository.assertCidExists(ipfsRef)) throw new Error("invalid ipfs ref");
      if (!signer) throw new Error("could't connect to wallet");
        const contract_id: ContractId =
    await ContractModify.require_contract_id();

  const address = await ContractViewer.getEvmAddress(inquirer);

  
  const transaction = new ContractExecuteTransaction()
    .setContractId(contract_id)
    .setFunction(
      "submitLogFile",
      new ContractFunctionParameters().addAddress(address).addString(ipfsRef)
    )
    .setGas(1_000_000);

  const response: TransactionResponse =
    await transaction.executeWithSigner(signer);

  console.log("Transaction ID:", response.transactionId.toString());

  const receipt = await response.getReceipt(Client.forTestnet());

  console.log("Transaction status:", receipt.status.toString());

    }



    
}


