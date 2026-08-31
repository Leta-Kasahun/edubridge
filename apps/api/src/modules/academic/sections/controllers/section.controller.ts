import { Request, Response } from "express";
import { asyncHandler } from "../../../../shared/utils/async-handler.js";
import { UnauthorizedError, BadRequestError } from "../../../../shared/exceptions/index.js";
import { sectionService, SectionService } from "../services/section.service.js";
import {
  createSectionSchema,
  bulkCreateSectionsSchema,
  updateSectionSchema,
  updateSectionStatusSchema,
} from "../schemas/section.schema.js";
import { SectionStatusType } from "../../../../shared/constants/section.constants.js";

function getTenantId(req: Request): string {
  const tenantId = req.user?.tenantId || (req.headers["x-tenant-id"] as string);
  if (!tenantId) {
    throw new UnauthorizedError("Tenant context is required");
  }
  return tenantId;
}

export class SectionController {
  constructor(private readonly service: SectionService = sectionService) {}

  getSections = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const academicYearId =
      typeof req.query.academicYearId === "string" ? req.query.academicYearId : undefined;
    const gradeId =
      typeof req.query.gradeId === "string" ? req.query.gradeId : undefined;
    const statusParam = req.query.status;
    const status =
      statusParam === "ACTIVE" || statusParam === "INACTIVE" || statusParam === "ARCHIVED"
        ? (statusParam as SectionStatusType)
        : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    const sections = await this.service.getSections(tenantId, {
      academicYearId,
      gradeId,
      status,
      search,
    });

    res.status(200).json({
      success: true,
      data: sections,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new BadRequestError("Section ID is required");
    }

    const section = await this.service.getSectionById(tenantId, id);

    res.status(200).json({
      success: true,
      data: section,
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const validated = createSectionSchema.parse({
      academicYearId: req.body.academicYearId,
      gradeId: req.body.gradeId,
      name: req.body.name,
      code: req.body.code,
      capacity: req.body.capacity !== undefined && req.body.capacity !== null && req.body.capacity !== "" ? Number(req.body.capacity) : null,
      homeroomTeacherId: req.body.homeroomTeacherId || null,
    });

    const section = await this.service.createSection(tenantId, validated);

    res.status(201).json({
      success: true,
      data: section,
      message: `Section "${section.name}" created successfully`,
    });
  });

  bulkCreate = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const validated = bulkCreateSectionsSchema.parse({
      academicYearId: req.body.academicYearId,
      gradeId: req.body.gradeId,
      sectionNames: req.body.sectionNames,
      capacity: req.body.capacity !== undefined && req.body.capacity !== null && req.body.capacity !== "" ? Number(req.body.capacity) : null,
    });

    const result = await this.service.bulkCreateSections(tenantId, validated);

    res.status(201).json({
      success: true,
      data: result,
      message: `Successfully created ${result.createdCount} of ${result.totalRequested} sections`,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new BadRequestError("Section ID is required");
    }

    const validated = updateSectionSchema.parse({
      name: req.body.name,
      capacity: req.body.capacity !== undefined && req.body.capacity !== null && req.body.capacity !== "" ? Number(req.body.capacity) : req.body.capacity === null ? null : undefined,
      status: req.body.status,
      homeroomTeacherId: req.body.homeroomTeacherId !== undefined ? req.body.homeroomTeacherId || null : undefined,
    });

    const section = await this.service.updateSection(tenantId, id, validated);

    res.status(200).json({
      success: true,
      data: section,
      message: `Section "${section.name}" updated successfully`,
    });
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new BadRequestError("Section ID is required");
    }

    const validated = updateSectionStatusSchema.parse(req.body);
    const section = await this.service.updateStatus(tenantId, id, validated.status as SectionStatusType);

    res.status(200).json({
      success: true,
      data: section,
      message: `Section "${section.name}" status updated to ${section.status}`,
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new BadRequestError("Section ID is required");
    }

    await this.service.deleteSection(tenantId, id);

    res.status(200).json({
      success: true,
      message: "Section deleted successfully",
    });
  });
}

export const sectionController = new SectionController();
