/* ============================================================
* coss.io API
* https://github.com/impmja/coss.io
* ============================================================
* Copyright 2018-, Jan (impmja) Schulte
* Released under the MIT License
* ============================================================ */
import * as http from 'http';
import * as urlHelper from 'url';
import * as qs from 'querystring';
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';

import {
  CossIORawError,
  CossIORawMarketPair,
  CossIORawDepth,
  CossIORawHistoryOrder,
  CossIORawTrade,
  CossIORawOrderType,
} from './coss-io.raw-entities';
import {
  CossIOTicker,
  CossIOTickerList,
  CossIOSession,
  CossIODepth,
  CossIOHistoryOrder,
  CossIOHistoryOrderList,
  CossIOOrder,
  CossIOOrderList,
  CossIOWalletList,
  CossIOOrderSide,
  CossIOOrderType,
  transformTicker,
  transformTickerList,
  transformSession,
  transformDepth,
  transformHistoryOrder,
  transformHistoryOrders,
  transformOpenOrders,
  transformWallets,
  transformError,
} from './coss-io.transformed-entities';

import { CossIOError } from './coss-io.error';

enum CossIORestApiRequestVerb {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
}

enum CossIORestApiSecurity {
  Public,
  Private,
}

export interface CossIOCookie {
  xsrf: string;
  coss: string;
  cfduid: string;
}

export class CossIO {
  private static readonly API_BASE_URL: string = 'https://exchange.coss.io/api/';
  private static readonly API_SESSION_ENDPOINT: string = 'session/';
  private static readonly API_USER_ORDERS_ENDPOINT: string = 'user/orders/';
  private static readonly API_USER_WALLETS_ENDPOINT: string = 'user/wallets/';
  private static readonly API_OPEN_ORDER_HISTORY_ENDPOINT: string = 'order-history/';
  private static readonly API_DEPTH_ENDPOINT: string = 'integrated-market/depth/';
  private static readonly API_MARKET_PAIRS_ENDPOINT: string = 'integrated-market/pairs/';
  private static readonly API_MARKET_PAIR_ENDPOINT: string = 'integrated-market/pair-data/';
  private static readonly API_MARKET_ORDER_BUY_ENDPOINT: string = 'market-order/buy';
  private static readonly API_MARKET_ORDER_SELL_ENDPOINT: string = 'market-order/sell';
  private static readonly API_LIMIT_ORDER_BUY_ENDPOINT: string = 'limit-order/buy';
  private static readonly API_LIMIT_ORDER_SELL_ENDPOINT: string = 'limit-order/sell';

  private static readonly REQUEST_HEADER_USER_AGENT_KEY: string = 'User-Agent';
  private static readonly REQUEST_HEADER_USER_AGENT_VALUE: string = 'Mozilla/5.0 Chrome/63.0.3239.84 Safari/537.36';
  private static readonly REQUEST_HEADER_CONTENT_TYPE_KEY: string = 'Content-Type';
  private static readonly REQUEST_HEADER_CONTENT_TYPE_VALUE: string = 'application/x-www-form-urlencoded';
  private static readonly REQUEST_HEADER_ACCEPT_KEY: string = 'Accept';
  private static readonly REQUEST_HEADER_ACCEPT_VALUE: string = 'application/json';
  private static readonly REQUEST_HEADER_ORIGIN_KEY: string = 'origin';
  private static readonly REQUEST_HEADER_ORIGIN_VALUE: string = 'https://exchange.coss.io/';
  private static readonly REQUEST_HEADER_AUTHORITY_KEY: string = 'authority';
  private static readonly REQUEST_HEADER_AUTHORITY_VALUE: string = 'exchange.coss.io';
  private static readonly REQUEST_HEADER_XSRF_TOKEN_KEY: string = 'x-xsrf-token';
  private static readonly REQUEST_HEADER_COOKIE_KEY: string = 'cookie';
  private static readonly REQUEST_HEADER_PRAGMA_KEY: string = 'pragma';
  private static readonly REQUEST_HEADER_CACHE_CONTROL_KEY: string = 'cache-control';
  private static readonly REQUEST_HEADER_NO_CACHE_VALUE: string = 'no-cache';

  private readonly cookie?: CossIOCookie | null;

  public constructor(cookie?: CossIOCookie) {
    this.cookie = cookie || null;
  }

  public requestSession(): Promise<CossIOSession> {
    return this.request({
      verb: CossIORestApiRequestVerb.GET,
      url: CossIO.API_SESSION_ENDPOINT,
      security: CossIORestApiSecurity.Private,
      transformFn: transformSession,
    });
  }

