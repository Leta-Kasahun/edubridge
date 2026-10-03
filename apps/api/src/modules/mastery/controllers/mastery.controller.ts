import { Request, Response } from "express";
import { MasteryService } from "../services/mastery.service.js";
import { prisma } from "../../../lib/prisma.js";
import { asyncHandler } from "../../../shared/utils/async-handler.js";
import { UnauthorizedError } from "../../../shared/exceptions/unauthorized-error.js";
import { ForbiddenError } from "../../../shared/exceptions/forbidden-error.js";

export class MasteryController {
  constructor(private readonly masteryService: MasteryService = new MasteryService()) {}

  getSectionMasteryMatrix = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedError("Tenant context required");
    }

    const sectionId = String(req.params.sectionId || "");
    if (!sectionId) {
      res.status(400).json({ success: false, message: "sectionId parameter is required" });
      return;
    }

    const subjectId = typeof req.query.subjectId === "string" ? req.query.subjectId : undefined;

    const data = await this.masteryService.getSectionMasteryMatrix(
      tenantId,
      sectionId,
      subjectId
    );

    res.status(200).json({
      success: true,
      data,
    });
  });

  getStudentMastery = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedError("Tenant context required");
    }

    let studentId = String(req.params.studentId || "");
    if (!studentId || studentId === "me" || studentId === "undefined") {
      const myProfile = await prisma.studentProfile.findFirst({
        where: {
          tenantId,
          userId: req.user!.userId,
        },
      });
      studentId = myProfile ? myProfile.id : req.user!.userId;
    }

    const userRoles = req.user?.roles || [];
    const isStaff = userRoles.some((r) =>
      ["SCHOOL_ADMIN", "TEACHER", "SYSTEM_ADMIN"].includes(r)
    );

    if (!isStaff) {
      const myProfile = await prisma.studentProfile.findFirst({
        where: {
          tenantId,
          userId: req.user!.userId,
        },
      });

      const allowed = [req.user?.userId, myProfile?.id].filter(Boolean);
      if (!allowed.includes(studentId)) {
        throw new ForbiddenError("You are only allowed to view your own mastery profile.");
      }
    }

    const subjectId = typeof req.query.subjectId === "string" ? req.query.subjectId : undefined;

    const data = await this.masteryService.getStudentMastery(
      tenantId,
      studentId,
      subjectId
    );

    res.status(200).json({
      success: true,
      data,
    });
  });

  getTopicMasteryHistory = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedError("Tenant context required");
    }

    const studentId = String(req.params.studentId || "");
    const topicId = String(req.params.topicId || "");
    if (!studentId || !topicId) {
      res.status(400).json({ success: false, message: "studentId and topicId are required" });
      return;
    }

    const data = await this.masteryService.getTopicMasteryHistory(
      tenantId,
      studentId,
      topicId
    );

    res.status(200).json({
      success: true,
      data,
    });
  });

  recordPracticeEvidence = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedError("Tenant context required");
    }

    const myProfile = await prisma.studentProfile.findFirst({
      where: {
        tenantId,
        userId: req.user!.userId,
      },
    });

    const studentId = myProfile ? myProfile.id : req.user!.userId;

    const data = await this.masteryService.recordPracticeEvidence(
      tenantId,
      studentId,
      req.body
    );

    res.status(200).json({
      success: true,
      data,
    });
  });
}
