"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { TeacherListTable } from "./TeacherListTable";
import { TeacherProvisioningForm } from "./TeacherProvisioningForm";
import { TeacherBulkProvisioningForm } from "./TeacherBulkProvisioningForm";
import { TeacherProvisioningResultCard } from "./TeacherProvisioningResultCard";
import { TeacherEditModal } from "./TeacherEditModal";
import { TeacherDetailModal } from "./TeacherDetailModal";
import {
  TeacherRecord,
  TeacherProvisionResult,
  TeacherBulkProvisionResult,
} from "../types/teacher-provisioning.types";

export function TeacherProvisioningManager() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedTeacherForEdit, setSelectedTeacherForEdit] =
    useState<TeacherRecord | null>(null);
  const [selectedTeacherForView, setSelectedTeacherForView] =
    useState<TeacherRecord | null>(null);

  const [provisionResult, setProvisionResult] =
    useState<TeacherProvisionResult | null>(null);
  const [bulkResult, setBulkResult] =
    useState<TeacherBulkProvisionResult | null>(null);

  const handleSingleSuccess = (result: TeacherProvisionResult) => {
    setIsAddModalOpen(false);
    setProvisionResult(result);
  };

  const handleBulkSuccess = (result: TeacherBulkProvisionResult) => {
    setIsImportModalOpen(false);
    setBulkResult(result);
  };

  const handleResetResults = () => {
    setProvisionResult(null);
    setBulkResult(null);
  };

  return (
    <div className="space-y-6 w-full">
      <TeacherListTable
        onAddTeacher={() => setIsAddModalOpen(true)}
        onImportCsv={() => setIsImportModalOpen(true)}
        onEditTeacher={(teacher) => setSelectedTeacherForEdit(teacher)}
        onViewTeacher={(teacher) => setSelectedTeacherForView(teacher)}
      />

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground">Add New Teacher</h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <TeacherProvisioningForm onSuccess={handleSingleSuccess} />
            </div>
          </div>
        </div>
      )}

      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground">Import Teachers via CSV</h2>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <TeacherBulkProvisioningForm onSuccess={handleBulkSuccess} />
            </div>
          </div>
        </div>
      )}

      {(provisionResult || bulkResult) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground">Onboarding Completed</h2>
              <button
                type="button"
                onClick={handleResetResults}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <TeacherProvisioningResultCard
                result={provisionResult}
                bulkResult={bulkResult}
                onReset={handleResetResults}
              />
            </div>
          </div>
        </div>
      )}

      {selectedTeacherForEdit && (
        <TeacherEditModal
          teacher={selectedTeacherForEdit}
          isOpen={Boolean(selectedTeacherForEdit)}
          onClose={() => setSelectedTeacherForEdit(null)}
        />
      )}

      {selectedTeacherForView && (
        <TeacherDetailModal
          teacher={selectedTeacherForView}
          isOpen={Boolean(selectedTeacherForView)}
          onClose={() => setSelectedTeacherForView(null)}
          onEdit={() => {
            const current = selectedTeacherForView;
            setSelectedTeacherForView(null);
            setSelectedTeacherForEdit(current);
          }}
        />
      )}
    </div>
  );
}
