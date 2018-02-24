/* ============================================================
* coss.io API
* https://github.com/impmja/coss.io
* ============================================================
* Copyright 2018-, Jan (impmja) Schulte
* Released under the MIT License
* ============================================================ */
import * as url from 'url';
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';

import { CossIORawMarketPair, CossIORawDepth } from './coss-io.raw-entities';
import {
  CossIOTicker,
  CossIOTickerList,
  CossIOSession,
  CossIODepth,
  transformTicker,
  transformTickerList,
  transformSession,
  transformDepth,
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
  private static readonly API_DEPTH_ENDPOINT: string = 'integrated-market/depth/';
  private static readonly API_MARKET_PAIRS_ENDPOINT: string = 'integrated-market/pairs/';
  private static readonly API_MARKET_PAIR_ENDPOINT: string = 'integrated-market/pair-data/';

  private static readonly REQUEST_HEADER_USER_AGENT_KEY: string = 'User-Agent';
  private static readonly REQUEST_HEADER_USER_AGENT_VALUE: string = 'Mozilla/4.0 (compatible; Node COSS.io API)';
  private static readonly REQUEST_HEADER_CONTENT_TYPE_KEY: string = 'Content-Type';
  private static readonly REQUEST_HEADER_CONTENT_TYPE_VALUE: string = 'application/x-www-form-urlencoded';
  private static readonly REQUEST_HEADER_ACCEPT_KEY: string = 'Accept';
  private static readonly REQUEST_HEADER_ACCEPT_VALUE: string = 'application/json';
  private static readonly REQUEST_HEADER_ORIGIN_KEY: string = 'origin';
  private static readonly REQUEST_HEADER_ORIGIN_VALUE: string = 'https://exchange.coss.io/';
  private static readonly REQUEST_HEADER_AUTHORITY_KEY: string = 'authority';
  private static readonly REQUEST_HEADER_AUTHORITY_VALUE: string = 'exchange.coss.io';
  private static readonly REQUEST_HEADER_XSRF_TOKEN_KEY: string = 'x-xsrf-token';
  private static readonly REQUEST_HEADER_SET_COOKIE_KEY: string = 'set-cookie';

  private readonly cookie?: CossIOCookie | null;

  public constructor(cookie?: CossIOCookie) {
    this.cookie = cookie || null;
  }

  public requestSession(): Promise<CossIOSession> {
    return this.request({
      verb: CossIORestApiRequestVerb.GET,
      url: CossIO.API_SESSION_ENDPOINT,
      transformFn: transformSession,
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

      // ...(security === CossIORestApiSecurity.Private && {
      //   [CossIO.REQUEST_HEADER_API_KEY]: this.configuration.apiKey,
      // }),
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
}
