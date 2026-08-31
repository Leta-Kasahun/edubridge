import { routeRegistry, RouteDefinition } from "../../docs/route.registry.js";

const studentProfileRouteDefinitions: RouteDefinition[] = [
  {
    path: "/api/student-profile/me",
    method: "GET",
    summary: "Get Current Student Profile",
    description: "Retrieve authenticated student's profile, contact details, emergency contacts, medical records, and address hierarchy.",
    tags: ["Student Profile"],
    security: true,
    responses: {
      200: { description: "Student profile retrieved successfully" },
      401: { description: "Unauthorized" },
      404: { description: "Student profile not found" },
    },
  },
  {
    path: "/api/student-profile/complete",
    method: "POST",
    summary: "Complete Student Profile Onboarding",
    description: "Complete student profile setup after initial provisioning, creating address hierarchy, emergency contacts, and medical history.",
    tags: ["Student Profile"],
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
          emergencyContacts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                relationship: { type: "string" },
                primaryPhone: { type: "string" },
                secondaryPhone: { type: "string" },
                email: { type: "string", format: "email" },
                isPrimary: { type: "boolean" },
              },
              required: ["name", "relationship", "primaryPhone"],
            },
          },
          medicalNotes: {
            type: "object",
            properties: {
              bloodGroup: { type: "string" },
              allergies: { type: "array", items: { type: "string" } },
              chronicConditions: { type: "array", items: { type: "string" } },
              medications: { type: "array", items: { type: "string" } },
              specialNeeds: { type: "string" },
              emergencyInstructions: { type: "string" },
            },
          },
        },
        required: ["firstName", "middleName", "lastName", "gender", "dateOfBirth"],
      },
    },
    responses: {
      200: { description: "Student profile completed successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/student-profile/me",
    method: "PATCH",
    summary: "Update Current Student Profile",
    description: "Partially update personal details, emergency contacts, medical records, and address hierarchy.",
    tags: ["Student Profile"],
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
          emergencyContacts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                relationship: { type: "string" },
                primaryPhone: { type: "string" },
                secondaryPhone: { type: "string" },
                email: { type: "string", format: "email" },
                isPrimary: { type: "boolean" },
              },
            },
          },
          medicalNotes: {
            type: "object",
            properties: {
              bloodGroup: { type: "string" },
              allergies: { type: "array", items: { type: "string" } },
              chronicConditions: { type: "array", items: { type: "string" } },
              medications: { type: "array", items: { type: "string" } },
              specialNeeds: { type: "string" },
              emergencyInstructions: { type: "string" },
            },
          },
        },
      },
    },
    responses: {
      200: { description: "Student profile updated successfully" },
      400: { description: "Validation error" },
      401: { description: "Unauthorized" },
    },
  },
  {
    path: "/api/student-profile/{id}",
    method: "GET",
    summary: "Get Student Profile by ID",
    description: "Retrieve comprehensive student profile, guardian details, and section history by student ID.",
    tags: ["Student Profile"],
    security: true,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
    ],
    responses: {
      200: { description: "Student profile retrieved successfully" },
      401: { description: "Unauthorized" },
      404: { description: "Student profile not found" },
    },
  },
];

export const registerStudentProfileDocs = (): void => {
  for (const definition of studentProfileRouteDefinitions) {
    routeRegistry.register(definition);
  }
};
