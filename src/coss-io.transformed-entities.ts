import {
  CossIORawTicker,
  CossIORawMarketPair,
  CossIORawTickerList,
  CossIORawSession,
  CossIORawDepth,
  CossIORawDepthSideList,
  CossIORawOrder,
  CossIORawOrderList,
  CossIORawWallet,
  CossIORawUserWalletsRoot,
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
  makerFee: number;
  makerFeePercentage: number;
  takeFee: number;
  takerFeePercentage: number;
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

export enum CossIOOrderSide {
  BUY = 'buy',
  SELL = 'sell',
}

export interface CossIOOrder {
  id: string;
  side: CossIOOrderSide;
  amount: number;
  price: number;
  total: number;
  timestamp: Date;
}

export type CossIOOrderList = CossIOOrder[];

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

export type CossIOWalletList = CossIOWallet[];

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
  const {
    successful,
    payload = {
      tx_fee_make: '0.002',
      tx_fee_take: '0.002',
      maker_fee_percentage: '0.002',
      taker_fee_percentage: '0.002',
    },
  } = data;
  const { tx_fee_make, tx_fee_take, maker_fee_percentage, taker_fee_percentage } = payload;

  return {
    makerFee: parseFloat(tx_fee_make),
    makerFeePercentage: parseFloat(maker_fee_percentage),
    takeFee: parseFloat(tx_fee_take),
    takerFeePercentage: parseFloat(taker_fee_percentage),
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

export const transformOrder = (data: CossIORawOrder): CossIOOrder => {
  const { guid: id, action, amount, price, total, created_at } = data;
  return {
    id,
    side: action.toLowerCase() === 'buy' ? CossIOOrderSide.BUY : CossIOOrderSide.SELL,
    amount: parseFloat(amount),
    price: parseFloat(price),
    total: parseFloat(total),
    timestamp: new Date(created_at),
  };
};

export const transformOrders = (data: CossIORawOrderList): CossIOOrderList => {
  const result = [];
  for (const order of data) {
    result.push(transformOrder(order));
  }
  return result;
};

export const transformWallet = (data: CossIORawWallet): CossIOWallet => {
  const {
    guid: id,
    user_guid: userId,
    reference,
    cold_wallet_balance,
    transaction_id: transactionId = null,
    orders_balance,
    last_transaction_id: lastTransactionId = null,
    last_block_number,
    has_pending_deposit_transactions: hasPendingDepositTransactions,
    currencyGuid,
    currencyType,
    currencyName,
    currencyCode,
    currencyPrecision,
    currencyDisplayLabel,
    currencyIsErc20Token,
    currencyWithdrawalFee,
    currencyMinWithdrawalAmount,
    currencyMinDepositAmount,
    currencyIsWithdrawalLocked,
    currencyIsDepositLocked,
  } = data;

  return {
    id,
    userId,
    reference,
    availableBalance: parseFloat(cold_wallet_balance),
    transactionId,
    lockedBalance: parseFloat(orders_balance),
    lastTransactionId,
    lastBlockNumber: parseInt(last_block_number, 10),
    hasPendingDepositTransactions,
    currencyGuid,
    currencyType,
    currencyName,
    currencyCode,
    currencyPrecision,
    currencyDisplayLabel,
    currencyIsErc20Token,
    currencyWithdrawalFee: parseFloat(currencyWithdrawalFee),
    currencyMinWithdrawalAmount: parseFloat(currencyMinWithdrawalAmount),
    currencyMinDepositAmount: parseFloat(currencyMinDepositAmount),
    currencyIsWithdrawalLocked,
    currencyIsDepositLocked,
  };
};

export const transformWallets = (data: CossIORawUserWalletsRoot): CossIOWalletList => {
  const { payload = { wallets: [] } } = data;
  const { wallets = [] } = payload;

  const result = [];
  for (const wallet of wallets) {
    result.push(transformWallet(wallet));
  }
  return result;
};
