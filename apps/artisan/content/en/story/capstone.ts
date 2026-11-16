import type { CaseStory, Chapter } from "../../story/types";

/**
 * The Commission (capstone: C01 in four chapters), and the end of the year.
 * The trail is laid out: nobody was behind it. Each figure was true of one place, one group or one moment,
 * and lost that on the way to Riverside. The FAQ page the player published in their first term turns out to
 * be one of the pages the new service will answer from.
 * Figures quoted here are the ones the cases establish (see c01.ts, m05.ts, m08.ts, m12.ts, m13.ts).
 */
export const capstone: Chapter = {
  stage: "capstone",
  title: "The Commission",
  opener: {
    id: "capstone-open",
    place: "townHall",
    when: "One year after your first morning",
    title: "The Commission",
    beats: [
      { text: "The folder goes with you to the town hall. It holds a year of things that sounded finished." },
      { text: "The commission has four jobs: decide what the service may do, check the vendor's case, test how it is set up, and face the council." },
    ],
  },
  closer: {
    id: "ending",
    place: "frontDesk",
    when: "One year on",
    title: "One year on",
    beats: [
      {
        either: [
          { when: { flag: { id: "interpreter", is: ["funded"] } }, lines: [{ text: "Riverside Answers launched in the spring, with interpreter calls for residents who write in other languages, as the commission asked." }] },
          { lines: [{ text: "Riverside Answers launched in the spring. Residents writing in Polish and Arabic got a wrong answer about one time in three, and for a while there was nowhere else to send them." }] },
        ],
      },
      {
        either: [
          { when: { flag: { id: "faq", is: ["unchecked"] } }, lines: [{ text: "In its first week it told a resident about the Commons' ground-floor café. The page had been corrected a year earlier. A copy of it had not." }] },
          { lines: [{ text: "It answers questions about the Commons from the FAQ page. Priya still checks that page against the handbook every term." }] },
        ],
      },
      {
        either: [
          { when: { flag: { id: "benefitsReview", is: ["funded"] } }, lines: [{ text: "At the council's service desk, the monthly review the panel paid for caught two wrong benefits answers in May. Both families were contacted the same week." }] },
          { lines: [] },
        ],
      },
      { who: "sam", text: "Somebody asked the assistant this morning when the library opens on Saturdays. It said ten o'clock." },
      { who: "sam", text: "I checked. It's ten." },
      { text: "The folder is in the bottom drawer of your desk. On top of it is a new one, with nothing on the tab yet." },
    ],
  },
};

export const capstoneCases: CaseStory[] = [
  {
    moduleId: "C01",
    open: {
      "c01-scope": {
        id: "c01-scope-open",
        place: "townHall",
        when: "The commission's first meeting",
        beats: [
          { who: "hughes", text: "The planners propose four uses for Riverside Answers. Tell us what it should be allowed to do before anyone tells us how well it does it." },
          { who: "okoro", text: "Councillor Okoro. Residents write to me when the council's website is wrong. I would like to know, from the start, whose name goes on this." },
        ],
      },
      "c01-evidence": {
        id: "c01-evidence-open",
        place: "townHall",
        when: "The second meeting",
        beats: [
          { text: "The vendor's case arrives with the brochure stapled to the front. 95% accuracy in every language it supports." },
          { who: "okoro", text: "There is an independent evaluation from Northbrook in the pack. I would start there." },
        ],
      },
      "c01-workflow": {
        id: "c01-workflow-open",
        place: "townHall",
        when: "The third meeting",
        beats: [
          { who: "okoro", text: "The planners want it to answer from published pages. The council's, and the Commons'." },
          {
            either: [
              { when: { flag: { id: "faq", is: ["unchecked"] } }, lines: [{ text: "The Commons' published pages. That includes an FAQ page which once told people about a café that doesn't exist." }] },
              { lines: [{ text: "The Commons' published pages. That includes the FAQ page you put up in your first term. Whatever it says, Riverside Answers will say." }] },
            ],
          },
          { text: "Joanna asked you then whether she was wrong to let a company learn from it. This is where that question ends up." },
        ],
      },
      "c01-review": {
        id: "c01-review-open",
        place: "office",
        when: "The night before the review meeting",
        beats: [
          { text: "You empty the folder onto your desk. An opening time, a brochure, a slide, a photo, a quote, a report from another town." },
          { who: "joanna", text: "Before you tell the council what to do, show me how these got here." },
        ],
      },
    },
    close: {
      "c01-scope": {
        id: "c01-scope-close",
        place: "townHall",
        when: "After the first meeting",
        beats: [
          { who: "okoro", text: "A name against the service's answers. Good. It is the first thing residents ask me, and the last thing anyone decides." },
        ],
      },
      "c01-evidence": {
        id: "c01-evidence-close",
        place: "townHall",
        when: "After the second meeting",
        beats: [
          { text: "Of 950 answers in English, 900 were correct. That is the 95%. In Polish it was 40 of 60. In Arabic, 25 of 40." },
          { text: "Nobody made the figure up. Somebody stopped saying which language it was about." },
        ],
      },
      "c01-workflow": {
        id: "c01-workflow-close",
        place: "townHall",
        when: "After the third meeting",
        beats: [
          { text: "It passes every trial case now. The trial cases are the ones somebody thought of." },
          { who: "okoro", text: "Then the rest is what happens after launch, and who is watching." },
        ],
      },
      "c01-review": {
        id: "c01-review-close",
        place: "townHall",
        when: "After the review meeting",
        beats: [
          { who: "hughes", text: "The committee votes next month. Whatever it decides, it will decide knowing what that figure is made of." },
          { text: "There was never anyone behind it. A trial in Eastfield, an evaluation in Northbrook, a pilot in Kelmere, a notice on a library door." },
          { text: "Each was true where it started. Each was passed on by people and tools that kept the confidence and dropped the conditions." },
          { who: "joanna", text: "A year ago I said people bring me things that sound right, and you find out whether they are. I didn't expect you to find out where they come from." },
        ],
      },
    },
    interlude: { "c01-review": "trace" },
    clue: {
      title: "Where it all came from",
      text: [
        {
          text: "None of it was invented, and nobody was behind it. Each figure was true of one place, one group or one moment, and lost that on its way to Riverside. The 95% was for English. The 40% was never Eastfield's. The flood was in 2024. The library opened at nine until January.",
        },
      ],
      ties: [
        { moduleId: "M05", why: "Eastfield's result became a brochure's figure about something else." },
        { moduleId: "M08", why: "The photo lost its date." },
        { moduleId: "M12", why: "The opening time outlived the notice it came from." },
        { moduleId: "M13", why: "Kelmere's findings arrived without their limits." },
        { moduleId: "B01", why: "And your own FAQ page is now a source for the next system. What you checked then is what it will say." },
      ],
    },
  },
];
