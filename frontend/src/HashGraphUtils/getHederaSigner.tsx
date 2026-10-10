import { useState, useEffect } from "react";
import { DAppConnector, DAppSigner } from "@hashgraph/hedera-wallet-connect";
import { LedgerId,Signer } from "@hiero-ledger/sdk";

// Public WalletConnect demo ID so you don't need to register anything
const WALLETCONNECT_PROJECT_ID : string | undefined = import.meta.env.VITE_PROJECT_ID;
console.log(WALLETCONNECT_PROJECT_ID)

// if (typeof WALLETCONNECT_PROJECT_ID == "undefined") throw new Error("project id not loaded");

const metadata = {
    name: "React Topic App",
    description: "Hedera Consensus Service Demo",
    url: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
    icons: ["https://www.hashpack.app/img/logo.png"]
};

// Initialize DAppConnector instance
const dAppConnector = new DAppConnector(
    metadata,
    LedgerId.TESTNET,
    WALLETCONNECT_PROJECT_ID
);

export function HederaWalletConnect() {
    const [signer, setSigner] = useState<Signer | null>(null);
    const [accountId, setAccountId] = useState<string>("");
    const [isConnected, setIsConnected] = useState<boolean>(false);

    useEffect(() => {
dAppConnector.init().then(() => {
    if (dAppConnector.signers.length > 0) {
        const activeSigner : DAppSigner = dAppConnector.signers[0];
        if (activeSigner) {  // ← no throw, just check
            setSigner(activeSigner);
            setAccountId(activeSigner.getAccountId().toString());
            setIsConnected(true);
        }
    }
}).catch(err => console.error("DAppConnector init failed:", err));
    }, []);

    const connect = async () => {
        try {
            // Opens the WalletConnect modal / HashPack prompt
            console.log("before open modal");
            await dAppConnector.openModal();
            console.log("it opened")

            if (dAppConnector.signers.length > 0) {
                console.log("length > 0")
                const activeSigner = dAppConnector.signers[0];
                console.log(`we'll set ${activeSigner} as signer`)
                setSigner(activeSigner);
                setAccountId(activeSigner.getAccountId().toString());
                setIsConnected(true);
            }
        } catch (error) {
            console.error("Connection failed:", error);
        }
    };

    const disconnect = async () => {
        await dAppConnector.disconnectAll();
        setSigner(null);
        setAccountId("");
        setIsConnected(false);
    };

    return { signer, accountId, isConnected, connect, disconnect };
}
