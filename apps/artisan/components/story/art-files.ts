// Written by scripts/art-sync.mjs (`pnpm art:sync`). Don't edit by hand.
import type { StaticImageData } from "next/image";
import artCastDev from "@/assets/story/cast-dev.webp";
import artCastFatima from "@/assets/story/cast-fatima.webp";
import artCastHughes from "@/assets/story/cast-hughes.webp";
import artCastJoanna from "@/assets/story/cast-joanna.webp";
import artCastKwame from "@/assets/story/cast-kwame.webp";
import artCastLeo from "@/assets/story/cast-leo.webp";
import artCastNadia from "@/assets/story/cast-nadia.webp";
import artCastOkoro from "@/assets/story/cast-okoro.webp";
import artCastPriya from "@/assets/story/cast-priya.webp";
import artCastRafael from "@/assets/story/cast-rafael.webp";
import artCastRosa from "@/assets/story/cast-rosa.webp";
import artCastSam from "@/assets/story/cast-sam.webp";
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
  "cast-dev": artCastDev,
  "cast-fatima": artCastFatima,
  "cast-hughes": artCastHughes,
  "cast-joanna": artCastJoanna,
  "cast-kwame": artCastKwame,
  "cast-leo": artCastLeo,
  "cast-nadia": artCastNadia,
  "cast-okoro": artCastOkoro,
  "cast-priya": artCastPriya,
  "cast-rafael": artCastRafael,
  "cast-rosa": artCastRosa,
  "cast-sam": artCastSam,
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
