import { Router } from "express";
import multer from "multer";
import { QuestionBankController } from "./controllers/question-bank.controller.js";
import { QuestionController } from "./controllers/question.controller.js";
import { QuestionUploadController } from "./controllers/question-upload.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { requireRoles } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import {
  CreateQuestionBankSchema,
  UpdateQuestionBankSchema,
  QuestionBankQuerySchema,
  SavePracticeSessionSchema,
  SubmitQuestionReportSchema,
  ResolveQuestionReportSchema,
} from "./schemas/question-bank.schema.js";
import {
  CreateQuestionSchema,
  BatchCreateQuestionsSchema,
  UpdateQuestionSchema,
  QuestionQuerySchema,
} from "./schemas/question.schema.js";
import { ConfirmUploadSchema } from "./schemas/question-upload.schema.js";
import { QUESTION_UPLOAD_LIMITS } from "../../shared/constants/question-bank.constants.js";

const router: Router = Router();
const bankController = new QuestionBankController();
const questionController = new QuestionController();
const uploadController = new QuestionUploadController();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: QUESTION_UPLOAD_LIMITS.MAX_PDF_SIZE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = QUESTION_UPLOAD_LIMITS.ALLOWED_MIME_TYPES as readonly string[];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file format. Please upload PDF, JPEG, PNG, or WebP."));
    }
  },
});

router.use(authenticate);

router.get(
  "/",
  requireRoles("SCHOOL_ADMIN", "TEACHER", "STUDENT"),
  validate({ query: QuestionBankQuerySchema }),
  bankController.list
);

router.get(
  "/student/in-progress",
  requireRoles("STUDENT", "TEACHER", "SCHOOL_ADMIN", "SYSTEM_ADMIN"),
  bankController.listStudentInProgress
);

router.post(
  "/",
  requireRoles("SCHOOL_ADMIN", "TEACHER"),
  validate(CreateQuestionBankSchema),
  bankController.create
);

router.get(
  "/upload/:uploadId/preview",
  requireRoles("SCHOOL_ADMIN", "TEACHER"),
  uploadController.getPreview
);

router.get(
  "/questions/:id",
  requireRoles("SCHOOL_ADMIN", "TEACHER", "STUDENT"),
  questionController.getById
);

router.put(
  "/questions/:id",
  requireRoles("SCHOOL_ADMIN", "TEACHER"),
  validate(UpdateQuestionSchema),
  questionController.update
);

router.patch(
  "/questions/:id",
  requireRoles("SCHOOL_ADMIN", "TEACHER"),
  validate(UpdateQuestionSchema),
  questionController.update
);

router.post(
  "/questions/:id/publish",
  requireRoles("SCHOOL_ADMIN", "TEACHER"),
  questionController.publish
);

router.post(
  "/questions/:id/report",
  requireRoles("STUDENT", "TEACHER", "SCHOOL_ADMIN", "SYSTEM_ADMIN"),
  validate(SubmitQuestionReportSchema),
  questionController.submitReport
);

router.post(
  "/questions/:id/reports/:reportId/resolve",
  requireRoles("SCHOOL_ADMIN", "TEACHER", "SYSTEM_ADMIN"),
  validate(ResolveQuestionReportSchema),
  questionController.resolveReport
);

router.delete(
  "/questions/:id",
  requireRoles("SCHOOL_ADMIN", "TEACHER"),
  questionController.delete
);

router.get(
  "/:bankId/questions",
  requireRoles("SCHOOL_ADMIN", "TEACHER", "STUDENT"),
  validate({ query: QuestionQuerySchema }),
  questionController.listByBank
);

router.post(
  "/:bankId/questions/batch",
  requireRoles("SCHOOL_ADMIN", "TEACHER"),
  validate(BatchCreateQuestionsSchema),
  questionController.createBatch
);

router.post(
  "/:bankId/questions",
  requireRoles("SCHOOL_ADMIN", "TEACHER"),
  validate(CreateQuestionSchema),
  questionController.create
);

router.post(
  "/:bankId/upload",
  requireRoles("SCHOOL_ADMIN", "TEACHER"),
  upload.single("file"),
  uploadController.upload
);

router.post(
  "/:bankId/upload/:uploadId/confirm",
  requireRoles("SCHOOL_ADMIN", "TEACHER"),
  validate(ConfirmUploadSchema),
  uploadController.confirm
);

router.get(
  "/:id/practice-session",
  requireRoles("STUDENT", "TEACHER", "SCHOOL_ADMIN", "SYSTEM_ADMIN"),
  bankController.getPracticeSession
);

router.put(
  "/:id/practice-session",
  requireRoles("STUDENT", "TEACHER", "SCHOOL_ADMIN", "SYSTEM_ADMIN"),
  validate(SavePracticeSessionSchema),
  bankController.savePracticeSession
);

router.delete(
  "/:id/practice-session",
  requireRoles("STUDENT", "TEACHER", "SCHOOL_ADMIN", "SYSTEM_ADMIN"),
  bankController.deletePracticeSession
);

router.get(
  "/:id",
  requireRoles("SCHOOL_ADMIN", "TEACHER", "STUDENT"),
  bankController.getById
);

router.put(
  "/:id",
  requireRoles("SCHOOL_ADMIN", "TEACHER"),
  validate(UpdateQuestionBankSchema),
  bankController.update
);

router.patch(
  "/:id",
  requireRoles("SCHOOL_ADMIN", "TEACHER"),
  validate(UpdateQuestionBankSchema),
  bankController.update
);

router.delete(
  "/:id",
  requireRoles("SCHOOL_ADMIN", "TEACHER"),
  bankController.delete
);

export const questionBankRouter = router;

