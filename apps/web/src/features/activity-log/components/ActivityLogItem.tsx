"use client";

import { ActivityLogItem as ActivityLogItemType } from "../types/activity-log.types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  GraduationCap,
  UserCheck,
  Users,
  BookOpen,
  Layers,
  ClipboardCheck,
  CalendarCheck,
  Target,
  Award,
  HeartHandshake,
  Key,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Building2,
  Clock,
} from "lucide-react";

interface ActivityLogItemProps {
  activity: ActivityLogItemType;
  showSchoolBadge?: boolean;
  onSelect?: (activity: ActivityLogItemType) => void;
}

export function ActivityLogItem({
  activity,
  showSchoolBadge = false,
  onSelect,
}: ActivityLogItemProps) {
  const actorName = activity.user
    ? `${activity.user.firstName || ""} ${activity.user.lastName || ""}`.trim() ||
      activity.user.username ||
      activity.user.email ||
      "System User"
    : "System Service";

  const initials = activity.user?.firstName && activity.user?.lastName
    ? `${activity.user.firstName[0]}${activity.user.lastName[0]}`.toUpperCase()
    : (activity.user?.username || activity.user?.email || "SY")
        .slice(0, 2)
        .toUpperCase();

  const description =
    (activity.metadata?.description as string) ||
    `${activity.action} on ${activity.resource.toLowerCase()}`;

  const formatRelativeTime = (isoString: string): string => {
    const diff = Math.max(0, Date.now() - new Date(isoString).getTime());
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getResourceConfig = (resource: string) => {
    switch (resource.toUpperCase()) {
      case "STUDENT":
        return {
          icon: GraduationCap,
          color: "text-emerald-600 dark:text-emerald-400",
          bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
          border: "border-emerald-500/20",
        };
      case "TEACHER":
        return {
          icon: UserCheck,
          color: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-500/10 dark:bg-blue-500/20",
          border: "border-blue-500/20",
        };
      case "ENROLLMENT":
        return {
          icon: Users,
          color: "text-indigo-600 dark:text-indigo-400",
          bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
          border: "border-indigo-500/20",
        };
      case "ACADEMIC":
        return {
          icon: BookOpen,
          color: "text-teal-600 dark:text-teal-400",
          bg: "bg-teal-500/10 dark:bg-teal-500/20",
          border: "border-teal-500/20",
        };
      case "CURRICULUM":
        return {
          icon: Layers,
          color: "text-purple-600 dark:text-purple-400",
          bg: "bg-purple-500/10 dark:bg-purple-500/20",
          border: "border-purple-500/20",
        };
      case "ASSESSMENT":
        return {
          icon: ClipboardCheck,
          color: "text-amber-600 dark:text-amber-400",
          bg: "bg-amber-500/10 dark:bg-amber-500/20",
          border: "border-amber-500/20",
        };
      case "ATTENDANCE":
        return {
          icon: CalendarCheck,
          color: "text-orange-600 dark:text-orange-400",
          bg: "bg-orange-500/10 dark:bg-orange-500/20",
          border: "border-orange-500/20",
        };
      case "MASTERY":
        return {
          icon: Target,
          color: "text-cyan-600 dark:text-cyan-400",
          bg: "bg-cyan-500/10 dark:bg-cyan-500/20",
          border: "border-cyan-500/20",
        };
      case "GRADE":
        return {
          icon: Award,
          color: "text-rose-600 dark:text-rose-400",
          bg: "bg-rose-500/10 dark:bg-rose-500/20",
          border: "border-rose-500/20",
        };
      case "PARENT":
        return {
          icon: HeartHandshake,
          color: "text-pink-600 dark:text-pink-400",
          bg: "bg-pink-500/10 dark:bg-pink-500/20",
          border: "border-pink-500/20",
        };
      case "USER_PERMISSION":
        return {
          icon: Key,
          color: "text-violet-600 dark:text-violet-400",
          bg: "bg-violet-500/10 dark:bg-violet-500/20",
          border: "border-violet-500/20",
        };
      case "CONFIGURATION":
        return {
          icon: Sliders,
          color: "text-slate-600 dark:text-slate-400",
          bg: "bg-slate-500/10 dark:bg-slate-500/20",
          border: "border-slate-500/20",
        };
      case "AUTH":
        return {
          icon: ShieldCheck,
          color: "text-sky-600 dark:text-sky-400",
          bg: "bg-sky-500/10 dark:bg-sky-500/20",
          border: "border-sky-500/20",
        };
      case "SECURITY":
        return {
          icon: ShieldAlert,
          color: "text-red-600 dark:text-red-400",
          bg: "bg-red-500/10 dark:bg-red-500/20",
          border: "border-red-500/20",
        };
      default:
        return {
          icon: Activity,
          color: "text-primary",
          bg: "bg-primary/10",
          border: "border-primary/20",
        };
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action.toUpperCase()) {
      case "CREATE":
      case "ENROLL":
      case "PUBLISH":
        return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
      case "UPDATE":
      case "ASSIGN":
      case "GRADE":
        return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "DELETE":
      case "WITHDRAW":
        return "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20";
      case "LOGIN":
        return "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const { icon: ResourceIcon, color, bg, border } = getResourceConfig(
    activity.resource
  );

  return (
    <div
      onClick={() => onSelect?.(activity)}
      className="group relative flex items-start gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-muted/60 cursor-pointer border border-transparent hover:border-border/70"
    >
      {/* Resource Icon Node */}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${bg} ${border} shadow-2xs group-hover:scale-105 transition-transform duration-200`}
        style={{ borderRadius: "50%" }}
      >
        <ResourceIcon className={`w-4 h-4 ${color}`} />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-foreground truncate max-w-[140px] sm:max-w-[200px]">
              {actorName}
            </span>
            <span
              className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-sm border ${getActionBadgeVariant(
                activity.action
              )}`}
            >
              {activity.action}
            </span>
            <span className="text-[10px] font-mono uppercase text-muted-foreground bg-muted px-1 py-0.5 rounded-sm">
              {activity.resource}
            </span>
          </div>

          <div
            className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0 font-medium"
            title={new Date(activity.createdAt).toLocaleString()}
          >
            <Clock className="w-3 h-3 text-muted-foreground/70" />
            <span>{formatRelativeTime(activity.createdAt)}</span>
          </div>
        </div>

        {/* Activity Description */}
        <p className="text-xs text-foreground/90 leading-relaxed break-words font-normal">
          {description}
        </p>

        {/* Footer Meta: School / User Avatar */}
        <div className="flex items-center gap-2 pt-0.5 text-[11px] text-muted-foreground">
          {showSchoolBadge && activity.tenant && (
            <Badge
              variant="outline"
              className="text-[10px] py-0 px-1.5 bg-background/80 text-muted-foreground border-border flex items-center gap-1"
            >
              <Building2 className="w-2.5 h-2.5 text-primary" />
              <span className="truncate max-w-[130px]">{activity.tenant.name}</span>
            </Badge>
          )}

          {activity.ipAddress && (
            <span className="text-[10px] font-mono opacity-60 truncate">
              {activity.ipAddress}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

