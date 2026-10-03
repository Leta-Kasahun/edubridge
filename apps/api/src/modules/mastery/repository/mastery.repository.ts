import { prisma } from "../../../lib/prisma.js";
import { Prisma } from "../../../generated/prisma/client.js";
import { computeMasteryLevel } from "../../../shared/utils/mastery.util.js";
import {
  SectionMasteryMatrixResponse,
  SingleStudentMasteryResponse,
  TopicMasteryHistoryItem,
  RecordPracticeEvidenceDto,
} from "../types/mastery.types.js";
import {
  MasteryLevelEnum,
  EvidenceSourceTypeEnum,
} from "../../../shared/constants/assessment.constants.js";
import { NotFoundError } from "../../../shared/exceptions/not-found-error.js";

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

    let targetSubjectId = subjectId;
    if (!targetSubjectId) {
      const anySubject = await prisma.curriculumSubject.findFirst({
        where: { gradeId: section.gradeId },
        select: { subjectId: true },
      });
      if (anySubject) {
        targetSubjectId = anySubject.subjectId;
      }
    }

    const curriculumSubject = targetSubjectId
      ? await prisma.curriculumSubject.findFirst({
          where: {
            gradeId: section.gradeId,
            subjectId: targetSubjectId,
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
        })
      : null;

    const activeStudents = section.enrollments.map((e) => e.student);

    if (!curriculumSubject) {
      let subjectMeta = { id: targetSubjectId || "", name: "All Subjects", code: "ALL" };
      if (targetSubjectId) {
        const sub = await prisma.subject.findFirst({ where: { id: targetSubjectId } });
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

    const topics = curriculumSubject.units.flatMap((unit) =>
      unit.topics.map((t) => ({
        id: t.id,
        code: t.code,
        title: t.title,
        unitId: unit.id,
        unitCode: unit.code,
        unitTitle: unit.title,
        orderIndex: t.orderIndex,
        objectives: t.objectives.map((o) => ({
          id: o.id,
          code: o.code,
          statement: o.statement,
          description: o.description,
          orderIndex: o.orderIndex,
        })),
      }))
    );

    const studentIds = activeStudents.map((s) => s.id);
    const topicIds = topics.map((t) => t.id);

    const performances =
      studentIds.length > 0 && topicIds.length > 0
        ? await prisma.studentTopicPerformance.findMany({
            where: {
              tenantId,
              studentId: { in: studentIds },
              topicId: { in: topicIds },
            },
          })
        : [];

    const masteries =
      studentIds.length > 0 && topicIds.length > 0
        ? await prisma.studentTopicMastery.findMany({
            where: {
              tenantId,
              studentId: { in: studentIds },
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
        const perf = perfMap.get(`${student.id}_${topic.id}`);
        const mast = masteryMap.get(`${student.id}_${topic.id}`);

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
      subject: {
        id: curriculumSubject.subject.id,
        name: curriculumSubject.subject.name,
        code: curriculumSubject.subject.code,
      },
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

    let curriculumSubjects = gradeId
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

    if (curriculumSubjects.length === 0) {
      curriculumSubjects = await prisma.curriculumSubject.findMany({
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
    }

    // Deduplicate curriculumSubjects by subjectId to avoid duplicate subjects across curriculum versions
    const uniqueCurriculumSubjectsMap = new Map<string, (typeof curriculumSubjects)[0]>();
    for (const cs of curriculumSubjects) {
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
    const uniqueCurriculumSubjects = Array.from(uniqueCurriculumSubjectsMap.values());

    const allTopicIds = uniqueCurriculumSubjects.flatMap((cs) =>
      cs.units.flatMap((u) => u.topics.map((t) => t.id))
    );

    const targetStudentIds = [student.id, student.userId].filter(Boolean) as string[];

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

  /**
   * Records append-only LearningEvidence and recalculates StudentTopicPerformance & StudentTopicMastery
   */
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
            questions: {
              include: {
                questionVersion: {
                  include: {
                    question: {
                      include: {
                        topics: true,
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

        let topicId =
          qTopics.find((t) => t.isPrimary)?.topicId ?? qTopics[0]?.topicId;

        // Fallback: resolve topic from curriculum subject if question was not linked
        if (!topicId) {
          const fallbackCs = await tx.curriculumSubject.findFirst({
            where: {
              curriculumVersion: { curriculum: { tenantId } },
            },
            include: {
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
          const fbTopic = fallbackCs?.units[0]?.topics[0];
          if (fbTopic) {
            topicId = fbTopic.id;
            await tx.questionTopic.create({
              data: {
                questionId: qv.question.id,
                topicId: fbTopic.id,
                isPrimary: true,
              },
            }).catch(() => {});
          }
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
        });

        const questionCount = evidenceList.length;
        const correctCount = evidenceList.filter((e) => e.isCorrect === true).length;
        const incorrectCount = evidenceList.filter((e) => e.isCorrect === false).length;

        let pointsEarned = 0;
        let pointsPossible = 0;
        for (const ev of evidenceList) {
          pointsEarned += ev.awardedPoints ? Number(ev.awardedPoints) : 0;
          pointsPossible += ev.maxPoints ? Number(ev.maxPoints) : 0;
        }

        const accuracy =
          questionCount > 0 ? (correctCount / questionCount) * 100 : 0;

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
            questionCount,
            correctCount,
            incorrectCount,
            pointsEarned: new Prisma.Decimal(pointsEarned),
            pointsPossible: new Prisma.Decimal(pointsPossible),
            accuracy: new Prisma.Decimal(Math.round(accuracy * 100) / 100),
            lastObservedAt: new Date(),
          },
          update: {
            questionCount,
            correctCount,
            incorrectCount,
            pointsEarned: new Prisma.Decimal(pointsEarned),
            pointsPossible: new Prisma.Decimal(pointsPossible),
            accuracy: new Prisma.Decimal(Math.round(accuracy * 100) / 100),
            lastObservedAt: new Date(),
          },
        });

        const level = computeMasteryLevel(accuracy, questionCount);

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
            masteryScore: new Prisma.Decimal(Math.round(accuracy * 100) / 100),
            evidenceCount: questionCount,
            calculatedAt: new Date(),
          },
          update: {
            level,
            masteryScore: new Prisma.Decimal(Math.round(accuracy * 100) / 100),
            evidenceCount: questionCount,
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
            masteryScore: new Prisma.Decimal(Math.round(accuracy * 100) / 100),
            evidenceCount: questionCount,
            calculatedAt: new Date(),
            calculationVersion: "1.0",
          },
        });
      }
    });
  }

  /**
   * Records practice test evidence from Question Bank sessions and recalculates real mastery metrics
   */
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
    });

    if (!student) {
      throw new NotFoundError("Student profile not found.");
    }

    const touchedTopicIds = new Set<string>();

    await prisma.$transaction(async (tx) => {
      for (const item of dto.results) {
        const question = await tx.question.findUnique({
          where: { id: item.questionId },
          include: {
            topics: { include: { topic: true } },
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

        let topicId = question.topics.find((t) => t.isPrimary)?.topicId || question.topics[0]?.topicId;

        if (!topicId) {
          const matchingCurriculumSubject = await tx.curriculumSubject.findFirst({
            where: {
              curriculumVersion: { curriculum: { tenantId } },
            },
            include: {
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

          const foundTopic = matchingCurriculumSubject?.units[0]?.topics[0];
          if (foundTopic) {
            topicId = foundTopic.id;
            await tx.questionTopic.create({
              data: {
                questionId: question.id,
                topicId: foundTopic.id,
                isPrimary: true,
              },
            }).catch(() => {});
          }
        }

        if (!topicId) {
          const anyTopic = await tx.curriculumTopic.findFirst({
            where: {
              unit: {
                curriculumSubject: {
                  curriculumVersion: {
                    curriculum: { tenantId },
                  },
                },
              },
            },
          });
          if (anyTopic) {
            topicId = anyTopic.id;
          }
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
        });

        const questionCount = evidenceList.length;
        const correctCount = evidenceList.filter((e) => e.isCorrect === true).length;
        const incorrectCount = evidenceList.filter((e) => e.isCorrect === false).length;

        let pointsEarned = 0;
        let pointsPossible = 0;
        for (const ev of evidenceList) {
          pointsEarned += ev.awardedPoints ? Number(ev.awardedPoints) : 0;
          pointsPossible += ev.maxPoints ? Number(ev.maxPoints) : 0;
        }

        const accuracy =
          questionCount > 0 ? (correctCount / questionCount) * 100 : 0;

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
            questionCount,
            correctCount,
            incorrectCount,
            pointsEarned: new Prisma.Decimal(pointsEarned),
            pointsPossible: new Prisma.Decimal(pointsPossible),
            accuracy: new Prisma.Decimal(Math.round(accuracy * 100) / 100),
            lastObservedAt: new Date(),
          },
          update: {
            questionCount,
            correctCount,
            incorrectCount,
            pointsEarned: new Prisma.Decimal(pointsEarned),
            pointsPossible: new Prisma.Decimal(pointsPossible),
            accuracy: new Prisma.Decimal(Math.round(accuracy * 100) / 100),
            lastObservedAt: new Date(),
          },
        });

        const level = computeMasteryLevel(accuracy, questionCount);

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
            masteryScore: new Prisma.Decimal(Math.round(accuracy * 100) / 100),
            evidenceCount: questionCount,
            calculatedAt: new Date(),
          },
          update: {
            level,
            masteryScore: new Prisma.Decimal(Math.round(accuracy * 100) / 100),
            evidenceCount: questionCount,
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
            masteryScore: new Prisma.Decimal(Math.round(accuracy * 100) / 100),
            evidenceCount: questionCount,
            calculatedAt: new Date(),
            calculationVersion: "1.0",
          },
        });
      }
    });

    return { success: true, recordedCount: touchedTopicIds.size };
  }
}
