import { prisma } from "../../../lib/prisma.js";
import { Prisma } from "../../../generated/prisma/client.js";
import { computeMasteryLevel } from "../../../shared/utils/mastery.util.js";
import {
  SectionMasteryMatrixResponse,
  SingleStudentMasteryResponse,
  TopicMasteryHistoryItem,
  RecordPracticeEvidenceDto,
  MasteryOverviewResponse,
  MasteryOverviewItem,
} from "../types/mastery.types.js";
import {
  MasteryLevelEnum,
  EvidenceSourceTypeEnum,
} from "../../../shared/constants/assessment.constants.js";
import { NotFoundError } from "../../../shared/exceptions/not-found-error.js";

type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export class MasteryRepository {
  /**
   * Retrieves the matrix of all students in a section mapped against the curriculum topics of a subject
   */
  async getSectionMasteryMatrix(
    tenantId: string,
    sectionId: string,
    subjectId?: string
  ): Promise<SectionMasteryMatrixResponse> {
    const section = await prisma.section.findFirst({
      where: { id: sectionId, tenantId },
      include: {
        grade: true,
        academicYear: true,
        enrollments: {
          where: { status: "ACTIVE" },
          include: {
            student: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!section) {
      throw new NotFoundError("Section not found in this institution.");
    }

    let matchingCurriculumSubjects: Array<{
      subject: { id: string; name: string; code: string };
      units: Array<{
        id: string;
        code: string;
        title: string;
        topics: Array<{
          id: string;
          code: string;
          title: string;
          orderIndex: number;
          objectives: Array<{
            id: string;
            code: string;
            statement: string;
            description?: string | null;
            orderIndex: number;
          }>;
        }>;
      }>;
    }> = [];

    if (subjectId) {
      matchingCurriculumSubjects = await prisma.curriculumSubject.findMany({
        where: {
          gradeId: section.gradeId,
          subjectId,
        },
        include: {
          subject: true,
          units: {
            orderBy: { orderIndex: "asc" },
            include: {
              topics: {
                orderBy: { orderIndex: "asc" },
                include: {
                  objectives: {
                    orderBy: { orderIndex: "asc" },
                  },
                },
              },
            },
          },
        },
      });

      if (matchingCurriculumSubjects.length === 0) {
        matchingCurriculumSubjects = await prisma.curriculumSubject.findMany({
          where: {
            subjectId,
            curriculumVersion: { curriculum: { tenantId } },
          },
          include: {
            subject: true,
            units: {
              orderBy: { orderIndex: "asc" },
              include: {
                topics: {
                  orderBy: { orderIndex: "asc" },
                  include: {
                    objectives: {
                      orderBy: { orderIndex: "asc" },
                    },
                  },
                },
              },
            },
          },
        });
      }
    } else {
      const gradeCS = await prisma.curriculumSubject.findMany({
        where: {
          gradeId: section.gradeId,
        },
        include: {
          subject: true,
          units: {
            orderBy: { orderIndex: "asc" },
            include: {
              topics: {
                orderBy: { orderIndex: "asc" },
                include: {
                  objectives: {
                    orderBy: { orderIndex: "asc" },
                  },
                },
              },
            },
          },
        },
      });

      const tenantCS = await prisma.curriculumSubject.findMany({
        where: {
          curriculumVersion: { curriculum: { tenantId } },
        },
        include: {
          subject: true,
          units: {
            orderBy: { orderIndex: "asc" },
            include: {
              topics: {
                orderBy: { orderIndex: "asc" },
                include: {
                  objectives: {
                    orderBy: { orderIndex: "asc" },
                  },
                },
              },
            },
          },
        },
      });

      const combinedCS = [...gradeCS, ...tenantCS];
      const uniqueCSMap = new Map<string, (typeof combinedCS)[0]>();
      for (const cs of combinedCS) {
        if (!uniqueCSMap.has(cs.subject.id)) {
          uniqueCSMap.set(cs.subject.id, cs);
        } else {
          const existing = uniqueCSMap.get(cs.subject.id)!;
          const existingCount = existing.units.reduce((sum, u) => sum + u.topics.length, 0);
          const newCount = cs.units.reduce((sum, u) => sum + u.topics.length, 0);
          if (newCount > existingCount) {
            uniqueCSMap.set(cs.subject.id, cs);
          }
        }
      }
      matchingCurriculumSubjects = Array.from(uniqueCSMap.values());
    }

    const activeStudents = section.enrollments.map((e) => e.student);

    if (matchingCurriculumSubjects.length === 0) {
      let subjectMeta = { id: subjectId || "", name: "All Subjects", code: "ALL" };
      if (subjectId) {
        const sub = await prisma.subject.findFirst({ where: { id: subjectId } });
        if (sub) {
          subjectMeta = { id: sub.id, name: sub.name, code: sub.code };
        }
      }

      return {
        section: {
          id: section.id,
          name: section.name,
          gradeLevel: section.grade.level,
        },
        subject: subjectMeta,
        topics: [],
        students: activeStudents.map((student) => {
          const studentName = student.user
            ? `${student.user.firstName} ${student.user.lastName}`
            : `${student.firstName} ${student.middleName ? student.middleName + " " : ""}${student.lastName || ""}`.trim() || "Student";
          return {
            studentId: student.id,
            studentName,
            rollNumber: student.studentCode ?? null,
            topics: {},
            overallAccuracy: null,
            masteredTopicCount: 0,
          };
        }),
        summary: {
          totalStudents: activeStudents.length,
          totalTopics: 0,
          classAverageAccuracy: null,
          masteryDistribution: {
            NOT_STARTED: 0,
            DEVELOPING: 0,
            PROFICIENT: 0,
            MASTERED: 0,
          },
        },
      };
    }

    const firstSubject = matchingCurriculumSubjects[0];
    const primarySubject =
      subjectId && matchingCurriculumSubjects.length === 1 && firstSubject
        ? {
          id: firstSubject.subject.id,
          name: firstSubject.subject.name,
          code: firstSubject.subject.code,
        }
        : { id: "ALL", name: "All Subjects", code: "ALL" };

    const topics = matchingCurriculumSubjects.flatMap((cs) =>
      cs.units.flatMap((unit) =>
        unit.topics.map((t) => ({
          id: t.id,
          code: t.code,
          title: t.title,
          unitId: unit.id,
          unitCode: unit.code,
          unitTitle:
            matchingCurriculumSubjects.length > 1
              ? `${cs.subject.name} - ${unit.title}`
              : unit.title,
          orderIndex: t.orderIndex,
          objectives: t.objectives.map((o) => ({
            id: o.id,
            code: o.code,
            statement: o.statement,
            description: o.description,
            orderIndex: o.orderIndex,
          })),
        }))
      )
    );

    const studentIdsSet = new Set<string>();
    for (const s of activeStudents) {
      studentIdsSet.add(s.id);
      if (s.userId) studentIdsSet.add(s.userId);
    }
    const studentQueryIds = Array.from(studentIdsSet);
    const topicIds = topics.map((t) => t.id);

    const performances =
      studentQueryIds.length > 0 && topicIds.length > 0
        ? await prisma.studentTopicPerformance.findMany({
          where: {
            tenantId,
            studentId: { in: studentQueryIds },
            topicId: { in: topicIds },
          },
        })
        : [];

    const masteries =
      studentQueryIds.length > 0 && topicIds.length > 0
        ? await prisma.studentTopicMastery.findMany({
          where: {
            tenantId,
            studentId: { in: studentQueryIds },
            topicId: { in: topicIds },
          },
        })
        : [];

    const perfMap = new Map<string, (typeof performances)[0]>();
    for (const p of performances) {
      perfMap.set(`${p.studentId}_${p.topicId}`, p);
    }

    const masteryMap = new Map<string, (typeof masteries)[0]>();
    for (const m of masteries) {
      masteryMap.set(`${m.studentId}_${m.topicId}`, m);
    }

    const distribution: Record<MasteryLevelEnum, number> = {
      NOT_STARTED: 0,
      DEVELOPING: 0,
      PROFICIENT: 0,
      MASTERED: 0,
    };

    let totalClassAccuracy = 0;
    let attemptedStudentsCount = 0;

    const matrixStudents = activeStudents.map((student) => {
      const studentTopics: Record<
        string,
        {
          level: MasteryLevelEnum;
          accuracy: number | null;
          questionCount: number;
          correctCount: number;
        }
      > = {};

      let studentPointsSum = 0;
      let studentTopicsWithScore = 0;
      let masteredCount = 0;

      for (const topic of topics) {
        const perf =
          perfMap.get(`${student.id}_${topic.id}`) ||
          (student.userId ? perfMap.get(`${student.userId}_${topic.id}`) : undefined);
        const mast =
          masteryMap.get(`${student.id}_${topic.id}`) ||
          (student.userId ? masteryMap.get(`${student.userId}_${topic.id}`) : undefined);

        const level = (mast?.level as MasteryLevelEnum) ?? "NOT_STARTED";
        const accuracy = perf?.accuracy ? Number(perf.accuracy) : null;
        const qCount = perf?.questionCount ?? 0;
        const cCount = perf?.correctCount ?? 0;

        studentTopics[topic.id] = {
          level,
          accuracy,
          questionCount: qCount,
          correctCount: cCount,
        };

        distribution[level] = (distribution[level] || 0) + 1;

        if (accuracy !== null) {
          studentPointsSum += accuracy;
          studentTopicsWithScore += 1;
        }

        if (level === "MASTERED") {
          masteredCount += 1;
        }
      }

      const overallAccuracy =
        studentTopicsWithScore > 0
          ? Math.round(studentPointsSum / studentTopicsWithScore)
          : null;

      if (overallAccuracy !== null) {
        totalClassAccuracy += overallAccuracy;
        attemptedStudentsCount += 1;
      }

      const studentName = student.user
        ? `${student.user.firstName} ${student.user.lastName}`
        : `${student.firstName} ${student.middleName ? student.middleName + " " : ""}${student.lastName || ""}`.trim() || "Student";

      return {
        studentId: student.id,
        studentName,
        rollNumber: student.studentCode ?? null,
        topics: studentTopics,
        overallAccuracy,
        masteredTopicCount: masteredCount,
      };
    });

    const classAverageAccuracy =
      attemptedStudentsCount > 0
        ? Math.round(totalClassAccuracy / attemptedStudentsCount)
        : null;

    return {
      section: {
        id: section.id,
        name: section.name,
        gradeLevel: section.grade.level,
      },
      subject: primarySubject,
      topics,
      students: matrixStudents,
      summary: {
        totalStudents: activeStudents.length,
        totalTopics: topics.length,
        classAverageAccuracy,
        masteryDistribution: distribution,
      },
    };
  }

  /**
   * Retrieves an individual student's mastery profile across all subjects and topics
   */
  async getStudentMastery(
    tenantId: string,
    studentId: string,
    subjectId?: string
  ): Promise<SingleStudentMasteryResponse> {
    const student = await prisma.studentProfile.findFirst({
      where: {
        tenantId,
        OR: [
          { id: studentId },
          { userId: studentId },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        enrollments: {
          where: { status: "ACTIVE" },
          include: {
            section: {
              include: {
                grade: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundError("Student profile not found.");
    }

    const activeEnrollment = student.enrollments[0];
    let gradeId = activeEnrollment?.section?.gradeId;

    if (!gradeId) {
      const anyEnrollment = await prisma.studentEnrollment.findFirst({
        where: { studentId: student.id },
        include: { section: true },
      });
      if (anyEnrollment?.section?.gradeId) {
        gradeId = anyEnrollment.section.gradeId;
      }
    }

    if (!gradeId) {
      const anyGrade = await prisma.grade.findFirst({
        where: { tenantId },
      });
      if (anyGrade) {
        gradeId = anyGrade.id;
      }
    }

    const curriculumSubjects = gradeId
      ? await prisma.curriculumSubject.findMany({
        where: {
          gradeId,
          ...(subjectId ? { subjectId } : {}),
        },
        include: {
          subject: true,
          units: {
            orderBy: { orderIndex: "asc" },
            include: {
              topics: {
                orderBy: { orderIndex: "asc" },
              },
            },
          },
        },
      })
      : [];

    const tenantCurriculumSubjects = await prisma.curriculumSubject.findMany({
      where: {
        curriculumVersion: { curriculum: { tenantId } },
        ...(subjectId ? { subjectId } : {}),
      },
      include: {
        subject: true,
        units: {
          orderBy: { orderIndex: "asc" },
          include: {
            topics: {
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
    });

    const combinedCurriculumSubjects = [...curriculumSubjects, ...tenantCurriculumSubjects];
    const uniqueCurriculumSubjectsMap = new Map<string, (typeof combinedCurriculumSubjects)[0]>();
    for (const cs of combinedCurriculumSubjects) {
      if (!uniqueCurriculumSubjectsMap.has(cs.subject.id)) {
        uniqueCurriculumSubjectsMap.set(cs.subject.id, cs);
      } else {
        const existing = uniqueCurriculumSubjectsMap.get(cs.subject.id)!;
        const existingTopicCount = existing.units.reduce((sum, u) => sum + u.topics.length, 0);
        const newTopicCount = cs.units.reduce((sum, u) => sum + u.topics.length, 0);
        if (newTopicCount > existingTopicCount) {
          uniqueCurriculumSubjectsMap.set(cs.subject.id, cs);
        }
      }
    }

    const targetStudentIds = [student.id, student.userId].filter(Boolean) as string[];

    const studentPerformances = await prisma.studentTopicPerformance.findMany({
      where: {
        tenantId,
        studentId: { in: targetStudentIds },
      },
      select: {
        topicId: true,
      },
    });

    const performedTopicIds = studentPerformances.map((p) => p.topicId);
    if (performedTopicIds.length > 0) {
      const extraSubjects = await prisma.curriculumSubject.findMany({
        where: {
          units: {
            some: {
              topics: {
                some: {
                  id: { in: performedTopicIds },
                },
              },
            },
          },
        },
        include: {
          subject: true,
          units: {
            orderBy: { orderIndex: "asc" },
            include: {
              topics: {
                orderBy: { orderIndex: "asc" },
              },
            },
          },
        },
      });

      for (const es of extraSubjects) {
        if (!uniqueCurriculumSubjectsMap.has(es.subject.id)) {
          uniqueCurriculumSubjectsMap.set(es.subject.id, es);
        }
      }
    }

    const uniqueCurriculumSubjects = Array.from(uniqueCurriculumSubjectsMap.values());

    const allTopicIds = uniqueCurriculumSubjects.flatMap((cs) =>
      cs.units.flatMap((u) => u.topics.map((t) => t.id))
    );

    const performances =
      allTopicIds.length > 0
        ? await prisma.studentTopicPerformance.findMany({
          where: {
            tenantId,
            studentId: { in: targetStudentIds },
            topicId: { in: allTopicIds },
          },
        })
        : [];

    const masteries =
      allTopicIds.length > 0
        ? await prisma.studentTopicMastery.findMany({
          where: {
            tenantId,
            studentId: { in: targetStudentIds },
            topicId: { in: allTopicIds },
          },
        })
        : [];

    const perfMap = new Map<string, (typeof performances)[0]>();
    for (const p of performances) {
      const existing = perfMap.get(p.topicId);
      if (!existing || (p.questionCount ?? 0) > (existing.questionCount ?? 0)) {
        perfMap.set(p.topicId, p);
      }
    }

    const mastMap = new Map<string, (typeof masteries)[0]>();
    for (const m of masteries) {
      mastMap.set(m.topicId, m);
    }

    const subjects = uniqueCurriculumSubjects.map((cs) => {
      let subjectScoreSum = 0;
      let scoredTopicsCount = 0;
      let masteredCount = 0;
      let totalTopicCount = 0;

      const units = cs.units.map((unit) => {
        const topics = unit.topics.map((t) => {
          totalTopicCount += 1;
          const perf = perfMap.get(t.id);
          const mast = mastMap.get(t.id);

          const level = (mast?.level as MasteryLevelEnum) ?? "NOT_STARTED";
          const accuracy = perf?.accuracy ? Number(perf.accuracy) : null;
          const qCount = perf?.questionCount ?? 0;
          const cCount = perf?.correctCount ?? 0;

          if (accuracy !== null) {
            subjectScoreSum += accuracy;
            scoredTopicsCount += 1;
          }
          if (level === "MASTERED") {
            masteredCount += 1;
          }

          return {
            topicId: t.id,
            topicCode: t.code,
            topicTitle: t.title,
            unitId: unit.id,
            unitCode: unit.code,
            unitTitle: unit.title,
            level,
            accuracy,
            questionCount: qCount,
            correctCount: cCount,
            lastObservedAt: perf?.lastObservedAt ?? null,
          };
        });

        return {
          unitId: unit.id,
          unitCode: unit.code,
          unitTitle: unit.title,
          topics,
        };
      });

      const overallAccuracy =
        scoredTopicsCount > 0
          ? Math.round(subjectScoreSum / scoredTopicsCount)
          : null;

      return {
        subjectId: cs.subject.id,
        subjectName: cs.subject.name,
        subjectCode: cs.subject.code,
        overallAccuracy,
        totalTopics: totalTopicCount,
        masteredCount,
        units,
      };
    });

    const activeSection = student.enrollments[0]?.section;

    const studentFullName = student.user
      ? `${student.user.firstName} ${student.user.lastName}`
      : `${student.firstName} ${student.middleName ? student.middleName + " " : ""}${student.lastName || ""}`.trim() || "Student";

    return {
      student: {
        id: student.id,
        name: studentFullName,
        rollNumber: student.studentCode ?? null,
        gradeLevel: activeSection?.grade?.level ?? 1,
        sectionName: activeSection?.name ?? null,
      },
      subjects,
    };
  }

  /**
   * Retrieves chronological audit history of mastery recalculations for a student & topic
   */
  async getTopicMasteryHistory(
    tenantId: string,
    studentId: string,
    topicId: string
  ): Promise<TopicMasteryHistoryItem[]> {
    const history = await prisma.masteryHistory.findMany({
      where: {
        tenantId,
        studentId,
        topicId,
      },
      orderBy: {
        calculatedAt: "desc",
      },
      take: 50,
    });

    return history.map((h) => ({
      id: h.id,
      level: h.level as MasteryLevelEnum,
      masteryScore: h.masteryScore ? Number(h.masteryScore) : null,
      evidenceCount: h.evidenceCount,
      calculatedAt: h.calculatedAt,
      calculationVersion: h.calculationVersion,
    }));
  }

  async getMasteryOverview(
    tenantId: string,
    userId: string,
    roles: string[]
  ): Promise<MasteryOverviewResponse> {
    if (roles.includes("SYSTEM_ADMIN") || roles.includes("SCHOOL_ADMIN")) {
      return this.getSchoolMasteryOverview(tenantId);
    }
    if (roles.includes("TEACHER")) {
      return this.getTeacherMasteryOverview(tenantId, userId);
    }
    return this.getStudentMasteryOverview(tenantId, userId);
  }

  async getSchoolMasteryOverview(tenantId: string): Promise<MasteryOverviewResponse> {
    const grades = await prisma.grade.findMany({
      where: { tenantId, isActive: true },
      orderBy: { level: "asc" },
      include: {
        sections: {
          where: { status: "ACTIVE" },
          include: {
            enrollments: {
              where: { status: "ACTIVE" },
              include: {
                student: {
                  select: { id: true, userId: true },
                },
              },
            },
          },
        },
      },
    });

    const allStudentIds: string[] = [];
    for (const g of grades) {
      for (const sec of g.sections) {
        for (const en of sec.enrollments) {
          if (en.student?.id) allStudentIds.push(en.student.id);
          if (en.student?.userId) allStudentIds.push(en.student.userId);
        }
      }
    }

    const performances =
      allStudentIds.length > 0
        ? await prisma.studentTopicPerformance.findMany({
          where: {
            tenantId,
            studentId: { in: allStudentIds },
          },
          select: {
            studentId: true,
            accuracy: true,
          },
        })
        : [];

    const studentPerfMap = new Map<string, Array<{ accuracy: number }>>();
    for (const p of performances) {
      const acc = p.accuracy ? Number(p.accuracy) : 0;
      const item = { accuracy: acc };
      const existing = studentPerfMap.get(p.studentId);
      if (existing) {
        existing.push(item);
      } else {
        studentPerfMap.set(p.studentId, [item]);
      }
    }

    let totalSchoolPoints = 0;
    let totalSchoolEvaluatedStudents = 0;
    let schoolMasteredStudents = 0;
    let schoolDoingWellStudents = 0;
    let schoolNeedsPracticeStudents = 0;
    let schoolNotStartedStudents = 0;
    const uniqueStudentIdsEnrolled = new Set<string>();

    const breakdown: MasteryOverviewItem[] = [];

    for (const grade of grades) {
      let gradePointsSum = 0;
      let gradeStudentsEvaluated = 0;
      const gradeStudentsSet = new Set<string>();

      for (const sec of grade.sections) {
        for (const en of sec.enrollments) {
          if (!en.student) continue;
          const sId = en.student.id;
          if (gradeStudentsSet.has(sId)) continue;
          gradeStudentsSet.add(sId);
          uniqueStudentIdsEnrolled.add(sId);

          const perfs = [
            ...(studentPerfMap.get(en.student.id) || []),
            ...(en.student.userId ? studentPerfMap.get(en.student.userId) || [] : []),
          ];

          if (perfs.length > 0) {
            const studentAvg = Math.round(
              perfs.reduce((sum, p) => sum + p.accuracy, 0) / perfs.length
            );
            gradePointsSum += studentAvg;
            gradeStudentsEvaluated += 1;
            totalSchoolPoints += studentAvg;
            totalSchoolEvaluatedStudents += 1;

            if (studentAvg >= 80) schoolMasteredStudents += 1;
            else if (studentAvg >= 65) schoolDoingWellStudents += 1;
            else schoolNeedsPracticeStudents += 1;
          } else {
            schoolNotStartedStudents += 1;
          }
        }
      }

      const gradeAvgAccuracy =
        gradeStudentsEvaluated > 0
          ? Math.round(gradePointsSum / gradeStudentsEvaluated)
          : null;

      let status: MasteryOverviewItem["status"] = "Not Started";
      if (gradeAvgAccuracy !== null) {
        if (gradeAvgAccuracy >= 80) status = "Mastered";
        else if (gradeAvgAccuracy >= 65) status = "Doing Well";
        else if (gradeAvgAccuracy >= 40) status = "Needs Practice";
        else status = "Learning";
      }

      const totalSections = grade.sections.length;
      const totalStudents = gradeStudentsSet.size;

      breakdown.push({
        id: grade.id,
        name: `Grade ${grade.level}`,
        subtitle: `${totalSections} ${totalSections === 1 ? "section" : "sections"} • ${totalStudents} ${totalStudents === 1 ? "student" : "students"}`,
        progress: gradeAvgAccuracy ?? 0,
        status,
      });
    }

    const totalStudents = uniqueStudentIdsEnrolled.size;
    const overallAccuracy =
      totalSchoolEvaluatedStudents > 0
        ? Math.round(totalSchoolPoints / totalSchoolEvaluatedStudents)
        : null;

    return {
      totalStudents,
      overallAccuracy,
      stats: {
        mastered: schoolMasteredStudents,
        doingWell: schoolDoingWellStudents,
        needsPractice: schoolNeedsPracticeStudents,
        notStarted: schoolNotStartedStudents,
        proficient: schoolDoingWellStudents,
        developing: schoolNeedsPracticeStudents,
        inProgress: schoolNotStartedStudents,
      },
      breakdown,
    };
  }

  async getTeacherMasteryOverview(
    tenantId: string,
    userId: string
  ): Promise<MasteryOverviewResponse> {
    const assignments = await prisma.teacherAssignment.findMany({
      where: {
        tenantId,
        status: "ACTIVE",
        teacher: {
          OR: [{ userId }, { id: userId }],
        },
      },
      include: {
        subject: true,
        section: {
          include: {
            grade: true,
            enrollments: {
              where: { status: "ACTIVE" },
              include: {
                student: {
                  select: { id: true, userId: true },
                },
              },
            },
          },
        },
      },
    });

    if (assignments.length === 0) {
      return {
        totalStudents: 0,
        overallAccuracy: null,
        stats: {
          mastered: 0,
          doingWell: 0,
          needsPractice: 0,
          notStarted: 0,
          proficient: 0,
          developing: 0,
          inProgress: 0,
        },
        breakdown: [],
      };
    }

    const subjectMap = new Map<
      string,
      {
        subject: { id: string; name: string; code: string };
        sections: Map<
          string,
          {
            id: string;
            students: Set<string>;
            studentUserIds: Set<string>;
          }
        >;
      }
    >();

    const allTeacherStudents = new Set<string>();
    const allTeacherStudentUserIds = new Set<string>();

    for (const a of assignments) {
      if (!a.subject || !a.section) continue;
      if (!subjectMap.has(a.subject.id)) {
        subjectMap.set(a.subject.id, {
          subject: a.subject,
          sections: new Map(),
        });
      }
      const subEntry = subjectMap.get(a.subject.id)!;
      if (!subEntry.sections.has(a.section.id)) {
        subEntry.sections.set(a.section.id, {
          id: a.section.id,
          students: new Set(),
          studentUserIds: new Set(),
        });
      }
      const secEntry = subEntry.sections.get(a.section.id)!;
      for (const en of a.section.enrollments) {
        if (!en.student) continue;
        secEntry.students.add(en.student.id);
        allTeacherStudents.add(en.student.id);
        if (en.student.userId) {
          secEntry.studentUserIds.add(en.student.userId);
          allTeacherStudentUserIds.add(en.student.userId);
        }
      }
    }

    const queryStudentIds = [
      ...Array.from(allTeacherStudents),
      ...Array.from(allTeacherStudentUserIds),
    ];

    const performances =
      queryStudentIds.length > 0
        ? await prisma.studentTopicPerformance.findMany({
          where: {
            tenantId,
            studentId: { in: queryStudentIds },
          },
          include: {
            topic: {
              include: {
                unit: {
                  select: {
                    curriculumSubject: {
                      select: { subjectId: true },
                    },
                  },
                },
              },
            },
          },
        })
        : [];

    const studentSubjectPerfMap = new Map<string, Array<{ accuracy: number }>>();
    for (const p of performances) {
      const sId = p.topic?.unit?.curriculumSubject?.subjectId;
      if (!sId) continue;
      const acc = p.accuracy ? Number(p.accuracy) : 0;
      const item = { accuracy: acc };
      const key = `${p.studentId}_${sId}`;
      const existing = studentSubjectPerfMap.get(key);
      if (existing) {
        existing.push(item);
      } else {
        studentSubjectPerfMap.set(key, [item]);
      }
    }

    let totalTeacherPoints = 0;
    let totalTeacherEvaluatedStudents = 0;
    let teacherMastered = 0;
    let teacherDoingWell = 0;
    let teacherNeedsPractice = 0;

    const evaluatedTeacherStudentsSet = new Set<string>();
    const breakdown: MasteryOverviewItem[] = [];

    for (const { subject, sections } of subjectMap.values()) {
      let subjectPointsSum = 0;
      let subjectStudentsEvaluated = 0;
      const subjectStudentsSet = new Set<string>();

      for (const sec of sections.values()) {
        for (const sId of sec.students) {
          if (subjectStudentsSet.has(sId)) continue;
          subjectStudentsSet.add(sId);

          const perfs = studentSubjectPerfMap.get(`${sId}_${subject.id}`) || [];

          if (perfs.length > 0) {
            const studentSubAvg = Math.round(
              perfs.reduce((sum, p) => sum + p.accuracy, 0) / perfs.length
            );
            subjectPointsSum += studentSubAvg;
            subjectStudentsEvaluated += 1;

            if (!evaluatedTeacherStudentsSet.has(sId)) {
              evaluatedTeacherStudentsSet.add(sId);
              totalTeacherPoints += studentSubAvg;
              totalTeacherEvaluatedStudents += 1;

              if (studentSubAvg >= 80) teacherMastered += 1;
              else if (studentSubAvg >= 65) teacherDoingWell += 1;
              else teacherNeedsPractice += 1;
            }
          }
        }
      }

      const subjectAvgAccuracy =
        subjectStudentsEvaluated > 0
          ? Math.round(subjectPointsSum / subjectStudentsEvaluated)
          : null;

      let status: MasteryOverviewItem["status"] = "Not Started";
      if (subjectAvgAccuracy !== null) {
        if (subjectAvgAccuracy >= 80) status = "Mastered";
        else if (subjectAvgAccuracy >= 65) status = "Doing Well";
        else if (subjectAvgAccuracy >= 40) status = "Needs Practice";
        else status = "Learning";
      }

      const assignedCount = sections.size;

      breakdown.push({
        id: subject.id,
        name: subject.name,
        subtitle: `${assignedCount} ${assignedCount === 1 ? "class" : "classes"} assigned`,
        progress: subjectAvgAccuracy ?? 0,
        status,
      });
    }

    const teacherNotStarted = Math.max(
      0,
      allTeacherStudents.size - evaluatedTeacherStudentsSet.size
    );

    const overallAccuracy =
      totalTeacherEvaluatedStudents > 0
        ? Math.round(totalTeacherPoints / totalTeacherEvaluatedStudents)
        : null;

    return {
      totalStudents: allTeacherStudents.size,
      overallAccuracy,
      stats: {
        mastered: teacherMastered,
        doingWell: teacherDoingWell,
        needsPractice: teacherNeedsPractice,
        notStarted: teacherNotStarted,
        proficient: teacherDoingWell,
        developing: teacherNeedsPractice,
        inProgress: teacherNotStarted,
      },
      breakdown,
    };
  }

  async getStudentMasteryOverview(
    tenantId: string,
    userId: string
  ): Promise<MasteryOverviewResponse> {
    const studentData = await this.getStudentMastery(tenantId, userId);
    let masteredTopics = 0;
    let doingWellTopics = 0;
    let needsPracticeTopics = 0;
    let notStartedTopics = 0;

    const breakdown: MasteryOverviewItem[] = studentData.subjects.map((s) => {
      const progress = s.overallAccuracy !== null ? Math.round(s.overallAccuracy) : 0;
      let status: MasteryOverviewItem["status"] = "Not Started";
      if (s.overallAccuracy !== null) {
        if (progress >= 80) status = "Mastered";
        else if (progress >= 65) status = "Doing Well";
        else if (progress >= 40) status = "Needs Practice";
        else status = "Learning";
      }

      for (const u of s.units) {
        for (const t of u.topics) {
          if (t.level === "MASTERED" || (t.accuracy !== null && t.accuracy >= 80)) {
            masteredTopics += 1;
          } else if (t.level === "PROFICIENT" || (t.accuracy !== null && t.accuracy >= 65)) {
            doingWellTopics += 1;
          } else if (t.level === "DEVELOPING" || (t.accuracy !== null && t.accuracy > 0)) {
            needsPracticeTopics += 1;
          } else {
            notStartedTopics += 1;
          }
        }
      }

      return {
        id: s.subjectId,
        name: s.subjectName,
        subtitle: `${s.units.length} ${s.units.length === 1 ? "unit" : "units"} • ${s.totalTopics} ${s.totalTopics === 1 ? "topic" : "topics"}`,
        progress,
        status,
        totalTopics: s.totalTopics,
        masteredTopics: s.masteredCount,
      };
    });

    const evaluatedSubjects = studentData.subjects.filter((s) => s.overallAccuracy !== null);
    const overallAccuracy =
      evaluatedSubjects.length > 0
        ? Math.round(
          evaluatedSubjects.reduce((sum, s) => sum + (s.overallAccuracy ?? 0), 0) /
          evaluatedSubjects.length
        )
        : null;

    return {
      totalStudents: 1,
      overallAccuracy,
      stats: {
        mastered: masteredTopics,
        doingWell: doingWellTopics,
        needsPractice: needsPracticeTopics,
        notStarted: notStartedTopics,
        proficient: doingWellTopics,
        developing: needsPracticeTopics,
        inProgress: notStartedTopics,
      },
      breakdown,
    };
  }

  private computeBestEvidenceMetrics(
    evidenceList: Array<{
      id: string;
      questionVersionId: string | null;
      isCorrect: boolean | null;
      awardedPoints: Prisma.Decimal | number | null;
      maxPoints: Prisma.Decimal | number | null;
    }>
  ) {
    const bestPerQuestion = new Map<
      string,
      { isCorrect: boolean; awardedPoints: number; maxPoints: number }
    >();

    for (const ev of evidenceList) {
      const key = ev.questionVersionId || ev.id;
      const awarded = ev.awardedPoints ? Number(ev.awardedPoints) : 0;
      const max = ev.maxPoints ? Number(ev.maxPoints) : 0;
      const isCorrect = ev.isCorrect === true;

      const existing = bestPerQuestion.get(key);
      if (!existing) {
        bestPerQuestion.set(key, { isCorrect, awardedPoints: awarded, maxPoints: max });
      } else {
        bestPerQuestion.set(key, {
          isCorrect: existing.isCorrect || isCorrect,
          awardedPoints: Math.max(existing.awardedPoints, awarded),
          maxPoints: Math.max(existing.maxPoints, max),
        });
      }
    }

    const questionCount = bestPerQuestion.size;
    const correctCount = Array.from(bestPerQuestion.values()).filter((q) => q.isCorrect).length;
    const incorrectCount = Math.max(0, questionCount - correctCount);

    let pointsEarned = 0;
    let pointsPossible = 0;
    for (const q of bestPerQuestion.values()) {
      pointsEarned += q.awardedPoints;
      pointsPossible += q.maxPoints;
    }

    const accuracy =
      questionCount > 0 ? Math.round((correctCount / questionCount) * 10000) / 100 : 0;

    return {
      questionCount,
      correctCount,
      incorrectCount,
      pointsEarned,
      pointsPossible,
      accuracy,
    };
  }

  private async ensureTopicForSubject(
    tx: TransactionClient,
    tenantId: string,
    subjectId: string,
    gradeId?: string | null,
    curriculumVersionId?: string | null
  ): Promise<string | null> {
    const existingTopic = await tx.curriculumTopic.findFirst({
      where: {
        unit: {
          curriculumSubject: {
            subjectId,
            ...(gradeId ? { gradeId } : {}),
            curriculumVersion: { curriculum: { tenantId } },
          },
        },
      },
      orderBy: [
        { unit: { orderIndex: "asc" } },
        { orderIndex: "asc" },
      ],
      select: { id: true },
    });

    if (existingTopic) {
      return existingTopic.id;
    }

    const fallbackTopic = await tx.curriculumTopic.findFirst({
      where: {
        unit: {
          curriculumSubject: {
            subjectId,
            curriculumVersion: { curriculum: { tenantId } },
          },
        },
      },
      orderBy: [
        { unit: { orderIndex: "asc" } },
        { orderIndex: "asc" },
      ],
      select: { id: true },
    });

    if (fallbackTopic) {
      return fallbackTopic.id;
    }

    const subject = await tx.subject.findFirst({
      where: { id: subjectId },
    });
    if (!subject) return null;

    let targetCurriculumVersion = curriculumVersionId
      ? await tx.curriculumVersion.findFirst({ where: { id: curriculumVersionId } })
      : null;

    if (!targetCurriculumVersion) {
      targetCurriculumVersion = await tx.curriculumVersion.findFirst({
        where: { curriculum: { tenantId } },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!targetCurriculumVersion) return null;

    let targetGrade = gradeId
      ? await tx.grade.findFirst({ where: { id: gradeId, tenantId } })
      : null;

    if (!targetGrade) {
      targetGrade = await tx.grade.findFirst({
        where: { tenantId },
        orderBy: { level: "asc" },
      });
    }

    if (!targetGrade) return null;

    let cs = await tx.curriculumSubject.findFirst({
      where: {
        curriculumVersionId: targetCurriculumVersion.id,
        gradeId: targetGrade.id,
        subjectId: subject.id,
      },
    });

    if (!cs) {
      cs = await tx.curriculumSubject.create({
        data: {
          curriculumVersionId: targetCurriculumVersion.id,
          gradeId: targetGrade.id,
          subjectId: subject.id,
        },
      });
    }

    let unit = await tx.curriculumUnit.findFirst({
      where: { curriculumSubjectId: cs.id },
      orderBy: { orderIndex: "asc" },
    });

    if (!unit) {
      unit = await tx.curriculumUnit.create({
        data: {
          curriculumSubjectId: cs.id,
          code: `${subject.code}-U1`,
          title: `${subject.name} Units`,
          orderIndex: 1,
        },
      });
    }

    let topic = await tx.curriculumTopic.findFirst({
      where: { unitId: unit.id },
      orderBy: { orderIndex: "asc" },
    });

    if (!topic) {
      topic = await tx.curriculumTopic.create({
        data: {
          unitId: unit.id,
          code: `${subject.code}-T1`,
          title: `General ${subject.name}`,
          orderIndex: 1,
        },
      });
    }

    return topic.id;
  }

  async recordEvidenceForAttempt(
    attemptId: string,
    tenantId: string
  ): Promise<void> {
    const attempt = await prisma.assessmentAttempt.findFirst({
      where: {
        id: attemptId,
        assessment: { tenantId },
      },
      include: {
        assessment: {
          include: {
            examContext: {
              select: {
                subjectId: true,
                gradeId: true,
                curriculumVersionId: true,
              },
            },
            questions: {
              include: {
                questionVersion: {
                  include: {
                    question: {
                      include: {
                        topics: {
                          include: {
                            topic: {
                              include: {
                                unit: {
                                  include: {
                                    curriculumSubject: true,
                                  },
                                },
                              },
                            },
                          },
                        },
                        objectives: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        answers: true,
      },
    });

    if (!attempt || !attempt.answers || attempt.answers.length === 0) {
      return;
    }

    const assessmentSubjectId =
      attempt.assessment.subjectId ||
      attempt.assessment.examContext?.subjectId ||
      null;
    const assessmentGradeId =
      attempt.assessment.gradeId ||
      attempt.assessment.examContext?.gradeId ||
      null;
    const assessmentCurriculumVersionId =
      attempt.assessment.curriculumVersionId ||
      attempt.assessment.examContext?.curriculumVersionId ||
      null;

    const questionMap = new Map<
      string,
      (typeof attempt.assessment.questions)[0]
    >();
    for (const q of attempt.assessment.questions) {
      questionMap.set(q.questionVersionId, q);
    }

    const touchedTopicIds = new Set<string>();

    await prisma.$transaction(async (tx) => {
      for (const ans of attempt.answers) {
        const qItem = questionMap.get(ans.questionVersionId);
        if (!qItem) continue;

        const qv = qItem.questionVersion;
        const qTopics = qv.question.topics;
        const qObjectives = qv.question.objectives;

        let topicId: string | null = null;

        if (assessmentSubjectId) {
          const matchingTopic = qTopics.find(
            (t) => t.topic?.unit?.curriculumSubject?.subjectId === assessmentSubjectId
          );
          if (matchingTopic) {
            topicId = matchingTopic.topicId;
          }
        }

        if (!topicId && attempt.assessment.topicId) {
          topicId = attempt.assessment.topicId;
        }

        if (!topicId && attempt.assessment.unitId) {
          const unitTopic = await tx.curriculumTopic.findFirst({
            where: { unitId: attempt.assessment.unitId },
            orderBy: { orderIndex: "asc" },
            select: { id: true },
          });
          if (unitTopic) {
            topicId = unitTopic.id;
          }
        }

        if (!topicId && assessmentSubjectId) {
          topicId = await this.ensureTopicForSubject(
            tx,
            tenantId,
            assessmentSubjectId,
            assessmentGradeId,
            assessmentCurriculumVersionId
          );

          if (topicId) {
            await tx.questionTopic.deleteMany({
              where: { questionId: qv.questionId },
            }).catch(() => { });

            await tx.questionTopic.create({
              data: {
                questionId: qv.questionId,
                topicId,
                isPrimary: true,
              },
            }).catch(() => { });
          }
        }

        if (!topicId) {
          topicId =
            qTopics.find((t) => t.isPrimary)?.topicId ??
            qTopics[0]?.topicId ??
            null;
        }

        if (!topicId) continue;

        const objectiveId = qObjectives[0]?.objectiveId ?? null;

        touchedTopicIds.add(topicId);

        const awarded = ans.awardedPoints ? Number(ans.awardedPoints) : 0;
        const max = ans.maxPoints ? Number(ans.maxPoints) : 0;

        await tx.learningEvidence.create({
          data: {
            tenantId,
            studentId: attempt.studentId,
            attemptId: attempt.id,
            assessmentId: attempt.assessmentId,
            questionVersionId: ans.questionVersionId,
            topicId,
            objectiveId,
            sourceType: (attempt.assessment.type as EvidenceSourceTypeEnum) ?? "ASSESSMENT",
            isCorrect: ans.isCorrect,
            awardedPoints: new Prisma.Decimal(awarded),
            maxPoints: new Prisma.Decimal(max),
            observedAt: new Date(),
          },
        });
      }

      for (const topicId of touchedTopicIds) {
        const evidenceList = await tx.learningEvidence.findMany({
          where: {
            tenantId,
            studentId: attempt.studentId,
            topicId,
          },
          orderBy: { observedAt: "desc" },
        });

        const metrics = this.computeBestEvidenceMetrics(evidenceList);

        await tx.studentTopicPerformance.upsert({
          where: {
            studentId_topicId: {
              studentId: attempt.studentId,
              topicId,
            },
          },
          create: {
            tenantId,
            studentId: attempt.studentId,
            topicId,
            questionCount: metrics.questionCount,
            correctCount: metrics.correctCount,
            incorrectCount: metrics.incorrectCount,
            pointsEarned: new Prisma.Decimal(metrics.pointsEarned),
            pointsPossible: new Prisma.Decimal(metrics.pointsPossible),
            accuracy: new Prisma.Decimal(metrics.accuracy),
            lastObservedAt: new Date(),
          },
          update: {
            questionCount: metrics.questionCount,
            correctCount: metrics.correctCount,
            incorrectCount: metrics.incorrectCount,
            pointsEarned: new Prisma.Decimal(metrics.pointsEarned),
            pointsPossible: new Prisma.Decimal(metrics.pointsPossible),
            accuracy: new Prisma.Decimal(metrics.accuracy),
            lastObservedAt: new Date(),
          },
        });

        const level = computeMasteryLevel(metrics.accuracy, metrics.questionCount);

        const mastery = await tx.studentTopicMastery.upsert({
          where: {
            studentId_topicId: {
              studentId: attempt.studentId,
              topicId,
            },
          },
          create: {
            tenantId,
            studentId: attempt.studentId,
            topicId,
            level,
            masteryScore: new Prisma.Decimal(metrics.accuracy),
            evidenceCount: metrics.questionCount,
            calculatedAt: new Date(),
          },
          update: {
            level,
            masteryScore: new Prisma.Decimal(metrics.accuracy),
            evidenceCount: metrics.questionCount,
            calculatedAt: new Date(),
          },
        });

        await tx.masteryHistory.create({
          data: {
            tenantId,
            studentId: attempt.studentId,
            topicId,
            masteryId: mastery.id,
            level,
            masteryScore: new Prisma.Decimal(metrics.accuracy),
            evidenceCount: metrics.questionCount,
            calculatedAt: new Date(),
            calculationVersion: "1.0",
          },
        });
      }
    });
  }

  async recordPracticeEvidence(
    tenantId: string,
    studentId: string,
    dto: RecordPracticeEvidenceDto
  ): Promise<{ success: boolean; recordedCount: number }> {
    const student = await prisma.studentProfile.findFirst({
      where: {
        tenantId,
        OR: [{ id: studentId }, { userId: studentId }],
      },
      include: {
        enrollments: {
          where: { status: "ACTIVE" },
          include: {
            section: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundError("Student profile not found.");
    }

    const studentGradeId = student.enrollments[0]?.section?.gradeId ?? null;

    const bank = await prisma.questionBank.findFirst({
      where: { id: dto.bankId, tenantId },
      include: {
        examContexts: {
          select: {
            subjectId: true,
            gradeId: true,
            curriculumVersionId: true,
          },
        },
      },
    });

    const bankSubjectId = bank?.examContexts?.[0]?.subjectId ?? null;
    const bankGradeId = bank?.examContexts?.[0]?.gradeId ?? studentGradeId;
    const bankCurriculumVersionId = bank?.examContexts?.[0]?.curriculumVersionId ?? null;

    const touchedTopicIds = new Set<string>();

    await prisma.$transaction(async (tx) => {
      for (const item of dto.results) {
        const question = await tx.question.findUnique({
          where: { id: item.questionId },
          include: {
            topics: {
              include: {
                topic: {
                  include: {
                    unit: {
                      include: {
                        curriculumSubject: true,
                      },
                    },
                  },
                },
              },
            },
            versions: {
              orderBy: { version: "desc" },
              take: 1,
            },
          },
        });

        if (!question) continue;

        const latestVersion = question.versions[0];
        const versionId = item.questionVersionId || latestVersion?.id;
        if (!versionId) continue;

        let topicId: string | null = null;

        if (bankSubjectId) {
          const matchingTopic = question.topics.find(
            (t) => t.topic?.unit?.curriculumSubject?.subjectId === bankSubjectId
          );
          if (matchingTopic) {
            topicId = matchingTopic.topicId;
          }
        }

        if (!topicId && bankSubjectId) {
          topicId = await this.ensureTopicForSubject(
            tx,
            tenantId,
            bankSubjectId,
            bankGradeId,
            bankCurriculumVersionId
          );

          if (topicId) {
            await tx.questionTopic.deleteMany({
              where: { questionId: question.id },
            }).catch(() => { });

            await tx.questionTopic.create({
              data: {
                questionId: question.id,
                topicId,
                isPrimary: true,
              },
            }).catch(() => { });
          }
        }

        if (!topicId) {
          topicId =
            question.topics.find((t) => t.isPrimary)?.topicId ||
            question.topics[0]?.topicId ||
            null;
        }

        if (!topicId) continue;

        touchedTopicIds.add(topicId);

        await tx.learningEvidence.create({
          data: {
            tenantId,
            studentId: student.id,
            questionVersionId: versionId,
            topicId,
            sourceType: "PRACTICE" as EvidenceSourceTypeEnum,
            isCorrect: item.isCorrect,
            awardedPoints: new Prisma.Decimal(item.awardedPoints),
            maxPoints: new Prisma.Decimal(item.maxPoints),
            observedAt: new Date(),
          },
        });
      }

      for (const topicId of touchedTopicIds) {
        const evidenceList = await tx.learningEvidence.findMany({
          where: {
            tenantId,
            studentId: student.id,
            topicId,
          },
          orderBy: { observedAt: "desc" },
        });

        const metrics = this.computeBestEvidenceMetrics(evidenceList);

        await tx.studentTopicPerformance.upsert({
          where: {
            studentId_topicId: {
              studentId: student.id,
              topicId,
            },
          },
          create: {
            tenantId,
            studentId: student.id,
            topicId,
            questionCount: metrics.questionCount,
            correctCount: metrics.correctCount,
            incorrectCount: metrics.incorrectCount,
            pointsEarned: new Prisma.Decimal(metrics.pointsEarned),
            pointsPossible: new Prisma.Decimal(metrics.pointsPossible),
            accuracy: new Prisma.Decimal(metrics.accuracy),
            lastObservedAt: new Date(),
          },
          update: {
            questionCount: metrics.questionCount,
            correctCount: metrics.correctCount,
            incorrectCount: metrics.incorrectCount,
            pointsEarned: new Prisma.Decimal(metrics.pointsEarned),
            pointsPossible: new Prisma.Decimal(metrics.pointsPossible),
            accuracy: new Prisma.Decimal(metrics.accuracy),
            lastObservedAt: new Date(),
          },
        });

        const level = computeMasteryLevel(metrics.accuracy, metrics.questionCount);

        const mastery = await tx.studentTopicMastery.upsert({
          where: {
            studentId_topicId: {
              studentId: student.id,
              topicId,
            },
          },
          create: {
            tenantId,
            studentId: student.id,
            topicId,
            level,
            masteryScore: new Prisma.Decimal(metrics.accuracy),
            evidenceCount: metrics.questionCount,
            calculatedAt: new Date(),
          },
          update: {
            level,
            masteryScore: new Prisma.Decimal(metrics.accuracy),
            evidenceCount: metrics.questionCount,
            calculatedAt: new Date(),
          },
        });

        await tx.masteryHistory.create({
          data: {
            tenantId,
            studentId: student.id,
            topicId,
            masteryId: mastery.id,
            level,
            masteryScore: new Prisma.Decimal(metrics.accuracy),
            evidenceCount: metrics.questionCount,
            calculatedAt: new Date(),
            calculationVersion: "1.0",
          },
        });
      }
    });

    return { success: true, recordedCount: touchedTopicIds.size };
  }
}
