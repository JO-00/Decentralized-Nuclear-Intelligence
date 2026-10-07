import { ContractFunctionParameters, EvmAddress, ContractId, ContractFunctionResult } from "@hiero-ledger/sdk";
import {
  SystemOverview,
  ModelDetails,
  InquirerDetails,
  ModelReport,
} from "./types";
import { BigNumber } from "bignumber.js";
import { AbiCoder, JsonRpcProvider, Interface } from "ethers";
import { getContractIds } from "./api";

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
  params: ContractFunctionParameters,
): Promise<string> {
  const iface = new Interface([
    // We don't know the exact ABI here, but ethers only needs the selector.
    // Building a minimal ABI per call is annoying, so we use the low-level
    // approach below instead.
  ]);

  // Use ContractFunctionParameters' own encoder to build the calldata.
  // _buildParams is private but the SDK stores the encoded bytes on the object.
  const encodedParams = (params as any)._buildParams?.() ?? "0x";
  const selector = new Interface([
    `function ${functionName}()`,
  ]).getFunction(functionName)!.selector;

  // If there are parameters, we need the real signature. Build it from the
  // SDK's own encoding: selector + encoded params.
  // For zero-arg functions, selector alone is correct.
  const data = encodedParams === "0x"
    ? selector
    : selector + encodedParams.slice(2);

  const evmAddress = "0x" + contractId.toSolidityAddress();

  const result: string = await getProvider().send("eth_call", [
    {
      to: evmAddress,
      data,
    },
    "latest",
  ]);

  return result;
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

  // ==========================================
  // 1. SYSTEM OVERVIEW
  // ==========================================

  static async getSystemOverview(): Promise<SystemOverview> {
    const raw = await callMirrorNode(
      await ContractCall.require_contract_id(),
      "getSystemOverview",
      new ContractFunctionParameters(),
    );

    const coder = AbiCoder.defaultAbiCoder();
    const [totalOracles, requestFee, modelProposalFee, owner] = coder.decode(
      ["uint256", "uint256", "uint256", "address"],
      raw,
    );

    return {
      totalOracles: Number(totalOracles),
      requestFee: BigInt(requestFee.toString()),
      modelProposalFee: BigInt(modelProposalFee.toString()),
      owner: owner,
    } as SystemOverview;
  }

  // ==========================================
  // 2. MODEL LOOKUPS
  // ==========================================

  static async isModelRegistered(model_owner: string): Promise<boolean> {
    const raw = await callMirrorNode(
      await ContractCall.require_contract_id(),
      "isModelRegistered",
      new ContractFunctionParameters().addAddress(EvmAddress.fromString(model_owner)),
    );

    const [result] = AbiCoder.defaultAbiCoder().decode(["bool"], raw);
    return Boolean(result);
  }

  static async getModelFullDetails(model_owner: string): Promise<ModelDetails> {
    const raw = await callMirrorNode(
      await ContractCall.require_contract_id(),
      "getModelFullDetails",
      new ContractFunctionParameters().addAddress(EvmAddress.fromString(model_owner)),
    );

    const [modelOwner, ipfsRef, reputation, reportCount, exists] =
      AbiCoder.defaultAbiCoder().decode(
        ["address", "string", "uint256", "uint256", "bool"],
        raw,
      );

    return {
      modelOwner,
      ipfsRef,
      reputation: new BigNumber(reputation.toString()),
      reportCount: new BigNumber(reportCount.toString()),
      exists,
    } as ModelDetails;
  }

  static async getBatchModelDetails(model_owners: string[]): Promise<ModelDetails[]> {
    const params = new ContractFunctionParameters()
      .addAddressArray(model_owners.map((a) => EvmAddress.fromString(a)));

    const raw = await callMirrorNode(
      await ContractCall.require_contract_id(),
      "getBatchModelDetails",
      params,
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
      new ContractFunctionParameters().addAddress(EvmAddress.fromString(inquirer)),
    );

    const [inquirerAddr, totalRequests, hasActiveRequest, logFiles] =
      AbiCoder.defaultAbiCoder().decode(
        ["address", "uint256", "bool", "string[]"],
        raw,
      );

    return {
      inquirer: inquirerAddr,
      totalRequests: new BigNumber(totalRequests.toString()),
      hasActiveRequest,
      logFiles,
    } as InquirerDetails;
  }

  static async getPaginatedInquirerRequests(
    inquirer: string,
    offset: number,
    limit: number,
  ): Promise<{ paginatedRequests: string[]; total: BigNumber }> {
    const params = new ContractFunctionParameters()
      .addAddress(EvmAddress.fromString(inquirer))
      .addUint256(offset)
      .addUint256(limit);

    const raw = await callMirrorNode(
      await ContractCall.require_contract_id(),
      "getPaginatedInquirerRequests",
      params,
    );

    const [paginatedRequests, total] = AbiCoder.defaultAbiCoder().decode(
      ["string[]", "uint256"],
      raw,
    );

    return {
      paginatedRequests,
      total: new BigNumber(total.toString()),
    };
  }

  static async getBatchLogFileReputations(hfs_refs: string[]): Promise<bigint[]> {
    const params = new ContractFunctionParameters().addStringArray(hfs_refs);

    const raw = await callMirrorNode(
      await ContractCall.require_contract_id(),
      "getBatchLogFileReputations",
      params,
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
    const params = new ContractFunctionParameters()
      .addAddress(EvmAddress.fromString(model_owner))
      .addUint256(offset)
      .addUint256(limit);

    const raw = await callMirrorNode(
      await ContractCall.require_contract_id(),
      "getPaginatedModelReports",
      params,
    );

    return {
      paginatedReports: ContractCall.decodeModelReportArray(raw),
      total: Number(
        AbiCoder.defaultAbiCoder().decode(
          [
            "tuple(address inquirer, string hfs_ref_report)[]",
            "uint256",
          ],
          raw,
        )[1],
      ),
    };
  }

  // ==========================================
  // 5. ORACLE MANAGEMENT
  // ==========================================

  static async getPaginatedOracles(
    offset: number,
    limit: number,
  ): Promise<{ paginatedOracles: string[]; total: BigNumber }> {
    const params = new ContractFunctionParameters()
      .addUint256(offset)
      .addUint256(limit);

    const raw = await callMirrorNode(
      await ContractCall.require_contract_id(),
      "getPaginatedOracles",
      params,
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
    const params = new ContractFunctionParameters();
    params.addAddressArray(candidates.map((a) => EvmAddress.fromString(a)));

    const raw = await callMirrorNode(
      await ContractCall.require_contract_id(),
      "getBatchOracleStatus",
      params,
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
}