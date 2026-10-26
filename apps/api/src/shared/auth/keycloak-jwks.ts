import crypto from "node:crypto";
import jwt, { JwtHeader } from "jsonwebtoken";
import { keycloakConfig } from "../../config/keycloak.js";
import { UnauthorizedError } from "../exceptions/unauthorized-error.js";

export interface KeycloakTokenPayload {
  sub: string;
  email?: string;
  email_verified?: boolean;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  realm_access?: {
    roles?: string[];
  };
  resource_access?: Record<string, { roles?: string[] }>;
  tenantId?: string;
  iss?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

interface JWKKey {
  kid: string;
  kty: string;
  alg?: string;
  use?: string;
  n?: string;
  e?: string;
  [key: string]: unknown;
}

interface JWKSResponse {
  keys: JWKKey[];
}

class KeycloakJwksManager {
  private keyCache: Map<string, string> = new Map();
  private lastFetchTimestamp = 0;
  private readonly CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

  private async fetchJwks(forceRefresh = false): Promise<void> {
    const now = Date.now();
    if (!forceRefresh && this.keyCache.size > 0 && now - this.lastFetchTimestamp < this.CACHE_TTL_MS) {
      return;
    }

    try {
      const response = await fetch(keycloakConfig.jwksUri, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Keycloak JWKS: HTTP ${response.status}`);
      }

      const jwks = (await response.json()) as JWKSResponse;
      if (!Array.isArray(jwks?.keys)) {
        throw new Error("Invalid JWKS payload received from Keycloak");
      }

      this.keyCache.clear();
      for (const jwk of jwks.keys) {
        if (jwk.kid && jwk.kty === "RSA") {
          try {
            const keyObject = crypto.createPublicKey({
              key: jwk as crypto.JsonWebKey,
              format: "jwk",
            });
            const pem = keyObject.export({ type: "spki", format: "pem" }) as string;
            this.keyCache.set(jwk.kid, pem);
          } catch (_err) {
            void _err;
          }
        }
      }

      this.lastFetchTimestamp = now;
    } catch (error) {
      // If we already have keys cached, don't clear them on transient network failure
      if (this.keyCache.size === 0) {
        const msg = error instanceof Error ? error.message : "JWKS retrieval failed";
        throw new UnauthorizedError(`Keycloak authentication unavailable: ${msg}`);
      }
    }
  }

  async getSigningKey(kid?: string): Promise<string> {
    await this.fetchJwks(false);

    if (kid && this.keyCache.has(kid)) {
      return this.keyCache.get(kid)!;
    }

    // Attempt one force refresh in case of recent key rotation
    await this.fetchJwks(true);

    if (kid && this.keyCache.has(kid)) {
      return this.keyCache.get(kid)!;
    }

    // Fall back to first available key if single key exists and kid omitted
    const firstKey = Array.from(this.keyCache.values())[0];
    if (!kid && firstKey) {
      return firstKey;
    }

    throw new UnauthorizedError("Unknown Keycloak token signing key");
  }

  isKeycloakToken(token: string): boolean {
    try {
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded || typeof decoded === "string") return false;

      const header = decoded.header as JwtHeader;
      const payload = decoded.payload as KeycloakTokenPayload;

      if (header.alg === "RS256") {
        if (payload.iss && (payload.iss.includes("/realms/") || payload.iss === keycloakConfig.issuer)) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  async verifyToken(token: string): Promise<KeycloakTokenPayload> {
    try {
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded || typeof decoded === "string") {
        throw new UnauthorizedError("Malformed Keycloak token");
      }

      const kid = decoded.header.kid;
      const pemKey = await this.getSigningKey(kid);

      const verified = jwt.verify(token, pemKey, {
        algorithms: ["RS256"],
        issuer: keycloakConfig.issuer,
      }) as KeycloakTokenPayload;

      return verified;
    } catch (err) {
      if (err instanceof UnauthorizedError) throw err;
      throw new UnauthorizedError("Invalid or expired Keycloak access token");
    }
  }
}

export const keycloakJwks = new KeycloakJwksManager();
export const isKeycloakToken = (token: string): boolean => keycloakJwks.isKeycloakToken(token);
export const verifyKeycloakToken = (token: string): Promise<KeycloakTokenPayload> =>
  keycloakJwks.verifyToken(token);
