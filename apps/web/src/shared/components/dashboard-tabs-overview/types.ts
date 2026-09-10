import type { ElementType } from "react";

export type SchoolAdminTabId =
  | "general"
  | "students"
  | "teachers"
  | "academics";

export type TeacherTabId =
  | "overview"
  | "classes"
  | "grades";

export type SystemAdminTabId =
  | "overview"
  | "tenants";

export type DashboardTabId =
  | SchoolAdminTabId
  | TeacherTabId
  | SystemAdminTabId
  | string;

export interface DashboardTabItem<T extends string = string> {
  readonly id: T;
  readonly label: string;
  readonly icon?: ElementType;
  readonly badge?: string | number;
}

export type MetricCardVariant =
  | "default"
  | "blue"
  | "amber"
  | "emerald"
  | "purple"
  | "rose";

export interface MetricSummaryItem {
  readonly title: string;
  readonly value: string | number;
  readonly detail?: string;
  readonly icon?: ElementType;
  readonly variant?: MetricCardVariant;
  readonly isLoading?: boolean;
}

export interface ChartSliceItem {
  readonly name: string;
  readonly value: number;
  readonly color: string;
  readonly percentage?: string;
}

export interface DonutDistributionCardProps {
  readonly title: string;
  readonly slices: readonly ChartSliceItem[];
  readonly centerLabel?: string;
  readonly centerValue?: string | number;
  readonly isLoading?: boolean;
  readonly emptyText?: string;
}
