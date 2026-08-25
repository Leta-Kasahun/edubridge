import { Request, Response } from "express";
import { asyncHandler } from "../../../../shared/utils/async-handler.js";
import { BadRequestError } from "../../../../shared/exceptions/index.js";
import { TenantStatus } from "../../../../generated/prisma/client.js";
import {
  tenantProvisioningService,
  TenantProvisioningService,
} from "../services/tenant-provisioning.service.js";

export class TenantProvisioningController {
  constructor(
    private readonly service: TenantProvisioningService = tenantProvisioningService
  ) {}

  getTenants = asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;
    const status = req.query.status as TenantStatus | undefined;

    const result = await this.service.getTenants({
      page,
      limit,
      search,
      status,
    });

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  });

  getTenantById = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!tenantId) {
      throw new BadRequestError("Tenant ID is required");
    }

    const result = await this.service.getTenantById(tenantId);
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  activateTenant = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!tenantId) {
      throw new BadRequestError("Tenant ID is required");
    }

    const result = await this.service.activateTenant(tenantId);
    res.status(200).json({
      success: true,
      data: result,
      message: "School/Tenant activated successfully",
    });
  });

  deactivateTenant = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!tenantId) {
      throw new BadRequestError("Tenant ID is required");
    }

    const result = await this.service.deactivateTenant(tenantId);
    res.status(200).json({
      success: true,
      data: result,
      message: "School/Tenant deactivated successfully",
    });
  });

  inviteSchoolAdmin = asyncHandler(async (req: Request, res: Response) => {
    const createdById = req.user?.userId;
    const result = await this.service.inviteSchoolAdmin(req.body, createdById);
    res.status(201).json({
      success: true,
      data: result,
    });
  });

  createSchoolAdminDirect = asyncHandler(async (req: Request, res: Response) => {
    const createdById = req.user?.userId;
    const result = await this.service.createSchoolAdminDirect(req.body, createdById);
    res.status(201).json({
      success: true,
      data: result,
    });
  });

  provisionSchoolAdmin = asyncHandler(async (req: Request, res: Response) => {
    const createdById = req.user?.userId;
    const result = await this.service.provisionSchoolAdmin(req.body, createdById);
    res.status(201).json({
      success: true,
      data: result,
    });
  });

  regenerateCredentials = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.body;
    const result = await this.service.regenerateSchoolAdminCredentials(userId);
    res.status(200).json({
      success: true,
      data: result,
    });
  });
}

export const tenantProvisioningController = new TenantProvisioningController();
