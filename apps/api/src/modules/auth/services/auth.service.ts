import { hashToken } from "../../../shared/auth/token.js";
import { mapUserProfile } from "../../../shared/auth/user-profile.mapper.js";
import { authRepository, AuthRepository } from "../repository/auth.repository.js";
import { sessionRepository, SessionRepository } from "../repository/session.repository.js";
import { loginService, LoginService } from "./login.service.js";
import { otpAuthService, OtpAuthService } from "./otp-auth.service.js";
import { passwordService, PasswordService } from "./password.service.js";
import { googleAuthService, GoogleAuthService } from "./google-auth.service.js";
import { keycloakAuthService, KeycloakAuthService } from "./keycloak-auth.service.js";
import { tokenService, TokenService } from "./token.service.js";
import { sessionService, SessionService } from "./session.service.js";
import {
  LoginDto,
  VerifyOtpDto,
  ResendOtpDto,
  FirstLoginSetupDto,
} from "../schemas/auth.schema.js";
import { SessionMetadata, AuthResponse } from "../types/auth.types.js";
import { NotFoundError } from "../../../shared/exceptions/not-found-error.js";

export class AuthService {
  constructor(
    private readonly loginSvc: LoginService = loginService,
    private readonly otpAuthSvc: OtpAuthService = otpAuthService,
    private readonly passwordSvc: PasswordService = passwordService,
    private readonly googleAuthSvc: GoogleAuthService = googleAuthService,
    private readonly keycloakAuthSvc: KeycloakAuthService = keycloakAuthService,
    private readonly tokenSvc: TokenService = tokenService,
    private readonly sessionSvc: SessionService = sessionService,
    private readonly sessionRepo: SessionRepository = sessionRepository,
    private readonly authRepo: AuthRepository = authRepository
  ) { }

  async login(dto: LoginDto, metadata: SessionMetadata, tenantId?: string): Promise<AuthResponse> {
    return this.loginSvc.login(dto, metadata, tenantId);
  }

  async verifyOtp(dto: VerifyOtpDto, metadata: SessionMetadata, tenantId?: string): Promise<AuthResponse> {
    return this.otpAuthSvc.verifyOtp(dto, metadata, tenantId);
  }

  async resendOtp(dto: ResendOtpDto, tenantId?: string): Promise<AuthResponse> {
    return this.otpAuthSvc.resendOtp(dto, tenantId);
  }

  async firstLoginSetup(
    dto: FirstLoginSetupDto,
    metadata: SessionMetadata,
    tenantId?: string
  ): Promise<AuthResponse> {
    return this.passwordSvc.firstLoginSetup(dto, metadata, tenantId);
  }

  getGoogleAuthUrl(customState?: string): string {
    return this.googleAuthSvc.getAuthorizationUrl(customState);
  }

  async handleGoogleCallback(
    code: string,
    metadata: SessionMetadata,
    tenantId?: string
  ): Promise<AuthResponse> {
    return this.googleAuthSvc.processGoogleCallback(code, metadata, tenantId);
  }

  getGoogleRedirectUrl(customOrigin?: string, authResult?: AuthResponse): string {
    return this.googleAuthSvc.resolveFrontendRedirect(customOrigin, authResult);
  }

  getGoogleErrorRedirectUrl(errorMessage: string, customOrigin?: string): string {
    return this.googleAuthSvc.resolveFrontendErrorRedirect(errorMessage, customOrigin);
  }

  async googleAuth(
    googleId: string,
    email: string,
    metadata: SessionMetadata,
    tenantId?: string
  ): Promise<AuthResponse> {
    return this.googleAuthSvc.authenticateWithGoogle(googleId, email, metadata, tenantId);
  }

  generateKeycloakPkcePair(): { verifier: string; challenge: string } {
    return this.keycloakAuthSvc.generatePkcePair();
  }

  getKeycloakAuthUrl(customState?: string, codeChallenge?: string): string {
    return this.keycloakAuthSvc.getAuthorizationUrl(customState, codeChallenge);
  }

  async handleKeycloakCallback(
    code: string,
    metadata: SessionMetadata,
    tenantId?: string,
    codeVerifier?: string
  ): Promise<AuthResponse> {
    return this.keycloakAuthSvc.processKeycloakCallback(code, metadata, tenantId, codeVerifier);
  }

  getKeycloakRedirectUrl(customOrigin?: string, authResult?: AuthResponse): string {
    return this.keycloakAuthSvc.resolveFrontendRedirect(customOrigin, authResult);
  }

  getKeycloakErrorRedirectUrl(errorMessage: string, customOrigin?: string): string {
    return this.keycloakAuthSvc.resolveFrontendErrorRedirect(errorMessage, customOrigin);
  }

  async keycloakAuth(
    token: string,
    metadata: SessionMetadata,
    tenantId?: string
  ): Promise<AuthResponse> {
    return this.keycloakAuthSvc.authenticateWithKeycloakToken(token, metadata, tenantId);
  }

  async refreshToken(rawRefreshToken: string, metadata: SessionMetadata): Promise<AuthResponse> {
    const { tokens, session } = await this.tokenSvc.rotateRefreshToken(rawRefreshToken, metadata);
    const user = await this.authRepo.findById(session.userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const userProfile = mapUserProfile(user, session.tenantId);
    return { tokens, user: userProfile };
  }

  async logout(rawRefreshToken: string) {
    const incomingHash = hashToken(rawRefreshToken);
    const session = await this.sessionRepo.findByRefreshTokenHash(incomingHash);
    if (session) {
      await this.sessionSvc.revokeSession(session.id, "User logged out");
    }
    return { message: "Logged out successfully" };
  }

  async logoutAll(userId: string) {
    await this.sessionSvc.revokeAllUserSessions(userId, "All user sessions revoked");
    return { message: "All sessions revoked successfully" };
  }

  async changePassword(
    userId: string,
    currentPass: string,
    newPass: string,
    tenantId?: string
  ) {
    return this.passwordSvc.changePassword(userId, currentPass, newPass, tenantId);
  }

  async adminResetPassword(
    tenantId: string | undefined,
    targetUserId: string,
    newPassword?: string,
    adminUserId?: string
  ): Promise<{ username: string; tempPassword: string; fullName: string }> {
    return this.passwordSvc.adminResetPassword(tenantId, targetUserId, newPassword, adminUserId);
  }
}

export const authService = new AuthService();
