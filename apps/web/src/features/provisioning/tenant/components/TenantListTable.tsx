"use client";

import { useState } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TableToolbar, FilterGroup } from "@/shared/components/TableToolbar";
import { SearchHighlight, SearchQueryProvider } from "@/shared/components/SearchHighlight";
import { TableSkeleton } from "@/shared/components";
import { TenantActionDropdown } from "./TenantActionDropdown";
import {
  useTenants,
  useDeactivateTenant,
  useActivateTenant,
} from "../hooks/useTenantProvisioning";
import {
  TenantRecord,
  TenantStatus,
} from "../types/tenant-provisioning.types";

export interface TenantListTableProps {
  readonly onAddSchool: () => void;
  readonly onViewTenant: (tenant: TenantRecord) => void;
  readonly onRegenerateCredentials?: (tenant: TenantRecord) => void;
}

export function TenantListTable({
  onAddSchool,
  onViewTenant,
  onRegenerateCredentials,
}: TenantListTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TenantStatus | undefined>(undefined);
  const [page, setPage] = useState(1);

  const { data: response, isLoading } = useTenants({
    page,
    limit: 10,
    search: search.trim() || undefined,
    status: statusFilter,
  });

  const deactivateMutation = useDeactivateTenant();
  const activateMutation = useActivateTenant();

  const tenants = response?.data || [];
  const pagination = response?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  const handleToggleStatus = async (tenant: TenantRecord) => {
    if (tenant.status === "ACTIVE") {
      await deactivateMutation.mutateAsync(tenant.id);
    } else {
      await activateMutation.mutateAsync(tenant.id);
    }
  };

  const filterGroups: readonly FilterGroup[] = [
    {
      id: "status",
      label: "Status",
      options: [
        { label: "All Statuses", value: "" },
        { label: "Active", value: "ACTIVE" },
        { label: "Suspended", value: "SUSPENDED" },
      ],
      selectedValue: statusFilter || "",
      onSelect: (val) => {
        setStatusFilter((val as TenantStatus) || undefined);
        setPage(1);
      },
      icon: Filter,
    },
  ];

  const actionButtons = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onAddSchool}
        className="flex items-center gap-1.5 h-9 px-3.5 rounded-none bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
      >
        <Plus size={15} />
        <span>Add School</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-4 w-full">
      <div className="bg-card p-4 rounded-none border border-border">
        <TableToolbar
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="Search by school name, code, admin..."
          filters={filterGroups}
          actionButton={actionButtons}
        />
      </div>

      <SearchQueryProvider query={search}>
        <div className="bg-card rounded-none border border-border shadow-xs pb-1">
        {isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={5} columns={5} hasToolbar={false} hasPagination={false} />
          </div>
        ) : tenants.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="inline-flex p-3 bg-muted text-muted-foreground">
              <Building2 size={28} />
            </div>
            <div className="text-sm font-semibold text-foreground">No schools found</div>
            <div className="text-xs text-muted-foreground max-w-sm mx-auto">
              Get started by adding and provisioning your first school institution.
            </div>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={onAddSchool}
                className="px-3.5 py-1.5 rounded-none bg-primary text-primary-foreground text-xs font-semibold cursor-pointer"
              >
                Add School
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden sm:block overflow-x-visible">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">School</th>
                    <th className="px-4 py-3.5">Code</th>
                    <th className="px-4 py-3.5">Administrator</th>
                    <th className="px-4 py-3.5">Admin Username</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tenants.map((tenant) => (
                    <tr
                      key={tenant.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div>
                          <div className="font-semibold text-foreground">
                            <SearchHighlight text={tenant.name} />
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                            <span>{tenant.totalTeachers} teachers</span>
                            <span>•</span>
                            <span>{tenant.totalStudents} students</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-muted-foreground">
                        <SearchHighlight text={tenant.code} />
                      </td>

                      <td className="px-4 py-3.5">
                        {tenant.admin ? (
                          <div>
                            <div className="font-medium text-foreground">
                              <SearchHighlight text={`${tenant.admin.firstName} ${tenant.admin.lastName}`} />
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              <SearchHighlight text={tenant.admin.email || "No email"} />
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 font-mono font-medium text-foreground">
                        {tenant.admin?.username ? <SearchHighlight text={tenant.admin.username} /> : "—"}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-flex px-2 py-0.5 rounded text-[10px] font-semibold",
                            tenant.status === "ACTIVE"
                              ? "bg-primary/10 text-primary"
                              : "bg-destructive/10 text-destructive"
                          )}
                        >
                          {tenant.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <TenantActionDropdown
                          tenant={tenant}
                          onView={onViewTenant}
                          onToggleStatus={handleToggleStatus}
                          onRegenerateCredentials={onRegenerateCredentials}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="block sm:hidden divide-y divide-border">
              {tenants.map((tenant) => (
                <div key={tenant.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs text-foreground">
                        <SearchHighlight text={tenant.name} />
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Code: <SearchHighlight text={tenant.code} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex px-2 py-0.5 rounded text-[10px] font-semibold",
                          tenant.status === "ACTIVE"
                            ? "bg-primary/10 text-primary"
                            : "bg-destructive/10 text-destructive"
                        )}
                      >
                        {tenant.status}
                      </span>
                      <TenantActionDropdown
                        tenant={tenant}
                        onView={onViewTenant}
                        onToggleStatus={handleToggleStatus}
                        onRegenerateCredentials={onRegenerateCredentials}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground bg-background/50 p-2.5 rounded-lg border border-border">
                    <div>
                      <span className="text-[10px] block uppercase text-muted-foreground">Administrator</span>
                      <span className="font-medium text-foreground">
                        {tenant.admin ? <SearchHighlight text={`${tenant.admin.firstName} ${tenant.admin.lastName}`} /> : "Unassigned"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] block uppercase text-muted-foreground">Teachers</span>
                      <span className="font-mono text-foreground">{tenant.totalTeachers}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-border text-xs text-muted-foreground bg-muted/20">
                <div>
                  Showing {tenants.length} of {pagination.total} schools
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-none border border-border disabled:opacity-40 hover:bg-background transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1.5 rounded-none border border-border disabled:opacity-40 hover:bg-background transition-colors cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      </SearchQueryProvider>
    </div>
  );
}
