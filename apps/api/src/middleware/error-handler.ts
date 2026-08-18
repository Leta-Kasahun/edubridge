import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../shared/exceptions/index.js";
import { env } from "../config/env.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const timestamp = new Date().toISOString();

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
      timestamp,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      code: "VALIDATION_ERROR",
      message: "Input validation failed",
      errors: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
      timestamp,
    });
    return;
  }

  if (typeof err === "object" && err !== null && "code" in err) {
    const code = (err as { code: string }).code;
    if (code === "P2002") {
      res.status(409).json({
        success: false,
        statusCode: 409,
        code: "CONFLICT",
        message: "Unique constraint violation",
        timestamp,
      });
      return;
    }
    if (code === "P2025") {
      res.status(404).json({
        success: false,
        statusCode: 404,
        code: "NOT_FOUND",
        message: "Record not found",
        timestamp,
      });
      return;
    }
  }

  res.status(500).json({
    success: false,
    statusCode: 500,
    code: "INTERNAL_SERVER_ERROR",
    message: env.NODE_ENV === "production" ? "Internal server error" : (err as Error)?.message || "Unknown error",
    timestamp,
  });
};
