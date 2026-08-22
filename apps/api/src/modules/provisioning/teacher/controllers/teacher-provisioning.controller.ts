import { Request, Response } from "express";
import { asyncHandler } from "../../../../shared/utils/async-handler.js";
import { BadRequestError } from "../../../../shared/exceptions/bad-request-error.js";
import {
  teacherProvisioningService,
  TeacherProvisioningService,
} from "../services/teacher-provisioning.service.js";
import {
  teacherBulkProvisioningService,
  TeacherBulkProvisioningService,
} from "../services/teacher-bulk-provisioning.service.js";
import {
  teacherManagementService,
  TeacherManagementService,
} from "../services/teacher-management.service.js";
import { TeacherStatus, Gender } from "../../../../generated/prisma/client.js";

function resolveTenantId(req: Request): string {
  const tenantId =
    req.body?.tenantId ||
    (req.query?.tenantId as string) ||
    req.user?.tenantId ||
    (req.headers["x-tenant-id"] as string);

  if (!tenantId) {
    throw new BadRequestError("Tenant ID is required for teacher provisioning");
  }
  return tenantId;
}

export class TeacherProvisioningController {
  constructor(
    private readonly provisioningSvc: TeacherProvisioningService = teacherProvisioningService,
    private readonly bulkSvc: TeacherBulkProvisioningService = teacherBulkProvisioningService,
    private readonly managementSvc: TeacherManagementService = teacherManagementService
  ) {}

  inviteTeacher = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = resolveTenantId(req);
    const createdById = req.user?.userId;
    const result = await this.provisioningSvc.inviteTeacher(
      req.body,
      tenantId,
      createdById
    );
    res.status(201).json({
      success: true,
      data: result,
    });
  });

  createTeacherDirect = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = resolveTenantId(req);
    const createdById = req.user?.userId;
    const result = await this.provisioningSvc.createTeacherDirect(
      req.body,
      tenantId,
      createdById
    );
    res.status(201).json({
      success: true,
      data: result,
    });
  });

  provisionTeacher = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = resolveTenantId(req);
    const createdById = req.user?.userId;
    const result = await this.provisioningSvc.provisionTeacher(
      req.body,
      tenantId,
      createdById
    );
    res.status(201).json({
      success: true,
      data: result,
    });
  });

  bulkProvisionTeachers = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = resolveTenantId(req);
    const createdById = req.user?.userId || "";
    const result = await this.bulkSvc.provisionTeachersBulk(
      req.body,
      tenantId,
      createdById
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  bulkProvisionCsv = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = resolveTenantId(req);
    const createdById = req.user?.userId || "";
    const result = await this.bulkSvc.provisionTeachersCsv(
      req.body,
      tenantId,
      createdById
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  getTeachers = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = resolveTenantId(req);
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;
    const status = req.query.status as TeacherStatus | undefined;
    const gender = req.query.gender as Gender | undefined;

    const result = await this.managementSvc.getTeachers(tenantId, {
      page,
      limit,
      search,
      status,
      gender,
    });

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  });

  getTeacherById = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = resolveTenantId(req);
    const profileId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!profileId) {
      throw new BadRequestError("Teacher profile ID is required");
    }
    const result = await this.managementSvc.getTeacherById(tenantId, profileId);
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  updateTeacher = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = resolveTenantId(req);
    const profileId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!profileId) {
      throw new BadRequestError("Teacher profile ID is required");
    }
    const result = await this.managementSvc.updateTeacher(
      tenantId,
      profileId,
      req.body
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  deactivateTeacher = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = resolveTenantId(req);
    const profileId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!profileId) {
      throw new BadRequestError("Teacher profile ID is required");
    }
    const status = req.body.status as TeacherStatus | undefined;
    const result = await this.managementSvc.deactivateTeacher(
      tenantId,
      profileId,
      status
    );
    res.status(200).json({
      success: true,
      data: result,
      message: "Teacher deactivated successfully",
    });
  });

  activateTeacher = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = resolveTenantId(req);
    const profileId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!profileId) {
      throw new BadRequestError("Teacher profile ID is required");
    }
    const result = await this.managementSvc.activateTeacher(tenantId, profileId);
    res.status(200).json({
      success: true,
      data: result,
      message: "Teacher activated successfully",
    });
  });
}

export const teacherProvisioningController = new TeacherProvisioningController();
