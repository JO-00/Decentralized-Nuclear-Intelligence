import { verifiedFetch } from '@helia/verified-fetch';

export class IpfsRepository {
  /**
   * Checks whether a CID is retrievable from a public IPFS gateway.
   */
  static async assertCidExists(cid: string): Promise<boolean> {
    const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;

    try {
      const response = await fetch(gatewayUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error("Failed to reach IPFS gateway:", error);
      return false;
    }
  }

  /**
   * Fetches a file from IPFS by CID and triggers a browser download.
   */
  static async downloadFile(cid: string, filename: string): Promise<void> {
    const response = await verifiedFetch(`ipfs://${cid}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch IPFS content: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  }
}
