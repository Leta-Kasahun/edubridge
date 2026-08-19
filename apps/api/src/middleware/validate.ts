import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodType } from "zod";

interface ValidationSchema {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

export const validate = (schema: ValidationSchema | ZodType): RequestHandler => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if ("parseAsync" in schema) {
        req.body = await schema.parseAsync(req.body);
      } else {
        if (schema.body) {
          req.body = await schema.body.parseAsync(req.body);
        }
        if (schema.query) {
          req.query = (await schema.query.parseAsync(req.query)) as Request["query"];
        }
        if (schema.params) {
          req.params = (await schema.params.parseAsync(req.params)) as Request["params"];
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
