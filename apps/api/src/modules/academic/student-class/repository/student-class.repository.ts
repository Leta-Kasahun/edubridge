import { prisma } from "../../../../lib/prisma.js";
import { StudentMyClassResponse } from "../types/student-class.types.js";

export class StudentClassRepository {
  async findStudentClass(
    tenantId: string,
    userId: string
  ): Promise<StudentMyClassResponse> {
    const student = await prisma.studentProfile.findFirst({
      where: { tenantId, userId },
      select: { id: true },
    });

    if (!student) {
      return {
        section: null,
        homeroomTeacher: null,
        subjectTeachers: [],
      };
    }

    const activeEnrollment = await prisma.studentEnrollment.findFirst({
      where: {
        tenantId,
        studentId: student.id,
        status: "ACTIVE",
      },
      include: {
        section: {
          include: {
            grade: true,
          },
        },
        academicYear: true,
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });

    if (!activeEnrollment) {
      return {
        section: null,
        homeroomTeacher: null,
        subjectTeachers: [],
      };
    }

    const teacherAssignments = await prisma.teacherAssignment.findMany({
      where: {
        tenantId,
        sectionId: activeEnrollment.sectionId,
        academicYearId: activeEnrollment.academicYearId,
        status: "ACTIVE",
      },
      include: {
        teacher: {
          select: {
            firstName: true,
            middleName: true,
            lastName: true,
            photoUrl: true,
          },
        },
        subject: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    const homeroomAssignment = teacherAssignments.find(
      (a) => a.role === "HOMEROOM_TEACHER"
    );
    const subjectAssignments = teacherAssignments.filter(
      (a) => a.role === "SUBJECT_TEACHER"
    );

    return {
      section: {
        id: activeEnrollment.section.id,
        name: activeEnrollment.section.name,
        code: activeEnrollment.section.code,
        gradeLevel: activeEnrollment.section.grade.level,
        gradeName: `Grade ${activeEnrollment.section.grade.level}`,
        academicYearName: activeEnrollment.academicYear.name,
      },
      homeroomTeacher: homeroomAssignment
        ? {
            fullName: [
              homeroomAssignment.teacher.firstName,
              homeroomAssignment.teacher.middleName,
              homeroomAssignment.teacher.lastName,
            ]
              .filter(Boolean)
              .join(" "),
            photoUrl: homeroomAssignment.teacher.photoUrl,
          }
        : null,
      subjectTeachers: subjectAssignments.map((sa) => ({
        subjectName: sa.subject?.name ?? "General",
        subjectCode: sa.subject?.code ?? "",
        teacherFullName: [
          sa.teacher.firstName,
          sa.teacher.middleName,
          sa.teacher.lastName,
        ]
          .filter(Boolean)
          .join(" "),
        photoUrl: sa.teacher.photoUrl,
      })),
    };
  }
}

export const studentClassRepository = new StudentClassRepository();
