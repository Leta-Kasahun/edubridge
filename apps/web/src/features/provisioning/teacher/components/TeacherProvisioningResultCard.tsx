"use client";

import { useState, useMemo, useCallback } from "react";
import { CheckCircle2, Send, ArrowRight, Users } from "lucide-react";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { downloadCredentialsCsv, CredentialExportRow } from "@/shared/utils";
import {
  TeacherProvisionResult,
  TeacherBulkProvisionResult,
  TeacherRecord,
} from "../types/teacher-provisioning.types";
import { TeacherBulkSummaryStats } from "./TeacherBulkSummaryStats";
import { TeacherBulkCredentialsTable } from "./TeacherBulkCredentialsTable";
import { TeacherBulkErrorsSection } from "./TeacherBulkErrorsSection";
import { TeacherSingleResultDetails } from "./TeacherSingleResultDetails";

export interface TeacherProvisioningResultCardProps {
  readonly result?: TeacherProvisionResult | null;
  readonly bulkResult?: TeacherBulkProvisionResult | null;
  readonly onReset: () => void;
}

function getFullName(teacher: Pick<TeacherRecord, "firstName" | "middleName" | "lastName">): string {
  return [teacher.firstName, teacher.middleName, teacher.lastName]
    .filter(Boolean)
    .join(" ");
}

export function TeacherProvisioningResultCard({
  result,
  bulkResult,
  onReset,
}: TeacherProvisioningResultCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = useCallback(async (text: string, fieldKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      setCopiedField(null);
    }
  }, []);

  const credentialRows: readonly CredentialExportRow[] = useMemo(() => {
    if (!bulkResult?.successfulTeachers) return [];
    return bulkResult.successfulTeachers
      .filter((t) => Boolean(t.credentials?.tempPassword))
      .map((t) => ({
        fullName: getFullName(t.teacher),
        username: t.credentials?.username || t.teacher.username,
        password: t.credentials?.tempPassword || "",
      }));
  }, [bulkResult]);

  const handleDownloadBulkCredentials = useCallback(() => {
    if (credentialRows.length === 0) return;
    downloadCredentialsCsv(credentialRows, "teacher_credentials.csv");
  }, [credentialRows]);

  if (bulkResult) {
    const isFullSuccess = bulkResult.failureCount === 0;

    return (
      <div className="w-full max-w-2xl mx-auto bg-card rounded-2xl border border-border p-4 sm:p-6 md:p-8 shadow-xs space-y-4 sm:space-y-6">
        <div className="text-center space-y-1.5 sm:space-y-2">
          <div className="inline-flex items-center justify-center p-2.5 sm:p-3 rounded-full bg-muted text-foreground mb-1">
            <Users size={28} className="sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
            Bulk Onboarding {isFullSuccess ? "Completed" : "Summary"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground px-2">
            {bulkResult.message}
          </p>
        </div>

        <TeacherBulkSummaryStats
          total={bulkResult.totalRows}
          success={bulkResult.successCount}
          failed={bulkResult.failureCount}
        />

        <TeacherBulkCredentialsTable
          credentialRows={credentialRows}
          copiedField={copiedField}
          onCopy={copyToClipboard}
          onDownload={handleDownloadBulkCredentials}
        />

        <TeacherBulkErrorsSection failedRows={bulkResult.failedRows} />

        <div className="pt-1 sm:pt-2">
          <SubmitButton
            type="button"
            onClick={onReset}
            icon={<ArrowRight size={18} />}
            iconPosition="right"
            className="w-full"
          >
            Onboard More Teachers
          </SubmitButton>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const isInvite = result.method === "INVITATION";

  return (
    <div className="w-full max-w-2xl mx-auto bg-card rounded-2xl border border-border p-4 sm:p-6 md:p-8 shadow-xs space-y-4 sm:space-y-6">
      <div className="text-center space-y-1.5 sm:space-y-2">
        <div className="inline-flex items-center justify-center p-2.5 sm:p-3 rounded-full bg-muted text-foreground mb-1">
          {isInvite ? <Send size={28} className="sm:w-8 sm:h-8" /> : <CheckCircle2 size={28} className="sm:w-8 sm:h-8" />}
        </div>
        <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
          {isInvite ? "Teacher Invitation Sent" : "Teacher Account Ready"}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground px-2">
          {result.message}
        </p>
      </div>

      <TeacherSingleResultDetails
        result={result}
        copiedField={copiedField}
        onCopy={copyToClipboard}
      />

      <div className="pt-1 sm:pt-2">
        <SubmitButton
          type="button"
          onClick={onReset}
          icon={<ArrowRight size={18} />}
          iconPosition="right"
          className="w-full"
        >
          Add Another Teacher
        </SubmitButton>
      </div>
    </div>
  );
}
