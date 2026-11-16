import Image from "next/image";
import type { CastId, PlaceId } from "@/content/story/types";
import { castArt, placeArt, titleArt, type ArtSlot } from "@/content/story/art";
import { cast, places } from "@/content/story";
import { initialsOf, toneOf } from "@/components/artefacts/cast-badge";
import { ART_FILES } from "./art-files";

/**
 * A story picture, or its placeholder while the image hasn't been supplied. Placeholders are in-world: a
 * location slip for a place, a staff card for a person. They say what they stand for, so nothing is missing
 * for someone playing without the art.
 */
function Supplied({ slot, sizes, className, priority }: { slot: ArtSlot; sizes: string; className: string; priority?: boolean }) {
  const file = ART_FILES[slot.id];
  if (!file) return null;
  return <Image src={file} alt={slot.alt} sizes={sizes} placeholder="blur" priority={priority} className={className} />;
}

export function Backdrop({ place }: { place: PlaceId }) {
  const slot = placeArt[place];
  return (
    <div className="backdrop" data-place={place}>
      {ART_FILES[slot.id] ? (
        <Supplied slot={slot} sizes="(max-width: 64rem) 100vw, 64rem" className="backdrop-image" />
      ) : (
        <div className="backdrop-slip" role="img" aria-label={slot.alt}>
          <span>{places[place].name}</span>
        </div>
      )}
    </div>
  );
}

export function Portrait({ who, size = "lg" }: { who: CastId; size?: "sm" | "lg" }) {
  const slot = castArt[who];
  const member = cast[who];
  return (
    <span className="portrait" data-size={size}>
      {ART_FILES[slot.id] ? (
        <Supplied slot={slot} sizes={size === "lg" ? "10rem" : "3rem"} className="portrait-image" />
      ) : (
        <span className={`portrait-card ${toneOf(member.name)}`} aria-hidden="true">{initialsOf(member.name)}</span>
      )}
    </span>
  );
}

export const hasTitleArt = !!ART_FILES[titleArt.id];

export function TitleArt() {
  if (!ART_FILES[titleArt.id]) return null;
  return <Supplied slot={titleArt} sizes="(max-width: 64rem) 100vw, 32rem" className="title-art" priority />;
}
