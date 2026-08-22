import { prisma, runWithoutTenant } from "../../../../lib/prisma.js";
import {
  ImportBatchStatus,
  ImportEntityType,
  Prisma,
} from "../../../../generated/prisma/client.js";
import {
  CreateImportBatchInput,
  CreateImportRowInput,
} from "../types/teacher-provisioning.types.js";

export class TeacherImportRepository {
  async createImportBatch(input: CreateImportBatchInput) {
    return runWithoutTenant(async () => {
      return prisma.importBatch.create({
        data: {
          tenantId: input.tenantId,
          entityType: ImportEntityType.TEACHER,
          source: input.source,
          fileName: input.fileName || null,
          status: ImportBatchStatus.PROCESSING,
          totalRows: input.totalRows,
          successfulRows: 0,
          failedRows: 0,
          createdById: input.createdById,
          startedAt: new Date(),
        },
      });
    });
  }

  async updateImportBatchStatus(
    batchId: string,
    status: ImportBatchStatus,
    successfulRows: number,
    failedRows: number
  ) {
    return runWithoutTenant(async () => {
      return prisma.importBatch.update({
        where: { id: batchId },
        data: {
          status,
          successfulRows,
          failedRows,
          completedAt: new Date(),
        },
      });
    });
  }

  async createImportRows(
    batchId: string,
    rows: readonly CreateImportRowInput[]
  ) {
    if (rows.length === 0) return;

    return runWithoutTenant(async () => {
      return prisma.importRow.createMany({
        data: rows.map((r) => ({
          batchId,
          rowNumber: r.rowNumber,
          status: r.status,
          data: r.data as Prisma.InputJsonValue,
          errors: r.errors ? (r.errors as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
          resultId: r.resultId || null,
        })),
      });
    });
  }

  async findImportBatchById(batchId: string) {
    return prisma.importBatch.findUnique({
      where: { id: batchId },
      include: {
        rows: {
          orderBy: { rowNumber: "asc" },
        },
      },
    });
  }
}

export const teacherImportRepository = new TeacherImportRepository();
