import { Request, Response } from "express";
import { asyncHandler } from "../../../shared/utils/async-handler.js";
import {
  UnauthorizedError,
  BadRequestError,
} from "../../../shared/exceptions/index.js";
import {
  teacherQualificationService,
  TeacherQualificationService,
} from "../services/teacher-qualification.service.js";
import {
  CreateTeacherQualificationDto,
  UpdateTeacherQualificationDto,
} from "../schemas/teacher-qualification.schema.js";

function getAuthenticatedUserId(req: Request): string {
  const userId = req.user?.userId;
  if (!userId) {
    throw new UnauthorizedError("User is not authenticated");
  }
  return userId;
}

export class TeacherQualificationController {
  constructor(
    private readonly service: TeacherQualificationService = teacherQualificationService
  ) {}

  getMyQualifications = asyncHandler(async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    const tenantId = req.user?.tenantId;
    const qualifications = await this.service.getMyQualifications(
      userId,
      tenantId
    );

    res.status(200).json({
      success: true,
      data: qualifications,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new BadRequestError("Qualification ID is required");
    }
    const tenantId = req.user?.tenantId;
    const qualification = await this.service.getQualificationById(id, tenantId);

    res.status(200).json({
      success: true,
      data: qualification,
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    const tenantId = req.user?.tenantId;
    const body = req.body as CreateTeacherQualificationDto;
    const qualification = await this.service.createQualification(
      userId,
      body,
      tenantId
    );

    res.status(201).json({
      success: true,
      data: qualification,
      message: "Qualification added successfully",
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    const tenantId = req.user?.tenantId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new BadRequestError("Qualification ID is required");
    }
    const body = req.body as UpdateTeacherQualificationDto;
    const qualification = await this.service.updateQualification(
      userId,
      id,
      body,
      tenantId
    );

    res.status(200).json({
      success: true,
      data: qualification,
      message: "Qualification updated successfully",
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    const tenantId = req.user?.tenantId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new BadRequestError("Qualification ID is required");
    }

    await this.service.deleteQualification(userId, id, tenantId);

    res.status(200).json({
      success: true,
      message: "Qualification deleted successfully",
    });
  });
}

export const teacherQualificationController =
  new TeacherQualificationController();
