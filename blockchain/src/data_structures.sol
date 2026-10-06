// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


struct model{
    string ipfs_ref;
    address owner;
}

struct ModelReport{
    address inquirer;
    string hfs_ref_report;
    
}
struct ModelDetails {
        address modelOwner;
        string ipfsRef;
        uint256 reputation;
        uint256 reportCount;
        bool exists;
    }

    struct InquirerDetails {
        address inquirer;
        uint256 totalRequests;
        bool hasActiveRequest;
        string[] logFiles;
    }

    struct SystemOverview {
        uint256 totalOracles;
        uint256 requestFee;
        uint256 modelProposalFee;
        address owner;
    }

