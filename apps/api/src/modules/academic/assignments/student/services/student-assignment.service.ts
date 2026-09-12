import { studentAssignmentRepository } from "../repository/student-assignment.repository.js";
import {
  StudentEnrollmentHistoryItem,
  SectionCapacityInfo,
  SingleTransferInput,
  BulkTransferInput,
  PromotionPreviewQuery,
  PromotionPreviewResult,
  CommitPromotionInput,
  WithdrawStudentInput,
  RosterFilterParams,
  PaginatedRosterResult,
} from "../types/student-assignment.types.js";
import { prisma } from "../../../../../lib/prisma.js";
import {
  NotFoundError,
  BadRequestError,
} from "../../../../../shared/exceptions/index.js";
import { domainEventBus } from "../../../../../shared/events/domain-events.js";

export class StudentAssignmentService {
  async getRoster(params: RosterFilterParams): Promise<PaginatedRosterResult> {
    return studentAssignmentRepository.findRoster(params);
  }

  async getGradeSectionsCapacity(
    tenantId: string,
    academicYearId: string,
    gradeLevel: number
  ): Promise<readonly SectionCapacityInfo[]> {
    return studentAssignmentRepository.getAvailableSectionsForGrade(
      tenantId,
      academicYearId,
      gradeLevel
    );
  }

  async transferSingle(
    tenantId: string,
    studentId: string,
    academicYearId: string,
    input: SingleTransferInput,
    userId?: string
  ): Promise<void> {
    const currentEnrollment =
      await studentAssignmentRepository.getStudentCurrentEnrollment(
        tenantId,
        studentId,
        academicYearId
      );

    if (!currentEnrollment) {
      throw new NotFoundError("Active enrollment record not found for student in this session.");
    }

    if (currentEnrollment.sectionId === input.targetSectionId) {
      throw new BadRequestError("Student is already enrolled in the selected section.");
    }

    const targetSection = await studentAssignmentRepository.getSectionCapacityInfo(
      tenantId,
      input.targetSectionId
    );

    if (!targetSection) {
      throw new NotFoundError("Target section not found.");
    }

    if (targetSection.gradeLevel !== currentEnrollment.section.grade.level) {
      throw new BadRequestError("Cross-grade transfers are not permitted through section assignment.");
    }

    if (targetSection.availableSeats !== null && targetSection.availableSeats < 1) {
      throw new BadRequestError(
        `Target section "${targetSection.sectionName}" has reached its maximum capacity of ${targetSection.capacity} students.`
      );
    }

    await studentAssignmentRepository.transferSingle(
      tenantId,
      studentId,
      academicYearId,
      input.targetSectionId,
      input.reason,
      userId
    );

    domainEventBus.emitEvent("student.enrolled", {
      tenantId,
      studentId,
      sectionId: input.targetSectionId,
      academicYearId,
      actorUserId: userId,
    });
  }

  async transferBulk(
    tenantId: string,
    academicYearId: string,
    input: BulkTransferInput,
    userId?: string
  ): Promise<number> {
    const targetSection = await studentAssignmentRepository.getSectionCapacityInfo(
      tenantId,
      input.targetSectionId
    );

    if (!targetSection) {
      throw new NotFoundError("Target section not found.");
    }

    const selectedCount = input.studentIds.length;

    if (targetSection.availableSeats !== null && targetSection.availableSeats < selectedCount) {
      throw new BadRequestError(
        `Target section "${targetSection.sectionName}" has only ${targetSection.availableSeats} seat(s) available, but ${selectedCount} students were selected.`
      );
    }

    const currentEnrollments = await prisma.studentEnrollment.findMany({
      where: {
        tenantId,
        academicYearId,
        studentId: { in: [...input.studentIds] },
        status: "ACTIVE",
      },
      include: {
        section: {
          include: { grade: true },
        },
      },
    });

    for (const e of currentEnrollments) {
      if (e.section.grade.level !== targetSection.gradeLevel) {
        throw new BadRequestError(
          `Cannot transfer students across different grade levels. All selected students must be in Grade ${targetSection.gradeLevel}.`
        );
      }
    }

    const count = await studentAssignmentRepository.transferBulk(
      tenantId,
      input.studentIds,
      academicYearId,
      input.targetSectionId,
      input.reason,
      userId
    );

    for (const sId of input.studentIds) {
      domainEventBus.emitEvent("student.enrolled", {
        tenantId,
        studentId: sId,
        sectionId: input.targetSectionId,
        academicYearId,
        actorUserId: userId,
      });
    }

    return count;
  }

  async getPromotionPreview(
    tenantId: string,
    query: PromotionPreviewQuery
  ): Promise<PromotionPreviewResult> {
    const targetYear = await prisma.academicYear.findFirst({
      where: { id: query.targetAcademicYearId, tenantId },
    });

    if (!targetYear) {
      throw new NotFoundError("Target academic year not found.");
    }

    return studentAssignmentRepository.getPromotionPreview(
      tenantId,
      query.sourceAcademicYearId,
      query.targetAcademicYearId,
      query.gradeLevel
    );
  }

  async commitPromotion(
    tenantId: string,
    input: CommitPromotionInput,
    userId?: string
  ): Promise<number> {
    const targetYear = await prisma.academicYear.findFirst({
      where: { id: input.targetAcademicYearId, tenantId },
    });

    if (!targetYear) {
      throw new NotFoundError("Target academic year not found.");
    }

    if (targetYear.status === "ARCHIVED" || targetYear.status === "COMPLETED") {
      throw new BadRequestError("Cannot promote students into a completed or archived academic year.");
    }

    return studentAssignmentRepository.commitPromotion(tenantId, input, userId);
  }

  async withdrawStudent(
    tenantId: string,
    studentId: string,
    academicYearId: string,
    input: WithdrawStudentInput,
    userId?: string
  ): Promise<void> {
    await studentAssignmentRepository.withdrawStudent(
      tenantId,
      studentId,
      academicYearId,
      input.reason,
      userId
    );
  }

  async getStudentEnrollmentHistory(
    tenantId: string,
    studentId: string
  ): Promise<readonly StudentEnrollmentHistoryItem[]> {
    return studentAssignmentRepository.getStudentEnrollmentHistory(tenantId, studentId);
  }
}

export const studentAssignmentService = new StudentAssignmentService();
