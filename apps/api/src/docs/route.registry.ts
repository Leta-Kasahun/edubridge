export interface ParameterDefinition {
  name: string;
  in: "path" | "query" | "header" | "cookie";
  required?: boolean;
  schema: Record<string, unknown>;
  description?: string;
}

export interface RouteDefinition {
  path: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | string;
  summary?: string;
  description: string;
  tags: string[];
  security?: boolean;
  requestBody?: unknown;
  parameters?: ParameterDefinition[];
  responses?: Record<number, { description: string; content?: Record<string, unknown> }>;
}

export interface SchemaDefinition {
  type: string;
  properties?: Record<string, unknown>;
  required?: string[];
  description?: string;
  items?: Record<string, unknown>;
  enum?: string[];
}

export interface TagDefinition {
  name: string;
  description: string;
}

function convertToOpenApiSchema(schemaInput: unknown): Record<string, unknown> | undefined {
  if (!schemaInput || typeof schemaInput !== "object") {
    return undefined;
  }

  // Handle Zod schemas if toJSONSchema is present
  if ("toJSONSchema" in schemaInput && typeof (schemaInput as { toJSONSchema: () => Record<string, unknown> }).toJSONSchema === "function") {
    const jsonSchema = (schemaInput as { toJSONSchema: () => Record<string, unknown> }).toJSONSchema();
    const cleanSchema = { ...jsonSchema };
    delete cleanSchema.$schema;
    return cleanSchema;
  }

  // Plain JSON / OpenAPI schema
  return schemaInput as Record<string, unknown>;
}

class RouteRegistry {
  private routes: RouteDefinition[] = [];
  private schemas: Map<string, SchemaDefinition> = new Map();
  private tagDescriptions: Map<string, string> = new Map();
  private tags: Set<string> = new Set();

  register(definition: RouteDefinition): void {
    this.routes.push(definition);
    definition.tags.forEach((tag) => this.tags.add(tag));
  }

  registerSchema(name: string, schema: SchemaDefinition): void {
    this.schemas.set(name, schema);
  }

  registerTag(name: string, description: string): void {
    this.tags.add(name);
    this.tagDescriptions.set(name, description);
  }

  generatePaths(): Record<string, Record<string, unknown>> {
    const paths: Record<string, Record<string, unknown>> = {};

    this.routes.forEach((route) => {
      const method = route.method.toLowerCase();
      // Normalize express :param syntax to OpenAPI {param} syntax
      const routePath = route.path.replace(/:([a-zA-Z0-9_]+)/g, "{$1}");

      if (!paths[routePath]) {
        paths[routePath] = {};
      }

      const responses =
        route.responses && Object.keys(route.responses).length > 0
          ? route.responses
          : {
              200: {
                description: "Successful Response",
              },
            };

      const operation: Record<string, unknown> = {
        tags: route.tags,
        summary: route.summary || route.description,
        description: route.description,
        operationId: `${method}_${routePath.replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "")}`,
        security: route.security ? [{ bearerAuth: [] }] : [],
        responses,
      };

      // Extract path parameter names from routePath (e.g. {id}, {category})
      const pathParamNames: string[] = [];
      const matches = routePath.match(/{([^}]+)}/g);
      if (matches) {
        matches.forEach((m) => {
          pathParamNames.push(m.slice(1, -1));
        });
      }

      const explicitParams = (route.parameters || []).map((p) => ({
        name: p.name,
        in: p.in,
        required: p.required !== undefined ? p.required : p.in === "path",
        description: p.description || `${p.name} parameter`,
        schema: p.schema,
      }));

      const explicitParamNames = new Set(explicitParams.map((p) => p.name));
      const autoPathParams = pathParamNames
        .filter((name) => !explicitParamNames.has(name))
        .map((name) => ({
          name,
          in: "path",
          required: true,
          description: `${name} path parameter`,
          schema: { type: "string" },
        }));

      const allParams = [...explicitParams, ...autoPathParams];
      if (allParams.length > 0) {
        operation.parameters = allParams;
      }

      if (route.requestBody) {
        const reqObj = route.requestBody as Record<string, unknown>;
        const schema = convertToOpenApiSchema(reqObj.schema || route.requestBody);
        if (schema) {
          operation.requestBody = {
            required: reqObj.required !== false,
            content: {
              "application/json": {
                schema,
              },
            },
          };
        }
      }

      paths[routePath][method] = operation;
    });

    return paths;
  }

  generateComponents(): Record<string, unknown> {
    return {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: 'JWT Authorization header using the Bearer scheme. Example: "Bearer eyJhbGciOi..."',
        },
        tenantHeader: {
          type: "apiKey",
          in: "header",
          name: "x-tenant-id",
          description: "Tenant ID Header for multi-tenant partition context",
        },
      },
      schemas: Object.fromEntries(this.schemas),
    };
  }

  generateTags(): Array<TagDefinition> {
    return Array.from(this.tags).map((tag) => ({
      name: tag,
      description: this.tagDescriptions.get(tag) || `${tag} operations`,
    }));
  }
}

export const routeRegistry = new RouteRegistry();