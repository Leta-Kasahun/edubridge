import { routeRegistry, RouteDefinition } from "../../docs/route.registry.js";

const authRouteDefinitions: RouteDefinition[] = [
  {
    path: "/auth/login",
    method: "POST",
    summary: "Login",
    description: "User login with email/username and password",
    tags: ["Authentication"],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          email: {
            type: "string",
            format: "email",
            description: "User email address",
          },
          password: {
            type: "string",
            format: "password",
            description: "User password",
          },
        },
        required: ["email", "password"],
      },
    },
  },
  {
    path: "/auth/verify-otp",
    method: "POST",
    summary: "Verify OTP",
    description: "Verify 6-digit OTP code with email",
    tags: ["Authentication"],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          email: {
            type: "string",
            format: "email",
            description: "User email address",
          },
          otp: {
            type: "string",
            description: "6-digit verification code",
          },
        },
        required: ["email", "otp"],
      },
    },
  },
  {
    path: "/auth/resend-otp",
    method: "POST",
    summary: "Resend OTP",
    description: "Resend verification code to email",
    tags: ["Authentication"],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          email: {
            type: "string",
            format: "email",
            description: "User email address",
          },
        },
        required: ["email"],
      },
    },
  },
  {
    path: "/auth/first-login-setup",
    method: "POST",
    summary: "First Login Setup",
    description: "Set new password on initial student login",
    tags: ["Authentication"],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          email: {
            type: "string",
            format: "email",
          },
          currentPassword: {
            type: "string",
          },
          newPassword: {
            type: "string",
          },
        },
        required: ["email", "currentPassword", "newPassword"],
      },
    },
  },
  {
    path: "/auth/google",
    method: "POST",
    summary: "Google OAuth",
    description: "Authenticate using Google OAuth ID token",
    tags: ["Authentication"],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          idToken: {
            type: "string",
          },
        },
        required: ["idToken"],
      },
    },
  },
  {
    path: "/auth/refresh-token",
    method: "POST",
    summary: "Refresh Token",
    description: "Refresh access token using refresh token",
    tags: ["Authentication"],
    requestBody: {
      schema: {
        type: "object",
        properties: {
          refreshToken: {
            type: "string",
          },
        },
      },
    },
  },
  {
    path: "/auth/logout",
    method: "POST",
    summary: "Logout",
    description: "Logout and revoke current session",
    tags: ["Authentication"],
    security: true,
  },
  {
    path: "/auth/logout-all",
    method: "POST",
    summary: "Logout All",
    description: "Logout and revoke all user sessions",
    tags: ["Authentication"],
    security: true,
  },
  {
    path: "/auth/change-password",
    method: "POST",
    summary: "Change Password",
    description: "Change password for authenticated user",
    tags: ["Authentication"],
    security: true,
    requestBody: {
      schema: {
        type: "object",
        properties: {
          currentPassword: {
            type: "string",
          },
          newPassword: {
            type: "string",
          },
        },
        required: ["currentPassword", "newPassword"],
      },
    },
  },
];

export const registerAuthRoutes = () => {
  for (const definition of authRouteDefinitions) {
    routeRegistry.register(definition);
  }
};

export const registerAuthDocs = registerAuthRoutes;
