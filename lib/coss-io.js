"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* ============================================================
* coss.io API
* https://github.com/impmja/coss.io
* ============================================================
* Copyright 2018-, Jan (impmja) Schulte
* Released under the MIT License
* ============================================================ */
const url = require("url");
const axios_1 = require("axios");
const coss_io_transformed_entities_1 = require("./coss-io.transformed-entities");
var CossIORestApiRequestVerb;
(function (CossIORestApiRequestVerb) {
    CossIORestApiRequestVerb["GET"] = "get";
    CossIORestApiRequestVerb["POST"] = "post";
    CossIORestApiRequestVerb["PUT"] = "put";
    CossIORestApiRequestVerb["PATCH"] = "patch";
    CossIORestApiRequestVerb["DELETE"] = "delete";
})(CossIORestApiRequestVerb || (CossIORestApiRequestVerb = {}));
var CossIORestApiSecurity;
(function (CossIORestApiSecurity) {
    CossIORestApiSecurity[CossIORestApiSecurity["Public"] = 0] = "Public";
    CossIORestApiSecurity[CossIORestApiSecurity["Private"] = 1] = "Private";
})(CossIORestApiSecurity || (CossIORestApiSecurity = {}));
class CossIOError extends Error {
    constructor(params) {
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
exports.CossIOError = CossIOError;
class CossIO {
    constructor(cookie) {
        this.cookie = cookie || null;
    }
    requestSession() {
        return this.request({
            verb: CossIORestApiRequestVerb.GET,
            url: CossIO.API_SESSION_ENDPOINT,
            transformFn: coss_io_transformed_entities_1.transformSession,
        });
    }
    requestDepth(params) {
        const { symbol, level = 5 } = params;
        if (!symbol || !symbol.length) {
            throw new CossIOError({
                message: 'Symbol is missing.',
            });
        }
        return this.request({
            verb: CossIORestApiRequestVerb.GET,
            url: url.resolve(CossIO.API_DEPTH_ENDPOINT, symbol),
            transformFn: (data) => coss_io_transformed_entities_1.transformDepth({ data, level }),
        });
    }
    requestTickers() {
        return this.request({
            verb: CossIORestApiRequestVerb.GET,
            url: CossIO.API_MARKET_PAIRS_ENDPOINT,
            transformFn: coss_io_transformed_entities_1.transformTickerList,
        });
    }
    requestTicker(params) {
        const { symbol } = params;
        if (!symbol || !symbol.length) {
            throw new CossIOError({
                message: 'Symbol is missing.',
            });
        }
        return this.request({
            verb: CossIORestApiRequestVerb.GET,
            url: url.resolve(CossIO.API_MARKET_PAIR_ENDPOINT, symbol),
            transformFn: (data) => {
                const { currency } = data;
                return coss_io_transformed_entities_1.transformTicker(currency);
            },
        });
    }
    request(params) {
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
        };
        const options = Object.assign({ baseURL: CossIO.API_BASE_URL, url, method: verb }, (Object.keys(headers).length && { headers }), (security === CossIORestApiSecurity.Private && { withCredentials: true }));
        return axios_1.default(options)
            .then((response) => {
            try {
                const result = typeof transformFn === 'function' && response.data
                    ? transformFn(response.data)
                    : null;
                if (result != null) {
                    return result;
                }
            }
            catch (error) {
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
            .catch((error) => {
            return Promise.reject(new CossIOError({
                message: 'Request failed.',
                innerError: error,
                context: {
                    verb,
                    url,
                },
            }));
        });
    }
}
CossIO.API_BASE_URL = 'https://exchange.coss.io/api/';
CossIO.API_SESSION_ENDPOINT = 'session/';
CossIO.API_DEPTH_ENDPOINT = 'integrated-market/depth/';
CossIO.API_MARKET_PAIRS_ENDPOINT = 'integrated-market/pairs/';
CossIO.API_MARKET_PAIR_ENDPOINT = 'integrated-market/pair-data/';
CossIO.REQUEST_HEADER_USER_AGENT_KEY = 'User-Agent';
CossIO.REQUEST_HEADER_USER_AGENT_VALUE = 'Mozilla/4.0 (compatible; Node COSS.io API)';
CossIO.REQUEST_HEADER_CONTENT_TYPE_KEY = 'Content-Type';
CossIO.REQUEST_HEADER_CONTENT_TYPE_VALUE = 'application/x-www-form-urlencoded';
CossIO.REQUEST_HEADER_ACCEPT_KEY = 'Accept';
CossIO.REQUEST_HEADER_ACCEPT_VALUE = 'application/json';
CossIO.REQUEST_HEADER_ORIGIN_KEY = 'origin';
CossIO.REQUEST_HEADER_ORIGIN_VALUE = 'https://exchange.coss.io/';
CossIO.REQUEST_HEADER_AUTHORITY_KEY = 'authority';
CossIO.REQUEST_HEADER_AUTHORITY_VALUE = 'exchange.coss.io';
CossIO.REQUEST_HEADER_XSRF_TOKEN_KEY = 'x-xsrf-token';
CossIO.REQUEST_HEADER_SET_COOKIE_KEY = 'set-cookie';
exports.CossIO = CossIO;
