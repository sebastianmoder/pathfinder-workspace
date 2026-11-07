import Image, { type StaticImageData } from "next/image";
import type { SceneId } from "@/content/types";
import childrenReadingMeadow from "@/assets/scenes/children-reading-meadow-ai-illustration.webp";
import commonsReadingParty from "@/assets/scenes/commons-summer-reading-party.webp";
import crowdedLibrary from "@/assets/scenes/crowded-library-stock-photo.webp";
import handDrawnHeart from "@/assets/scenes/hand-drawn-heart-ai-illustration.webp";
import historicLibrary from "@/assets/scenes/historic-library-reading-room.webp";
import riversideBridgeFlood from "@/assets/scenes/riverside-bridge-flood.webp";
import thankYouCard from "@/assets/scenes/thank-you-card-stock-photo.webp";
import volunteersParty from "@/assets/scenes/volunteers-thank-you-party.webp";

/*
 * The photos and images in a case: stand-in images made with AI for the course. None is ever presented as a
 * real photo: each is labelled as a stand-in made with AI wherever it appears (PRD §4, simplifications
 * visible). What an image is in the story (a stock photo, an AI illustration) is said by its caption or option
 * label, not by that label. Static imports give the size, a blur placeholder and hashed, cacheable URLs.
 */
const IMAGES: Record<SceneId, StaticImageData> = {
  flood: riversideBridgeFlood,
  library: crowdedLibrary,
  readingParty: commonsReadingParty,
  meadow: childrenReadingMeadow,
  famousLibrary: historicLibrary,
  groupParty: volunteersParty,
  heart: handDrawnHeart,
  thankYou: thankYouCard,
};

/**
 * The image for a scene, with its description as the accessible name. Images load lazily with a blurred
 * preview; `sizes` is the widest they are shown (a sheet is at most 44rem, a poster or card 24rem), so phones
 * and narrow frames download a smaller file.
 */
export function Scene({ id, alt, sizes = "(max-width: 44rem) 100vw, 44rem" }: { id: SceneId; alt: string; sizes?: string }) {
  return <Image src={IMAGES[id]} alt={alt} placeholder="blur" sizes={sizes} className="scene block h-auto w-full" />;
}
