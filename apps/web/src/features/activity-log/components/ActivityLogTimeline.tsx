"use client";

import { useMemo } from "react";
import { ActivityLogItem as ActivityLogItemType } from "../types/activity-log.types";
import { ActivityLogItem } from "./ActivityLogItem";
import { Calendar } from "lucide-react";

interface ActivityLogTimelineProps {
  items: ActivityLogItemType[];
  showSchoolBadge?: boolean;
  onSelectActivity?: (activity: ActivityLogItemType) => void;
}

interface GroupedActivities {
  label: string;
  activities: ActivityLogItemType[];
}

export function ActivityLogTimeline({
  items,
  showSchoolBadge = false,
  onSelectActivity,
}: ActivityLogTimelineProps) {
  const groups = useMemo<GroupedActivities[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const todayItems: ActivityLogItemType[] = [];
    const yesterdayItems: ActivityLogItemType[] = [];
    const thisWeekItems: ActivityLogItemType[] = [];
    const olderItems: ActivityLogItemType[] = [];

    for (const item of items) {
      const itemDate = new Date(item.createdAt);
      if (itemDate >= today) {
        todayItems.push(item);
      } else if (itemDate >= yesterday) {
        yesterdayItems.push(item);
      } else if (itemDate >= sevenDaysAgo) {
        thisWeekItems.push(item);
      } else {
        olderItems.push(item);
      }
    }

    const result: GroupedActivities[] = [];
    if (todayItems.length > 0) result.push({ label: "Today", activities: todayItems });
    if (yesterdayItems.length > 0) result.push({ label: "Yesterday", activities: yesterdayItems });
    if (thisWeekItems.length > 0) result.push({ label: "Earlier this week", activities: thisWeekItems });
    if (olderItems.length > 0) result.push({ label: "Older activities", activities: olderItems });

    return result;
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="relative space-y-6">
      {groups.map((group) => (
        <div key={group.label} className="space-y-2">
          {/* Group Header Badge */}
          <div className="sticky top-0 z-10 py-1 bg-background/95 backdrop-blur-xs flex items-center gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 px-2.5 py-1 bg-muted/80 rounded-md border border-border/50">
              <Calendar className="w-3 h-3 text-primary" />
              {group.label}
              <span className="text-[10px] text-muted-foreground/80 font-normal">
                ({group.activities.length})
              </span>
            </span>
            <div className="h-px bg-border/60 flex-1" />
          </div>

          {/* Timeline Items */}
          <div className="relative pl-2 sm:pl-3 border-l-2 border-border/60 ml-2 space-y-2">
            {group.activities.map((activity) => (
              <div key={activity.id} className="relative">
                {/* Timeline Node Dot */}
                <span className="absolute -left-[15px] sm:-left-[19px] top-4 w-2 h-2 rounded-full bg-border border-2 border-background ring-1 ring-primary/40 group-hover:scale-125 transition-transform" />

                <ActivityLogItem
                  activity={activity}
                  showSchoolBadge={showSchoolBadge}
                  onSelect={onSelectActivity}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

