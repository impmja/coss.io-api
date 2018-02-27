export declare class CossIOError extends Error {
    readonly code?: number | string;
    readonly message: string;
    readonly innerError?: string | object;
    readonly context?: string | object;
    constructor(params: {
        message: string;
        code?: number | string;
        innerError?: string | object;
        context?: string | object;
    });
}
