import { ContractFunctionParameters, EvmAddress, ContractId, ContractFunctionResult, AccountId  , Signer} from "@hiero-ledger/sdk";
import {
  SystemOverview,
  ModelDetails,
  InquirerDetails,
  ModelReport,
} from "./types";
import { BigNumber } from "bignumber.js";
import { AbiCoder, JsonRpcProvider, Interface } from "ethers";
import { getContractIds } from "./api";
import {ContractViewer} from "./ContractViewer";
import { IpfsRepository } from "./IPFS";

// ==========================================
// Mirror / JSON-RPC plumbing
// ==========================================
//
// Instead of a `Client` with an operator (which can't exist safely in a
// frontend), all reads go through Hedera's JSON-RPC relay, which is free,
// requires no signature, and needs no operator account.

const HEDERA_RPC_URL = "https://testnet.hashio.io/api";

let provider: JsonRpcProvider | null = null;

function getProvider(): JsonRpcProvider {
  if (!provider) {
    provider = new JsonRpcProvider(HEDERA_RPC_URL);
  }
  return provider;
}

/**
 * The single place every read goes through.
 * Encodes the function call, POSTs it to the relay, and returns the raw
 * ABI-encoded result bytes so callers can decode however they need.
 */
async function callMirrorNode(
  contractId: ContractId,
  functionName: string,
  inputTypes: string[],
  args: unknown[],
): Promise<string> {
  const evmAddress = "0x" + contractId.toSolidityAddress();

  const signature =
    "function " + functionName + "(" + inputTypes.join(",") + ")";
  const iface = new Interface([signature]);

  const data = iface.encodeFunctionData(functionName, args);

  return await getProvider().send("eth_call", [
    {
      to: evmAddress,
      data: data,
    },
    "latest",
  ]);
}







export class ContractCall {
  /**
   * All queries need a contract to target. Set this once at app init.
   */
  static contractId: ContractId | null = null;

  static async init_contract(): Promise<ContractId | null> {
    if (!ContractCall.contractId) {
      const contractIds = await getContractIds();
      ContractCall.contractId = ContractId.fromString(contractIds?.[0].contract_address);
    }
    return ContractCall.contractId;
  }

  private static async require_contract_id(): Promise<ContractId> {
    ContractCall.contractId = await ContractCall.init_contract();
    if (!ContractCall.contractId) {
      throw new Error("ContractCall.contractId is not set");
    }
    return ContractCall.contractId;
  }

  static async isOracle(signer : Signer) {
    const client_id : AccountId = signer.getAccountId()
    const raw = await callMirrorNode(
      await this.require_contract_id(),
      "isOracle",
      ["address"],
      [await ContractViewer.getEvmAddress(client_id.toString())]
    )
    const [res] = AbiCoder.defaultAbiCoder().decode(
      ["bool"],
      raw
    );
    return res
  }

  // ==========================================
  // 1. SYSTEM OVERVIEW
  // ==========================================

  static async getSystemOverview(): Promise<SystemOverview> {
    const raw = await callMirrorNode(
      await ContractCall.require_contract_id(),
      "getSystemOverview",
      [],
      []
    );

    const coder = AbiCoder.defaultAbiCoder();
    const [totalOracles, requestFee, modelProposalFee] = coder.decode(
      ["uint256", "uint256", "uint256", "address"],
      raw,
    );

    return {
      totalOracles: Number(totalOracles),
      requestFee: new BigNumber(requestFee.toString()),
      modelProposalFee: new BigNumber(modelProposalFee.toString()),
    } as SystemOverview;
  }

  static async handleFetchRecentRequests() {
    const raw = await callMirrorNode(
      await ContractCall.require_contract_id(),
      "getRecentInquiries",
      [],
      []
    );
    const coder = AbiCoder.defaultAbiCoder();
    const [decoded] = coder.decode(["address[]"], raw);

    const profiles = await Promise.all(
      (decoded as string[]).map(async (address) => {
        const profile = await ContractCall.getInquirerFullProfile(address);
        return {
          ...profile,
          inquirer: address,
        };
      })
    );

    return profiles;
  }

