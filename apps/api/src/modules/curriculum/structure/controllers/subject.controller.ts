import { Request, Response } from "express";
import { asyncHandler } from "../../../../shared/utils/async-handler.js";
import {
  SubjectService,
  subjectService,
} from "../services/subject.service.js";
import { getTenantId } from "./controller.utils.js";
import {
  createCurriculumSubjectSchema,
  versionIdParamSchema,
  subjectIdParamSchema,
} from "../schemas/structure.schema.js";

export class SubjectController {
  constructor(
    private readonly service: SubjectService = subjectService
  ) {}

  getSubjectsByVersion = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { versionId } = versionIdParamSchema.parse(req.params);
      const tenantId = getTenantId(req) || null;

      const subjects = await this.service.getSubjectsByVersion(
        tenantId,
        versionId
      );

      res.status(200).json({
        success: true,
        data: subjects,
      });
    }
  );

  createSubject = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const tenantId = getTenantId(req) || null;
      const input = createCurriculumSubjectSchema.parse(req.body);

      const subject = await this.service.createSubject(tenantId, input);

      res.status(201).json({
        success: true,
        data: subject,
      });
    }
  );

  deleteSubject = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { subjectId } = subjectIdParamSchema.parse(req.params);
      const tenantId = getTenantId(req) || null;

      await this.service.deleteSubject(tenantId, subjectId);

      res.status(200).json({
        success: true,
        message: "Curriculum subject deleted successfully",
      });
    }
  );
}

export const subjectController = new SubjectController();
