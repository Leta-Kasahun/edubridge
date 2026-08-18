import { AppError } from "./app-error.js";

export class BadRequestError extends AppError {
  constructor(message = "Bad Request", code = "BAD_REQUEST", errors?: unknown[]) {
    super(message, 400, code, errors);
  }
}
