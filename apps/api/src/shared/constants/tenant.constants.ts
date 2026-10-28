export const TENANT_SCOPED_MODELS = new Set<string>([
  "TenantMembership",
  "Role",
  "Lookup",
  "SecurityPolicy",
  "Session",
  "LoginAttempt",
  "SecurityEvent",
  "Invitation",
  "AuditLog",
  "TeacherProfile",
  "StudentProfile",
  "AcademicYear",
  "Grade",
  "Section",
  "StudentEnrollment",
  "TeacherAssignment",
  "TeacherQualification",
  "TeacherExperience",
  "ImportBatch",
  "ExamContext",
  "LearningContent",
  "QuestionBank",
  "Assessment",
  "LearningEvidence",
  "StudentTopicPerformance",
  "StudentTopicMastery",
  "MasteryHistory",
  // RAG / AI
  "ContentChunk",
  "AiGenerationJob",
]);

export const FILTER_WHERE_OPERATIONS = new Set<string>([
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
  "updateMany",
  "updateManyAndReturn",
  "deleteMany",
]);

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const IGNORED_SUBDOMAINS = new Set<string>(["api", "www", "localhost"]);
