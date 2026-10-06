import { prisma, runWithoutTenant } from "../../src/lib/prisma.js";

export async function seedAssessments(tenantId?: string) {
  return runWithoutTenant(async () => {
    const tenants = tenantId
      ? await prisma.tenant.findMany({ where: { id: tenantId } })
      : await prisma.tenant.findMany({ where: { status: "ACTIVE" } });

    for (const tenant of tenants) {
      const teacherUser = await prisma.user.findFirst({
        where: {
          memberships: {
            some: {
              tenantId: tenant.id,
              roles: {
                some: {
                  role: {
                    code: "TEACHER",
                  },
                },
              },
            },
          },
        },
      });

      const fallbackUser =
        teacherUser ??
        (await prisma.user.findFirst({
          where: {
            memberships: {
              some: { tenantId: tenant.id },
            },
          },
        }));

      if (!fallbackUser) continue;

      const grades = await prisma.grade.findMany({
        where: { tenantId: tenant.id },
      });

      const grade7 = grades.find((g) => g.level === 7);
      const grade8 = grades.find((g) => g.level === 8);

      const grade7Sections = grade7
        ? await prisma.section.findMany({
            where: { tenantId: tenant.id, gradeId: grade7.id },
          })
        : [];

      const grade8Sections = grade8
        ? await prisma.section.findMany({
            where: { tenantId: tenant.id, gradeId: grade8.id },
          })
        : [];

      const allSections = await prisma.section.findMany({
        where: { tenantId: tenant.id },
        take: 6,
      });

      const allQuestionVersions = await prisma.questionVersion.findMany({
        where: {
          question: {
            questionBank: {
              tenantId: tenant.id,
            },
          },
        },
        include: {
          question: {
            include: {
              questionBank: true,
            },
          },
        },
      });

      if (allQuestionVersions.length === 0) continue;

      const g7Questions = allQuestionVersions.filter((qv) => {
        const prompt = (qv.questionText || "").toLowerCase();
        const bankName = qv.question.questionBank?.name.toLowerCase() || "";
        return (
          bankName.includes("grade 7") ||
          bankName.includes("g7") ||
          prompt.includes("grade 7") ||
          qv.type === "NUMERIC"
        );
      });

      const g8Questions = allQuestionVersions.filter((qv) => {
        const bankName = qv.question.questionBank?.name.toLowerCase() || "";
        return (
          bankName.includes("grade 8") ||
          bankName.includes("g8") ||
          !g7Questions.some((q) => q.id === qv.id)
        );
      });

      const mathQuestions = allQuestionVersions.filter((qv) => {
        const bank = qv.question.questionBank?.name.toLowerCase() || "";
        return bank.includes("math") || qv.type === "NUMERIC";
      });

      const scienceQuestions = allQuestionVersions.filter((qv) => {
        const bank = qv.question.questionBank?.name.toLowerCase() || "";
        return bank.includes("science") || qv.type === "TRUE_FALSE";
      });

      const englishQuestions = allQuestionVersions.filter((qv) => {
        const bank = qv.question.questionBank?.name.toLowerCase() || "";
        return bank.includes("english") || qv.type === "SHORT_ANSWER";
      });

      const examContexts = await prisma.examContext.findMany({
        where: { tenantId: tenant.id },
      });

      const assessmentBlueprints = [
        {
          title: "Grade 8 Math - National Mock Exam",
          description: "Full-length standardized national exam simulation covering coordinate geometry, equations, and statistics.",
          type: "MOCK_EXAM" as const,
          contextPrefix: "NAT-G8-MATH",
          gradingMode: "AUTOMATIC" as const,
          timeLimitMinutes: 60,
          maxAttempts: 1,
          randomizeQuestions: true,
          randomizeOptions: true,
          showResults: true,
          status: "PUBLISHED" as const,
          sections: grade8Sections.length > 0 ? grade8Sections : allSections.slice(2, 4),
          questionsPool: mathQuestions.length >= 3 ? mathQuestions : g8Questions,
        },
        {
          title: "Grade 8 Science - Regional Practice Test",
          description: "Adaptive practice test covering forces, energy transformations, and physical sciences.",
          type: "PRACTICE" as const,
          contextPrefix: "REG-G8-SCI",
          gradingMode: "AUTOMATIC" as const,
          timeLimitMinutes: 30,
          maxAttempts: 3,
          randomizeQuestions: true,
          randomizeOptions: true,
          showResults: true,
          status: "PUBLISHED" as const,
          sections: grade8Sections.length > 0 ? grade8Sections : allSections.slice(2, 4),
          questionsPool: scienceQuestions.length >= 3 ? scienceQuestions : g8Questions,
        },
        {
          title: "Grade 7 Math - Knowledge Check",
          description: "Baseline evaluation on linear equations, rational numbers, and arithmetic operations.",
          type: "DIAGNOSTIC" as const,
          contextPrefix: "SCH-G7-MATH",
          gradingMode: "AUTOMATIC" as const,
          timeLimitMinutes: 30,
          maxAttempts: 2,
          randomizeQuestions: false,
          randomizeOptions: true,
          showResults: true,
          status: "PUBLISHED" as const,
          sections: grade7Sections.length > 0 ? grade7Sections : allSections.slice(0, 2),
          questionsPool: g7Questions.length >= 3 ? g7Questions : mathQuestions,
        },
        {
          title: "Grade 8 English - Grammar Quiz",
          description: "Reading comprehension, grammatical syntax, and vocabulary evaluation.",
          type: "QUIZ" as const,
          contextPrefix: "SCH-G8-ENG",
          gradingMode: "MANUAL" as const,
          timeLimitMinutes: 25,
          maxAttempts: 1,
          randomizeQuestions: false,
          randomizeOptions: false,
          showResults: true,
          status: "PUBLISHED" as const,
          sections: grade8Sections.length > 0 ? grade8Sections : allSections.slice(0, 2),
          questionsPool: englishQuestions.length >= 2 ? englishQuestions : allQuestionVersions,
        },
        {
          title: "Grade 7 Math - Midterm Exam",
          description: "Official mid-semester examination covering exponents, fractions, and numeric problem solving.",
          type: "EXAM" as const,
          contextPrefix: "SCH-G7-MATH",
          gradingMode: "AUTOMATIC" as const,
          timeLimitMinutes: 45,
          maxAttempts: 1,
          randomizeQuestions: true,
          randomizeOptions: true,
          showResults: true,
          status: "PUBLISHED" as const,
          sections: grade7Sections.length > 0 ? grade7Sections : allSections.slice(0, 2),
          questionsPool: g7Questions.length >= 3 ? g7Questions : mathQuestions,
        },
        {
          title: "Grade 8 Science - Weekly Assignment",
          description: "Coursework assignment covering living organisms, ecosystem classification, and scientific methods.",
          type: "ASSIGNMENT" as const,
          contextPrefix: "REG-G8-SCI",
          gradingMode: "AUTOMATIC" as const,
          timeLimitMinutes: 40,
          maxAttempts: 2,
          randomizeQuestions: false,
          randomizeOptions: true,
          showResults: true,
          status: "PUBLISHED" as const,
          sections: grade8Sections.length > 0 ? grade8Sections : allSections,
          questionsPool: scienceQuestions.length >= 3 ? scienceQuestions : allQuestionVersions,
        },
      ];

      for (const bp of assessmentBlueprints) {
        const matchedContext = bp.contextPrefix
          ? examContexts.find((c) => c.code.startsWith(bp.contextPrefix))
          : undefined;

        let assessment = await prisma.assessment.findFirst({
          where: {
            tenantId: tenant.id,
            title: bp.title,
          },
        });

        const selectedQuestions = bp.questionsPool.slice(0, 5);

        if (!assessment) {
          assessment = await prisma.assessment.create({
            data: {
              tenantId: tenant.id,
              createdById: fallbackUser.id,
              title: bp.title,
              description: bp.description,
              type: bp.type,
              examContextId: matchedContext?.id ?? null,
              gradingMode: bp.gradingMode,
              timeLimitMinutes: bp.timeLimitMinutes,
              maxAttempts: bp.maxAttempts,
              randomizeQuestions: bp.randomizeQuestions,
              randomizeOptions: bp.randomizeOptions,
              showResults: bp.showResults,
              status: bp.status,
              questions: {
                create: selectedQuestions.map((qv, idx) => ({
                  questionVersionId: qv.id,
                  orderIndex: idx + 1,
                  points: qv.points,
                })),
              },
            },
          });
        } else {
          const currentCount = await prisma.assessmentQuestion.count({
            where: { assessmentId: assessment.id },
          });

          if (currentCount === 0 && selectedQuestions.length > 0) {
            for (let idx = 0; idx < selectedQuestions.length; idx++) {
              const qv = selectedQuestions[idx];
              await prisma.assessmentQuestion.create({
                data: {
                  assessmentId: assessment.id,
                  questionVersionId: qv.id,
                  orderIndex: idx + 1,
                  points: qv.points,
                },
              });
            }
          }
        }

        if (bp.sections.length > 0) {
          for (const section of bp.sections) {
            await prisma.assessmentAssignment.upsert({
              where: {
                assessmentId_sectionId: {
                  assessmentId: assessment.id,
                  sectionId: section.id,
                },
              },
              update: {
                status: "PUBLISHED",
                dueAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
              },
              create: {
                assessmentId: assessment.id,
                sectionId: section.id,
                createdById: fallbackUser.id,
                status: "PUBLISHED",
                dueAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
              },
            });
          }
        }
      }
    }
  });
}
