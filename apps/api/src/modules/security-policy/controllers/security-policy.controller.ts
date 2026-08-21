import { Request, Response } from "express";
import { securityPolicyService } from "../services/security-policy.service.js";
import { asyncHandler } from "../../../shared/utils/async-handler.js";

export class SecurityPolicyController {
  getPolicy = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req.tenantId || req.user?.tenantId) as string;
    const data = await securityPolicyService.getPolicy(tenantId);
    res.status(200).json({ success: true, data });
  });

  updatePolicy = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req.tenantId || req.user?.tenantId) as string;
    const data = await securityPolicyService.updatePolicy(tenantId, req.body);
    res.status(200).json({ success: true, data });
  });
}

export const securityPolicyController = new SecurityPolicyController();
