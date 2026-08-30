import { Request, Response } from "express";
import { asyncHandler } from "../../../shared/utils/async-handler.js";
import { QualificationLevel, TeacherStatus } from "../../../generated/prisma/client.js";
import {
  teacherDirectoryService,
  TeacherDirectoryService,
} from "../services/teacher-directory.service.js";

export class TeacherDirectoryController {
  constructor(
    private readonly service: TeacherDirectoryService = teacherDirectoryService
  ) {}

  getDirectory = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const level = typeof req.query.level === "string"
      ? (req.query.level as QualificationLevel)
      : undefined;
    const hasCertificate = req.query.hasCertificate === "true"
      ? true
      : req.query.hasCertificate === "false"
      ? false
      : undefined;
    const status = typeof req.query.status === "string"
      ? (req.query.status as TeacherStatus)
      : undefined;
    const page = typeof req.query.page === "string" ? parseInt(req.query.page, 10) : 1;
    const limit = typeof req.query.limit === "string" ? parseInt(req.query.limit, 10) : 50;

    const result = await this.service.getDirectory({
      tenantId,
      search,
      level,
      hasCertificate,
      status,
      page: isNaN(page) ? 1 : page,
      limit: isNaN(limit) ? 50 : limit,
    });

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  });
}

export const teacherDirectoryController = new TeacherDirectoryController();
