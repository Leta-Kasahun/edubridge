import { prisma, runWithTenant } from "../../src/lib/prisma.js";
import { DEFAULT_LOOKUPS } from "../data/lookups.data.js";
import { LookupCategory, Prisma } from "../../src/generated/prisma/client.js";

export async function seedLookups(tenantId: string) {
  return runWithTenant({ tenantId }, async () => {
    return Promise.all(
      DEFAULT_LOOKUPS.map((item) =>
        prisma.lookup.upsert({
          where: {
            tenantId_category_key: {
              tenantId,
              category: item.category as LookupCategory,
              key: item.key,
            },
          },
          update: {
            value: item.value as unknown as Prisma.InputJsonValue,
            description: item.description,
            isActive: true,
          },
          create: {
            tenantId,
            category: item.category as LookupCategory,
            key: item.key,
            value: item.value as unknown as Prisma.InputJsonValue,
            description: item.description,
            isActive: true,
          },
        })
      )
    );
  });
}
