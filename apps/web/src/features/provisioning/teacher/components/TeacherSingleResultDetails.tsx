import {
  Copy,
  Check,
  KeyRound,
  User,
  Mail,
  ShieldAlert,
  Download,
} from "lucide-react";
import { downloadCredentialsCsv } from "@/shared/utils";
import { TeacherProvisionResult, TeacherRecord } from "../types/teacher-provisioning.types";

export interface TeacherSingleResultDetailsProps {
  readonly result: TeacherProvisionResult;
  readonly copiedField: string | null;
  readonly onCopy: (text: string, fieldKey: string) => void;
}

function getFullName(teacher: Pick<TeacherRecord, "firstName" | "middleName" | "lastName">): string {
  return [teacher.firstName, teacher.middleName, teacher.lastName]
    .filter(Boolean)
    .join(" ");
}

export function TeacherSingleResultDetails({
  result,
  copiedField,
  onCopy,
}: TeacherSingleResultDetailsProps) {
  const isInvite = result.method === "INVITATION";
  const fullName = getFullName(result.teacher);

  const handleDownloadSingleCredential = () => {
    downloadCredentialsCsv(
      [
        {
          fullName,
          username: result.credentials?.username || result.teacher.username,
          password: result.credentials?.tempPassword || "",
        },
      ],
      `${result.teacher.username}_credentials.csv`
    );
  };

  return (
    <>
      <div className="rounded-xl border border-border bg-background/50 divide-y divide-border overflow-hidden">
        <div className="p-3 sm:p-4 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0">
              <User size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs text-muted-foreground">Teacher Name</div>
              <div className="text-xs sm:text-sm font-semibold text-foreground truncate">
                {fullName}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[11px] sm:text-xs text-muted-foreground">Employee Code</div>
            <div className="text-xs font-mono font-medium text-foreground">
              {result.teacher.employeeCode}
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0">
              <KeyRound size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs text-muted-foreground">Assigned Username</div>
              <div className="text-xs sm:text-sm font-mono font-semibold text-foreground truncate">
                {result.teacher.username}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onCopy(result.teacher.username, "username")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-colors cursor-pointer shrink-0"
          >
            {copiedField === "username" ? (
              <>
                <Check size={14} className="text-foreground" />
                <span className="text-foreground font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {isInvite && result.invitation?.email && (
          <div className="p-3 sm:p-4 flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0">
                <Mail size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs text-muted-foreground">Destination Email</div>
                <div className="text-xs sm:text-sm font-semibold text-foreground truncate">
                  {result.invitation.email}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[11px] sm:text-xs text-muted-foreground">Verification OTP</div>
              <div className="text-xs font-mono font-bold text-foreground">
                {result.invitation.otpCode || "Delivered to Email"}
              </div>
            </div>
          </div>
        )}

        {!isInvite && result.credentials?.tempPassword && (
          <div className="p-3 sm:p-4 flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0">
                <KeyRound size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs text-muted-foreground">Temporary Password</div>
                <div className="text-xs sm:text-sm font-mono font-bold text-foreground truncate">
                  {result.credentials.tempPassword}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onCopy(result.credentials!.tempPassword, "password")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-colors cursor-pointer shrink-0"
            >
              {copiedField === "password" ? (
                <>
                  <Check size={14} className="text-foreground" />
                  <span className="text-foreground font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {!isInvite && (
        <div className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl bg-muted/60 border border-border text-muted-foreground">
          <ShieldAlert size={18} className="shrink-0 mt-0.5 text-foreground" />
          <div className="text-xs leading-relaxed text-foreground">
            Please share these credentials securely with the teacher. They will be prompted to choose a new permanent password on their first login.
          </div>
        </div>
      )}

      {!isInvite && result.credentials?.tempPassword && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleDownloadSingleCredential}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-colors cursor-pointer w-full sm:w-auto"
          >
            <Download size={14} />
            <span>Download Credentials CSV</span>
          </button>
        </div>
      )}
    </>
  );
}