  public requestUserWallets(): Promise<CossIOWalletList> {
    return this.request({
      verb: CossIORestApiRequestVerb.GET,
      url: CossIO.API_USER_WALLETS_ENDPOINT,
      security: CossIORestApiSecurity.Private,
      transformFn: transformWallets,
    });
  }

  public requestUserOrders(params: { symbol: string }): Promise<CossIOOrderList> {
    const { symbol } = params;
    if (!symbol || !symbol.length) {
      throw new CossIOError({
        message: 'Symbol is missing.',
      });
    }

    return this.request({
      verb: CossIORestApiRequestVerb.GET,
      url: urlHelper.resolve(CossIO.API_USER_ORDERS_ENDPOINT, symbol),
      security: CossIORestApiSecurity.Private,
      transformFn: transformOpenOrders,
    });
  }

  public requestOrderHistory(params: { symbol: string }): Promise<CossIOHistoryOrderList> {
    const { symbol } = params;
    if (!symbol || !symbol.length) {
      throw new CossIOError({
        message: 'Symbol is missing.',
      });
    }

    return this.request({
      verb: CossIORestApiRequestVerb.GET,
      url: urlHelper.resolve(CossIO.API_OPEN_ORDER_HISTORY_ENDPOINT, symbol),
      security: CossIORestApiSecurity.Public,
      transformFn: transformHistoryOrders,
    });
  }

  public requestDepth(params: { symbol: string; level?: number }): Promise<CossIODepth> {
    const { symbol, level = 5 } = params;
    if (!symbol || !symbol.length) {
      throw new CossIOError({
        message: 'Symbol is missing.',
      });
    }

    return this.request({
      verb: CossIORestApiRequestVerb.GET,
      url: urlHelper.resolve(CossIO.API_DEPTH_ENDPOINT, symbol),
      transformFn: (data: CossIORawDepth) => transformDepth({ data, level }),
    });
  }

  public requestTickers(): Promise<CossIOTickerList> {
    return this.request({
      verb: CossIORestApiRequestVerb.GET,
      url: CossIO.API_MARKET_PAIRS_ENDPOINT,
      transformFn: transformTickerList,
    });
  }

  public requestTicker(params: { symbol: string }): Promise<CossIOTicker> {
    const { symbol } = params;
    if (!symbol || !symbol.length) {
      throw new CossIOError({
        message: 'Symbol is missing.',
      });
    }

    return this.request({
      verb: CossIORestApiRequestVerb.GET,
      url: urlHelper.resolve(CossIO.API_MARKET_PAIR_ENDPOINT, symbol),
      transformFn: (data: CossIORawMarketPair) => {
        const { currency } = data;
        return transformTicker(currency);
      },
    });
  }

  public placeOrder(params: {
    symbol: string;
    side: CossIOOrderSide;
    type: CossIOOrderType;
    price?: number;
    amount: number;
    session: CossIOSession;
  }): Promise<void> {
    const { symbol, side, type, price, amount, session } = params;
    if (!symbol || !symbol.length) {
      throw new CossIOError({
        message: 'Symbol is missing.',
      });
    }

    if (!side) {
      throw new CossIOError({
        message: 'Order Side is missing.',
      });
    }

    if (!type) {
      throw new CossIOError({
        message: 'Order Type is missing.',
      });
    }

    if (type === CossIOOrderType.MARKET) {
      throw new CossIOError({
        message:
          'Order Type MARKET is currently not supported as we have to pull the latest ASK Orderbook entry to calculate the price...which is WTF',
      });
    }

    if (type === CossIOOrderType.LIMIT && (!price || price <= 0.0)) {
      throw new CossIOError({
        message: 'Price is missing.',
      });
    }

    if (!amount || amount <= 0.0) {
      throw new CossIOError({
        message: 'Amount is missing.',
      });
    }

    if (!session) {
      throw new CossIOError({
        message: 'Session is missing.',
      });
    }

    // NOTE: Shut the f up TS..
    const implPrice = price || 0.0;
    const orderTotalWithoutFee = implPrice * amount;
    const fee = type === CossIOOrderType.LIMIT ? session.makerFee : session.takerFee;
    const feeValue = orderTotalWithoutFee * fee;
    const orderTotalWithFee = orderTotalWithoutFee + feeValue;

    const payload: CossIORawTrade = {
      pairId: symbol,
      tradeType: side,
      orderType: type,
      ...(type === CossIOOrderType.LIMIT && { orderPrice: implPrice.toFixed(8) }),
      orderAmount: amount.toFixed(8),
      orderTotalWithFee: orderTotalWithFee.toFixed(8),
      orderTotalWithoutFee: orderTotalWithoutFee.toFixed(8),
      feeValue: feeValue.toFixed(8),
      fee: fee.toFixed(8),
    };

    const url =
      side === CossIOOrderSide.BUY
        ? type === CossIOOrderType.LIMIT
          ? CossIO.API_LIMIT_ORDER_BUY_ENDPOINT
          : CossIO.API_MARKET_ORDER_BUY_ENDPOINT
        : type === CossIOOrderType.LIMIT
          ? CossIO.API_LIMIT_ORDER_SELL_ENDPOINT
          : CossIO.API_MARKET_ORDER_SELL_ENDPOINT;
    console.log('Trade', url, payload);

    return this.request({
      verb: CossIORestApiRequestVerb.POST,
      url,
      payload,
      security: CossIORestApiSecurity.Private,
      transformFn: (data: any) => data,
    });
  }

