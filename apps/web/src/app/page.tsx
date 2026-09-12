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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": "https://edubridge-et.vercel.app/#organization",
      "name": "EduBridge",
      "url": "https://edubridge-et.vercel.app",
      "logo": "https://edubridge-et.vercel.app/logo.png",
      "description": "AI-Powered Education Management & Learning Intelligence SaaS in Ethiopia",
      "sameAs": []
    },
    {
      "@type": "WebSite",
      "@id": "https://edubridge-et.vercel.app/#website",
      "url": "https://edubridge-et.vercel.app",
      "name": "EduBridge",
      "publisher": {
        "@id": "https://edubridge-et.vercel.app/#organization"
      },
      "inLanguage": "en-US"
    },
    {
      "@type": "SoftwareApplication",
      "name": "EduBridge Learning Intelligence Platform",
      "operatingSystem": "Web",
      "applicationCategory": "EducationalApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "ETB"
      }
    }
  ]
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
