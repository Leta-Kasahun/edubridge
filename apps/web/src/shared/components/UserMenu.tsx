"use client";

import Link from "next/link";
import {
  User as UserIcon,
  Settings,
  LogOut,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { useUserMenu } from "../hooks";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className }: UserMenuProps) {
  const {
    isOpen,
    menuRef,
    user,
    fullName,
    initials,
    primaryRole,
    isLoggingOut,
    toggle,
    close,
    handleLogout,
  } = useUserMenu();

  return (
    <div ref={menuRef} className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-2.5 p-1 rounded-full hover:bg-muted/70 focus:outline-none transition-all"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-semibold text-xs transition-transform active:scale-95">
          {initials}
        </div>
        <span className="hidden md:inline-block text-xs font-medium text-foreground max-w-[120px] truncate">
          {fullName}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 origin-top-right rounded-xl bg-card border border-border p-1.5 shadow-lg ring-1 ring-foreground/5 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="px-3 py-2.5 border-b border-border/80 mb-1">
            <p className="text-sm font-semibold text-foreground truncate">{fullName}</p>
            {user?.email && (
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            )}
            {primaryRole && (
              <span className="mt-1.5 inline-block px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded capitalize">
                {primaryRole.toLowerCase().replace(/_/g, " ")}
              </span>
            )}
          </div>

          <div className="space-y-0.5">
            <Link
              href={ROUTES.DASHBOARD}
              onClick={close}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-foreground hover:bg-muted transition-colors"
            >
              <LayoutDashboard size={15} className="text-muted-foreground" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/profile"
              onClick={close}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-foreground hover:bg-muted transition-colors"
            >
              <UserIcon size={15} className="text-muted-foreground" />
              <span>Profile</span>
            </Link>

            <Link
              href={ROUTES.SETTINGS.BASE}
              onClick={close}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-foreground hover:bg-muted transition-colors"
            >
              <Settings size={15} className="text-muted-foreground" />
              <span>Settings</span>
            </Link>
          </div>

          <div className="border-t border-border/80 mt-1 pt-1">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
            >
              <LogOut size={15} className="text-destructive" />
              <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
