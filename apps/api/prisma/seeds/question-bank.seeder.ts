import { prisma, runWithoutTenant } from "../../src/lib/prisma.js";
import { GRADE_8_MATH_MCQ_QUESTIONS, SeedQuestion } from "../data/question-seeds.data.js";
import {
  GRADE_8_SCIENCE_TF_QUESTIONS,
  GRADE_8_ENGLISH_SHORT_ANSWER_QUESTIONS,
  GRADE_7_MATH_NUMERIC_QUESTIONS,
} from "../data/science-english-seeds.data.js";
import { GRADE_8_MIXED_ASSESSMENT_QUESTIONS } from "../data/mixed-seeds.data.js";

interface BankSeedConfig {
  readonly name: string;
  readonly description: string;
  readonly gradeLevel: number;
  readonly subjectCode: string;
  readonly contextCode: string;
  readonly questions: readonly SeedQuestion[];
}

export async function seedQuestionBanksAndContexts(tenantId?: string) {
  return runWithoutTenant(async () => {
    const tenants = tenantId
      ? await prisma.tenant.findMany({ where: { id: tenantId } })
      : await prisma.tenant.findMany({ where: { status: "ACTIVE" } });

    for (const tenant of tenants) {
      const adminUser = await prisma.user.findFirst({
        where: {
          memberships: {
            some: { tenantId: tenant.id },
          },
        },
      });

      if (!adminUser) {
        continue;
      }

      const grades = await prisma.grade.findMany({
        where: { tenantId: tenant.id },
      });
      const subjects = await prisma.subject.findMany();

      const grade7 = grades.find((g) => g.level === 7);
      const grade8 = grades.find((g) => g.level === 8);

      const mathSubject =
        subjects.find((s) => s.code?.toUpperCase() === "MATH" || s.name.toLowerCase().includes("math")) ||
        subjects[0];
      const scienceSubject =
        subjects.find((s) => s.code?.toUpperCase().includes("SCI") || s.name.toLowerCase().includes("science")) ||
        subjects[0];
      const englishSubject =
        subjects.find((s) => s.code?.toUpperCase() === "ENG" || s.name.toLowerCase().includes("english")) ||
        subjects[0];

      const examContextsDefs = [
        {
          code: `NAT-G8-MATH-2016-${tenant.code}`,
          name: "2016 National PSLCE (Grade 8 Math)",
          scope: "NATIONAL" as const,
          gradeId: grade8?.id,
          subjectId: mathSubject?.id,
          examYear: 2016,
        },
        {
          code: `REG-G8-SCI-2017-${tenant.code}`,
          name: "2017 Regional Exam (Grade 8 Science)",
          scope: "REGIONAL" as const,
          gradeId: grade8?.id,
          subjectId: scienceSubject?.id,
          examYear: 2017,
        },
        {
          code: `SCH-G7-MATH-2018-${tenant.code}`,
          name: "2018 School Midterm (Grade 7 Math)",
          scope: "SCHOOL" as const,
          gradeId: grade7?.id,
          subjectId: mathSubject?.id,
          examYear: 2018,
        },
        {
          code: `SCH-G8-ENG-2018-${tenant.code}`,
          name: "2018 School Diagnostic (Grade 8 English)",
          scope: "SCHOOL" as const,
          gradeId: grade8?.id,
          subjectId: englishSubject?.id,
          examYear: 2018,
        },
      ];

      const createdContexts = new Map<string, string>();

      for (const ec of examContextsDefs) {
        const context = await prisma.examContext.upsert({
          where: {
            tenantId_code: {
              tenantId: tenant.id,
              code: ec.code,
            },
          },
          update: {
            name: ec.name,
            scope: ec.scope,
            gradeId: ec.gradeId,
            subjectId: ec.subjectId,
            examYear: ec.examYear,
            status: "ACTIVE",
          },
          create: {
            tenantId: tenant.id,
            code: ec.code,
            name: ec.name,
            scope: ec.scope,
            gradeId: ec.gradeId,
            subjectId: ec.subjectId,
            examYear: ec.examYear,
            status: "ACTIVE",
          },
        });
        createdContexts.set(ec.code, context.id);
      }

      const bankConfigs: readonly BankSeedConfig[] = [
        {
          name: "Grade 8 Math - National Exam Bank",
          description: "20 curriculum-aligned multiple choice questions from past Grade 8 National Exams.",
          gradeLevel: 8,
          subjectCode: "MATH",
          contextCode: `NAT-G8-MATH-2016-${tenant.code}`,
          questions: GRADE_8_MATH_MCQ_QUESTIONS,
        },
        {
          name: "Grade 8 Science - Regional Exam Bank",
          description: "20 conceptual True/False questions for Grade 8 Regional Science evaluations.",
          gradeLevel: 8,
          subjectCode: "SCI",
          contextCode: `REG-G8-SCI-2017-${tenant.code}`,
          questions: GRADE_8_SCIENCE_TF_QUESTIONS,
        },
        {
          name: "Grade 8 English - Grammar & Syntax Bank",
          description: "20 short answer questions assessing English syntax, vocabulary, and grammar.",
          gradeLevel: 8,
          subjectCode: "ENG",
          contextCode: `SCH-G8-ENG-2018-${tenant.code}`,
          questions: GRADE_8_ENGLISH_SHORT_ANSWER_QUESTIONS,
        },
        {
          name: "Grade 7 Math - Problem Solving Bank",
          description: "20 numeric calculation and arithmetic problem solving questions.",
          gradeLevel: 7,
          subjectCode: "MATH",
          contextCode: `SCH-G7-MATH-2018-${tenant.code}`,
          questions: GRADE_7_MATH_NUMERIC_QUESTIONS,
        },
        {
          name: "Grade 8 Mixed - Final Review Bank",
          description: "20 mixed-format questions (MCQ, True/False, Short Answer, Numeric) for end-of-term evaluations.",
          gradeLevel: 8,
          subjectCode: "MATH",
          contextCode: `NAT-G8-MATH-2016-${tenant.code}`,
          questions: GRADE_8_MIXED_ASSESSMENT_QUESTIONS,
        },
      ];

      for (const config of bankConfigs) {
        const contextId = createdContexts.get(config.contextCode);

        let bank = await prisma.questionBank.findFirst({
          where: {
            tenantId: tenant.id,
            name: config.name,
          },
        });

        if (!bank) {
          bank = await prisma.questionBank.create({
            data: {
              tenantId: tenant.id,
              name: config.name,
              description: config.description,
              status: "ACTIVE",
              createdById: adminUser.id,
              examContexts: contextId
                ? {
                    connect: { id: contextId },
                  }
                : undefined,
            },
          });
        }

        const existingCount = await prisma.question.count({
          where: { questionBankId: bank.id },
        });

        if (existingCount < config.questions.length) {
          for (let i = 0; i < config.questions.length; i++) {
            const q = config.questions[i];

            await prisma.question.create({
              data: {
                questionBankId: bank.id,
                source: "TEACHER",
                status: "PUBLISHED",
                currentVersion: 1,
                createdById: adminUser.id,
                versions: {
                  create: {
                    version: 1,
                    type: q.type,
                    difficulty: q.difficulty,
                    questionText: q.prompt,
                    explanation: q.explanation || null,
                    points: q.points,
                    gradingStatus: "AUTO_GRADED",
                    configuration: q.options
                      ? {
                          options: q.options.map((opt) => ({
                            id: `opt-${i}-${opt.orderIndex}`,
                            text: opt.text,
                            isCorrect: opt.isCorrect,
                            orderIndex: opt.orderIndex,
                          })),
                        }
                      : {},
                    createdById: adminUser.id,
                    publishedAt: new Date(),
                  },
                },
              },
            });
          }
        }
      }
    }
  });
}
