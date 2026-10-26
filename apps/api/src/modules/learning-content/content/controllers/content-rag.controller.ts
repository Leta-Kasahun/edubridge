import { Request, Response } from "express";
import { asyncHandler } from "../../../../shared/utils/async-handler.js";
import {
  ContentRagService,
  contentRagService,
} from "../services/content-rag.service.js";
import {
  ingestContentSchema,
  hybridSearchSchema,
} from "../schemas/content-rag.schema.js";
import { UnauthorizedError } from "../../../../shared/exceptions/index.js";

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

export class ContentRagController {
  constructor(
    private readonly service: ContentRagService = contentRagService
  ) {}

  ingestContent = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { tenantId } = extractUserContext(req);
      const contentId = req.params.id as string;
      const body = ingestContentSchema.parse(req.body);

      const result = await this.service.ingestContent(
        tenantId,
        contentId,
        body
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    }
  );

  search = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { tenantId } = extractUserContext(req);
      const body = hybridSearchSchema.parse(req.body);

      const results = await this.service.search(tenantId, body);

      res.status(200).json({
        success: true,
        data: results,
      });
    }
  );
}

export const contentRagController = new ContentRagController();
