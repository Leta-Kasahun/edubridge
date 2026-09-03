import { prisma, runWithoutTenant } from "../../../../lib/prisma.js";
import {
  CurriculumTreeView,
  CurriculumTreeSubject,
  CurriculumTreeUnit,
  CurriculumTreeTopic,
} from "../types/structure.types.js";

export class TreeRepository {
  async getStructureTree(versionId: string): Promise<CurriculumTreeView | null> {
    const version = await runWithoutTenant(() =>
      prisma.curriculumVersion.findUnique({
        where: { id: versionId },
        include: {
          curriculum: true,
          subjects: {
            include: {
              grade: true,
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
            orderBy: [
              { grade: { level: "asc" } },
              { subject: { name: "asc" } },
            ],
          },
        },
      })
    );

    if (!version) return null;

    const subjects: CurriculumTreeSubject[] = version.subjects.map((s) => {
      const units: CurriculumTreeUnit[] = s.units.map((u) => {
        const topics: CurriculumTreeTopic[] = u.topics.map((t) => ({
          id: t.id,
          unitId: t.unitId,
          code: t.code,
          title: t.title,
          description: t.description,
          orderIndex: t.orderIndex,
          externalId: t.externalId,
          objectiveCount: t.objectives.length,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          objectives: t.objectives.map((o) => ({
            id: o.id,
            topicId: o.topicId,
            code: o.code,
            statement: o.statement,
            description: o.description,
            orderIndex: o.orderIndex,
            externalId: o.externalId,
            createdAt: o.createdAt,
            updatedAt: o.updatedAt,
          })),
        }));

        return {
          id: u.id,
          curriculumSubjectId: u.curriculumSubjectId,
          code: u.code,
          title: u.title,
          description: u.description,
          orderIndex: u.orderIndex,
          externalId: u.externalId,
          topicCount: u.topics.length,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
          topics,
        };
      });

      return {
        id: s.id,
        curriculumVersionId: s.curriculumVersionId,
        gradeId: s.gradeId,
        gradeLevel: s.grade.level,
        subjectId: s.subjectId,
        subjectName: s.subject.name,
        subjectCode: s.subject.code,
        externalId: s.externalId,
        unitCount: s.units.length,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        units,
      };
    });

    return {
      curriculumId: version.curriculum.id,
      curriculumName: version.curriculum.name,
      versionId: version.id,
      versionCode: version.code,
      versionName: version.name,
      subjects,
    };
  }
}

export const treeRepository = new TreeRepository();
