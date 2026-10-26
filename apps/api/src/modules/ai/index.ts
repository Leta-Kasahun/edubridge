import { registerAiDocs } from "./ai.doc.js";

registerAiDocs();

export * from "./types/ai.types.js";
export * from "./schemas/question-generation.schema.js";
export * from "./schemas/content-generation.schema.js";
export * from "./schemas/explanation.schema.js";
export * from "./repository/ai-job.repository.js";
export * from "./services/explanation.service.js";
export * from "./services/question-generation.service.js";
export * from "./services/content-generation.service.js";
export * from "./controllers/explanation.controller.js";
export * from "./controllers/question-generation.controller.js";
export * from "./controllers/content-generation.controller.js";
export * from "./ai.route.js";
