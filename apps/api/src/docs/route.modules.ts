import { registerPermissionDocs } from "../modules/permissions/permissions.doc.js";
import { registerLookupDocs } from "../modules/lookup/lookup.doc.js";
import { registerAuthDocs } from "../modules/auth/auth.doc.js";
import { registerTenantProvisioningDocs } from "../modules/provisioning/tenant/tenant.provision.doc.js";
import { registerTeacherProvisioningDocs } from "../modules/provisioning/teacher/teacher.provision.doc.js";
import { registerStudentProvisioningDocs } from "../modules/provisioning/student/student.provision.doc.js";
import { registerTeacherProfileDocs } from "../modules/teacher-profile/teacher-profile.doc.js";

export function registerAllModules(): void {
  registerAuthDocs();
  registerPermissionDocs();
  registerLookupDocs();
  registerTenantProvisioningDocs();
  registerTeacherProvisioningDocs();
  registerStudentProvisioningDocs();
  registerTeacherProfileDocs();
}
