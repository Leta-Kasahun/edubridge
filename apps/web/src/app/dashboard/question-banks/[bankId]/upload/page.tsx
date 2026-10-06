"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import {
  QuestionUploadDropzone,
  QuestionUploadPreviewTable,
  QuestionUploadResponse,
  useQuestionBank,
} from "@/features/question-bank";

interface BankUploadPageProps {
  readonly params: Promise<{ bankId: string }>;
}

export default function BankUploadPage({ params }: BankUploadPageProps) {
  const resolvedParams = use(params);
  const bankId = resolvedParams.bankId;

  const { data: bank } = useQuestionBank(bankId);
  const [uploadResult, setUploadResult] = useState<QuestionUploadResponse | null>(
    null
  );

  return (
    <RoleGuard allowedRoles={["SCHOOL_ADMIN", "TEACHER"]}>
      <DashboardLayout>
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link
              href={`/dashboard/question-banks/${bankId}`}
              className="hover:text-foreground transition-colors flex items-center gap-1 font-medium"
            >
              <ArrowLeft size={13} />
              <span>{bank?.name || "Question Bank"}</span>
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold">
              Upload & Extract Questions
            </span>
          </div>

          <div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground">
              Upload Questions
            </h1>
          </div>

          {!uploadResult ? (
            <QuestionUploadDropzone
              bankId={bankId}
              onUploadSuccess={setUploadResult}
            />
          ) : (
            <QuestionUploadPreviewTable
              bankId={bankId}
              uploadData={uploadResult}
              onReset={() => setUploadResult(null)}
            />
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
