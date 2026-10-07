import { prisma } from "../../../lib/prisma.js";
import {
  ToggleBookmarkInput,
  ToggleBookmarkResult,
  CheckBookmarksInput,
  CheckBookmarksResult,
  ListBookmarksQuery,
  PaginatedBookmarksResponse,
  EnrichedBookmarkItem,
  BookmarkedQuestionDetails,
  BookmarkedContentDetails,
  BookmarkedTopicDetails,
} from "../types/bookmarks.types.js";
import { BookmarkTargetType } from "../../../generated/prisma/enums.js";

export class BookmarksRepository {
  async findStudentProfileByUserId(
    tenantId: string,
    userId: string
  ): Promise<{ id: string } | null> {
    return prisma.studentProfile.findFirst({
      where: {
        tenantId,
        userId,
      },
      select: { id: true },
    });
  }

  async toggleBookmark(
    tenantId: string,
    studentId: string,
    input: ToggleBookmarkInput
  ): Promise<ToggleBookmarkResult> {
    const existing = await prisma.studentBookmark.findUnique({
      where: {
        studentId_targetType_targetId: {
          studentId,
          targetType: input.targetType,
          targetId: input.targetId,
        },
      },
      select: { id: true, tenantId: true },
    });

    if (existing) {
      await prisma.studentBookmark.delete({
        where: { id: existing.id },
      });
      return { bookmarked: false };
    }

    const created = await prisma.studentBookmark.create({
      data: {
        tenantId,
        studentId,
        targetType: input.targetType,
        targetId: input.targetId,
        note: input.note ?? null,
      },
      select: { id: true },
    });

    return { bookmarked: true, bookmarkId: created.id };
  }

  async checkBookmarks(
    tenantId: string,
    studentId: string,
    input: CheckBookmarksInput
  ): Promise<CheckBookmarksResult> {
    const records = await prisma.studentBookmark.findMany({
      where: {
        tenantId,
        studentId,
        targetType: input.targetType,
        targetId: { in: input.targetIds },
      },
      select: { targetId: true },
    });

    return {
      bookmarkedIds: records.map((r) => r.targetId),
    };
  }

  async deleteBookmark(
    tenantId: string,
    studentId: string,
    bookmarkId: string
  ): Promise<boolean> {
    const existing = await prisma.studentBookmark.findFirst({
      where: {
        id: bookmarkId,
        tenantId,
        studentId,
      },
      select: { id: true },
    });

    if (!existing) {
      return false;
    }

    await prisma.studentBookmark.delete({
      where: { id: existing.id },
    });

    return true;
  }

