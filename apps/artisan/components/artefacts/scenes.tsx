import type { ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";
import type { SceneId } from "@/content/types";
import crowdedLibrary from "@/assets/scenes/crowded-library-stock-photo.webp";
import handDrawnHeart from "@/assets/scenes/hand-drawn-heart-ai-illustration.webp";
import riversideBridgeFlood from "@/assets/scenes/riverside-bridge-flood.webp";
import thankYouCard from "@/assets/scenes/thank-you-card-stock-photo.webp";
import volunteersParty from "@/assets/scenes/volunteers-thank-you-party.webp";

/*
 * The photos and images in a case. Some are stand-in images made with AI for the course; the rest are drawings
 * that keep their own fixed "print" palette in both themes, because a photo looks the same whatever the page
 * around it does. Neither is ever presented as a real photo: each is labelled as a drawing or as a stand-in made
 * with AI wherever it appears (PRD §4, simplifications visible). What an image is in the story (a stock photo,
 * an AI illustration) is said by its caption or option label, not by this label.
 */

/** Scenes shown as an image made with AI. Static imports give the size, a blur placeholder and hashed URLs. */
const IMAGES = {
  flood: riversideBridgeFlood,
  library: crowdedLibrary,
  groupParty: volunteersParty,
  heart: handDrawnHeart,
  thankYou: thankYouCard,
} satisfies Partial<Record<SceneId, StaticImageData>>;
type ImageScene = keyof typeof IMAGES;

/** Whether a scene is an image made with AI rather than a drawing, so its label can say so. */
export function isGeneratedImage(id: SceneId): id is ImageScene {
  return id in IMAGES;
}

const INK = "#1f2d28";
const PAPER = "#eef1ec";

/** Figures from the chest up: a head on rounded shoulders. */
const people = (xs: number[], y: number, colours: string[]) =>
  xs.map((x, i) => (
    <g key={x}>
      <path d={`M${x - 12} ${y + 34} q12 -52 24 0 z`} fill={colours[i % colours.length]} stroke={INK} strokeWidth="1.5" />
      <circle cx={x} cy={y} r="7.5" fill="#e8c9a8" stroke={INK} strokeWidth="1.5" />
    </g>
  ));

/** Every scene without an image has a drawing, and none has both. */
const SCENES: Record<Exclude<SceneId, ImageScene>, ReactNode> = {
  // Last year's reading party at the Commons: bunting, people with open books.
  readingParty: (
    <>
      <rect width="320" height="180" fill={PAPER} />
      <path d="M0 14 q160 30 320 0" fill="none" stroke={INK} strokeWidth="1.5" />
      {Array.from({ length: 12 }, (_, i) => {
        const x = 10 + i * 26;
        const y = 16 + Math.sin((i / 11) * Math.PI) * 13;
        return <path key={i} d={`M${x} ${y} l12 0 l-6 14 z`} fill={["#b8402f", "#d9b44a", "#3f5f87", "#5b7f6e"][i % 4]} />;
      })}
      {people([50, 110, 170, 230, 290], 104, ["#5b7f6e", "#d9b44a", "#3f5f87", "#b8402f"])}
      {[50, 110, 170, 230, 290].map((x) => (
        <path key={x} d={`M${x - 13} 126 l13 -4 l13 4 v12 l-13 -4 l-13 4 z`} fill="#ffffff" stroke={INK} strokeWidth="1.5" />
      ))}
      <rect x="0" y="160" width="320" height="20" fill="#c9bfa8" />
    </>
  ),
  // An AI-generated illustration of children reading in a meadow: glossy, too perfect.
  meadow: (
    <>
      <rect width="320" height="180" fill="#bfe0f2" />
      <circle cx="262" cy="40" r="24" fill="#ffd95a" />
      <path d="M0 120 q80 -40 160 -10 t160 -20 v90 H0z" fill="#7cc46b" />
      <path d="M0 150 q90 -30 200 -6 t120 -4 v40 H0z" fill="#5fae55" />
      <rect x="92" y="62" width="10" height="60" fill="#7a5a3a" />
      <circle cx="97" cy="52" r="34" fill="#4f9e4a" />
      {people([130, 162], 112, ["#ff7aa8", "#7a8cff"])}
      {[[40, 150], [210, 160], [250, 146], [290, 158], [176, 166]].map(([x, y]) => (
        <g key={x}>
          <circle cx={x} cy={y} r="6" fill="#ffffff" />
          <circle cx={x} cy={y} r="2.5" fill="#ffd95a" />
        </g>
      ))}
    </>
  ),
  // A famous library's grand reading room, as in a photo found on a website.
  famousLibrary: (
    <>
      <rect width="320" height="180" fill="#e4dccb" />
      <path d="M40 90 a120 80 0 0 1 240 0 z" fill="#d1c4a5" stroke={INK} strokeWidth="2" />
      {[60, 100, 140, 180, 220, 260].map((x) => (
        <line key={x} x1="160" y1="20" x2={x} y2="90" stroke={INK} strokeWidth="1" />
      ))}
      {[48, 96, 144, 176, 224, 272].map((x) => (
        <rect key={x} x={x - 5} y="90" width="10" height="70" fill="#f2ecdf" stroke={INK} strokeWidth="1.5" />
      ))}
      <rect x="0" y="160" width="320" height="20" fill="#7a5a3a" />
      <ellipse cx="160" cy="150" rx="60" ry="8" fill="#7a5a3a" />
    </>
  ),
};

/**
 * The image or drawing for a scene, with its description as the accessible name. Images load lazily with a
 * blurred preview; `sizes` is the widest they are shown (a sheet is at most 44rem, a poster or card 24rem), so
 * phones and narrow frames download a smaller file.
 */
export function Scene({ id, alt, sizes = "(max-width: 44rem) 100vw, 44rem" }: { id: SceneId; alt: string; sizes?: string }) {
  if (isGeneratedImage(id)) {
    return <Image src={IMAGES[id]} alt={alt} placeholder="blur" sizes={sizes} className="scene block h-auto w-full" />;
  }
  return (
    <svg viewBox="0 0 320 180" role="img" aria-label={alt} className="scene block h-auto w-full" focusable="false">
      {SCENES[id]}
    </svg>
  );
}
