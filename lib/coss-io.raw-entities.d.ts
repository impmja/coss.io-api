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
