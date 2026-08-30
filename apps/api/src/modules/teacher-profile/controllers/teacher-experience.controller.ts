import { Request, Response } from "express";
import { asyncHandler } from "../../../shared/utils/async-handler.js";
import {
  UnauthorizedError,
  BadRequestError,
} from "../../../shared/exceptions/index.js";
import {
  teacherExperienceService,
  TeacherExperienceService,
} from "../services/teacher-experience.service.js";
import {
  CreateTeacherExperienceDto,
  UpdateTeacherExperienceDto,
} from "../schemas/teacher-experience.schema.js";

function getAuthenticatedUserId(req: Request): string {
  const userId = req.user?.userId;
  if (!userId) {
    throw new UnauthorizedError("User is not authenticated");
  }
  return userId;
}

export class TeacherExperienceController {
  constructor(
    private readonly service: TeacherExperienceService = teacherExperienceService
  ) {}

  getMyExperiences = asyncHandler(async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    const tenantId = req.user?.tenantId;
    const experiences = await this.service.getMyExperiences(userId, tenantId);

    res.status(200).json({
      success: true,
      data: experiences,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new BadRequestError("Experience ID is required");
    }
    const tenantId = req.user?.tenantId;
    const experience = await this.service.getExperienceById(id, tenantId);

    res.status(200).json({
      success: true,
      data: experience,
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    const tenantId = req.user?.tenantId;
    const body = req.body as CreateTeacherExperienceDto;
    const experience = await this.service.createExperience(
      userId,
      body,
      tenantId
    );

    res.status(201).json({
      success: true,
      data: experience,
      message: "Work experience added successfully",
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    const tenantId = req.user?.tenantId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new BadRequestError("Experience ID is required");
    }
    const body = req.body as UpdateTeacherExperienceDto;
    const experience = await this.service.updateExperience(
      userId,
      id,
      body,
      tenantId
    );

    res.status(200).json({
      success: true,
      data: experience,
      message: "Work experience updated successfully",
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    const tenantId = req.user?.tenantId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new BadRequestError("Experience ID is required");
    }

    await this.service.deleteExperience(userId, id, tenantId);

    res.status(200).json({
      success: true,
      message: "Work experience deleted successfully",
    });
  });
}

export const teacherExperienceController = new TeacherExperienceController();
