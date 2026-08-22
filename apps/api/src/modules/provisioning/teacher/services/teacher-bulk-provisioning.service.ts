import {
  ImportBatchStatus,
  ImportRowStatus,
  ImportSource,
} from "../../../../generated/prisma/client.js";
import { parseCsvText } from "../../../../shared/utils/import-parser.js";
import { teacherRowValidationSchema } from "../schemas/teacher-provisioning.schema.js";
import {
  teacherProvisioningRepository,
  TeacherProvisioningRepository,
} from "../repository/teacher-provisioning.repository.js";
import {
  teacherImportRepository,
  TeacherImportRepository,
} from "../repository/teacher-import.repository.js";
import {
  teacherProvisioningService,
  TeacherProvisioningService,
} from "./teacher-provisioning.service.js";
import {
  BulkTeacherProvisionPayload,
  BulkTeacherCsvPayload,
  TeacherBulkProvisionResult,
  TeacherProvisionResult,
  TeacherBulkRowError,
  CreateImportRowInput,
} from "../types/teacher-provisioning.types.js";

export class TeacherBulkProvisioningService {
  constructor(
    private readonly provisioningRepo: TeacherProvisioningRepository = teacherProvisioningRepository,
    private readonly importRepo: TeacherImportRepository = teacherImportRepository,
    private readonly provisioningSvc: TeacherProvisioningService = teacherProvisioningService
  ) {}

  async provisionTeachersBulk(
    payload: BulkTeacherProvisionPayload,
    tenantId: string,
    createdById: string,
    source: ImportSource = ImportSource.MANUAL,
    fileName?: string
  ): Promise<TeacherBulkProvisionResult> {
    const resolvedTenantId = payload.tenantId || tenantId;
    const batch = await this.importRepo.createImportBatch({
      tenantId: resolvedTenantId,
      createdById,
      totalRows: payload.teachers.length,
      source,
      fileName,
    });

    const successfulTeachers: TeacherProvisionResult[] = [];
    const failedRows: TeacherBulkRowError[] = [];
    const importRows: CreateImportRowInput[] = [];

    for (let index = 0; index < payload.teachers.length; index += 1) {
      const rowNumber = index + 1;
      const teacherData = payload.teachers[index];

      try {
        if (!teacherData) {
          continue;
        }

        const validation = teacherRowValidationSchema.safeParse(teacherData);
        if (!validation.success) {
          const errors = validation.error.issues.map(
            (issue) => `${issue.path.join(".")}: ${issue.message}`
          );
          failedRows.push({
            rowNumber,
            raw: teacherData as unknown as Record<string, string>,
            errors,
          });
          importRows.push({
            rowNumber,
            status: ImportRowStatus.FAILED,
            data: teacherData as unknown as Record<string, unknown>,
            errors,
          });
          continue;
        }

        const result = await this.provisioningSvc.provisionTeacher(
          {
            method: payload.method,
            tenantId: resolvedTenantId,
            firstName: teacherData.firstName,
            middleName: teacherData.middleName,
            lastName: teacherData.lastName,
            gender: teacherData.gender,
            email: teacherData.email || undefined,
            phoneNumber: teacherData.phoneNumber || undefined,
            employeeCode: teacherData.employeeCode || undefined,
          },
          resolvedTenantId,
          createdById
        );

        successfulTeachers.push(result);
        importRows.push({
          rowNumber,
          status: ImportRowStatus.SUCCESS,
          data: teacherData as unknown as Record<string, unknown>,
          resultId: result.teacher.teacherProfileId,
        });
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to provision teacher";
        failedRows.push({
          rowNumber,
          raw: teacherData as unknown as Record<string, string>,
          errors: [errorMsg],
        });
        importRows.push({
          rowNumber,
          status: ImportRowStatus.FAILED,
          data: teacherData as unknown as Record<string, unknown>,
          errors: [errorMsg],
        });
      }
    }

    await this.importRepo.createImportRows(batch.id, importRows);

    const finalStatus =
      failedRows.length === 0
        ? ImportBatchStatus.COMPLETED
        : successfulTeachers.length > 0
        ? ImportBatchStatus.COMPLETED_WITH_ERRORS
        : ImportBatchStatus.FAILED;

    await this.importRepo.updateImportBatchStatus(
      batch.id,
      finalStatus,
      successfulTeachers.length,
      failedRows.length
    );

    return {
      batchId: batch.id,
      status: finalStatus,
      totalRows: payload.teachers.length,
      successCount: successfulTeachers.length,
      failureCount: failedRows.length,
      successfulTeachers,
      failedRows,
      message: `Bulk onboarding completed: ${successfulTeachers.length} succeeded, ${failedRows.length} failed.`,
    };
  }

  async provisionTeachersCsv(
    payload: BulkTeacherCsvPayload,
    tenantId: string,
    createdById: string,
    fileName?: string
  ): Promise<TeacherBulkProvisionResult> {
    const parsed = parseCsvText(payload.csvContent, teacherRowValidationSchema);

    return this.provisionTeachersBulk(
      {
        tenantId: payload.tenantId,
        method: payload.method,
        teachers: parsed.validRows,
        sendNotifications: payload.sendNotifications,
      },
      tenantId,
      createdById,
      ImportSource.CSV,
      fileName
    );
  }
}

export const teacherBulkProvisioningService = new TeacherBulkProvisioningService();
