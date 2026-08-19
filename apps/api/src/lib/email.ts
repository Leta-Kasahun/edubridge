import { env } from "../config/env.js";
import { OTPPurpose } from "../shared/enums/index.js";

export interface SendEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

const emailLayout = (title: string, content: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#090d16;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#f8fafc;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#090d16;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:540px;background-color:#0f172a;border-radius:12px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 16px 32px;text-align:center;">
              <h1 style="margin:0;font-size:24px;font-weight:700;letter-spacing:-0.02em;color:#ffffff;">EduBridge</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 32px 32px;font-size:15px;line-height:1.6;color:#cbd5e1;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;border-top:1px solid rgba(255,255,255,0.08);text-align:center;font-size:12px;color:#64748b;">
              &copy; ${new Date().getFullYear()} ${env.EMAIL_FROM_NAME}. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const sendEmail = async (options: SendEmailOptions): Promise<EmailResult> => {
  if (!env.BREVO_API_KEY) {
    return { success: false, error: "Brevo API key is not configured" };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: env.EMAIL_FROM_NAME,
          email: env.EMAIL_FROM,
        },
        to: [
          {
            email: options.to,
            ...(options.toName && { name: options.toName }),
          },
        ],
        subject: options.subject,
        htmlContent: options.html,
        ...(options.text && { textContent: options.text }),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Brevo API error: ${response.status} ${errorText}` };
    }

    const data = (await response.json()) as { messageId?: string };
    return { success: true, messageId: data.messageId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
};

const getOtpSubject = (purpose: OTPPurpose): string => {
  switch (purpose) {
    case OTPPurpose.LOGIN_2FA:
      return "Your Two-Factor Authentication Code";
    case OTPPurpose.EMAIL_VERIFICATION:
      return "Verify Your Email Address";
    case OTPPurpose.PASSWORD_RESET:
      return "Password Reset Verification Code";
    case OTPPurpose.EMAIL_CHANGE:
      return "Confirm Your New Email Address";
    case OTPPurpose.INVITATION_ACCEPT:
      return "Invitation Verification Code";
    default:
      return "Verification Code";
  }
};

export const sendOtpEmail = async (
  to: string,
  code: string,
  purpose: OTPPurpose,
  expiryMinutes = 5
): Promise<EmailResult> => {
  const subject = getOtpSubject(purpose);
  const content = `
    <h2 style="margin:0 0 12px 0;font-size:18px;color:#ffffff;font-weight:600;">${subject}</h2>
    <p style="margin:0 0 24px 0;color:#94a3b8;">Use the verification code below to complete your request. This code will expire in <strong style="color:#ffffff;">${expiryMinutes} minutes</strong>.</p>
    <div style="background-color:#050811;border:1px solid rgba(99,102,241,0.35);border-radius:8px;padding:16px;text-align:center;margin:0 0 24px 0;">
      <span style="font-family:'Courier New',Courier,monospace;font-size:32px;font-weight:700;letter-spacing:6px;color:#6366f1;">${code}</span>
    </div>
    <p style="margin:0;font-size:13px;color:#64748b;">If you did not request this code, please ignore this email or secure your account.</p>
  `;

  return sendEmail({
    to,
    subject,
    html: emailLayout(subject, content),
  });
};

export const sendInvitationEmail = async (
  to: string,
  schoolName: string,
  roleName: string,
  inviteUrl: string
): Promise<EmailResult> => {
  const subject = `You have been invited to join ${schoolName}`;
  const content = `
    <h2 style="margin:0 0 12px 0;font-size:18px;color:#ffffff;font-weight:600;">School Invitation</h2>
    <p style="margin:0 0 16px 0;color:#cbd5e1;">You have been invited to join <strong style="color:#ffffff;">${schoolName}</strong> as a <strong style="color:#6366f1;">${roleName}</strong>.</p>
    <p style="margin:0 0 24px 0;color:#94a3b8;">Click the button below to accept your invitation and set up your account.</p>
    <div style="text-align:center;margin:0 0 24px 0;">
      <a href="${inviteUrl}" style="display:inline-block;background-color:#6366f1;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 28px;border-radius:8px;font-size:15px;">Accept Invitation</a>
    </div>
    <p style="margin:0;font-size:13px;color:#64748b;">This invitation link will expire automatically. If button doesn't work, copy and paste this link: <span style="word-break:break-all;color:#94a3b8;">${inviteUrl}</span></p>
  `;

  return sendEmail({
    to,
    subject,
    html: emailLayout(subject, content),
  });
};

export const sendSecurityAlertEmail = async (
  to: string,
  eventType: string,
  ipAddress?: string,
  device?: string
): Promise<EmailResult> => {
  const subject = "Security Alert: New activity on your account";
  const content = `
    <h2 style="margin:0 0 12px 0;font-size:18px;color:#ef4444;font-weight:600;">Security Notice</h2>
    <p style="margin:0 0 16px 0;color:#cbd5e1;">We detected a new security event on your EduBridge account:</p>
    <div style="background-color:#050811;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:16px;margin:0 0 24px 0;font-size:14px;">
      <p style="margin:0 0 8px 0;"><strong style="color:#94a3b8;">Event:</strong> <span style="color:#ffffff;">${eventType}</span></p>
      ${ipAddress ? `<p style="margin:0 0 8px 0;"><strong style="color:#94a3b8;">IP Address:</strong> <span style="color:#ffffff;">${ipAddress}</span></p>` : ""}
      ${device ? `<p style="margin:0;"><strong style="color:#94a3b8;">Device:</strong> <span style="color:#ffffff;">${device}</span></p>` : ""}
    </div>
    <p style="margin:0;font-size:13px;color:#64748b;">If this was not you, please immediately reset your password and review your active sessions.</p>
  `;

  return sendEmail({
    to,
    subject,
    html: emailLayout(subject, content),
  });
};
