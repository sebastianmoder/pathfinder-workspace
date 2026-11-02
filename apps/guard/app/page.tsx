import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { LabCard } from "@/components/landing/LabCard";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { labMetas } from "@/content/labs";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-6xl mx-auto px-6">
        <HeroSection />
        <section id="labs" className="pb-16 scroll-mt-6">
          <div className="guard-catalogue-heading"><div><p className="pf-eyebrow">Choose a teaching challenge</p><h2 className="pf-display">Your next experiment.</h2></div><p>Pick a lab. Bring your curiosity.</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {labMetas.map((lab) => (
              <LabCard key={lab.id} lab={lab} />
            ))}
          </div>
        </section>
        <HowItWorks />
      </main>
    </div>
  );
}
