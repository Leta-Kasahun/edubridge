import { Header, Footer } from "@/components/layout";
import {
  HeroSection,
  SchoolTicker,
  FeaturesSection,
  FaqSection,
  CtaSection,
} from "@/components/home";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Header />

      <main className="flex-1 flex flex-col">
        <HeroSection />
        <SchoolTicker />
        <FeaturesSection />
        <FaqSection />
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}
