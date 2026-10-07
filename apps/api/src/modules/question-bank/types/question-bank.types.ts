import {
  QuestionTypeEnum,
  QuestionStatusEnum,
  QuestionSourceTypeEnum,
  DifficultyLevelEnum,
  QuestionBankStatusEnum,
  ExamScopeEnum,
  ExamContextStatusEnum,
} from "../../../shared/constants/question-bank.constants.js";

export interface QuestionOptionDto {
  optionKey: string;
  optionText: string;
  orderIndex: number;
  isCorrect: boolean;
}

export interface QuestionTopicInput {
  topicId: string;
  isPrimary?: boolean;
}

export interface QuestionObjectiveInput {
  objectiveId: string;
}

export interface CreateQuestionBankInput {
  name: string;
  description?: string | null;
  examContextId?: string | null;
  subjectId?: string | null;
  gradeId?: string | null;
}

export interface UpdateQuestionBankInput {
  name?: string;
  description?: string | null;
  status?: QuestionBankStatusEnum;
  examContextId?: string | null;
  subjectId?: string | null;
  gradeId?: string | null;
}

export interface QuestionBankQueryDto {
  status?: QuestionBankStatusEnum;
  search?: string;
  examContextId?: string;
  subjectId?: string;
  gradeId?: string;
  createdById?: string;
  page?: number;
  limit?: number;
}

export interface QuestionReportItem {
  id: string;
  studentId?: string;
  studentName?: string;
  reason: string;
  comment?: string;
  status: "PENDING" | "RESOLVED";
  createdAt: string;
  resolvedAt?: string;
  resolvedById?: string;
  resolutionNote?: string;
}

export interface CreateQuestionInput {
  type: QuestionTypeEnum;
  difficulty?: DifficultyLevelEnum;
  questionText: string;
  explanation?: string | null;
  imageUrl?: string | null;
  points?: number;
  source?: QuestionSourceTypeEnum;
  options?: QuestionOptionDto[];
  configuration?: Record<string, unknown> | null;
  topicIds: QuestionTopicInput[];
  objectiveIds?: QuestionObjectiveInput[];
}

export interface UpdateQuestionInput {
  type?: QuestionTypeEnum;
  difficulty?: DifficultyLevelEnum;
  questionText?: string;
  explanation?: string | null;
  imageUrl?: string | null;
  points?: number;
  options?: QuestionOptionDto[];
  configuration?: Record<string, unknown> | null;
  topicIds?: QuestionTopicInput[];
  objectiveIds?: QuestionObjectiveInput[];
  status?: QuestionStatusEnum;
}

export interface QuestionQueryDto {
  status?: QuestionStatusEnum;
  type?: QuestionTypeEnum;
  difficulty?: DifficultyLevelEnum;
  unitId?: string;
  topicId?: string;
  objectiveId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateExamContextInput {
  name: string;
  scope: ExamScopeEnum;
  gradeId?: string;
  subjectId?: string;
  examYear?: number;
  regionName?: string;
  authorityName?: string;
  curriculumVersionId?: string;
}

export interface UpdateExamContextInput {
  name?: string;
  scope?: ExamScopeEnum;
  gradeId?: string | null;
  subjectId?: string | null;
  examYear?: number | null;
  regionName?: string | null;
  authorityName?: string | null;
  curriculumVersionId?: string | null;
  status?: ExamContextStatusEnum;
}

export interface ExamContextQueryDto {
  scope?: ExamScopeEnum;
  status?: ExamContextStatusEnum;
  gradeId?: string;
  subjectId?: string;
  examYear?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface QuestionUploadCandidate {
  questionText: string;
  type: QuestionTypeEnum;
  difficulty?: DifficultyLevelEnum;
  points?: number;
  explanation?: string;
  options?: QuestionOptionDto[];
  topicId?: string;
}
