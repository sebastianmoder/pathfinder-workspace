import type { CastId, PlaceId } from "./types";

/**
 * Every picture the story can show, described fully enough to generate from. The images themselves are
 * supplied separately: generate each from `promptOf(slot)`, save it as `assets/story/<id>.webp` (or .png /
 * .jpg) and run `pnpm art:sync`. Until a file exists the story does without it: a place is named in words and
 * a person shown by their initials, so the game is complete with no pictures at all.
 *
 * `ART-BRIEF.md` is this file written out for whoever makes the pictures. Regenerate it with `pnpm art:brief`.
 */
export interface ArtSlot {
  id: string;
  kind: "portrait" | "place" | "title";
  /** Pixels to generate at. */
  width: number;
  height: number;
  /** What the picture shows, for people who can't see it. */
  alt: string;
  /** Who or what the picture is of. */
  subject: string;
  /** How the frame is arranged: viewpoint, where things sit, light. */
  composition: string;
  /** Everything that should be in the picture. */
  include: string[];
  /** Things particular to this picture that must be left out, on top of `ART_NEVER`. */
  exclude: string[];
}

/** The look every picture shares. */
export const ART_STYLE =
  "Hand-painted gouache illustration on textured paper: flat, opaque shapes with visible dry-brush edges and a little paper grain showing through, no outlines, no gradients, no gloss. A restricted palette used in every picture: river slate blue-green (#1f3d47) for shadows and large dark areas, manila buff (#e8cf97), off-white paper (#f3f5f1), brick red (#b3261e) as a small accent, and highlighter yellow (#f2d544) used once at most. Soft, even daylight with simple two-tone shading. The mood is calm, observant and a little wry. The setting is a small present-day European river town; clothes, furniture and technology are ordinary and current, not nostalgic.";

/** What no picture may contain. */
export const ART_NEVER = [
  "any text, letters, numbers, handwriting or symbols that read as writing (signs, screens, book spines, papers and notices are left blank or shown as plain blocks of tone)",
  "logos, brand marks, flags, watermarks, signatures, captions, borders or frames",
  "photorealism, 3D rendering, anime or cartoon exaggeration, glossy digital shading, lens blur or lens flare",
  "robots, glowing brains, circuit patterns, holograms or any other stock picture of “AI”",
  "anything frightening, violent or dramatic: no storms, no alarm, no people in distress",
];

const PORTRAIT_FRAME =
  "Square frame. One person only, head and shoulders, facing three-quarters towards the viewer's left or right and looking just past the viewer, not into the lens. The head is centred and fills about 60% of the height, with clear space all round it, because the picture is shown cropped to a small circle: nothing important may sit in the corners. Plain, flat manila-buff background with no objects, no room and no shadow on it. Even light from the front-left.";

const PLACE_FRAME =
  "Wide 16:9 frame, seen at standing eye level from just inside the doorway, as if you have walked in and stopped. The room is empty of people. The main object sits a little off-centre; the foreground is simple floor or desk so the eye goes to the middle of the picture. Everything is in focus. The picture is shown about 640 pixels wide, so shapes must be large and readable, with no fine detail that matters.";

const portrait = (id: string, alt: string, subject: string, include: string[], exclude: string[] = []): ArtSlot => ({
  id,
  kind: "portrait",
  width: 1024,
  height: 1024,
  alt,
  subject,
  composition: PORTRAIT_FRAME,
  include,
  exclude: ["hands, props held up to the face, or anything crossing in front of the face", "a second person, even partly", "any background other than the flat buff colour", ...exclude],
});

const place = (id: string, alt: string, subject: string, composition: string, include: string[], exclude: string[] = []): ArtSlot => ({
  id,
  kind: "place",
  width: 1600,
  height: 900,
  alt,
  subject,
  composition: `${PLACE_FRAME} ${composition}`,
  include,
  exclude: ["people, figures in the distance, silhouettes, or animals", ...exclude],
});

