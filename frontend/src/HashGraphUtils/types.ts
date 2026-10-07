import {BigNumber} from 'bignumber.js'

export interface owner_contract {
    owner_address : string,
    contract_address : string;
}


export interface SystemOverview{
    totalOracles : number;
    requestFee: BigNumber
    modelProposalFee: BigNumber,
    owner: string
}

export interface ModelDetails {
            
    modelOwner: string,
    ipfsRef: string,
    reputation: BigNumber,
    reportCount: BigNumber,
    exists: boolean 
}

export interface InquirerDetails {
    inquirer: string,
    totalRequests: BigNumber,
    hasActiveRequest: boolean,
    logFiles: string[]
}

export interface Oracles{
    oracles : string[]
    total_count : BigNumber
}


export interface ModelReport{
    inquirer : string
    hfs_ref_report : string
    
}



