import { Router } from "express";
import { authenticate } from "../../../middleware/auth.js";
import { requireRoles } from "../../../middleware/rbac.js";
import { validate } from "../../../middleware/validate.js";
import { tenantProvisioningController } from "./controllers/tenant-provisioning.controller.js";
import {
  provisionSchoolAdminInviteSchema,
  provisionSchoolAdminDirectSchema,
  provisionSchoolAdminSchema,
  regenerateCredentialsSchema,
} from "./schemas/tenant-provisioning.schema.js";

const router: Router = Router();

router.use(authenticate, requireRoles("SYSTEM_ADMIN"));

router.post(
  "/invite",
  validate(provisionSchoolAdminInviteSchema),
  tenantProvisioningController.inviteSchoolAdmin
);

router.post(
  "/direct",
  validate(provisionSchoolAdminDirectSchema),
  tenantProvisioningController.createSchoolAdminDirect
);

router.post(
  "/",
  validate(provisionSchoolAdminSchema),
  tenantProvisioningController.provisionSchoolAdmin
);

router.post(
  "/regenerate-credentials",
  validate(regenerateCredentialsSchema),
  tenantProvisioningController.regenerateCredentials
);

export { router as tenantProvisioningRouter };
