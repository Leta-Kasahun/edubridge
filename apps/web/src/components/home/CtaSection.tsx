import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export function CtaSection() {
  return (
    <section className="py-16 sm:py-24 bg-background border-b border-border px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-10 sm:p-16 md:p-20 text-center text-white shadow-xl min-h-[320px] flex flex-col justify-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              Start Practicing with AI Exam Support Today
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Log in with your school-issued credentials or set up your first-time password to begin Grade 8 and Grade 12 practice tests.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href={ROUTES.AUTH.LOGIN}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full sm:w-auto text-sm sm:text-base font-semibold gap-2 px-8 py-6 rounded-xl shadow-lg shadow-primary/30"
                )}
              >
                <span>Student &amp; Teacher Login</span>
                <ArrowRight size={16} />
              </Link>

              <Link
                href={ROUTES.AUTH.FIRST_LOGIN_SETUP}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full sm:w-auto text-sm sm:text-base font-semibold px-8 py-6 rounded-xl border-slate-700 bg-slate-800/90 text-white hover:bg-slate-700 hover:text-white"
                )}
              >
                <Sparkles size={16} className="text-emerald-400" />
                <span>First Login Setup</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
