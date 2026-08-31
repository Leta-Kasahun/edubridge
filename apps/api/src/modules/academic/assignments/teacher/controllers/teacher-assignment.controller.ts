import { Request, Response } from "express";
import { teacherAssignmentService } from "../services/teacher-assignment.service.js";
import {
  createTeacherAssignmentSchema,
  reassignTeacherAssignmentSchema,
  endTeacherAssignmentSchema,
  teacherAssignmentFilterSchema,
} from "../schemas/teacher-assignment.schema.js";
import { asyncHandler } from "../../../../../shared/utils/async-handler.js";
import { UnauthorizedError, BadRequestError } from "../../../../../shared/exceptions/index.js";

function getTenantContext(req: Request): { tenantId: string; userId?: string } {
  const tenantId = req.user?.tenantId || (req.headers["x-tenant-id"] as string);
  if (!tenantId) {
    throw new UnauthorizedError("Tenant context is required");
  }
  return { tenantId, userId: req.user?.userId };
}

export class TeacherAssignmentController {
  getAssignments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { tenantId } = getTenantContext(req);
    const filters = teacherAssignmentFilterSchema.parse(req.query);

    const result = await teacherAssignmentService.getAssignments({
      ...filters,
      tenantId,
    });

    res.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  });

  createAssignment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { tenantId, userId } = getTenantContext(req);
    const input = createTeacherAssignmentSchema.parse(req.body);

    const data = await teacherAssignmentService.createAssignment(tenantId, input, userId);
    res.status(201).json({ success: true, data });
  });

  reassignAssignment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { tenantId, userId } = getTenantContext(req);
    const assignmentId = String(req.params.id);
    const input = reassignTeacherAssignmentSchema.parse(req.body);

    const data = await teacherAssignmentService.reassignAssignment(
      tenantId,
      assignmentId,
      input,
      userId
    );

    res.json({ success: true, data, message: "Teacher reassigned successfully" });
  });

  endAssignment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { tenantId, userId } = getTenantContext(req);
    const assignmentId = String(req.params.id);
    const input = endTeacherAssignmentSchema.parse(req.body);

    await teacherAssignmentService.endAssignment(tenantId, assignmentId, input, userId);
    res.json({ success: true, message: "Teacher assignment ended successfully" });
  });

  getTeacherLoadSummary = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { tenantId } = getTenantContext(req);
    const teacherId = String(req.params.teacherId);
    const academicYearId = String(req.query.academicYearId);

    if (!academicYearId) {
      throw new BadRequestError("academicYearId is required");
    }

    const data = await teacherAssignmentService.getTeacherLoadSummary(
      tenantId,
      teacherId,
      academicYearId
    );

    res.json({ success: true, data });
  });
}

export const teacherAssignmentController = new TeacherAssignmentController();
