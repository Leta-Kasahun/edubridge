import { prisma, runWithoutTenant } from "../../../../lib/prisma.js";
import {
  CurriculumSubjectRecord,
  CreateCurriculumSubjectInput,
} from "../types/structure.types.js";

export class SubjectRepository {
  async findSubjectsByVersionId(
    versionId: string
  ): Promise<readonly CurriculumSubjectRecord[]> {
    const subjects = await runWithoutTenant(() =>
      prisma.curriculumSubject.findMany({
        where: { curriculumVersionId: versionId },
        include: {
          grade: true,
          subject: true,
          _count: {
            select: { units: true },
          },
        },
        orderBy: [
          { grade: { level: "asc" } },
          { subject: { name: "asc" } },
        ],
      })
    );

    return subjects.map((s) => ({
      id: s.id,
      curriculumVersionId: s.curriculumVersionId,
      gradeId: s.gradeId,
      gradeLevel: s.grade.level,
      subjectId: s.subjectId,
      subjectName: s.subject.name,
      subjectCode: s.subject.code,
      externalId: s.externalId,
      unitCount: s._count.units,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  }

  async findSubjectById(id: string): Promise<CurriculumSubjectRecord | null> {
    const subject = await runWithoutTenant(() =>
      prisma.curriculumSubject.findUnique({
        where: { id },
        include: {
          grade: true,
          subject: true,
          _count: {
            select: { units: true },
          },
        },
      })
    );

    if (!subject) return null;

    return {
      id: subject.id,
      curriculumVersionId: subject.curriculumVersionId,
      gradeId: subject.gradeId,
      gradeLevel: subject.grade.level,
      subjectId: subject.subjectId,
      subjectName: subject.subject.name,
      subjectCode: subject.subject.code,
      externalId: subject.externalId,
      unitCount: subject._count.units,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt,
    };
  }

  async createSubject(
    input: CreateCurriculumSubjectInput
  ): Promise<CurriculumSubjectRecord> {
    const created = await runWithoutTenant(() =>
      prisma.curriculumSubject.create({
        data: {
          curriculumVersionId: input.curriculumVersionId,
          gradeId: input.gradeId,
          subjectId: input.subjectId,
          externalId: input.externalId,
        },
        include: {
          grade: true,
          subject: true,
          _count: {
            select: { units: true },
          },
        },
      })
    );

    return {
      id: created.id,
      curriculumVersionId: created.curriculumVersionId,
      gradeId: created.gradeId,
      gradeLevel: created.grade.level,
      subjectId: created.subjectId,
      subjectName: created.subject.name,
      subjectCode: created.subject.code,
      externalId: created.externalId,
      unitCount: created._count.units,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  async deleteSubject(id: string): Promise<void> {
    await runWithoutTenant(() =>
      prisma.curriculumSubject.delete({
        where: { id },
      })
    );
  }

  async getCurriculumSubjectContext(id: string) {
    return runWithoutTenant(() =>
      prisma.curriculumSubject.findUnique({
        where: { id },
        include: {
          curriculumVersion: {
            include: {
              curriculum: true,
            },
          },
        },
      })
    );
  }
}

export const subjectRepository = new SubjectRepository();
