import { Request, Response } from "express";
import { EvaluationService } from "../services/evaluation.service.js";
import { asyncHandler } from "../../../shared/utils/async-handler.js";
import { UnauthorizedError } from "../../../shared/exceptions/index.js";
import {
  ManualGradeAttemptInput,
  SubmitQuestionFeedbackInputSchema,
} from "../schemas/evaluation.schema.js";

export class EvaluationController {
  constructor(private readonly evaluationService = new EvaluationService()) {}

  getResult = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.userId;
    const roles = req.user?.roles || [];

    if (!tenantId || !userId) {
      throw new UnauthorizedError("Authentication context missing");
    }

    const id = req.params.id as string;
    const attemptId = req.params.attemptId as string;

    const result = await this.evaluationService.getAttemptResult(
      tenantId,
      userId,
      roles,
      id,
      attemptId
    );

    res.json({ success: true, data: result });
  });

  manualGrade = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.userId;

    if (!tenantId || !userId) {
      throw new UnauthorizedError("Authentication context missing");
    }

    const id = req.params.id as string;
    const attemptId = req.params.attemptId as string;
    const body = req.body as ManualGradeAttemptInput;

    const result = await this.evaluationService.manualGrade(
      tenantId,
      userId,
      id,
      attemptId,
      body
    );

    res.json({
      success: true,
      message: "Attempt manual grading applied successfully",
      data: result,
    });
  });

  listStudentResults = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.userId;

    if (!tenantId || !userId) {
      throw new UnauthorizedError("Authentication context missing");
    }

    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const result = await this.evaluationService.listStudentResults(
      tenantId,
      userId,
      { page, limit }
    );

    res.json({ success: true, data: result });
  });

  submitQuestionFeedback = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.userId;

    if (!tenantId || !userId) {
      throw new UnauthorizedError("Authentication context missing");
    }

    const id = req.params.id as string;
    const body = req.body as SubmitQuestionFeedbackInputSchema;

    const result = await this.evaluationService.submitQuestionFeedback(
      tenantId,
      userId,
      id,
      body
    );

    res.json(result);
  });
}
