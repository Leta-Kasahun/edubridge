import { routeRegistry, RouteDefinition } from "../../../docs/route.registry.js";

const studentProvisioningRouteDefinitions: RouteDefinition[] = [
  {
    path: "/api/provisioning/students/academic-structure",
    method: "GET",
    summary: "Get Academic Structure",
    description: "Retrieve academic years, current term, grade levels with enrolled student counts, and sections with student counts.",
    tags: ["Provisioning - Student"],
    security: true,
    parameters: [
      {
        name: "academicYearId",
        in: "query",
        schema: { type: "string", format: "uuid" },
        description: "Optional academic year ID to focus on",
      },
    ],
  },
  {
    path: "/api/provisioning/students",
    method: "POST",
    summary: "Provision Single Student",
    description: "Provision a Student account with auto-generated student code, username, temporary password, and section enrollment.",
    tags: ["Provisioning - Student"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          tenantId: {
            type: "string",
            format: "uuid",
            description: "School/Tenant UUID (optional if inferred from session)",
          },
          academicYearId: {
            type: "string",
            format: "uuid",
            description: "Academic year UUID",
            example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          },
          gradeId: {
            type: "string",
            format: "uuid",
            description: "Grade level UUID",
            example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          },
          sectionId: {
            type: "string",
            format: "uuid",
            description: "Optional Section UUID (if existing)",
          },
          sectionName: {
            type: "string",
            description: "Section name (e.g., 'Section A')",
            example: "Section A",
          },
          firstName: {
            type: "string",
            description: "First name",
            example: "Betelhem",
          },
          middleName: {
            type: "string",
            description: "Father / Middle name",
            example: "Alemu",
          },
          lastName: {
            type: "string",
            description: "Grandfather / Last name",
            example: "Haile",
          },
          gender: {
            type: "string",
            enum: ["MALE", "FEMALE"],
            example: "FEMALE",
          },
          studentCode: {
            type: "string",
            description: "Optional custom student code",
            example: "STU001",
          },
          dateOfBirth: {
            type: "string",
            format: "date",
            example: "2010-05-15",
          },
          email: {
            type: "string",
            format: "email",
            description: "Optional email address",
            example: "betelhem.alemu@school.edu.et",
          },
          nationality: {
            type: "string",
            example: "Ethiopian",
          },
        },
        required: ["academicYearId", "gradeId", "firstName", "middleName", "gender"],
      },
    },
  },
  {
    path: "/api/provisioning/students/bulk-csv",
    method: "POST",
    summary: "Bulk Onboard Students via CSV",
    description: "Bulk onboard students for a selected academic year and grade level from raw CSV text content with per-row section assignment.",
    tags: ["Provisioning - Student"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          tenantId: {
            type: "string",
            format: "uuid",
            description: "School/Tenant UUID (optional if inferred from session)",
          },
          academicYearId: {
            type: "string",
            format: "uuid",
            description: "Target academic year UUID",
          },
          gradeId: {
            type: "string",
            format: "uuid",
            description: "Target grade level UUID",
          },
          csvContent: {
            type: "string",
            description: "Raw CSV string with headers (firstName, middleName, lastName, gender, section, studentCode, email)",
            example: "firstName,middleName,lastName,gender,section\nBetelhem,Alemu,Haile,FEMALE,Section A\nNathan,Girma,Bekele,MALE,Section A\nSelam,Kebede,Tadesse,FEMALE,Section B",
          },
          fileName: {
            type: "string",
            description: "Optional name of the uploaded file",
            example: "grade7_students.csv",
          },
        },
        required: ["academicYearId", "gradeId", "csvContent"],
      },
    },
  },
  {
    path: "/api/provisioning/students",
    method: "GET",
    summary: "List Students",
    description: "Get a paginated list of students for the authenticated school tenant with multi-criteria search and academic filters.",
    tags: ["Provisioning - Student"],
    security: true,
    parameters: [
      { name: "page", in: "query", schema: { type: "integer", default: 1 } },
      { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
      { name: "search", in: "query", schema: { type: "string" }, description: "Search by name, student code, or username" },
      { name: "academicYearId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "gradeId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "sectionId", in: "query", schema: { type: "string", format: "uuid" } },
      { name: "status", in: "query", schema: { type: "string", enum: ["ACTIVE", "INACTIVE", "GRADUATED", "TRANSFERRED", "WITHDRAWN", "SUSPENDED"] } },
      { name: "accountStatus", in: "query", schema: { type: "string", enum: ["PENDING_FIRST_LOGIN", "ACTIVE", "SUSPENDED", "LOCKED", "DEACTIVATED"] } },
      { name: "gender", in: "query", schema: { type: "string", enum: ["MALE", "FEMALE"] } },
    ],
  },
  {
    path: "/api/provisioning/students/{id}",
    method: "GET",
    summary: "Get Student Details",
    description: "Get detailed student profile, user credentials status, and enrollment records by student profile ID.",
    tags: ["Provisioning - Student"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
  },
  {
    path: "/api/provisioning/students/{id}/deactivate",
    method: "PATCH",
    summary: "Deactivate Student",
    description: "Soft-deactivate a student profile and deactivate/suspend their login access.",
    tags: ["Provisioning - Student"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["INACTIVE", "SUSPENDED", "WITHDRAWN"],
            default: "INACTIVE",
          },
        },
      },
    },
  },
  {
    path: "/api/provisioning/students/{id}/activate",
    method: "PATCH",
    summary: "Activate Student",
    description: "Reactivate an inactive or suspended student profile and restore active user access.",
    tags: ["Provisioning - Student"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
  },
];

export const registerStudentProvisioningDocs = (): void => {
  for (const definition of studentProvisioningRouteDefinitions) {
    routeRegistry.register(definition);
  }
};
