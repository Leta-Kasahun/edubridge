import { QuestionRepository } from "../repository/question.repository.js";
import { QuestionBankRepository } from "../repository/question-bank.repository.js";
import {
  CreateQuestionInput,
  UpdateQuestionInput,
} from "../types/question-bank.types.js";
import {
  NotFoundError,
  BadRequestError,
} from "../../../shared/exceptions/index.js";
import {
  QuestionTypeEnum,
  QuestionStatusEnum,
  DifficultyLevelEnum,
} from "../../../shared/constants/question-bank.constants.js";
import { validateQuestionConfig } from "../../../shared/utils/question-config.util.js";

interface RawCurriculumTopic {
  id: string;
  title: string;
  code: string;
  unit?: {
    id: string;
    title: string;
    code: string;
    curriculumSubject?: {
      grade?: { id: string; name: string; level: number } | null;
      subject?: { id: string; name: string; code: string } | null;
    } | null;
  } | null;
}

interface RawQuestionVersion {
  id: string;
  version: number;
  type: QuestionTypeEnum;
  difficulty: DifficultyLevelEnum;
  questionText: string;
  explanation?: string | null;
  points: number | unknown;
  configuration?: unknown;
  publishedAt?: Date | null;
  options?: Array<{
    id?: string;
    optionKey: string;
    optionText: string;
    orderIndex: number;
    isCorrect: boolean;
  }>;
}

interface RawQuestion {
  id: string;
  questionBankId: string;
  source: string;
  status: QuestionStatusEnum;
  currentVersion: number;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  versions?: RawQuestionVersion[];
  topics?: Array<{ topicId: string; topic?: RawCurriculumTopic }>;
  objectives?: Array<{ objectiveId: string; objective?: { id: string; description: string; code: string } }>;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

function formatQuestion(q: RawQuestion) {
  const latestVersion = q.versions?.[0];
  const points = latestVersion?.points !== undefined ? Number(latestVersion.points) : 1;
  const prompt = latestVersion?.questionText || "";
  const type = latestVersion?.type || "MCQ";
  const difficulty = latestVersion?.difficulty || "MEDIUM";

  const rawConfig =
    latestVersion?.configuration && typeof latestVersion.configuration === "object"
      ? (latestVersion.configuration as Record<string, unknown>)
      : null;

  const imageUrl =
    rawConfig && typeof rawConfig.imageUrl === "string" && rawConfig.imageUrl.trim() !== ""
      ? rawConfig.imageUrl
      : null;

  const reports =
    rawConfig && Array.isArray(rawConfig.reports)
      ? rawConfig.reports
      : [];

  const options = (latestVersion?.options || []).map((opt) => ({
    id: opt.id,
    optionKey: opt.optionKey,
    optionText: opt.optionText,
    text: opt.optionText,
    orderIndex: opt.orderIndex,
    isCorrect: opt.isCorrect,
  }));

  const primaryTopic = q.topics?.[0]?.topic;
  const primaryObjective = q.objectives?.[0]?.objective;
  const unit = primaryTopic?.unit;
  const grade = unit?.curriculumSubject?.grade || null;
  const subject = unit?.curriculumSubject?.subject || null;

  return {
    id: q.id,
    versionId: latestVersion?.id || q.id,
    latestVersionId: latestVersion?.id || q.id,
    code: `Q-${q.id.slice(0, 6).toUpperCase()}`,
    questionBankId: q.questionBankId,
    source: q.source,
    status: q.status,
    currentVersion: q.currentVersion,
    currentVersionNumber: q.currentVersion,
    type,
    difficulty,
    defaultPoints: points,
    points,
    prompt,
    questionText: prompt,
    explanation: latestVersion?.explanation || null,
    imageUrl,
    configuration: rawConfig,
    reports,
    options,
    topicId: primaryTopic?.id || null,
    topic: primaryTopic ? { id: primaryTopic.id, title: primaryTopic.title, code: primaryTopic.code } : null,
    unitId: unit?.id || null,
    unit: unit ? { id: unit.id, title: unit.title, code: unit.code } : null,
    subjectId: subject?.id || null,
    subject,
    gradeId: grade?.id || null,
    grade,
    objectiveId: primaryObjective?.id || null,
    objective: primaryObjective ? { id: primaryObjective.id, description: primaryObjective.description, code: primaryObjective.code } : null,
    versions: q.versions || [],
    topics: q.topics || [],
    objectives: q.objectives || [],
    createdBy: q.createdBy || null,
    createdAt: q.createdAt.toISOString(),
    updatedAt: q.updatedAt.toISOString(),
  };
}

export class QuestionService {
  constructor(
    private readonly repository: QuestionRepository = new QuestionRepository(),
    private readonly bankRepository: QuestionBankRepository = new QuestionBankRepository()
  ) {}

  async create(
    tenantId: string | null,
    questionBankId: string,
    createdById: string,
    input: CreateQuestionInput
  ) {
    const bank = await this.bankRepository.findById(tenantId, questionBankId);
    if (!bank) {
      throw new NotFoundError("Question bank not found");
    }

    const validation = validateQuestionConfig(
      input.type,
      input.options,
      input.configuration
    );
    if (!validation.isValid) {
      throw new BadRequestError(validation.error || "Invalid question configuration");
    }

    const created = await this.repository.create(questionBankId, createdById, input);
    return formatQuestion(created as unknown as RawQuestion);
  }

