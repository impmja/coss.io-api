/* ============================================================
* coss.io API
* https://github.com/impmja/coss.io
* ============================================================
* Copyright 2018-, Jan (impmja) Schulte
* Released under the MIT License
* ============================================================ */
import * as url from 'url';
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';

import {
  CossIORawMarketPair,
  CossIORawDepth,
  CossIORawOrder,
  CossIOWalletList,
} from './coss-io.raw-entities';
import {
  CossIOTicker,
  CossIOTickerList,
  CossIOSession,
  CossIODepth,
  CossIOOrder,
  CossIOOrderList,
  transformTicker,
  transformTickerList,
  transformSession,
  transformDepth,
  transformOrder,
  transformOrders,
  transformWallets,
} from './coss-io.transformed-entities';

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

export class CossIOError extends Error {
  public readonly code?: number | string;
  public readonly message: string;
  public readonly innerError?: string | object;
  public readonly context?: string | object;

  public constructor(params: {
    message: string;
    code?: number | string;
    innerError?: string | object;
    context?: string | object;
  }) {
    super();
    ({
      code: this.code,
      message: this.message,
      innerError: this.innerError,
      context: this.context,
    } = params);

    if (process.env.NODE_ENV === 'development') {
      Error.captureStackTrace(this);
    }
  }
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
      url: url.resolve(CossIO.API_USER_ORDERS_ENDPOINT, symbol),
      security: CossIORestApiSecurity.Private,
      transformFn: transformOrders,
    });
  }

  public requestOrderHistory(params: { symbol: string }): Promise<CossIOOrderList> {
    const { symbol } = params;
    if (!symbol || !symbol.length) {
      throw new CossIOError({
        message: 'Symbol is missing.',
      });
    }

    return this.request({
      verb: CossIORestApiRequestVerb.GET,
      url: url.resolve(CossIO.API_OPEN_ORDER_HISTORY_ENDPOINT, symbol),
      security: CossIORestApiSecurity.Public,
      transformFn: transformOrders,
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
      url: url.resolve(CossIO.API_DEPTH_ENDPOINT, symbol),
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
      url: url.resolve(CossIO.API_MARKET_PAIR_ENDPOINT, symbol),
      transformFn: (data: CossIORawMarketPair) => {
        const { currency } = data;
        return transformTicker(currency);
      },
    });
  }

  private request<T, R>(params: {
    verb: CossIORestApiRequestVerb;
    url: string;
    security?: CossIORestApiSecurity;
    transformFn?: (data: T) => R | null;
  }): Promise<R> {
    const { verb, url, security = CossIORestApiSecurity.Public, transformFn } = params;

    if (security === CossIORestApiSecurity.Private && !this.cookie) {
      throw new CossIOError({
        message: 'Private access requires a Cookie.',
        context: {
          verb,
          url,
        },
      });
    }

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
    };

    const options: AxiosRequestConfig = {
      baseURL: CossIO.API_BASE_URL,
      url,
      method: verb,
      ...(Object.keys(headers).length && { headers }),
      ...(security === CossIORestApiSecurity.Private && { withCredentials: true }),
    };

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
