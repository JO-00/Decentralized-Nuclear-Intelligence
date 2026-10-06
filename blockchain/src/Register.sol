// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IRegister} from "./interfaces.sol";
import {BaseContract} from "./BaseContract.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {model} from "./data_structures.sol";

abstract contract Register is IRegister, BaseContract {
    using Strings for uint256;



    modifier oracle() {
        require(isOracle[msg.sender], "must be an oracle to submit log file");
        _;
    }

    function requestReactorState() external  payable returns (bool) {
        uint256 fee = this.RequestFee(); // Store in local variable to save gas

        require(
            msg.value >= fee, 
            string.concat("a minimum amount of ", fee.toString())
        );

        // Mark that this user has initiated a request
        hasActiveRequest[msg.sender] = true;

        // Refund any excess ETH sent above the required fee back to msg.sender
        if (msg.value > fee) {
            uint256 excess = msg.value - fee;
            (bool success, ) = msg.sender.call{value: excess}("");
            require(success, "could not refund excess ETH");
        }

        // The exact 'fee' amount stays in address(this).balance (Treasury)
        return true;
    }

    function submitLogFile(address inquirer, string memory hfs_ref) external oracle returns (bool) {
        // Fix: Check the tracking boolean or array length instead of raw array
        require(hasActiveRequest[inquirer], "the request you're answering doesn't exist");

        requests[inquirer].push(hfs_ref);
        
        return true;
    }

    function ProposeModel(string memory ipfs_ref) external payable returns (bool){
        require(msg.value >= this.ModelProposalFee() , string.concat(
            "to propose a model you must provide at least ",
            this.ModelProposalFee().toString()
            ));

        models[msg.sender] = model(
            {
                ipfs_ref : ipfs_ref,
                owner : msg.sender
            }
        );
        return true;

    }

    
}