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
import { domainEventBus } from "../../../../../shared/events/domain-events.js";

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

    const targetSectionIds = input.sectionIds && input.sectionIds.length > 0
      ? Array.from(new Set(input.sectionIds))
      : (input.sectionId ? [input.sectionId] : []);

    if (targetSectionIds.length === 0) {
      throw new BadRequestError("At least one class section must be selected");
    }

    if (input.role === "SUBJECT_TEACHER" && !input.subjectId) {
      throw new BadRequestError("Subject selection is required for subject teacher assignments");
    }

    let verifiedSubject = null;
    if (input.role === "SUBJECT_TEACHER" && input.subjectId) {
      verifiedSubject = await prisma.subject.findFirst({
        where: { id: input.subjectId, isActive: true },
      });

      if (!verifiedSubject) {
        throw new NotFoundError("Subject not found or inactive");
      }
    }

    const sections = await prisma.section.findMany({
      where: {
        id: { in: targetSectionIds },
        tenantId,
      },
      include: { grade: true },
    });

    if (sections.length !== targetSectionIds.length) {
      throw new NotFoundError("One or more selected class sections were not found");
    }

    if (input.role === "SUBJECT_TEACHER" && input.subjectId) {
      for (const sec of sections) {
        await prisma.gradeSubject.upsert({
          where: {
            gradeId_subjectId: {
              gradeId: sec.grade.id,
              subjectId: input.subjectId,
            },
          },
          create: {
            gradeId: sec.grade.id,
            subjectId: input.subjectId,
          },
          update: {},
        });
      }
    }

    for (const sec of sections) {
      const existing = await teacherAssignmentRepository.findActiveAssignment(
        tenantId,
        input.academicYearId,
        sec.id,
        input.subjectId,
        input.role
      );

      if (existing) {
        const teacherName = `${existing.teacher.firstName} ${existing.teacher.lastName}`;
        const roleText = input.role === "HOMEROOM_TEACHER" ? "homeroom teacher" : "subject teacher";
        throw new ConflictError(
          `Section "${sec.name}" (Grade ${sec.grade.level}) already has an active ${roleText} (${teacherName}). Reassign or end the existing assignment first.`
        );
      }
    }

    const createdAssignments: TeacherAssignmentListItem[] = [];
    for (const sec of sections) {
      const created = await teacherAssignmentRepository.createAssignment(
        tenantId,
        {
          teacherId: input.teacherId,
          academicYearId: input.academicYearId,
          sectionId: sec.id,
          subjectId: input.subjectId,
          role: input.role,
        },
        userId
      );
      createdAssignments.push(created);
    }

    if (!createdAssignments[0]) {
      throw new BadRequestError("Failed to create teacher assignments");
    }

    domainEventBus.emitEvent("teacher.assigned", {
      tenantId,
      teacherId: input.teacherId,
      sectionIds: targetSectionIds,
      subjectId: input.subjectId,
      role: input.role,
      actorUserId: userId,
      assignmentId: createdAssignments[0].id,
    });

    return createdAssignments[0];
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

    const result = await teacherAssignmentRepository.reassignAssignment(
      tenantId,
      assignmentId,
      input.replacementTeacherId,
      input.reason,
      userId
    );

    domainEventBus.emitEvent("teacher.reassigned", {
      tenantId,
      previousTeacherId: existing.teacherId,
      replacementTeacherId: input.replacementTeacherId,
      assignmentId,
      reason: input.reason,
      actorUserId: userId,
    });

    return result;
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

    domainEventBus.emitEvent("teacher.assignment_ended", {
      tenantId,
      teacherId: existing.teacherId,
      assignmentId,
      reason: input.reason,
      actorUserId: userId,
    });
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
