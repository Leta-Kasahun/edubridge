"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  MoreVertical,
  Check,
  X,
  Lock,
  Filter,
} from "lucide-react";
import { TableToolbar, FilterGroup } from "@/shared/components/TableToolbar";
import { useRoles } from "../hooks/usePermissions";
import { Role } from "../types/permissions.types";
import { cn } from "@/lib/utils";

const SAMPLE_ROLES: readonly Role[] = [
  {
    id: "r-1",
    name: "School Administrator",
    code: "SCHOOL_ADMIN",
    description: "Full administrative access to all modules and configurations.",
    isSystem: true,
    isActive: true,
    createdAt: "2026-01-10",
    updatedAt: "2026-08-20",
  },
  {
    id: "r-2",
    name: "Teaching Staff",
    code: "TEACHER",
    description: "Access to assigned classrooms, grading, and attendance.",
    isSystem: true,
    isActive: true,
    createdAt: "2026-01-10",
    updatedAt: "2026-08-20",
  },
  {
    id: "r-3",
    name: "Academic Coordinator",
    code: "ACADEMIC_COORDINATOR",
    description: "Curriculum planning, exam scheduling, and department oversight.",
    isSystem: false,
    isActive: true,
    createdAt: "2026-03-15",
    updatedAt: "2026-08-18",
  },
  {
    id: "r-4",
    name: "Attendance Officer",
    code: "ATTENDANCE_OFFICER",
    description: "Daily student attendance verification and parent alerts.",
    isSystem: false,
    isActive: true,
    createdAt: "2026-04-01",
    updatedAt: "2026-08-15",
  },
  {
    id: "r-5",
    name: "Registrar & Admissions",
    code: "REGISTRAR",
    description: "Student enrollments, academic transcripts, and record archives.",
    isSystem: false,
    isActive: true,
    createdAt: "2026-05-10",
    updatedAt: "2026-08-12",
  },
];

