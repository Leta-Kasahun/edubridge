export const RedisKeys = {
  auth: {
    otp: (userId: string, purpose: string) => `auth:otp:${userId}:${purpose}`,
    otpCooldown: (userId: string, purpose: string) => `auth:otp:cooldown:${userId}:${purpose}`,
    otpAttempts: (userId: string, purpose: string) => `auth:otp:attempts:${userId}:${purpose}`,
    session: (sessionId: string) => `auth:session:${sessionId}`,
    userSessions: (userId: string) => `auth:user:${userId}:sessions`,
    refreshToken: (tokenHash: string) => `auth:refresh:${tokenHash}`,
    blacklist: (tokenId: string) => `auth:blacklist:${tokenId}`,
    loginAttempts: (identifier: string) => `auth:attempts:${identifier}`,
    ipAttempts: (ipAddress: string) => `auth:ip:attempts:${ipAddress}`,
    lockout: (userId: string) => `auth:lockout:${userId}`,
    passwordReset: (tokenHash: string) => `auth:password-reset:${tokenHash}`,
    emailVerify: (tokenHash: string) => `auth:email-verify:${tokenHash}`,
    invitation: (tokenHash: string) => `auth:invitation:${tokenHash}`,
  },
  permission: {
    userPermissions: (tenantId: string, userId: string) => `perm:user:${tenantId}:${userId}`,
    userRoles: (tenantId: string, userId: string) => `perm:roles:${tenantId}:${userId}`,
    rolePermissions: (roleId: string) => `perm:role:${roleId}`,
    tenantRoles: (tenantId: string) => `perm:tenant:${tenantId}:roles`,
  },
  tenant: {
    byId: (tenantId: string) => `tenant:id:${tenantId}`,
    byCode: (code: string) => `tenant:code:${code}`,
    policy: (tenantId: string) => `tenant:policy:${tenantId}`,
    lookup: (tenantId: string, category: string, key: string) => `tenant:lookup:${tenantId}:${category}:${key}`,
    categoryLookups: (tenantId: string, category: string) => `tenant:lookup:${tenantId}:${category}`,
  },
  user: {
    profile: (userId: string) => `user:profile:${userId}`,
    membership: (tenantId: string, userId: string) => `user:membership:${tenantId}:${userId}`,
    userTenants: (userId: string) => `user:${userId}:tenants`,
  },
  rateLimit: {
    ip: (ipAddress: string) => `ratelimit:ip:${ipAddress}`,
    user: (userId: string) => `ratelimit:user:${userId}`,
    endpoint: (endpoint: string, ip: string) => `ratelimit:endpoint:${endpoint}:${ip}`,
  },
  ai: {
    promptCache: (hash: string) => `ai:cache:prompt:${hash}`,
    completionCache: (model: string, hash: string) => `ai:cache:completion:${model}:${hash}`,
    context: (userId: string, conversationId: string) => `ai:context:${userId}:${conversationId}`,
    tokenRateLimit: (userId: string) => `ai:ratelimit:tokens:${userId}`,
    requestRateLimit: (userId: string) => `ai:ratelimit:requests:${userId}`,
  },
  notification: {
    // Pub/Sub channel per user for SSE fan-out
    userChannel: (userId: string) => `notif:user:${userId}`,
    // Pub/Sub channel per tenant (broadcast)
    tenantChannel: (tenantId: string) => `notif:tenant:${tenantId}`,
    // Unread badge count cache
    unreadCount: (tenantId: string, userId: string) => `notif:unread:${tenantId}:${userId}`,
  },
  idempotency: {
    key: (tenantId: string, key: string) => `idempotency:${tenantId}:${key}`,
  },
  patterns: {
    userPermissions: (tenantId: string) => `perm:user:${tenantId}:*`,
    userSessions: (userId: string) => `auth:user:${userId}:*`,
    tenantLookups: (tenantId: string) => `tenant:lookup:${tenantId}:*`,
    aiUserContext: (userId: string) => `ai:context:${userId}:*`,
  },
} as const;

export type RedisKeyGenerator = typeof RedisKeys;
