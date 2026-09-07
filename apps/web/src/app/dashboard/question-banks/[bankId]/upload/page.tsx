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
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link
              href={`/dashboard/question-banks/${bankId}`}
              className="hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <ArrowLeft size={13} />
              <span>{bank?.name || "Question Bank"}</span>
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-100 font-medium">
              Upload & Extract Questions
            </span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100">
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
