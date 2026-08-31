import { Request, Response } from "express";
import { subjectService } from "../services/subject.service.js";
import {
  createSubjectSchema,
  updateSubjectSchema,
  assignGradeSubjectsSchema,
  subjectFilterSchema,
} from "../schemas/subject.schema.js";
import { asyncHandler } from "../../../../shared/utils/async-handler.js";
import { UnauthorizedError } from "../../../../shared/exceptions/index.js";

export class SubjectController {
  listSubjects = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.user?.tenantId;
    const filters = subjectFilterSchema.parse(req.query);

    const data = await subjectService.listSubjects({
      ...filters,
      tenantId,
    });

    res.json({ success: true, data });
  });

  getSubjectById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const tenantId = req.user?.tenantId;

    const data = await subjectService.getSubjectById(id, tenantId);
    res.json({ success: true, data });
  });

  createSubject = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.user?.tenantId;
    const input = createSubjectSchema.parse(req.body);

    const data = await subjectService.createSubject(input, tenantId);
    res.status(201).json({ success: true, data });
  });

  updateSubject = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const tenantId = req.user?.tenantId;
    const input = updateSubjectSchema.parse(req.body);

    const data = await subjectService.updateSubject(id, input, tenantId);
    res.json({ success: true, data });
  });

  toggleSubjectStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const tenantId = req.user?.tenantId;

    const data = await subjectService.toggleSubjectStatus(id, tenantId);
    res.json({ success: true, data });
  });

  assignGrades = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      throw new UnauthorizedError("Tenant context required");
    }

    const input = assignGradeSubjectsSchema.parse(req.body);
    const data = await subjectService.assignGrades(id, tenantId, input.gradeLevels);

    res.json({ success: true, data });
  });
}

export const subjectController = new SubjectController();
