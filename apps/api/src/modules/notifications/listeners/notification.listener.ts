import {
  domainEventBus,
  TeacherAssignedEvent,
  TeacherReassignedEvent,
  TeacherAssignmentEndedEvent,
  QuestionBankPublishedEvent,
  LearningContentPublishedEvent,
  StudentEnrolledEvent,
} from "../../../shared/events/domain-events.js";
import { prisma, runWithoutTenant } from "../../../lib/prisma.js";
import { notificationService } from "../services/notification.service.js";

async function handleTeacherAssigned(event: TeacherAssignedEvent): Promise<void> {
  const teacher = await runWithoutTenant(() =>
    prisma.teacherProfile.findFirst({
      where: { id: event.teacherId, tenantId: event.tenantId },
      select: { userId: true, firstName: true, lastName: true },
    })
  );

  const sections = await runWithoutTenant(() =>
    prisma.section.findMany({
      where: { id: { in: event.sectionIds }, tenantId: event.tenantId },
      include: { grade: true },
    })
  );

  let subjectName = "";
  if (event.subjectId) {
    const subject = await runWithoutTenant(() =>
      prisma.subject.findFirst({
        where: { id: event.subjectId! },
        select: { name: true },
      })
    );
    if (subject) subjectName = ` (${subject.name})`;
  }

  const sectionNames = sections
    .map((s) => `Grade ${s.grade.level} - ${s.name}`)
    .join(", ");
  const teacherFullName = teacher
    ? `${teacher.firstName} ${teacher.lastName}`
    : "Teacher";
  const roleText =
    event.role === "HOMEROOM_TEACHER"
      ? "Homeroom Teacher"
      : "Subject Teacher";

  if (event.actorUserId) {
    await notificationService.sendToUser({
      tenantId: event.tenantId,
      userId: event.actorUserId,
      category: "TEACHER",
      priority: "NORMAL",
      title: "Teacher Assignment Confirmed",
      body: `${teacherFullName} was successfully assigned as ${roleText}${subjectName} for ${sectionNames}.`,
      actionUrl: "/dashboard/academic/assignments/teachers",
      sourceType: "TEACHER_ASSIGNMENT",
      sourceId: event.assignmentId,
    });
  }

  if (teacher?.userId && teacher.userId !== event.actorUserId) {
    await notificationService.sendToUser({
      tenantId: event.tenantId,
      userId: teacher.userId,
      category: "TEACHER",
      priority: "HIGH",
      title: `New Class Assignment: ${roleText}`,
      body: `You have been assigned as ${roleText}${subjectName} for ${sectionNames}.`,
      actionUrl: "/dashboard/my-class",
      sourceType: "TEACHER_ASSIGNMENT",
      sourceId: event.assignmentId,
    });
  }
}

async function handleTeacherReassigned(
  event: TeacherReassignedEvent
): Promise<void> {
  const [prevTeacher, replacementTeacher, assignment] = await Promise.all([
    runWithoutTenant(() =>
      prisma.teacherProfile.findFirst({
        where: { id: event.previousTeacherId, tenantId: event.tenantId },
        select: { userId: true, firstName: true, lastName: true },
      })
    ),
    runWithoutTenant(() =>
      prisma.teacherProfile.findFirst({
        where: { id: event.replacementTeacherId, tenantId: event.tenantId },
        select: { userId: true, firstName: true, lastName: true },
      })
    ),
    runWithoutTenant(() =>
      prisma.teacherAssignment.findFirst({
        where: { id: event.assignmentId, tenantId: event.tenantId },
        include: {
          section: { include: { grade: true } },
          subject: true,
        },
      })
    ),
  ]);

  const sectionLabel = assignment?.section
    ? `${assignment.section.name} (Grade ${assignment.section.grade.level})`
    : "Class Section";
  const subjectText = assignment?.subject ? ` (${assignment.subject.name})` : "";
  const replacementName = replacementTeacher
    ? `${replacementTeacher.firstName} ${replacementTeacher.lastName}`
    : "Replacement Teacher";

  if (event.actorUserId) {
    await notificationService.sendToUser({
      tenantId: event.tenantId,
      userId: event.actorUserId,
      category: "TEACHER",
      priority: "NORMAL",
      title: "Teacher Reassignment Confirmed",
      body: `Assignment for ${sectionLabel}${subjectText} was reassigned to ${replacementName}.`,
      actionUrl: "/dashboard/academic/assignments/teachers",
      sourceType: "TEACHER_ASSIGNMENT",
      sourceId: event.assignmentId,
    });
  }

  if (replacementTeacher?.userId && replacementTeacher.userId !== event.actorUserId) {
    await notificationService.sendToUser({
      tenantId: event.tenantId,
      userId: replacementTeacher.userId,
      category: "TEACHER",
      priority: "HIGH",
      title: "Class Assignment Notice",
      body: `You have been reassigned to ${sectionLabel}${subjectText}.`,
      actionUrl: "/dashboard/my-class",
      sourceType: "TEACHER_ASSIGNMENT",
      sourceId: event.assignmentId,
    });
  }

  if (prevTeacher?.userId && prevTeacher.userId !== event.actorUserId) {
    await notificationService.sendToUser({
      tenantId: event.tenantId,
      userId: prevTeacher.userId,
      category: "TEACHER",
      priority: "NORMAL",
      title: "Class Assignment Reassigned",
      body: `Your assignment for ${sectionLabel} has been reassigned.${event.reason ? ` Reason: ${event.reason}` : ""}`,
      actionUrl: "/dashboard/my-class",
      sourceType: "TEACHER_ASSIGNMENT",
      sourceId: event.assignmentId,
    });
  }
}