export const castArt: Record<CastId, ArtSlot> = {
  joanna: portrait("cast-joanna", "Joanna, the director", "Joanna, who runs the Riverside Learning Commons: a woman in her mid fifties, capable and stretched thin, who finds things funny when she is tired.", [
    "short dark hair streaked with grey, a little untidy",
    "reading glasses pushed up into her hair",
    "a slate-blue cardigan over a plain off-white shirt",
    "a plain lanyard ribbon round her neck, its card out of frame",
    "a tired, amused half-smile and one raised eyebrow",
  ]),
  sam: portrait("cast-sam", "Sam, from the front desk", "Sam, who staffs the front desk: in their late twenties, quick, friendly and inclined to believe good news.", [
    "curly mid-brown hair",
    "a mustard-yellow knitted jumper (this is the one picture that uses the highlighter yellow)",
    "a brick-red lanyard ribbon round the neck, with the top of a bunch of keys just visible at the bottom edge",
    "an open, eager expression, mid-way to saying something",
  ]),
  priya: portrait("cast-priya", "Priya, the Homework Club coordinator", "Priya, who coordinates Homework Club: a woman in her early thirties, earnest, energetic and always slightly behind.", [
    "long black hair tied back loosely, a few strands escaping",
    "a brick-red top",
    "a pencil tucked behind one ear",
    "a bright, slightly harried expression, eyebrows up",
  ]),
  dev: portrait("cast-dev", "Dev, a newsletter volunteer", "Dev, a volunteer who puts the newsletter together: a man in his early twenties, enthusiastic and pleased with his draft.", [
    "short black hair and a short neat beard",
    "round glasses",
    "an off-white T-shirt under an open slate-blue overshirt",
    "a confident, cheerful grin",
  ]),
  nadia: portrait("cast-nadia", "Nadia, from the Commons board", "Nadia, a member of the Commons board who reads the papers properly: a woman in her forties, precise, dry and fair.", [
    "a slate-blue headscarf, neatly wrapped",
    "a manila-buff blazer over a dark top",
    "a level, attentive look and the faintest sceptical smile",
  ]),
  rafael: portrait("cast-rafael", "Rafael, from the Commons board", "Rafael, a board member who argues the other side on principle: a man in his sixties, courteous and stubborn.", [
    "thinning grey hair and a trimmed grey moustache",
    "a dark slate jacket over a buff shirt, no tie",
    "chin slightly lifted, eyebrows drawn together, as if about to object",
  ]),
  leo: portrait("cast-leo", "Leo, a Homework Club learner", "Leo, aged 14, who comes to Homework Club: a teenage boy, bright, impatient and a bit defensive about his homework.", [
    "short dark hair, slightly messy at the front",
    "a plain slate-blue hooded sweatshirt",
    "one strap of a rucksack over a shoulder, at the very edge of the frame",
    "a wary sideways look with a hint of a smirk",
  ], ["anything that makes him look younger than a teenager or older than 15"]),
  rosa: portrait("cast-rosa", "Rosa, editor of the Riverside Gazette", "Rosa, the editor of the local newspaper: a woman in her late forties, brisk, sharp and short of time.", [
    "greying dark hair cut in a blunt bob",
    "a brick-red scarf at the neck of a dark slate shirt with the sleeves pushed up",
    "reading glasses hanging on a cord round her neck",
    "a direct, impatient look, mouth set",
  ]),
  kwame: portrait("cast-kwame", "Kwame, an independent auditor", "Kwame, an independent auditor brought in to test a screening tool: a man in his forties, calm, exact and hard to hurry.", [
    "very short black hair and a short beard with a little grey in it",
    "thin-framed rectangular glasses",
    "an off-white shirt, open at the collar, under a slate waistcoat",
    "a patient, measuring expression",
  ]),
  fatima: portrait("cast-fatima", "Fatima, from the town library", "Fatima, who organises events at the town library: a woman in her thirties, warm, practical and used to plans changing.", [
    "shoulder-length wavy dark hair",
    "a buff cardigan over a slate-blue dress",
    "a small plain brick-red brooch",
    "a friendly, apologetic smile, as if bringing a change of plan",
  ]),
  hughes: portrait("cast-hughes", "Councillor Hughes", "Councillor Hughes, who chairs the council's services committee: a woman in her sixties, formal, budget-minded and persuadable by evidence.", [
    "neat white hair, set",
    "a dark slate suit jacket with a plain off-white blouse",
    "a single strand of plain beads",
    "an appraising look over the top of half-moon glasses",
  ]),
  okoro: portrait("cast-okoro", "Councillor Okoro", "Councillor Okoro, a member of the services committee who hears residents' complaints: a man in his fifties, thoughtful and persistent.", [
    "a shaved head and a full greying beard",
    "a buff jacket over a dark slate roll-neck jumper",
    "a serious, kind expression, head tilted slightly as if listening",
  ]),
};

