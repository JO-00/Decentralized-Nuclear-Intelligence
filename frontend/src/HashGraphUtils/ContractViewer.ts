export abstract class ContractViewer{
    static async AssertContractExists(contractIdOrAddress: string): Promise<boolean> {
        const network = 'testnet'; // or 'testnet'
        const url = `https://${network}.mirrornode.hedera.com/api/v1/contracts/${contractIdOrAddress}`;
        
        const response = await fetch(url);
        return response.ok; // 200 = exists, 404 = doesn't exist
    }
    static async getEvmAddress(accountId: string): Promise<string> {
        const network = "testnet"; // or "testnet"
        const url = `https://${network}.mirrornode.hedera.com/api/v1/accounts/${accountId}?limit=1`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error("Wallet with associated account id does not exist");
        
        const data = await response.json();
        return data.evm_address;
        }
}