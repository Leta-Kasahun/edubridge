"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  MoreVertical,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { TableToolbar, FilterGroup } from "@/shared/components/TableToolbar";
import { Lookup } from "../types/lookup.types";
import { cn } from "@/lib/utils";

const SAMPLE_PREFERENCES: readonly Lookup[] = [
  {
    id: "pref-1",
    category: "FEATURE",
    key: "ENABLE_ONLINE_ADMISSIONS",
    value: true,
    description: "Allow prospective students and parents to submit admission forms online.",
    isActive: true,
    createdAt: "2026-01-15",
    updatedAt: "2026-08-20",
  },
  {
    id: "pref-2",
    category: "FEATURE",
    key: "ENABLE_ATTENDANCE_SMS",
    value: true,
    description: "Send automated SMS notifications to parents for unexcused student absences.",
    isActive: true,
    createdAt: "2026-01-15",
    updatedAt: "2026-08-20",
  },
  {
    id: "pref-3",
    category: "POLICY",
    key: "ATTENDANCE_GRACE_PERIOD_MINUTES",
    value: 15,
    description: "Number of minutes after class commencement before a student is flagged late.",
    isActive: true,
    createdAt: "2026-02-01",
    updatedAt: "2026-08-19",
  },
  {
    id: "pref-4",
    category: "POLICY",
    key: "MINIMUM_PASSING_PERCENTAGE",
    value: 50,
    description: "Academic passing standard threshold for quarterly examinations.",
    isActive: true,
    createdAt: "2026-02-01",
    updatedAt: "2026-08-19",
  },
  {
    id: "pref-5",
    category: "SETTING",
    key: "ACADEMIC_YEAR_ACTIVE",
    value: "2025-2026",
    description: "Current active academic session for all enrollment and grade books.",
    isActive: true,
    createdAt: "2026-01-01",
    updatedAt: "2026-08-01",
  },
  {
    id: "pref-6",
    category: "NOTIFICATION",
    key: "EXAM_PUBLISH_BROADCAST",
    value: true,
    description: "Notify staff and department heads upon grade sheet release.",
    isActive: true,
    createdAt: "2026-03-10",
    updatedAt: "2026-08-15",
  },
];

