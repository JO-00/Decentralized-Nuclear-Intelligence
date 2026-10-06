// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IVoting} from "./interfaces.sol";
import {BaseContract} from "./BaseContract.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {model} from "./data_structures.sol";

abstract contract Voting is BaseContract , IVoting{

    modifier model_exists(address model_owner){
        require(models[model_owner].owner != address(0) , "no model associated with given owner");
        _;
    }
    
    function getLogfileIndex(address inquirer, string memory hfs_ref) 
        internal 
        view 
        returns (bool found, uint256 index) 
    {
        uint256 len = requests[inquirer].length;
        bytes32 targetHash = keccak256(bytes(hfs_ref));

        for (uint256 i = 0; i < len; i++) {
            if (keccak256(bytes(requests[inquirer][i])) == targetHash) {
                return (true, i); // Found: return true and the index
            }
        }
        return (false, 0); // Not found
    }

    function upvote_model(address model_owner) model_exists(model_owner) public {
        ModelReputations[model_owner] += 1;
    }
    function downvote_model(address model_owner) model_exists(model_owner) public {
        require(ModelReputations[model_owner] > 0 , "model cannot be downvoted");
        ModelReputations[model_owner] -= 1;
    }

    function upvote_logfile (address inquirer , string memory hfs_ref) public {
        bool result;
        uint256 index;
        (result , index) = getLogfileIndex(inquirer, hfs_ref);
        require(result , string.concat(
            "didnt find log file with HFS ref = ",
            hfs_ref
        ));

        LogFileReputations[hfs_ref] += 1;
        
    }
    function downvote_logfile (address inquirer , string memory hfs_ref) public {
        bool result;
        uint256 index;
        (result , index) = getLogfileIndex(inquirer, hfs_ref);
        require(result , string.concat(
            "didnt find log file with HFS ref = ",
            hfs_ref
        ));

        require(LogFileReputations[hfs_ref] > 0 , "cannot downvote the file");

        LogFileReputations[hfs_ref] -= 1;
    }

}




