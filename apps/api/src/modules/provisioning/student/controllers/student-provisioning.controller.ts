import { Request, Response } from "express";
import { asyncHandler } from "../../../../shared/utils/async-handler.js";
import { BadRequestError } from "../../../../shared/exceptions/bad-request-error.js";
import {
  studentProvisioningService,
  StudentProvisioningService,
} from "../services/student-provisioning.service.js";
import {
  studentBulkProvisioningService,
  StudentBulkProvisioningService,
} from "../services/student-bulk-provisioning.service.js";
import {
  StudentStatus,
  AccountStatus,
  Gender,
} from "../../../../generated/prisma/client.js";

function resolveTenantId(req: Request): string {
  const tenantId =
    req.body?.tenantId ||
    (req.query?.tenantId as string) ||
    req.user?.tenantId ||
    (req.headers["x-tenant-id"] as string);

  if (!tenantId) {
    throw new BadRequestError("Tenant ID is required for student provisioning");
  }
  return tenantId;
}

export class StudentProvisioningController {
  constructor(
    private readonly provisioningSvc: StudentProvisioningService = studentProvisioningService,
    private readonly bulkSvc: StudentBulkProvisioningService = studentBulkProvisioningService
  ) {}

  getAcademicStructure = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = resolveTenantId(req);
    const academicYearId = req.query.academicYearId ? String(req.query.academicYearId) : undefined;
    const result = await this.provisioningSvc.getAcademicStructure(tenantId, academicYearId);
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  createGrade = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = resolveTenantId(req);
    const level = Number(req.body.level);
    const result = await this.provisioningSvc.createGrade(tenantId, level);
    res.status(201).json({
      success: true,
      data: result,
      message: "Grade level created successfully",
    });
  });

  createSection = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = resolveTenantId(req);
    const { academicYearId, gradeId, name, capacity } = req.body;
    const result = await this.provisioningSvc.createSection(
      tenantId,
      academicYearId,
      gradeId,
      name,
      capacity ? Number(capacity) : undefined
    );
    res.status(201).json({
      success: true,
      data: result,
      message: "Section created successfully",
    });
  });

  provisionStudent = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = resolveTenantId(req);
    const createdById = req.user?.userId;
    const result = await this.provisioningSvc.provisionStudent(
      req.body,
      tenantId,
      createdById
    );
    res.status(201).json({
      success: true,
      data: result,
    });
  });

  bulkProvisionCsv = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = resolveTenantId(req);
    const createdById = req.user?.userId || "";
    const result = await this.bulkSvc.provisionStudentsCsv(
      req.body,
      tenantId,
      createdById
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  getStudents = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = resolveTenantId(req);
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;
    const academicYearId = req.query.academicYearId ? String(req.query.academicYearId) : undefined;
    const gradeId = req.query.gradeId ? String(req.query.gradeId) : undefined;
    const sectionId = req.query.sectionId ? String(req.query.sectionId) : undefined;
    const status = req.query.status as StudentStatus | undefined;
    const accountStatus = req.query.accountStatus as AccountStatus | undefined;
    const gender = req.query.gender as Gender | undefined;

    const result = await this.provisioningSvc.getStudents(tenantId, {
      page,
      limit,
      search,
      academicYearId,
      gradeId,
      sectionId,
      status,
      accountStatus,
      gender,
    });

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  });

  getStudentById = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = resolveTenantId(req);
    const profileId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!profileId) {
      throw new BadRequestError("Student profile ID is required");
    }
    const result = await this.provisioningSvc.getStudentById(tenantId, profileId);
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  deactivateStudent = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = resolveTenantId(req);
    const profileId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!profileId) {
      throw new BadRequestError("Student profile ID is required");
    }
    const status = req.body.status as "INACTIVE" | "SUSPENDED" | undefined;
    const result = await this.provisioningSvc.deactivateStudent(
      tenantId,
      profileId,
      status
    );
    res.status(200).json({
      success: true,
      data: result,
      message: "Student deactivated successfully",
    });
  });

  activateStudent = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = resolveTenantId(req);
    const profileId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!profileId) {
      throw new BadRequestError("Student profile ID is required");
    }
    const result = await this.provisioningSvc.activateStudent(tenantId, profileId);
    res.status(200).json({
      success: true,
      data: result,
      message: "Student activated successfully",
    });
  });
}

export const studentProvisioningController = new StudentProvisioningController();
