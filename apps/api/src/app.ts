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

const app: Express = express();

app.use(helmet(securityConfig.helmet));
app.use(cors(corsConfig));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use(errorHandler);

export { app };
