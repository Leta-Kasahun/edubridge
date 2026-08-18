import { AppError } from "./app-error.js";
export class InternalServerError extends AppError {
  constructor(message = "Internal Server Error", code = "INTERNAL_SERVER_ERROR") {
    super(message, 500, code, undefined, false);
  }
}