export function PreferencesManager() {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [preferences, setPreferences] = useState<readonly Lookup[]>(SAMPLE_PREFERENCES);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [editingItem, setEditingItem] = useState<Lookup | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [formCategory, setFormCategory] = useState("SETTING");
  const [formKey, setFormKey] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formDesc, setFormDesc] = useState("");

  const filtered = preferences.filter((item) => {
    const matchesCat = selectedCategory === "ALL" || item.category === selectedCategory;
    const matchesSearch =
      item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const searchSuggestions = preferences.map((p) => p.key);

  const filterGroups: readonly FilterGroup[] = [
    {
      id: "category",
      label: "Category",
      icon: SlidersHorizontal,
      selectedValue: selectedCategory,
      onSelect: (val) => setSelectedCategory(val),
      options: [
        { label: "All Categories", value: "ALL", count: preferences.length },
        {
          label: "Features",
          value: "FEATURE",
          count: preferences.filter((p) => p.category === "FEATURE").length,
        },
        {
          label: "Policies",
          value: "POLICY",
          count: preferences.filter((p) => p.category === "POLICY").length,
        },
        {
          label: "Settings",
          value: "SETTING",
          count: preferences.filter((p) => p.category === "SETTING").length,
        },
        {
          label: "Notifications",
          value: "NOTIFICATION",
          count: preferences.filter((p) => p.category === "NOTIFICATION").length,
        },
      ],
    },
  ];

  const toggleBooleanPreference = (id: string) => {
    setPreferences((prev) =>
      prev.map((item) =>
        item.id === id && typeof item.value === "boolean"
          ? { ...item, value: !item.value, updatedAt: new Date().toISOString().split("T")[0] }
          : item
      )
    );
  };

  const openEditModal = (item: Lookup) => {
    setEditingItem(item);
    setFormCategory(item.category);
    setFormKey(item.key);
    setFormValue(String(item.value));
    setFormDesc(item.description || "");
    setActiveMenuId(null);
  };

  const openAddModal = () => {
    setIsAdding(true);
    setFormCategory("SETTING");
    setFormKey("");
    setFormValue("");
    setFormDesc("");
  };

  const handleDelete = (id: string) => {
    setPreferences((prev) => prev.filter((p) => p.id !== id));
    setActiveMenuId(null);
  };

  const parseValue = (raw: string): unknown => {
    if (raw.toLowerCase() === "true") return true;
    if (raw.toLowerCase() === "false") return false;
    if (!isNaN(Number(raw)) && raw.trim() !== "") return Number(raw);
    return raw;
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !formKey) return;

    setPreferences((prev) =>
      prev.map((p) =>
        p.id === editingItem.id
          ? {
              ...p,
              category: formCategory,
              key: formKey.toUpperCase().replace(/\s+/g, "_"),
              value: parseValue(formValue),
              description: formDesc,
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : p
      )
    );
    setEditingItem(null);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKey) return;

    const newItem: Lookup = {
      id: `pref-${Date.now()}`,
      category: formCategory,
      key: formKey.toUpperCase().replace(/\s+/g, "_"),
      value: parseValue(formValue),
      description: formDesc,
      isActive: true,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    setPreferences((prev) => [newItem, ...prev]);
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      <TableToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search preference codes..."
        searchSuggestions={searchSuggestions}
        filters={filterGroups}
        actionButton={
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors shadow-2xs w-fit cursor-pointer shrink-0"
          >
            <Plus size={15} />
            <span>New Item</span>
          </button>
        }
      />

      <div className="bg-card rounded-xl border border-border shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="px-4 sm:px-6 py-3">Code</th>
                <th className="px-4 sm:px-6 py-3">Category</th>
                <th className="px-4 sm:px-6 py-3">Value</th>
                <th className="px-4 sm:px-6 py-3 hidden md:table-cell">Updated</th>
                <th className="px-4 sm:px-6 py-3">Status</th>
                <th className="px-4 sm:px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((pref) => {
                const isBool = typeof pref.value === "boolean";

                return (
                  <tr key={pref.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 sm:px-6 py-3.5 font-mono text-[11px] font-semibold text-foreground">
                      {pref.key}
                    </td>

                    <td className="px-4 sm:px-6 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground">
                        {pref.category}
                      </span>
                    </td>

                    <td className="px-4 sm:px-6 py-3.5">
                      {isBool ? (
                        <button
                          type="button"
                          onClick={() => toggleBooleanPreference(pref.id)}
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors",
                            pref.value
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {pref.value ? "Enabled" : "Disabled"}
                        </button>
                      ) : (
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground">
                          {String(pref.value)}
                        </span>
                      )}
                    </td>

                    <td className="px-4 sm:px-6 py-3.5 hidden md:table-cell text-muted-foreground">
                      {pref.updatedAt}
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
                          setActiveMenuId(activeMenuId === pref.id ? null : pref.id)
                        }
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-hidden cursor-pointer"
                        aria-label="Actions"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeMenuId === pref.id && (
                        <div className="absolute right-6 top-10 w-32 bg-card border border-border rounded-xl shadow-lg p-1 z-30 animate-in fade-in-0 zoom-in-95">
                          <button
                            type="button"
                            onClick={() => openEditModal(pref)}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 size={13} className="text-primary" />
                            <span>Manage</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(pref.id)}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {(editingItem || isAdding) && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground">
                {editingItem ? "Manage Preference" : "New Preference"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setIsAdding(false);
                }}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={editingItem ? handleSaveEdit : handleSaveAdd} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Code
                </label>
                <input
                  type="text"
                  required
                  value={formKey}
                  onChange={(e) => setFormKey(e.target.value)}
                  className="w-full h-9 px-3 text-xs font-mono bg-muted/40 border border-border rounded-lg text-foreground focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-muted/40 border border-border rounded-lg text-foreground focus:outline-hidden focus:border-primary"
                >
                  <option value="SETTING">SETTING</option>
                  <option value="POLICY">POLICY</option>
                  <option value="FEATURE">FEATURE</option>
                  <option value="NOTIFICATION">NOTIFICATION</option>
                  <option value="SECURITY">SECURITY</option>
                  <option value="CUSTOM">CUSTOM</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Value
                </label>
                <input
                  type="text"
                  required
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
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

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setIsAdding(false);
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
