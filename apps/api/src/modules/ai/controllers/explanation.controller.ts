import { Request, Response } from "express";
import { asyncHandler } from "../../../shared/utils/async-handler.js";
import {
  ExplanationService,
  explanationService,
} from "../services/explanation.service.js";
import { streamExplanationQuerySchema } from "../schemas/explanation.schema.js";
import { UnauthorizedError } from "../../../shared/exceptions/index.js";

export class ExplanationController {
  constructor(
    private readonly service: ExplanationService = explanationService
  ) {}

  streamExplanation = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new UnauthorizedError("Tenant context required");
      }

      const questionId = req.params.id as string;
      const query = streamExplanationQuerySchema.parse(req.query);

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders?.();

      let isClosed = false;
      req.on("close", () => {
        isClosed = true;
      });

      try {
        const stream = this.service.streamExplanation(
          tenantId,
          questionId,
          query.studentAnswer
        );

        for await (const token of stream) {
          if (isClosed) break;
          res.write(`data: ${JSON.stringify({ text: token })}\n\n`);
        }

        if (!isClosed) {
          res.write("data: [DONE]\n\n");
          res.end();
        }
      } catch (error) {
        if (!isClosed) {
          const message = error instanceof Error ? error.message : "Streaming error occurred";
          res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
          res.end();
        }
      }
    }
  );
}

export const explanationController = new ExplanationController();
