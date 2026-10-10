# Transparent Safety-Critical Systems on Hedera
 
A proof of concept showing that safety-critical systems don't have to be confidential. The demo tracks a simplified nuclear reactor, but the pattern applies to any safety-critical system: energy grids, spacecraft and rocket telemetry, aviation, medical and industrial control systems.
 
## Features
 
- **Reactor state requests:** pay a fee (set at contract creation) to request the reactor state.
- **Oracle-fed logs:** multiple oracles respond with log files (fixed sampling frequency and duration), stored on IPFS.
- **Community anomaly detection models:** users pay a fee to propose a model; only its IPFS reference is stored on the contract.
- **Voting:** anyone can vote on models and log files to build credibility.
- **Model reports and zkML:** publish detailed inference reports, optionally with zkML proofs that users verify locally using the guide in the Lab.
- **Lab:** download, upload and visually compare log files.
- **Synthetic datasets:** choose a probability distribution and get a noisy `dataset.csv` generated with Bounded Entropy Injection (controlled randomness injection), bypassing real-data scarcity.
## Setup
 
Requirements: Docker with Compose v2, a `DatasetGeneration/.env` file, and free ports `5173` and `8000`.
 
```bash
chmod +x ./entrypoint.sh   # first time only
./entrypoint.sh
```
 
Then open:
 
- App: http://localhost:5173
- API health: http://localhost:8000/health
