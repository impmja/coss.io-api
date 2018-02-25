"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CossIOTickerDirection;
(function (CossIOTickerDirection) {
    CossIOTickerDirection["UP"] = "UP";
    CossIOTickerDirection["DOWN"] = "DOWN";
})(CossIOTickerDirection = exports.CossIOTickerDirection || (exports.CossIOTickerDirection = {}));
var CossIOOrderSide;
(function (CossIOOrderSide) {
    CossIOOrderSide["BUY"] = "buy";
    CossIOOrderSide["SELL"] = "sell";
})(CossIOOrderSide = exports.CossIOOrderSide || (exports.CossIOOrderSide = {}));
exports.transformTicker = (data) => {
    const { id, pair: fullName, first: quote, second: base, volume, volumeUsd, price, priceDirection, change, start24h, high24h, low24h, high, low, } = data;
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
        direction: priceDirection.toLowerCase() === 'up' ? CossIOTickerDirection.UP : CossIOTickerDirection.DOWN,
        change: parseFloat(change),
    };
};
exports.transformTickerList = (data) => {
    const result = [];
    for (const pair of data) {
        result.push(exports.transformTicker(pair));
    }
    return result;
};
exports.transformSession = (data) => {
    const { successful, payload } = data;
    return {
        successful,
        payload,
    };
};
exports.transformDepth = (params) => {
    const { data, level = 5 } = params;
    const result = { asks: [], bids: [] };
    if (!data) {
        return result;
    }
    const transform = (values) => {
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
exports.transformOrder = (data) => {
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
exports.transformOrders = (data) => {
    const result = [];
    for (const order of data) {
        result.push(exports.transformOrder(order));
    }
    return result;
};
exports.transformWallet = (data) => {
    const { guid: id, user_guid: userId, reference, cold_wallet_balance: coldWalletBalance, transaction_id: transactionId = null, orders_balance, last_transaction_id: lastTransactionId = null, last_block_number, has_pending_deposit_transactions: hasPendingDepositTransactions, currencyGuid, currencyType, currencyName, currencyCode, currencyPrecision, currencyDisplayLabel, currencyIsErc20Token, currencyWithdrawalFee, currencyMinWithdrawalAmount, currencyMinDepositAmount, currencyIsWithdrawalLocked, currencyIsDepositLocked, } = data;
    return {
        id,
        userId,
        reference,
        coldWalletBalance,
        transactionId,
        ordersBalance: parseFloat(orders_balance),
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
exports.transformWallets = (data) => {
    const { payload = { wallets: [] } } = data;
    const { wallets = [] } = payload;
    const result = [];
    for (const wallet of wallets) {
        result.push(exports.transformWallet(wallet));
    }
    return result;
};
