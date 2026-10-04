import { EventEmitter } from "events";

export interface TeacherAssignedEvent {
  tenantId: string;
  teacherId: string;
  sectionIds: string[];
  subjectId?: string | null;
  role: string;
  actorUserId?: string;
  assignmentId: string;
}

export interface TeacherReassignedEvent {
  tenantId: string;
  previousTeacherId: string;
  replacementTeacherId: string;
  assignmentId: string;
  reason?: string | null;
  actorUserId?: string;
}

export interface TeacherAssignmentEndedEvent {
  tenantId: string;
  teacherId: string;
  assignmentId: string;
  reason?: string | null;
  actorUserId?: string;
}

export interface QuestionBankPublishedEvent {
  tenantId: string;
  bankId: string;
  name: string;
  gradeLevel?: number | null;
  subjectName?: string | null;
  actorUserId?: string;
}

export interface LearningContentPublishedEvent {
  tenantId: string;
  contentId: string;
  title: string;
  subjectName?: string | null;
  gradeLevel?: number | null;
  actorUserId?: string;
}

export interface StudentEnrolledEvent {
  tenantId: string;
  studentId: string;
  sectionId: string;
  academicYearId: string;
  actorUserId?: string;
}

export interface AssessmentGradedEvent {
  tenantId: string;
  assessmentId: string;
  assessmentTitle: string;
  attemptId: string;
  studentUserId: string;
  teacherName?: string | null;
  percentage: number;
  isManual: boolean;
  hasFeedback?: boolean;
  feedbackSnippet?: string | null;
}

export interface AssessmentAssignedEvent {
  tenantId: string;
  assessmentId: string;
  assessmentTitle: string;
  sectionIds: string[];
  availableUntil?: string | null;
}

export interface PasswordResetByAdminEvent {
  tenantId: string;
  targetUserId: string;
}

export interface PasswordChangedSelfEvent {
  tenantId: string;
  userId: string;
}

export interface StudentStatusChangedEvent {
  tenantId: string;
  studentUserId: string;
  newStatus: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

export interface TeacherStatusChangedEvent {
  tenantId: string;
  teacherUserId: string;
  newStatus: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

export interface StudentPromotionCommittedEvent {
  tenantId: string;
  studentId: string;
  targetAcademicYearName: string;
  targetGradeLevel: number;
  isPromoted: boolean;
}

export interface StudentWithdrawnEvent {
  tenantId: string;
  studentId: string;
}

export interface QuestionReportSubmittedEvent {
  tenantId: string;
  questionId: string;
  bankId: string;
  bankTitle: string;
  studentUserId: string;
  studentName: string;
  authorUserId: string;
  reason?: string;
  comment?: string;
}

export interface QuestionReportResolvedEvent {
  tenantId: string;
  questionId: string;
  bankId: string;
  bankTitle: string;
  studentUserId: string;
  resolvedByUserId: string;
  resolutionNote?: string;
}

export interface DomainEventMap {
  "teacher.assigned": TeacherAssignedEvent;
  "teacher.reassigned": TeacherReassignedEvent;
  "teacher.assignment_ended": TeacherAssignmentEndedEvent;
  "question_bank.published": QuestionBankPublishedEvent;
  "learning_content.published": LearningContentPublishedEvent;
  "student.enrolled": StudentEnrolledEvent;
  "assessment.graded": AssessmentGradedEvent;
  "assessment.assigned": AssessmentAssignedEvent;
  "auth.password_reset_by_admin": PasswordResetByAdminEvent;
  "auth.password_changed_self": PasswordChangedSelfEvent;
  "student.status_changed": StudentStatusChangedEvent;
  "teacher.status_changed": TeacherStatusChangedEvent;
  "student.promotion_committed": StudentPromotionCommittedEvent;
  "student.withdrawn": StudentWithdrawnEvent;
  "question.report_submitted": QuestionReportSubmittedEvent;
  "question.report_resolved": QuestionReportResolvedEvent;
}

export class DomainEventBus extends EventEmitter {
  emitEvent<K extends keyof DomainEventMap>(
    event: K,
    payload: DomainEventMap[K]
  ): boolean {
    return this.emit(event, payload);
  }

  onEvent<K extends keyof DomainEventMap>(
    event: K,
    listener: (payload: DomainEventMap[K]) => void | Promise<void>
  ): this {
    return this.on(event, (payload: DomainEventMap[K]) => {
      void Promise.resolve(listener(payload)).catch(() => {});
    });
  }
}

export const domainEventBus = new DomainEventBus();
