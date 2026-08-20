import { env } from "./env";

export interface SiteConfig {
  name: string;
  description: string;
}

export const siteConfig: SiteConfig = {
  name: env.appName,
  description: "Education Management Platform",
};
