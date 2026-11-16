import type { CastId, PlaceId } from "./types";

/**
 * Every picture the story can show. The images themselves are supplied separately: generate each from its
 * prompt, save it as `assets/story/<id>.webp` (or .png / .jpg) and run `pnpm art:sync`. Until a file exists,
 * its slot shows a placeholder, so the game is complete without any of them.
 */
export interface ArtSlot {
  id: string;
  kind: "portrait" | "backdrop" | "title";
  /** Pixels to generate at. */
  width: number;
  height: number;
  /** What the picture shows, for people who can't see it. */
  alt: string;
  prompt: string;
}

/** Put in front of every prompt, so the pictures belong together. */
export const ART_STYLE =
  "Flat gouache illustration with visible brush texture and soft paper grain. Limited palette: river slate blue-green, manila buff, off-white paper, brick red and a little highlighter yellow. Calm, observational, contemporary small European town. No text, lettering, logos or watermarks anywhere in the image.";

const PORTRAIT = "Head-and-shoulders portrait, three-quarter view, looking just past the viewer, plain flat manila-buff background, even light.";
const BACKDROP = "Wide interior or street view at eye level, no people, the lower third kept simple and uncluttered.";

export const castArt: Record<CastId, ArtSlot> = {
  joanna: {
    id: "cast-joanna",
    kind: "portrait",
    width: 800,
    height: 1000,
    alt: "Joanna, the director",
    prompt: `${PORTRAIT} A woman in her mid fifties who runs a community learning centre: short grey-streaked dark hair, reading glasses pushed up into it, a slate cardigan over a plain shirt, a lanyard, a tired and amused expression.`,
  },
  sam: {
    id: "cast-sam",
    kind: "portrait",
    width: 800,
    height: 1000,
    alt: "Sam, from the front desk",
    prompt: `${PORTRAIT} A cheerful front-desk worker in their late twenties: curly brown hair, a mustard jumper, a bunch of keys on a red lanyard, an open, eager expression.`,
  },
  priya: {
    id: "cast-priya",
    kind: "portrait",
    width: 800,
    height: 1000,
    alt: "Priya, the Homework Club coordinator",
    prompt: `${PORTRAIT} A woman in her early thirties who coordinates a homework club: long black hair tied back, a brick-red top, a pencil behind one ear, an earnest and slightly harried expression.`,
  },
};

export const placeArt: Record<PlaceId, ArtSlot> = {
  street: {
    id: "place-street",
    kind: "backdrop",
    width: 1920,
    height: 1080,
    alt: "An old brick school building on a quiet street, with a river beyond the rooftops",
    prompt: `${BACKDROP} The front of an old two-storey brick school building converted into a community learning centre, a blank signboard by the door, bicycles against the railings, early morning, a river and a stone bridge visible at the end of the street.`,
  },
  frontDesk: {
    id: "place-front-desk",
    kind: "backdrop",
    width: 1920,
    height: 1080,
    alt: "A front desk in a tiled entrance hall, with a noticeboard and leaflet racks",
    prompt: `${BACKDROP} The entrance hall of a community learning centre in an old school: a wooden front desk with a computer and a bell, a crowded noticeboard with blank notices, leaflet racks, a tiled floor, daylight from tall windows.`,
  },
  office: {
    id: "place-office",
    kind: "backdrop",
    width: 1920,
    height: 1080,
    alt: "A small shared office with a desk by the window and a manila folder on it",
    prompt: `${BACKDROP} A small shared staff office in an old school building: three mismatched desks, a desk by a tall window with a manila folder, a notebook and a mug on it, shelves of box files, a pinboard, late afternoon light.`,
  },
  homeworkRoom: {
    id: "place-homework-room",
    kind: "backdrop",
    width: 1920,
    height: 1080,
    alt: "A classroom set up for homework club, with tables pushed together and a whiteboard",
    prompt: `${BACKDROP} A former classroom used for a homework club: tables pushed together in groups, stacked chairs, a whiteboard with faint wiped marks and no writing, pots of pencils, children's coats on hooks.`,
  },
};

export const titleArt: ArtSlot = {
  id: "title",
  kind: "title",
  width: 1600,
  height: 1200,
  alt: "A manila folder on a desk beside a map of a river town",
  prompt:
    "Top-down view of a desk: a manila folder lying slightly open with a few papers and index cards showing, a hand-drawn map of a small river town with one bridge, a notebook, a pencil and a length of red thread. Nothing written on any of them.",
};

export const artSlots: ArtSlot[] = [titleArt, ...Object.values(placeArt), ...Object.values(castArt)];
