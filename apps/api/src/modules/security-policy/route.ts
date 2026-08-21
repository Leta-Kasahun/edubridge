import { Router } from "express";
import { authenticate, requireTenant, requirePermission, validate } from "../../middleware/index.js";
import { securityPolicyController } from "./controllers/security-policy.controller.js";
import { updateSecurityPolicySchema } from "./schemas/security-policy.schema.js";

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.get(
  "/",
  requirePermission("configure", "security_policy"),
  securityPolicyController.getPolicy
);

router.put(
  "/",
  requirePermission("configure", "security_policy"),
  validate(updateSecurityPolicySchema),
  securityPolicyController.updatePolicy
);

export { router as securityPolicyRouter };
