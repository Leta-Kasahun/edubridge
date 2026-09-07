import { registerPermissionDocs } from "../modules/permissions/permissions.doc.js";
import { registerLookupDocs } from "../modules/lookup/lookup.doc.js";
import { registerAuthDocs } from "../modules/auth/auth.doc.js";
import { registerTenantProvisioningDocs } from "../modules/provisioning/tenant/tenant.provision.doc.js";
import { registerTeacherProvisioningDocs } from "../modules/provisioning/teacher/teacher.provision.doc.js";
import { registerStudentProvisioningDocs } from "../modules/provisioning/student/student.provision.doc.js";
import { registerTeacherProfileDocs } from "../modules/teacher-profile/teacher-profile.doc.js";
import { registerStudentProfileDocs } from "../modules/students/student-profile.doc.js";
import { registerAcademicYearDocs } from "../modules/academic/academic-years/academic-year.doc.js";
import { registerGradeDocs } from "../modules/academic/grades/grade.doc.js";
import { registerSectionDocs } from "../modules/academic/sections/section.doc.js";
import { registerSubjectDocs } from "../modules/academic/subjects/subject.doc.js";
import { registerStudentAssignmentDocs } from "../modules/academic/assignments/student/student-assignment.doc.js";
import { registerTeacherAssignmentDocs } from "../modules/academic/assignments/teacher/teacher-assignment.doc.js";
import { registerSecurityPolicyDocs } from "../modules/security-policy/security-policy.doc.js";
import { registerCurriculumDocs } from "../modules/curriculum/curricula/curriculum.doc.js";
import { registerNotificationDocs } from "../modules/notifications/notification.doc.js";
import { registerQuestionBankDocs } from "../modules/question-bank/question-bank.doc.js";

export function registerAllModules(): void {
  registerAuthDocs();
  registerPermissionDocs();
  registerLookupDocs();
  registerSecurityPolicyDocs();
  registerTenantProvisioningDocs();
  registerTeacherProvisioningDocs();
  registerStudentProvisioningDocs();
  registerTeacherProfileDocs();
  registerStudentProfileDocs();
  registerAcademicYearDocs();
  registerGradeDocs();
  registerSectionDocs();
  registerSubjectDocs();
  registerStudentAssignmentDocs();
  registerTeacherAssignmentDocs();
  registerCurriculumDocs();
  registerNotificationDocs();
  registerQuestionBankDocs();
}
