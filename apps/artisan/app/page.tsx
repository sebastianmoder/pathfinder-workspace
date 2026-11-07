import { HeroDemo } from "@/components/hero-demo";
import { HomeActions } from "@/components/home-actions";
import { t } from "@/lib/i18n/en";

export default function Home() {
  return (
    <div className="mat full-bleed py-10 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-12">
        <div>
          <h1 className="text-5xl sm:text-6xl">{t.promise}</h1>
          <p className="mt-5 max-w-lg text-lg">{t.welcome.intro}</p>
          <p className="mt-2 max-w-lg">{t.welcome.time}</p>
          <HomeActions />
        </div>
        <div className="mt-10 lg:mt-0">
          <HeroDemo />
        </div>
      </div>
    </div>
  );
}
