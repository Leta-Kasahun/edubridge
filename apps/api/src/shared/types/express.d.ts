export interface AuthUser {
  userId: string;
  tenantId?: string;
  email?: string;
  roles: string[];
  permissions?: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      tenantId?: string;
    }
  }
}
