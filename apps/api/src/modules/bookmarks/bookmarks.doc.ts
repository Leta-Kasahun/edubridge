import { routeRegistry, RouteDefinition } from "../../docs/route.registry.js";

const bookmarkRouteDefinitions: readonly RouteDefinition[] = [
  {
    path: "/api/bookmarks",
    method: "GET",
    summary: "List Student Bookmarks",
    description: "Retrieve paginated list of bookmarked questions, topics, or learning content for the authenticated student with enriched metadata.",
    tags: ["Student - Bookmarks"],
    security: true,
    parameters: [
      {
        name: "targetType",
        in: "query",
        required: false,
        schema: { type: "string", enum: ["QUESTION", "TOPIC", "LEARNING_CONTENT"] },
        description: "Filter bookmarks by target entity type",
      },
      {
        name: "subjectId",
        in: "query",
        required: false,
        schema: { type: "string", format: "uuid" },
        description: "Filter by subject UUID",
      },
      {
        name: "search",
        in: "query",
        required: false,
        schema: { type: "string" },
        description: "Search keyword",
      },
      {
        name: "page",
        in: "query",
        required: false,
        schema: { type: "integer", default: 1 },
      },
      {
        name: "limit",
        in: "query",
        required: false,
        schema: { type: "integer", default: 20 },
      },
    ],
    responses: {
      200: { description: "Bookmarks retrieved successfully" },
      401: { description: "Unauthorized" },
      403: { description: "Forbidden - Student access only" },
    },
  },
  {
    path: "/api/bookmarks/toggle",
    method: "POST",
    summary: "Toggle Bookmark",
    description: "Add or remove a bookmark for a specific question, topic, or learning content item.",
    tags: ["Student - Bookmarks"],
    security: true,
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["targetType", "targetId"],
            properties: {
              targetType: {
                type: "string",
                enum: ["QUESTION", "TOPIC", "LEARNING_CONTENT"],
                default: "QUESTION",
              },
              targetId: { type: "string", format: "uuid" },
              note: { type: "string", maxLength: 500 },
            },
          },
        },
      },
    },
    responses: {
      200: { description: "Bookmark toggled successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
      403: { description: "Forbidden" },
    },
  },
  {
    path: "/api/bookmarks/check",
    method: "POST",
    summary: "Check Bookmark Status",
    description: "Batch query to check which IDs in a given list are currently bookmarked by the student.",
    tags: ["Student - Bookmarks"],
    security: true,
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["targetType", "targetIds"],
            properties: {
              targetType: {
                type: "string",
                enum: ["QUESTION", "TOPIC", "LEARNING_CONTENT"],
              },
              targetIds: {
                type: "array",
                items: { type: "string", format: "uuid" },
              },
            },
          },
        },
      },
    },
    responses: {
      200: { description: "Bookmark status checked successfully" },
      401: { description: "Unauthorized" },
      403: { description: "Forbidden" },
    },
  },
  {
    path: "/api/bookmarks/{id}",
    method: "DELETE",
    summary: "Delete Bookmark",
    description: "Remove a bookmark by its UUID.",
    tags: ["Student - Bookmarks"],
    security: true,
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
        description: "Bookmark UUID",
      },
    ],
    responses: {
      200: { description: "Bookmark deleted successfully" },
      401: { description: "Unauthorized" },
      403: { description: "Forbidden" },
      404: { description: "Bookmark not found" },
    },
  },
];

export function registerBookmarksDocs(): void {
  routeRegistry.registerTag(
    "Student - Bookmarks",
    "Student personal bookmarks for questions and exam revision."
  );

  for (const definition of bookmarkRouteDefinitions) {
    routeRegistry.register(definition);
  }
}
