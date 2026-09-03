import { prisma, runWithoutTenant } from "../../../../lib/prisma.js";
import {
  generateUnitCode,
  generateTopicCode,
  generateObjectiveCode,
} from "../../../../shared/utils/generators.js";

export interface ExistingStructureContext {
  readonly version: {
    readonly id: string;
    readonly code: string;
    readonly name: string;
    readonly status: string;
    readonly curriculum: {
      readonly id: string;
      readonly name: string;
      readonly tenantId: string | null;
      readonly scope: string;
      readonly status: string;
    };
  };
  readonly grades: readonly {
    readonly id: string;
    readonly level: number;
  }[];
  readonly subjects: readonly {
    readonly id: string;
    readonly name: string;
    readonly code: string;
  }[];
  readonly existingSubjects: readonly {
    readonly id: string;
    readonly gradeId: string;
    readonly subjectId: string;
    readonly units: readonly {
      readonly id: string;
      readonly code: string;
      readonly title: string;
      readonly orderIndex: number;
      readonly topics: readonly {
        readonly id: string;
        readonly code: string;
        readonly title: string;
        readonly orderIndex: number;
        readonly objectives: readonly {
          readonly id: string;
          readonly code: string;
          readonly statement: string;
          readonly orderIndex: number;
        }[];
      }[];
    }[];
  }[];
}

export interface ImportTransactionPayloadItem {
  readonly gradeId: string;
  readonly subjectId: string;
  readonly unitTitle: string;
  readonly unitCode?: string | null;
  readonly unitDescription?: string | null;
  readonly topicTitle: string;
  readonly topicCode?: string | null;
  readonly topicDescription?: string | null;
  readonly objectiveStatement: string;
  readonly objectiveCode?: string | null;
  readonly objectiveDescription?: string | null;
  readonly externalId?: string | null;
}

