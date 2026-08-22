"use client";

import { useState, useRef } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Send,
  KeyRound,
  Download,
} from "lucide-react";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import { cn } from "@/lib/utils";
import { parseCsvFile, CsvParseResult } from "@/shared/utils/csv-parser";
import { useBulkProvisionCsv } from "../hooks/useTeacherProvisioning";
import {
  TeacherProvisioningMethod,
  TeacherBulkProvisionResult,
} from "../types/teacher-provisioning.types";

export interface TeacherBulkProvisioningFormProps {
  readonly onSuccess: (result: TeacherBulkProvisionResult) => void;
}

const SAMPLE_CSV =
  "firstName,middleName,lastName,gender,email,phoneNumber,employeeCode\n" +
  "Almaz,Tadesse,Haile,FEMALE,almaz.tadesse@school.edu.et,+251911223344,EMP001\n" +
  "Dawit,Bekele,Girma,MALE,dawit.bekele@school.edu.et,+251922334455,EMP002";

export function TeacherBulkProvisioningForm({
  onSuccess,
}: TeacherBulkProvisioningFormProps) {
  const [method, setMethod] = useState<TeacherProvisioningMethod>("INVITATION");
  const [file, setFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>("");
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mutation = useBulkProvisionCsv();

  const handleFileChange = async (selectedFile: File) => {
    setErrorMessage(null);
    if (!selectedFile.name.endsWith(".csv")) {
      setErrorMessage("Please select a valid .csv file");
      return;
    }

    try {
      const text = await selectedFile.text();
      const result = await parseCsvFile(selectedFile, [
        "firstName",
        "middleName",
        "lastName",
        "gender",
      ]);

      if (result.totalRows === 0) {
        setErrorMessage("The selected CSV file is empty");
        return;
      }

      setFile(selectedFile);
      setCsvContent(text);
      setParseResult(result);
    } catch {
      setErrorMessage("Failed to read the selected file. Please try again.");
    }
  };

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "teachers_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!csvContent || !parseResult || parseResult.totalRows === 0) {
      setErrorMessage("Please upload a valid CSV file first");
      return;
    }

    try {
      const result = await mutation.mutateAsync({
        method,
        csvContent,
        sendNotifications: true,
      });

      onSuccess(result);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: {
          data?: {
            message?: string;
            error?: { message?: string };
          };
        };
        message?: string;
      };
      const msg =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error?.message ||
        (axiosError.message && !axiosError.message.includes("status code")
          ? axiosError.message
          : "Bulk provisioning failed. Please check the file and try again.");
      setErrorMessage(msg);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setCsvContent("");
    setParseResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-card rounded-2xl border border-border p-5 sm:p-7 shadow-xs">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMethod("INVITATION")}
              className={cn(
                "h-11 sm:h-12 px-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold tracking-wide uppercase transition-all duration-200 cursor-pointer rounded-none active:scale-[0.99]",
                method === "INVITATION"
                  ? "border-2 border-primary text-primary bg-primary/5 font-bold"
                  : "border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 bg-background/50"
              )}
            >
              <Send size={18} className="shrink-0" />
              <span>Email Invitation</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod("DIRECT_CREDENTIALS")}
              className={cn(
                "h-11 sm:h-12 px-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold tracking-wide uppercase transition-all duration-200 cursor-pointer rounded-none active:scale-[0.99]",
                method === "DIRECT_CREDENTIALS"
                  ? "border-2 border-primary text-primary bg-primary/5 font-bold"
                  : "border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 bg-background/50"
              )}
            >
              <KeyRound size={18} className="shrink-0" />
              <span>Direct Credentials</span>
            </button>
          </div>
        </div>

        {errorMessage && <ErrorAlert message={errorMessage} />}

        {!file && (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files[0]) {
                handleFileChange(e.dataTransfer.files[0]);
              }
            }}
            className="border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all rounded-2xl p-8 text-center cursor-pointer space-y-3"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />
            <div className="inline-flex p-3.5 rounded-full bg-primary/10 text-primary">
              <UploadCloud size={32} />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold text-foreground">
                Click to upload or drag & drop CSV file
              </div>
              <div className="text-xs text-muted-foreground">
                Mandatory headers: firstName, middleName, lastName, gender
              </div>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadSample();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground bg-background transition-colors"
              >
                <Download size={14} />
                <span>Download Sample CSV Template</span>
              </button>
            </div>
          </div>
        )}

        {file && parseResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{file.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB • {parseResult.totalRows} records found
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearFile}
                className="p-2 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                title="Remove file"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 text-xs">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>Valid rows ready: <strong>{parseResult.validRowCount}</strong></span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-300 text-xs">
                <AlertCircle size={16} className="shrink-0" />
                <span>Rows with missing fields: <strong>{parseResult.invalidRowCount}</strong></span>
              </div>
            </div>

            <div className="max-h-56 overflow-auto rounded-xl border border-border">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b border-border font-semibold text-muted-foreground sticky top-0">
                  <tr>
                    <th className="p-2.5">Row</th>
                    <th className="p-2.5">First</th>
                    <th className="p-2.5">Middle</th>
                    <th className="p-2.5">Last</th>
                    <th className="p-2.5">Gender</th>
                    <th className="p-2.5">Email</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {parseResult.rows.slice(0, 15).map((r) => (
                    <tr key={r.rowNumber} className={r.isValid ? "bg-background/40" : "bg-rose-500/5"}>
                      <td className="p-2.5 font-mono text-muted-foreground">{r.rowNumber}</td>
                      <td className="p-2.5 font-medium">{r.raw.firstName || "-"}</td>
                      <td className="p-2.5">{r.raw.middleName || "-"}</td>
                      <td className="p-2.5">{r.raw.lastName || "-"}</td>
                      <td className="p-2.5 uppercase">{r.raw.gender || "-"}</td>
                      <td className="p-2.5 font-mono text-muted-foreground">{r.raw.email || "-"}</td>
                      <td className="p-2.5">
                        {r.isValid ? (
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            Valid
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                            Missing fields
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {parseResult.totalRows > 15 && (
              <div className="text-center text-xs text-muted-foreground">
                Showing first 15 rows of {parseResult.totalRows} total rows.
              </div>
            )}
          </div>
        )}

        <SubmitButton
          isLoading={mutation.isPending}
          disabled={!file || !parseResult || parseResult.totalRows === 0}
          loadingText="Processing Batch..."
          icon={<CheckCircle2 size={18} />}
          iconPosition="right"
          className="w-full"
        >
          Process {parseResult ? `${parseResult.totalRows} Teachers` : "Batch"}
        </SubmitButton>
      </form>
    </div>
  );
}
