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
