import { CossIORawTicker, CossIORawSession, CossIORawOrder, CossIORawWallet, CossIORawUserWalletsRoot } from './coss-io.raw-entities';
export interface CossIOTradingPair {
    id: string;
    fullName: string;
    quote: string;
    base: string;
}
export declare enum CossIOTickerDirection {
    UP = "UP",
    DOWN = "DOWN",
}
export interface CossIOTicker {
    tradingPair: CossIOTradingPair;
    volume: number;
    volumeUsd: number;
    price: number;
    direction: CossIOTickerDirection;
    change: number;
    start24h: number;
    high24h: number;
    low24h: number;
}
export declare type CossIOTickerList = CossIOTicker[];
export interface CossIOSession {
    successful: boolean;
    payload: string[];
}
export interface CossIODepthSide {
    price: number;
    volume: number;
}
export declare type CossIODepthSideList = CossIODepthSide[];
export interface CossIODepth {
    asks: CossIODepthSideList;
    bids: CossIODepthSideList;
}
export declare enum CossIOOrderSide {
    BUY = "buy",
    SELL = "sell",
}
export interface CossIOOrder {
    id: string;
    side: CossIOOrderSide;
    amount: number;
    price: number;
    total: number;
    timestamp: Date;
}
export declare type CossIOOrderList = CossIOOrder[];
export interface CossIOWallet {
    id: string;
    userId: string;
    reference: string;
    availableBalance: number;
    transactionId?: string;
    lockedBalance: number;
    lastTransactionId?: string;
    lastBlockNumber: number;
    hasPendingDepositTransactions: boolean;
    currencyGuid: string;
    currencyType: string;
    currencyName: string;
    currencyCode: string;
    currencyPrecision: number;
    currencyDisplayLabel: string;
    currencyIsErc20Token: boolean;
    currencyWithdrawalFee: number;
    currencyMinWithdrawalAmount: number;
    currencyMinDepositAmount: number;
    currencyIsWithdrawalLocked: boolean;
    currencyIsDepositLocked: boolean;
}
export declare type CossIOWalletList = CossIOWallet[];
export declare const transformTicker: (data: CossIORawTicker) => CossIOTicker;
export declare const transformTickerList: (data: CossIORawTicker[]) => CossIOTicker[];
export declare const transformSession: (data: CossIORawSession) => CossIOSession;
export declare const transformDepth: (params: {
    data: [[string, string][], [string, string][]];
    level: number;
}) => CossIODepth;
export declare const transformOrder: (data: CossIORawOrder) => CossIOOrder;
export declare const transformOrders: (data: CossIORawOrder[]) => CossIOOrder[];
export declare const transformWallet: (data: CossIORawWallet) => CossIOWallet;
export declare const transformWallets: (data: CossIORawUserWalletsRoot) => CossIOWallet[];
