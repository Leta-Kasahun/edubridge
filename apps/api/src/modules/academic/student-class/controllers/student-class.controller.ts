import { Request, Response } from "express";
import { asyncHandler } from "../../../../shared/utils/async-handler.js";
import { UnauthorizedError } from "../../../../shared/exceptions/index.js";
import {
  studentClassService,
  StudentClassService,
} from "../services/student-class.service.js";

export class StudentClassController {
  constructor(
    private readonly service: StudentClassService = studentClassService
  ) {}

  getMyClass = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.user?.tenantId || (req.headers["x-tenant-id"] as string);
    const userId = req.user?.userId;

    if (!tenantId || !userId) {
      throw new UnauthorizedError("Authentication context is required");
    }

    const data = await this.service.getMyClass(tenantId, userId);
    res.status(200).json({ success: true, data });
  });
}

export const studentClassController = new StudentClassController();
