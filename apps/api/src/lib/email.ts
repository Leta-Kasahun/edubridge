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

export type EmailRecipientRole = "STUDENT" | "TEACHER" | "SCHOOL_ADMIN" | "GENERAL";

export interface RoleNotificationEmailOptions {
  to: string;
  recipientName: string;
  role?: EmailRecipientRole;
  categoryName: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  schoolName?: string;
  details?: Record<string, string>;
}

export const buildEmailWrapper = (
  title: string,
  content: string,
  badge?: string
): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#334155;-webkit-font-smoothing:antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:480px;background-color:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05),0 2px 4px -2px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding:28px 32px 20px 32px;background:linear-gradient(180deg,#ffffff 0%,#f8fafc 100%);border-bottom:1px solid #f1f5f9;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left">
                    <span style="font-size:20px;font-weight:800;letter-spacing:-0.03em;display:inline-block;">
                      <span style="color:#0284c7;">edu</span><span style="color:#ea580c;">bridge</span>
                    </span>
                  </td>
                  ${
                    badge
                      ? `<td align="right">
                          <span style="display:inline-block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;padding:3px 8px;border-radius:9999px;background-color:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;">
                            ${badge}
                          </span>
                        </td>`
                      : ""
                  }
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;font-size:14px;line-height:1.6;color:#334155;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #f1f5f9;background-color:#fafbfc;text-align:center;font-size:11px;color:#94a3b8;line-height:1.5;">
              <p style="margin:0 0 4px 0;font-weight:600;color:#64748b;">EduBridge Education Management Platform</p>
              <p style="margin:0;">&copy; ${new Date().getFullYear()} ${env.EMAIL_FROM_NAME}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const sendEmail = async (
  options: SendEmailOptions
): Promise<EmailResult> => {
  if (!env.BREVO_API_KEY) {
    return { success: false, error: "Brevo API key is not configured" };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
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
      return {
        success: false,
        error: `Brevo API error: ${response.status} ${errorText}`,
      };
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

export const sendRoleNotificationEmail = async (
  options: RoleNotificationEmailOptions
): Promise<EmailResult> => {
  const roleBadge =
    options.role === "STUDENT"
      ? "Student Update"
      : options.role === "TEACHER"
        ? "Teacher Notice"
        : options.role === "SCHOOL_ADMIN"
          ? "Admin Alert"
          : options.categoryName;

  const detailsRows = options.details
    ? Object.entries(options.details)
        .map(
          ([k, v]) => `
          <tr>
            <td style="padding:4px 0;color:#64748b;font-size:12px;width:120px;">${k}:</td>
            <td style="padding:4px 0;color:#0f172a;font-size:12px;font-weight:600;">${v}</td>
          </tr>`
        )
        .join("")
    : "";

  const content = `
    <h2 style="margin:0 0 10px 0;font-size:17px;color:#0f172a;font-weight:700;line-height:1.3;">
      ${options.title}
    </h2>
    <p style="margin:0 0 16px 0;color:#475569;font-size:13px;line-height:1.6;">
      Hello <strong style="color:#0f172a;">${options.recipientName}</strong>,
    </p>
    <p style="margin:0 0 16px 0;color:#334155;font-size:13px;line-height:1.6;">
      ${options.message}
    </p>
    ${
      detailsRows
        ? `<div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 16px;margin:0 0 20px 0;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              ${detailsRows}
            </table>
          </div>`
        : ""
    }
    ${
      options.actionUrl
        ? `<div style="text-align:center;margin:24px 0 12px 0;">
            <a href="${options.actionUrl}" style="display:inline-block;background-color:#0284c7;color:#ffffff;text-decoration:none;font-weight:600;padding:11px 24px;border-radius:8px;font-size:13px;box-shadow:0 1px 2px rgba(2,132,199,0.2);">
              ${options.actionLabel || "View in EduBridge"}
            </a>
          </div>`
        : ""
    }
  `;

  return sendEmail({
    to: options.to,
    toName: options.recipientName,
    subject: options.title,
    html: buildEmailWrapper(options.title, content, roleBadge),
  });
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
    <h2 style="margin:0 0 8px 0;font-size:17px;color:#0f172a;font-weight:700;">${subject}</h2>
    <p style="margin:0 0 16px 0;color:#64748b;font-size:13px;line-height:1.5;">
      Use the code below to complete your authentication. This code expires in <strong style="color:#0f172a;">${expiryMinutes} minutes</strong>.
    </p>
    <div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 16px;text-align:center;margin:0 0 16px 0;">
      <span style="font-family:'SFMono-Regular',Consolas,Menlo,monospace;font-size:26px;font-weight:800;letter-spacing:6px;color:#059669;">${code}</span>
    </div>
    <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.4;">
      If you did not request this verification code, please ignore this email or secure your account.
    </p>
  `;

  return sendEmail({
    to,
    subject,
    html: buildEmailWrapper(subject, content, "Security"),
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
    <h2 style="margin:0 0 8px 0;font-size:17px;color:#0f172a;font-weight:700;">School Invitation</h2>
    <p style="margin:0 0 12px 0;color:#64748b;font-size:13px;">
      You have been invited to join <strong style="color:#0f172a;">${schoolName}</strong> as a <strong style="color:#0284c7;">${roleName}</strong>.
    </p>
    <p style="margin:0 0 20px 0;color:#64748b;font-size:13px;">
      Click the button below to accept your invitation and configure your account credentials.
    </p>
    <div style="text-align:center;margin:0 0 20px 0;">
      <a href="${inviteUrl}" style="display:inline-block;background-color:#0284c7;color:#ffffff;text-decoration:none;font-weight:600;padding:11px 24px;border-radius:8px;font-size:13px;">Accept Invitation</a>
    </div>
    <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.4;">
      If the button does not work, copy and paste this URL into your browser: <span style="word-break:break-all;color:#64748b;">${inviteUrl}</span>
    </p>
  `;

  return sendEmail({
    to,
    subject,
    html: buildEmailWrapper(subject, content, "Invitation"),
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
    <h2 style="margin:0 0 8px 0;font-size:17px;color:#dc2626;font-weight:700;">Security Notice</h2>
    <p style="margin:0 0 12px 0;color:#64748b;font-size:13px;">
      A security-sensitive event was registered on your EduBridge account:
    </p>
    <div style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 16px;margin:0 0 16px 0;font-size:12px;color:#334155;">
      <p style="margin:0 0 6px 0;"><strong style="color:#64748b;">Event:</strong> <span style="color:#0f172a;font-weight:600;">${eventType}</span></p>
      ${ipAddress ? `<p style="margin:0 0 6px 0;"><strong style="color:#64748b;">IP Address:</strong> <span style="color:#0f172a;">${ipAddress}</span></p>` : ""}
      ${device ? `<p style="margin:0;"><strong style="color:#64748b;">Device:</strong> <span style="color:#0f172a;">${device}</span></p>` : ""}
    </div>
    <p style="margin:0;font-size:12px;color:#94a3b8;">
      If you did not perform this action, please update your password immediately.
    </p>
  `;

  return sendEmail({
    to,
    subject,
    html: buildEmailWrapper(subject, content, "Security Alert"),
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
    <h2 style="margin:0 0 8px 0;font-size:17px;color:#0f172a;font-weight:700;">Welcome to ${options.schoolName}</h2>
    <p style="margin:0 0 16px 0;color:#64748b;font-size:13px;line-height:1.6;">
      Hello <strong style="color:#0f172a;">${options.recipientName}</strong>, you have been invited to join <strong style="color:#0f172a;">${options.schoolName}</strong> as a <strong style="color:#0284c7;">${options.roleName}</strong>. Use your assigned credentials below to activate your account.
    </p>
    
    <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin:0 0 16px 0;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size:13px;">
        <tr>
          <td style="padding:4px 0;color:#64748b;width:140px;">Assigned Username:</td>
          <td style="padding:4px 0;color:#0f172a;font-family:'SFMono-Regular',Consolas,Menlo,monospace;font-weight:700;">${options.username}</td>
        </tr>
        ${
          options.tempPassword
            ? `<tr>
                <td style="padding:4px 0;color:#64748b;">Temporary Password:</td>
                <td style="padding:4px 0;color:#0f172a;font-family:'SFMono-Regular',Consolas,Menlo,monospace;font-weight:700;">${options.tempPassword}</td>
              </tr>`
            : ""
        }
      </table>
      
      <div style="margin-top:14px;padding-top:14px;border-top:1px dashed #cbd5e1;text-align:center;">
        <span style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;display:block;margin-bottom:6px;font-weight:600;">One-Time Verification Code (OTP)</span>
        <div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px 14px;display:inline-block;">
          <span style="font-family:'SFMono-Regular',Consolas,Menlo,monospace;font-size:22px;font-weight:800;letter-spacing:6px;color:#059669;">${options.otpCode}</span>
        </div>
      </div>
    </div>

    <div style="background-color:#fffbeb;border:1px solid #fef3c7;border-radius:8px;padding:10px 14px;margin:0 0 16px 0;font-size:12px;color:#92400e;">
      <strong>Notice:</strong> This invitation code expires in <strong>${expiryHours} hours</strong> and is valid for a single use.
    </div>

    ${
      options.setupUrl
        ? `<div style="text-align:center;margin:0 0 16px 0;">
            <a href="${options.setupUrl}" style="display:inline-block;background-color:#0284c7;color:#ffffff;text-decoration:none;font-weight:600;padding:11px 24px;border-radius:8px;font-size:13px;">Complete Account Setup</a>
          </div>`
        : ""
    }

    <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.4;">
      If you did not expect this invitation, please contact your school administration.
    </p>
  `;

  return sendEmail({
    to: options.to,
    toName: options.recipientName,
    subject,
    html: buildEmailWrapper(subject, content, "Account Activation"),
  });
};
