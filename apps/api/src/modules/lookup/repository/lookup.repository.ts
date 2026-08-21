import { prisma, getTenantContext } from "../../../lib/prisma.js";
import { CreateLookupInput, UpdateLookupInput } from "../types/lookup.types.js";
import { LookupCategory, Prisma } from "../../../generated/prisma/client.js";

export class LookupRepository {
  async findAllByCategory(category: string) {
    return prisma.lookup.findMany({
      where: { category: category as LookupCategory },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByCategoryAndKey(category: string, key: string) {
    return prisma.lookup.findFirst({
      where: { category: category as LookupCategory, key },
    });
  }

  async findById(id: string) {
    return prisma.lookup.findFirst({
      where: { id },
    });
  }

  async create(data: CreateLookupInput) {
    const tenantId =
      (data as { tenantId?: string }).tenantId ??
      (getTenantContext()?.tenantId as string);

    return prisma.lookup.create({
      data: {
        category: data.category as LookupCategory,
        key: data.key,
        value: data.value as unknown as Prisma.InputJsonValue,
        description: data.description,
        isActive: data.isActive,
        tenantId,
      },
    });
  }

  async update(id: string, data: UpdateLookupInput) {
    return prisma.lookup.update({
      where: { id },
      data: {
        category: data.category ? (data.category as LookupCategory) : undefined,
        key: data.key,
        value:
          data.value !== undefined
            ? (data.value as unknown as Prisma.InputJsonValue)
            : undefined,
        description: data.description,
        isActive: data.isActive,
      },
    });
  }

  async delete(id: string) {
    return prisma.lookup.delete({
      where: { id },
    });
  }
}

export const lookupRepository = new LookupRepository();
