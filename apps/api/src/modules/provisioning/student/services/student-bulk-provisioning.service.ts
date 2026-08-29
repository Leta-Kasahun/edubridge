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

        const result = await this.provisioningSvc.provisionStudent(
          {
            tenantId: resolvedTenantId,
            academicYearId: payload.academicYearId,
            gradeId: payload.gradeId,
            sectionName: studentData.section,
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