const PERMISSION_MODULES = [
  { resource: "student", label: "Students", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
  { resource: "class", label: "Classes", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
  { resource: "attendance", label: "Attendance", actions: ["READ", "UPDATE", "MANAGE"] },
  { resource: "exam", label: "Exams", actions: ["CREATE", "READ", "UPDATE", "MANAGE"] },
  { resource: "lookup", label: "Preferences", actions: ["READ", "UPDATE", "MANAGE"] },
  { resource: "role", label: "Roles", actions: ["READ", "UPDATE", "MANAGE"] },
];

export function RolesAccessManager() {
  const { data: apiRoles } = useRoles();
  const [roles, setRoles] = useState<readonly Role[]>(apiRoles || SAMPLE_ROLES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isCreatingRole, setIsCreatingRole] = useState(false);

  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formDesc, setFormDesc] = useState("");

  const [rolePermissions, setRolePermissions] = useState<Record<string, boolean>>({
    "r-1:student:CREATE": true,
    "r-1:student:READ": true,
    "r-1:student:UPDATE": true,
    "r-1:student:DELETE": true,
    "r-1:class:CREATE": true,
    "r-1:class:READ": true,
    "r-1:class:UPDATE": true,
    "r-1:attendance:MANAGE": true,
    "r-1:exam:MANAGE": true,
    "r-1:role:MANAGE": true,
    "r-2:student:READ": true,
    "r-2:class:READ": true,
    "r-2:attendance:UPDATE": true,
    "r-2:exam:UPDATE": true,
  });

  const filteredRoles = roles.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      selectedType === "ALL" ||
      (selectedType === "SYSTEM" && r.isSystem) ||
      (selectedType === "CUSTOM" && !r.isSystem);
    return matchesSearch && matchesType;
  });

  const searchSuggestions = roles.map((r) => r.code);

  const filterGroups: readonly FilterGroup[] = [
    {
      id: "type",
      label: "Role Type",
      icon: Filter,
      selectedValue: selectedType,
      onSelect: (val) => setSelectedType(val),
      options: [
        { label: "All Types", value: "ALL", count: roles.length },
        { label: "System", value: "SYSTEM", count: roles.filter((r) => r.isSystem).length },
        { label: "Custom", value: "CUSTOM", count: roles.filter((r) => !r.isSystem).length },
      ],
    },
  ];

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setFormName(role.name);
    setFormCode(role.code);
    setFormDesc(role.description || "");
    setActiveMenuId(null);
  };

  const openCreateModal = () => {
    setIsCreatingRole(true);
    setFormName("");
    setFormCode("");
    setFormDesc("");
  };

  const handleDeleteRole = (id: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
    setActiveMenuId(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole || !formName) return;

    setRoles((prev) =>
      prev.map((r) =>
        r.id === editingRole.id
          ? {
              ...r,
              name: formName,
              code: formCode,
              description: formDesc,
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : r
      )
    );
    setEditingRole(null);
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formCode) return;

    const newRole: Role = {
      id: `r-${Date.now()}`,
      name: formName,
      code: formCode.toUpperCase().replace(/\s+/g, "_"),
      description: formDesc,
      isSystem: false,
      isActive: true,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    setRoles((prev) => [...prev, newRole]);
    setIsCreatingRole(false);
  };

  const togglePermission = (roleId: string, resource: string, action: string) => {
    const key = `${roleId}:${resource}:${action}`;
    setRolePermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-4">
      <TableToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search role codes & names..."
        searchSuggestions={searchSuggestions}
        filters={filterGroups}
        actionButton={
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors shadow-2xs w-fit cursor-pointer shrink-0"
          >
            <Plus size={15} />
            <span>New Role</span>
          </button>
        }
      />

      <div className="bg-card rounded-xl border border-border shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="px-4 sm:px-6 py-3">Code</th>
                <th className="px-4 sm:px-6 py-3">Role Name</th>
                <th className="px-4 sm:px-6 py-3">Type</th>
                <th className="px-4 sm:px-6 py-3 hidden md:table-cell">Created</th>
                <th className="px-4 sm:px-6 py-3">Status</th>
                <th className="px-4 sm:px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRoles.map((role) => (
                <tr key={role.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 sm:px-6 py-3.5 font-mono text-[11px] font-semibold text-foreground">
                    {role.code}
                  </td>

                  <td className="px-4 sm:px-6 py-3.5 font-medium text-foreground">
                    {role.name}
                  </td>

                  <td className="px-4 sm:px-6 py-3.5">
                    {role.isSystem ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground">
                        <Lock size={10} />
                        System
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground">
                        Custom
                      </span>
                    )}
                  </td>

                  <td className="px-4 sm:px-6 py-3.5 hidden md:table-cell text-muted-foreground">
                    {role.createdAt}
                  </td>

                  <td className="px-4 sm:px-6 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground">
                      Active
                    </span>
                  </td>

                  <td className="px-4 sm:px-6 py-3.5 text-right relative">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMenuId(activeMenuId === role.id ? null : role.id || null)
                      }
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-hidden cursor-pointer"
                      aria-label="Actions"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {activeMenuId === role.id && (
                      <div className="absolute right-6 top-10 w-36 bg-card border border-border rounded-xl shadow-lg p-1 z-30 animate-in fade-in-0 zoom-in-95">
                        <button
                          type="button"
                          onClick={() => openEditModal(role)}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 size={13} className="text-primary" />
                          <span>Manage</span>
                        </button>

                        {!role.isSystem && (
                          <button
                            type="button"
                            onClick={() => handleDeleteRole(role.id || "")}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(editingRole || isCreatingRole) && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground">
                {editingRole ? "Manage Role & Permissions" : "Create Custom Role"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingRole(null);
                  setIsCreatingRole(false);
                }}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={editingRole ? handleSaveEdit : handleSaveCreate}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Role Code
                </label>
                <input
                  type="text"
                  required
                  disabled={Boolean(editingRole?.isSystem)}
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  className="w-full h-9 px-3 text-xs font-mono bg-muted/40 border border-border rounded-lg text-foreground focus:outline-hidden focus:border-primary disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-muted/40 border border-border rounded-lg text-foreground focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full p-2.5 text-xs bg-muted/40 border border-border rounded-lg text-foreground focus:outline-hidden focus:border-primary"
                />
              </div>

              {editingRole && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <span className="text-xs font-bold text-foreground block">
                    Module Access Matrix
                  </span>

                  <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
                    {PERMISSION_MODULES.map((mod) => (
                      <div
                        key={mod.resource}
                        className="p-2.5 flex items-center justify-between gap-2"
                      >
                        <span className="text-xs font-medium text-foreground">
                          {mod.label}
                        </span>

                        <div className="flex items-center gap-1">
                          {mod.actions.map((act) => {
                            const isGranted =
                              editingRole.code === "SCHOOL_ADMIN" ||
                              Boolean(rolePermissions[`${editingRole.id}:${mod.resource}:${act}`]);

                            return (
                              <button
                                key={act}
                                type="button"
                                disabled={editingRole.isSystem}
                                onClick={() =>
                                  togglePermission(editingRole.id || "", mod.resource, act)
                                }
                                className={cn(
                                  "inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors",
                                  isGranted
                                    ? "bg-[#064E3B] text-[#6EE7B7] border-[#064E3B]"
                                    : "bg-muted text-muted-foreground border-transparent",
                                  editingRole.isSystem ? "cursor-default" : "cursor-pointer"
                                )}
                              >
                                {isGranted && <Check size={10} />}
                                <span>{act}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setEditingRole(null);
                    setIsCreatingRole(false);
                  }}
                  className="px-3.5 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary hover:bg-primary-hover text-white cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
