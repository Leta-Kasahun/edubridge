import { routeRegistry } from "../../docs/route.registry.js";
import { createLookupSchema, updateLookupSchema } from "./schemas/lookup.schema.js";

const lookupRouteDefinitions = [
  {
    path: "/lookups/:category",
    method: "GET",
    description: "List lookups by category",
    tags: ["Lookups"],
    security: true,
  },
  {
    path: "/lookups/:category/:key",
    method: "GET",
    description: "Get lookup by category and key",
    tags: ["Lookups"],
    security: true,
  },
  {
    path: "/lookups",
    method: "POST",
    requestBody: createLookupSchema,
    description: "Create lookup",
    tags: ["Lookups"],
    security: true,
  },
  {
    path: "/lookups/:id",
    method: "PUT",
    requestBody: updateLookupSchema,
    description: "Update lookup",
    tags: ["Lookups"],
    security: true,
  },
  {
    path: "/lookups/:id",
    method: "DELETE",
    description: "Delete lookup",
    tags: ["Lookups"],
    security: true,
  },
];

export const registerLookupRoutes = () => {
  for (const definition of lookupRouteDefinitions) {
    routeRegistry.register(definition as any);
  }
};

export const registerLookupDocs = registerLookupRoutes;
