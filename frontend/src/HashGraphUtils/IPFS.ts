import { verifiedFetch } from '@helia/verified-fetch';

export class IpfsRepository {
  /**
   * Checks whether a CID is retrievable from a public IPFS gateway.
   */

static async assertCidExists(
  cid: string,
  timeoutMs = 10_000
): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await verifiedFetch(`ipfs://${cid}`, {
      method: "GET",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch IPFS content: ${response.status} ${response.statusText}`
      );
    }

    // We only need to know whether the content is retrievable.
    // Cancel the body without masking the original result if cancellation fails.
    if (response.body && !response.body.locked) {
      try {
        await response.body.cancel();
      } catch (cancelError) {
        console.warn("[IPFS] Could not cancel response body:", cancelError);
      }
    }

    return true;
  } catch (err) {
    if (controller.signal.aborted) {
      throw new Error(
        `IPFS fetch timed out after ${timeoutMs}ms`,
        { cause: err }
      );
    }

    throw err;
  } finally {
    clearTimeout(timer);
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
