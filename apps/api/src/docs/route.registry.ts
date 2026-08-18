// src/docs/route.registry.ts

export interface ParameterDefinition {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required?: boolean;
  schema: Record<string, unknown>;
  description?: string;
  example?: unknown;
}

export interface RouteDefinition {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  summary?: string;
  description: string;
  tags: string[];
  security?: boolean;
  requestBody?: Record<string, unknown>;
  parameters?: ParameterDefinition[];
  responses?: Record<number, { description: string; content?: Record<string, unknown> }>;
}

export interface SchemaDefinition {
  type: string;
  properties?: Record<string, unknown>;
  required?: string[];
  description?: string;
  example?: unknown;
  items?: Record<string, unknown>;
  enum?: string[];
}

export interface TagDefinition {
  name: string;
  description: string;
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
      const routePath = route.path;

      if (!paths[routePath]) {
        paths[routePath] = {};
      }

      const defaultResponses: Record<number, { description: string; content?: Record<string, unknown> }> = {
        200: { description: 'Successful operation' },
        201: { description: 'Resource created successfully' },
        400: {
          description: 'Bad Request - Validation or parameter error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiErrorResponse' },
            },
          },
        },
        401: {
          description: 'Unauthorized - Missing or invalid JWT token',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiErrorResponse' },
            },
          },
        },
        403: {
          description: 'Forbidden - Insufficient permissions for tenant or action',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiErrorResponse' },
            },
          },
        },
        404: {
          description: 'Not Found - Resource does not exist or is outside tenant scope',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiErrorResponse' },
            },
          },
        },
        429: {
          description: 'Too Many Requests - Rate limit exceeded',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiErrorResponse' },
            },
          },
        },
        500: {
          description: 'Internal Server Error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiErrorResponse' },
            },
          },
        },
      };

      const operation: Record<string, unknown> = {
        tags: route.tags,
        summary: route.summary || route.description,
        description: route.description,
        operationId: `${method}_${routePath.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')}`,
        security: route.security !== false ? [{ bearerAuth: [] }] : [],
        responses: { ...defaultResponses, ...(route.responses || {}) },
      };

      if (route.parameters && route.parameters.length > 0) {
        operation.parameters = route.parameters.map((p) => ({
          name: p.name,
          in: p.in,
          required: p.required !== undefined ? p.required : p.in === 'path',
          description: p.description || `${p.name} parameter`,
          schema: p.schema,
          ...(p.example !== undefined ? { example: p.example } : {}),
        }));
      }

      if (route.requestBody) {
        operation.requestBody = {
          required: true,
          content: {
            'application/json': {
              schema: route.requestBody,
            },
          },
        };
      }

      paths[routePath][method] = operation;
    });

    return paths;
  }

  generateComponents(): Record<string, unknown> {
    return {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme. Example: "Bearer eyJhbGciOi..."',
        },
        tenantHeader: {
          type: 'apiKey',
          in: 'header',
          name: 'x-tenant-id',
          description: 'Tenant ID Header for multi-tenant partition context',
        },
      },
      schemas: Object.fromEntries(this.schemas),
    };
  }

  generateTags(): Array<TagDefinition> {
    return Array.from(this.tags).map((tag) => ({
      name: tag,
      description: this.tagDescriptions.get(tag) || `${tag} domain operations and management`,
    }));
  }
}

export const routeRegistry = new RouteRegistry();