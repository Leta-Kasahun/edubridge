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
          qv.question.type === "NUMERIC"
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
        return bank.includes("math") || qv.question.type === "NUMERIC";
      });

      const scienceQuestions = allQuestionVersions.filter((qv) => {
        const bank = qv.question.questionBank?.name.toLowerCase() || "";
        return bank.includes("science") || qv.question.type === "TRUE_FALSE";
      });

      const englishQuestions = allQuestionVersions.filter((qv) => {
        const bank = qv.question.questionBank?.name.toLowerCase() || "";
        return bank.includes("english") || qv.question.type === "SHORT_ANSWER";
      });

      const assessmentBlueprints = [
        {
          title: "Grade 7 Mathematics Diagnostic Quiz",
          description: "Assessment evaluating linear equations, rational numbers, operations, and basic arithmetic.",
          type: "QUIZ" as const,
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
          title: "Grade 7 General Science Practical Assessment",
          description: "Curriculum test covering living organisms, ecosystem classification, and scientific methods.",
          type: "ASSIGNMENT" as const,
          gradingMode: "AUTOMATIC" as const,
          timeLimitMinutes: 35,
          maxAttempts: 2,
          randomizeQuestions: true,
          randomizeOptions: true,
          showResults: true,
          status: "PUBLISHED" as const,
          sections: grade7Sections.length > 0 ? grade7Sections : allSections.slice(0, 2),
          questionsPool: scienceQuestions.length >= 3 ? scienceQuestions : allQuestionVersions,
        },
        {
          title: "Grade 8 Mathematics Midterm Examination",
          description: "Comprehensive mid-semester examination covering coordinate geometry, exponents, and system of linear equations.",
          type: "EXAM" as const,
          gradingMode: "AUTOMATIC" as const,
          timeLimitMinutes: 45,
          maxAttempts: 1,
          randomizeQuestions: true,
          randomizeOptions: true,
          showResults: true,
          status: "PUBLISHED" as const,
          sections: grade8Sections.length > 0 ? grade8Sections : allSections.slice(2, 4),
          questionsPool: mathQuestions.length >= 3 ? mathQuestions : g8Questions,
        },
        {
          title: "Grade 8 Integrated Science Diagnostic",
          description: "Standardized evaluation on cell structure, forces, energy transformations, and physical sciences.",
          type: "DIAGNOSTIC" as const,
          gradingMode: "AUTOMATIC" as const,
          timeLimitMinutes: 40,
          maxAttempts: 2,
          randomizeQuestions: false,
          randomizeOptions: true,
          showResults: true,
          status: "PUBLISHED" as const,
          sections: grade8Sections.length > 0 ? grade8Sections : allSections.slice(2, 4),
          questionsPool: scienceQuestions.length >= 3 ? scienceQuestions : g8Questions,
        },
        {
          title: "Grade 8 English Language & Literature Review",
          description: "Reading comprehension, grammatical mechanics, and textual inference test.",
          type: "QUIZ" as const,
          gradingMode: "MANUAL" as const,
          timeLimitMinutes: 40,
          maxAttempts: 1,
          randomizeQuestions: false,
          randomizeOptions: false,
          showResults: true,
          status: "PUBLISHED" as const,
          sections: grade8Sections.length > 0 ? grade8Sections : allSections.slice(0, 2),
          questionsPool: englishQuestions.length >= 2 ? englishQuestions : allQuestionVersions,
        },
        {
          title: "Grade 8 STEM Multi-Discipline Challenge",
          description: "Integrated question set combining mathematics problem-solving, science concepts, and analytical reasoning.",
          type: "PRACTICE" as const,
          gradingMode: "AUTOMATIC" as const,
          timeLimitMinutes: 50,
          maxAttempts: 3,
          randomizeQuestions: true,
          randomizeOptions: true,
          showResults: true,
          status: "PUBLISHED" as const,
          sections: grade8Sections.length > 0 ? grade8Sections : allSections,
          questionsPool: allQuestionVersions,
        },
      ];

      for (const bp of assessmentBlueprints) {
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
