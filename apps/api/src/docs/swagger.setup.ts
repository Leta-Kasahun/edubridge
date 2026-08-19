import swaggerUi from "swagger-ui-express";
import { Express, Request, Response } from "express";
import { routeRegistry } from "./route.registry.js";
import { registerAllModules } from "./route.modules.js";
import { swaggerConfig } from "./swagger.config.js";
import { renderSwaggerHtml } from "./swagger.html.js";

export function setupSwagger(app: Express): void {
  registerAllModules();

  const spec = {
    ...swaggerConfig,
    tags: routeRegistry.generateTags(),
    paths: routeRegistry.generatePaths(),
    components: routeRegistry.generateComponents(),
  };

  const swaggerHtml = renderSwaggerHtml({
    title: "EduBridge API - Swagger UI",
    specUrl: "/openapi.json",
  });

  // Serve swagger-ui static assets
  app.use("/api-docs", swaggerUi.serveFiles(spec, {}));

  // Serve FastAPI-style Swagger UI on /docs and /api-docs
  const renderDocs = (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/html");
    res.send(swaggerHtml);
  };

  app.get("/docs", renderDocs);
  app.get("/api-docs", renderDocs);

  // Serve OpenAPI specification
  const sendSpec = (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.json(spec);
  };

  app.get("/openapi.json", sendSpec);
  app.get("/api-docs.json", sendSpec);
  app.get("/api-docs/openapi.json", sendSpec);
}