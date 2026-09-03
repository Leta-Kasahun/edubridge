import { Request, Response } from "express";
import { asyncHandler } from "../../../../shared/utils/async-handler.js";
import {
  UnitService,
  unitService,
} from "../services/unit.service.js";
import { getTenantId } from "./controller.utils.js";
import {
  createUnitSchema,
  updateUnitSchema,
  structureFilterSchema,
  subjectIdParamSchema,
  unitIdParamSchema,
} from "../schemas/structure.schema.js";

export class UnitController {
  constructor(
    private readonly service: UnitService = unitService
  ) {}

  getUnitsBySubject = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { subjectId } = subjectIdParamSchema.parse(req.params);
      const tenantId = getTenantId(req) || null;
      const params = structureFilterSchema.parse(req.query);

      const result = await this.service.getUnitsBySubject(
        tenantId,
        subjectId,
        params
      );

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
    }
  );

  getUnitById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { unitId } = unitIdParamSchema.parse(req.params);
      const tenantId = getTenantId(req) || null;

      const unit = await this.service.getUnitById(tenantId, unitId);

      res.status(200).json({
        success: true,
        data: unit,
      });
    }
  );

  createUnit = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const tenantId = getTenantId(req) || null;
      const input = createUnitSchema.parse(req.body);

      const unit = await this.service.createUnit(tenantId, input);

      res.status(201).json({
        success: true,
        data: unit,
      });
    }
  );

  updateUnit = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { unitId } = unitIdParamSchema.parse(req.params);
      const tenantId = getTenantId(req) || null;
      const input = updateUnitSchema.parse(req.body);

      const unit = await this.service.updateUnit(tenantId, unitId, input);

      res.status(200).json({
        success: true,
        data: unit,
      });
    }
  );

  deleteUnit = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { unitId } = unitIdParamSchema.parse(req.params);
      const tenantId = getTenantId(req) || null;

      await this.service.deleteUnit(tenantId, unitId);

      res.status(200).json({
        success: true,
        message: "Curriculum unit deleted successfully",
      });
    }
  );
}

export const unitController = new UnitController();
