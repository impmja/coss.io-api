export interface CossIORawTicker {
    id: string;
    pair: string;
    first: string;
    second: string;
    firstPrecision: number;
    secondPrecision: number;
    volume: string;
    volumeUsd: string;
    price: string;
    priceDirection: string;
    change: string;
    start24h?: string;
    high24h?: string;
    low24h?: string;
    high?: string;
    low?: string;
}
export declare type CossIORawTickerList = CossIORawTicker[];
export interface CossIORawMarketPair {
    currency: CossIORawTicker;
    accountOrders: any[];
    accountOrderHistory: any[];
}
export interface CossIORawSession {
    successful: boolean;
    payload: string[];
}
export declare type CossIORawDepthSide = [string, string];
export declare type CossIORawDepthSideList = CossIORawDepthSide[];
export declare type CossIORawDepth = [CossIORawDepthSideList, CossIORawDepthSideList];
export interface CossIORawOrder {
    guid: string;
    action: string;
    amount: string;
    price: string;
    total: string;
    created_at: number;
}
export declare type CossIORawOrderList = CossIORawOrder[];
export interface CossIORawWallet {
    guid: string;
    user_guid: string;
    reference: string;
    cold_wallet_balance: string;
    transaction_id?: any;
    orders_balance: string;
    last_transaction_id?: any;
    last_block_number: string;
    has_pending_deposit_transactions: boolean;
    currencyGuid: string;
    currencyType: string;
    currencyName: string;
    currencyCode: string;
    currencyPrecision: number;
    currencyDisplayLabel: string;
    currencyIsErc20Token: boolean;
    currencyWithdrawalFee: string;
    currencyMinWithdrawalAmount: string;
    currencyMinDepositAmount: string;
    currencyIsWithdrawalLocked: boolean;
    currencyIsDepositLocked: boolean;
}
export declare type CossIORawWalletList = CossIORawWallet[];
export interface CossIORawUserWallets {
    wallets: CossIORawWalletList;
}
export interface CossIORawUserWalletsRoot {
    successful: boolean;
    payload: CossIORawUserWallets;
}
