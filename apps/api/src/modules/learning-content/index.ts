import { Router } from "express";
import { contentRouter } from "./content/content.route.js";
import { contentImportRouter } from "./import/content-import.route.js";
import { registerContentDocs } from "./content/content.doc.js";
import { registerContentImportDocs } from "./import/content-import.doc.js";

registerContentDocs();
registerContentImportDocs();

const router: Router = Router();

router.use("/content", contentRouter);
router.use("/import", contentImportRouter);

export { router as learningContentRouter };
export * from "./content/types/content.types.js";
export * from "./content/schemas/content.schema.js";
export * from "./content/repository/content.repository.js";
export * from "./content/services/content.service.js";
export * from "./content/services/content-attachment.service.js";
export * from "./content/controllers/content.controller.js";
export * from "./content/controllers/content-attachment.controller.js";
export * from "./import/types/content-import.types.js";
export * from "./import/schemas/content-import.schema.js";
export * from "./import/repository/content-import.repository.js";
export * from "./import/services/content-import.service.js";
export * from "./import/controllers/content-import.controller.js";
