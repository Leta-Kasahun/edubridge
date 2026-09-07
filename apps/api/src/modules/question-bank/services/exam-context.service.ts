import { ExamContextRepository } from "../repository/exam-context.repository.js";
import {
  CreateExamContextInput,
  UpdateExamContextInput,
} from "../types/question-bank.types.js";
import {
  NotFoundError,
  BadRequestError,
} from "../../../shared/exceptions/index.js";
import {
  ExamScopeEnum,
  ExamContextStatusEnum,
} from "../../../shared/constants/question-bank.constants.js";
import { generateExamContextCode } from "../../../shared/utils/question-config.util.js";

interface RawExamContext {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  scope: ExamScopeEnum;
  status: ExamContextStatusEnum;
  examYear?: number | null;
  tenantId: string;
  gradeId?: string | null;
  subjectId?: string | null;
  grade?: unknown;
  subject?: unknown;
  curriculumVersion?: unknown;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    questionBanks?: number;
    assessments?: number;
  };
}

function formatExamContext(ctx: RawExamContext) {
  return {
    id: ctx.id,
    code: ctx.code || `EC-${ctx.id.slice(0, 8).toUpperCase()}`,
    name: ctx.name,
    description: ctx.description || null,
    scope: ctx.scope,
    status: ctx.status,
    year: ctx.examYear || null,
    examYear: ctx.examYear || null,
    tenantId: ctx.tenantId,
    gradeId: ctx.gradeId || null,
    subjectId: ctx.subjectId || null,
    grade: ctx.grade || null,
    subject: ctx.subject || null,
    curriculumVersion: ctx.curriculumVersion || null,
    questionBankCount: ctx._count?.questionBanks ?? 0,
    assessmentCount: ctx._count?.assessments ?? 0,
    createdAt: ctx.createdAt.toISOString(),
    updatedAt: ctx.updatedAt.toISOString(),
    _count: ctx._count,
  };
}

export class ExamContextService {
  constructor(
    private readonly repository: ExamContextRepository = new ExamContextRepository()
  ) {}

  async create(tenantId: string, input: CreateExamContextInput) {
    const code = generateExamContextCode(input.scope, input.examYear);
    const created = await this.repository.create(tenantId, code, input);
    return formatExamContext(created as unknown as RawExamContext);
  }

  async findById(tenantId: string | null, id: string) {
    const context = await this.repository.findById(tenantId, id);
    if (!context) {
      throw new NotFoundError("Exam context not found");
    }
    return formatExamContext(context as unknown as RawExamContext);
  }

  async findMany(
    tenantId: string | null,
    filters: {
      scope?: ExamScopeEnum;
      status?: ExamContextStatusEnum;
      gradeId?: string;
      subjectId?: string;
      examYear?: number;
      search?: string;
      page: number;
      limit: number;
    }
  ) {
    const result = await this.repository.findMany(tenantId, filters);
    return {
      items: result.items.map((c) => formatExamContext(c as unknown as RawExamContext)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async update(
    tenantId: string,
    id: string,
    input: UpdateExamContextInput
  ) {
    await this.findById(tenantId, id);
    const updated = await this.repository.update(tenantId, id, input);
    return formatExamContext(updated as unknown as RawExamContext);
  }

  async delete(tenantId: string, id: string) {
    const context = await this.findById(tenantId, id);
    if (
      (context._count?.questionBanks && context._count.questionBanks > 0) ||
      (context._count?.assessments && context._count.assessments > 0)
    ) {
      throw new BadRequestError(
        "Cannot delete an exam context associated with question banks or assessments. Archive it instead."
      );
    }
    return this.repository.delete(tenantId, id);
  }
}
