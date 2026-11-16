import type { CaseStory, Chapter } from "../../story/types";

/**
 * Chapter 4: The vote (stage 4: M12 and M13).
 * The sentence from the first week comes back, and the town decides what to hand over.
 * Scenes only state what the cases themselves establish (see the mission files), plus the through-line.
 */
export const chapter4: Chapter = {
  stage: 4,
  title: "Chapter 4: The vote",
  opener: {
    id: "ch4-open",
    place: "frontDesk",
    when: "Autumn",
    title: "Chapter 4: The vote",
    beats: [
      { text: "Until now the question was whether one answer, one figure or one photo was right." },
      { text: "Now it is what Riverside hands over to a system, and on what terms." },
    ],
  },
  closer: {
    id: "ch4-close",
    place: "townHall",
    when: "December",
    beats: [
      { who: "hughes", text: "One more thing. The chat service for residents has a name now, Riverside Answers, and the vendor has sent us a brochure." },
      { who: "hughes", text: "Before it launches, the council wants a commission to look at it properly. The panel asked for you to lead it." },
      { text: "The brochure says: “95% accuracy in every language it supports.” It gives no source on that page." },
      { text: "You put it in the folder, which is nearly full." },
    ],
  },
};

export const chapter4Cases: CaseStory[] = [
  {
    moduleId: "M12",
    open: {
      "m12-systems": {
        id: "m12-open",
        place: "frontDesk",
        when: "The email assistant's first trial run",
        beats: [
          { who: "sam", text: "First trial run of the email assistant. A member asked about Saturday opening, and look what it told them." },
          { who: "sam", text: "“The library opens at 9:00 on Saturdays.”" },
          { text: "You know that sentence. You put it in the folder in your first week. It stopped being true in January." },
          { who: "sam", text: "So we pay for the more advanced model. Right?" },
        ],
      },
    },
    close: {
      "m12-systems": {
        id: "m12-close",
        place: "frontDesk",
        when: "A month after launch",
        beats: [
          {
            either: [
              {
                when: { flag: { id: "launch", is: ["staged"] } },
                lines: [{ who: "sam", text: "A small group first, like you said. In week two it gave a class time that had moved. Two members flagged it and we fixed the handbook the same day." }],
              },
              { lines: [{ who: "sam", text: "It's about seven hours a week between us, keeping the handbook right and approving replies. Still far less than answering every email." }] },
            ],
          },
          { text: "The model was never the problem. It said nine o'clock because nine o'clock was what it had been given." },
        ],
      },
    },
    clue: {
      title: "The sentence that came back",
      text: [{ text: "The email assistant's first reply was the library's old opening time, word for word, months after it changed. A better model would have said it just as firmly. What was missing was a source that someone keeps up to date." }],
      ties: [
        { moduleId: "M01", why: "The same sentence, a year on. It was right then." },
        { moduleId: "M08", why: "Like the flood photo: true once, and passed on without its date." },
      ],
    },
  },
  {
    moduleId: "M13",
    open: {
      "m13-assembly": {
        id: "m13-open",
        place: "townHall",
        when: "The panel's first evening",
        beats: [
          { text: "The citizens' panel meets in the council chamber. Twelve residents, a stack of evidence, and a council vote in December." },
          { who: "hughes", text: "Councillor Hughes, services committee. Thank you for giving up your evenings." },
          { who: "hughes", text: "Kelmere has run this same service for six months, so we are not guessing. The panel advises, the council votes. Advise us well." },
        ],
      },
    },
    close: {
      "m13-assembly": {
        id: "m13-close",
        place: "townHall",
        when: "After the vote",
        beats: [
          {
            either: [
              { when: { flag: { id: "vote", is: ["conditions"] } }, lines: [{ who: "hughes", text: "Nine votes to four, with your conditions written into the decision. I did not expect to be persuaded by a list of costs." }] },
              { lines: [{ who: "hughes", text: "The council has your advice. I hope the residents who are waiting on this agree with it." }] },
            ],
          },
          { text: "Kelmere's report said the assistant resolved most routine enquiries. It also said who was misheard, and that when the advice was wrong, nobody could say who answered for it." },
          { text: "Most of Riverside had only heard the first part. You file the whole report." },
        ],
      },
    },
    clue: {
      title: "The Kelmere report",
      text: [{ text: "Kelmere ran the same service for six months. Its report says most routine enquiries were resolved. It also says people with speech impairments were misheard, some benefits advice was wrong, and nobody could say who was responsible. Only the first finding was widely repeated." }],
      ties: [
        { moduleId: "M05", why: "Another town's result, repeated in Riverside without its limits." },
        { moduleId: "M09", why: "Again the question is who the errors fall on, and whether anyone looked." },
      ],
    },
  },
];
