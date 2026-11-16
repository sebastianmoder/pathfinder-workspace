# Art brief: The Riverside File

The story shows a picture for each place and each speaker. Until a file is supplied, its slot shows a placeholder, so nothing here blocks the game.

## How to add a picture

1. Generate it from the style line plus the slot prompt below, at the size given.
2. Save it as `assets/story/<id>.webp` (`.png` and `.jpg` also work), using the slot id as the file name.
3. Run `pnpm art:sync` in `apps/artisan`. The picture is now used wherever its slot appears.

The prompts live in `content/story/art.ts`; change them there and regenerate this list by hand if they change. This list covers the prologue and chapter 1. Later chapters will add their people and places.

## Style line (put it before every prompt)

> Flat gouache illustration with visible brush texture and soft paper grain. Limited palette: river slate blue-green, manila buff, off-white paper, brick red and a little highlighter yellow. Calm, observational, contemporary small European town. No text, lettering, logos or watermarks anywhere in the image.

## Slots

### `title`

- Kind: title, 1600 × 1200 px
- Shows: A manila folder on a desk beside a map of a river town
- Prompt: Top-down view of a desk: a manila folder lying slightly open with a few papers and index cards showing, a hand-drawn map of a small river town with one bridge, a notebook, a pencil and a length of red thread. Nothing written on any of them.

### `place-street`

- Kind: backdrop, 1920 × 1080 px
- Shows: An old brick school building on a quiet street, with a river beyond the rooftops
- Prompt: Wide interior or street view at eye level, no people, the lower third kept simple and uncluttered. The front of an old two-storey brick school building converted into a community learning centre, a blank signboard by the door, bicycles against the railings, early morning, a river and a stone bridge visible at the end of the street.

### `place-front-desk`

- Kind: backdrop, 1920 × 1080 px
- Shows: A front desk in a tiled entrance hall, with a noticeboard and leaflet racks
- Prompt: Wide interior or street view at eye level, no people, the lower third kept simple and uncluttered. The entrance hall of a community learning centre in an old school: a wooden front desk with a computer and a bell, a crowded noticeboard with blank notices, leaflet racks, a tiled floor, daylight from tall windows.

### `place-office`

- Kind: backdrop, 1920 × 1080 px
- Shows: A small shared office with a desk by the window and a manila folder on it
- Prompt: Wide interior or street view at eye level, no people, the lower third kept simple and uncluttered. A small shared staff office in an old school building: three mismatched desks, a desk by a tall window with a manila folder, a notebook and a mug on it, shelves of box files, a pinboard, late afternoon light.

### `place-homework-room`

- Kind: backdrop, 1920 × 1080 px
- Shows: A classroom set up for homework club, with tables pushed together and a whiteboard
- Prompt: Wide interior or street view at eye level, no people, the lower third kept simple and uncluttered. A former classroom used for a homework club: tables pushed together in groups, stacked chairs, a whiteboard with faint wiped marks and no writing, pots of pencils, children's coats on hooks.

### `cast-joanna`

- Kind: portrait, 800 × 1000 px
- Shows: Joanna, the director
- Prompt: Head-and-shoulders portrait, three-quarter view, looking just past the viewer, plain flat manila-buff background, even light. A woman in her mid fifties who runs a community learning centre: short grey-streaked dark hair, reading glasses pushed up into it, a slate cardigan over a plain shirt, a lanyard, a tired and amused expression.

### `cast-sam`

- Kind: portrait, 800 × 1000 px
- Shows: Sam, from the front desk
- Prompt: Head-and-shoulders portrait, three-quarter view, looking just past the viewer, plain flat manila-buff background, even light. A cheerful front-desk worker in their late twenties: curly brown hair, a mustard jumper, a bunch of keys on a red lanyard, an open, eager expression.

### `cast-priya`

- Kind: portrait, 800 × 1000 px
- Shows: Priya, the Homework Club coordinator
- Prompt: Head-and-shoulders portrait, three-quarter view, looking just past the viewer, plain flat manila-buff background, even light. A woman in her early thirties who coordinates a homework club: long black hair tied back, a brick-red top, a pencil behind one ear, an earnest and slightly harried expression.
