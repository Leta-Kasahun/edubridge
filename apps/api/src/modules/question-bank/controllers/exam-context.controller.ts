import { Request, Response } from "express";
import { ExamContextService } from "../services/exam-context.service.js";
import { ExamContextQueryDto } from "../types/question-bank.types.js";
import { asyncHandler } from "../../../shared/utils/async-handler.js";
import { UnauthorizedError } from "../../../shared/exceptions/index.js";

const service = new ExamContextService();

function getTenantId(req: Request): string {
  const tenantId = req.user?.tenantId || (req.headers["x-tenant-id"] as string);
  if (!tenantId) {
    throw new UnauthorizedError("Tenant context is required");
  }
  return tenantId;
}

export class ExamContextController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const result = await service.create(tenantId, req.body);
    res.status(201).json({
      success: true,
      message: "Exam context created successfully",
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
    const query = req.query as unknown as ExamContextQueryDto;

    const result = await service.findMany(tenantId, {
      scope: query.scope,
      status: query.status,
      gradeId: query.gradeId,
      subjectId: query.subjectId,
      examYear: query.examYear ? Number(query.examYear) : undefined,
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
    const id = req.params.id as string;
    const result = await service.update(tenantId, id, req.body);
    res.status(200).json({
      success: true,
      message: "Exam context updated successfully",
      data: result,
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const id = req.params.id as string;
    await service.delete(tenantId, id);
    res.status(200).json({
      success: true,
      message: "Exam context deleted successfully",
    });
  });
}
