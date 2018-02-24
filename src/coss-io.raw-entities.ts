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

export type CossIORawTickerList = CossIORawTicker[];

export interface CossIORawMarketPair {
  currency: CossIORawTicker;
  accountOrders: any[];
  accountOrderHistory: any[];
}

export interface CossIORawSession {
  successful: boolean;
  payload: string[];
}

export type CossIORawDepthSide = [string, string];
export type CossIORawDepthSideList = CossIORawDepthSide[];
export type CossIORawDepth = [CossIORawDepthSideList, CossIORawDepthSideList];
