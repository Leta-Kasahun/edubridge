import { Router } from "express";
import { authController } from "./controllers/auth.controller.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/auth.js";
import { authLimiter, otpLimiter } from "../../middleware/rate-limiter.js";
import {
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  firstLoginSetupSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from "./schemas/auth.schema.js";

const router: Router = Router();

router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/verify-otp", otpLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.post("/resend-otp", otpLimiter, validate(resendOtpSchema), authController.resendOtp);
router.post("/first-login-setup", authLimiter, validate(firstLoginSetupSchema), authController.firstLoginSetup);
router.get("/google", authController.initiateGoogleAuth);
router.get("/google/callback", authController.handleGoogleCallback);
router.post("/google", authController.googleAuth);
router.post("/refresh-token", authLimiter, validate(refreshTokenSchema), authController.refreshToken);
router.post("/logout", authController.logout);
router.post("/logout-all", authenticate, authController.logoutAll);
router.post("/change-password", authenticate, validate(changePasswordSchema), authController.changePassword);

export { router as authRouter };