export class CurriculumImportRepository {
  async loadStructureContext(
    tenantId: string | null,
    versionId: string
  ): Promise<ExistingStructureContext | null> {
    const version = await runWithoutTenant(() =>
      prisma.curriculumVersion.findUnique({
        where: { id: versionId },
        include: {
          curriculum: true,
          subjects: {
            include: {
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
          },
        },
      })
    );

    if (!version) return null;

    const gradesWhere = tenantId ? { tenantId } : {};

    const [grades, subjects] = await runWithoutTenant(() =>
      Promise.all([
        prisma.grade.findMany({
          where: gradesWhere,
          orderBy: { level: "asc" },
          select: { id: true, level: true },
        }),
        prisma.subject.findMany({
          where: { isActive: true },
          orderBy: { name: "asc" },
          select: { id: true, name: true, code: true },
        }),
      ])
    );

    return {
      version: {
        id: version.id,
        code: version.code,
        name: version.name,
        status: version.status,
        curriculum: {
          id: version.curriculum.id,
          name: version.curriculum.name,
          tenantId: version.curriculum.tenantId,
          scope: version.curriculum.scope,
          status: version.curriculum.status,
        },
      },
      grades,
      subjects,
      existingSubjects: version.subjects.map((s) => ({
        id: s.id,
        gradeId: s.gradeId,
        subjectId: s.subjectId,
        units: s.units.map((u) => ({
          id: u.id,
          code: u.code,
          title: u.title,
          orderIndex: u.orderIndex,
          topics: u.topics.map((t) => ({
            id: t.id,
            code: t.code,
            title: t.title,
            orderIndex: t.orderIndex,
            objectives: t.objectives.map((o) => ({
              id: o.id,
              code: o.code,
              statement: o.statement,
              orderIndex: o.orderIndex,
            })),
          })),
        })),
      })),
    };
  }

  async executeImportTransaction(
    versionId: string,
    items: readonly ImportTransactionPayloadItem[]
  ): Promise<{
    createdSubjects: number;
    createdUnits: number;
    createdTopics: number;
    createdObjectives: number;
    skippedDuplicates: number;
  }> {
    return runWithoutTenant(async () => {
      return prisma.$transaction(async (tx) => {
        let createdSubjects = 0;
        let createdUnits = 0;
        let createdTopics = 0;
        let createdObjectives = 0;
        let skippedDuplicates = 0;

        const currentSubjects = await tx.curriculumSubject.findMany({
          where: { curriculumVersionId: versionId },
          include: {
            units: {
              include: {
                topics: {
                  include: {
                    objectives: true,
                  },
                },
              },
            },
          },
        });

        const subjectMap = new Map<string, {
          id: string;
          units: Map<string, {
            id: string;
            code: string;
            orderIndex: number;
            topics: Map<string, {
              id: string;
              code: string;
              orderIndex: number;
              objectives: Set<string>;
              objectiveCount: number;
            }>;
            topicCount: number;
          }>;
          unitCount: number;
        }>();

        for (const sub of currentSubjects) {
          const subKey = `${sub.gradeId}_${sub.subjectId}`;
          const unitsMap = new Map();

          for (const u of sub.units) {
            const topicsMap = new Map();
            for (const t of u.topics) {
              const objSet = new Set(
                t.objectives.map((o) => o.statement.trim().toLowerCase())
              );
              topicsMap.set(t.title.trim().toLowerCase(), {
                id: t.id,
                code: t.code,
                orderIndex: t.orderIndex,
                objectives: objSet,
                objectiveCount: t.objectives.length,
              });
            }

            unitsMap.set(u.title.trim().toLowerCase(), {
              id: u.id,
              code: u.code,
              orderIndex: u.orderIndex,
              topics: topicsMap,
              topicCount: u.topics.length,
            });
          }

          subjectMap.set(subKey, {
            id: sub.id,
            units: unitsMap,
            unitCount: sub.units.length,
          });
        }

        for (const item of items) {
          const subKey = `${item.gradeId}_${item.subjectId}`;
          let subjectEntry = subjectMap.get(subKey);

          if (!subjectEntry) {
            const createdSub = await tx.curriculumSubject.create({
              data: {
                curriculumVersionId: versionId,
                gradeId: item.gradeId,
                subjectId: item.subjectId,
                externalId: item.externalId || null,
              },
            });
            createdSubjects += 1;
            subjectEntry = {
              id: createdSub.id,
              units: new Map(),
              unitCount: 0,
            };
            subjectMap.set(subKey, subjectEntry);
          }

          const unitKey = item.unitTitle.trim().toLowerCase();
          let unitEntry = subjectEntry.units.get(unitKey);

          if (!unitEntry) {
            const unitOrder = subjectEntry.unitCount + 1;
            const unitCode = item.unitCode?.trim() || generateUnitCode(unitOrder);

            const createdUnit = await tx.curriculumUnit.create({
              data: {
                curriculumSubjectId: subjectEntry.id,
                code: unitCode,
                title: item.unitTitle.trim(),
                description: item.unitDescription?.trim() || null,
                orderIndex: unitOrder,
                externalId: item.externalId || null,
              },
            });
            createdUnits += 1;
            subjectEntry.unitCount += 1;
            unitEntry = {
              id: createdUnit.id,
              code: createdUnit.code,
              orderIndex: unitOrder,
              topics: new Map(),
              topicCount: 0,
            };
            subjectEntry.units.set(unitKey, unitEntry);
          }

          const topicKey = item.topicTitle.trim().toLowerCase();
          let topicEntry = unitEntry.topics.get(topicKey);

          if (!topicEntry) {
            const topicOrder = unitEntry.topicCount + 1;
            const topicCode =
              item.topicCode?.trim() ||
              generateTopicCode(unitEntry.code, topicOrder);

            const createdTopic = await tx.curriculumTopic.create({
              data: {
                unitId: unitEntry.id,
                code: topicCode,
                title: item.topicTitle.trim(),
                description: item.topicDescription?.trim() || null,
                orderIndex: topicOrder,
                externalId: item.externalId || null,
              },
            });
            createdTopics += 1;
            unitEntry.topicCount += 1;
            topicEntry = {
              id: createdTopic.id,
              code: createdTopic.code,
              orderIndex: topicOrder,
              objectives: new Set(),
              objectiveCount: 0,
            };
            unitEntry.topics.set(topicKey, topicEntry);
          }

          const objKey = item.objectiveStatement.trim().toLowerCase();
          if (topicEntry.objectives.has(objKey)) {
            skippedDuplicates += 1;
            continue;
          }

          const objOrder = topicEntry.objectiveCount + 1;
          const objCode =
            item.objectiveCode?.trim() ||
            generateObjectiveCode(topicEntry.code, objOrder);

          await tx.learningObjective.create({
            data: {
              topicId: topicEntry.id,
              code: objCode,
              statement: item.objectiveStatement.trim(),
              description: item.objectiveDescription?.trim() || null,
              orderIndex: objOrder,
              externalId: item.externalId || null,
            },
          });
          createdObjectives += 1;
          topicEntry.objectiveCount += 1;
          topicEntry.objectives.add(objKey);
        }

        return {
          createdSubjects,
          createdUnits,
          createdTopics,
          createdObjectives,
          skippedDuplicates,
        };
      });
    });
  }
}

export const curriculumImportRepository = new CurriculumImportRepository();
