import assessmentRouter from "./assessment.route.js";
import attemptRouter from "./attempt.route.js";
import "./assessment.doc.js";

export { assessmentRouter, attemptRouter };
export * from "./types/assessment.types.js";
export * from "./schemas/assessment.schema.js";
export * from "./schemas/attempt.schema.js";
export * from "./services/assessment.service.js";
export * from "./services/attempt.service.js";
export * from "./repository/assessment.repository.js";
export * from "./repository/attempt.repository.js";
export * from "./controllers/assessment.controller.js";
export * from "./controllers/attempt.controller.js";
