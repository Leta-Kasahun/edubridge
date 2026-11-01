"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { SchoolActivityLogDrawer } from "./SchoolActivityLogDrawer";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { History, X } from "lucide-react";

export function SchoolActivityFloatingTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  // Strictly gate visibility to System Administrator and School Administrator only
  if (!isHydrated || !user) {
    return null;
  }

  const isPrivilegedAdmin = user.roles?.some(
    (role) => role === "SYSTEM_ADMIN" || role === "SCHOOL_ADMIN"
  );

  if (!isPrivilegedAdmin) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 select-none">
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                data-circular="true"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label="School Activity Log"
                aria-expanded={isOpen}
                className="group relative rounded-full flex items-center justify-center cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-primary/35 transition-all duration-300 ease-out hover:scale-105 active:scale-95 border-2 border-background ring-2 ring-primary/30 focus:outline-hidden focus:ring-4 focus:ring-primary/40 bg-primary text-primary-foreground"
                style={{
                  width: "56px",
                  height: "56px",
                  minWidth: "56px",
                  minHeight: "56px",
                  maxWidth: "56px",
                  maxHeight: "56px",
                  borderRadius: "50%",
                  aspectRatio: "1 / 1",
                }}
              />
            }
          >
            {/* Pulsing subtle live ripple effect */}
            <span
              data-circular="true"
              className="absolute inset-0 rounded-full bg-primary opacity-20 animate-ping pointer-events-none"
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                animationDuration: "3s",
              }}
              aria-hidden="true"
            />

            {/* Icon Transition */}
            <div
              data-circular="true"
              className="relative rounded-full flex items-center justify-center"
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
              }}
            >
              {isOpen ? (
                <X className="w-6 h-6 transition-transform duration-300 rotate-0 group-hover:rotate-90" />
              ) : (
                <History className="w-6 h-6 transition-transform duration-300 group-hover:rotate-[-20deg]" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={12} className="text-xs font-medium">
            School Activity Log
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Slide-over Drawer Component */}
      <SchoolActivityLogDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

