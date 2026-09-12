declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_URL?: string;
      NEXT_PUBLIC_APP_NAME?: string;
      NEXT_PUBLIC_SITE_URL?: string;
      NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?: string;
      NODE_ENV: "development" | "production" | "test";
    }
  }

  interface WindowEventMap {
    "auth:unauthorized": CustomEvent<void>;
  }
}

declare module "next/dynamic" {
  import type { ComponentType, ReactNode } from "react";

  export type DynamicOptionsLoadingProps = {
    error?: Error | null;
    isLoading?: boolean;
    pastDelay?: boolean;
    retry?: () => void;
  };

  export type DynamicOptions<P = Record<string, unknown>> = {
    loader?: () => Promise<ComponentType<P> | { default: ComponentType<P> }>;
    loading?: (loadingProps: DynamicOptionsLoadingProps) => ReactNode;
    ssr?: boolean;
  };

  export default function dynamic<P = Record<string, unknown>>(
    dynamicOptions: DynamicOptions<P> | (() => Promise<ComponentType<P> | { default: ComponentType<P> }>),
    options?: DynamicOptions<P>
  ): ComponentType<P>;
}

declare module "next/font/google" {
  export interface FontOptions {
    weight?: string | string[];
    style?: string | string[];
    subsets?: string[];
    display?: "auto" | "block" | "swap" | "fallback" | "optional";
    variable?: string;
    preload?: boolean;
    fallback?: string[];
    adjustFontFallback?: boolean;
  }

  export interface NextFont {
    className: string;
    style: { fontFamily: string; fontWeight?: number; fontStyle?: string };
    variable?: string;
  }

  export function Inter(options?: FontOptions): NextFont;
  export function Roboto(options?: FontOptions): NextFont;
  export function Plus_Jakarta_Sans(options?: FontOptions): NextFont;
  export function Outfit(options?: FontOptions): NextFont;
  export function Poppins(options?: FontOptions): NextFont;
}

export {};

