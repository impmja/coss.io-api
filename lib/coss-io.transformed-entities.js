"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CossIOTickerDirection;
(function (CossIOTickerDirection) {
    CossIOTickerDirection["UP"] = "UP";
    CossIOTickerDirection["DOWN"] = "DOWN";
})(CossIOTickerDirection = exports.CossIOTickerDirection || (exports.CossIOTickerDirection = {}));
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
