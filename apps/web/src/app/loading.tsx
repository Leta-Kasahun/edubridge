import { Logo } from "@/shared/components/Logo";

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background text-foreground selection:bg-primary/20 overflow-hidden select-none">
      <style>{`
        @keyframes fillAndTransform {
          0% {
            transform: translateX(-100%);
            opacity: 0.8;
          }
          40% {
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0.9;
          }
        }
        @keyframes expandingFill {
          0% {
            width: 0%;
          }
          50% {
            width: 65%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md w-full animate-in fade-in-50 duration-500">
        <div className="mb-6">
          <Logo size="xl" priority />
        </div>

        <div className="space-y-4 flex flex-col items-center w-full max-w-xs">
          <h2 className="text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-foreground/90">
            Initializing App
          </h2>

          <div className="w-64 sm:w-72 h-1.5 bg-muted/80 dark:bg-muted/40 rounded-full overflow-hidden relative shadow-inner">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-white via-[#00A3FF] via-[#38BDF8] via-[#F97316] to-[#EA580C]"
              style={{
                width: "100%",
                animation: "expandingFill 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite, fillAndTransform 2.4s ease-in-out infinite",
              }}
            />
            <div
              className="absolute inset-y-0 left-0 w-full h-full rounded-full bg-gradient-to-r from-white/90 via-[#00A3FF] to-[#F97316] opacity-75 blur-[1px]"
              style={{
                animation: "expandingFill 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