  // ==========================================
  // 2. MODEL LOOKUPS
  // ==========================================

  static async isModelRegistered(model_owner: string): Promise<boolean> {
const contractId = await ContractCall.require_contract_id();
console.log("Contract ID:", contractId);

const ownerAddress =
  await ContractViewer.getEvmAddress(model_owner);

const raw = await callMirrorNode(
  await ContractCall.require_contract_id(),
  "isModelRegistered",
  ["address"],
  [ownerAddress],
);

   

    const [result] = AbiCoder.defaultAbiCoder().decode(["bool"], raw);
    
    return Boolean(result);
  }

static async getModelFullDetails(model_owner: string): Promise<ModelDetails> {
  const raw = await callMirrorNode(
    await ContractCall.require_contract_id(),
    "getModelFullDetails",
    ["address"],
    [(await ContractViewer.getEvmAddress(model_owner)).toString()]
  );

  const [decoded] = AbiCoder.defaultAbiCoder().decode(
    ["tuple(address modelOwner,string ipfsRef,uint256 reputation,uint256 reportCount,bool exists)"],
    raw
  );

  return {
    modelOwner: decoded.modelOwner,
    ipfsRef: decoded.ipfsRef,
    reputation: new BigNumber(decoded.reputation.toString()),
    reportCount: new BigNumber(decoded.reportCount.toString()),
    exists: decoded.exists,
  } as ModelDetails;
}

  static async getBatchModelDetails(model_owners: string[]): Promise<ModelDetails[]> {
    const params = new ContractFunctionParameters()
      .addAddressArray(await Promise.all(model_owners.map((a) => ContractViewer.getEvmAddress(a))));

    const raw = await callMirrorNode(
      await ContractCall.require_contract_id(),
      "getBatchModelDetails",
      ["address[]"],
      [model_owners]
    );

    return ContractCall.decodeModelDetailsArray(raw);
  }

  // ==========================================
  // 3. INQUIRER ANALYTICS
  // ==========================================

  static async getInquirerFullProfile(inquirer: string): Promise<InquirerDetails> {
    const raw = await callMirrorNode(
      await ContractCall.require_contract_id(),
      "getInquirerFullProfile",
      ["address"],
      [(await ContractViewer.getEvmAddress(inquirer)).toString()]
    );


    const [decoded] =
      AbiCoder.defaultAbiCoder().decode(
        ["tuple(address inquirer, uint256 totalRequests, bool hasActiveRequest, string[] logFiles)"],
        raw,
      );

    return {
      inquirer: decoded.inquirer,
      totalRequests: new BigNumber(decoded.totalRequests.toString()),
      hasActiveRequest: decoded.hasActiveRequest,
      logFiles: decoded.logFiles,
    } as InquirerDetails;
  }

  static async getPaginatedInquirerResponses(
    inquirer: string,
    offset: number,
    limit: number,
  ): Promise<{ paginatedRequests: string[]; total: BigNumber }> {

    const raw = await callMirrorNode(
      await ContractCall.require_contract_id(),
      "getPaginatedInquirerRequests",
      ["address", "uint256" , "uint256"],
      [await ContractViewer.getEvmAddress(inquirer), offset, limit]
    );

    const [paginated_req , total] = AbiCoder.defaultAbiCoder().decode(
      ["string[]", "uint256"],
      raw,
    );


    return {
      paginatedRequests : paginated_req,
      total: new BigNumber(total),
    };
  }

  static async getBatchLogFileReputations(hfs_refs: string[]): Promise<bigint[]> {

    const raw = await callMirrorNode(
      await ContractCall.require_contract_id(),
      "getBatchLogFileReputations",
      ["string[]"],
      hfs_refs
    );

    const [reputations] = AbiCoder.defaultAbiCoder().decode(["uint256[]"], raw);
    return (reputations as bigint[]).map((r) => BigInt(r.toString()));
  }

  // ==========================================
  // 4. MODEL REPORTS
  // ==========================================

