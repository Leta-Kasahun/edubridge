import { Request, Response } from "express";
import { studentAssignmentService } from "../services/student-assignment.service.js";
import {
  singleTransferSchema,
  bulkTransferSchema,
  promotionPreviewQuerySchema,
  commitPromotionSchema,
  withdrawStudentSchema,
  rosterFilterSchema,
} from "../schemas/student-assignment.schema.js";
import { asyncHandler } from "../../../../../shared/utils/async-handler.js";
import { UnauthorizedError, BadRequestError } from "../../../../../shared/exceptions/index.js";
import { resolveTeacherScopeId } from "../../../../../shared/utils/teacher-scope.util.js";

function getTenantContext(req: Request): { tenantId: string; userId?: string } {
  const tenantId = req.user?.tenantId || (req.headers["x-tenant-id"] as string);
  if (!tenantId) {
    throw new UnauthorizedError("Tenant context is required");
  }
  return { tenantId, userId: req.user?.userId };
}

export class StudentAssignmentController {
  getRoster = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { tenantId } = getTenantContext(req);
    const teacherId = await resolveTeacherScopeId(req, tenantId);
    const filters = rosterFilterSchema.parse(req.query);

    const result = await studentAssignmentService.getRoster({
      ...filters,
      tenantId,
      teacherId,
    });

    res.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  });

  getGradeSectionsCapacity = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { tenantId } = getTenantContext(req);
    const academicYearId = String(req.query.academicYearId);
    const gradeLevel = Number(req.query.gradeLevel);

    if (!academicYearId || isNaN(gradeLevel)) {
      throw new BadRequestError("academicYearId and gradeLevel are required");
    }

    const data = await studentAssignmentService.getGradeSectionsCapacity(
      tenantId,
      academicYearId,
      gradeLevel
    );

    res.json({ success: true, data });
  });

  transferSingle = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { tenantId, userId } = getTenantContext(req);
    const studentId = String(req.params.studentId);
    const academicYearId = String(req.query.academicYearId || req.body.academicYearId);
    if (!academicYearId) {
      throw new BadRequestError("academicYearId is required");
    }

    const input = singleTransferSchema.parse(req.body);
    await studentAssignmentService.transferSingle(
      tenantId,
      studentId,
      academicYearId,
      input,
      userId
    );

    res.json({ success: true, message: "Student transferred successfully" });
  });

  transferBulk = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { tenantId, userId } = getTenantContext(req);
    const academicYearId = String(req.query.academicYearId || req.body.academicYearId);
    if (!academicYearId) {
      throw new BadRequestError("academicYearId is required");
    }

    const input = bulkTransferSchema.parse(req.body);
    const count = await studentAssignmentService.transferBulk(
      tenantId,
      academicYearId,
      input,
      userId
    );

    res.json({ success: true, count, message: `${count} students transferred successfully` });
  });

  getPromotionPreview = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { tenantId } = getTenantContext(req);
    const query = promotionPreviewQuerySchema.parse(req.query);
    const data = await studentAssignmentService.getPromotionPreview(tenantId, query);

    res.json({ success: true, data });
  });

  commitPromotion = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { tenantId, userId } = getTenantContext(req);
    const input = commitPromotionSchema.parse(req.body);
    const count = await studentAssignmentService.commitPromotion(tenantId, input, userId);

    res.json({ success: true, count, message: `Successfully committed promotion for ${count} students` });
  });

  withdrawStudent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { tenantId, userId } = getTenantContext(req);
    const studentId = String(req.params.studentId);
    const academicYearId = String(req.query.academicYearId || req.body.academicYearId);
    if (!academicYearId) {
      throw new BadRequestError("academicYearId is required");
    }

    const input = withdrawStudentSchema.parse(req.body);
    await studentAssignmentService.withdrawStudent(
      tenantId,
      studentId,
      academicYearId,
      input,
      userId
    );

    res.json({ success: true, message: "Student enrollment withdrawn successfully" });
  });

  getStudentEnrollmentHistory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { tenantId } = getTenantContext(req);
    const studentId = String(req.params.studentId);
    const data = await studentAssignmentService.getStudentEnrollmentHistory(tenantId, studentId);

    res.json({ success: true, data });
  });
}

export const studentAssignmentController = new StudentAssignmentController();
