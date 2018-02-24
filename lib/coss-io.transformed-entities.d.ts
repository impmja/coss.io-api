import { CossIORawTicker, CossIORawSession } from './coss-io.raw-entities';
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
export declare const transformTicker: (data: CossIORawTicker) => CossIOTicker;
export declare const transformTickerList: (data: CossIORawTicker[]) => CossIOTicker[];
export declare const transformSession: (data: CossIORawSession) => CossIOSession;
export declare const transformDepth: (params: {
    data: [[string, string][], [string, string][]];
    level: number;
}) => CossIODepth;
