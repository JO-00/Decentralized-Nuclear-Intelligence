// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IVisualization, SystemOverview , ModelDetails , InquirerDetails} from "./interfaces.sol";
import {BaseContract} from "./BaseContract.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {model, ModelReport} from "./data_structures.sol";

abstract contract Visualization is BaseContract, IVisualization {
    using Strings for address;

    function getSystemOverview() external view returns (SystemOverview memory) {
        return SystemOverview({
            totalOracles: oracles.length,
            requestFee: RequestFee,
            modelProposalFee: ModelProposalFee,
            owner: owner
        });
    }
    function getRecentInquiries() external view returns (address[] memory) {
        address[] memory result = new address[](inquiryCount);
        for (uint256 i = 0; i < inquiryCount; i++) {
            result[i] = recent_inquiries[i];
        }
        return result;
    }

    function isModelRegistered(address modelOwner) public view returns (bool) {
        return models[modelOwner].owner != address(0);
    }

    /// @notice Returns full aggregate data for a single model (Model metadata, Reputation, Reports, Existence).
    function getModelFullDetails(address modelOwner) external view returns (ModelDetails memory) {
        model memory m = models[modelOwner];
        bool exists = m.owner != address(0);

        return ModelDetails({
            modelOwner: modelOwner,
            ipfsRef: exists ? m.ipfs_ref : "",
            reputation: ModelReputations[modelOwner].length,
            reportCount: ModelReports[modelOwner].length,
            exists: exists
        });
    }

    /// @notice Batch fetches multiple models by their owners' addresses for grid/list views.
    function getBatchModelDetails(address[] calldata modelOwners) external view returns (ModelDetails[] memory) {
        uint256 count = modelOwners.length;
        ModelDetails[] memory batch = new ModelDetails[](count);

        for (uint256 i = 0; i < count; i++) {
            address ownerAddr = modelOwners[i];
            model memory m = models[ownerAddr];
            bool exists = m.owner != address(0);

            batch[i] = ModelDetails({
                modelOwner: ownerAddr,
                ipfsRef: exists ? m.ipfs_ref : "",
                reputation: ModelReputations[ownerAddr].length,
                reportCount: ModelReports[ownerAddr].length,
                exists: exists
            });
        }
        return batch;
    }

    // ==========================================
    // 3. INQUIRER & LOG FILE ANALYTICS
    // ==========================================

    /// @notice Returns full inquirer state (requests, active status, log file array).
    function getInquirerFullProfile(address inquirer) external view returns (InquirerDetails memory) {
        return InquirerDetails({
            inquirer: inquirer,
            totalRequests: requests[inquirer].length,
            hasActiveRequest: hasActiveRequest[inquirer],
            logFiles: requests[inquirer]
        });
    }

    /// @notice Returns a paginated slice of log files for an inquirer to prevent RPC timeouts on large history logs.
    function getPaginatedInquirerRequests(
        address inquirer, 
        uint256 offset, 
        uint256 limit
    ) external view returns (string[] memory paginatedRequests, uint256 total) {
        total = requests[inquirer].length;
        
        if (offset >= total || limit == 0) {
            return (new string[](0), total);
        }

        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }

        uint256 resultLength = end - offset;
        paginatedRequests = new string[](resultLength);

        for (uint256 i = 0; i < resultLength; i++) {
            paginatedRequests[i] = requests[inquirer][offset + i];
        }

        return (paginatedRequests, total);
    }

    /// @notice Fetches multiple log file reputations in a single query for bulk table renders.
    function getBatchLogFileReputations(string[] calldata ipfsRefs) external view returns (uint256[] memory reputations) {
        uint256 count = ipfsRefs.length;
        reputations = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            reputations[i] = LogFileReputations[ipfsRefs[i]].length;
        }
        return reputations;
    }

    // ==========================================
    // 4. MODEL REPORTS & AUDIT TRAIL
    // ==========================================

    /// @notice Returns paginated security reports submitted against a model.
    function getPaginatedModelReports(
        address modelOwner, 
        uint256 offset, 
        uint256 limit
    ) external view returns (ModelReport[] memory paginatedReports, uint256 total) {
        total = ModelReports[modelOwner].length;

        if (offset >= total || limit == 0) {
            return (new ModelReport[](0), total);
        }

        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }

        uint256 resultLength = end - offset;
        paginatedReports = new ModelReport[](resultLength);

        for (uint256 i = 0; i < resultLength; i++) {
            paginatedReports[i] = ModelReports[modelOwner][offset + i];
        }

        return (paginatedReports, total);
    }

    // ==========================================
    // 5. ORACLE MANAGEMENT & PERMISSIONS
    // ==========================================

    /// @notice Returns a paginated list of registered oracles.
    function getPaginatedOracles(
        uint256 offset, 
        uint256 limit
    ) external view returns (address[] memory paginatedOracles, uint256 total) {
        total = oracles.length;

        if (offset >= total || limit == 0) {
            return (new address[](0), total);
        }

        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }

        uint256 resultLength = end - offset;
        paginatedOracles = new address[](resultLength);

        for (uint256 i = 0; i < resultLength; i++) {
            paginatedOracles[i] = oracles[offset + i];
        }

        return (paginatedOracles, total);
    }

    /// @notice Validates multiple oracle addresses in a single call.
    function getBatchOracleStatus(address[] calldata candidates) external view returns (bool[] memory statuses) {
        uint256 count = candidates.length;
        statuses = new bool[](count);

        for (uint256 i = 0; i < count; i++) {
            statuses[i] = isOracle[candidates[i]];
        }
        return statuses;
    }
}