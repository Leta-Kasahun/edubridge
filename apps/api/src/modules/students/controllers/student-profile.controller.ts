import { Request, Response } from "express";
import { asyncHandler } from "../../../shared/utils/async-handler.js";
import { UnauthorizedError, BadRequestError } from "../../../shared/exceptions/index.js";
import {
  studentProfileService,
  StudentProfileService,
} from "../services/student-profile.service.js";

function getAuthenticatedUserId(req: Request): string {
  const userId = req.user?.userId;
  if (!userId) {
    throw new UnauthorizedError("User is not authenticated");
  }
  return userId;
}

export class StudentProfileController {
  constructor(
    private readonly service: StudentProfileService = studentProfileService
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
    const profile = await this.service.completeStudentProfile(
      userId,
      req.body,
      tenantId
    );

    res.status(200).json({
      success: true,
      data: profile,
      message: "Student profile onboarding completed successfully",
    });
  });

  updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    const tenantId = req.user?.tenantId;
    const profile = await this.service.updateStudentProfile(
      userId,
      req.body,
      tenantId
    );

    res.status(200).json({
      success: true,
      data: profile,
      message: "Student profile updated successfully",
    });
  });
}

export const studentProfileController = new StudentProfileController();
