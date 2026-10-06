// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {model, ModelReport} from "./data_structures.sol";


abstract contract BaseContract{
    address public owner;
    uint256 public RequestFee;
    uint256 public ModelProposalFee;
    address[] public oracles;
    mapping(address => bool) public isOracle;
    
    // Maps inquirer address => array of log file references submitted by oracles
    mapping(address => string[]) public requests;

    // Optional: Track active pending requests if needed
    mapping(address => bool) public hasActiveRequest;

    mapping(address => model) public models;
    
    mapping(address => uint256) public ModelReputations; //the address is the owner of the model

    mapping(string => uint256) public LogFileReputations;

    mapping(address => ModelReport[]) public ModelReports;


    constructor(uint256 request_fee , uint256 model_fee){
        RequestFee = request_fee;
        ModelProposalFee = model_fee;
    }


}
