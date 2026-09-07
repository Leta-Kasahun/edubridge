import { Request, Response } from "express";
import { QuestionBankService } from "../services/question-bank.service.js";
import { QuestionBankQueryDto } from "../types/question-bank.types.js";
import { asyncHandler } from "../../../shared/utils/async-handler.js";
import { UnauthorizedError } from "../../../shared/exceptions/index.js";

const service = new QuestionBankService();

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

export class QuestionBankController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const createdById = getUserId(req);
    const result = await service.create(tenantId, createdById, req.body);
    res.status(201).json({
      success: true,
      message: "Question bank created successfully",
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

  list = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const query = req.query as unknown as QuestionBankQueryDto;
    const isTeacherOnly =
      req.user?.roles?.includes("TEACHER") &&
      !req.user?.roles?.includes("SCHOOL_ADMIN") &&
      !req.user?.roles?.includes("SYSTEM_ADMIN");
    const createdById = isTeacherOnly ? req.user?.userId : query.createdById;

    const result = await service.findMany(tenantId, {
      status: query.status,
      search: query.search,
      examContextId: query.examContextId,
      createdById,
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
    const id = req.params.id as string;
    const result = await service.update(tenantId, id, req.body);
    res.status(200).json({
      success: true,
      message: "Question bank updated successfully",
      data: result,
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const id = req.params.id as string;
    await service.delete(tenantId, id);
    res.status(200).json({
      success: true,
      message: "Question bank deleted successfully",
    });
  });
}
