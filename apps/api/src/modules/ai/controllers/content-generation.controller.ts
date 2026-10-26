import { Request, Response } from "express";
import { asyncHandler } from "../../../shared/utils/async-handler.js";
import {
  ContentGenerationService,
  contentGenerationService,
} from "../services/content-generation.service.js";
import { generateContentSchema } from "../schemas/content-generation.schema.js";
import { UnauthorizedError } from "../../../shared/exceptions/index.js";

function extractUserContext(req: Request): {
  readonly tenantId: string;
  readonly userId: string;
} {
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;

  if (!tenantId) {
    throw new UnauthorizedError("Tenant context required");
  }
  if (!userId) {
    throw new UnauthorizedError("User authentication required");
  }

  return { tenantId, userId };
}

export class ContentGenerationController {
  constructor(
    private readonly service: ContentGenerationService = contentGenerationService
  ) {}

  generate = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { tenantId, userId } = extractUserContext(req);
      const input = generateContentSchema.parse(req.body);

      const result = await this.service.generateContent(
        tenantId,
        userId,
        input
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    }
  );
}

export const contentGenerationController = new ContentGenerationController();
