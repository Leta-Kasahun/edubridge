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

export interface DomainEventMap {
  "teacher.assigned": TeacherAssignedEvent;
  "teacher.reassigned": TeacherReassignedEvent;
  "teacher.assignment_ended": TeacherAssignmentEndedEvent;
  "question_bank.published": QuestionBankPublishedEvent;
  "learning_content.published": LearningContentPublishedEvent;
  "student.enrolled": StudentEnrolledEvent;
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
