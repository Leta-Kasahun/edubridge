"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  ChevronRight,
  X,
  School,
  ShieldCheck,
} from "lucide-react";
import { useUiStore } from "@/stores/ui.store";
import { useAuthStore } from "@/stores/auth.store";
import { getNavigationTree, NavNode } from "@/shared/utils/navigation";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

function NavTreeItem({
  node,
  depth = 0,
  collapsed,
  mobileOpen,
  onNavigate,
}: {
  readonly node: NavNode;
  readonly depth?: number;
  readonly collapsed: boolean;
  readonly mobileOpen: boolean;
  readonly onNavigate: () => void;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(() => {
    return pathname.startsWith(node.href) && node.href !== ROUTES.DASHBOARD;
  });

  const hasChildren = Boolean(node.children && node.children.length > 0);
  const isActive =
    node.href === ROUTES.DASHBOARD
      ? pathname === ROUTES.DASHBOARD
      : pathname === node.href || (pathname.startsWith(node.href) && !hasChildren);

  const isChildActive = Boolean(
    hasChildren && pathname.startsWith(node.href) && pathname !== node.href
  );

  const Icon = node.icon;

  const toggleOpen = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <div className="space-y-0.5">
      <div className="flex items-center">
        <Link
          href={node.href}
          onClick={() => {
            if (!hasChildren) onNavigate();
          }}
          title={collapsed ? node.label : undefined}
          className={cn(
            "flex-1 flex items-center gap-2.5 rounded-lg text-xs font-medium transition-colors duration-150 group relative",
            depth === 0 ? "px-2.5 py-2" : depth === 1 ? "pl-8 pr-2.5 py-1.5" : "pl-11 pr-2 py-1.5",
            collapsed && !mobileOpen ? "justify-center px-1.5" : "",
            isActive
              ? "bg-[#064E3B] text-[#6EE7B7] font-semibold"
              : isChildActive
              ? "text-white font-medium bg-[#1E293B]/40"
              : "text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white"
          )}
        >
          {Icon ? (
            <Icon
              size={18}
              className={cn(
                "shrink-0 transition-colors",
                isActive ? "text-[#6EE7B7]" : "text-[#94A3B8] group-hover:text-white"
              )}
            />
          ) : (
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full shrink-0",
                isActive ? "bg-[#6EE7B7]" : "bg-[#94A3B8]/60 group-hover:bg-white"
              )}
            />
          )}

          {(!collapsed || mobileOpen) && (
            <span className="truncate flex-1">{node.label}</span>
          )}

          {(!collapsed || mobileOpen) && node.badge && (
            <span
              className={cn(
                "px-1.5 py-0.5 text-[10px] font-semibold rounded-full",
                isActive
                  ? "bg-[#6EE7B7]/20 text-[#6EE7B7]"
                  : "bg-[#1E293B] text-[#94A3B8] group-hover:text-white"
              )}
            >
              {node.badge}
            </span>
          )}
        </Link>

        {hasChildren && (!collapsed || mobileOpen) && (
          <button
            type="button"
            onClick={toggleOpen}
            className="p-1.5 ml-0.5 rounded-md text-[#94A3B8] hover:text-white hover:bg-[#1E293B] focus:outline-hidden"
            aria-label={isOpen ? "Collapse submenu" : "Expand submenu"}
          >
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
      </div>

      {hasChildren && isOpen && (!collapsed || mobileOpen) && (
        <div className="space-y-0.5 relative before:absolute before:left-4 before:top-1 before:bottom-1 before:w-px before:bg-[#1E293B]">
          {node.children?.map((child) => (
            <NavTreeItem
              key={child.href}
              node={child}
              depth={depth + 1}
              collapsed={collapsed}
              mobileOpen={mobileOpen}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const sidebarMobileOpen = useUiStore((state) => state.sidebarMobileOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const setSidebarMobileOpen = useUiStore((state) => state.setSidebarMobileOpen);
  const user = useAuthStore((state) => state.user);

  const closeMobile = () => setSidebarMobileOpen(false);

  const userRoles = user?.roles ?? [];
  const isSystemAdmin = userRoles.includes("SYSTEM_ADMIN");
  const navTree = getNavigationTree(userRoles);

  const roleLabel = isSystemAdmin
    ? "System Admin"
    : userRoles[0]
    ? userRoles[0].replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "School Admin";

  const orgName = isSystemAdmin
    ? "EduBridge Platform"
    : user?.memberships?.[0]?.tenantName ?? "Greenfield Academy";

  const orgSubtitle = isSystemAdmin ? "Global Operations" : "2025-2026 Academic Term";

  return (
    <>
      {sidebarMobileOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close mobile sidebar backdrop"
          onClick={closeMobile}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") closeMobile();
          }}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity duration-200"
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0F172A] border-r border-[#1E293B] transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "lg:w-20" : "lg:w-64",
          sidebarMobileOpen
            ? "translate-x-0 w-64 shadow-2xl"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center px-3.5 border-b border-[#1E293B]",
            sidebarCollapsed ? "lg:justify-center" : "justify-between"
          )}
        >
          {(!sidebarCollapsed || sidebarMobileOpen) ? (
            <>
              <Link
                href={ROUTES.DASHBOARD}
                onClick={closeMobile}
                className="flex items-center gap-2.5 overflow-hidden rounded-lg focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#6EE7B7]"
              >
                <div className="h-8 w-8 shrink-0 rounded-lg bg-[#064E3B] text-[#6EE7B7] flex items-center justify-center border border-[#064E3B]">
                  {isSystemAdmin ? (
                    <ShieldCheck size={18} className="stroke-[2.3]" />
                  ) : (
                    <GraduationCap size={18} className="stroke-[2.3]" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-white tracking-tight truncate leading-none">
                    Edu<span className="text-[#6EE7B7]">Bridge</span>
                  </span>
                  <span className="text-[10px] font-medium text-[#94A3B8] truncate mt-0.5">
                    {roleLabel}
                  </span>
                </div>
              </Link>

              <div className="flex items-center">
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="hidden lg:flex p-1.5 rounded-lg text-white hover:bg-[#1E293B] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#6EE7B7] transition-colors"
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                >
                  <PanelLeftClose size={20} className="text-white" />
                </button>

                <button
                  type="button"
                  onClick={closeMobile}
                  className="lg:hidden p-1.5 rounded-lg text-white hover:bg-[#1E293B] focus:outline-hidden"
                  aria-label="Close navigation"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={toggleSidebar}
              className="hidden lg:flex p-2 rounded-lg text-white hover:bg-[#1E293B] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#6EE7B7] transition-colors"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <PanelLeftOpen size={20} className="text-white" />
            </button>
          )}
        </div>

        {(!sidebarCollapsed || sidebarMobileOpen) && (
          <div className="px-3.5 py-3 border-b border-[#1E293B]">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-[#1E293B]/60 border border-[#1E293B]">
              <div className="h-8 w-8 rounded-lg bg-[#0F172A] text-[#6EE7B7] flex items-center justify-center shrink-0 border border-[#1E293B]">
                {isSystemAdmin ? <ShieldCheck size={16} /> : <School size={16} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">
                  {orgName}
                </p>
                <span className="inline-block text-[10px] text-[#6EE7B7] font-medium">
                  {orgSubtitle}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 scrollbar-thin">
          {navTree.map((node) => (
            <NavTreeItem
              key={node.href}
              node={node}
              collapsed={sidebarCollapsed}
              mobileOpen={sidebarMobileOpen}
              onNavigate={closeMobile}
            />
          ))}
        </div>
      </aside>
    </>
  );
}
