import { Request, Response } from "express";
import { asyncHandler } from "../../../../shared/utils/async-handler.js";
import {
  tenantProvisioningService,
  TenantProvisioningService,
} from "../services/tenant-provisioning.service.js";

export class TenantProvisioningController {
  constructor(
    private readonly service: TenantProvisioningService = tenantProvisioningService
  ) {}

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
