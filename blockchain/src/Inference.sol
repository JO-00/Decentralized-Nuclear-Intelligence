// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {ModelReport} from "./data_structures.sol";
import {BaseContract} from "./BaseContract.sol";
import {IInference} from "./interfaces.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
 

abstract contract Inference is BaseContract , IInference {
    function save_inference(address inquirer , string memory hfs_ref) public {
        require(
            requests[inquirer].length > 0,
            string.concat("no such inquirer associated with the address ", Strings.toHexString(inquirer))
        );

        ModelReports[msg.sender].push(ModelReport({
            inquirer : inquirer,
            hfs_ref_report : hfs_ref
        }));

    } 






}