export const placeArt: Record<PlaceId, ArtSlot> = {
  street: place(
    "place-street",
    "An old brick school building on a quiet street, with a river and a bridge at the end of it",
    "The outside of the Riverside Learning Commons, a two-storey former school of brick-red brick on a quiet street, early on a weekday morning.",
    "This one is outdoors: seen from the pavement opposite, slightly to the left of the entrance, so the front of the building fills the right two-thirds of the frame and the street runs away on the left to the river.",
    [
      "tall school windows with off-white frames and a wide double door, one leaf standing open",
      "a blank rectangular signboard on a post beside the door",
      "black iron railings with three bicycles leaning on them",
      "at the far end of the street on the left: a strip of slate-blue river and one arch of a low stone bridge",
      "long, soft morning shadows and a pale off-white sky",
    ],
    ["cars, buses or road markings", "shop fronts or advertising"],
  ),
  frontDesk: place(
    "place-front-desk",
    "A front desk in a tiled entrance hall, with a noticeboard and leaflet racks",
    "The entrance hall of the Commons: the front desk where Sam works, in what was the school's lobby.",
    "The desk stands to the right of centre, angled towards the viewer; the wall behind it runs across the frame.",
    [
      "a long wooden reception desk with a plain computer monitor seen from the back, a brass bell and a mug",
      "a large cork noticeboard on the wall behind, crowded with overlapping blank notices in off-white, buff and one in yellow",
      "a wire rack of blank leaflets on the left",
      "a floor of slate and off-white chequered tiles",
      "daylight from a tall window on the left, falling across the floor",
    ],
    ["a visible computer screen"],
  ),
  office: place(
    "place-office",
    "A small shared office with a desk by the window and a manila folder on it",
    "The shared staff office at the Commons, and in it your desk: the one by the window, with the folder on it.",
    "The window is in the back wall, left of centre, with your desk under it; two other desks are partly visible at the right edge.",
    [
      "a plain wooden desk under a tall window, with a closed manila folder lying on it, a notebook, a pencil and a mug",
      "a wooden chair pushed back from the desk",
      "shelves of box files along the right-hand wall, their spines blank",
      "a small cork pinboard with a few blank cards and one length of brick-red thread pinned between two of them",
      "late-afternoon light through the window, laying a pale rectangle across the desk and the folder",
    ],
    ["a computer screen facing the viewer", "papers with visible writing"],
  ),
  homeworkRoom: place(
    "place-homework-room",
    "A classroom set up for homework club, with tables pushed together and a whiteboard",
    "The Homework Club room: a former classroom, set out for a Saturday session before anyone has arrived.",
    "Tables fill the middle of the frame; the whiteboard is on the back wall, right of centre.",
    [
      "four tables pushed together into two groups, with mismatched chairs",
      "pots of pencils and a stack of blank worksheets on the nearest table",
      "a whiteboard wiped not quite clean, with faint grey smears and nothing legible",
      "a row of coat hooks by the door on the left with two small coats and a rucksack",
      "a large window on the right with morning light",
    ],
  ),
  boardRoom: place(
    "place-board-room",
    "A meeting room with a long table, a jug of water and a stack of papers at each place",
    "The board room at the Commons, laid for a meeting of the trustees.",
    "The long table runs from the near left to the far right, so its length leads into the picture.",
    [
      "a long dark wooden table with eight chairs",
      "at each place a neat stack of blank papers; in the middle a glass jug of water and glasses",
      "on the back wall a large framed old photograph of the school building, shown only as soft shapes",
      "a projector screen pulled half-way down in the far corner, blank",
      "evening light: the window on the left is dusk-blue and a ceiling lamp throws a warm buff pool on the table",
    ],
  ),
  studio: place(
    "place-studio",
    "A workroom with a large table of paper, scissors and a poster on the wall",
    "The studio at the Commons, where the newsletter and the posters are put together.",
    "A large work table fills the lower middle of the frame, seen slightly from above; the wall behind holds the pinned-up work.",
    [
      "a big table covered with sheets of coloured paper in the palette's colours, a cutting mat, scissors, a steel ruler and a glue stick",
      "a poster-sized sheet pinned to the wall, showing only large blocks of colour where its picture and words would be",
      "a row of printed pages clipped to a string across the wall, all blank",
      "a laptop, closed, at one corner of the table",
      "bright, even midday light",
    ],
  ),
  gazette: place(
    "place-gazette",
    "A small newsroom: one long desk, stacks of newspapers and a window onto the bridge",
    "The newsroom of the Riverside Gazette, the town's weekly paper: one long shared desk and a window that looks out on Riverside Bridge.",
    "The window is the brightest thing in the picture, in the back wall, right of centre; the desk runs under it across the frame.",
    [
      "one long desk with three plain monitors seen from behind or at an angle, keyboards, and stacks of folded newspapers shown as blank grey-and-white blocks",
      "through the window: the low stone bridge and the river at its normal level, calm, under an ordinary pale sky",
      "a wall clock with plain marks instead of numerals",
      "a desk lamp with a brick-red shade",
      "cool morning light",
    ],
    ["flood water, rain or anything suggesting an emergency", "readable headlines or front pages"],
  ),
  townHall: place(
    "place-town-hall",
    "A council chamber with a horseshoe of desks and tall windows",
    "The council chamber in Riverside's town hall, where the citizens' panel and the commission meet.",
    "Seen from the public end of the room, looking towards the chair's seat, which is centred at the far end under the windows.",
    [
      "a horseshoe of dark wooden desks with a microphone stalk and a glass of water at each seat",
      "a slightly raised chair's desk at the far end",
      "three tall arched windows behind it with pale daylight",
      "a public bench in the near foreground, seen from behind, empty",
      "a plain coloured banner hanging between the windows, a single block of slate-blue with no emblem",
    ],
    ["coats of arms, crests, flags or portraits of real people"],
  ),
};

