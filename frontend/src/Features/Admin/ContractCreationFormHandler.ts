import {
    Client,
    ContractCreateTransaction,
    ContractFunctionParameters,
    FileAppendTransaction,
    FileCreateTransaction,
    PublicKey,
    Signer,
    Long
} from "@hiero-ledger/sdk";

import { bytecode } from "../../../../hashgraph/out/Entry.sol/Entry.json";

// Helper: Get Public Key from Mirror Node
async function getAccountPublicKey(accountIdStr: string): Promise<PublicKey> {
    const response = await fetch(
        `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountIdStr}`
    );
    if (!response.ok) throw new Error(`Failed to fetch account info for ${accountIdStr}`);
    const data = await response.json();
    if (!data.key?.key) throw new Error(`Public key not found for account ${accountIdStr}`);
    return PublicKey.fromString(data.key.key);
}

export async function HandleForm(
    signer: Signer | null,
    isConnected: boolean,
    request_cost: bigint,
    model_cost: bigint
) {
    if (signer == null) throw new Error("signer not established yet")
    console.log("========== CONTRACT DEPLOY ==========");

    if (!isConnected || !signer) {
        throw new Error("Hedera wallet is not connected.");
    }

    if (!bytecode?.object) {
        throw new Error("Contract bytecode not found.");
    }

    // 1. Keep bytecode as clean UTF-8 string bytes (prevents ERROR_DECODING_BYTESTRING)
    const bytecodeHex = bytecode.object.replace(/^0x/, "");
    const bytecodeBytes = Buffer.from(bytecodeHex, "utf-8");

    const constructorParams = new ContractFunctionParameters()
        .addUint256(Long.fromString(request_cost.toString()))
        .addUint256(Long.fromString(model_cost.toString()));

    const accountId = signer.getAccountId();
    const userPublicKey = await getAccountPublicKey(accountId.toString());
    if (!userPublicKey) {
        throw new Error("Failed to get the connected account public key.");
    }

    // 2. Maximize initial chunk to 4,096 bytes (4 KB)
    const FIRST_CHUNK_SIZE = 4096;
    const firstChunk = bytecodeBytes.subarray(0, Math.min(FIRST_CHUNK_SIZE, bytecodeBytes.length));

    const fileCreateTx = new FileCreateTransaction()
        .setContents(firstChunk)
        .setKeys([userPublicKey]);

    // ----------------------------------------------------
    // PROMPT 1: Create File + Append ALL Remaining Bytes
    // ----------------------------------------------------
    console.log("Prompting wallet to create bytecode file...");
    const fileCreateResponse = await fileCreateTx.executeWithSigner(signer);
    const client = Client.forTestnet();
    const fileCreateReceipt = await fileCreateResponse.getReceipt(client);

    const fileId = fileCreateReceipt.fileId;
    if (!fileId) throw new Error("File ID creation failed.");

    // 3. Append remaining bytes in max 6,144 byte (6 KB) chunks
    const APPEND_CHUNK_SIZE = 6144;
    if (bytecodeBytes.length > FIRST_CHUNK_SIZE) {
        for (let offset = FIRST_CHUNK_SIZE; offset < bytecodeBytes.length; offset += APPEND_CHUNK_SIZE) {
            const chunk = bytecodeBytes.subarray(
                offset,
                Math.min(offset + APPEND_CHUNK_SIZE, bytecodeBytes.length)
            );

            const appendTx = new FileAppendTransaction()
                .setFileId(fileId)
                .setContents(chunk);

            const appendResponse = await appendTx.executeWithSigner(signer);
            const appendReceipt = await appendResponse.getReceipt(client);

            if (appendReceipt.status.toString() !== "SUCCESS") {
                throw new Error(`File append failed at offset ${offset}`);
            }
        }
    }

    // ----------------------------------------------------
    // PROMPT 2: Deploy Smart Contract
    // ----------------------------------------------------
    console.log("Prompting wallet to deploy contract...");
    const contractCreateTx = new ContractCreateTransaction()
        .setBytecodeFileId(fileId)
        .setConstructorParameters(constructorParams)
        .setGas(15_000_000);

    const contractResponse = await contractCreateTx.executeWithSigner(signer);
    const contractReceipt = await contractResponse.getReceipt(client);

    const contractId = contractReceipt.contractId;
    if (!contractId) throw new Error("Contract creation failed.");

    console.log("========== CONTRACT DEPLOYED ==========");
    console.log("Contract ID:", contractId.toString());

    return {
        contractId: contractId.toString(),
        fileId: fileId.toString(),
        transactionId: contractResponse.transactionId.toString()
    };
}
