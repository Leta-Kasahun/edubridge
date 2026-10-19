"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  PanelLeftClose,
  PanelLeftOpen,
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

  const isCollapsedDesktop = collapsed && !mobileOpen;

  return (
    <div className="space-y-0.5 relative group">
      <div className="flex items-center">
        <Link
          href={node.href}
          onClick={(e) => {
            if (hasChildren && !isCollapsedDesktop) {
              toggleOpen(e);
            } else if (!hasChildren) {
              onNavigate();
            }
          }}
          className={cn(
            "flex-1 flex items-center gap-2.5 rounded-lg text-xs font-medium cursor-pointer relative",
            "transition-all duration-200",
            depth === 0 ? "px-2.5 py-2" : depth === 1 ? "pl-8 pr-2.5 py-1.5" : "pl-11 pr-2 py-1.5",
            isCollapsedDesktop ? "justify-center px-1.5" : "",
            // Vertical accent bar on the left edge
            "before:pointer-events-none before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:rounded-r-full before:transition-all before:duration-200",
            isActive
              ? "bg-[#0C4A6E] text-[#38BDF8] font-semibold before:opacity-100 before:bg-[#38BDF8] before:h-5 shadow-xs"
              : isChildActive
                ? "text-white font-medium bg-[#1E293B]/60 hover:bg-[#1E293B] hover:tracking-wide before:opacity-80 before:bg-[#38BDF8]/70 before:h-4"
                : "text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white hover:tracking-wide before:opacity-0 before:bg-[#38BDF8] hover:before:opacity-100 hover:before:h-4"
          )}
        >
          {Icon ? (
            <Icon
              size={18}
              className={cn(
                "shrink-0 transition-colors duration-200",
                isActive || isChildActive
                  ? "text-[#38BDF8]"
                  : "text-[#94A3B8] group-hover:text-white"
              )}
            />
          ) : (
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full shrink-0 transition-colors duration-200",
                isActive ? "bg-[#38BDF8]" : "bg-[#94A3B8]/60 group-hover:bg-white"
              )}
            />
          )}

          {!isCollapsedDesktop && (
            <span className="truncate flex-1 tracking-normal transition-transform duration-200 ease-out group-hover:translate-x-1.5">
              {node.label}
            </span>
          )}

          {!isCollapsedDesktop && node.badge && (
            <span
              className={cn(
                "px-1.5 py-0.5 text-[10px] font-semibold rounded-full shrink-0 transition-colors",
                isActive
                  ? "bg-[#0284C7]/20 text-[#38BDF8] border border-[#0284C7]/30"
                  : "bg-[#1E293B] text-[#94A3B8] group-hover:text-white"
              )}
            >
              {node.badge}
            </span>
          )}
        </Link>

        {hasChildren && !isCollapsedDesktop && (
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
            <ChevronRight
              size={14}
              className={cn(
                "transition-transform duration-200",
                isOpen && "rotate-90 text-[#38BDF8]"
              )}
            />
          </button>
        )}
      </div>

      {/* Expanded Submenu Tree */}
      {hasChildren && isOpen && !isCollapsedDesktop && (
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

      {/* Collapsed State: Single Item Floating Tooltip */}
      {!hasChildren && isCollapsedDesktop && depth === 0 && (
        <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 transition-all duration-150 transform translate-x-1 group-hover:translate-x-0 hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#0F172A] border border-[#1E293B] text-slate-100 text-xs font-semibold shadow-2xl whitespace-nowrap">
          <span>{node.label}</span>
          {node.badge && (
            <span className="px-1.5 py-0.2 text-[9.5px] rounded-full bg-[#0284C7]/20 text-[#38BDF8] font-bold border border-[#0284C7]/30">
              {node.badge}
            </span>
          )}
        </div>
      )}

      {/* Collapsed State: Hover Submenu Flyout */}
      {hasChildren && isCollapsedDesktop && depth === 0 && (
        <div className="absolute left-full top-0 ml-2.5 z-50 opacity-0 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 transition-all duration-200 transform translate-x-1 group-hover:translate-x-0 hidden lg:block w-52 rounded-xl bg-[#0F172A] border border-[#1E293B] p-1.5 shadow-2xl backdrop-blur-md before:absolute before:-left-3 before:top-0 before:bottom-0 before:w-3 before:content-['']">
          <div className="px-3 py-2 text-xs font-bold text-[#38BDF8] border-b border-[#1E293B] flex items-center gap-2">
            {Icon && <Icon size={14} className="text-[#38BDF8] shrink-0" />}
            <span className="truncate">{node.label}</span>
          </div>

          <div className="py-1 space-y-0.5">
            {node.children?.map((child, childIdx) => {
              const isSubActive =
                child.href === fullPath ||
                pathname === child.href ||
                (child.href !== ROUTES.DASHBOARD && pathname.startsWith(child.href + "/"));
              const SubIcon = child.icon;

              return (
                <Link
                  key={`collapsed-flyout-${child.href}-${childIdx}`}
                  href={child.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 relative group/flyout",
                    isSubActive
                      ? "bg-[#0C4A6E] text-[#38BDF8] font-semibold before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-3.5 before:rounded-r-full before:bg-[#38BDF8]"
                      : "text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white hover:tracking-wide"
                  )}
                >
                  {SubIcon ? (
                    <SubIcon
                      size={14}
                      className={cn(
                        "shrink-0 transition-colors",
                        isSubActive ? "text-[#38BDF8]" : "text-slate-400 group-hover/flyout:text-white"
                      )}
                    />
                  ) : (
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full shrink-0",
                        isSubActive ? "bg-[#38BDF8]" : "bg-slate-500 group-hover/flyout:bg-white"
                      )}
                    />
                  )}
                  <span className="truncate flex-1 transition-transform duration-200 ease-out group-hover/flyout:translate-x-1.5">{child.label}</span>
                  {child.badge && (
                    <span className="px-1.5 py-0.2 text-[9px] font-semibold rounded-full bg-[#0284C7]/20 text-[#38BDF8] border border-[#0284C7]/30">
                      {child.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
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
  const navTree = getNavigationTree(userRoles);

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
        {/* Sidebar Header */}
        <div
          className={cn(
            "flex h-16 items-center px-3.5 border-b border-[#1E293B]",
            sidebarCollapsed ? "lg:justify-center" : "justify-between"
          )}
        >
          {!sidebarCollapsed || sidebarMobileOpen ? (
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

        {/* Navigation Items List */}
        <div
          className={cn(
            "flex-1 px-2.5 py-3 space-y-1 scrollbar-thin",
            sidebarCollapsed && !sidebarMobileOpen
              ? "overflow-y-auto lg:overflow-visible"
              : "overflow-y-auto"
          )}
        >
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
