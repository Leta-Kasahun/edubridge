import { AppError } from "./app-error.js";

export class ValidationError extends AppError {
  constructor(message = "Validation Error", errors?: unknown[]) {
    super(message, 400, "VALIDATION_ERROR", errors);
  }
}
