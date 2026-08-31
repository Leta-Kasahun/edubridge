import { prisma } from "../../../../lib/prisma.js";
import { sectionRepository, SectionRepository } from "../repository/section.repository.js";
import {
  SectionRecord,
  SectionDetailRecord,
  CreateSectionInput,
  BulkCreateSectionsInput,
  UpdateSectionInput,
  SectionFilterParams,
} from "../types/section.types.js";
import { SectionStatusType } from "../../../../shared/constants/section.constants.js";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "../../../../shared/exceptions/index.js";

export class SectionService {
  constructor(private readonly repo: SectionRepository = sectionRepository) {}

  async getSections(
    tenantId: string,
    filters: Omit<SectionFilterParams, "tenantId"> = {}
  ): Promise<readonly SectionRecord[]> {
    return this.repo.findMany({
      ...filters,
      tenantId,
    });
  }

  async getSectionById(
    tenantId: string,
    id: string
  ): Promise<SectionDetailRecord> {
    const sec = await this.repo.findById(tenantId, id);
    if (!sec) {
      throw new NotFoundError("Section not found");
    }
    return sec;
  }

  async createSection(
    tenantId: string,
    input: CreateSectionInput
  ): Promise<SectionRecord> {
    const [academicYear, grade] = await Promise.all([
      prisma.academicYear.findFirst({
        where: { id: input.academicYearId, tenantId },
      }),
      prisma.grade.findFirst({
        where: { id: input.gradeId, tenantId },
      }),
    ]);

    if (!academicYear) {
      throw new NotFoundError("Academic year not found");
    }

    if (!grade) {
      throw new NotFoundError("Grade level not found");
    }

    if (input.homeroomTeacherId) {
      const teacher = await prisma.teacherProfile.findFirst({
        where: { id: input.homeroomTeacherId, tenantId },
      });
      if (!teacher) {
        throw new NotFoundError("Homeroom teacher not found");
      }
    }

    const existingName = await this.repo.findByNameAndGrade(
      tenantId,
      input.academicYearId,
      input.gradeId,
      input.name
    );

    if (existingName) {
      throw new ConflictError(
        `Section "${input.name}" already exists for Grade ${grade.level} in ${academicYear.name}`
      );
    }

    const cleanName = input.name.trim().replace(/\s+/g, "_").toUpperCase();
    const generatedCode =
      input.code?.trim().toUpperCase() ||
      `G${grade.level}-${cleanName}-${academicYear.code}`;

    const existingCode = await this.repo.findByCode(
      tenantId,
      input.academicYearId,
      generatedCode
    );

    if (existingCode) {
      throw new ConflictError(
        `Section with code "${generatedCode}" already exists for this academic year`
      );
    }

    return this.repo.create(tenantId, {
      ...input,
      code: generatedCode,
    });
  }

  async bulkCreateSections(
    tenantId: string,
    input: BulkCreateSectionsInput
  ): Promise<{ readonly createdCount: number; readonly totalRequested: number }> {
    const [academicYear, grade] = await Promise.all([
      prisma.academicYear.findFirst({
        where: { id: input.academicYearId, tenantId },
      }),
      prisma.grade.findFirst({
        where: { id: input.gradeId, tenantId },
      }),
    ]);

    if (!academicYear) {
      throw new NotFoundError("Academic year not found");
    }

    if (!grade) {
      throw new NotFoundError("Grade level not found");
    }

    const uniqueNames = Array.from(
      new Set(input.sectionNames.map((n) => n.trim()).filter(Boolean))
    );

    if (uniqueNames.length === 0) {
      throw new BadRequestError("At least one valid section name is required");
    }

    const existingSections = await this.repo.findMany({
      tenantId,
      academicYearId: input.academicYearId,
      gradeId: input.gradeId,
    });

    const existingNameSet = new Set(
      existingSections.map((s) => s.name.trim().toLowerCase())
    );

    const toCreate = uniqueNames
      .filter((name) => !existingNameSet.has(name.toLowerCase()))
      .map((name) => {
        const cleanName = name.replace(/\s+/g, "_").toUpperCase();
        return {
          academicYearId: input.academicYearId,
          gradeId: input.gradeId,
          name,
          code: `G${grade.level}-${cleanName}-${academicYear.code}`,
          capacity: input.capacity ?? null,
        };
      });

    if (toCreate.length === 0) {
      throw new ConflictError("All specified section names already exist for this grade");
    }

    const createdCount = await this.repo.createMany(tenantId, toCreate);

    return {
      createdCount,
      totalRequested: uniqueNames.length,
    };
  }

  async updateSection(
    tenantId: string,
    id: string,
    input: UpdateSectionInput
  ): Promise<SectionRecord> {
    const existing = await this.repo.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundError("Section not found");
    }

    if (input.name && input.name.trim().toLowerCase() !== existing.name.toLowerCase()) {
      const duplicate = await this.repo.findByNameAndGrade(
        tenantId,
        existing.academicYearId,
        existing.gradeId,
        input.name
      );
      if (duplicate && duplicate.id !== id) {
        throw new ConflictError(
          `Another section named "${input.name}" already exists in Grade ${existing.gradeLevel}`
        );
      }
    }

    if (input.homeroomTeacherId) {
      const teacher = await prisma.teacherProfile.findFirst({
        where: { id: input.homeroomTeacherId, tenantId },
      });
      if (!teacher) {
        throw new NotFoundError("Homeroom teacher not found");
      }
    }

    if (
      input.status &&
      (input.status === "INACTIVE" || input.status === "ARCHIVED") &&
      existing.status === "ACTIVE"
    ) {
      const activeStudents = await this.repo.countActiveStudents(tenantId, id);
      if (activeStudents > 0) {
        throw new BadRequestError(
          `Cannot change section "${existing.name}" status to ${input.status.toLowerCase()} because ${activeStudents} active students are currently enrolled. Reassign students first.`
        );
      }
    }

    return this.repo.update(tenantId, id, input);
  }

  async updateStatus(
    tenantId: string,
    id: string,
    status: SectionStatusType
  ): Promise<SectionRecord> {
    const existing = await this.repo.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundError("Section not found");
    }

    if (status === existing.status) {
      return existing;
    }

    if (status === "INACTIVE" || status === "ARCHIVED") {
      const activeStudents = await this.repo.countActiveStudents(tenantId, id);
      if (activeStudents > 0) {
        throw new BadRequestError(
          `Cannot ${status.toLowerCase()} section "${existing.name}" because ${activeStudents} active students are currently enrolled. Reassign or graduate students first.`
        );
      }
    }

    return this.repo.updateStatus(tenantId, id, status);
  }

  async deleteSection(tenantId: string, id: string): Promise<void> {
    const existing = await this.repo.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundError("Section not found");
    }

    const activeStudents = await this.repo.countActiveStudents(tenantId, id);
    if (activeStudents > 0) {
      throw new BadRequestError(
        `Cannot delete section "${existing.name}" because ${activeStudents} active students are enrolled. Reassign students or archive the section instead.`
      );
    }

    await this.repo.delete(tenantId, id);
  }
}

export const sectionService = new SectionService();
