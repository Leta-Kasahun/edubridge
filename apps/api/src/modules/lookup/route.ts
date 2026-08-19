import { Router } from "express";
import { authenticate, requireTenant, requirePermission, validate } from "../../middleware/index.js";
import { lookupController } from "./controllers/lookup.controller.js";
import { createLookupSchema, updateLookupSchema } from "./schemas/lookup.schema.js";

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.get("/:category", requirePermission("READ", "lookup"), lookupController.getAll);
router.get("/:category/:key", requirePermission("READ", "lookup"), lookupController.getByKey);
router.post("/", requirePermission("CREATE", "lookup"), validate(createLookupSchema), lookupController.create);
router.put("/:id", requirePermission("UPDATE", "lookup"), validate(updateLookupSchema), lookupController.update);
router.delete("/:id", requirePermission("DELETE", "lookup"), lookupController.delete);

export { router as lookupRouter };
