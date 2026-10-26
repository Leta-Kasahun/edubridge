import { env } from "./env.js";

export const keycloakConfig = {
  url: env.KEYCLOAK_URL,
  realm: env.KEYCLOAK_REALM,
  clientId: env.KEYCLOAK_CLIENT_ID,
  clientSecret: env.KEYCLOAK_CLIENT_SECRET,
  callbackUrl: env.KEYCLOAK_CALLBACK_URL,
  frontendClientId: env.KEYCLOAK_FRONTEND_CLIENT_ID,

  get issuer(): string {
    return `${this.url.replace(/\/$/, "")}/realms/${this.realm}`;
  },

  get authorizationEndpoint(): string {
    return `${this.issuer}/protocol/openid-connect/auth`;
  },

  get tokenEndpoint(): string {
    return `${this.issuer}/protocol/openid-connect/token`;
  },

  get userInfoEndpoint(): string {
    return `${this.issuer}/protocol/openid-connect/userinfo`;
  },

  get jwksUri(): string {
    return `${this.issuer}/protocol/openid-connect/certs`;
  },

  get logoutEndpoint(): string {
    return `${this.issuer}/protocol/openid-connect/logout`;
  },
};
