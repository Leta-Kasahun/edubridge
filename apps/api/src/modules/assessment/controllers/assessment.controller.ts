import { Request, Response } from "express";
import { AssessmentService } from "../services/assessment.service.js";
import { asyncHandler } from "../../../shared/utils/async-handler.js";
import { UnauthorizedError } from "../../../shared/exceptions/unauthorized-error.js";
import {
  CreateAssessmentInput,
  UpdateAssessmentInput,
  AssessmentQueryInput,
  AddAssessmentQuestionsInput,
  AssignAssessmentInput,
} from "../schemas/assessment.schema.js";

export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService = new AssessmentService()) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.tenantId || !req.user?.userId) {
      throw new UnauthorizedError();
    }
    const body = req.body as CreateAssessmentInput;
    const result = await this.assessmentService.create(
      req.user.tenantId,
      req.user.userId,
      body
    );
    res.status(201).json({
      success: true,
      message: "Assessment created successfully",
      data: result,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.tenantId) {
      throw new UnauthorizedError();
    }
    const id = req.params.id as string;
    const result = await this.assessmentService.getById(req.user.tenantId, id);
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.tenantId || !req.user?.userId) {
      throw new UnauthorizedError();
    }
    const query = req.query as unknown as AssessmentQueryInput;
    const isTeacher = req.user.roles.includes("TEACHER");
    const isSchoolAdmin = req.user.roles.includes("SCHOOL_ADMIN");

    let createdById = query.createdById;
    if (isTeacher && !isSchoolAdmin) {
      createdById = req.user.userId;
    }

    const result = await this.assessmentService.list(req.user.tenantId, {
      ...query,
      createdById,
    });
    res.status(200).json({
      success: true,
      ...result,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.tenantId) {
      throw new UnauthorizedError();
    }
    const id = req.params.id as string;
    const body = req.body as UpdateAssessmentInput;
    const result = await this.assessmentService.update(req.user.tenantId, id, body);
    res.status(200).json({
      success: true,
      message: "Assessment updated successfully",
      data: result,
    });
  });

  setQuestions = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.tenantId) {
      throw new UnauthorizedError();
    }
    const id = req.params.id as string;
    const body = req.body as AddAssessmentQuestionsInput;
    const result = await this.assessmentService.setQuestions(
      req.user.tenantId,
      id,
      body.questions
    );
    res.status(200).json({
      success: true,
      message: "Assessment questions updated successfully",
      data: result,
    });
  });

  assign = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.tenantId || !req.user?.userId) {
      throw new UnauthorizedError();
    }
    const id = req.params.id as string;
    const body = req.body as AssignAssessmentInput;
    const result = await this.assessmentService.assignToSections(
      req.user.tenantId,
      id,
      req.user.userId,
      body
    );
    res.status(200).json({
      success: true,
      message: "Assessment assigned to sections successfully",
      data: result,
    });
  });

  publish = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.tenantId) {
      throw new UnauthorizedError();
    }
    const id = req.params.id as string;
    const result = await this.assessmentService.publish(req.user.tenantId, id);
    res.status(200).json({
      success: true,
      message: "Assessment published successfully",
      data: result,
    });
  });

  archive = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.tenantId) {
      throw new UnauthorizedError();
    }
    const id = req.params.id as string;
    const result = await this.assessmentService.archive(req.user.tenantId, id);
    res.status(200).json({
      success: true,
      message: "Assessment archived successfully",
      data: result,
    });
  });
}
