import { ethers } from "ethers";
import YourContractABI from "./Entry.json"
import { ContractViewer } from "./ContractViewer";
const provider = new ethers.JsonRpcProvider(
  "https://testnet.hashio.io/api"
);

const contractId = "0.0.10871818";

const contractAddress =
  await ContractViewer.getEvmAddress(contractId);

console.log("Native ID:", contractId);
console.log("EVM address:", contractAddress);

const contract = new ethers.Contract(
  contractAddress,
  YourContractABI.abi,
  provider
);