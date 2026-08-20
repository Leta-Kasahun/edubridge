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
  title: {
    default: "EduBridge - AI-Powered Education Platform",
    template: "%s | EduBridge",
  },
  description: "AI-Powered Education Management & Learning Intelligence SaaS",
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