async function handleTeacherAssignmentEnded(
  event: TeacherAssignmentEndedEvent
): Promise<void> {
  const [teacher, assignment] = await Promise.all([
    runWithoutTenant(() =>
      prisma.teacherProfile.findFirst({
        where: { id: event.teacherId, tenantId: event.tenantId },
        select: { userId: true, firstName: true, lastName: true },
      })
    ),
    runWithoutTenant(() =>
      prisma.teacherAssignment.findFirst({
        where: { id: event.assignmentId, tenantId: event.tenantId },
        include: { section: true },
      })
    ),
  ]);

  const sectionLabel = assignment?.section?.name ?? "Class Section";

  if (event.actorUserId) {
    await notificationService.sendToUser({
      tenantId: event.tenantId,
      userId: event.actorUserId,
      category: "TEACHER",
      priority: "NORMAL",
      title: "Teacher Assignment Ended",
      body: `Assignment for ${sectionLabel} was successfully ended.`,
      actionUrl: "/dashboard/academic/assignments/teachers",
      sourceType: "TEACHER_ASSIGNMENT",
      sourceId: event.assignmentId,
    });
  }

  if (teacher?.userId && teacher.userId !== event.actorUserId) {
    await notificationService.sendToUser({
      tenantId: event.tenantId,
      userId: teacher.userId,
      category: "TEACHER",
      priority: "NORMAL",
      title: "Class Assignment Concluded",
      body: `Your assignment for ${sectionLabel} has concluded.${event.reason ? ` Reason: ${event.reason}` : ""}`,
      actionUrl: "/dashboard/my-class",
      sourceType: "TEACHER_ASSIGNMENT",
      sourceId: event.assignmentId,
    });
  }
}

async function handleQuestionBankPublished(
  event: QuestionBankPublishedEvent
): Promise<void> {
  if (!event.gradeLevel) return;

  const students = await runWithoutTenant(() =>
    prisma.studentProfile.findMany({
      where: {
        tenantId: event.tenantId,
        status: "ACTIVE",
        enrollments: {
          some: {
            status: "ACTIVE",
            section: { grade: { level: event.gradeLevel! } },
          },
        },
      },
      select: { userId: true },
    })
  );

  const subjectText = event.subjectName ? ` (${event.subjectName})` : "";

  for (const s of students) {
    if (s.userId) {
      void notificationService.sendToUser({
        tenantId: event.tenantId,
        userId: s.userId,
        category: "ACADEMIC",
        priority: "NORMAL",
        title: `New Practice Available: ${event.name}`,
        body: `New Grade ${event.gradeLevel} practice questions${subjectText} are now ready for practice.`,
        actionUrl: `/practice/${event.bankId}`,
        sourceType: "QUESTION_BANK",
        sourceId: event.bankId,
      });
    }
  }
}

async function handleLearningContentPublished(
  event: LearningContentPublishedEvent
): Promise<void> {
  if (!event.gradeLevel) return;

  const students = await runWithoutTenant(() =>
    prisma.studentProfile.findMany({
      where: {
        tenantId: event.tenantId,
        status: "ACTIVE",
        enrollments: {
          some: {
            status: "ACTIVE",
            section: { grade: { level: event.gradeLevel! } },
          },
        },
      },
      select: { userId: true },
    })
  );

  for (const s of students) {
    if (s.userId) {
      void notificationService.sendToUser({
        tenantId: event.tenantId,
        userId: s.userId,
        category: "CONTENT",
        priority: "NORMAL",
        title: `New Learning Material: ${event.title}`,
        body: `New Grade ${event.gradeLevel} curriculum study material is now available.`,
        actionUrl: `/learn/${event.contentId}`,
        sourceType: "LEARNING_CONTENT",
        sourceId: event.contentId,
      });
    }
  }
}

async function handleStudentEnrolled(
  event: StudentEnrolledEvent
): Promise<void> {
  const [student, section] = await Promise.all([
    runWithoutTenant(() =>
      prisma.studentProfile.findFirst({
        where: { id: event.studentId, tenantId: event.tenantId },
        select: { userId: true, firstName: true, lastName: true },
      })
    ),
    runWithoutTenant(() =>
      prisma.section.findFirst({
        where: { id: event.sectionId, tenantId: event.tenantId },
        include: { grade: true },
      })
    ),
  ]);

  if (student?.userId) {
    const sectionName = section
      ? `Grade ${section.grade.level} - ${section.name}`
      : "your class";

    await notificationService.sendToUser({
      tenantId: event.tenantId,
      userId: student.userId,
      category: "ACADEMIC",
      priority: "HIGH",
      title: "Class Enrollment Confirmed",
      body: `You have been enrolled in ${sectionName}.`,
      actionUrl: "/dashboard",
      sourceType: "STUDENT_ENROLLMENT",
      sourceId: event.sectionId,
    });
  }
}

export function registerNotificationListeners(): void {
  domainEventBus.onEvent("teacher.assigned", handleTeacherAssigned);
  domainEventBus.onEvent("teacher.reassigned", handleTeacherReassigned);
  domainEventBus.onEvent("teacher.assignment_ended", handleTeacherAssignmentEnded);
  domainEventBus.onEvent("question_bank.published", handleQuestionBankPublished);
  domainEventBus.onEvent("learning_content.published", handleLearningContentPublished);
  domainEventBus.onEvent("student.enrolled", handleStudentEnrolled);
}
