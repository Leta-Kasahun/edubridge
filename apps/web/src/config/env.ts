const isBrowser = typeof window !== "undefined";

const normalizeApiUrl = (url?: string): string => {
  if (!url) return "http://localhost:5000/api";
  let formatted = url.trim();
  if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
    formatted = `https://${formatted}`;
  }
  formatted = formatted.replace(/\/$/, "");
  if (!formatted.endsWith("/api")) {
    formatted = `${formatted}/api`;
  }
  return formatted;
};

export const env = {
  apiUrl: isBrowser
    ? "/api"
    : normalizeApiUrl(
        process.env.API_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL
      ),
  appName: process.env.NEXT_PUBLIC_APP_NAME || "EduBridge",
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
} as const;