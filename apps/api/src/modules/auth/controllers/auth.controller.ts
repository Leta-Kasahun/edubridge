import { Request, Response } from "express";
import { authService, AuthService } from "../services/auth.service.js";
import { asyncHandler } from "../../../shared/utils/async-handler.js";
import {
  setRefreshCookie,
  clearRefreshCookie,
  extractRefreshToken,
} from "../../../shared/utils/cookie.util.js";
import { UnauthorizedError } from "../../../shared/exceptions/unauthorized-error.js";

export class AuthController {
  constructor(private readonly authSvc: AuthService = authService) {}

  private extractMetadata(req: Request) {
    return {
      ipAddress: (req.headers["x-forwarded-for"] as string) || req.ip || "127.0.0.1",
      userAgent: req.headers["user-agent"],
      deviceId: req.body?.deviceId as string | undefined,
      deviceType: req.body?.deviceType,
    };
  }

  private extractTenantId(req: Request) {
    return (req.headers["x-tenant-id"] as string) || req.tenantId;
  }

  initiateGoogleAuth = asyncHandler(async (_req: Request, res: Response) => {
    const authUrl = this.authSvc.getGoogleAuthUrl();
    res.redirect(authUrl);
  });

  handleGoogleCallback = asyncHandler(async (req: Request, res: Response) => {
    const { code, error } = req.query;

    if (error || !code) {
      const errorMsg = (error as string) || "Google authentication was cancelled or failed";
      res.redirect(this.authSvc.getGoogleErrorRedirectUrl(errorMsg));
      return;
    }

    const metadata = this.extractMetadata(req);
    const tenantId = this.extractTenantId(req);

    try {
      const result = await this.authSvc.handleGoogleCallback(code as string, metadata, tenantId);
      setRefreshCookie(res, result.tokens?.refreshToken);
      res.redirect(this.authSvc.getGoogleRedirectUrl(result));
    } catch (authError) {
      const msg = authError instanceof Error ? authError.message : "Authentication failed";
      res.redirect(this.authSvc.getGoogleErrorRedirectUrl(msg));
    }
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const metadata = this.extractMetadata(req);
    const tenantId = this.extractTenantId(req);
    const result = await this.authSvc.login(req.body, metadata, tenantId);
    setRefreshCookie(res, result.tokens?.refreshToken);
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const metadata = this.extractMetadata(req);
    const tenantId = this.extractTenantId(req);
    const result = await this.authSvc.verifyOtp(req.body, metadata, tenantId);
    setRefreshCookie(res, result.tokens?.refreshToken);
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  resendOtp = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = this.extractTenantId(req);
    const result = await this.authSvc.resendOtp(req.body, tenantId);
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  firstLoginSetup = asyncHandler(async (req: Request, res: Response) => {
    const metadata = this.extractMetadata(req);
    const tenantId = this.extractTenantId(req);
    const result = await this.authSvc.firstLoginSetup(req.body, metadata, tenantId);
    setRefreshCookie(res, result.tokens?.refreshToken);
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  googleAuth = asyncHandler(async (req: Request, res: Response) => {
    const metadata = this.extractMetadata(req);
    const tenantId = this.extractTenantId(req);
    const { googleId, email } = req.body;
    const result = await this.authSvc.googleAuth(googleId, email, metadata, tenantId);
    setRefreshCookie(res, result.tokens?.refreshToken);
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const rawRefreshToken = extractRefreshToken(req);
    if (!rawRefreshToken) {
      throw new UnauthorizedError("Refresh token is required");
    }
    const metadata = this.extractMetadata(req);
    const result = await this.authSvc.refreshToken(rawRefreshToken, metadata);
    setRefreshCookie(res, result.tokens?.refreshToken);
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const rawRefreshToken = extractRefreshToken(req);
    if (rawRefreshToken) {
      await this.authSvc.logout(rawRefreshToken);
    }
    clearRefreshCookie(res);
    res.status(200).json({
      success: true,
      data: { message: "Logged out successfully" },
    });
  });

  logoutAll = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Unauthorized");
    }
    const result = await this.authSvc.logoutAll(req.user.userId);
    clearRefreshCookie(res);
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Unauthorized");
    }
    const tenantId = this.extractTenantId(req);
    const result = await this.authSvc.changePassword(
      req.user.userId,
      req.body.currentPassword,
      req.body.newPassword,
      tenantId
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  });
}

export const authController = new AuthController();
