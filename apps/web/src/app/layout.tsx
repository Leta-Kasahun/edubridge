import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProviders } from "@/providers";
import { PwaRegistrar } from "@/features/offline/components";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://edubridge-et.vercel.app"),
  title: {
    default: "EduBridge - AI-Powered Education Platform",
    template: "%s | EduBridge",
  },
  description: "AI-Powered Education Management & Learning Intelligence SaaS",
  icons: {
    icon: [
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/logo.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/logo.png"],
  },
  keywords: [
    "EduBridge",
    "Ethiopian Education Platform",
    "AI Education Platform",
    "School Management System",
    "Curriculum Intelligence",
    "Online Assessment Platform",
    "National Exam Preparation",
  ],
  authors: [{ name: "EduBridge Team" }],
  creator: "EduBridge",
  publisher: "EduBridge",
  alternates: {
    canonical: "https://edubridge-et.vercel.app",
  },
  openGraph: {
    title: "EduBridge - AI-Powered Education Platform",
    description: "Enterprise Learning Intelligence & Exam Preparation Platform",
    url: "https://edubridge-et.vercel.app",
    siteName: "EduBridge",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 1200,
        alt: "EduBridge Enterprise Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EduBridge - AI-Powered Education Platform",
    description: "Enterprise Learning Intelligence & Exam Preparation Platform",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "_zlsFf-2bPmzKSdCoAMjb4MZ96xpUjZWPyqkFc7IgWI",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("h-full antialiased", inter.variable)}>
      <body className="min-h-full flex flex-col">
        <AppProviders>
          <TooltipProvider>
            <PwaRegistrar />
            {children}
          </TooltipProvider>
        </AppProviders>
      </body>
    </html>
  );
}