  async createBatch(
    tenantId: string | null,
    questionBankId: string,
    createdById: string,
    inputs: CreateQuestionInput[]
  ) {
    const bank = await this.bankRepository.findById(tenantId, questionBankId);
    if (!bank) {
      throw new NotFoundError("Question bank not found");
    }

    for (const input of inputs) {
      const validation = validateQuestionConfig(
        input.type,
        input.options,
        input.configuration
      );
      if (!validation.isValid) {
        throw new BadRequestError(validation.error || `Invalid question configuration for question: "${input.questionText.slice(0, 30)}..."`);
      }
    }

    const createdList = await this.repository.createMany(questionBankId, createdById, inputs);
    return createdList.map((q) => formatQuestion(q as unknown as RawQuestion));
  }

  async findById(tenantId: string | null, questionId: string) {
    const question = await this.repository.findById(questionId, tenantId || undefined);
    if (!question) {
      throw new NotFoundError("Question not found");
    }
    return formatQuestion(question as unknown as RawQuestion);
  }

  async findManyByBank(
    tenantId: string | null,
    questionBankId: string,
    filters: {
      status?: QuestionStatusEnum;
      type?: QuestionTypeEnum;
      difficulty?: DifficultyLevelEnum;
      topicId?: string;
      objectiveId?: string;
      search?: string;
      page: number;
      limit: number;
    }
  ) {
    const bank = await this.bankRepository.findById(tenantId, questionBankId);
    if (!bank) {
      throw new NotFoundError("Question bank not found");
    }

    const result = await this.repository.findManyByBank(questionBankId, filters);
    return {
      items: result.items.map((q) => formatQuestion(q as unknown as RawQuestion)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async update(
    tenantId: string | null,
    questionId: string,
    userId: string,
    input: UpdateQuestionInput
  ) {
    const question = await this.findById(tenantId, questionId);
    const latestVersion = question.versions[0];

    if (!latestVersion) {
      throw new NotFoundError("Question version not found");
    }

    const targetType = input.type || (latestVersion.type as QuestionTypeEnum);
    const targetOptions = input.options || latestVersion.options;
    const targetConfig =
      input.configuration !== undefined
        ? input.configuration
        : (latestVersion.configuration as Record<string, unknown>);

    const validation = validateQuestionConfig(
      targetType,
      targetOptions,
      targetConfig
    );
    if (!validation.isValid) {
      throw new BadRequestError(validation.error || "Invalid question configuration");
    }

    if (question.status === "PUBLISHED") {
      const nextVersionNumber = question.currentVersion + 1;
      const updated = await this.repository.createNewVersion(
        questionId,
        nextVersionNumber,
        userId,
        input,
        {
          type: (latestVersion.type || "MCQ") as QuestionTypeEnum,
          difficulty: (latestVersion.difficulty || "MEDIUM") as DifficultyLevelEnum,
          questionText: latestVersion.questionText,
          explanation: latestVersion.explanation ?? null,
          points: latestVersion.points,
          configuration: latestVersion.configuration,
          options: (latestVersion.options || []).map((o) => ({
            optionKey: o.optionKey,
            optionText: o.optionText,
            orderIndex: o.orderIndex,
            isCorrect: o.isCorrect,
          })),
        }
      );
      return formatQuestion(updated as unknown as RawQuestion);
    }

    const updated = await this.repository.updateDraft(questionId, latestVersion.id, input);
    return formatQuestion(updated as unknown as RawQuestion);
  }

  async publish(tenantId: string | null, questionId: string) {
    const question = await this.findById(tenantId, questionId);
    const latestVersion = question.versions[0];

    if (!latestVersion) {
      throw new NotFoundError("Question version not found");
    }

    const published = await this.repository.publish(questionId, latestVersion.id);
    return formatQuestion(published as unknown as RawQuestion);
  }

  async resolveReport(
    tenantId: string | null,
    questionId: string,
    reportId: string,
    userId: string
  ) {
    const question = await this.findById(tenantId, questionId);
    const latestVersion = question.versions[0];
    if (!latestVersion) {
      throw new NotFoundError("Question version not found");
    }

    const currentConfig =
      typeof latestVersion.configuration === "object" && latestVersion.configuration !== null
        ? { ...(latestVersion.configuration as Record<string, unknown>) }
        : {};

    const rawReports = Array.isArray(currentConfig.reports) ? currentConfig.reports : [];

    const updatedReports = rawReports.map((rep) => {
      if (typeof rep === "object" && rep !== null && (rep as Record<string, unknown>).id === reportId) {
        return {
          ...(rep as Record<string, unknown>),
          status: "RESOLVED",
          resolvedAt: new Date().toISOString(),
          resolvedById: userId,
        };
      }
      return rep;
    });

    currentConfig.reports = updatedReports;

    return this.update(tenantId, questionId, userId, {
      configuration: currentConfig,
    });
  }

  async delete(tenantId: string | null, questionId: string) {
    await this.findById(tenantId, questionId);
    return this.repository.delete(questionId);
  }
}
