export class AppError extends Error {
  constructor(
    public override readonly message: string,
    public readonly statusCode = 500,
    public readonly code = "INTERNAL_SERVER_ERROR",
    public readonly errors?: unknown[],
    public readonly isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
