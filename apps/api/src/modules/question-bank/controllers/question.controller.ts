import { Request, Response } from "express";
import { QuestionService } from "../services/question.service.js";
import { QuestionQueryDto, CreateQuestionInput } from "../types/question-bank.types.js";
import { asyncHandler } from "../../../shared/utils/async-handler.js";
import { UnauthorizedError } from "../../../shared/exceptions/index.js";
import { prisma } from "../../../lib/prisma.js";

const service = new QuestionService();

function getTenantId(req: Request): string {
  const tenantId = req.user?.tenantId || (req.headers["x-tenant-id"] as string);
  if (!tenantId) {
    throw new UnauthorizedError("Tenant context is required");
  }
  return tenantId;
}

function getUserId(req: Request): string {
  const userId = req.user?.userId;
  if (!userId) {
    throw new UnauthorizedError("User context is required");
  }
  return userId;
}

export class QuestionController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const createdById = getUserId(req);
    const bankId = req.params.bankId as string;

    if (Array.isArray(req.body) || (req.body && Array.isArray(req.body.questions))) {
      const questionsList: CreateQuestionInput[] = Array.isArray(req.body)
        ? req.body
        : req.body.questions;
      const result = await service.createBatch(tenantId, bankId, createdById, questionsList);
      res.status(201).json({
        success: true,
        message: `${result.length} questions created successfully`,
        data: result,
      });
      return;
    }

    const result = await service.create(tenantId, bankId, createdById, req.body);
    res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: result,
    });
  });

  createBatch = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const createdById = getUserId(req);
    const bankId = req.params.bankId as string;

    const questionsList: CreateQuestionInput[] = Array.isArray(req.body)
      ? req.body
      : req.body.questions || [];

    const result = await service.createBatch(tenantId, bankId, createdById, questionsList);
    res.status(201).json({
      success: true,
      message: `${result.length} questions created successfully`,
      data: result,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const id = req.params.id as string;

    const result = await service.findById(tenantId, id);
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  listByBank = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const bankId = req.params.bankId as string;
    const query = req.query as unknown as QuestionQueryDto;

    const result = await service.findManyByBank(tenantId, bankId, {
      status: query.status,
      type: query.type,
      difficulty: query.difficulty,
      unitId: query.unitId,
      topicId: query.topicId,
      objectiveId: query.objectiveId,
      search: query.search,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 20,
    });

    res.status(200).json({
      success: true,
      data: {
        items: result.items,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          hasNextPage: result.page < result.totalPages,
          hasPreviousPage: result.page > 1,
        },
      },
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    const id = req.params.id as string;

    const result = await service.update(tenantId, id, userId, req.body);
    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: result,
    });
  });

  publish = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const id = req.params.id as string;

    const result = await service.publish(tenantId, id);
    res.status(200).json({
      success: true,
      message: "Question published successfully",
      data: result,
    });
  });

  resolveReport = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    const id = req.params.id as string;
    const reportId = req.params.reportId as string;
    const resolutionNote = (req.body as { resolutionNote?: string })?.resolutionNote;

    const result = await service.resolveReport(tenantId, id, reportId, userId, resolutionNote);
    res.status(200).json({
      success: true,
      message: "Question report resolved successfully",
      data: result,
    });
  });

  submitReport = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    const id = req.params.id as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    });
    const userFullName = user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Student"
      : "Student";

    const result = await service.submitReport(
      tenantId,
      id,
      userId,
      userFullName,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data: result,
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const id = req.params.id as string;

    await service.delete(tenantId, id);
    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  });
}