  async listBookmarks(
    tenantId: string,
    studentId: string,
    query: ListBookmarksQuery
  ): Promise<PaginatedBookmarksResponse> {
    const page = Math.max(query.page ?? 1, 1);
    const limit = Math.min(Math.max(query.limit ?? 20, 1), 100);
    const skip = (page - 1) * limit;

    const baseWhere = {
      tenantId,
      studentId,
      ...(query.targetType ? { targetType: query.targetType } : {}),
    };

    const [total, bookmarks] = await Promise.all([
      prisma.studentBookmark.count({ where: baseWhere }),
      prisma.studentBookmark.findMany({
        where: baseWhere,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const questionIds = bookmarks
      .filter((b) => b.targetType === BookmarkTargetType.QUESTION)
      .map((b) => b.targetId);

    const contentIds = bookmarks
      .filter((b) => b.targetType === BookmarkTargetType.LEARNING_CONTENT)
      .map((b) => b.targetId);

    const topicIds = bookmarks
      .filter((b) => b.targetType === BookmarkTargetType.TOPIC)
      .map((b) => b.targetId);

    const [questions, contents, topics] = await Promise.all([
      questionIds.length > 0
        ? prisma.question.findMany({
            where: {
              OR: [
                { id: { in: questionIds } },
                { versions: { some: { id: { in: questionIds } } } },
              ],
            },
            include: {
              questionBank: {
                select: {
                  id: true,
                  name: true,
                },
              },
              versions: {
                orderBy: { version: "desc" },
                take: 1,
                include: {
                  options: {
                    orderBy: { orderIndex: "asc" },
                  },
                  assessmentQuestions: {
                    take: 1,
                    include: {
                      assessment: {
                        select: {
                          id: true,
                          title: true,
                          type: true,
                          subject: {
                            select: {
                              id: true,
                              code: true,
                              name: true,
                            },
                          },
                          topic: {
                            select: {
                              id: true,
                              code: true,
                              title: true,
                            },
                          },
                          unit: {
                            select: {
                              id: true,
                              code: true,
                              title: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              topics: {
                include: {
                  topic: {
                    include: {
                      unit: {
                        include: {
                          curriculumSubject: {
                            include: {
                              subject: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          })
        : [],
      contentIds.length > 0
        ? prisma.learningContent.findMany({
            where: { id: { in: contentIds }, tenantId },
            include: {
              subject: true,
            },
          })
        : [],
      topicIds.length > 0
        ? prisma.curriculumTopic.findMany({
            where: { id: { in: topicIds } },
            include: {
              unit: {
                include: {
                  curriculumSubject: {
                    include: {
                      subject: true,
                    },
                  },
                },
              },
            },
          })
        : [],
    ]);

    const questionMap = new Map<string, BookmarkedQuestionDetails>();
    for (const q of questions) {
      const activeVersion = q.versions[0];
      const primaryTopicRel = q.topics.find((t) => t.isPrimary) ?? q.topics[0];
      const topicEntity = primaryTopicRel?.topic;
      const unitEntity = topicEntity?.unit;
      const subjectEntity = unitEntity?.curriculumSubject?.subject;
      const assessmentEntity = activeVersion?.assessmentQuestions?.[0]?.assessment;
      const assessmentSubject = assessmentEntity?.subject;
      const assessmentTopic = assessmentEntity?.topic;
      const assessmentUnit = assessmentEntity?.unit;

      const subjectData = subjectEntity
        ? {
            id: subjectEntity.id,
            code: subjectEntity.code,
            name: subjectEntity.name,
          }
        : assessmentSubject
        ? {
            id: assessmentSubject.id,
            code: assessmentSubject.code,
            name: assessmentSubject.name,
          }
        : null;

      const topicData = topicEntity
        ? {
            id: topicEntity.id,
            code: topicEntity.code,
            title: topicEntity.title,
          }
        : assessmentTopic
        ? {
            id: assessmentTopic.id,
            code: assessmentTopic.code,
            title: assessmentTopic.title,
          }
        : null;

      const unitData = unitEntity
        ? {
            id: unitEntity.id,
            code: unitEntity.code,
            title: unitEntity.title,
          }
        : assessmentUnit
        ? {
            id: assessmentUnit.id,
            code: assessmentUnit.code,
            title: assessmentUnit.title,
          }
        : null;

      let extractedCorrectAnswer: string | null = null;
      const correctOption = activeVersion?.options?.find((o) => o.isCorrect);
      if (correctOption) {
        extractedCorrectAnswer = correctOption.optionText || correctOption.optionKey;
      } else if (activeVersion?.configuration && typeof activeVersion.configuration === "object") {
        const cfg = activeVersion.configuration as Record<string, unknown>;
        if (typeof cfg.correctAnswer === "string" && cfg.correctAnswer.trim()) {
          extractedCorrectAnswer = cfg.correctAnswer.trim();
        } else if (Array.isArray(cfg.acceptableAnswers) && cfg.acceptableAnswers.length > 0) {
          extractedCorrectAnswer = String(cfg.acceptableAnswers[0]);
        } else if (cfg.targetValue !== undefined) {
          extractedCorrectAnswer = String(cfg.targetValue);
        }
      }

      const questionDetails: BookmarkedQuestionDetails = {
        questionId: q.id,
        questionText: activeVersion?.questionText ?? "",
        type: activeVersion?.type ?? "MULTIPLE_CHOICE",
        difficulty: activeVersion?.difficulty ?? "MEDIUM",
        explanation: activeVersion?.explanation ?? null,
        points: activeVersion ? Number(activeVersion.points) : 1,
        options: (activeVersion?.options ?? []).map((o) => ({
          id: o.id,
          optionKey: o.optionKey,
          optionText: o.optionText,
          orderIndex: o.orderIndex,
          isCorrect: o.isCorrect,
        })),
        subject: subjectData,
        topic: topicData,
        unit: unitData,
        questionBank: q.questionBank
          ? {
              id: q.questionBank.id,
              name: q.questionBank.name,
            }
          : null,
        assessmentType: assessmentEntity?.type ?? null,
        assessmentTitle: assessmentEntity?.title ?? null,
        correctAnswer: extractedCorrectAnswer,
        configuration: activeVersion?.configuration ?? null,
      };

      questionMap.set(q.id, questionDetails);
      if (activeVersion?.id) {
        questionMap.set(activeVersion.id, questionDetails);
      }
    }

    const contentMap = new Map<string, BookmarkedContentDetails>();
    for (const c of contents) {
      contentMap.set(c.id, {
        contentId: c.id,
        title: c.title,
        type: c.type,
        description: c.description,
        subject: c.subject
          ? {
              id: c.subject.id,
              code: c.subject.code,
              name: c.subject.name,
            }
          : null,
        gradeLevel: c.targetGradeLevels?.[0] ?? null,
      });
    }

    const topicMap = new Map<string, BookmarkedTopicDetails>();
    for (const t of topics) {
      const unit = t.unit;
      const subject = unit?.curriculumSubject?.subject;
      topicMap.set(t.id, {
        topicId: t.id,
        code: t.code,
        title: t.title,
        unit: unit
          ? {
              id: unit.id,
              code: unit.code,
              title: unit.title,
            }
          : null,
        subject: subject
          ? {
              id: subject.id,
              code: subject.code,
              name: subject.name,
            }
          : null,
      });
    }

    const items: EnrichedBookmarkItem[] = bookmarks.map((b) => ({
      id: b.id,
      targetType: b.targetType,
      targetId: b.targetId,
      note: b.note,
      createdAt: b.createdAt,
      questionDetails: questionMap.get(b.targetId),
      contentDetails: contentMap.get(b.targetId),
      topicDetails: topicMap.get(b.targetId),
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}
