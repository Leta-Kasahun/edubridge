import { Request, Response } from "express";
import { asyncHandler } from "../../../../shared/utils/async-handler.js";
import {
  UnauthorizedError,
  BadRequestError,
} from "../../../../shared/exceptions/index.js";
import {
  curriculumService,
  CurriculumService,
} from "../services/curriculum.service.js";
import {
  createCurriculumSchema,
  updateCurriculumSchema,
  createCurriculumVersionSchema,
  updateCurriculumVersionSchema,
  changeCurriculumStatusSchema,
  changeCurriculumVersionStatusSchema,
  curriculumFilterSchema,
} from "../schemas/curriculum.schema.js";

function getTenantId(req: Request): string {
  const tenantId = req.user?.tenantId || (req.headers["x-tenant-id"] as string);
  if (!tenantId) {
    throw new UnauthorizedError("Tenant context is required");
  }
  return tenantId;
}

export class CurriculumController {
  constructor(
    private readonly service: CurriculumService = curriculumService
  ) {}

  getCurricula = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const validated = curriculumFilterSchema.parse(req.query);

    const result = await this.service.getCurricula(tenantId, validated);

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

  getById = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new BadRequestError("Curriculum ID is required");
    }

    const curriculum = await this.service.getCurriculumById(tenantId, id);

    res.status(200).json({
      success: true,
      data: curriculum,
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const validated = createCurriculumSchema.parse(req.body);

    const created = await this.service.createCurriculum(tenantId, validated);

    res.status(201).json({
      success: true,
      data: created,
      message: `Curriculum "${created.name}" created successfully`,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new BadRequestError("Curriculum ID is required");
    }

    const validated = updateCurriculumSchema.parse(req.body);
    const updated = await this.service.updateCurriculum(tenantId, id, validated);

    res.status(200).json({
      success: true,
      data: updated,
      message: `Curriculum "${updated.name}" updated successfully`,
    });
  });

  changeStatus = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new BadRequestError("Curriculum ID is required");
    }

    const validated = changeCurriculumStatusSchema.parse(req.body);
    const updated = await this.service.changeCurriculumStatus(
      tenantId,
      id,
      validated.status
    );

    res.status(200).json({
      success: true,
      data: updated,
      message: `Curriculum status updated to ${updated.status}`,
    });
  });

  createVersion = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new BadRequestError("Curriculum ID is required");
    }

    const validated = createCurriculumVersionSchema.parse(req.body);
    const created = await this.service.createCurriculumVersion(
      tenantId,
      id,
      validated
    );

    res.status(201).json({
      success: true,
      data: created,
      message: `Version "${created.name}" created successfully`,
    });
  });

  updateVersion = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const versionId = Array.isArray(req.params.versionId)
      ? req.params.versionId[0]
      : req.params.versionId;

    if (!id || !versionId) {
      throw new BadRequestError("Curriculum ID and Version ID are required");
    }

    const validated = updateCurriculumVersionSchema.parse(req.body);
    const updated = await this.service.updateCurriculumVersion(
      tenantId,
      id,
      versionId,
      validated
    );

    res.status(200).json({
      success: true,
      data: updated,
      message: `Version "${updated.name}" updated successfully`,
    });
  });

  changeVersionStatus = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const versionId = Array.isArray(req.params.versionId)
      ? req.params.versionId[0]
      : req.params.versionId;

    if (!id || !versionId) {
      throw new BadRequestError("Curriculum ID and Version ID are required");
    }

    const validated = changeCurriculumVersionStatusSchema.parse(req.body);
    const updated = await this.service.changeCurriculumVersionStatus(
      tenantId,
      id,
      versionId,
      validated.status
    );

    res.status(200).json({
      success: true,
      data: updated,
      message: `Version status updated to ${updated.status}`,
    });
  });
}

export const curriculumController = new CurriculumController();
