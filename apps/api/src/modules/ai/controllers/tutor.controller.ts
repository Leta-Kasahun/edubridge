import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../../shared/utils/async-handler.js";
import { TutorService, tutorService } from "../services/tutor.service.js";
import { UnauthorizedError } from "../../../shared/exceptions/index.js";

const tutorRequestSchema = z.object({
  message: z.string().trim().min(1, "Message cannot be empty").max(2000),
  topicId: z.string().uuid("Invalid topic ID format").optional(),
});

export class TutorController {
  constructor(private readonly service: TutorService = tutorService) {}

  streamTutor = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new UnauthorizedError("Tenant context required");
      }

      const { message, topicId } = tutorRequestSchema.parse(req.body);

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders?.();

      let isClosed = false;
      req.on("close", () => {
        isClosed = true;
      });

      try {
        const stream = this.service.streamTutor(tenantId, message, topicId);

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
          const errMsg = error instanceof Error ? error.message : "Tutor stream error";
          res.write(`data: ${JSON.stringify({ error: errMsg })}\n\n`);
          res.end();
        }
      }
    }
  );
}

export const tutorController = new TutorController();
