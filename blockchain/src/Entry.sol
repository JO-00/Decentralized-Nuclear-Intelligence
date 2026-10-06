// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {BaseContract} from "./BaseContract.sol";
import {Inference} from "./Inference.sol";
import {Register} from "./Register.sol";
import {Visualization} from "./Visualization.sol";
import {Voting} from "./Voting.sol";

contract Entry is Inference , Register , Visualization , Voting {
    constructor(uint256 request_fee , uint256 model_fee) BaseContract(request_fee , model_fee) {}
}


