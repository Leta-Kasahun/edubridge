import { Request, Response } from "express";
import { AttemptService } from "../services/attempt.service.js";
import { asyncHandler } from "../../../shared/utils/async-handler.js";
import { UnauthorizedError } from "../../../shared/exceptions/unauthorized-error.js";
import {
  StartAttemptInput,
  SaveAnswerInput,
  BatchSaveAnswersInput,
  SubmitAttemptInput,
  AttemptQueryInput,
} from "../schemas/attempt.schema.js";

export class AttemptController {
  constructor(private readonly attemptService: AttemptService = new AttemptService()) {}

  start = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.tenantId || !req.user?.userId) {
      throw new UnauthorizedError();
    }
    const assessmentId = req.params.id as string;
    const body = (req.body || {}) as StartAttemptInput;
    const result = await this.attemptService.startAttempt(
      req.user.tenantId,
      req.user.userId,
      req.user.roles || [],
      assessmentId,
      body.assignmentId ?? undefined
    );
    res.status(200).json({
      success: true,
      message: "Attempt started",
      data: result,
    });
  });

  saveAnswer = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.tenantId || !req.user?.userId) {
      throw new UnauthorizedError();
    }
    const assessmentId = req.params.id as string;
    const attemptId = req.params.attemptId as string;
    const body = req.body as SaveAnswerInput;
    const result = await this.attemptService.saveAnswer(
      req.user.tenantId,
      req.user.userId,
      assessmentId,
      attemptId,
      body
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  batchSaveAnswers = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.tenantId || !req.user?.userId) {
      throw new UnauthorizedError();
    }
    const assessmentId = req.params.id as string;
    const attemptId = req.params.attemptId as string;
    const body = req.body as BatchSaveAnswersInput;
    const result = await this.attemptService.batchSaveAnswers(
      req.user.tenantId,
      req.user.userId,
      assessmentId,
      attemptId,
      body
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  submit = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.tenantId || !req.user?.userId) {
      throw new UnauthorizedError();
    }
    const assessmentId = req.params.id as string;
    const attemptId = req.params.attemptId as string;
    const body = req.body as SubmitAttemptInput;
    const result = await this.attemptService.submitAttempt(
      req.user.tenantId,
      req.user.userId,
      assessmentId,
      attemptId,
      body
    );
    res.status(200).json({
      success: true,
      message: "Attempt submitted successfully",
      data: result,
    });
  });

  listAttempts = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.tenantId) {
      throw new UnauthorizedError();
    }
    const id = req.params.id as string;
    const query = req.query as unknown as AttemptQueryInput;
    const result = await this.attemptService.listAttempts(
      req.user.tenantId,
      id,
      query
    );
    res.status(200).json({
      success: true,
      ...result,
    });
  });

  listStudentInProgress = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.tenantId || !req.user?.userId) {
      throw new UnauthorizedError();
    }
    const limit = req.query.limit ? Number(req.query.limit) : 6;
    const items = await this.attemptService.listStudentInProgressAttempts(
      req.user.tenantId,
      req.user.userId,
      limit
    );
    res.status(200).json({
      success: true,
      data: items,
    });
  });
}
