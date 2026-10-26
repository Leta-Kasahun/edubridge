import { prisma } from "../../../lib/prisma.js";
import { Prisma } from "../../../generated/prisma/client.js";
import type { AiJobDto, AiJobType, AiJobStatus } from "../types/ai.types.js";

export class AiJobRepository {
  async createJob(
    tenantId: string,
    data: {
      readonly jobType: AiJobType;
      readonly requestedById: string;
      readonly inputParams: unknown;
      readonly model: string;
    }
  ): Promise<AiJobDto> {
    const job = await prisma.aiGenerationJob.create({
      data: {
        tenantId,
        jobType: data.jobType,
        status: "PENDING",
        requestedById: data.requestedById,
        inputParams: data.inputParams as Prisma.InputJsonValue,
        model: data.model,
      },
    });

    return {
      id: job.id,
      tenantId: job.tenantId,
      jobType: job.jobType as AiJobType,
      status: job.status as AiJobStatus,
      requestedById: job.requestedById,
      inputParams: job.inputParams,
      outputSummary: job.outputSummary,
      model: job.model,
      promptTokens: job.promptTokens,
      outputTokens: job.outputTokens,
      errorMessage: job.errorMessage,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    };
  }

  async updateJobStatus(
    tenantId: string,
    id: string,
    data: {
      readonly status: AiJobStatus;
      readonly outputSummary?: unknown;
      readonly errorMessage?: string;
      readonly promptTokens?: number;
      readonly outputTokens?: number;
      readonly completedAt?: Date;
    }
  ): Promise<AiJobDto> {
    const job = await prisma.aiGenerationJob.update({
      where: { id, tenantId },
      data: {
        status: data.status,
        outputSummary: data.outputSummary !== undefined ? (data.outputSummary as Prisma.InputJsonValue) : undefined,
        errorMessage: data.errorMessage,
        promptTokens: data.promptTokens,
        outputTokens: data.outputTokens,
        completedAt: data.completedAt,
      },
    });

    return {
      id: job.id,
      tenantId: job.tenantId,
      jobType: job.jobType as AiJobType,
      status: job.status as AiJobStatus,
      requestedById: job.requestedById,
      inputParams: job.inputParams,
      outputSummary: job.outputSummary,
      model: job.model,
      promptTokens: job.promptTokens,
      outputTokens: job.outputTokens,
      errorMessage: job.errorMessage,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    };
  }

  async findById(tenantId: string, id: string): Promise<AiJobDto | null> {
    const job = await prisma.aiGenerationJob.findFirst({
      where: { id, tenantId },
    });

    if (!job) return null;

    return {
      id: job.id,
      tenantId: job.tenantId,
      jobType: job.jobType as AiJobType,
      status: job.status as AiJobStatus,
      requestedById: job.requestedById,
      inputParams: job.inputParams,
      outputSummary: job.outputSummary,
      model: job.model,
      promptTokens: job.promptTokens,
      outputTokens: job.outputTokens,
      errorMessage: job.errorMessage,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    };
  }

  async listJobs(
    tenantId: string,
    requestedById?: string,
    page = 1,
    limit = 20
  ): Promise<{ items: readonly AiJobDto[]; total: number }> {
    const skip = (page - 1) * limit;
    const where: Prisma.AiGenerationJobWhereInput = {
      tenantId,
      ...(requestedById ? { requestedById } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.aiGenerationJob.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.aiGenerationJob.count({ where }),
    ]);

    return {
      items: items.map((job) => ({
        id: job.id,
        tenantId: job.tenantId,
        jobType: job.jobType as AiJobType,
        status: job.status as AiJobStatus,
        requestedById: job.requestedById,
        inputParams: job.inputParams,
        outputSummary: job.outputSummary,
        model: job.model,
        promptTokens: job.promptTokens,
        outputTokens: job.outputTokens,
        errorMessage: job.errorMessage,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
      })),
      total,
    };
  }
}

export const aiJobRepository = new AiJobRepository();
