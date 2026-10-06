// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {model, SystemOverview, ModelDetails , InquirerDetails, ModelReport} from "./data_structures.sol";


interface IRegister{
    function ProposeModel(string memory ipfs_ref) external payable returns (bool);
    function submitLogFile(address inquirer, string memory hfs_ref) external returns (bool);
    function requestReactorState() external  payable returns (bool);
}

interface IVoting{
    function downvote_model(address model_owner) external ;
    function upvote_model(address model_owner) external ;
    function upvote_logfile (address inquirer , string memory hfs_ref) external;
    function downvote_logfile (address inquirer , string memory hfs_ref) external;
}

interface IInference{
    function save_inference(address inquirer , string memory hfs_ref) external;
}


interface IVisualization {

    // 1. Dashboard Overview
    function getSystemOverview() external view returns (SystemOverview memory);

    // 2. Model Explorer & Registry
    function isModelRegistered(address modelOwner) external view returns (bool);
    function getModelFullDetails(address modelOwner) external view returns (ModelDetails memory);
    function getBatchModelDetails(address[] calldata modelOwners) external view returns (ModelDetails[] memory);

    // 3. Inquirer & Log File Analytics
    function getInquirerFullProfile(address inquirer) external view returns (InquirerDetails memory);
    function getPaginatedInquirerRequests(
        address inquirer, 
        uint256 offset, 
        uint256 limit
    ) external view returns (string[] memory paginatedRequests, uint256 total);
    function getBatchLogFileReputations(string[] calldata hfsRefs) external view returns (uint256[] memory reputations);

    // 4. Model Reports & Audit Trail
    function getPaginatedModelReports(
        address modelOwner, 
        uint256 offset, 
        uint256 limit
    ) external view returns (ModelReport[] memory paginatedReports, uint256 total);

    // 5. Oracle Management & Permissions
    function getPaginatedOracles(
        uint256 offset, 
        uint256 limit
    ) external view returns (address[] memory paginatedOracles, uint256 total);
    function getBatchOracleStatus(address[] calldata candidates) external view returns (bool[] memory statuses);
}

