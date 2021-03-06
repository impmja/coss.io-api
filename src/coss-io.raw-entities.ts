export interface CossIORawError {
  successful: boolean;
  payload: string;
}

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

export interface CossIORawSessionPayload {
  guid: string;
  full_name?: any;
  username: string;
  email_address: string;
  kyc_level_guid?: any;
  referral_code: string;
  tx_fee_make: string;
  tx_fee_take: string;
  twofactor_active: boolean;
  maker_fee_percentage: string;
  taker_fee_percentage: string;
  site_updates_count: string;
}

export interface CossIORawSession {
  successful: boolean;
  payload: CossIORawSessionPayload;
}

export type CossIORawDepthSide = [string, string];
export type CossIORawDepthSideList = CossIORawDepthSide[];
export type CossIORawDepth = [CossIORawDepthSideList, CossIORawDepthSideList];

export interface CossIORawHistoryOrder {
  guid: string;
  action: string;
  amount: string;
  price: string;
  total: string;
  created_at: number;
}

export type CossIORawHistoryOrderList = CossIORawHistoryOrder[];

export interface CossIORawOrder {
  amount: string;
  created_at: number;
  order_guid: string;
  pair_id: string;
  price: string;
  total: string;
  type: string;
  tradeType: string;
}
export type CossIORawOrderList = CossIORawOrder[];

export type CossIORawTradeType = 'buy' | 'sell';

export type CossIORawOrderType = 'market' | 'limit';

export interface CossIORawTrade {
  pairId: string;
  tradeType: CossIORawTradeType;
  orderType: CossIORawOrderType;
  orderPrice?: string;
  orderAmount: string;
  orderTotalWithFee: string;
  orderTotalWithoutFee: string;
  feeValue: string;
  fee: string;
}

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

export type CossIORawWalletList = CossIORawWallet[];

export interface CossIORawUserWallets {
  wallets: CossIORawWalletList;
}

export interface CossIORawUserWalletsRoot {
  successful: boolean;
  payload: CossIORawUserWallets;
}
