import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { corsConfig } from "./config/cors.js";
import { securityConfig } from "./config/security.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { setupSwagger } from "./docs/swagger.setup.js";
import { healthRouter } from "./modules/health/route.js";
import { authRouter } from "./modules/auth/route.js";
import { permissionRouter } from "./modules/permissions/route.js";
import { lookupRouter } from "./modules/lookup/route.js";
import { securityPolicyRouter } from "./modules/security-policy/route.js";
import { tenantProvisioningRouter } from "./modules/provisioning/tenant/route.js";
import { teacherProvisioningRouter } from "./modules/provisioning/teacher/route.js";
import { studentProvisioningRouter } from "./modules/provisioning/student/route.js";
import { teacherProfileRouter } from "./modules/teacher-profile/route.js";
import { teacherQualificationRouter } from "./modules/teacher-profile/qualification.route.js";
import { teacherExperienceRouter } from "./modules/teacher-profile/experience.route.js";
import { teacherDirectoryRouter } from "./modules/teacher-profile/teacher-directory.route.js";
import { academicYearRouter, gradeRouter, sectionRouter, subjectRoutes, studentAssignmentRouter, teacherAssignmentRouter, studentClassRouter } from "./modules/academic/index.js";
import { studentProfileRouter } from "./modules/students/route.js";
import { curriculumRouter, structureRouter, curriculumImportRouter } from "./modules/curriculum/index.js";
import { learningContentRouter } from "./modules/learning-content/index.js";
import { notificationRouter } from "./modules/notifications/index.js";
import {
  questionBankRouter,
  examContextRouter,
} from "./modules/question-bank/index.js";
import {
  assessmentRouter,
  attemptRouter,
} from "./modules/assessment/index.js";
import { evaluationRouter } from "./modules/evaluation/index.js";
import { masteryRouter } from "./modules/mastery/index.js";
import { bookmarksRouter } from "./modules/bookmarks/index.js";

const app: Express = express();

app.use(helmet(securityConfig.helmet));
app.use(cors(corsConfig));
app.use(compression());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
}

setupSwagger(app);

app.use("/health", healthRouter);
app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api", permissionRouter);
app.use("/api/lookups", lookupRouter);
app.use("/api/security-policy", securityPolicyRouter);
app.use("/api/provisioning/tenant", tenantProvisioningRouter);
app.use("/api/provisioning/teachers", teacherProvisioningRouter);
app.use("/api/provisioning/teacher", teacherProvisioningRouter);
app.use("/api/provisioning/students", studentProvisioningRouter);
app.use("/api/provisioning/student", studentProvisioningRouter);
app.use("/api/teacher-profile", teacherProfileRouter);
app.use("/api/teacher-profiles", teacherProfileRouter);
app.use("/api/teacher-qualification", teacherQualificationRouter);
app.use("/api/teacher-qualifications", teacherQualificationRouter);
app.use("/api/teacher-experience", teacherExperienceRouter);
app.use("/api/teacher-experiences", teacherExperienceRouter);
app.use("/api/staff-qualifications", teacherDirectoryRouter);
app.use("/api/teacher-qualifications-directory", teacherDirectoryRouter);
app.use("/api/academic/years", academicYearRouter);
app.use("/api/academic-years", academicYearRouter);
app.use("/api/academic/grades", gradeRouter);
app.use("/api/academic-grades", gradeRouter);
app.use("/api/academic/sections", sectionRouter);
app.use("/api/academic-sections", sectionRouter);
app.use("/api/academic/subjects", subjectRoutes);
app.use("/api/academic-subjects", subjectRoutes);
app.use("/api/academic/assignments/students", studentAssignmentRouter);
app.use("/api/academic-assignments-students", studentAssignmentRouter);
app.use("/api/academic/assignments/teachers", teacherAssignmentRouter);
app.use("/api/academic-assignments-teachers", teacherAssignmentRouter);
app.use("/api/academic/student-class", studentClassRouter);
app.use("/api/academic-student-class", studentClassRouter);
app.use("/api/student-profile", studentProfileRouter);
app.use("/api/student-profiles", studentProfileRouter);
app.use("/api/curriculum/curricula", curriculumRouter);
app.use("/api/curricula", curriculumRouter);
app.use("/api/curriculum/structure", structureRouter);
app.use("/api/curriculum-structure", structureRouter);
app.use("/api/curriculum/import", curriculumImportRouter);
app.use("/api/learning-content", learningContentRouter);
app.use("/api/question-banks", questionBankRouter);
app.use("/api/exam-contexts", examContextRouter);
app.use("/api/assessments", attemptRouter);
app.use("/api/assessments", evaluationRouter);
app.use("/api/evaluations", evaluationRouter);
app.use("/api/assessments", assessmentRouter);
app.use("/api/mastery", masteryRouter);
app.use("/api/bookmarks", bookmarksRouter);

app.use(errorHandler);

export { app };
