import { AppError } from "./app-error.js";

export class RateLimitError extends AppError {
  constructor(message = "Too many requests", code = "RATE_LIMIT_EXCEEDED") {
    super(message, 429, code);
  }
}
