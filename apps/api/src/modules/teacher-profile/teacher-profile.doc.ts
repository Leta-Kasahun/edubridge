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
  {
    path: "/api/teacher-qualification/me",
    method: "GET",
    summary: "Get My Qualifications",
    description: "Retrieve all academic degrees, certificates, and diplomas for the authenticated teacher.",
    tags: ["Teacher Profile - Qualifications"],
    security: true,
    responses: {
      200: { description: "Qualifications retrieved successfully" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/teacher-qualification",
    method: "POST",
    summary: "Add Teacher Qualification",
    description: "Register a new academic degree, institution, and completion year for a teacher.",
    tags: ["Teacher Profile - Qualifications"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          teacherId: { type: "string", format: "uuid" },
          qualificationType: { type: "string" },
          fieldOfStudy: { type: "string" },
          institutionName: { type: "string" },
          country: { type: "string" },
          yearCompleted: { type: "integer" },
          documentUrl: { type: "string" },
          verificationStatus: { type: "string", enum: ["PENDING", "VERIFIED", "REJECTED"] },
        },
        required: ["qualificationType", "fieldOfStudy", "institutionName", "yearCompleted"],
      },
    },
    responses: {
      201: { description: "Qualification created successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/teacher-qualification/{id}",
    method: "PATCH",
    summary: "Update Teacher Qualification",
    description: "Update details or verification status of a recorded academic qualification.",
    tags: ["Teacher Profile - Qualifications"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          qualificationType: { type: "string" },
          fieldOfStudy: { type: "string" },
          institutionName: { type: "string" },
          country: { type: "string" },
          yearCompleted: { type: "integer" },
          documentUrl: { type: "string" },
          verificationStatus: { type: "string", enum: ["PENDING", "VERIFIED", "REJECTED"] },
        },
      },
    },
    responses: {
      200: { description: "Qualification updated successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
      404: { description: "Qualification not found" },
    },
  },
  {
    path: "/api/teacher-qualification/{id}",
    method: "DELETE",
    summary: "Delete Teacher Qualification",
    description: "Remove an academic qualification record.",
    tags: ["Teacher Profile - Qualifications"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Qualification deleted successfully" },
      401: { description: "Unauthorized" },
      404: { description: "Qualification not found" },
    },
  },
  {
    path: "/api/teacher-experience/me",
    method: "GET",
    summary: "Get My Work Experience",
    description: "Retrieve previous teaching employment history for the authenticated teacher.",
    tags: ["Teacher Profile - Experience"],
    security: true,
    responses: {
      200: { description: "Work experiences retrieved successfully" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/teacher-experience",
    method: "POST",
    summary: "Add Work Experience",
    description: "Record prior teaching history, role, and institution duration.",
    tags: ["Teacher Profile - Experience"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          teacherId: { type: "string", format: "uuid" },
          organizationName: { type: "string" },
          position: { type: "string" },
          startDate: { type: "string", format: "date" },
          endDate: { type: "string", format: "date" },
          isCurrentRole: { type: "boolean" },
          description: { type: "string" },
        },
        required: ["organizationName", "position", "startDate"],
      },
    },
    responses: {
      201: { description: "Experience record created successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/teacher-experience/{id}",
    method: "PATCH",
    summary: "Update Work Experience",
    description: "Update details of a prior teaching experience record.",
    tags: ["Teacher Profile - Experience"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          organizationName: { type: "string" },
          position: { type: "string" },
          startDate: { type: "string", format: "date" },
          endDate: { type: "string", format: "date" },
          isCurrentRole: { type: "boolean" },
          description: { type: "string" },
        },
      },
    },
    responses: {
      200: { description: "Experience updated successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
      404: { description: "Experience record not found" },
    },
  },
  {
    path: "/api/teacher-experience/{id}",
    method: "DELETE",
    summary: "Delete Work Experience",
    description: "Remove a teaching experience record.",
    tags: ["Teacher Profile - Experience"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Experience record deleted successfully" },
      401: { description: "Unauthorized" },
      404: { description: "Experience record not found" },
    },
  },
  {
    path: "/api/staff-qualifications",
    method: "GET",
    summary: "Get Staff Qualifications Directory",
    description: "Administrative directory of all institutional teaching staff with degree credentials and verification statuses.",
    tags: ["Teacher Profile - Directory"],
    security: true,
    parameters: [
      { name: "page", in: "query", schema: { type: "integer" } },
      { name: "limit", in: "query", schema: { type: "integer" } },
      { name: "search", in: "query", schema: { type: "string" } },
      { name: "status", in: "query", schema: { type: "string" } },
    ],
    responses: {
      200: { description: "Staff directory retrieved successfully" },
      401: { description: "Unauthorized" },
    },
  },
];

export const registerTeacherProfileDocs = (): void => {
  for (const definition of teacherProfileRouteDefinitions) {
    routeRegistry.register(definition);
  }
};
