import { teacherAssignmentRepository } from "../repository/teacher-assignment.repository.js";
import {
  TeacherAssignmentListItem,
  CreateTeacherAssignmentInput,
  ReassignTeacherAssignmentInput,
  EndTeacherAssignmentInput,
  TeacherLoadSummary,
  TeacherAssignmentFilterParams,
  PaginatedTeacherAssignmentsResult,
} from "../types/teacher-assignment.types.js";
import { prisma } from "../../../../../lib/prisma.js";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "../../../../../shared/exceptions/index.js";

export class TeacherAssignmentService {
  async getAssignments(
    params: TeacherAssignmentFilterParams
  ): Promise<PaginatedTeacherAssignmentsResult> {
    return teacherAssignmentRepository.findAssignments(params);
  }

  async createAssignment(
    tenantId: string,
    input: CreateTeacherAssignmentInput,
    userId?: string
  ): Promise<TeacherAssignmentListItem> {
    const teacher = await prisma.teacherProfile.findFirst({
      where: { id: input.teacherId, tenantId },
    });

    if (!teacher) {
      throw new NotFoundError("Teacher profile not found");
    }

    if (teacher.status !== "ACTIVE") {
      throw new BadRequestError("Cannot assign a teacher whose profile is inactive or suspended");
    }

    const section = await prisma.section.findFirst({
      where: { id: input.sectionId, tenantId },
      include: { grade: true },
    });

    if (!section) {
      throw new NotFoundError("Class section not found");
    }

    if (input.role === "SUBJECT_TEACHER") {
      if (!input.subjectId) {
        throw new BadRequestError("Subject selection is required for subject teacher assignments");
      }

      const gradeSubject = await prisma.gradeSubject.findUnique({
        where: {
          gradeId_subjectId: {
            gradeId: section.grade.id,
            subjectId: input.subjectId,
          },
        },
      });

      if (!gradeSubject) {
        throw new BadRequestError("Selected subject is not mapped to this class section's grade level");
      }
    }

    const existing = await teacherAssignmentRepository.findActiveAssignment(
      tenantId,
      input.academicYearId,
      input.sectionId,
      input.subjectId,
      input.role
    );

    if (existing) {
      const teacherName = `${existing.teacher.firstName} ${existing.teacher.lastName}`;
      const roleText = input.role === "HOMEROOM_TEACHER" ? "homeroom teacher" : "subject teacher";
      throw new ConflictError(
        `This section already has an active ${roleText} (${teacherName}). Reassign or end the existing assignment first.`
      );
    }

    return teacherAssignmentRepository.createAssignment(tenantId, input, userId);
  }

  async reassignAssignment(
    tenantId: string,
    assignmentId: string,
    input: ReassignTeacherAssignmentInput,
    userId?: string
  ): Promise<TeacherAssignmentListItem> {
    const existing = await teacherAssignmentRepository.findById(tenantId, assignmentId);
    if (!existing || existing.status !== "ACTIVE") {
      throw new NotFoundError("Active teacher assignment not found");
    }

    if (existing.teacherId === input.replacementTeacherId) {
      throw new BadRequestError("Replacement teacher must be different from current assigned teacher");
    }

    const replacement = await prisma.teacherProfile.findFirst({
      where: { id: input.replacementTeacherId, tenantId },
    });

    if (!replacement || replacement.status !== "ACTIVE") {
      throw new BadRequestError("Replacement teacher is not active or not found");
    }

    return teacherAssignmentRepository.reassignAssignment(
      tenantId,
      assignmentId,
      input.replacementTeacherId,
      input.reason,
      userId
    );
  }

  async endAssignment(
    tenantId: string,
    assignmentId: string,
    input: EndTeacherAssignmentInput,
    userId?: string
  ): Promise<void> {
    const existing = await teacherAssignmentRepository.findById(tenantId, assignmentId);
    if (!existing || existing.status !== "ACTIVE") {
      throw new NotFoundError("Active teacher assignment not found");
    }

    await teacherAssignmentRepository.endAssignment(
      tenantId,
      assignmentId,
      input.reason,
      userId
    );
  }

  async getTeacherLoadSummary(
    tenantId: string,
    teacherId: string,
    academicYearId: string
  ): Promise<TeacherLoadSummary> {
    const summary = await teacherAssignmentRepository.getTeacherLoadSummary(
      tenantId,
      teacherId,
      academicYearId
    );

    if (!summary) {
      throw new NotFoundError("Teacher profile not found");
    }

    return summary;
  }
}

export const teacherAssignmentService = new TeacherAssignmentService();
