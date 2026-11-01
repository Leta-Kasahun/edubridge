"use client";

import { useState } from "react";
import { ActivityLogItem } from "../types/activity-log.types";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Clock,
  User,
  Building2,
  Globe,
  Tag,
  FileCode2,
  Copy,
  Check,
  Laptop,
  CheckCircle2,
  Info,
} from "lucide-react";

interface ActivityDetailModalProps {
  activity: ActivityLogItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ActivityDetailModal({
  activity,
  isOpen,
  onClose,
}: ActivityDetailModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!activity) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

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
    `${activity.action} operation performed on ${activity.resource.toLowerCase()}`;

  const formattedDate = new Date(activity.createdAt).toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });

  const formatRelativeTime = (isoString: string): string => {
    const diff = Math.max(0, Date.now() - new Date(isoString).getTime());
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const getResourceConfig = (resource: string) => {
    switch (resource.toUpperCase()) {
      case "STUDENT":
        return {
          icon: GraduationCap,
          title: "Student Roster & Profiles",
          gradient: "from-emerald-500/15 via-emerald-500/5 to-transparent",
          badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
          iconColor: "text-emerald-600 dark:text-emerald-400",
        };
      case "TEACHER":
        return {
          icon: UserCheck,
          title: "Teacher & Staff Directory",
          gradient: "from-blue-500/15 via-blue-500/5 to-transparent",
          badgeColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
          iconColor: "text-blue-600 dark:text-blue-400",
        };
      case "ENROLLMENT":
        return {
          icon: Users,
          title: "Enrollment & Section Assignments",
          gradient: "from-indigo-500/15 via-indigo-500/5 to-transparent",
          badgeColor: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30",
          iconColor: "text-indigo-600 dark:text-indigo-400",
        };
      case "ACADEMIC":
        return {
          icon: BookOpen,
          title: "Academic Years & Structures",
          gradient: "from-teal-500/15 via-teal-500/5 to-transparent",
          badgeColor: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/30",
          iconColor: "text-teal-600 dark:text-teal-400",
        };
      case "CURRICULUM":
        return {
          icon: Layers,
          title: "National Curriculum & Materials",
          gradient: "from-purple-500/15 via-purple-500/5 to-transparent",
          badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30",
          iconColor: "text-purple-600 dark:text-purple-400",
        };
      case "ASSESSMENT":
        return {
          icon: ClipboardCheck,
          title: "Assessments & Examinations",
          gradient: "from-amber-500/15 via-amber-500/5 to-transparent",
          badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
          iconColor: "text-amber-600 dark:text-amber-400",
        };
      case "ATTENDANCE":
        return {
          icon: CalendarCheck,
          title: "Student Daily Attendance",
          gradient: "from-orange-500/15 via-orange-500/5 to-transparent",
          badgeColor: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30",
          iconColor: "text-orange-600 dark:text-orange-400",
        };
      case "MASTERY":
        return {
          icon: Target,
          title: "Competency & Mastery Analytics",
          gradient: "from-cyan-500/15 via-cyan-500/5 to-transparent",
          badgeColor: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30",
          iconColor: "text-cyan-600 dark:text-cyan-400",
        };
      case "GRADE":
        return {
          icon: Award,
          title: "Grades & Rubric Evaluations",
          gradient: "from-rose-500/15 via-rose-500/5 to-transparent",
          badgeColor: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
          iconColor: "text-rose-600 dark:text-rose-400",
        };
      case "PARENT":
        return {
          icon: HeartHandshake,
          title: "Parent & Guardian Management",
          gradient: "from-pink-500/15 via-pink-500/5 to-transparent",
          badgeColor: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/30",
          iconColor: "text-pink-600 dark:text-pink-400",
        };
      case "USER_PERMISSION":
        return {
          icon: Key,
          title: "Roles & Permission Access",
          gradient: "from-violet-500/15 via-violet-500/5 to-transparent",
          badgeColor: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/30",
          iconColor: "text-violet-600 dark:text-violet-400",
        };
      case "CONFIGURATION":
        return {
          icon: Sliders,
          title: "School System Configuration",
          gradient: "from-slate-500/15 via-slate-500/5 to-transparent",
          badgeColor: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30",
          iconColor: "text-slate-600 dark:text-slate-400",
        };
      case "AUTH":
        return {
          icon: ShieldCheck,
          title: "Authentication & Security",
          gradient: "from-sky-500/15 via-sky-500/5 to-transparent",
          badgeColor: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30",
          iconColor: "text-sky-600 dark:text-sky-400",
        };
      case "SECURITY":
        return {
          icon: ShieldAlert,
          title: "System Threat & Security Policy",
          gradient: "from-red-500/15 via-red-500/5 to-transparent",
          badgeColor: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30",
          iconColor: "text-red-600 dark:text-red-400",
        };
      default:
        return {
          icon: Activity,
          title: "System Operations",
          gradient: "from-primary/15 via-primary/5 to-transparent",
          badgeColor: "bg-primary/10 text-primary border-primary/30",
          iconColor: "text-primary",
        };
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action.toUpperCase()) {
      case "CREATE":
      case "ENROLL":
      case "PUBLISH":
        return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
      case "UPDATE":
      case "ASSIGN":
      case "GRADE":
        return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30";
      case "DELETE":
      case "WITHDRAW":
        return "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30";
      case "LOGIN":
        return "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30";
      default:
        return "bg-muted text-foreground border-border";
    }
  };

  const { icon: ResourceIcon, title: resourceTitle, gradient, badgeColor, iconColor } =
    getResourceConfig(activity.resource);

  // Extract metadata keys excluding description for parameter grid
  const metadataEntries = Object.entries(activity.metadata || {}).filter(
    ([key]) => key !== "description"
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl">
        {/* Top Hero Banner */}
        <div className={`relative px-6 pt-6 pb-5 bg-gradient-to-b ${gradient} border-b border-border/70 shrink-0`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border shadow-xs bg-background ${badgeColor}`}
                style={{ borderRadius: "50%" }}
              >
                <ResourceIcon className={`w-6 h-6 ${iconColor}`} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-md border ${getActionBadgeColor(activity.action)}`}>
                    {activity.action}
                  </span>
                  <span className="text-[11px] font-mono uppercase text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-md border border-border/50">
                    {activity.resource}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {resourceTitle}
                  </span>
                </div>
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground leading-snug tracking-tight">
                  {description}
                </DialogTitle>
                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5 flex-wrap">
                  <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    {formattedDate}
                  </span>
                  <span className="text-muted-foreground/60">•</span>
                  <span className="text-muted-foreground">
                    {formatRelativeTime(activity.createdAt)}
                  </span>
                  <span className="text-muted-foreground/60">•</span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Immutable Audit Record
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Copy ID / JSON) */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify(activity, null, 2),
                    "full-json"
                  )
                }
                className="h-8 px-2.5 text-xs font-medium cursor-pointer bg-background/80 hover:bg-background"
                title="Copy Full Audit JSON"
              >
                {copiedKey === "full-json" ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    <span>Copy JSON</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Tabbed Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background space-y-4">
          <Tabs defaultValue="overview" className="w-full">
            <div className="border-b border-border/70 pb-3">
              <TabsList className="bg-muted/70 p-1 rounded-xl">
                <TabsTrigger value="overview" className="text-xs font-medium cursor-pointer">
                  <Info className="w-3.5 h-3.5 mr-1.5" />
                  Structured Overview
                </TabsTrigger>
                <TabsTrigger value="payload" className="text-xs font-medium cursor-pointer">
                  <FileCode2 className="w-3.5 h-3.5 mr-1.5" />
                  Audit Payload &amp; Technical Specs
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: STRUCTURED OVERVIEW */}
            <TabsContent value="overview" className="space-y-4 pt-3">
              {/* 3 Core Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Actor Card */}
                <div className="p-3.5 rounded-xl border border-border/80 bg-card/60 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-primary" />
                      Actor
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                      Verified
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2.5 pt-1">
                    <Avatar className="w-9 h-9 border border-border shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {actorName}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {activity.user?.email || activity.user?.username || "System Operator"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. School / Organization Card */}
                <div className="p-3.5 rounded-xl border border-border/80 bg-card/60 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                      School Context
                    </span>
                    {activity.tenant?.code && (
                      <span className="text-[10px] font-mono uppercase bg-muted px-1.5 py-0.5 rounded-sm">
                        {activity.tenant.code}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 pt-1">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {activity.tenant?.name || "Global Platform"}
                    </p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {activity.tenantId ? "Tenant-Isolated Domain" : "Cross-School Platform Domain"}
                    </p>
                  </div>
                </div>

                {/* 3. Network & Security Card */}
                <div className="p-3.5 rounded-xl border border-border/80 bg-card/60 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-primary" />
                      Client Network
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(activity.ipAddress || "127.0.0.1", "ip")}
                      className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      {copiedKey === "ip" ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                      Copy IP
                    </button>
                  </div>
                  <div className="space-y-1 pt-1">
                    <p className="text-xs font-mono font-semibold text-foreground truncate">
                      {activity.ipAddress || "Internal Server Call"}
                    </p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                      <Laptop className="w-3 h-3 text-muted-foreground/70 shrink-0" />
                      <span>{String(activity.metadata?.device || activity.metadata?.userAgent || "Web Application Client")}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Parsed Operation Parameters */}
              <div className="p-4 rounded-xl border border-border/80 bg-card/60 space-y-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-primary" />
                    Operation Parameters &amp; Details
                  </h4>
                  <span className="text-[11px] text-muted-foreground">
                    {metadataEntries.length} attribute{metadataEntries.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {metadataEntries.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-2">
                    Standard system event without custom parameter payloads.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {metadataEntries.map(([key, val]) => (
                      <div
                        key={key}
                        className="p-2.5 rounded-lg bg-muted/40 border border-border/50 flex flex-col justify-between gap-1"
                      >
                        <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
                          {key.replace(/([A-Z])/g, " $1")}
                        </span>
                        <div className="font-medium text-foreground break-words font-mono text-[11px]">
                          {typeof val === "object" ? JSON.stringify(val) : String(val)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Resource Identification Card */}
              {activity.resourceId && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60 text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-primary" />
                    <span className="font-medium text-muted-foreground">
                      Target Entity ID ({activity.resource}):
                    </span>
                    <span className="font-mono text-foreground font-semibold">
                      {activity.resourceId}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(activity.resourceId!, "targetId")}
                    className="h-7 px-2 text-xs cursor-pointer"
                  >
                    {copiedKey === "targetId" ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* TAB 2: AUDIT PAYLOAD & TECHNICAL SPECS */}
            <TabsContent value="payload" className="space-y-4 pt-3">
              {/* Technical Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-muted/30 border border-border/60 flex items-center justify-between">
                  <span className="text-muted-foreground">Audit Record ID:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-medium text-foreground text-[11px]">
                      {activity.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(activity.id, "recordId")}
                      className="p-1 hover:text-foreground text-muted-foreground"
                    >
                      {copiedKey === "recordId" ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-muted/30 border border-border/60 flex items-center justify-between">
                  <span className="text-muted-foreground">ISO Timestamp:</span>
                  <span className="font-mono font-medium text-foreground text-[11px]">
                    {activity.createdAt}
                  </span>
                </div>
              </div>

              {/* JSON Payload Viewer */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                    <FileCode2 className="w-3.5 h-3.5 text-primary" />
                    Full Audit Payload (JSON)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(JSON.stringify(activity, null, 2), "json-body")
                    }
                    className="text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                  >
                    {copiedKey === "json-body" ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Object</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 shadow-inner">
                  <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>audit_event_{activity.id.slice(0, 8)}.json</span>
                    <span>application/json</span>
                  </div>
                  <pre className="p-4 text-xs font-mono overflow-x-auto max-h-[320px] leading-relaxed select-text text-emerald-400 dark:text-emerald-300">
                    {JSON.stringify(activity, null, 2)}
                  </pre>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-border bg-card/95 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-muted-foreground font-mono">
            ID: {activity.id.slice(0, 18)}...
          </span>

          <Button
            variant="default"
            size="sm"
            onClick={onClose}
            className="cursor-pointer text-xs font-medium px-4"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
