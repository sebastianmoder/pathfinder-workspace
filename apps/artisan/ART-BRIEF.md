# Art brief

The story shows a picture for each place and each person who speaks. None of them exists yet. Until a file is supplied the game does without it: a place is named in words and a person is shown by their initials.

This file is written from `content/story/art.ts` by `pnpm art:brief`. Change the descriptions there, not here.

## How to add a picture

1. Give an image generator the whole prompt under the slot, exactly as written. Each prompt already contains the shared style and the shared list of things to leave out.
2. Generate at the size given. Check the result against the “must show” and “must not show” lists before keeping it.
3. Save it in `apps/artisan/assets/story/` under the slot's file name (`.png` or `.jpg` in place of `.webp` also works).
4. Run `pnpm art:sync` in `apps/artisan`. The picture is now used wherever its slot appears.

Generate all the people in one sitting, and all the places in another, so each set stays consistent. If the generator allows a reference image, use the first good picture of a set as the reference for the rest.

## The shared style

Hand-painted gouache illustration on textured paper: flat, opaque shapes with visible dry-brush edges and a little paper grain showing through, no outlines, no gradients, no gloss. A restricted palette used in every picture: river slate blue-green (#1f3d47) for shadows and large dark areas, manila buff (#e8cf97), off-white paper (#f3f5f1), brick red (#b3261e) as a small accent, and highlighter yellow (#f2d544) used once at most. Soft, even daylight with simple two-tone shading. The mood is calm, observant and a little wry. The setting is a small present-day European river town; clothes, furniture and technology are ordinary and current, not nostalgic.

## Never, in any picture

- any text, letters, numbers, handwriting or symbols that read as writing (signs, screens, book spines, papers and notices are left blank or shown as plain blocks of tone)
- logos, brand marks, flags, watermarks, signatures, captions, borders or frames
- photorealism, 3D rendering, anime or cartoon exaggeration, glossy digital shading, lens blur or lens flare
- robots, glowing brains, circuit patterns, holograms or any other stock picture of “AI”
- anything frightening, violent or dramatic: no storms, no alarm, no people in distress

## Title screen (1)

Shown beside the title on the opening screen, about 500 pixels wide.

### A manila folder on a desk beside a hand-drawn map of a river town

- File: `assets/story/title.webp`
- Size: 1600 × 1200 pixels
- Subject: The desk at the start of the year, seen from directly above: a manila folder and a map of Riverside.
- Composition: 4:3 frame, a flat top-down view of a slate-blue desk top. The folder lies in the upper left, turned a few degrees, slightly open so the edges of a few papers show. The map lies in the lower right, overlapping the folder's corner. The objects are large and fill the frame, with a little desk showing at the edges. Soft light from the top left gives each object a short, clean shadow.
- Must show:
  - a manila-buff card folder with a tab, the tab blank
  - three or four off-white sheets and two buff index cards showing from the folder, all blank
  - a hand-drawn map on off-white paper: one winding slate-blue river, a single bridge, and simple blocks for a dozen buildings, with no labels
  - a length of brick-red thread running loosely from a pin on the map to the folder
  - a plain notebook with a brick-red cover, closed, and a yellow pencil lying on it
- Must not show (as well as the shared list):
  - hands or people
  - a computer, phone or any screen
  - a coffee-cup ring or other clutter beyond what is listed

Prompt to paste:

```text
STYLE. Hand-painted gouache illustration on textured paper: flat, opaque shapes with visible dry-brush edges and a little paper grain showing through, no outlines, no gradients, no gloss. A restricted palette used in every picture: river slate blue-green (#1f3d47) for shadows and large dark areas, manila buff (#e8cf97), off-white paper (#f3f5f1), brick red (#b3261e) as a small accent, and highlighter yellow (#f2d544) used once at most. Soft, even daylight with simple two-tone shading. The mood is calm, observant and a little wry. The setting is a small present-day European river town; clothes, furniture and technology are ordinary and current, not nostalgic.
SUBJECT. The desk at the start of the year, seen from directly above: a manila folder and a map of Riverside.
COMPOSITION. 4:3 frame, a flat top-down view of a slate-blue desk top. The folder lies in the upper left, turned a few degrees, slightly open so the edges of a few papers show. The map lies in the lower right, overlapping the folder's corner. The objects are large and fill the frame, with a little desk showing at the edges. Soft light from the top left gives each object a short, clean shadow.
MUST SHOW. a manila-buff card folder with a tab, the tab blank; three or four off-white sheets and two buff index cards showing from the folder, all blank; a hand-drawn map on off-white paper: one winding slate-blue river, a single bridge, and simple blocks for a dozen buildings, with no labels; a length of brick-red thread running loosely from a pin on the map to the folder; a plain notebook with a brick-red cover, closed, and a yellow pencil lying on it.
MUST NOT SHOW. hands or people; a computer, phone or any screen; a coffee-cup ring or other clutter beyond what is listed; any text, letters, numbers, handwriting or symbols that read as writing (signs, screens, book spines, papers and notices are left blank or shown as plain blocks of tone); logos, brand marks, flags, watermarks, signatures, captions, borders or frames; photorealism, 3D rendering, anime or cartoon exaggeration, glossy digital shading, lens blur or lens flare; robots, glowing brains, circuit patterns, holograms or any other stock picture of “AI”; anything frightening, violent or dramatic: no storms, no alarm, no people in distress.
```

## Places (8)

Shown at the start of a scene, like a photo sent into the conversation, about 640 pixels wide.

### An old brick school building on a quiet street, with a river and a bridge at the end of it

- File: `assets/story/place-street.webp`
- Size: 1600 × 900 pixels
- Subject: The outside of the Riverside Learning Commons, a two-storey former school of brick-red brick on a quiet street, early on a weekday morning.
- Composition: Wide 16:9 frame, seen at standing eye level from just inside the doorway, as if you have walked in and stopped. The room is empty of people. The main object sits a little off-centre; the foreground is simple floor or desk so the eye goes to the middle of the picture. Everything is in focus. The picture is shown about 640 pixels wide, so shapes must be large and readable, with no fine detail that matters. This one is outdoors: seen from the pavement opposite, slightly to the left of the entrance, so the front of the building fills the right two-thirds of the frame and the street runs away on the left to the river.
- Must show:
  - tall school windows with off-white frames and a wide double door, one leaf standing open
  - a blank rectangular signboard on a post beside the door
  - black iron railings with three bicycles leaning on them
  - at the far end of the street on the left: a strip of slate-blue river and one arch of a low stone bridge
  - long, soft morning shadows and a pale off-white sky
- Must not show (as well as the shared list):
  - people, figures in the distance, silhouettes, or animals
  - cars, buses or road markings
  - shop fronts or advertising

Prompt to paste:

```text
STYLE. Hand-painted gouache illustration on textured paper: flat, opaque shapes with visible dry-brush edges and a little paper grain showing through, no outlines, no gradients, no gloss. A restricted palette used in every picture: river slate blue-green (#1f3d47) for shadows and large dark areas, manila buff (#e8cf97), off-white paper (#f3f5f1), brick red (#b3261e) as a small accent, and highlighter yellow (#f2d544) used once at most. Soft, even daylight with simple two-tone shading. The mood is calm, observant and a little wry. The setting is a small present-day European river town; clothes, furniture and technology are ordinary and current, not nostalgic.
SUBJECT. The outside of the Riverside Learning Commons, a two-storey former school of brick-red brick on a quiet street, early on a weekday morning.
COMPOSITION. Wide 16:9 frame, seen at standing eye level from just inside the doorway, as if you have walked in and stopped. The room is empty of people. The main object sits a little off-centre; the foreground is simple floor or desk so the eye goes to the middle of the picture. Everything is in focus. The picture is shown about 640 pixels wide, so shapes must be large and readable, with no fine detail that matters. This one is outdoors: seen from the pavement opposite, slightly to the left of the entrance, so the front of the building fills the right two-thirds of the frame and the street runs away on the left to the river.
MUST SHOW. tall school windows with off-white frames and a wide double door, one leaf standing open; a blank rectangular signboard on a post beside the door; black iron railings with three bicycles leaning on them; at the far end of the street on the left: a strip of slate-blue river and one arch of a low stone bridge; long, soft morning shadows and a pale off-white sky.
MUST NOT SHOW. people, figures in the distance, silhouettes, or animals; cars, buses or road markings; shop fronts or advertising; any text, letters, numbers, handwriting or symbols that read as writing (signs, screens, book spines, papers and notices are left blank or shown as plain blocks of tone); logos, brand marks, flags, watermarks, signatures, captions, borders or frames; photorealism, 3D rendering, anime or cartoon exaggeration, glossy digital shading, lens blur or lens flare; robots, glowing brains, circuit patterns, holograms or any other stock picture of “AI”; anything frightening, violent or dramatic: no storms, no alarm, no people in distress.
```

### A front desk in a tiled entrance hall, with a noticeboard and leaflet racks

- File: `assets/story/place-front-desk.webp`
- Size: 1600 × 900 pixels
- Subject: The entrance hall of the Commons: the front desk where Sam works, in what was the school's lobby.
- Composition: Wide 16:9 frame, seen at standing eye level from just inside the doorway, as if you have walked in and stopped. The room is empty of people. The main object sits a little off-centre; the foreground is simple floor or desk so the eye goes to the middle of the picture. Everything is in focus. The picture is shown about 640 pixels wide, so shapes must be large and readable, with no fine detail that matters. The desk stands to the right of centre, angled towards the viewer; the wall behind it runs across the frame.
- Must show:
  - a long wooden reception desk with a plain computer monitor seen from the back, a brass bell and a mug
  - a large cork noticeboard on the wall behind, crowded with overlapping blank notices in off-white, buff and one in yellow
  - a wire rack of blank leaflets on the left
  - a floor of slate and off-white chequered tiles
  - daylight from a tall window on the left, falling across the floor
- Must not show (as well as the shared list):
  - people, figures in the distance, silhouettes, or animals
  - a visible computer screen

Prompt to paste:

```text
STYLE. Hand-painted gouache illustration on textured paper: flat, opaque shapes with visible dry-brush edges and a little paper grain showing through, no outlines, no gradients, no gloss. A restricted palette used in every picture: river slate blue-green (#1f3d47) for shadows and large dark areas, manila buff (#e8cf97), off-white paper (#f3f5f1), brick red (#b3261e) as a small accent, and highlighter yellow (#f2d544) used once at most. Soft, even daylight with simple two-tone shading. The mood is calm, observant and a little wry. The setting is a small present-day European river town; clothes, furniture and technology are ordinary and current, not nostalgic.
SUBJECT. The entrance hall of the Commons: the front desk where Sam works, in what was the school's lobby.
COMPOSITION. Wide 16:9 frame, seen at standing eye level from just inside the doorway, as if you have walked in and stopped. The room is empty of people. The main object sits a little off-centre; the foreground is simple floor or desk so the eye goes to the middle of the picture. Everything is in focus. The picture is shown about 640 pixels wide, so shapes must be large and readable, with no fine detail that matters. The desk stands to the right of centre, angled towards the viewer; the wall behind it runs across the frame.
MUST SHOW. a long wooden reception desk with a plain computer monitor seen from the back, a brass bell and a mug; a large cork noticeboard on the wall behind, crowded with overlapping blank notices in off-white, buff and one in yellow; a wire rack of blank leaflets on the left; a floor of slate and off-white chequered tiles; daylight from a tall window on the left, falling across the floor.
MUST NOT SHOW. people, figures in the distance, silhouettes, or animals; a visible computer screen; any text, letters, numbers, handwriting or symbols that read as writing (signs, screens, book spines, papers and notices are left blank or shown as plain blocks of tone); logos, brand marks, flags, watermarks, signatures, captions, borders or frames; photorealism, 3D rendering, anime or cartoon exaggeration, glossy digital shading, lens blur or lens flare; robots, glowing brains, circuit patterns, holograms or any other stock picture of “AI”; anything frightening, violent or dramatic: no storms, no alarm, no people in distress.
```

### A small shared office with a desk by the window and a manila folder on it

- File: `assets/story/place-office.webp`
- Size: 1600 × 900 pixels
- Subject: The shared staff office at the Commons, and in it your desk: the one by the window, with the folder on it.
- Composition: Wide 16:9 frame, seen at standing eye level from just inside the doorway, as if you have walked in and stopped. The room is empty of people. The main object sits a little off-centre; the foreground is simple floor or desk so the eye goes to the middle of the picture. Everything is in focus. The picture is shown about 640 pixels wide, so shapes must be large and readable, with no fine detail that matters. The window is in the back wall, left of centre, with your desk under it; two other desks are partly visible at the right edge.
- Must show:
  - a plain wooden desk under a tall window, with a closed manila folder lying on it, a notebook, a pencil and a mug
  - a wooden chair pushed back from the desk
  - shelves of box files along the right-hand wall, their spines blank
  - a small cork pinboard with a few blank cards and one length of brick-red thread pinned between two of them
  - late-afternoon light through the window, laying a pale rectangle across the desk and the folder
- Must not show (as well as the shared list):
  - people, figures in the distance, silhouettes, or animals
  - a computer screen facing the viewer
  - papers with visible writing

Prompt to paste:

```text
STYLE. Hand-painted gouache illustration on textured paper: flat, opaque shapes with visible dry-brush edges and a little paper grain showing through, no outlines, no gradients, no gloss. A restricted palette used in every picture: river slate blue-green (#1f3d47) for shadows and large dark areas, manila buff (#e8cf97), off-white paper (#f3f5f1), brick red (#b3261e) as a small accent, and highlighter yellow (#f2d544) used once at most. Soft, even daylight with simple two-tone shading. The mood is calm, observant and a little wry. The setting is a small present-day European river town; clothes, furniture and technology are ordinary and current, not nostalgic.
SUBJECT. The shared staff office at the Commons, and in it your desk: the one by the window, with the folder on it.
COMPOSITION. Wide 16:9 frame, seen at standing eye level from just inside the doorway, as if you have walked in and stopped. The room is empty of people. The main object sits a little off-centre; the foreground is simple floor or desk so the eye goes to the middle of the picture. Everything is in focus. The picture is shown about 640 pixels wide, so shapes must be large and readable, with no fine detail that matters. The window is in the back wall, left of centre, with your desk under it; two other desks are partly visible at the right edge.
MUST SHOW. a plain wooden desk under a tall window, with a closed manila folder lying on it, a notebook, a pencil and a mug; a wooden chair pushed back from the desk; shelves of box files along the right-hand wall, their spines blank; a small cork pinboard with a few blank cards and one length of brick-red thread pinned between two of them; late-afternoon light through the window, laying a pale rectangle across the desk and the folder.
MUST NOT SHOW. people, figures in the distance, silhouettes, or animals; a computer screen facing the viewer; papers with visible writing; any text, letters, numbers, handwriting or symbols that read as writing (signs, screens, book spines, papers and notices are left blank or shown as plain blocks of tone); logos, brand marks, flags, watermarks, signatures, captions, borders or frames; photorealism, 3D rendering, anime or cartoon exaggeration, glossy digital shading, lens blur or lens flare; robots, glowing brains, circuit patterns, holograms or any other stock picture of “AI”; anything frightening, violent or dramatic: no storms, no alarm, no people in distress.
```

### A classroom set up for homework club, with tables pushed together and a whiteboard

- File: `assets/story/place-homework-room.webp`
- Size: 1600 × 900 pixels
- Subject: The Homework Club room: a former classroom, set out for a Saturday session before anyone has arrived.
- Composition: Wide 16:9 frame, seen at standing eye level from just inside the doorway, as if you have walked in and stopped. The room is empty of people. The main object sits a little off-centre; the foreground is simple floor or desk so the eye goes to the middle of the picture. Everything is in focus. The picture is shown about 640 pixels wide, so shapes must be large and readable, with no fine detail that matters. Tables fill the middle of the frame; the whiteboard is on the back wall, right of centre.
- Must show:
  - four tables pushed together into two groups, with mismatched chairs
  - pots of pencils and a stack of blank worksheets on the nearest table
  - a whiteboard wiped not quite clean, with faint grey smears and nothing legible
  - a row of coat hooks by the door on the left with two small coats and a rucksack
  - a large window on the right with morning light
- Must not show (as well as the shared list):
  - people, figures in the distance, silhouettes, or animals

Prompt to paste:

```text
STYLE. Hand-painted gouache illustration on textured paper: flat, opaque shapes with visible dry-brush edges and a little paper grain showing through, no outlines, no gradients, no gloss. A restricted palette used in every picture: river slate blue-green (#1f3d47) for shadows and large dark areas, manila buff (#e8cf97), off-white paper (#f3f5f1), brick red (#b3261e) as a small accent, and highlighter yellow (#f2d544) used once at most. Soft, even daylight with simple two-tone shading. The mood is calm, observant and a little wry. The setting is a small present-day European river town; clothes, furniture and technology are ordinary and current, not nostalgic.
SUBJECT. The Homework Club room: a former classroom, set out for a Saturday session before anyone has arrived.
COMPOSITION. Wide 16:9 frame, seen at standing eye level from just inside the doorway, as if you have walked in and stopped. The room is empty of people. The main object sits a little off-centre; the foreground is simple floor or desk so the eye goes to the middle of the picture. Everything is in focus. The picture is shown about 640 pixels wide, so shapes must be large and readable, with no fine detail that matters. Tables fill the middle of the frame; the whiteboard is on the back wall, right of centre.
MUST SHOW. four tables pushed together into two groups, with mismatched chairs; pots of pencils and a stack of blank worksheets on the nearest table; a whiteboard wiped not quite clean, with faint grey smears and nothing legible; a row of coat hooks by the door on the left with two small coats and a rucksack; a large window on the right with morning light.
MUST NOT SHOW. people, figures in the distance, silhouettes, or animals; any text, letters, numbers, handwriting or symbols that read as writing (signs, screens, book spines, papers and notices are left blank or shown as plain blocks of tone); logos, brand marks, flags, watermarks, signatures, captions, borders or frames; photorealism, 3D rendering, anime or cartoon exaggeration, glossy digital shading, lens blur or lens flare; robots, glowing brains, circuit patterns, holograms or any other stock picture of “AI”; anything frightening, violent or dramatic: no storms, no alarm, no people in distress.
```

### A meeting room with a long table, a jug of water and a stack of papers at each place

- File: `assets/story/place-board-room.webp`
- Size: 1600 × 900 pixels
- Subject: The board room at the Commons, laid for a meeting of the trustees.
- Composition: Wide 16:9 frame, seen at standing eye level from just inside the doorway, as if you have walked in and stopped. The room is empty of people. The main object sits a little off-centre; the foreground is simple floor or desk so the eye goes to the middle of the picture. Everything is in focus. The picture is shown about 640 pixels wide, so shapes must be large and readable, with no fine detail that matters. The long table runs from the near left to the far right, so its length leads into the picture.
- Must show:
  - a long dark wooden table with eight chairs
  - at each place a neat stack of blank papers; in the middle a glass jug of water and glasses
  - on the back wall a large framed old photograph of the school building, shown only as soft shapes
  - a projector screen pulled half-way down in the far corner, blank
  - evening light: the window on the left is dusk-blue and a ceiling lamp throws a warm buff pool on the table
- Must not show (as well as the shared list):
  - people, figures in the distance, silhouettes, or animals

Prompt to paste:

```text
STYLE. Hand-painted gouache illustration on textured paper: flat, opaque shapes with visible dry-brush edges and a little paper grain showing through, no outlines, no gradients, no gloss. A restricted palette used in every picture: river slate blue-green (#1f3d47) for shadows and large dark areas, manila buff (#e8cf97), off-white paper (#f3f5f1), brick red (#b3261e) as a small accent, and highlighter yellow (#f2d544) used once at most. Soft, even daylight with simple two-tone shading. The mood is calm, observant and a little wry. The setting is a small present-day European river town; clothes, furniture and technology are ordinary and current, not nostalgic.
SUBJECT. The board room at the Commons, laid for a meeting of the trustees.
COMPOSITION. Wide 16:9 frame, seen at standing eye level from just inside the doorway, as if you have walked in and stopped. The room is empty of people. The main object sits a little off-centre; the foreground is simple floor or desk so the eye goes to the middle of the picture. Everything is in focus. The picture is shown about 640 pixels wide, so shapes must be large and readable, with no fine detail that matters. The long table runs from the near left to the far right, so its length leads into the picture.
MUST SHOW. a long dark wooden table with eight chairs; at each place a neat stack of blank papers; in the middle a glass jug of water and glasses; on the back wall a large framed old photograph of the school building, shown only as soft shapes; a projector screen pulled half-way down in the far corner, blank; evening light: the window on the left is dusk-blue and a ceiling lamp throws a warm buff pool on the table.
MUST NOT SHOW. people, figures in the distance, silhouettes, or animals; any text, letters, numbers, handwriting or symbols that read as writing (signs, screens, book spines, papers and notices are left blank or shown as plain blocks of tone); logos, brand marks, flags, watermarks, signatures, captions, borders or frames; photorealism, 3D rendering, anime or cartoon exaggeration, glossy digital shading, lens blur or lens flare; robots, glowing brains, circuit patterns, holograms or any other stock picture of “AI”; anything frightening, violent or dramatic: no storms, no alarm, no people in distress.
```

### A workroom with a large table of paper, scissors and a poster on the wall

- File: `assets/story/place-studio.webp`
- Size: 1600 × 900 pixels
- Subject: The studio at the Commons, where the newsletter and the posters are put together.
- Composition: Wide 16:9 frame, seen at standing eye level from just inside the doorway, as if you have walked in and stopped. The room is empty of people. The main object sits a little off-centre; the foreground is simple floor or desk so the eye goes to the middle of the picture. Everything is in focus. The picture is shown about 640 pixels wide, so shapes must be large and readable, with no fine detail that matters. A large work table fills the lower middle of the frame, seen slightly from above; the wall behind holds the pinned-up work.
- Must show:
  - a big table covered with sheets of coloured paper in the palette's colours, a cutting mat, scissors, a steel ruler and a glue stick
  - a poster-sized sheet pinned to the wall, showing only large blocks of colour where its picture and words would be
  - a row of printed pages clipped to a string across the wall, all blank
  - a laptop, closed, at one corner of the table
  - bright, even midday light
- Must not show (as well as the shared list):
  - people, figures in the distance, silhouettes, or animals

Prompt to paste:

```text
STYLE. Hand-painted gouache illustration on textured paper: flat, opaque shapes with visible dry-brush edges and a little paper grain showing through, no outlines, no gradients, no gloss. A restricted palette used in every picture: river slate blue-green (#1f3d47) for shadows and large dark areas, manila buff (#e8cf97), off-white paper (#f3f5f1), brick red (#b3261e) as a small accent, and highlighter yellow (#f2d544) used once at most. Soft, even daylight with simple two-tone shading. The mood is calm, observant and a little wry. The setting is a small present-day European river town; clothes, furniture and technology are ordinary and current, not nostalgic.
SUBJECT. The studio at the Commons, where the newsletter and the posters are put together.
COMPOSITION. Wide 16:9 frame, seen at standing eye level from just inside the doorway, as if you have walked in and stopped. The room is empty of people. The main object sits a little off-centre; the foreground is simple floor or desk so the eye goes to the middle of the picture. Everything is in focus. The picture is shown about 640 pixels wide, so shapes must be large and readable, with no fine detail that matters. A large work table fills the lower middle of the frame, seen slightly from above; the wall behind holds the pinned-up work.
MUST SHOW. a big table covered with sheets of coloured paper in the palette's colours, a cutting mat, scissors, a steel ruler and a glue stick; a poster-sized sheet pinned to the wall, showing only large blocks of colour where its picture and words would be; a row of printed pages clipped to a string across the wall, all blank; a laptop, closed, at one corner of the table; bright, even midday light.
MUST NOT SHOW. people, figures in the distance, silhouettes, or animals; any text, letters, numbers, handwriting or symbols that read as writing (signs, screens, book spines, papers and notices are left blank or shown as plain blocks of tone); logos, brand marks, flags, watermarks, signatures, captions, borders or frames; photorealism, 3D rendering, anime or cartoon exaggeration, glossy digital shading, lens blur or lens flare; robots, glowing brains, circuit patterns, holograms or any other stock picture of “AI”; anything frightening, violent or dramatic: no storms, no alarm, no people in distress.
```

### A small newsroom: one long desk, stacks of newspapers and a window onto the bridge

- File: `assets/story/place-gazette.webp`
- Size: 1600 × 900 pixels
- Subject: The newsroom of the Riverside Gazette, the town's weekly paper: one long shared desk and a window that looks out on Riverside Bridge.
- Composition: Wide 16:9 frame, seen at standing eye level from just inside the doorway, as if you have walked in and stopped. The room is empty of people. The main object sits a little off-centre; the foreground is simple floor or desk so the eye goes to the middle of the picture. Everything is in focus. The picture is shown about 640 pixels wide, so shapes must be large and readable, with no fine detail that matters. The window is the brightest thing in the picture, in the back wall, right of centre; the desk runs under it across the frame.
- Must show:
  - one long desk with three plain monitors seen from behind or at an angle, keyboards, and stacks of folded newspapers shown as blank grey-and-white blocks
  - through the window: the low stone bridge and the river at its normal level, calm, under an ordinary pale sky
  - a wall clock with plain marks instead of numerals
  - a desk lamp with a brick-red shade
  - cool morning light
- Must not show (as well as the shared list):
  - people, figures in the distance, silhouettes, or animals
  - flood water, rain or anything suggesting an emergency
  - readable headlines or front pages

Prompt to paste:

```text
STYLE. Hand-painted gouache illustration on textured paper: flat, opaque shapes with visible dry-brush edges and a little paper grain showing through, no outlines, no gradients, no gloss. A restricted palette used in every picture: river slate blue-green (#1f3d47) for shadows and large dark areas, manila buff (#e8cf97), off-white paper (#f3f5f1), brick red (#b3261e) as a small accent, and highlighter yellow (#f2d544) used once at most. Soft, even daylight with simple two-tone shading. The mood is calm, observant and a little wry. The setting is a small present-day European river town; clothes, furniture and technology are ordinary and current, not nostalgic.
SUBJECT. The newsroom of the Riverside Gazette, the town's weekly paper: one long shared desk and a window that looks out on Riverside Bridge.
COMPOSITION. Wide 16:9 frame, seen at standing eye level from just inside the doorway, as if you have walked in and stopped. The room is empty of people. The main object sits a little off-centre; the foreground is simple floor or desk so the eye goes to the middle of the picture. Everything is in focus. The picture is shown about 640 pixels wide, so shapes must be large and readable, with no fine detail that matters. The window is the brightest thing in the picture, in the back wall, right of centre; the desk runs under it across the frame.
MUST SHOW. one long desk with three plain monitors seen from behind or at an angle, keyboards, and stacks of folded newspapers shown as blank grey-and-white blocks; through the window: the low stone bridge and the river at its normal level, calm, under an ordinary pale sky; a wall clock with plain marks instead of numerals; a desk lamp with a brick-red shade; cool morning light.
MUST NOT SHOW. people, figures in the distance, silhouettes, or animals; flood water, rain or anything suggesting an emergency; readable headlines or front pages; any text, letters, numbers, handwriting or symbols that read as writing (signs, screens, book spines, papers and notices are left blank or shown as plain blocks of tone); logos, brand marks, flags, watermarks, signatures, captions, borders or frames; photorealism, 3D rendering, anime or cartoon exaggeration, glossy digital shading, lens blur or lens flare; robots, glowing brains, circuit patterns, holograms or any other stock picture of “AI”; anything frightening, violent or dramatic: no storms, no alarm, no people in distress.
```

### A council chamber with a horseshoe of desks and tall windows

- File: `assets/story/place-town-hall.webp`
- Size: 1600 × 900 pixels
- Subject: The council chamber in Riverside's town hall, where the citizens' panel and the commission meet.
- Composition: Wide 16:9 frame, seen at standing eye level from just inside the doorway, as if you have walked in and stopped. The room is empty of people. The main object sits a little off-centre; the foreground is simple floor or desk so the eye goes to the middle of the picture. Everything is in focus. The picture is shown about 640 pixels wide, so shapes must be large and readable, with no fine detail that matters. Seen from the public end of the room, looking towards the chair's seat, which is centred at the far end under the windows.
- Must show:
  - a horseshoe of dark wooden desks with a microphone stalk and a glass of water at each seat
  - a slightly raised chair's desk at the far end
  - three tall arched windows behind it with pale daylight
  - a public bench in the near foreground, seen from behind, empty
  - a plain coloured banner hanging between the windows, a single block of slate-blue with no emblem
- Must not show (as well as the shared list):
  - people, figures in the distance, silhouettes, or animals
  - coats of arms, crests, flags or portraits of real people

Prompt to paste:

```text
STYLE. Hand-painted gouache illustration on textured paper: flat, opaque shapes with visible dry-brush edges and a little paper grain showing through, no outlines, no gradients, no gloss. A restricted palette used in every picture: river slate blue-green (#1f3d47) for shadows and large dark areas, manila buff (#e8cf97), off-white paper (#f3f5f1), brick red (#b3261e) as a small accent, and highlighter yellow (#f2d544) used once at most. Soft, even daylight with simple two-tone shading. The mood is calm, observant and a little wry. The setting is a small present-day European river town; clothes, furniture and technology are ordinary and current, not nostalgic.
SUBJECT. The council chamber in Riverside's town hall, where the citizens' panel and the commission meet.
COMPOSITION. Wide 16:9 frame, seen at standing eye level from just inside the doorway, as if you have walked in and stopped. The room is empty of people. The main object sits a little off-centre; the foreground is simple floor or desk so the eye goes to the middle of the picture. Everything is in focus. The picture is shown about 640 pixels wide, so shapes must be large and readable, with no fine detail that matters. Seen from the public end of the room, looking towards the chair's seat, which is centred at the far end under the windows.
MUST SHOW. a horseshoe of dark wooden desks with a microphone stalk and a glass of water at each seat; a slightly raised chair's desk at the far end; three tall arched windows behind it with pale daylight; a public bench in the near foreground, seen from behind, empty; a plain coloured banner hanging between the windows, a single block of slate-blue with no emblem.
MUST NOT SHOW. people, figures in the distance, silhouettes, or animals; coats of arms, crests, flags or portraits of real people; any text, letters, numbers, handwriting or symbols that read as writing (signs, screens, book spines, papers and notices are left blank or shown as plain blocks of tone); logos, brand marks, flags, watermarks, signatures, captions, borders or frames; photorealism, 3D rendering, anime or cartoon exaggeration, glossy digital shading, lens blur or lens flare; robots, glowing brains, circuit patterns, holograms or any other stock picture of “AI”; anything frightening, violent or dramatic: no storms, no alarm, no people in distress.
```

## People (12)

Shown as a small round avatar beside what the person says, so only the middle of the square is seen.

### Joanna, the director

- File: `assets/story/cast-joanna.webp`
- Size: 1024 × 1024 pixels
- Subject: Joanna, who runs the Riverside Learning Commons: a woman in her mid fifties, capable and stretched thin, who finds things funny when she is tired.
- Composition: Square frame. One person only, head and shoulders, facing three-quarters towards the viewer's left or right and looking just past the viewer, not into the lens. The head is centred and fills about 60% of the height, with clear space all round it, because the picture is shown cropped to a small circle: nothing important may sit in the corners. Plain, flat manila-buff background with no objects, no room and no shadow on it. Even light from the front-left.
- Must show:
  - short dark hair streaked with grey, a little untidy
  - reading glasses pushed up into her hair
  - a slate-blue cardigan over a plain off-white shirt
  - a plain lanyard ribbon round her neck, its card out of frame
  - a tired, amused half-smile and one raised eyebrow
- Must not show (as well as the shared list):
  - hands, props held up to the face, or anything crossing in front of the face
  - a second person, even partly
  - any background other than the flat buff colour

Prompt to paste:

```text
STYLE. Hand-painted gouache illustration on textured paper: flat, opaque shapes with visible dry-brush edges and a little paper grain showing through, no outlines, no gradients, no gloss. A restricted palette used in every picture: river slate blue-green (#1f3d47) for shadows and large dark areas, manila buff (#e8cf97), off-white paper (#f3f5f1), brick red (#b3261e) as a small accent, and highlighter yellow (#f2d544) used once at most. Soft, even daylight with simple two-tone shading. The mood is calm, observant and a little wry. The setting is a small present-day European river town; clothes, furniture and technology are ordinary and current, not nostalgic.
SUBJECT. Joanna, who runs the Riverside Learning Commons: a woman in her mid fifties, capable and stretched thin, who finds things funny when she is tired.
COMPOSITION. Square frame. One person only, head and shoulders, facing three-quarters towards the viewer's left or right and looking just past the viewer, not into the lens. The head is centred and fills about 60% of the height, with clear space all round it, because the picture is shown cropped to a small circle: nothing important may sit in the corners. Plain, flat manila-buff background with no objects, no room and no shadow on it. Even light from the front-left.
MUST SHOW. short dark hair streaked with grey, a little untidy; reading glasses pushed up into her hair; a slate-blue cardigan over a plain off-white shirt; a plain lanyard ribbon round her neck, its card out of frame; a tired, amused half-smile and one raised eyebrow.
MUST NOT SHOW. hands, props held up to the face, or anything crossing in front of the face; a second person, even partly; any background other than the flat buff colour; any text, letters, numbers, handwriting or symbols that read as writing (signs, screens, book spines, papers and notices are left blank or shown as plain blocks of tone); logos, brand marks, flags, watermarks, signatures, captions, borders or frames; photorealism, 3D rendering, anime or cartoon exaggeration, glossy digital shading, lens blur or lens flare; robots, glowing brains, circuit patterns, holograms or any other stock picture of “AI”; anything frightening, violent or dramatic: no storms, no alarm, no people in distress.
```

### Sam, from the front desk

- File: `assets/story/cast-sam.webp`
- Size: 1024 × 1024 pixels
- Subject: Sam, who staffs the front desk: in their late twenties, quick, friendly and inclined to believe good news.
- Composition: Square frame. One person only, head and shoulders, facing three-quarters towards the viewer's left or right and looking just past the viewer, not into the lens. The head is centred and fills about 60% of the height, with clear space all round it, because the picture is shown cropped to a small circle: nothing important may sit in the corners. Plain, flat manila-buff background with no objects, no room and no shadow on it. Even light from the front-left.
- Must show:
  - curly mid-brown hair
  - a mustard-yellow knitted jumper (this is the one picture that uses the highlighter yellow)
  - a brick-red lanyard ribbon round the neck, with the top of a bunch of keys just visible at the bottom edge
  - an open, eager expression, mid-way to saying something
- Must not show (as well as the shared list):
  - hands, props held up to the face, or anything crossing in front of the face
  - a second person, even partly
  - any background other than the flat buff colour

Prompt to paste:

```text
STYLE. Hand-painted gouache illustration on textured paper: flat, opaque shapes with visible dry-brush edges and a little paper grain showing through, no outlines, no gradients, no gloss. A restricted palette used in every picture: river slate blue-green (#1f3d47) for shadows and large dark areas, manila buff (#e8cf97), off-white paper (#f3f5f1), brick red (#b3261e) as a small accent, and highlighter yellow (#f2d544) used once at most. Soft, even daylight with simple two-tone shading. The mood is calm, observant and a little wry. The setting is a small present-day European river town; clothes, furniture and technology are ordinary and current, not nostalgic.
SUBJECT. Sam, who staffs the front desk: in their late twenties, quick, friendly and inclined to believe good news.
COMPOSITION. Square frame. One person only, head and shoulders, facing three-quarters towards the viewer's left or right and looking just past the viewer, not into the lens. The head is centred and fills about 60% of the height, with clear space all round it, because the picture is shown cropped to a small circle: nothing important may sit in the corners. Plain, flat manila-buff background with no objects, no room and no shadow on it. Even light from the front-left.
MUST SHOW. curly mid-brown hair; a mustard-yellow knitted jumper (this is the one picture that uses the highlighter yellow); a brick-red lanyard ribbon round the neck, with the top of a bunch of keys just visible at the bottom edge; an open, eager expression, mid-way to saying something.
MUST NOT SHOW. hands, props held up to the face, or anything crossing in front of the face; a second person, even partly; any background other than the flat buff colour; any text, letters, numbers, handwriting or symbols that read as writing (signs, screens, book spines, papers and notices are left blank or shown as plain blocks of tone); logos, brand marks, flags, watermarks, signatures, captions, borders or frames; photorealism, 3D rendering, anime or cartoon exaggeration, glossy digital shading, lens blur or lens flare; robots, glowing brains, circuit patterns, holograms or any other stock picture of “AI”; anything frightening, violent or dramatic: no storms, no alarm, no people in distress.
```

### Priya, the Homework Club coordinator

- File: `assets/story/cast-priya.webp`
- Size: 1024 × 1024 pixels
- Subject: Priya, who coordinates Homework Club: a woman in her early thirties, earnest, energetic and always slightly behind.
- Composition: Square frame. One person only, head and shoulders, facing three-quarters towards the viewer's left or right and looking just past the viewer, not into the lens. The head is centred and fills about 60% of the height, with clear space all round it, because the picture is shown cropped to a small circle: nothing important may sit in the corners. Plain, flat manila-buff background with no objects, no room and no shadow on it. Even light from the front-left.
- Must show:
  - long black hair tied back loosely, a few strands escaping
  - a brick-red top
  - a pencil tucked behind one ear
  - a bright, slightly harried expression, eyebrows up
- Must not show (as well as the shared list):
  - hands, props held up to the face, or anything crossing in front of the face
  - a second person, even partly
  - any background other than the flat buff colour

Prompt to paste:

```text
STYLE. Hand-painted gouache illustration on textured paper: flat, opaque shapes with visible dry-brush edges and a little paper grain showing through, no outlines, no gradients, no gloss. A restricted palette used in every picture: river slate blue-green (#1f3d47) for shadows and large dark areas, manila buff (#e8cf97), off-white paper (#f3f5f1), brick red (#b3261e) as a small accent, and highlighter yellow (#f2d544) used once at most. Soft, even daylight with simple two-tone shading. The mood is calm, observant and a little wry. The setting is a small present-day European river town; clothes, furniture and technology are ordinary and current, not nostalgic.
SUBJECT. Priya, who coordinates Homework Club: a woman in her early thirties, earnest, energetic and always slightly behind.
COMPOSITION. Square frame. One person only, head and shoulders, facing three-quarters towards the viewer's left or right and looking just past the viewer, not into the lens. The head is centred and fills about 60% of the height, with clear space all round it, because the picture is shown cropped to a small circle: nothing important may sit in the corners. Plain, flat manila-buff background with no objects, no room and no shadow on it. Even light from the front-left.
MUST SHOW. long black hair tied back loosely, a few strands escaping; a brick-red top; a pencil tucked behind one ear; a bright, slightly harried expression, eyebrows up.
MUST NOT SHOW. hands, props held up to the face, or anything crossing in front of the face; a second person, even partly; any background other than the flat buff colour; any text, letters, numbers, handwriting or symbols that read as writing (signs, screens, book spines, papers and notices are left blank or shown as plain blocks of tone); logos, brand marks, flags, watermarks, signatures, captions, borders or frames; photorealism, 3D rendering, anime or cartoon exaggeration, glossy digital shading, lens blur or lens flare; robots, glowing brains, circuit patterns, holograms or any other stock picture of “AI”; anything frightening, violent or dramatic: no storms, no alarm, no people in distress.
```

### Dev, a newsletter volunteer

- File: `assets/story/cast-dev.webp`
- Size: 1024 × 1024 pixels
- Subject: Dev, a volunteer who puts the newsletter together: a man in his early twenties, enthusiastic and pleased with his draft.
- Composition: Square frame. One person only, head and shoulders, facing three-quarters towards the viewer's left or right and looking just past the viewer, not into the lens. The head is centred and fills about 60% of the height, with clear space all round it, because the picture is shown cropped to a small circle: nothing important may sit in the corners. Plain, flat manila-buff background with no objects, no room and no shadow on it. Even light from the front-left.
- Must show:
  - short black hair and a short neat beard
  - round glasses
  - an off-white T-shirt under an open slate-blue overshirt
  - a confident, cheerful grin
- Must not show (as well as the shared list):
  - hands, props held up to the face, or anything crossing in front of the face
  - a second person, even partly
  - any background other than the flat buff colour

Prompt to paste:

```text
STYLE. Hand-painted gouache illustration on textured paper: flat, opaque shapes with visible dry-brush edges and a little paper grain showing through, no outlines, no gradients, no gloss. A restricted palette used in every picture: river slate blue-green (#1f3d47) for shadows and large dark areas, manila buff (#e8cf97), off-white paper (#f3f5f1), brick red (#b3261e) as a small accent, and highlighter yellow (#f2d544) used once at most. Soft, even daylight with simple two-tone shading. The mood is calm, observant and a little wry. The setting is a small present-day European river town; clothes, furniture and technology are ordinary and current, not nostalgic.
SUBJECT. Dev, a volunteer who puts the newsletter together: a man in his early twenties, enthusiastic and pleased with his draft.
COMPOSITION. Square frame. One person only, head and shoulders, facing three-quarters towards the viewer's left or right and looking just past the viewer, not into the lens. The head is centred and fills about 60% of the height, with clear space all round it, because the picture is shown cropped to a small circle: nothing important may sit in the corners. Plain, flat manila-buff background with no objects, no room and no shadow on it. Even light from the front-left.
MUST SHOW. short black hair and a short neat beard; round glasses; an off-white T-shirt under an open slate-blue overshirt; a confident, cheerful grin.
MUST NOT SHOW. hands, props held up to the face, or anything crossing in front of the face; a second person, even partly; any background other than the flat buff colour; any text, letters, numbers, handwriting or symbols that read as writing (signs, screens, book spines, papers and notices are left blank or shown as plain blocks of tone); logos, brand marks, flags, watermarks, signatures, captions, borders or frames; photorealism, 3D rendering, anime or cartoon exaggeration, glossy digital shading, lens blur or lens flare; robots, glowing brains, circuit patterns, holograms or any other stock picture of “AI”; anything frightening, violent or dramatic: no storms, no alarm, no people in distress.
```

### Nadia, from the Commons board

- File: `assets/story/cast-nadia.webp`
- Size: 1024 × 1024 pixels
- Subject: Nadia, a member of the Commons board who reads the papers properly: a woman in her forties, precise, dry and fair.
- Composition: Square frame. One person only, head and shoulders, facing three-quarters towards the viewer's left or right and looking just past the viewer, not into the lens. The head is centred and fills about 60% of the height, with clear space all round it, because the picture is shown cropped to a small circle: nothing important may sit in the corners. Plain, flat manila-buff background with no objects, no room and no shadow on it. Even light from the front-left.
- Must show:
  - a slate-blue headscarf, neatly wrapped
  - a manila-buff blazer over a dark top
  - a level, attentive look and the faintest sceptical smile
- Must not show (as well as the shared list):
  - hands, props held up to the face, or anything crossing in front of the face
  - a second person, even partly
  - any background other than the flat buff colour

Prompt to paste:

```text
STYLE. Hand-painted gouache illustration on textured paper: flat, opaque shapes with visible dry-brush edges and a little paper grain showing through, no outlines, no gradients, no gloss. A restricted palette used in every picture: river slate blue-green (#1f3d47) for shadows and large dark areas, manila buff (#e8cf97), off-white paper (#f3f5f1), brick red (#b3261e) as a small accent, and highlighter yellow (#f2d544) used once at most. Soft, even daylight with simple two-tone shading. The mood is calm, observant and a little wry. The setting is a small present-day European river town; clothes, furniture and technology are ordinary and current, not nostalgic.
SUBJECT. Nadia, a member of the Commons board who reads the papers properly: a woman in her forties, precise, dry and fair.
COMPOSITION. Square frame. One person only, head and shoulders, facing three-quarters towards the viewer's left or right and looking just past the viewer, not into the lens. The head is centred and fills about 60% of the height, with clear space all round it, because the picture is shown cropped to a small circle: nothing important may sit in the corners. Plain, flat manila-buff background with no objects, no room and no shadow on it. Even light from the front-left.
MUST SHOW. a slate-blue headscarf, neatly wrapped; a manila-buff blazer over a dark top; a level, attentive look and the faintest sceptical smile.
MUST NOT SHOW. hands, props held up to the face, or anything crossing in front of the face; a second person, even partly; any background other than the flat buff colour; any text, letters, numbers, handwriting or symbols that read as writing (signs, screens, book spines, papers and notices are left blank or shown as plain blocks of tone); logos, brand marks, flags, watermarks, signatures, captions, borders or frames; photorealism, 3D rendering, anime or cartoon exaggeration, glossy digital shading, lens blur or lens flare; robots, glowing brains, circuit patterns, holograms or any other stock picture of “AI”; anything frightening, violent or dramatic: no storms, no alarm, no people in distress.
```

### Rafael, from the Commons board

- File: `assets/story/cast-rafael.webp`
- Size: 1024 × 1024 pixels
- Subject: Rafael, a board member who argues the other side on principle: a man in his sixties, courteous and stubborn.
- Composition: Square frame. One person only, head and shoulders, facing three-quarters towards the viewer's left or right and looking just past the viewer, not into the lens. The head is centred and fills about 60% of the height, with clear space all round it, because the picture is shown cropped to a small circle: nothing important may sit in the corners. Plain, flat manila-buff background with no objects, no room and no shadow on it. Even light from the front-left.
- Must show:
  - thinning grey hair and a trimmed grey moustache
  - a dark slate jacket over a buff shirt, no tie
  - chin slightly lifted, eyebrows drawn together, as if about to object
- Must not show (as well as the shared list):
  - hands, props held up to the face, or anything crossing in front of the face
  - a second person, even partly
  - any background other than the flat buff colour

Prompt to paste:

```text
STYLE. Hand-painted gouache illustration on textured paper: flat, opaque shapes with visible dry-brush edges and a little paper grain showing through, no outlines, no gradients, no gloss. A restricted palette used in every picture: river slate blue-green (#1f3d47) for shadows and large dark areas, manila buff (#e8cf97), off-white paper (#f3f5f1), brick red (#b3261e) as a small accent, and highlighter yellow (#f2d544) used once at most. Soft, even daylight with simple two-tone shading. The mood is calm, observant and a little wry. The setting is a small present-day European river town; clothes, furniture and technology are ordinary and current, not nostalgic.
SUBJECT. Rafael, a board member who argues the other side on principle: a man in his sixties, courteous and stubborn.
COMPOSITION. Square frame. One person only, head and shoulders, facing three-quarters towards the viewer's left or right and looking just past the viewer, not into the lens. The head is centred and fills about 60% of the height, with clear space all round it, because the picture is shown cropped to a small circle: nothing important may sit in the corners. Plain, flat manila-buff background with no objects, no room and no shadow on it. Even light from the front-left.
MUST SHOW. thinning grey hair and a trimmed grey moustache; a dark slate jacket over a buff shirt, no tie; chin slightly lifted, eyebrows drawn together, as if about to object.
MUST NOT SHOW. hands, props held up to the face, or anything crossing in front of the face; a second person, even partly; any background other than the flat buff colour; any text, letters, numbers, handwriting or symbols that read as writing (signs, screens, book spines, papers and notices are left blank or shown as plain blocks of tone); logos, brand marks, flags, watermarks, signatures, captions, borders or frames; photorealism, 3D rendering, anime or cartoon exaggeration, glossy digital shading, lens blur or lens flare; robots, glowing brains, circuit patterns, holograms or any other stock picture of “AI”; anything frightening, violent or dramatic: no storms, no alarm, no people in distress.
```

### Leo, a Homework Club learner

- File: `assets/story/cast-leo.webp`
- Size: 1024 × 1024 pixels
- Subject: Leo, aged 14, who comes to Homework Club: a teenage boy, bright, impatient and a bit defensive about his homework.
- Composition: Square frame. One person only, head and shoulders, facing three-quarters towards the viewer's left or right and looking just past the viewer, not into the lens. The head is centred and fills about 60% of the height, with clear space all round it, because the picture is shown cropped to a small circle: nothing important may sit in the corners. Plain, flat manila-buff background with no objects, no room and no shadow on it. Even light from the front-left.
- Must show:
  - short dark hair, slightly messy at the front
  - a plain slate-blue hooded sweatshirt
  - one strap of a rucksack over a shoulder, at the very edge of the frame
  - a wary sideways look with a hint of a smirk
- Must not show (as well as the shared list):
  - hands, props held up to the face, or anything crossing in front of the face
  - a second person, even partly
  - any background other than the flat buff colour
  - anything that makes him look younger than a teenager or older than 15

Prompt to paste:

```text
STYLE. Hand-painted gouache illustration on textured paper: flat, opaque shapes with visible dry-brush edges and a little paper grain showing through, no outlines, no gradients, no gloss. A restricted palette used in every picture: river slate blue-green (#1f3d47) for shadows and large dark areas, manila buff (#e8cf97), off-white paper (#f3f5f1), brick red (#b3261e) as a small accent, and highlighter yellow (#f2d544) used once at most. Soft, even daylight with simple two-tone shading. The mood is calm, observant and a little wry. The setting is a small present-day European river town; clothes, furniture and technology are ordinary and current, not nostalgic.
SUBJECT. Leo, aged 14, who comes to Homework Club: a teenage boy, bright, impatient and a bit defensive about his homework.
COMPOSITION. Square frame. One person only, head and shoulders, facing three-quarters towards the viewer's left or right and looking just past the viewer, not into the lens. The head is centred and fills about 60% of the height, with clear space all round it, because the picture is shown cropped to a small circle: nothing important may sit in the corners. Plain, flat manila-buff background with no objects, no room and no shadow on it. Even light from the front-left.
MUST SHOW. short dark hair, slightly messy at the front; a plain slate-blue hooded sweatshirt; one strap of a rucksack over a shoulder, at the very edge of the frame; a wary sideways look with a hint of a smirk.
MUST NOT SHOW. hands, props held up to the face, or anything crossing in front of the face; a second person, even partly; any background other than the flat buff colour; anything that makes him look younger than a teenager or older than 15; any text, letters, numbers, handwriting or symbols that read as writing (signs, screens, book spines, papers and notices are left blank or shown as plain blocks of tone); logos, brand marks, flags, watermarks, signatures, captions, borders or frames; photorealism, 3D rendering, anime or cartoon exaggeration, glossy digital shading, lens blur or lens flare; robots, glowing brains, circuit patterns, holograms or any other stock picture of “AI”; anything frightening, violent or dramatic: no storms, no alarm, no people in distress.
```

### Rosa, editor of the Riverside Gazette

- File: `assets/story/cast-rosa.webp`
- Size: 1024 × 1024 pixels
- Subject: Rosa, the editor of the local newspaper: a woman in her late forties, brisk, sharp and short of time.
- Composition: Square frame. One person only, head and shoulders, facing three-quarters towards the viewer's left or right and looking just past the viewer, not into the lens. The head is centred and fills about 60% of the height, with clear space all round it, because the picture is shown cropped to a small circle: nothing important may sit in the corners. Plain, flat manila-buff background with no objects, no room and no shadow on it. Even light from the front-left.
- Must show:
  - greying dark hair cut in a blunt bob
  - a brick-red scarf at the neck of a dark slate shirt with the sleeves pushed up
  - reading glasses hanging on a cord round her neck
  - a direct, impatient look, mouth set
- Must not show (as well as the shared list):
  - hands, props held up to the face, or anything crossing in front of the face
  - a second person, even partly
  - any background other than the flat buff colour

Prompt to paste:

```text
STYLE. Hand-painted gouache illustration on textured paper: flat, opaque shapes with visible dry-brush edges and a little paper grain showing through, no outlines, no gradients, no gloss. A restricted palette used in every picture: river slate blue-green (#1f3d47) for shadows and large dark areas, manila buff (#e8cf97), off-white paper (#f3f5f1), brick red (#b3261e) as a small accent, and highlighter yellow (#f2d544) used once at most. Soft, even daylight with simple two-tone shading. The mood is calm, observant and a little wry. The setting is a small present-day European river town; clothes, furniture and technology are ordinary and current, not nostalgic.
SUBJECT. Rosa, the editor of the local newspaper: a woman in her late forties, brisk, sharp and short of time.
COMPOSITION. Square frame. One person only, head and shoulders, facing three-quarters towards the viewer's left or right and looking just past the viewer, not into the lens. The head is centred and fills about 60% of the height, with clear space all round it, because the picture is shown cropped to a small circle: nothing important may sit in the corners. Plain, flat manila-buff background with no objects, no room and no shadow on it. Even light from the front-left.
MUST SHOW. greying dark hair cut in a blunt bob; a brick-red scarf at the neck of a dark slate shirt with the sleeves pushed up; reading glasses hanging on a cord round her neck; a direct, impatient look, mouth set.
MUST NOT SHOW. hands, props held up to the face, or anything crossing in front of the face; a second person, even partly; any background other than the flat buff colour; any text, letters, numbers, handwriting or symbols that read as writing (signs, screens, book spines, papers and notices are left blank or shown as plain blocks of tone); logos, brand marks, flags, watermarks, signatures, captions, borders or frames; photorealism, 3D rendering, anime or cartoon exaggeration, glossy digital shading, lens blur or lens flare; robots, glowing brains, circuit patterns, holograms or any other stock picture of “AI”; anything frightening, violent or dramatic: no storms, no alarm, no people in distress.
```

### Kwame, an independent auditor

- File: `assets/story/cast-kwame.webp`
- Size: 1024 × 1024 pixels
- Subject: Kwame, an independent auditor brought in to test a screening tool: a man in his forties, calm, exact and hard to hurry.
- Composition: Square frame. One person only, head and shoulders, facing three-quarters towards the viewer's left or right and looking just past the viewer, not into the lens. The head is centred and fills about 60% of the height, with clear space all round it, because the picture is shown cropped to a small circle: nothing important may sit in the corners. Plain, flat manila-buff background with no objects, no room and no shadow on it. Even light from the front-left.
- Must show:
  - very short black hair and a short beard with a little grey in it
  - thin-framed rectangular glasses
  - an off-white shirt, open at the collar, under a slate waistcoat
  - a patient, measuring expression
- Must not show (as well as the shared list):
  - hands, props held up to the face, or anything crossing in front of the face
  - a second person, even partly
  - any background other than the flat buff colour

Prompt to paste:

```text
STYLE. Hand-painted gouache illustration on textured paper: flat, opaque shapes with visible dry-brush edges and a little paper grain showing through, no outlines, no gradients, no gloss. A restricted palette used in every picture: river slate blue-green (#1f3d47) for shadows and large dark areas, manila buff (#e8cf97), off-white paper (#f3f5f1), brick red (#b3261e) as a small accent, and highlighter yellow (#f2d544) used once at most. Soft, even daylight with simple two-tone shading. The mood is calm, observant and a little wry. The setting is a small present-day European river town; clothes, furniture and technology are ordinary and current, not nostalgic.
SUBJECT. Kwame, an independent auditor brought in to test a screening tool: a man in his forties, calm, exact and hard to hurry.
COMPOSITION. Square frame. One person only, head and shoulders, facing three-quarters towards the viewer's left or right and looking just past the viewer, not into the lens. The head is centred and fills about 60% of the height, with clear space all round it, because the picture is shown cropped to a small circle: nothing important may sit in the corners. Plain, flat manila-buff background with no objects, no room and no shadow on it. Even light from the front-left.
MUST SHOW. very short black hair and a short beard with a little grey in it; thin-framed rectangular glasses; an off-white shirt, open at the collar, under a slate waistcoat; a patient, measuring expression.
MUST NOT SHOW. hands, props held up to the face, or anything crossing in front of the face; a second person, even partly; any background other than the flat buff colour; any text, letters, numbers, handwriting or symbols that read as writing (signs, screens, book spines, papers and notices are left blank or shown as plain blocks of tone); logos, brand marks, flags, watermarks, signatures, captions, borders or frames; photorealism, 3D rendering, anime or cartoon exaggeration, glossy digital shading, lens blur or lens flare; robots, glowing brains, circuit patterns, holograms or any other stock picture of “AI”; anything frightening, violent or dramatic: no storms, no alarm, no people in distress.
```

### Fatima, from the town library

- File: `assets/story/cast-fatima.webp`
- Size: 1024 × 1024 pixels
- Subject: Fatima, who organises events at the town library: a woman in her thirties, warm, practical and used to plans changing.
- Composition: Square frame. One person only, head and shoulders, facing three-quarters towards the viewer's left or right and looking just past the viewer, not into the lens. The head is centred and fills about 60% of the height, with clear space all round it, because the picture is shown cropped to a small circle: nothing important may sit in the corners. Plain, flat manila-buff background with no objects, no room and no shadow on it. Even light from the front-left.
- Must show:
  - shoulder-length wavy dark hair
  - a buff cardigan over a slate-blue dress
  - a small plain brick-red brooch
  - a friendly, apologetic smile, as if bringing a change of plan
- Must not show (as well as the shared list):
  - hands, props held up to the face, or anything crossing in front of the face
  - a second person, even partly
  - any background other than the flat buff colour

Prompt to paste:

```text
STYLE. Hand-painted gouache illustration on textured paper: flat, opaque shapes with visible dry-brush edges and a little paper grain showing through, no outlines, no gradients, no gloss. A restricted palette used in every picture: river slate blue-green (#1f3d47) for shadows and large dark areas, manila buff (#e8cf97), off-white paper (#f3f5f1), brick red (#b3261e) as a small accent, and highlighter yellow (#f2d544) used once at most. Soft, even daylight with simple two-tone shading. The mood is calm, observant and a little wry. The setting is a small present-day European river town; clothes, furniture and technology are ordinary and current, not nostalgic.
SUBJECT. Fatima, who organises events at the town library: a woman in her thirties, warm, practical and used to plans changing.
COMPOSITION. Square frame. One person only, head and shoulders, facing three-quarters towards the viewer's left or right and looking just past the viewer, not into the lens. The head is centred and fills about 60% of the height, with clear space all round it, because the picture is shown cropped to a small circle: nothing important may sit in the corners. Plain, flat manila-buff background with no objects, no room and no shadow on it. Even light from the front-left.
MUST SHOW. shoulder-length wavy dark hair; a buff cardigan over a slate-blue dress; a small plain brick-red brooch; a friendly, apologetic smile, as if bringing a change of plan.
MUST NOT SHOW. hands, props held up to the face, or anything crossing in front of the face; a second person, even partly; any background other than the flat buff colour; any text, letters, numbers, handwriting or symbols that read as writing (signs, screens, book spines, papers and notices are left blank or shown as plain blocks of tone); logos, brand marks, flags, watermarks, signatures, captions, borders or frames; photorealism, 3D rendering, anime or cartoon exaggeration, glossy digital shading, lens blur or lens flare; robots, glowing brains, circuit patterns, holograms or any other stock picture of “AI”; anything frightening, violent or dramatic: no storms, no alarm, no people in distress.
```

### Councillor Hughes

- File: `assets/story/cast-hughes.webp`
- Size: 1024 × 1024 pixels
- Subject: Councillor Hughes, who chairs the council's services committee: a woman in her sixties, formal, budget-minded and persuadable by evidence.
- Composition: Square frame. One person only, head and shoulders, facing three-quarters towards the viewer's left or right and looking just past the viewer, not into the lens. The head is centred and fills about 60% of the height, with clear space all round it, because the picture is shown cropped to a small circle: nothing important may sit in the corners. Plain, flat manila-buff background with no objects, no room and no shadow on it. Even light from the front-left.
- Must show:
  - neat white hair, set
  - a dark slate suit jacket with a plain off-white blouse
  - a single strand of plain beads
  - an appraising look over the top of half-moon glasses
- Must not show (as well as the shared list):
  - hands, props held up to the face, or anything crossing in front of the face
  - a second person, even partly
  - any background other than the flat buff colour

Prompt to paste:

```text
STYLE. Hand-painted gouache illustration on textured paper: flat, opaque shapes with visible dry-brush edges and a little paper grain showing through, no outlines, no gradients, no gloss. A restricted palette used in every picture: river slate blue-green (#1f3d47) for shadows and large dark areas, manila buff (#e8cf97), off-white paper (#f3f5f1), brick red (#b3261e) as a small accent, and highlighter yellow (#f2d544) used once at most. Soft, even daylight with simple two-tone shading. The mood is calm, observant and a little wry. The setting is a small present-day European river town; clothes, furniture and technology are ordinary and current, not nostalgic.
SUBJECT. Councillor Hughes, who chairs the council's services committee: a woman in her sixties, formal, budget-minded and persuadable by evidence.
COMPOSITION. Square frame. One person only, head and shoulders, facing three-quarters towards the viewer's left or right and looking just past the viewer, not into the lens. The head is centred and fills about 60% of the height, with clear space all round it, because the picture is shown cropped to a small circle: nothing important may sit in the corners. Plain, flat manila-buff background with no objects, no room and no shadow on it. Even light from the front-left.
MUST SHOW. neat white hair, set; a dark slate suit jacket with a plain off-white blouse; a single strand of plain beads; an appraising look over the top of half-moon glasses.
MUST NOT SHOW. hands, props held up to the face, or anything crossing in front of the face; a second person, even partly; any background other than the flat buff colour; any text, letters, numbers, handwriting or symbols that read as writing (signs, screens, book spines, papers and notices are left blank or shown as plain blocks of tone); logos, brand marks, flags, watermarks, signatures, captions, borders or frames; photorealism, 3D rendering, anime or cartoon exaggeration, glossy digital shading, lens blur or lens flare; robots, glowing brains, circuit patterns, holograms or any other stock picture of “AI”; anything frightening, violent or dramatic: no storms, no alarm, no people in distress.
```

### Councillor Okoro

- File: `assets/story/cast-okoro.webp`
- Size: 1024 × 1024 pixels
- Subject: Councillor Okoro, a member of the services committee who hears residents' complaints: a man in his fifties, thoughtful and persistent.
- Composition: Square frame. One person only, head and shoulders, facing three-quarters towards the viewer's left or right and looking just past the viewer, not into the lens. The head is centred and fills about 60% of the height, with clear space all round it, because the picture is shown cropped to a small circle: nothing important may sit in the corners. Plain, flat manila-buff background with no objects, no room and no shadow on it. Even light from the front-left.
- Must show:
  - a shaved head and a full greying beard
  - a buff jacket over a dark slate roll-neck jumper
  - a serious, kind expression, head tilted slightly as if listening
- Must not show (as well as the shared list):
  - hands, props held up to the face, or anything crossing in front of the face
  - a second person, even partly
  - any background other than the flat buff colour

Prompt to paste:

```text
STYLE. Hand-painted gouache illustration on textured paper: flat, opaque shapes with visible dry-brush edges and a little paper grain showing through, no outlines, no gradients, no gloss. A restricted palette used in every picture: river slate blue-green (#1f3d47) for shadows and large dark areas, manila buff (#e8cf97), off-white paper (#f3f5f1), brick red (#b3261e) as a small accent, and highlighter yellow (#f2d544) used once at most. Soft, even daylight with simple two-tone shading. The mood is calm, observant and a little wry. The setting is a small present-day European river town; clothes, furniture and technology are ordinary and current, not nostalgic.
SUBJECT. Councillor Okoro, a member of the services committee who hears residents' complaints: a man in his fifties, thoughtful and persistent.
COMPOSITION. Square frame. One person only, head and shoulders, facing three-quarters towards the viewer's left or right and looking just past the viewer, not into the lens. The head is centred and fills about 60% of the height, with clear space all round it, because the picture is shown cropped to a small circle: nothing important may sit in the corners. Plain, flat manila-buff background with no objects, no room and no shadow on it. Even light from the front-left.
MUST SHOW. a shaved head and a full greying beard; a buff jacket over a dark slate roll-neck jumper; a serious, kind expression, head tilted slightly as if listening.
MUST NOT SHOW. hands, props held up to the face, or anything crossing in front of the face; a second person, even partly; any background other than the flat buff colour; any text, letters, numbers, handwriting or symbols that read as writing (signs, screens, book spines, papers and notices are left blank or shown as plain blocks of tone); logos, brand marks, flags, watermarks, signatures, captions, borders or frames; photorealism, 3D rendering, anime or cartoon exaggeration, glossy digital shading, lens blur or lens flare; robots, glowing brains, circuit patterns, holograms or any other stock picture of “AI”; anything frightening, violent or dramatic: no storms, no alarm, no people in distress.
```
