import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { corsConfig } from "./config/cors.js";
import { securityConfig } from "./config/security.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { setupSwagger } from "./docs/swagger.setup.js";
import { healthRouter } from "./modules/health/route.js";
import { authRouter } from "./modules/auth/route.js";
import { permissionRouter } from "./modules/permissions/route.js";
import { lookupRouter } from "./modules/lookup/route.js";
import { securityPolicyRouter } from "./modules/security-policy/route.js";
import { tenantProvisioningRouter } from "./modules/provisioning/tenant/route.js";
import { teacherProvisioningRouter } from "./modules/provisioning/teacher/route.js";
import { studentProvisioningRouter } from "./modules/provisioning/student/route.js";
import { teacherProfileRouter } from "./modules/teacher-profile/route.js";

const app: Express = express();

app.use(helmet(securityConfig.helmet));
app.use(cors(corsConfig));
app.use(compression());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
}

setupSwagger(app);

app.use("/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api", permissionRouter);
app.use("/api/lookups", lookupRouter);
app.use("/api/security-policy", securityPolicyRouter);
app.use("/api/provisioning/tenant", tenantProvisioningRouter);
app.use("/api/provisioning/teachers", teacherProvisioningRouter);
app.use("/api/provisioning/teacher", teacherProvisioningRouter);
app.use("/api/provisioning/students", studentProvisioningRouter);
app.use("/api/provisioning/student", studentProvisioningRouter);
app.use("/api/teacher-profile", teacherProfileRouter);
app.use("/api/teacher-profiles", teacherProfileRouter);

app.use(errorHandler);

export { app };