  private request<T, R>(params: {
    verb: CossIORestApiRequestVerb;
    url: string;
    payload?: any;
    security?: CossIORestApiSecurity;
    transformFn?: (data: T) => R | null;
  }): Promise<R> {
    const {
      verb,
      url,
      payload = null,
      security = CossIORestApiSecurity.Public,
      transformFn,
    } = params;

    if (security === CossIORestApiSecurity.Private && !this.cookie) {
      throw new CossIOError({
        message: 'Private access requires a Cookie.',
        context: {
          verb,
          url,
        },
      });
    }

    const contentTypeRequired =
      (verb === CossIORestApiRequestVerb.POST ||
        verb === CossIORestApiRequestVerb.PUT ||
        verb === CossIORestApiRequestVerb.PATCH ||
        verb === CossIORestApiRequestVerb.DELETE) &&
      payload;

    const headers = {
      [CossIO.REQUEST_HEADER_ACCEPT_KEY]: CossIO.REQUEST_HEADER_ACCEPT_VALUE,
      [CossIO.REQUEST_HEADER_USER_AGENT_KEY]: CossIO.REQUEST_HEADER_USER_AGENT_VALUE,
      [CossIO.REQUEST_HEADER_ORIGIN_KEY]: CossIO.REQUEST_HEADER_ORIGIN_VALUE,
      [CossIO.REQUEST_HEADER_AUTHORITY_KEY]: CossIO.REQUEST_HEADER_AUTHORITY_VALUE,
      [CossIO.REQUEST_HEADER_PRAGMA_KEY]: CossIO.REQUEST_HEADER_NO_CACHE_VALUE,
      [CossIO.REQUEST_HEADER_CACHE_CONTROL_KEY]: CossIO.REQUEST_HEADER_NO_CACHE_VALUE,
      ...(security === CossIORestApiSecurity.Private &&
        this.cookie && { [CossIO.REQUEST_HEADER_XSRF_TOKEN_KEY]: this.cookie.xsrf }),
      ...(security === CossIORestApiSecurity.Private &&
        this.cookie && { [CossIO.REQUEST_HEADER_COOKIE_KEY]: this.generateCookie() }),
      ...(contentTypeRequired && {
        [CossIO.REQUEST_HEADER_CONTENT_TYPE_KEY]: CossIO.REQUEST_HEADER_CONTENT_TYPE_VALUE,
      }),
    };

    const options: AxiosRequestConfig = {
      baseURL: CossIO.API_BASE_URL,
      url,
      method: verb,
      ...(Object.keys(headers).length && { headers }),
      ...(payload != null && contentTypeRequired && { data: qs.stringify(payload) }),
      ...(security === CossIORestApiSecurity.Private && { withCredentials: true }),
    };

    // console.log('Axios Options', options);

    return axios(options)
      .then((response: AxiosResponse): R => {
        try {
          const result =
            typeof transformFn === 'function' && response.data
              ? transformFn(response.data as T)
              : null;
          if (result != null) {
            return result;
          }
        } catch (error) {
          throw new CossIOError({
            message: 'Failed to transform request data.',
            innerError: error,
            context: {
              verb,
              url,
            },
          });
        }

        throw new CossIOError({
          message: 'Failed to transform request data.',
          context: {
            verb,
            url,
          },
        });
      })
      .catch((error: any) => {
        if (error.response && error.response.data) {
          return Promise.reject(
            transformError({
              data: error.response.data as CossIORawError,
              context: {
                verb,
                url,
              },
            }),
          );
        }

        return Promise.reject(
          new CossIOError({
            message: 'Request failed.',
            innerError: error,
            context: {
              verb,
              url,
            },
          }),
        );
      });
  }

  private generateCookie(): string {
    if (!this.cookie || !this.cookie.cfduid || !this.cookie.coss || !this.cookie.xsrf) {
      throw new CossIOError({
        message: 'Invalid Cookie.',
        context: {
          cookie: this.cookie,
        },
      });
    }

    return `__cfduid=${this.cookie.cfduid}; coss.s=${this.cookie.coss}; XSRF-TOKEN=${
      this.cookie.xsrf
    }`;
  }
}
