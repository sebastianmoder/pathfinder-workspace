import type { ReactNode } from "react";
import type { SceneId } from "@/content/types";

/*
 * Drawings that stand in for the photos and images in a case. They keep their own fixed "print" palette in
 * both themes, because a photo looks the same whatever the page around it does. Each one is a labelled
 * drawing of something described in words, never presented as a real photo (PRD §4, simplifications visible).
 */

const INK = "#1f2d28";
const SKY = "#cddbe3";
const PAPER = "#eef1ec";

/** Figures from the chest up: a head on rounded shoulders. */
const people = (xs: number[], y: number, colours: string[]) =>
  xs.map((x, i) => (
    <g key={x}>
      <path d={`M${x - 12} ${y + 34} q12 -52 24 0 z`} fill={colours[i % colours.length]} stroke={INK} strokeWidth="1.5" />
      <circle cx={x} cy={y} r="7.5" fill="#e8c9a8" stroke={INK} strokeWidth="1.5" />
    </g>
  ));

const SCENES: Record<SceneId, ReactNode> = {
  // Brown floodwater over the road at a bridge, a car stranded halfway, railings just above the water.
  flood: (
    <>
      <rect width="320" height="180" fill={SKY} />
      <path d="M0 70 q40 -18 80 -6 t90 -4 t80 2 t70 -8 v20 H0z" fill="#8ea793" />
      <rect x="0" y="78" width="320" height="6" fill="#6d6f66" />
      {Array.from({ length: 17 }, (_, i) => (
        <rect key={i} x={6 + i * 19} y="60" width="3" height="22" fill={INK} />
      ))}
      <rect x="0" y="58" width="320" height="4" fill={INK} />
      <rect x="0" y="84" width="320" height="96" fill="#8a6a3e" />
      {[100, 122, 146, 168].map((y, i) => (
        <path key={y} d={`M${i % 2 ? -10 : 0} ${y} q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0`} fill="none" stroke="#b08d5c" strokeWidth="2" />
      ))}
      <path d="M128 104 l10 -20 h52 l12 20 z" fill="#b8402f" stroke={INK} strokeWidth="2" />
      <path d="M142 100 l6 -12 h16 v12 z M170 100 v-12 h14 l6 12 z" fill="#c9dbe6" stroke={INK} strokeWidth="1.5" />
      <path d="M118 106 h96" stroke="#b08d5c" strokeWidth="3" />
    </>
  ),
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

/** A drawing for a scene, with its description as the accessible name. */
export function Scene({ id, alt }: { id: SceneId; alt: string }) {
  return (
    <svg viewBox="0 0 320 180" role="img" aria-label={alt} className="scene block h-auto w-full" focusable="false">
      {SCENES[id]}
    </svg>
  );
}
