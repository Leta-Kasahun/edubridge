import {
  domainEventBus,
  TeacherAssignedEvent,
  TeacherReassignedEvent,
  TeacherAssignmentEndedEvent,
  QuestionBankPublishedEvent,
  LearningContentPublishedEvent,
  StudentEnrolledEvent,
  AssessmentGradedEvent,
  AssessmentAssignedEvent,
  PasswordResetByAdminEvent,
  PasswordChangedSelfEvent,
  StudentStatusChangedEvent,
  TeacherStatusChangedEvent,
  StudentPromotionCommittedEvent,
  StudentWithdrawnEvent,
  QuestionReportSubmittedEvent,
  QuestionReportResolvedEvent,
} from "../../../shared/events/domain-events.js";
import { activityLogService } from "./activity-log.service.js";
import { RecordActivityInput } from "../types/activity-log.types.js";

export class ActivityRecorderService {
  async record(data: RecordActivityInput): Promise<void> {
    try {
      await activityLogService.record(data);
    } catch {
      // Activity recording should never break main transaction flow
    }
  }

  registerEventListeners(): void {
    domainEventBus.onEvent("teacher.assigned", async (e: TeacherAssignedEvent) => {
      await this.record({
        tenantId: e.tenantId,
        userId: e.actorUserId,
        action: "ASSIGN",
        resource: "TEACHER",
        resourceId: e.teacherId,
        metadata: {
          description: `Teacher assigned to ${e.sectionIds.length} section(s) as ${e.role}`,
          role: e.role,
          subjectId: e.subjectId,
          sectionIds: e.sectionIds,
        },
      });
    });

    domainEventBus.onEvent("teacher.reassigned", async (e: TeacherReassignedEvent) => {
      await this.record({
        tenantId: e.tenantId,
        userId: e.actorUserId,
        action: "REASSIGN",
        resource: "TEACHER",
        resourceId: e.replacementTeacherId,
        metadata: {
          description: `Teacher reassigned replacing previous instructor`,
          previousTeacherId: e.previousTeacherId,
          reason: e.reason,
        },
      });
    });

    domainEventBus.onEvent("teacher.assignment_ended", async (e: TeacherAssignmentEndedEvent) => {
      await this.record({
        tenantId: e.tenantId,
        userId: e.actorUserId,
        action: "END_ASSIGNMENT",
        resource: "TEACHER",
        resourceId: e.teacherId,
        metadata: {
          description: `Teaching assignment ended`,
          reason: e.reason,
        },
      });
    });

    domainEventBus.onEvent("student.enrolled", async (e: StudentEnrolledEvent) => {
      await this.record({
        tenantId: e.tenantId,
        userId: e.actorUserId,
        action: "ENROLL",
        resource: "ENROLLMENT",
        resourceId: e.studentId,
        metadata: {
          description: `Student officially enrolled in section`,
          sectionId: e.sectionId,
          academicYearId: e.academicYearId,
        },
      });
    });

    domainEventBus.onEvent("question_bank.published", async (e: QuestionBankPublishedEvent) => {
      await this.record({
        tenantId: e.tenantId,
        userId: e.actorUserId,
        action: "PUBLISH",
        resource: "QUESTION_BANK",
        resourceId: e.bankId,
        metadata: {
          description: `Question Bank published: "${e.name}"`,
          gradeLevel: e.gradeLevel,
          subjectName: e.subjectName,
        },
      });
    });

    domainEventBus.onEvent("learning_content.published", async (e: LearningContentPublishedEvent) => {
      await this.record({
        tenantId: e.tenantId,
        userId: e.actorUserId,
        action: "PUBLISH",
        resource: "CURRICULUM",
        resourceId: e.contentId,
        metadata: {
          description: `Learning material published: "${e.title}"`,
          subjectName: e.subjectName,
          gradeLevel: e.gradeLevel,
        },
      });
    });

    domainEventBus.onEvent("assessment.assigned", async (e: AssessmentAssignedEvent) => {
      await this.record({
        tenantId: e.tenantId,
        action: "ASSIGN",
        resource: "ASSESSMENT",
        resourceId: e.assessmentId,
        metadata: {
          description: `Assessment assigned: "${e.assessmentTitle}" to ${e.sectionIds.length} sections`,
          availableUntil: e.availableUntil,
        },
      });
    });

    domainEventBus.onEvent("assessment.graded", async (e: AssessmentGradedEvent) => {
      await this.record({
        tenantId: e.tenantId,
        action: "GRADE",
        resource: "ASSESSMENT",
        resourceId: e.assessmentId,
        metadata: {
          description: `Assessment graded: "${e.assessmentTitle}" - Score: ${e.percentage}%`,
          percentage: e.percentage,
          isManual: e.isManual,
          studentUserId: e.studentUserId,
        },
      });
    });

    domainEventBus.onEvent("auth.password_reset_by_admin", async (e: PasswordResetByAdminEvent) => {
      await this.record({
        tenantId: e.tenantId,
        action: "PASSWORD_RESET",
        resource: "AUTH",
        resourceId: e.targetUserId,
        metadata: {
          description: `Administrator triggered account password reset`,
          targetUserId: e.targetUserId,
        },
      });
    });

    domainEventBus.onEvent("auth.password_changed_self", async (e: PasswordChangedSelfEvent) => {
      await this.record({
        tenantId: e.tenantId,
        userId: e.userId,
        action: "PASSWORD_CHANGE",
        resource: "AUTH",
        resourceId: e.userId,
        metadata: {
          description: `User successfully changed account password`,
        },
      });
    });

    domainEventBus.onEvent("student.status_changed", async (e: StudentStatusChangedEvent) => {
      await this.record({
        tenantId: e.tenantId,
        action: "STATUS_CHANGE",
        resource: "STUDENT",
        resourceId: e.studentUserId,
        metadata: {
          description: `Student account status updated to ${e.newStatus}`,
          newStatus: e.newStatus,
        },
      });
    });

    domainEventBus.onEvent("teacher.status_changed", async (e: TeacherStatusChangedEvent) => {
      await this.record({
        tenantId: e.tenantId,
        action: "STATUS_CHANGE",
        resource: "TEACHER",
        resourceId: e.teacherUserId,
        metadata: {
          description: `Teacher profile status updated to ${e.newStatus}`,
          newStatus: e.newStatus,
        },
      });
    });

    domainEventBus.onEvent("student.promotion_committed", async (e: StudentPromotionCommittedEvent) => {
      await this.record({
        tenantId: e.tenantId,
        action: "PROMOTE",
        resource: "ACADEMIC",
        resourceId: e.studentId,
        metadata: {
          description: `Student academic promotion committed to Grade ${e.targetGradeLevel} (${e.targetAcademicYearName})`,
          isPromoted: e.isPromoted,
          targetGradeLevel: e.targetGradeLevel,
        },
      });
    });

    domainEventBus.onEvent("student.withdrawn", async (e: StudentWithdrawnEvent) => {
      await this.record({
        tenantId: e.tenantId,
        action: "WITHDRAW",
        resource: "STUDENT",
        resourceId: e.studentId,
        metadata: {
          description: `Student officially withdrawn from school roster`,
        },
      });
    });

    domainEventBus.onEvent("question.report_submitted", async (e: QuestionReportSubmittedEvent) => {
      await this.record({
        tenantId: e.tenantId,
        userId: e.studentUserId,
        action: "REPORT",
        resource: "QUESTION_BANK",
        resourceId: e.questionId,
        metadata: {
          description: `Question flagged for review in bank: "${e.bankTitle}"`,
          reason: e.reason,
        },
      });
    });

    domainEventBus.onEvent("question.report_resolved", async (e: QuestionReportResolvedEvent) => {
      await this.record({
        tenantId: e.tenantId,
        userId: e.resolvedByUserId,
        action: "RESOLVE_REPORT",
        resource: "QUESTION_BANK",
        resourceId: e.questionId,
        metadata: {
          description: `Reported question resolved in bank: "${e.bankTitle}"`,
          resolutionNote: e.resolutionNote,
        },
      });
    });
  }
}

export const activityRecorderService = new ActivityRecorderService();

