import Image from "next/image";
import type { CastId, PlaceId } from "@/content/story/types";
import { castArt, placeArt, titleArt, type ArtSlot } from "@/content/story/art";
import { cast } from "@/content/story";
import { initialsOf, toneOf } from "@/components/artefacts/cast-badge";
import { ART_FILES } from "./art-files";

/**
 * The story's pictures. Each shows only once its image has been supplied (see ART-BRIEF.md): a place is then
 * shown at the start of its scene, like a photo sent into the conversation, and a person's portrait becomes
 * their avatar. Without the image, a place is given in words and a person by their initials, so nothing is
 * missing for someone playing without the art.
 */
function Supplied({ slot, sizes, className, priority }: { slot: ArtSlot; sizes: string; className: string; priority?: boolean }) {
  const file = ART_FILES[slot.id];
  if (!file) return null;
  return <Image src={file} alt={slot.alt} sizes={sizes} placeholder="blur" priority={priority} className={className} />;
}

export function SceneImage({ place }: { place: PlaceId }) {
  return <Supplied slot={placeArt[place]} sizes="(max-width: 40rem) 100vw, 40rem" className="chat-image" />;
}

/** A round avatar. Decorative: the name is always written beside it. */
export function Portrait({ who }: { who: CastId }) {
  const slot = castArt[who];
  const member = cast[who];
  return (
    <span className="portrait" aria-hidden="true">
      {ART_FILES[slot.id] ? (
        <Image src={ART_FILES[slot.id]} alt="" sizes="3rem" className="portrait-image" />
      ) : (
        <span className={`portrait-card ${toneOf(member.name)}`}>{initialsOf(member.name)}</span>
      )}
    </span>
  );
}

export const hasTitleArt = !!ART_FILES[titleArt.id];

export function TitleArt() {
  if (!ART_FILES[titleArt.id]) return null;
  return <Supplied slot={titleArt} sizes="(max-width: 64rem) 100vw, 32rem" className="title-art" priority />;
}
