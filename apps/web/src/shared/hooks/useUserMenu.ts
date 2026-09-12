"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useLogout } from "@/features/auth/hooks";
import { useClickOutside } from "./useClickOutside";
import { ROUTES } from "@/constants/routes";

import { getAvatarInitials, getAvatarInitialsFromParts } from "@/shared/utils/avatar.util";

export function useUserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  useClickOutside(menuRef, () => setIsOpen(false));

  const firstName = user?.firstName || "";
  const middleName = user?.middleName || "";
  const lastName = user?.lastName || "";

  const nameParts = [firstName, middleName, lastName].filter(Boolean);
  const fullName =
    user?.fullName ||
    (nameParts.length > 0 ? nameParts.join(" ") : user?.username || user?.email?.split("@")[0] || "User");

  const initials =
    getAvatarInitialsFromParts(firstName, middleName, lastName, "") ||
    getAvatarInitials(fullName, "U");

  const primaryRole = user?.roles?.[0];

  const handleLogout = () => {
    logout(undefined, {
      onSettled: () => {
        setIsOpen(false);
        router.push(ROUTES.AUTH.LOGIN);
      },
    });
  };

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  const openChangePassword = () => {
    setIsOpen(false);
    setIsChangePasswordOpen(true);
  };

  const closeChangePassword = () => setIsChangePasswordOpen(false);

  return {
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
  };
}
