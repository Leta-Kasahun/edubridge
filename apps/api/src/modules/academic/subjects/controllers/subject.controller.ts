import { Request, Response } from "express";
import { subjectService } from "../services/subject.service.js";
import {
  createSubjectSchema,
  updateSubjectSchema,
  assignGradeSubjectsSchema,
  subjectFilterSchema,
} from "../schemas/subject.schema.js";

export class SubjectController {
  async listSubjects(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const filters = subjectFilterSchema.parse(req.query);

      const data = await subjectService.listSubjects({
        ...filters,
        tenantId,
      });

      res.json({ success: true, data });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to retrieve subjects";
      res.status(400).json({ success: false, error: message });
    }
  }

  async getSubjectById(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const tenantId = req.user?.tenantId;

      const data = await subjectService.getSubjectById(id, tenantId);
      res.json({ success: true, data });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to retrieve subject";
      res.status(404).json({ success: false, error: message });
    }
  }

  async createSubject(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const input = createSubjectSchema.parse(req.body);

      const data = await subjectService.createSubject(input, tenantId);
      res.status(201).json({ success: true, data });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create subject";
      res.status(400).json({ success: false, error: message });
    }
  }

  async updateSubject(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const tenantId = req.user?.tenantId;
      const input = updateSubjectSchema.parse(req.body);

      const data = await subjectService.updateSubject(id, input, tenantId);
      res.json({ success: true, data });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update subject";
      res.status(400).json({ success: false, error: message });
    }
  }

  async toggleSubjectStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const tenantId = req.user?.tenantId;

      const data = await subjectService.toggleSubjectStatus(id, tenantId);
      res.json({ success: true, data });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to toggle subject status";
      res.status(400).json({ success: false, error: message });
    }
  }

  async assignGrades(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({ success: false, error: "Tenant context required" });
        return;
      }

      const input = assignGradeSubjectsSchema.parse(req.body);
      const data = await subjectService.assignGrades(id, tenantId, input.gradeLevels);

      res.json({ success: true, data });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to assign grades to subject";
      res.status(400).json({ success: false, error: message });
    }
  }
}

export const subjectController = new SubjectController();
