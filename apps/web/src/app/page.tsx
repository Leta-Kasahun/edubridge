import { Header, Footer } from "@/components/layout";
import {
  HeroSection,
  FeaturesSection,
  ExamAndIntelligenceSection,
  ProgressAndInsightsSection,
  HowItWorksSection,
  FaqSection,
  ScrollReveal,
} from "@/components/home";

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
