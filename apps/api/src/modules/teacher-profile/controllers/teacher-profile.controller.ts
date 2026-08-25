import { Request, Response } from "express";
import { asyncHandler } from "../../../shared/utils/async-handler.js";
import { UnauthorizedError, BadRequestError } from "../../../shared/exceptions/index.js";
import {
  teacherProfileService,
  TeacherProfileService,
} from "../services/teacher-profile.service.js";

function getAuthenticatedUserId(req: Request): string {
  const userId = req.user?.userId;
  if (!userId) {
    throw new UnauthorizedError("User is not authenticated");
  }
  return userId;
}

export class TeacherProfileController {
  constructor(
    private readonly service: TeacherProfileService = teacherProfileService
  ) {}

  getMyProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    const tenantId = req.user?.tenantId;
    const profile = await this.service.getProfileByUserId(userId, tenantId);

    res.status(200).json({
      success: true,
      data: profile,
    });
  });

  getProfileById = asyncHandler(async (req: Request, res: Response) => {
    const profileId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!profileId) {
      throw new BadRequestError("Profile ID is required");
    }
    const tenantId = req.user?.tenantId;
    const profile = await this.service.getProfileById(profileId, tenantId);

    res.status(200).json({
      success: true,
      data: profile,
    });
  });

  completeProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    const tenantId = req.user?.tenantId;
    const profile = await this.service.completeTeacherProfile(
      userId,
      req.body,
      tenantId
    );

    res.status(200).json({
      success: true,
      data: profile,
      message: "Teacher profile onboarding completed successfully",
    });
  });

  updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    const tenantId = req.user?.tenantId;
    const profile = await this.service.updateTeacherProfile(
      userId,
      req.body,
      tenantId
    );

    res.status(200).json({
      success: true,
      data: profile,
      message: "Teacher profile updated successfully",
    });
  });
}

export const teacherProfileController = new TeacherProfileController();
