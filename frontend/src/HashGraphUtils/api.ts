import {owner_contract} from "./types";


export async function getContractIds(): Promise<owner_contract[]> {
    const url = import.meta.env.VITE_BACKEND_URL + "/get_contracts";
    const response = await fetch(url);

    

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
        // This is the exact check that would have saved you
        const text = await response.text();
        throw new Error(`Expected JSON but got ${contentType}: ${text.slice(0, 100)}`);
    }

    return await response.json() as owner_contract[];
}

export async function SaveContractId(wallet_address : string , contract_address : string) : Promise<boolean> {
    const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + "/save_contract",
        {
            "body" : JSON.stringify({owner : wallet_address , contract : contract_address}),
            "headers" : {"Content-Type" : "application/json"},
            "method" : "POST"
        }
    )
    if (!response.ok) throw new Error("Couldn't save contract address")
    const done = await response.json()
    return done;
}






