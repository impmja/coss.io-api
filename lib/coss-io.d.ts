import { CossIOTicker, CossIOTickerList, CossIOSession, CossIODepth, CossIOHistoryOrderList, CossIOOrderList, CossIOWalletList, CossIOOrderSide, CossIOOrderType } from './coss-io.transformed-entities';
export interface CossIOCookie {
    xsrf: string;
    coss: string;
    cfduid: string;
}
export declare class CossIO {
    private static readonly API_BASE_URL;
    private static readonly API_SESSION_ENDPOINT;
    private static readonly API_USER_ORDERS_ENDPOINT;
    private static readonly API_USER_WALLETS_ENDPOINT;
    private static readonly API_OPEN_ORDER_HISTORY_ENDPOINT;
    private static readonly API_DEPTH_ENDPOINT;
    private static readonly API_MARKET_PAIRS_ENDPOINT;
    private static readonly API_MARKET_PAIR_ENDPOINT;
    private static readonly API_MARKET_ORDER_BUY_ENDPOINT;
    private static readonly API_MARKET_ORDER_SELL_ENDPOINT;
    private static readonly API_LIMIT_ORDER_BUY_ENDPOINT;
    private static readonly API_LIMIT_ORDER_SELL_ENDPOINT;
    private static readonly REQUEST_HEADER_USER_AGENT_KEY;
    private static readonly REQUEST_HEADER_USER_AGENT_VALUE;
    private static readonly REQUEST_HEADER_CONTENT_TYPE_KEY;
    private static readonly REQUEST_HEADER_CONTENT_TYPE_VALUE;
    private static readonly REQUEST_HEADER_ACCEPT_KEY;
    private static readonly REQUEST_HEADER_ACCEPT_VALUE;
    private static readonly REQUEST_HEADER_ORIGIN_KEY;
    private static readonly REQUEST_HEADER_ORIGIN_VALUE;
    private static readonly REQUEST_HEADER_AUTHORITY_KEY;
    private static readonly REQUEST_HEADER_AUTHORITY_VALUE;
    private static readonly REQUEST_HEADER_XSRF_TOKEN_KEY;
    private static readonly REQUEST_HEADER_COOKIE_KEY;
    private static readonly REQUEST_HEADER_PRAGMA_KEY;
    private static readonly REQUEST_HEADER_CACHE_CONTROL_KEY;
    private static readonly REQUEST_HEADER_NO_CACHE_VALUE;
    private readonly cookie?;
    constructor(cookie?: CossIOCookie);
    requestSession(): Promise<CossIOSession>;
    requestUserWallets(): Promise<CossIOWalletList>;
    requestUserOrders(params: {
        symbol: string;
    }): Promise<CossIOOrderList>;
    requestOrderHistory(params: {
        symbol: string;
    }): Promise<CossIOHistoryOrderList>;
    requestDepth(params: {
        symbol: string;
        level?: number;
    }): Promise<CossIODepth>;
    requestTickers(): Promise<CossIOTickerList>;
    requestTicker(params: {
        symbol: string;
    }): Promise<CossIOTicker>;
    placeOrder(params: {
        symbol: string;
        side: CossIOOrderSide;
        type: CossIOOrderType;
        price?: number;
        amount: number;
        session: CossIOSession;
    }): Promise<void>;
    private request<T, R>(params);
    private generateCookie();
}
