import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/shared/components/Logo";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden min-h-[500px] sm:min-h-[580px] md:min-h-[640px] flex items-center justify-center border-b border-border bg-slate-900">
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero1.png"
          alt="EduBridge Hero"
          fill
          priority
          sizes="100vw"
          quality={95}
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-slate-950/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center flex flex-col items-center justify-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/75 border border-sky-500/30 backdrop-blur-md shadow-lg shadow-black/20">
          <Logo variant="mark" size="xs" frame="none" priority />
          <span className="text-xs sm:text-sm font-semibold tracking-wider text-sky-200 uppercase">
            EduBridge Enterprise
          </span>
        </div>

        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tight text-white uppercase select-none drop-shadow-[0_8px_24px_rgba(0,0,0,0.9)]">
          EDUBRIDGE
        </h1>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full max-w-md mx-auto">
          <Link
            href={ROUTES.AUTH.LOGIN}
            className={cn(
              buttonVariants({ size: "lg" }),
              "w-full sm:w-auto text-sm sm:text-base font-semibold gap-2 px-8 py-5 rounded-xl shadow-lg shadow-primary/30"
            )}
          >
            <span>Access Platform</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            href={ROUTES.AUTH.FIRST_LOGIN_SETUP}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full sm:w-auto text-sm sm:text-base font-semibold px-8 py-5 rounded-xl border-white/30 bg-slate-900/60 text-white backdrop-blur-md hover:bg-slate-900/80 hover:text-white"
            )}
          >
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>First Login Setup</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
