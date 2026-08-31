export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    VERIFY_OTP: "/auth/verify-otp",
    RESEND_OTP: "/auth/resend-otp",
    FIRST_LOGIN_SETUP: "/auth/first-login-setup",
    GOOGLE: "/auth/google",
    REFRESH_TOKEN: "/auth/refresh-token",
    LOGOUT: "/auth/logout",
    LOGOUT_ALL: "/auth/logout-all",
    CHANGE_PASSWORD: "/auth/change-password",
  },
  ROLES: {
    BASE: "/roles",
    BY_ID: (id: string) => `/roles/${id}`,
    PERMISSIONS: (id: string) => `/roles/${id}/permissions`,
    PERMISSION_BY_ID: (roleId: string, permissionId: string) => `/roles/${roleId}/permissions/${permissionId}`,
  },
  PERMISSIONS: {
    BASE: "/permissions",
  },
  LOOKUPS: {
    BASE: "/lookups",
    BY_CATEGORY: (category: string) => `/lookups/${category}`,
    BY_CATEGORY_KEY: (category: string, key: string) => `/lookups/${category}/${key}`,
    BY_ID: (id: string) => `/lookups/${id}`,
  },
  SECURITY_POLICY: {
    BASE: "/security-policy",
  },
  PROVISIONING: {
    TENANT: {
      BASE: "/provisioning/tenant",
      INVITE: "/provisioning/tenant/invite",
      DIRECT: "/provisioning/tenant/direct",
      REGENERATE_CREDENTIALS: "/provisioning/tenant/regenerate-credentials",
      BY_ID: (id: string) => `/provisioning/tenant/${id}`,
      DEACTIVATE: (id: string) => `/provisioning/tenant/${id}/deactivate`,
      ACTIVATE: (id: string) => `/provisioning/tenant/${id}/activate`,
    },
    TEACHERS: {
      BASE: "/provisioning/teachers",
      INVITE: "/provisioning/teachers/invite",
      DIRECT: "/provisioning/teachers/direct",
      BULK: "/provisioning/teachers/bulk",
      BULK_CSV: "/provisioning/teachers/bulk-csv",
      BY_ID: (id: string) => `/provisioning/teachers/${id}`,
      DEACTIVATE: (id: string) => `/provisioning/teachers/${id}/deactivate`,
      ACTIVATE: (id: string) => `/provisioning/teachers/${id}/activate`,
    },
    STUDENTS: {
      BASE: "/provisioning/students",
      ACADEMIC_STRUCTURE: "/provisioning/students/academic-structure",
      GRADES: "/provisioning/students/grades",
      SECTIONS: "/provisioning/students/sections",
      BULK_CSV: "/provisioning/students/bulk-csv",
      BY_ID: (id: string) => `/provisioning/students/${id}`,
      DEACTIVATE: (id: string) => `/provisioning/students/${id}/deactivate`,
      ACTIVATE: (id: string) => `/provisioning/students/${id}/activate`,
    },
  },
  TEACHER_PROFILE: {
    BASE: "/teacher-profile",
    ME: "/teacher-profile/me",
    COMPLETE: "/teacher-profile/complete",
    BY_ID: (id: string) => `/teacher-profile/${id}`,
  },
  TEACHER_QUALIFICATIONS: {
    BASE: "/teacher-qualifications",
    ME: "/teacher-qualifications/me",
    BY_ID: (id: string) => `/teacher-qualifications/${id}`,
  },
  TEACHER_EXPERIENCES: {
    BASE: "/teacher-experiences",
    ME: "/teacher-experiences/me",
    BY_ID: (id: string) => `/teacher-experiences/${id}`,
  },
  STAFF_QUALIFICATIONS: {
    BASE: "/staff-qualifications",
  },
  ACADEMIC_YEARS: {
    BASE: "/academic/years",
    ACTIVE: "/academic/years/active",
    BY_ID: (id: string) => `/academic/years/${id}`,
    SET_ACTIVE: (id: string) => `/academic/years/${id}/set-active`,
    ARCHIVE: (id: string) => `/academic/years/${id}/archive`,
    RESTORE: (id: string) => `/academic/years/${id}/restore`,
  },
  ACADEMIC_GRADES: {
    BASE: "/academic/grades",
    BY_ID: (id: string) => `/academic/grades/${id}`,
    TOGGLE_STATUS: (id: string) => `/academic/grades/${id}/toggle-status`,
  },
  ACADEMIC_SECTIONS: {
    BASE: "/academic/sections",
    BULK: "/academic/sections/bulk",
    BY_ID: (id: string) => `/academic/sections/${id}`,
    UPDATE_STATUS: (id: string) => `/academic/sections/${id}/status`,
  },
  STUDENT_PROFILE: {
    BASE: "/student-profile",
    ME: "/student-profile/me",
    COMPLETE: "/student-profile/complete",
    BY_ID: (id: string) => `/student-profile/${id}`,
  },
  HEALTH: "/health",
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;
