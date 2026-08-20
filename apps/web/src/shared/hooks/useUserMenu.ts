"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useLogout } from "@/features/auth/hooks";
import { useClickOutside } from "./useClickOutside";
import { ROUTES } from "@/constants/routes";

export function useUserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  useClickOutside(menuRef, () => setIsOpen(false));

  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim() || user?.username || "User";

  const initials =
    ((firstName[0] || "") + (lastName[0] || "")).toUpperCase() ||
    (user?.username?.[0] || "U").toUpperCase();

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

  return {
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
  };
}
