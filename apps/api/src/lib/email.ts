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

const buildEmailWrapper = (title: string, content: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#334155;-webkit-font-smoothing:antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:440px;background-color:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding:24px 28px 12px 28px;text-align:left;border-bottom:1px solid #f1f5f9;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size:18px;font-weight:700;letter-spacing:-0.02em;color:#0f172a;">Edu<span style="color:#059669;">Bridge</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 24px 28px;font-size:14px;line-height:1.55;color:#334155;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px;border-top:1px solid #f1f5f9;background-color:#fafbfc;text-align:center;font-size:11px;color:#94a3b8;">
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
    <h2 style="margin:0 0 8px 0;font-size:16px;color:#0f172a;font-weight:600;">${subject}</h2>
    <p style="margin:0 0 16px 0;color:#64748b;font-size:13px;">Use the code below to complete your authentication. This code expires in <strong style="color:#0f172a;">${expiryMinutes} minutes</strong>.</p>
    <div style="background-color:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:12px 16px;text-align:center;margin:0 0 16px 0;">
      <span style="font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;font-size:24px;font-weight:700;letter-spacing:6px;color:#059669;">${code}</span>
    </div>
    <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.4;">If you did not request this verification code, please ignore this email or secure your account.</p>
  `;

  return sendEmail({
    to,
    subject,
    html: buildEmailWrapper(subject, content),
  });
};

export const sendInvitationEmail = async (
  to: string,
  schoolName: string,
  roleName: string,
  inviteUrl: string
): Promise<EmailResult> => {
  const subject = `Invitation to join ${schoolName}`;
  const content = `
    <h2 style="margin:0 0 8px 0;font-size:16px;color:#0f172a;font-weight:600;">School Invitation</h2>
    <p style="margin:0 0 12px 0;color:#64748b;font-size:13px;">You have been invited to join <strong style="color:#0f172a;">${schoolName}</strong> as a <strong style="color:#059669;">${roleName}</strong>.</p>
    <p style="margin:0 0 16px 0;color:#64748b;font-size:13px;">Click the button below to accept your invitation and set up your account credentials.</p>
    <div style="text-align:center;margin:0 0 16px 0;">
      <a href="${inviteUrl}" style="display:inline-block;background-color:#059669;color:#ffffff;text-decoration:none;font-weight:600;padding:10px 22px;border-radius:6px;font-size:13px;">Accept Invitation</a>
    </div>
    <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.4;">If the button does not work, copy and paste this URL into your browser: <span style="word-break:break-all;color:#64748b;">${inviteUrl}</span></p>
  `;

  return sendEmail({
    to,
    subject,
    html: buildEmailWrapper(subject, content),
  });
};

export const sendSecurityAlertEmail = async (
  to: string,
  eventType: string,
  ipAddress?: string,
  device?: string
): Promise<EmailResult> => {
  const subject = "Security Alert: Account Activity Notice";
  const content = `
    <h2 style="margin:0 0 8px 0;font-size:16px;color:#dc2626;font-weight:600;">Security Notice</h2>
    <p style="margin:0 0 12px 0;color:#64748b;font-size:13px;">A security-sensitive event was registered on your EduBridge account:</p>
    <div style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 16px;margin:0 0 16px 0;font-size:12px;color:#334155;">
      <p style="margin:0 0 6px 0;"><strong style="color:#64748b;">Event:</strong> <span style="color:#0f172a;font-weight:600;">${eventType}</span></p>
      ${ipAddress ? `<p style="margin:0 0 6px 0;"><strong style="color:#64748b;">IP Address:</strong> <span style="color:#0f172a;">${ipAddress}</span></p>` : ""}
      ${device ? `<p style="margin:0;"><strong style="color:#64748b;">Device:</strong> <span style="color:#0f172a;">${device}</span></p>` : ""}
    </div>
    <p style="margin:0;font-size:12px;color:#94a3b8;">If you did not perform this action, please update your password immediately.</p>
  `;

  return sendEmail({
    to,
    subject,
    html: buildEmailWrapper(subject, content),
  });
};

export interface SendProvisioningInvitationOptions {
  to: string;
  recipientName: string;
  schoolName: string;
  roleName: string;
  username: string;
  tempPassword?: string;
  otpCode: string;
  expiryHours?: number;
  setupUrl?: string;
}

export const sendProvisioningInvitationEmail = async (
  options: SendProvisioningInvitationOptions
): Promise<EmailResult> => {
  const expiryHours = options.expiryHours ?? 48;
  const subject = `Invitation to join ${options.schoolName} - EduBridge`;
  const content = `
    <h2 style="margin:0 0 8px 0;font-size:16px;color:#0f172a;font-weight:600;">Welcome to ${options.schoolName}</h2>
    <p style="margin:0 0 16px 0;color:#64748b;font-size:13px;line-height:1.5;">Hello <strong style="color:#0f172a;">${options.recipientName}</strong>, you have been invited to join <strong style="color:#0f172a;">${options.schoolName}</strong> as a <strong style="color:#059669;">${options.roleName}</strong>. Use your assigned username and the one-time verification code below to activate your account and complete setup.</p>
    
    <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:0 0 16px 0;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size:13px;">
        <tr>
          <td style="padding:4px 0;color:#64748b;width:140px;">Assigned Username:</td>
          <td style="padding:4px 0;color:#0f172a;font-family:'SFMono-Regular',Consolas,Menlo,monospace;font-weight:600;">${options.username}</td>
        </tr>
        ${
          options.tempPassword
            ? `<tr>
                <td style="padding:4px 0;color:#64748b;">Temporary Password:</td>
                <td style="padding:4px 0;color:#0f172a;font-family:'SFMono-Regular',Consolas,Menlo,monospace;font-weight:600;">${options.tempPassword}</td>
              </tr>`
            : ""
        }
      </table>
      
      <div style="margin-top:12px;padding-top:12px;border-top:1px dashed #cbd5e1;text-align:center;">
        <span style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;display:block;margin-bottom:6px;">One-Time Verification Code (OTP)</span>
        <div style="background-color:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:8px 12px;display:inline-block;">
          <span style="font-family:'SFMono-Regular',Consolas,Menlo,monospace;font-size:22px;font-weight:700;letter-spacing:6px;color:#059669;">${options.otpCode}</span>
        </div>
      </div>
    </div>

    <div style="background-color:#fffbeb;border:1px solid #fef3c7;border-radius:6px;padding:10px 12px;margin:0 0 16px 0;font-size:12px;color:#92400e;">
      <strong>Notice:</strong> This invitation code expires in <strong>${expiryHours} hours</strong> and is valid for a single use.
    </div>

    ${
      options.setupUrl
        ? `<div style="text-align:center;margin:0 0 16px 0;">
            <a href="${options.setupUrl}" style="display:inline-block;background-color:#059669;color:#ffffff;text-decoration:none;font-weight:600;padding:10px 22px;border-radius:6px;font-size:13px;">Complete Account Setup</a>
          </div>`
        : ""
    }

    <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.4;">If you did not expect this invitation, please contact your school administrator or system administration.</p>
  `;

  return sendEmail({
    to: options.to,
    toName: options.recipientName,
    subject,
    html: buildEmailWrapper(subject, content),
  });
};
