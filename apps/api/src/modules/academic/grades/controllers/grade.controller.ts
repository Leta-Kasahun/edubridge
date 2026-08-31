import { Request, Response } from "express";
import { asyncHandler } from "../../../../shared/utils/async-handler.js";
import { UnauthorizedError, BadRequestError } from "../../../../shared/exceptions/index.js";
import { gradeService, GradeService } from "../services/grade.service.js";
import { createGradeSchema } from "../schemas/grade.schema.js";

function getTenantId(req: Request): string {
  const tenantId = req.user?.tenantId || (req.headers["x-tenant-id"] as string);
  if (!tenantId) {
    throw new UnauthorizedError("Tenant context is required");
  }
  return tenantId;
}

export class GradeController {
  constructor(private readonly service: GradeService = gradeService) {}

  getGrades = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const isActiveParam = req.query.isActive;
    const isActive =
      isActiveParam === "true" ? true : isActiveParam === "false" ? false : undefined;
    const categoryParam = req.query.category;
    const category =
      categoryParam === "ELEMENTARY" || categoryParam === "HIGH_SCHOOL"
        ? categoryParam
        : undefined;
    const academicYearId =
      typeof req.query.academicYearId === "string" ? req.query.academicYearId : undefined;

    const grades = await this.service.getGrades(tenantId, {
      search,
      isActive,
      category,
      academicYearId,
    });

    res.status(200).json({
      success: true,
      data: grades,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new BadRequestError("Grade ID is required");
    }

    const academicYearId =
      typeof req.query.academicYearId === "string" ? req.query.academicYearId : undefined;

    const grade = await this.service.getGradeById(tenantId, id, academicYearId);

    res.status(200).json({
      success: true,
      data: grade,
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const validated = createGradeSchema.parse({
      level: Number(req.body.level),
      isActive: req.body.isActive,
    });

    const grade = await this.service.createGrade(tenantId, validated);

    res.status(201).json({
      success: true,
      data: grade,
      message: `Grade ${grade.level} created successfully`,
    });
  });

  toggleActive = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new BadRequestError("Grade ID is required");
    }

    const grade = await this.service.toggleActiveStatus(tenantId, id);

    res.status(200).json({
      success: true,
      data: grade,
      message: `Grade ${grade.level} is now ${grade.isActive ? "Active" : "Inactive"}`,
    });
  });
}

export const gradeController = new GradeController();
