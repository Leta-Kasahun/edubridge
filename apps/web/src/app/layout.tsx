import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProviders } from "@/providers";
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("h-full antialiased", inter.variable)}>
      <body className="min-h-full flex flex-col">
        <AppProviders>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </AppProviders>
      </body>
    </html>
  );
}