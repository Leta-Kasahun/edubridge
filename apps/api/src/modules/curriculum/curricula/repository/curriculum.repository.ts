import { prisma } from "../../../../lib/prisma.js";
import { Prisma } from "../../../../generated/prisma/client.js";
import {
  CurriculumFilterParams,
  CurriculumRecord,
  CurriculumDetailRecord,
  CurriculumVersionRecord,
  CreateCurriculumInput,
  UpdateCurriculumInput,
  CreateCurriculumVersionInput,
  UpdateCurriculumVersionInput,
  PaginatedCurriculaResult,
} from "../types/curriculum.types.js";
import {
  CurriculumStatusType,
  CurriculumVersionStatusType,
  DEFAULT_CURRICULUM_PAGE_LIMIT,
} from "../../../../shared/constants/curriculum.constants.js";

export class CurriculumRepository {
  async findMany(
    params: CurriculumFilterParams
  ): Promise<PaginatedCurriculaResult> {
    const {
      tenantId,
      search,
      scope,
      status,
      version,
      page = 1,
      limit = DEFAULT_CURRICULUM_PAGE_LIMIT,
    } = params;

    const where: Prisma.CurriculumWhereInput = {};

    if (tenantId) {
      where.OR = [{ tenantId }, { scope: "SYSTEM" }];
    } else {
      where.scope = "SYSTEM";
    }

    if (scope) {
      where.scope = scope;
    }

    if (status) {
      where.status = status;
    }

    if (version && version.trim()) {
      const vTerm = version.trim();
      where.versions = {
        some: {
          OR: [
            { code: { contains: vTerm, mode: "insensitive" } },
            { name: { contains: vTerm, mode: "insensitive" } },
          ],
        },
      };
    }

    if (search && search.trim()) {
      const searchTerm = search.trim();
      where.AND = [
        {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { code: { contains: searchTerm, mode: "insensitive" } },
            { authorityName: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
      ];
    }

    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      prisma.curriculum.count({ where }),
      prisma.curriculum.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
        include: {
          _count: {
            select: {
              versions: true,
            },
          },
          versions: {
            orderBy: { createdAt: "desc" },
            select: { id: true, name: true, status: true },
          },
        },
      }),
    ]);

    const data: readonly CurriculumRecord[] = items.map((c) => {
      const activeVer = c.versions.find((v) => v.status === "ACTIVE") ?? c.versions[0] ?? null;
      return {
        id: c.id,
        tenantId: c.tenantId,
        code: c.code,
        name: c.name,
        description: c.description,
        scope: c.scope,
        status: c.status,
        authorityName: c.authorityName,
        externalId: c.externalId,
        versionCount: c._count.versions,
        activeVersionId: activeVer?.id ?? null,
        activeVersionName: activeVer?.name ?? null,
        versionNames: c.versions.map((v) => v.name),
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findById(
    tenantId: string | null,
    id: string
  ): Promise<CurriculumDetailRecord | null> {
    const where: Prisma.CurriculumWhereInput = { id };
    if (tenantId) {
      where.OR = [{ tenantId }, { scope: "SYSTEM" }];
    }

    const curriculum = await prisma.curriculum.findFirst({
      where,
      include: {
        _count: {
          select: {
            versions: true,
          },
        },
        versions: {
          orderBy: { createdAt: "desc" },
          include: {
            _count: {
              select: {
                subjects: true,
              },
            },
          },
        },
      },
    });

    if (!curriculum) return null;

    const activeVersion = curriculum.versions.find((v) => v.status === "ACTIVE");

    const versions: readonly CurriculumVersionRecord[] = curriculum.versions.map(
      (v) => ({
        id: v.id,
        curriculumId: v.curriculumId,
        code: v.code,
        name: v.name,
        description: v.description,
        effectiveFrom: v.effectiveFrom,
        effectiveTo: v.effectiveTo,
        status: v.status,
        externalId: v.externalId,
        subjectCount: v._count.subjects,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
      })
    );

    return {
      id: curriculum.id,
      tenantId: curriculum.tenantId,
      code: curriculum.code,
      name: curriculum.name,
      description: curriculum.description,
      scope: curriculum.scope,
      status: curriculum.status,
      authorityName: curriculum.authorityName,
      externalId: curriculum.externalId,
      versionCount: curriculum._count.versions,
      activeVersionId: activeVersion?.id ?? null,
      createdAt: curriculum.createdAt,
      updatedAt: curriculum.updatedAt,
      versions,
    };
  }

  async findByCode(
    tenantId: string | null,
    code: string
  ): Promise<CurriculumRecord | null> {
    const curriculum = await prisma.curriculum.findFirst({
      where: {
        tenantId: tenantId ?? null,
        code,
      },
      include: {
        _count: {
          select: {
            versions: true,
          },
        },
        versions: {
          where: { status: "ACTIVE" },
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!curriculum) return null;

    return {
      id: curriculum.id,
      tenantId: curriculum.tenantId,
      code: curriculum.code,
      name: curriculum.name,
      description: curriculum.description,
      scope: curriculum.scope,
      status: curriculum.status,
      authorityName: curriculum.authorityName,
      externalId: curriculum.externalId,
      versionCount: curriculum._count.versions,
      activeVersionId: curriculum.versions[0]?.id ?? null,
      createdAt: curriculum.createdAt,
      updatedAt: curriculum.updatedAt,
    };
  }

  async create(
    tenantId: string | null,
    input: CreateCurriculumInput
  ): Promise<CurriculumDetailRecord> {
    const targetTenantId = input.scope === "SYSTEM" ? null : tenantId;
    const finalCode = input.code || "CUR";

    const result = await prisma.$transaction(async (tx) => {
      const curriculum = await tx.curriculum.create({
        data: {
          tenantId: targetTenantId,
          code: finalCode,
          name: input.name,
          description: input.description,
          scope: input.scope ?? "TENANT",
          status: "DRAFT",
          authorityName: input.authorityName,
          externalId: input.externalId,
        },
      });

      const initialVersion = await tx.curriculumVersion.create({
        data: {
          curriculumId: curriculum.id,
          code: input.initialVersionCode || "v1.0",
          name: input.initialVersionName || "Version 1.0",
          status: "DRAFT",
        },
      });

      return { curriculum, initialVersion };
    });

    const initialVersionRecord: CurriculumVersionRecord = {
      id: result.initialVersion.id,
      curriculumId: result.initialVersion.curriculumId,
      code: result.initialVersion.code,
      name: result.initialVersion.name,
      description: result.initialVersion.description,
      effectiveFrom: result.initialVersion.effectiveFrom,
      effectiveTo: result.initialVersion.effectiveTo,
      status: result.initialVersion.status,
      externalId: result.initialVersion.externalId,
      subjectCount: 0,
      createdAt: result.initialVersion.createdAt,
      updatedAt: result.initialVersion.updatedAt,
    };

    return {
      id: result.curriculum.id,
      tenantId: result.curriculum.tenantId,
      code: result.curriculum.code,
      name: result.curriculum.name,
      description: result.curriculum.description,
      scope: result.curriculum.scope,
      status: result.curriculum.status,
      authorityName: result.curriculum.authorityName,
      externalId: result.curriculum.externalId,
      versionCount: 1,
      activeVersionId: null,
      createdAt: result.curriculum.createdAt,
      updatedAt: result.curriculum.updatedAt,
      versions: [initialVersionRecord],
    };
  }

  async update(
    id: string,
    input: UpdateCurriculumInput
  ): Promise<CurriculumRecord> {
    const updated = await prisma.curriculum.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.authorityName !== undefined ? { authorityName: input.authorityName } : {}),
        ...(input.externalId !== undefined ? { externalId: input.externalId } : {}),
      },
      include: {
        _count: {
          select: {
            versions: true,
          },
        },
        versions: {
          where: { status: "ACTIVE" },
          select: { id: true },
          take: 1,
        },
      },
    });

    return {
      id: updated.id,
      tenantId: updated.tenantId,
      code: updated.code,
      name: updated.name,
      description: updated.description,
      scope: updated.scope,
      status: updated.status,
      authorityName: updated.authorityName,
      externalId: updated.externalId,
      versionCount: updated._count.versions,
      activeVersionId: updated.versions[0]?.id ?? null,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async setStatus(
    id: string,
    status: CurriculumStatusType
  ): Promise<CurriculumRecord> {
    const updated = await prisma.curriculum.update({
      where: { id },
      data: { status },
      include: {
        _count: {
          select: {
            versions: true,
          },
        },
        versions: {
          where: { status: "ACTIVE" },
          select: { id: true },
          take: 1,
        },
      },
    });

    return {
      id: updated.id,
      tenantId: updated.tenantId,
      code: updated.code,
      name: updated.name,
      description: updated.description,
      scope: updated.scope,
      status: updated.status,
      authorityName: updated.authorityName,
      externalId: updated.externalId,
      versionCount: updated._count.versions,
      activeVersionId: updated.versions[0]?.id ?? null,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async findVersionById(
    versionId: string
  ): Promise<CurriculumVersionRecord | null> {
    const version = await prisma.curriculumVersion.findUnique({
      where: { id: versionId },
      include: {
        _count: {
          select: {
            subjects: true,
          },
        },
      },
    });

    if (!version) return null;

    return {
      id: version.id,
      curriculumId: version.curriculumId,
      code: version.code,
      name: version.name,
      description: version.description,
      effectiveFrom: version.effectiveFrom,
      effectiveTo: version.effectiveTo,
      status: version.status,
      externalId: version.externalId,
      subjectCount: version._count.subjects,
      createdAt: version.createdAt,
      updatedAt: version.updatedAt,
    };
  }

  async findVersionByCode(
    curriculumId: string,
    code: string
  ): Promise<CurriculumVersionRecord | null> {
    const version = await prisma.curriculumVersion.findFirst({
      where: { curriculumId, code },
      include: {
        _count: {
          select: {
            subjects: true,
          },
        },
      },
    });

    if (!version) return null;

    return {
      id: version.id,
      curriculumId: version.curriculumId,
      code: version.code,
      name: version.name,
      description: version.description,
      effectiveFrom: version.effectiveFrom,
      effectiveTo: version.effectiveTo,
      status: version.status,
      externalId: version.externalId,
      subjectCount: version._count.subjects,
      createdAt: version.createdAt,
      updatedAt: version.updatedAt,
    };
  }

  async createVersion(
    curriculumId: string,
    input: CreateCurriculumVersionInput
  ): Promise<CurriculumVersionRecord> {
    const versionCode = input.code || "v1.0";
    const versionName = input.name || "Version 1.0";

    const created = await prisma.curriculumVersion.create({
      data: {
        curriculumId,
        code: versionCode,
        name: versionName,
        description: input.description,
        effectiveFrom: input.effectiveFrom ? new Date(input.effectiveFrom) : null,
        effectiveTo: input.effectiveTo ? new Date(input.effectiveTo) : null,
        externalId: input.externalId,
        status: "DRAFT",
      },
      include: {
        _count: {
          select: {
            subjects: true,
          },
        },
      },
    });

    return {
      id: created.id,
      curriculumId: created.curriculumId,
      code: created.code,
      name: created.name,
      description: created.description,
      effectiveFrom: created.effectiveFrom,
      effectiveTo: created.effectiveTo,
      status: created.status,
      externalId: created.externalId,
      subjectCount: (created as { _count?: { subjects: number } })._count?.subjects ?? 0,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  async updateVersion(
    versionId: string,
    input: UpdateCurriculumVersionInput
  ): Promise<CurriculumVersionRecord> {
    const updated = await prisma.curriculumVersion.update({
      where: { id: versionId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.effectiveFrom !== undefined
          ? { effectiveFrom: input.effectiveFrom ? new Date(input.effectiveFrom) : null }
          : {}),
        ...(input.effectiveTo !== undefined
          ? { effectiveTo: input.effectiveTo ? new Date(input.effectiveTo) : null }
          : {}),
        ...(input.externalId !== undefined ? { externalId: input.externalId } : {}),
      },
      include: {
        _count: {
          select: {
            subjects: true,
          },
        },
      },
    });

    return {
      id: updated.id,
      curriculumId: updated.curriculumId,
      code: updated.code,
      name: updated.name,
      description: updated.description,
      effectiveFrom: updated.effectiveFrom,
      effectiveTo: updated.effectiveTo,
      status: updated.status,
      externalId: updated.externalId,
      subjectCount: updated._count.subjects,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async setVersionStatus(
    curriculumId: string,
    versionId: string,
    status: CurriculumVersionStatusType
  ): Promise<CurriculumVersionRecord> {
    const updated = await prisma.$transaction(async (tx) => {
      if (status === "ACTIVE") {
        await tx.curriculumVersion.updateMany({
          where: { curriculumId, status: "ACTIVE", id: { not: versionId } },
          data: { status: "ARCHIVED" },
        });
      }

      return tx.curriculumVersion.update({
        where: { id: versionId },
        data: { status },
        include: {
          _count: {
            select: {
              subjects: true,
            },
          },
        },
      });
    });

    return {
      id: updated.id,
      curriculumId: updated.curriculumId,
      code: updated.code,
      name: updated.name,
      description: updated.description,
      effectiveFrom: updated.effectiveFrom,
      effectiveTo: updated.effectiveTo,
      status: updated.status,
      externalId: updated.externalId,
      subjectCount: updated._count.subjects,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }
}

export const curriculumRepository = new CurriculumRepository();
