"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  User as UserIcon,
  KeyRound,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  X,
} from "lucide-react";
import { useUserMenu } from "../hooks";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { ChangePasswordForm } from "@/features/auth/components/ChangePasswordForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface UserMenuProps {
  readonly className?: string;
}

export function UserMenu({ className }: UserMenuProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    isOpen,
    isChangePasswordOpen,
    menuRef,
    user,
    fullName,
    initials,
    primaryRole,
    isLoggingOut,
    toggle,
    close,
    openChangePassword,
    closeChangePassword,
    handleLogout,
  } = useUserMenu();

  const userPhoto = user?.photoUrl || user?.avatarUrl;

  return (
    <>
      <div ref={menuRef} className={cn("relative inline-block text-left", className)}>
        <button
          type="button"
          onClick={toggle}
          className="flex items-center gap-2.5 p-1 rounded-full hover:bg-muted/70 focus:outline-none transition-all cursor-pointer"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <Avatar className="h-8 w-8 border border-primary/20 shrink-0 transition-transform active:scale-95">
            {userPhoto && <AvatarImage src={userPhoto} alt={fullName} />}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:inline-block text-xs font-medium text-foreground max-w-[150px] truncate">
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
          <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-card border border-border p-1.5 shadow-lg ring-1 ring-foreground/5 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
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
                href={ROUTES.PROFILE}
                onClick={close}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                <UserIcon size={15} className="text-muted-foreground" />
                <span>My Profile</span>
              </Link>

              <button
                type="button"
                onClick={openChangePassword}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-foreground hover:bg-muted transition-colors cursor-pointer text-left"
              >
                <KeyRound size={15} className="text-muted-foreground" />
                <span>Change Password</span>
              </button>
            </div>

            <div className="border-t border-border/80 mt-1 pt-1">
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <LogOut size={15} className="text-destructive" />
                <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {isChangePasswordOpen &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
            <div
              className="fixed inset-0"
              onClick={closeChangePassword}
              aria-hidden="true"
            />
            <div className="relative z-10 w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-card">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <KeyRound size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-foreground">
                      Change Password
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Update your account password securely
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeChangePassword}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0 cursor-pointer"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 sm:p-6">
                <ChangePasswordForm
                  onSuccess={() => {
                    setTimeout(() => {
                      closeChangePassword();
                    }, 600);
                  }}
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
