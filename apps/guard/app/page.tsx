import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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
        <section className="pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {labMetas.map((lab) => (
              <LabCard key={lab.id} lab={lab} />
            ))}
          </div>
        </section>
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
