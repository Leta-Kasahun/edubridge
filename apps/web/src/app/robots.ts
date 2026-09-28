import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://edubridge-et.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/privacy", "/terms", "/login"],
        disallow: ["/dashboard/", "/api/", "/onboarding/", "/verify-otp", "/first-login-setup"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
