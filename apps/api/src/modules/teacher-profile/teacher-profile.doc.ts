import { routeRegistry, RouteDefinition } from "../../docs/route.registry.js";

const teacherProfileRouteDefinitions: RouteDefinition[] = [
  {
    path: "/api/teacher-profile/me",
    method: "GET",
    summary: "Get My Profile",
    description: "Get authenticated teacher's profile, contact details, and address hierarchy.",
    tags: ["Teacher Profile"],
    security: true,
    responses: {
      200: { description: "Teacher profile details retrieved successfully" },
      401: { description: "Unauthorized" },
      404: { description: "Teacher profile not found" },
    },
  },
  {
    path: "/api/teacher-profile/complete",
    method: "POST",
    summary: "Complete Profile Onboarding",
    description: "Complete teacher onboarding after first login, upsert address hierarchy, and activate account.",
    tags: ["Teacher Profile"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          firstName: { type: "string", example: "Almaz" },
          middleName: { type: "string", example: "Tadesse" },
          lastName: { type: "string", example: "Haile" },
          gender: { type: "string", enum: ["MALE", "FEMALE"], example: "FEMALE" },
          dateOfBirth: { type: "string", format: "date", example: "1990-05-15" },
          phoneNumber: { type: "string", example: "+251911223344" },
          email: { type: "string", format: "email", example: "almaz.tadesse@school.edu.et" },
          nationality: { type: "string", example: "Ethiopian" },
          photoUrl: { type: "string", example: "/uploads/profiles/profile.jpg" },
          address: {
            type: "object",
            properties: {
              regionId: { type: "string", format: "uuid" },
              zoneId: { type: "string", format: "uuid" },
              woredaId: { type: "string", format: "uuid" },
              kebeleId: { type: "string", format: "uuid" },
              cityId: { type: "string", format: "uuid" },
              subCityId: { type: "string", format: "uuid" },
              specificLocation: { type: "string", example: "Bole Subcity, House 123" },
            },
          },
        },
        required: ["firstName", "middleName", "lastName", "gender", "dateOfBirth"],
      },
    },
    responses: {
      200: { description: "Teacher profile completed successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/teacher-profile/me",
    method: "PATCH",
    summary: "Update My Profile",
    description: "Partially update personal details, contact, and address hierarchy.",
    tags: ["Teacher Profile"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          firstName: { type: "string" },
          middleName: { type: "string" },
          lastName: { type: "string" },
          gender: { type: "string", enum: ["MALE", "FEMALE"] },
          dateOfBirth: { type: "string", format: "date" },
          phoneNumber: { type: "string" },
          email: { type: "string", format: "email" },
          nationality: { type: "string" },
          photoUrl: { type: "string" },
          address: {
            type: "object",
            properties: {
              regionId: { type: "string", format: "uuid" },
              zoneId: { type: "string", format: "uuid" },
              woredaId: { type: "string", format: "uuid" },
              kebeleId: { type: "string", format: "uuid" },
              cityId: { type: "string", format: "uuid" },
              subCityId: { type: "string", format: "uuid" },
              specificLocation: { type: "string" },
            },
          },
        },
      },
    },
    responses: {
      200: { description: "Teacher profile updated successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/teacher-profile/{id}",
    method: "GET",
    summary: "Get Profile by ID",
    description: "Get teacher profile and address details by profile ID.",
    tags: ["Teacher Profile"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Teacher profile retrieved successfully" },
      401: { description: "Unauthorized" },
      404: { description: "Teacher profile not found" },
    },
  },
];

export const registerTeacherProfileDocs = (): void => {
  for (const definition of teacherProfileRouteDefinitions) {
    routeRegistry.register(definition);
  }
};
