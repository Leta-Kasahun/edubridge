"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";
import { useUiStore } from "@/stores/ui.store";
import { useAuthStore } from "@/stores/auth.store";
import { getNavigationTree, NavNode } from "@/shared/utils/navigation";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { Logo } from "@/shared/components/Logo";

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
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const fullPath = tabParam ? `${pathname}?tab=${tabParam}` : pathname;
  const hasChildren = Boolean(node.children && node.children.length > 0);

  const isChildActive = Boolean(
    hasChildren &&
    (node.children?.some(
      (child) =>
        child.href === fullPath ||
        pathname === child.href ||
        (child.href !== ROUTES.DASHBOARD && pathname.startsWith(child.href + "/"))
    ) ||
      (node.href !== ROUTES.DASHBOARD &&
        pathname.startsWith(node.href) &&
        pathname !== node.href))
  );

  const [isOpen, setIsOpen] = useState(() => {
    return (
      isChildActive ||
      (pathname.startsWith(node.href) && node.href !== ROUTES.DASHBOARD)
    );
  });

  useEffect(() => {
    if (isChildActive) {
      setIsOpen(true);
    }
  }, [isChildActive]);

  const isDetailRoute =
    !hasChildren &&
    node.href !== ROUTES.DASHBOARD &&
    pathname.startsWith(node.href + "/") &&
    !pathname.startsWith(ROUTES.ASSESSMENTS.RESULTS) &&
    !pathname.startsWith(ROUTES.QUESTION_BANK.EXAM_CONTEXTS) &&
    !pathname.startsWith(ROUTES.QUESTION_BANK.BANKS);

  const isActive =
    !hasChildren &&
    (node.href.includes("?")
      ? fullPath === node.href
      : node.href === ROUTES.DASHBOARD
        ? pathname === ROUTES.DASHBOARD && !tabParam
        : pathname === node.href || isDetailRoute);

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
          onClick={(e) => {
            if (hasChildren) {
              toggleOpen(e);
            } else {
              onNavigate();
            }
          }}
          title={collapsed ? node.label : undefined}
          className={cn(
            "flex-1 flex items-center gap-2.5 rounded-lg text-xs font-medium transition-colors duration-150 group relative cursor-pointer",
            depth === 0 ? "px-2.5 py-2" : depth === 1 ? "pl-8 pr-2.5 py-1.5" : "pl-11 pr-2 py-1.5",
            collapsed && !mobileOpen ? "justify-center px-1.5" : "",
            isActive
              ? "bg-[#0C4A6E] text-[#38BDF8] font-semibold"
              : isChildActive
                ? "text-white font-medium bg-[#1E293B]/50 hover:bg-[#1E293B]/80"
                : "text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white"
          )}
        >
          {Icon ? (
            <Icon
              size={18}
              className={cn(
                "shrink-0 transition-colors",
                isActive || isChildActive ? "text-[#38BDF8]" : "text-[#94A3B8] group-hover:text-white"
              )}
            />
          ) : (
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full shrink-0",
                isActive ? "bg-[#38BDF8]" : "bg-[#94A3B8]/60 group-hover:bg-white"
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
                  ? "bg-[#0284C7]/20 text-[#38BDF8]"
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
            className={cn(
              "p-1.5 ml-0.5 rounded-md focus:outline-hidden cursor-pointer transition-colors",
              isChildActive
                ? "text-[#38BDF8]/80 hover:text-[#38BDF8] hover:bg-[#1E293B]"
                : "text-[#94A3B8] hover:text-white hover:bg-[#1E293B]"
            )}
            aria-label={isOpen ? "Collapse submenu" : "Expand submenu"}
          >
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
      </div>

      {hasChildren && isOpen && (!collapsed || mobileOpen) && (
        <div className="space-y-0.5 relative before:absolute before:left-4 before:top-1 before:bottom-1 before:w-px before:bg-[#1E293B]">
          {node.children?.map((child, childIdx) => (
            <NavTreeItem
              key={`${child.href}-${child.label}-${childIdx}`}
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
                href={ROUTES.HOME}
                onClick={closeMobile}
                className="flex items-center gap-2.5 overflow-hidden rounded-lg focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
                title="EduBridge Home"
              >
                <Logo
                  variant="full"
                  size="sm"
                  theme="dark"
                  frame="none"
                  priority
                />
              </Link>

              <div className="flex items-center">
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#38BDF8] transition-colors cursor-pointer"
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                >
                  <PanelLeftClose size={18} />
                </button>

                <button
                  type="button"
                  onClick={closeMobile}
                  className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] focus:outline-hidden cursor-pointer"
                  aria-label="Close navigation"
                >
                  <X size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Link
                href={ROUTES.HOME}
                title="EduBridge Home"
                className="focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#38BDF8] rounded-lg"
              >
                <Logo
                  variant="mark"
                  size="xs"
                  theme="dark"
                  frame="none"
                  priority
                />
              </Link>
              <button
                type="button"
                onClick={toggleSidebar}
                className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#38BDF8] transition-colors cursor-pointer"
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <PanelLeftOpen size={16} />
              </button>
            </div>
          )}
        </div>

        {(!sidebarCollapsed || sidebarMobileOpen) && (
          <div className="px-3.5 py-3 border-b border-[#1E293B]">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#1E293B]/70 to-[#0F172A]/90 border border-[#1E293B] shadow-2xs space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-bold text-slate-100 truncate tracking-tight">
                  {orgName}
                </h3>
                <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-md bg-[#0284C7]/20 text-[#38BDF8] border border-[#0284C7]/30 shrink-0">
                  {roleLabel}
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 font-medium truncate">
                {orgSubtitle}
              </p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 scrollbar-thin">
          {navTree.map((node, nodeIdx) => (
            <NavTreeItem
              key={`${node.href}-${node.label}-${nodeIdx}`}
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
