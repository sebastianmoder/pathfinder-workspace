import type { ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";
import type { SceneId } from "@/content/types";
import riversideBridgeFlood from "@/assets/scenes/riverside-bridge-flood.webp";

/*
 * The photos and images in a case. Some are AI-generated, photorealistic images; the rest are drawings that
 * keep their own fixed "print" palette in both themes, because a photo looks the same whatever the page around
 * it does. Neither is ever presented as a real photo: each is labelled as a drawing or as AI-generated wherever
 * it appears (PRD §4, simplifications visible).
 */

/** Scenes shown as an AI-generated image. Static imports give the size, a blur placeholder and hashed URLs. */
const IMAGES = { flood: riversideBridgeFlood } satisfies Partial<Record<SceneId, StaticImageData>>;
type ImageScene = keyof typeof IMAGES;

/** Whether a scene is an AI-generated image rather than a drawing, so its label can say so. */
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
  // A crowded, brightly lit library: shelves behind, people of all ages at tables of books.
  library: (
    <>
      <rect width="320" height="180" fill="#e9dfc9" />
      {[16, 52, 88].map((y) => (
        <g key={y}>
          <rect x="0" y={y + 30} width="320" height="4" fill="#7a5a3a" />
          {Array.from({ length: 40 }, (_, i) => (
            <rect key={i} x={2 + i * 8} y={y + 8 + ((i * 7) % 6)} width="6" height={22 - ((i * 7) % 6)} fill={["#5b7f6e", "#b8402f", "#d9b44a", "#3f5f87", "#7a5a3a"][i % 5]} />
          ))}
        </g>
      ))}
      {[60, 160, 260].map((x) => (
        <circle key={x} cx={x} cy="10" r="8" fill="#f7e8a3" stroke={INK} strokeWidth="1.5" />
      ))}
      {people([40, 72, 104, 136, 184, 216, 248, 280], 128, ["#3f5f87", "#b8402f", "#5b7f6e", "#d9b44a"])}
      <rect x="20" y="150" width="280" height="10" fill="#7a5a3a" />
      {[60, 120, 200, 260].map((x) => (
        <rect key={x} x={x} y="143" width="16" height="7" fill="#ffffff" stroke={INK} strokeWidth="1" />
      ))}
    </>
  ),
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
  // A group photo from the volunteers' party.
  groupParty: (
    <>
      <rect width="320" height="180" fill="#f1e6d6" />
      <rect x="60" y="14" width="200" height="26" fill="#b8402f" />
      <text x="160" y="32" textAnchor="middle" fontSize="14" fontFamily="Georgia, serif" fill="#ffffff">Thank you, volunteers</text>
      {people([40, 76, 112, 148, 184, 220, 256, 290], 92, ["#3f5f87", "#5b7f6e", "#d9b44a", "#b8402f"])}
      {people([58, 130, 202, 274], 126, ["#d9b44a", "#3f5f87", "#5b7f6e", "#b8402f"])}
    </>
  ),
  // An AI-generated illustration of a hand-drawn heart.
  heart: (
    <>
      <rect width="320" height="180" fill="#fff3f5" />
      <path d="M160 150 C 60 90, 90 20, 160 62 C 230 20, 260 90, 160 150 z" fill="#ff6f91" stroke="#b8402f" strokeWidth="3" strokeLinejoin="round" />
      <path d="M118 66 q10 -12 24 -6" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  // A licensed stock photo of a thank-you card on a table.
  thankYou: (
    <>
      <rect width="320" height="180" fill="#c9b79a" />
      <path d="M70 40 l180 -8 l8 118 l-180 8 z" fill="#fbfaf6" stroke={INK} strokeWidth="1.5" />
      <text x="164" y="102" textAnchor="middle" fontSize="28" fontStyle="italic" fontFamily="Georgia, serif" fill="#3f5f87" transform="rotate(-3 164 102)">Thank you</text>
      <circle cx="268" cy="150" r="16" fill="#5b7f6e" opacity="0.8" />
    </>
  ),
};

/**
 * The image or drawing for a scene, with its description as the accessible name. Images load lazily at the
 * width of the sheet they lie on (at most 44rem), with a blurred preview while they arrive.
 */
export function Scene({ id, alt }: { id: SceneId; alt: string }) {
  if (isGeneratedImage(id)) {
    return <Image src={IMAGES[id]} alt={alt} placeholder="blur" sizes="(max-width: 44rem) 100vw, 44rem" className="scene block h-auto w-full" />;
  }
  return (
    <svg viewBox="0 0 320 180" role="img" aria-label={alt} className="scene block h-auto w-full" focusable="false">
      {SCENES[id]}
    </svg>
  );
}
