import { prisma } from "../../../../lib/prisma.js";
import {
  ImportBatchStatus,
  ImportRowStatus,
  ImportSource,
} from "../../../../generated/prisma/client.js";
import { parseCsvText } from "../../../../shared/utils/import-parser.js";
import { studentRowValidationSchema } from "../schemas/student-provisioning.schema.js";
import {
  studentImportRepository,
  StudentImportRepository,
} from "../repository/student-import.repository.js";
import {
  studentProvisioningService,
  StudentProvisioningService,
} from "./student-provisioning.service.js";
import {
  BulkStudentCsvPayload,
  StudentImportRowData,
  StudentBulkProvisionResult,
  StudentProvisionResult,
  StudentBulkRowError,
  CreateStudentImportRowInput,
} from "../types/student-provisioning.types.js";

export class StudentBulkProvisioningService {
  constructor(
    private readonly importRepo: StudentImportRepository = studentImportRepository,
    private readonly provisioningSvc: StudentProvisioningService = studentProvisioningService
  ) {}

  async provisionStudentsBulk(
    payload: {
      readonly tenantId?: string;
      readonly academicYearId: string;
      readonly gradeId: string;
      readonly sectionId?: string;
      readonly students: readonly StudentImportRowData[];
    },
    tenantId: string,
    createdById: string,
    source: ImportSource = ImportSource.MANUAL,
    fileName?: string
  ): Promise<StudentBulkProvisionResult> {
    const resolvedTenantId = payload.tenantId || tenantId;
    const batch = await this.importRepo.createImportBatch({
      tenantId: resolvedTenantId,
      createdById,
      totalRows: payload.students.length,
      source,
      fileName,
    });

    const successfulStudents: StudentProvisionResult[] = [];
    const failedRows: StudentBulkRowError[] = [];
    const importRows: CreateStudentImportRowInput[] = [];

    const existingSections = await prisma.section.findMany({
      where: {
        tenantId: resolvedTenantId,
        academicYearId: payload.academicYearId,
        gradeId: payload.gradeId,
        status: "ACTIVE",
      },
      include: {
        _count: {
          select: {
            enrollments: {
              where: { status: "ACTIVE", academicYearId: payload.academicYearId },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const sectionCapacities = new Map<
      string,
      { id: string; name: string; capacity: number; currentCount: number }
    >();

    if (existingSections.length > 0) {
      for (const s of existingSections) {
        sectionCapacities.set(s.id, {
          id: s.id,
          name: s.name,
          capacity: s.capacity || 40,
          currentCount: s._count.enrollments,
        });
      }
    } else {
      const defaultSection = await this.provisioningSvc.createSection(
        resolvedTenantId,
        payload.academicYearId,
        payload.gradeId,
        "Section A",
        40
      );
      sectionCapacities.set(defaultSection.id, {
        id: defaultSection.id,
        name: defaultSection.name,
        capacity: 40,
        currentCount: 0,
      });
    }

    const selectOptimalSectionId = (): string => {
      const sectionsList = Array.from(sectionCapacities.values());

      const underCapacity = sectionsList
        .filter((s) => s.currentCount < s.capacity)
        .sort((a, b) => a.currentCount - b.currentCount);

      if (underCapacity.length > 0 && underCapacity[0]) {
        return underCapacity[0].id;
      }

      const sortedByCount = sectionsList.sort(
        (a, b) => a.currentCount - b.currentCount
      );
      return sortedByCount[0]?.id || sectionsList[0]?.id || "";
    };

    for (let index = 0; index < payload.students.length; index += 1) {
      const rowNumber = index + 1;
      const studentData = payload.students[index];

      try {
        if (!studentData) {
          continue;
        }

        const validation = studentRowValidationSchema.safeParse(studentData);
        if (!validation.success) {
          const errors = validation.error.issues.map(
            (issue) => `${issue.path.join(".")}: ${issue.message}`
          );
          failedRows.push({
            rowNumber,
            raw: studentData as unknown as Record<string, string>,
            errors,
          });
          importRows.push({
            rowNumber,
            status: ImportRowStatus.FAILED,
            data: studentData as unknown as Record<string, unknown>,
            errors,
          });
          continue;
        }

        let targetSectionId: string | undefined = payload.sectionId;
        let targetSectionName: string | undefined = studentData.section?.trim();

        if (!targetSectionName && !targetSectionId) {
          targetSectionId = selectOptimalSectionId();
        }

        const result = await this.provisioningSvc.provisionStudent(
          {
            tenantId: resolvedTenantId,
            academicYearId: payload.academicYearId,
            gradeId: payload.gradeId,
            sectionId: targetSectionId,
            sectionName: targetSectionId ? undefined : targetSectionName,
            firstName: studentData.firstName,
            middleName: studentData.middleName,
            lastName: studentData.lastName || undefined,
            gender: validation.data.gender,
            studentCode: studentData.studentCode || undefined,
            email: studentData.email || undefined,
            dateOfBirth: studentData.dateOfBirth || undefined,
          },
          resolvedTenantId,
          createdById
        );

        if (result.enrollment?.sectionId) {
          const sec = sectionCapacities.get(result.enrollment.sectionId);
          if (sec) {
            sec.currentCount += 1;
          }
        }

        successfulStudents.push(result);
        importRows.push({
          rowNumber,
          status: ImportRowStatus.SUCCESS,
          data: studentData as unknown as Record<string, unknown>,
          resultId: result.student.studentProfileId,
        });
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to provision student";
        failedRows.push({
          rowNumber,
          raw: studentData as unknown as Record<string, string>,
          errors: [errorMsg],
        });
        importRows.push({
          rowNumber,
          status: ImportRowStatus.FAILED,
          data: studentData as unknown as Record<string, unknown>,
          errors: [errorMsg],
        });
      }
    }

    await this.importRepo.createImportRows(batch.id, importRows);

    const finalStatus =
      failedRows.length === 0
        ? ImportBatchStatus.COMPLETED
        : successfulStudents.length > 0
        ? ImportBatchStatus.COMPLETED_WITH_ERRORS
        : ImportBatchStatus.FAILED;

    await this.importRepo.updateImportBatchStatus(
      batch.id,
      finalStatus,
      successfulStudents.length,
      failedRows.length
    );

    return {
      batchId: batch.id,
      status: finalStatus,
      academicYearId: payload.academicYearId,
      gradeId: payload.gradeId,
      totalRows: payload.students.length,
      successCount: successfulStudents.length,
      failureCount: failedRows.length,
      successfulStudents,
      failedRows,
      message: `Bulk student onboarding completed: ${successfulStudents.length} succeeded, ${failedRows.length} failed.`,
    };
  }

  async provisionStudentsCsv(
    payload: BulkStudentCsvPayload,
    tenantId: string,
    createdById: string,
    fileName?: string
  ): Promise<StudentBulkProvisionResult> {
    const parsed = parseCsvText(payload.csvContent, studentRowValidationSchema);

    return this.provisionStudentsBulk(
      {
        tenantId: payload.tenantId,
        academicYearId: payload.academicYearId,
        gradeId: payload.gradeId,
        sectionId: payload.sectionId,
        students: parsed.validRows,
      },
      tenantId,
      createdById,
      ImportSource.CSV,
      fileName || payload.fileName
    );
  }
}

export const studentBulkProvisioningService = new StudentBulkProvisioningService();
