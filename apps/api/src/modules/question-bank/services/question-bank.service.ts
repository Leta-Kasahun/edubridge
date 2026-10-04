import { QuestionBankRepository } from "../repository/question-bank.repository.js";
import {
  CreateQuestionBankInput,
  UpdateQuestionBankInput,
} from "../types/question-bank.types.js";
import {
  NotFoundError,
  BadRequestError,
} from "../../../shared/exceptions/index.js";
import { QuestionBankStatusEnum } from "../../../shared/constants/question-bank.constants.js";
import { domainEventBus } from "../../../shared/events/domain-events.js";

interface RawExamContext {
  id: string;
  name: string;
  code: string;
  scope: string;
  gradeId?: string | null;
  subjectId?: string | null;
  grade?: {
    id: string;
    name: string;
    level: number;
  } | null;
  subject?: {
    id: string;
    name: string;
    code: string;
  } | null;
}

interface RawQuestionBank {
  id: string;
  name: string;
  description: string | null;
  status: QuestionBankStatusEnum;
  tenantId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  examContexts?: RawExamContext[];
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  _count?: {
    questions: number;
  };
}

function formatQuestionBank(bank: RawQuestionBank) {
  const primaryContext = bank.examContexts?.[0];
  const subject = primaryContext?.subject || null;
  const grade = primaryContext?.grade || null;

  return {
    id: bank.id,
    code: `QB-${bank.id.slice(0, 6).toUpperCase()}`,
    name: bank.name,
    description: bank.description,
    status: bank.status,
    tenantId: bank.tenantId,
    createdById: bank.createdById,
    questionCount: bank._count?.questions ?? 0,
    subjectId: primaryContext?.subjectId || null,
    gradeId: primaryContext?.gradeId || null,
    subject,
    grade,
    examContexts: bank.examContexts || [],
    createdBy: bank.createdBy || null,
    createdAt: bank.createdAt.toISOString(),
    updatedAt: bank.updatedAt.toISOString(),
  };
}

export class QuestionBankService {
  constructor(
    private readonly repository: QuestionBankRepository = new QuestionBankRepository()
  ) {}

  async create(
    tenantId: string,
    createdById: string,
    input: CreateQuestionBankInput
  ) {
    const created = await this.repository.create(tenantId, createdById, input);
    const formatted = formatQuestionBank(created as unknown as RawQuestionBank);
    if (formatted.status === "ACTIVE") {
      domainEventBus.emitEvent("question_bank.published", {
        tenantId,
        bankId: formatted.id,
        name: formatted.name,
        gradeLevel: formatted.grade?.level ?? null,
        subjectName: formatted.subject?.name ?? null,
        actorUserId: createdById,
      });
    }
    return formatted;
  }

  async findById(tenantId: string, id: string) {
    const bank = await this.repository.findById(tenantId, id);
    if (!bank) {
      throw new NotFoundError("Question bank not found");
    }
    return formatQuestionBank(bank as unknown as RawQuestionBank);
  }

  async findMany(
    tenantId: string,
    filters: {
      status?: QuestionBankStatusEnum;
      search?: string;
      examContextId?: string;
      subjectId?: string;
      gradeId?: string;
      createdById?: string;
      page: number;
      limit: number;
    }
  ) {
    const result = await this.repository.findMany(tenantId, filters);
    return {
      items: result.items.map((b) => formatQuestionBank(b as unknown as RawQuestionBank)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async update(
    tenantId: string,
    id: string,
    input: UpdateQuestionBankInput
  ) {
    const before = await this.findById(tenantId, id);
    const updated = await this.repository.update(tenantId, id, input);
    const formatted = formatQuestionBank(updated as unknown as RawQuestionBank);
    if (formatted.status === "ACTIVE" && before.status !== "ACTIVE") {
      domainEventBus.emitEvent("question_bank.published", {
        tenantId,
        bankId: formatted.id,
        name: formatted.name,
        gradeLevel: formatted.grade?.level ?? null,
        subjectName: formatted.subject?.name ?? null,
        actorUserId: undefined,
      });
    }
    return formatted;
  }

  async delete(tenantId: string, id: string) {
    const bank = await this.findById(tenantId, id);
    if (bank.questionCount > 0) {
      throw new BadRequestError(
        "Cannot delete a question bank that contains questions. Archive it instead."
      );
    }
    return this.repository.delete(tenantId, id);
  }

  async savePracticeSession(
    tenantId: string,
    studentId: string,
    bankId: string,
    input: {
      currentIndex: number;
      totalQuestions: number;
      answeredCount: number;
      secondsElapsed: number;
      isFinished: boolean;
      selectedAnswers?: Record<string, string>;
      flaggedQuestionIds?: string[];
      eliminatedOptions?: Record<string, string[]>;
      revealedExplanations?: Record<string, boolean>;
    }
  ) {
    return this.repository.upsertStudentPracticeSession(
      tenantId,
      studentId,
      bankId,
      input
    );
  }

  async getPracticeSession(
    tenantId: string,
    studentId: string,
    bankId: string
  ) {
    return this.repository.getStudentPracticeSession(
      tenantId,
      studentId,
      bankId
    );
  }

  async deletePracticeSession(
    tenantId: string,
    studentId: string,
    bankId: string
  ) {
    return this.repository.deleteStudentPracticeSession(
      tenantId,
      studentId,
      bankId
    );
  }

  async listStudentInProgressPractices(
    tenantId: string,
    studentId: string
  ) {
    return this.repository.listStudentInProgressPractices(
      tenantId,
      studentId
    );
  }
}