  static async getPaginatedModelReports(
    model_owner: string,
    offset: number,
    limit: number,
  ): Promise<{ paginatedReports: ModelReport[]; total: number }> {

    const raw = await callMirrorNode(
      await ContractCall.require_contract_id(),
      "getPaginatedModelReports",
      ["address", "uint256" , "uint256"],
      [model_owner , offset , limit]
    );

    const [model_reports , total] = AbiCoder.defaultAbiCoder().decode(
      [
        "tuple(address inquirer, string hfs_ref_report)[]",
        "uint256"
    ] , raw
    )

    return {
      paginatedReports: model_reports,
      total: total
    };
  }

  // ==========================================
  // 5. ORACLE MANAGEMENT
  // ==========================================

  static async getPaginatedOracles(
    offset: number,
    limit: number,
  ): Promise<{ paginatedOracles: string[]; total: BigNumber }> {

    const raw = await callMirrorNode(
      await ContractCall.require_contract_id(),
      "getPaginatedOracles",
      ["uint256" , "uint256"],
      [offset , limit],
    );

    const [paginatedOracles, total] = AbiCoder.defaultAbiCoder().decode(
      ["address[]", "uint256"],
      raw,
    );

    return {
      paginatedOracles,
      total: new BigNumber(total.toString()),
    };
  }

  static async getBatchOracleStatus(candidates: string[]): Promise<boolean[]> {

    const raw = await callMirrorNode(
      await ContractCall.require_contract_id(),
      "getBatchOracleStatus",
      ["address[]"],
      [await Promise.all(
        candidates.map((candidate) => ContractViewer.getEvmAddress(candidate)),
      )]
    );

    const [statuses] = AbiCoder.defaultAbiCoder().decode(["bool[]"], raw);
    return statuses as boolean[];
  }

  // ==========================================
  // Helpers for struct-array returns
  // ==========================================

  private static decodeModelDetailsArray(raw: string): ModelDetails[] {
    const abiCoder = AbiCoder.defaultAbiCoder();

    const [rows] = abiCoder.decode(
      [
        "tuple(address modelOwner, string ipfsRef, uint256 reputation, uint256 reportCount, bool exists)[]",
      ],
      raw,
    ) as unknown as [
      Array<{
        modelOwner: string;
        ipfsRef: string;
        reputation: bigint;
        reportCount: bigint;
        exists: boolean;
      }>,
    ];

    return rows.map((r) => ({
      modelOwner: r.modelOwner,
      ipfsRef: r.ipfsRef,
      reputation: new BigNumber(r.reputation.toString()),
      reportCount: new BigNumber(r.reportCount.toString()),
      exists: r.exists,
    }));
  }

  private static decodeModelReportArray(raw: string): ModelReport[] {
    const abiCoder = AbiCoder.defaultAbiCoder();

    const [rows] = abiCoder.decode(
      [
        "tuple(address inquirer, string hfs_ref_report)[]",
        "uint256",
      ],
      raw,
    ) as unknown as [
      Array<{ inquirer: string; hfs_ref_report: string }>,
      bigint,
    ];

    return rows.map((r) => ({
      inquirer: r.inquirer,
      hfs_ref_report: r.hfs_ref_report,
    }));
  }

  static async getModelReputation(model_owner: string) {
    const raw = await callMirrorNode(
      await ContractCall.require_contract_id(),
      "getModelFullDetails",
      ["address"],
      [await ContractViewer.getEvmAddress(model_owner)],
    );

    const [details] = AbiCoder.defaultAbiCoder().decode(
      ["tuple(address modelOwner,string ipfsRef,uint256 reputation,uint256 reportCount,bool exists)"],
      raw,
    );

    return Number(details.reputation);
  }
  static async getLogFileReputation(ipfs_ref: string) {
    if (!await IpfsRepository.assertCidExists(ipfs_ref)) {
      throw new Error("invalid ipfs ref");
    }

    const raw = await callMirrorNode(
      await ContractCall.require_contract_id(),
      "getBatchLogFileReputations",
      ["string[]"],
      [[ipfs_ref]],
    );

    const [reputations] = AbiCoder.defaultAbiCoder().decode(
      ["uint256[]"],
      raw,
    );

    return Number(reputations[0]);
  }
  


}