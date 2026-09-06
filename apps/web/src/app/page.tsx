import dynamic from "next/dynamic";
import { Header, Footer } from "@/components/layout";
import { HeroSection, ScrollReveal } from "@/components/home";

const FeaturesSection = dynamic(
  () => import("@/components/home/FeaturesSection").then((mod) => mod.FeaturesSection),
  {
    loading: () => <div className="min-h-[400px] w-full" />,
  }
);

const ExamAndIntelligenceSection = dynamic(
  () => import("@/components/home/ExamAndIntelligenceSection").then((mod) => mod.ExamAndIntelligenceSection),
  {
    loading: () => <div className="min-h-[400px] w-full" />,
  }
);

const ProgressAndInsightsSection = dynamic(
  () => import("@/components/home/ProgressAndInsightsSection").then((mod) => mod.ProgressAndInsightsSection),
  {
    loading: () => <div className="min-h-[400px] w-full" />,
  }
);

const HowItWorksSection = dynamic(
  () => import("@/components/home/HowItWorksSection").then((mod) => mod.HowItWorksSection),
  {
    loading: () => <div className="min-h-[350px] w-full" />,
  }
);

const FaqSection = dynamic(
  () => import("@/components/home/FaqSection").then((mod) => mod.FaqSection),
  {
    loading: () => <div className="min-h-[350px] w-full" />,
  }
);

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary overflow-x-clip">
      <Header />

      <main className="flex-1 flex flex-col w-full overflow-x-clip">
        <HeroSection />

        <ScrollReveal>
          <FeaturesSection />
        </ScrollReveal>

        <ScrollReveal>
          <ExamAndIntelligenceSection />
        </ScrollReveal>

        <ScrollReveal>
          <ProgressAndInsightsSection />
        </ScrollReveal>

        <ScrollReveal>
          <HowItWorksSection />
        </ScrollReveal>

        <ScrollReveal>
          <FaqSection />
        </ScrollReveal>
      </main>

      <Footer />
    </div>
  );
}
