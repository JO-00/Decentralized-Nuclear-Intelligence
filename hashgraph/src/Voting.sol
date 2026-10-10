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
    modifier model_vote_not_exist(address model_owner){
        for (uint256 i = 0 ; i < ModelReputations[model_owner].length ; i++){
            if (model_owner == ModelReputations[model_owner][i]) revert ("vote already exists");
        }
        _;
    }

    function upvote_model(address model_owner) model_exists(model_owner) public model_vote_not_exist(model_owner ) {
        ModelReputations[model_owner].push(msg.sender);
    }
    function downvote_model(address model_owner) model_exists(model_owner) public {
        address[] storage voters = ModelReputations[model_owner];

        for (uint256 i = 0; i < voters.length; i++) {
            if (voters[i] == msg.sender) {
                voters[i] = voters[voters.length - 1];
                voters.pop();
                return;
            }
        }

        revert("you have not upvoted this model");
    }

        function upvote_logfile(address inquirer, string memory hfs_ref) public {
        bool result;
        uint256 index;
        (result, index) = getLogfileIndex(inquirer, hfs_ref);
        require(result, string.concat(
            "didnt find log file with HFS ref = ",
            hfs_ref
        ));

        address[] storage voters = LogFileReputations[hfs_ref];
        for (uint256 i = 0; i < voters.length; i++) {
            if (voters[i] == msg.sender) revert("vote already exists");
        }

        voters.push(msg.sender);
    }

    function downvote_logfile(address inquirer, string memory hfs_ref) public {
        bool result;
        uint256 index;
        (result, index) = getLogfileIndex(inquirer, hfs_ref);
        require(result, string.concat(
            "didnt find log file with HFS ref = ",
            hfs_ref
        ));

        address[] storage voters = LogFileReputations[hfs_ref];

        for (uint256 i = 0; i < voters.length; i++) {
            if (voters[i] == msg.sender) {
                voters[i] = voters[voters.length - 1];
                voters.pop();
                return;
            }
        }

        revert("you have not upvoted this logfile");
    }

}




