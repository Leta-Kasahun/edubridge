import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { AsyncLocalStorage } from "node:async_hooks";
import { PrismaClient } from "../generated/prisma/client.js";
import { env } from "../config/env.js";
import { TENANT_SCOPED_MODELS, FILTER_WHERE_OPERATIONS } from "../shared/constants/index.js";

export interface TenantContext {
  tenantId?: string;
  userId?: string;
  isSystemAdmin?: boolean;
}

export const tenantStorage = new AsyncLocalStorage<TenantContext>();

export const runWithTenant = <T>(context: TenantContext, fn: () => T): T => {
  return tenantStorage.run(context, fn);
};

export const runWithoutTenant = <T>(fn: () => T): T => {
  return tenantStorage.run({ isSystemAdmin: true }, fn);
};

export const getTenantContext = (): TenantContext | undefined => {
  return tenantStorage.getStore();
};

const applyTenantWhere = (where: unknown, tenantId: string): Record<string, unknown> => {
  const baseWhere = (where && typeof where === "object" ? where : {}) as Record<string, unknown>;
  return {
    ...baseWhere,
    tenantId,
  };
};

const applyTenantData = (data: unknown, tenantId: string): unknown => {
  if (Array.isArray(data)) {
    return data.map((item) => ({
      ...((item && typeof item === "object" ? item : {}) as Record<string, unknown>),
      tenantId,
    }));
  }

  if (data && typeof data === "object") {
    return {
      ...(data as Record<string, unknown>),
      tenantId,
    };
  }

  return data;
};

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const createPrismaClient = () => {
  const baseClient = new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  return baseClient.$extends({
    name: "tenantIsolation",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const context = tenantStorage.getStore();
          const tenantId = context?.tenantId;

          if (!tenantId || context?.isSystemAdmin || !TENANT_SCOPED_MODELS.has(model)) {
            return query(args);
          }

          const typedArgs = (args || {}) as Record<string, unknown>;

          if (operation === "findUnique" || operation === "findUniqueOrThrow") {
            const nextOp = operation === "findUnique" ? "findFirst" : "findFirstOrThrow";
            const targetModel = baseClient[model as keyof typeof baseClient] as unknown as
              | Record<string, (params: unknown) => Promise<unknown>>
              | undefined;
            const executor = targetModel?.[nextOp];
            if (executor) {
              return executor({
                ...typedArgs,
                where: applyTenantWhere(typedArgs.where, tenantId),
              });
            }
          }

          if (FILTER_WHERE_OPERATIONS.has(operation)) {
            typedArgs.where = applyTenantWhere(typedArgs.where, tenantId);
          } else if (operation === "create" || operation === "createMany" || operation === "createManyAndReturn") {
            typedArgs.data = applyTenantData(typedArgs.data, tenantId);
          } else if (operation === "upsert") {
            typedArgs.where = applyTenantWhere(typedArgs.where, tenantId);
            typedArgs.create = applyTenantData(typedArgs.create, tenantId);
          }

          return query(typedArgs as typeof args);
        },
      },
    },
  });
};

export type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma?: ExtendedPrismaClient;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { pool };
