import { Router } from "express";
import { contentRouter } from "./content/content.route.js";
import { registerContentDocs } from "./content/content.doc.js";

registerContentDocs();

const router: Router = Router();

router.use("/content", contentRouter);

export { router as learningContentRouter };
export * from "./content/types/content.types.js";
export * from "./content/schemas/content.schema.js";
export * from "./content/repository/content.repository.js";
export * from "./content/services/content.service.js";
export * from "./content/services/content-attachment.service.js";
export * from "./content/controllers/content.controller.js";
export * from "./content/controllers/content-attachment.controller.js";

