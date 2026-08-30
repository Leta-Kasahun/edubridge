import { Request, Response } from "express";
import { asyncHandler } from "../../../../shared/utils/async-handler.js";
import { UnauthorizedError, BadRequestError } from "../../../../shared/exceptions/index.js";
import { AcademicYearStatus } from "../../../../generated/prisma/client.js";
import { DEFAULT_ACADEMIC_YEAR_PAGE_LIMIT } from "../../../../shared/constants/academic.constants.js";
import {
  academicYearService,
  AcademicYearService,
} from "../services/academic-year.service.js";
import {
  createAcademicYearSchema,
  updateAcademicYearSchema,
} from "../schemas/academic-year.schema.js";

function getTenantId(req: Request): string {
  const tenantId = req.user?.tenantId || (req.headers["x-tenant-id"] as string);
  if (!tenantId) {
    throw new UnauthorizedError("Tenant context is required");
  }
  return tenantId;
}

export class AcademicYearController {
  constructor(
    private readonly service: AcademicYearService = academicYearService
  ) {}

  getAcademicYears = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const status = typeof req.query.status === "string"
      ? (req.query.status as AcademicYearStatus)
      : undefined;
    const page = typeof req.query.page === "string" ? parseInt(req.query.page, 10) : 1;
    const limit = typeof req.query.limit === "string"
      ? parseInt(req.query.limit, 10)
      : DEFAULT_ACADEMIC_YEAR_PAGE_LIMIT;

    const result = await this.service.getAcademicYears(tenantId, {
      search,
      status,
      page: isNaN(page) ? 1 : page,
      limit: isNaN(limit) ? DEFAULT_ACADEMIC_YEAR_PAGE_LIMIT : limit,
    });

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  });

  getActiveYear = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const year = await this.service.getActiveAcademicYear(tenantId);

    res.status(200).json({
      success: true,
      data: year,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new BadRequestError("Academic Year ID is required");
    }

    const year = await this.service.getAcademicYearById(tenantId, id);

    res.status(200).json({
      success: true,
      data: year,
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const validated = createAcademicYearSchema.parse(req.body);
    const year = await this.service.createAcademicYear(tenantId, validated);

    res.status(201).json({
      success: true,
      data: year,
      message: "Academic year created successfully",
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new BadRequestError("Academic Year ID is required");
    }

    const validated = updateAcademicYearSchema.parse(req.body);
    const year = await this.service.updateAcademicYear(tenantId, id, validated);

    res.status(200).json({
      success: true,
      data: year,
      message: "Academic year updated successfully",
    });
  });

  setActive = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new BadRequestError("Academic Year ID is required");
    }

    const year = await this.service.setActiveAcademicYear(tenantId, id);

    res.status(200).json({
      success: true,
      data: year,
      message: `"${year.name}" set as current active academic year`,
    });
  });

  archive = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new BadRequestError("Academic Year ID is required");
    }

    const year = await this.service.archiveAcademicYear(tenantId, id);

    res.status(200).json({
      success: true,
      data: year,
      message: `"${year.name}" archived successfully`,
    });
  });

  restore = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new BadRequestError("Academic Year ID is required");
    }

    const year = await this.service.restoreAcademicYear(tenantId, id);

    res.status(200).json({
      success: true,
      data: year,
      message: `"${year.name}" restored successfully`,
    });
  });
}

export const academicYearController = new AcademicYearController();
