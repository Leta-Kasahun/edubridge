import { Request, Response } from "express";
import { asyncHandler } from "../../../../shared/utils/async-handler.js";
import {
  CurriculumImportService,
  curriculumImportService,
} from "../services/curriculum-import.service.js";
import {
  curriculumImportPreviewSchema,
  curriculumImportCommitSchema,
} from "../schemas/curriculum-import.schema.js";

function getTenantId(req: Request): string | null {
  const customReq = req as Request & {
    tenantId?: string;
    user?: { tenantId?: string; userId?: string };
  };
  return customReq.tenantId || customReq.user?.tenantId || null;
}

function getUserId(req: Request): string {
  const customReq = req as Request & {
    user?: { userId?: string; id?: string };
  };
  return customReq.user?.userId || customReq.user?.id || "";
}

export class CurriculumImportController {
  constructor(
    private readonly service: CurriculumImportService = curriculumImportService
  ) {}

  previewImport = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const tenantId = getTenantId(req);
      const payload = curriculumImportPreviewSchema.parse(req.body);

      const preview = await this.service.previewImport(tenantId, payload);

      res.status(200).json({
        success: true,
        data: preview,
      });
    }
  );

  commitImport = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const tenantId = getTenantId(req);
      const userId = getUserId(req);
      const payload = curriculumImportCommitSchema.parse(req.body);

      const result = await this.service.commitImport(
        tenantId,
        userId,
        payload
      );

      res.status(200).json({
        success: true,
        message: "Curriculum structure imported successfully",
        data: result,
      });
    }
  );

  getSampleTemplate = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const csv = this.service.getSampleCsvTemplate();

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="curriculum_structure_template.csv"'
      );
      res.status(200).send(csv);
    }
  );
}

export const curriculumImportController = new CurriculumImportController();
