import { ethers } from "ethers";

// Compute exact 4-byte selector for "ApplyAsOracle()"
const functionSelector = ethers.id("ApplyAsOracle()").slice(0, 10); // "0x092e47ff"

console.log(functionSelector)