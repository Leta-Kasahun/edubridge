import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Users, BookOpen } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden py-16 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-medium">
              <Sparkles size={14} />
              <span>Next-Gen Education Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.15]">
              AI-Powered Learning &amp; Management Intelligence
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Empowering institutions, educators, and students with intelligent course orchestration, real-time analytics, and secure role-based portals.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <Link
                href={ROUTES.AUTH.LOGIN}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full sm:w-auto text-base gap-2 font-medium"
                )}
              >
                <span>Access Platform</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href={ROUTES.AUTH.FIRST_LOGIN_SETUP}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full sm:w-auto text-base font-medium"
                )}
              >
                <span>First Time Student Setup</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-muted/40 border-y border-border px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Secure Enterprise Auth</h3>
              <p className="text-sm text-muted-foreground">
                Multi-tenant isolation, 2FA OTP verification, role-based access control, and password policy enforcement.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Users size={20} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Unified Portals</h3>
              <p className="text-sm text-muted-foreground">
                Dedicated interfaces for administrators, instructors, and students with real-time class synchronization.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <BookOpen size={20} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Adaptive Learning Intelligence</h3>
              <p className="text-sm text-muted-foreground">
                Continuous performance insights, automated exam preparation, and progress benchmarks.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