export const titleArt: ArtSlot = {
  id: "title",
  kind: "title",
  width: 1600,
  height: 1200,
  alt: "A manila folder on a desk beside a hand-drawn map of a river town",
  subject: "The desk at the start of the year, seen from directly above: a manila folder and a map of Riverside.",
  composition:
    "4:3 frame, a flat top-down view of a slate-blue desk top. The folder lies in the upper left, turned a few degrees, slightly open so the edges of a few papers show. The map lies in the lower right, overlapping the folder's corner. The objects are large and fill the frame, with a little desk showing at the edges. Soft light from the top left gives each object a short, clean shadow.",
  include: [
    "a manila-buff card folder with a tab, the tab blank",
    "three or four off-white sheets and two buff index cards showing from the folder, all blank",
    "a hand-drawn map on off-white paper: one winding slate-blue river, a single bridge, and simple blocks for a dozen buildings, with no labels",
    "a length of brick-red thread running loosely from a pin on the map to the folder",
    "a plain notebook with a brick-red cover, closed, and a yellow pencil lying on it",
  ],
  exclude: ["hands or people", "a computer, phone or any screen", "a coffee-cup ring or other clutter beyond what is listed"],
};

export const artSlots: ArtSlot[] = [titleArt, ...Object.values(placeArt), ...Object.values(castArt)];

/** The full text to give an image generator for one picture. */
export function promptOf(slot: ArtSlot): string {
  return [
    `STYLE. ${ART_STYLE}`,
    `SUBJECT. ${slot.subject}`,
    `COMPOSITION. ${slot.composition}`,
    `MUST SHOW. ${slot.include.join("; ")}.`,
    `MUST NOT SHOW. ${[...slot.exclude, ...ART_NEVER].join("; ")}.`,
  ].join("\n");
}
