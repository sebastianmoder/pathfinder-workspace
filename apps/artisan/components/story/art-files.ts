// Written by scripts/art-sync.mjs (`pnpm art:sync`). Don't edit by hand.
import type { StaticImageData } from "next/image";
import artPlaceBoardRoom from "@/assets/story/place-board-room.webp";
import artPlaceFrontDesk from "@/assets/story/place-front-desk.webp";
import artPlaceGazette from "@/assets/story/place-gazette.webp";
import artPlaceHomeworkRoom from "@/assets/story/place-homework-room.webp";
import artPlaceOffice from "@/assets/story/place-office.webp";
import artPlaceStreet from "@/assets/story/place-street.webp";
import artPlaceStudio from "@/assets/story/place-studio.webp";
import artPlaceTownHall from "@/assets/story/place-town-hall.webp";
import artTitle from "@/assets/story/title.webp";

/** The story pictures that have been supplied, by slot id. */
export const ART_FILES: Record<string, StaticImageData> = {
  "place-board-room": artPlaceBoardRoom,
  "place-front-desk": artPlaceFrontDesk,
  "place-gazette": artPlaceGazette,
  "place-homework-room": artPlaceHomeworkRoom,
  "place-office": artPlaceOffice,
  "place-street": artPlaceStreet,
  "place-studio": artPlaceStudio,
  "place-town-hall": artPlaceTownHall,
  "title": artTitle,
};
