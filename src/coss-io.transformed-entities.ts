import {
  CossIORawTicker,
  CossIORawMarketPair,
  CossIORawTickerList,
  CossIORawSession,
  CossIORawDepth,
  CossIORawDepthSideList,
} from './coss-io.raw-entities';

export interface CossIOTradingPair {
  id: string;
  fullName: string;
  quote: string;
  base: string;
}

export enum CossIOTickerDirection {
  UP = 'UP',
  DOWN = 'DOWN',
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

export type CossIOTickerList = CossIOTicker[];

export interface CossIOSession {
  successful: boolean;
  payload: string[];
}

export interface CossIODepthSide {
  price: number;
  volume: number;
}

export type CossIODepthSideList = CossIODepthSide[];

export interface CossIODepth {
  asks: CossIODepthSideList;
  bids: CossIODepthSideList;
}

export const transformTicker = (data: CossIORawTicker): CossIOTicker => {
  const {
    id,
    pair: fullName,
    first: quote,
    second: base,
    volume,
    volumeUsd,
    price,
    priceDirection,
    change,
    start24h,
    high24h,
    low24h,
    high,
    low,
  } = data;

  return {
    tradingPair: {
      id,
      fullName,
      quote,
      base,
    },
    volume: parseFloat(volume),
    volumeUsd: parseFloat(volumeUsd),
    price: parseFloat(price),
    start24h: parseFloat(start24h || '0.0'),
    high24h: parseFloat(high || high24h || '0.0'),
    low24h: parseFloat(low || low24h || '0.0'),
    direction:
      priceDirection.toLowerCase() === 'up' ? CossIOTickerDirection.UP : CossIOTickerDirection.DOWN,
    change: parseFloat(change),
  };
};

export const transformTickerList = (data: CossIORawTickerList): CossIOTickerList => {
  const result = [];
  for (const pair of data) {
    result.push(transformTicker(pair));
  }
  return result;
};

export const transformSession = (data: CossIORawSession): CossIOSession => {
  const { successful, payload } = data;

  return {
    successful,
    payload,
  };
};

export const transformDepth = (params: { data: CossIORawDepth; level: number }): CossIODepth => {
  const { data, level = 5 } = params;
  const result = { asks: [], bids: [] };
  if (!data) {
    return result;
  }

  const transform = (values: CossIORawDepthSideList): CossIODepthSideList => {
    const depth = [];
    const limit = Math.min(level, values.length);

    for (let i = 0; i < limit; ++i) {
      const value = values[i];
      depth.push({
        price: parseFloat(value[0]),
        volume: parseFloat(value[1]),
      });
    }

    return depth;
  };

  return {
    bids: transform(data[0]),
    asks: transform(data[1]),
  };
};
