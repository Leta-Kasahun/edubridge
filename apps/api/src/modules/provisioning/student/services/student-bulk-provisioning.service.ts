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
      readonly sectionName?: string;
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
        payload.sectionName?.trim() || "Section A",
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
      if (sectionsList.length === 0) {
        return "";
      }

      const availableSections = sectionsList.filter(
        (s) => s.capacity > s.currentCount
      );

      if (availableSections.length > 0) {
        const totalRemainingWeight = availableSections.reduce(
          (acc, s) => acc + (s.capacity - s.currentCount),
          0
        );

        let randomVal = Math.random() * totalRemainingWeight;
        for (const sec of availableSections) {
          const weight = sec.capacity - sec.currentCount;
          if (randomVal < weight) {
            return sec.id;
          }
          randomVal -= weight;
        }
        return availableSections[0]?.id || "";
      }

      const minCount = Math.min(...sectionsList.map((s) => s.currentCount));
      const leastFilledSections = sectionsList.filter(
        (s) => s.currentCount === minCount
      );
      const randomIndex = Math.floor(Math.random() * leastFilledSections.length);
      return leastFilledSections[randomIndex]?.id || sectionsList[0]?.id || "";
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
        const targetSectionName: string | undefined =
          studentData.section?.trim() || payload.sectionName?.trim() || undefined;

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
          const existing = sectionCapacities.get(result.enrollment.sectionId);
          if (existing) {
            existing.currentCount += 1;
          } else {
            sectionCapacities.set(result.enrollment.sectionId, {
              id: result.enrollment.sectionId,
              name: result.enrollment.sectionName,
              capacity: 40,
              currentCount: 1,
            });
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
        sectionName: payload.sectionName,
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
