import { Request, Response } from "express";
import { asyncHandler } from "../../../shared/utils/async-handler.js";
import {
  QuestionGenerationService,
  questionGenerationService,
} from "../services/question-generation.service.js";
import {
  AiJobRepository,
  aiJobRepository,
} from "../repository/ai-job.repository.js";
import { generateQuestionsSchema } from "../schemas/question-generation.schema.js";
import { UnauthorizedError, NotFoundError } from "../../../shared/exceptions/index.js";

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

export class QuestionGenerationController {
  constructor(
    private readonly service: QuestionGenerationService = questionGenerationService,
    private readonly jobRepo: AiJobRepository = aiJobRepository
  ) {}

  generate = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { tenantId, userId } = extractUserContext(req);
      const input = generateQuestionsSchema.parse(req.body);

      const result = await this.service.generateQuestions(
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

  getJob = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { tenantId } = extractUserContext(req);
      const jobId = req.params.id as string;

      const job = await this.jobRepo.findById(tenantId, jobId);
      if (!job) {
        throw new NotFoundError("AI generation job not found");
      }

      res.status(200).json({
        success: true,
        data: job,
      });
    }
  );

  listJobs = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { tenantId, userId } = extractUserContext(req);
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const { items, total } = await this.jobRepo.listJobs(
        tenantId,
        userId,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        data: items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }
  );
}

export const questionGenerationController = new QuestionGenerationController();
