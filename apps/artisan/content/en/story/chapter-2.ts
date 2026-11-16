import type { CaseStory, Chapter } from "../../story/types";

/**
 * Chapter 2: The figure with no source (stage 2: M04 to M07 and the newsletter bridge).
 * Papers put in front of the board lean one way. Each traces back to something true about somewhere else.
 * Scenes only state what the cases themselves establish (see the mission files), plus the through-line.
 */
export const chapter2: Chapter = {
  stage: 2,
  title: "Chapter 2: The figure with no source",
  opener: {
    id: "ch2-open",
    place: "office",
    when: "January",
    title: "Chapter 2: The figure with no source",
    beats: [
      { text: "A new term. The Brightpath brochure is still in the folder, with its 40% and no study named." },
      { text: "The board has decisions to make this term, and every paper put in front of it seems to have been drafted by something." },
    ],
  },
  closer: {
    id: "ch2-close",
    place: "office",
    when: "The end of the spring term",
    beats: [
      { text: "The folder is filling. Lay this term's papers side by side and they lean the same way: more AI at the Commons, and sooner." },
      { who: "nadia", text: "I don't think anyone is lying to us. Every one of these began as something true about somewhere else." },
      { who: "nadia", text: "A trial in Eastfield. A register. A survey. Then somebody tidied it up, and it arrived here sounding like a fact about us." },
      { who: "sam", text: "Phone for you. It's the Gazette. Rosa says she needs someone who checks things, and she needs them this week." },
    ],
  },
};

export const chapter2Cases: CaseStory[] = [
  {
    moduleId: "M04",
    open: {
      "m04-evidence": {
        id: "m04-open",
        place: "office",
        when: "The day before the board meets",
        beats: [
          { who: "joanna", text: "The board meets tomorrow about Homework Club. The assistant drafted the briefing overnight." },
          { who: "joanna", text: "Every claim in it has a citation. That's more than I usually manage." },
          { who: "joanna", text: "You have the source pack. Tell me what I can actually say." },
        ],
      },
    },
    close: {
      "m04-evidence": {
        id: "m04-close",
        place: "boardRoom",
        when: "After the board meeting",
        beats: [
          {
            either: [
              { when: { flag: { id: "tuesday", is: ["weekly"] } }, lines: [{ who: "joanna", text: "The board liked the idea of a weekly Tuesday session. So did I. Then I looked at the rota, and there is nobody on it." }] },
              { lines: [{ who: "joanna", text: "It wasn't the answer the board hoped for. It is one I can still stand behind when they ask me again in June." }] },
            ],
          },
          { who: "nadia", text: "I'm Nadia, I sit on the board. The citations told us where to look. You were the only one who looked." },
          { text: "The sources were all real. Several did not say what the briefing said they did. You put the draft in the folder, with the passages clipped to it." },
        ],
      },
    },
    clue: {
      title: "The board briefing",
      text: [{ text: "An AI-drafted briefing gave a source for every claim. The sources were real, and several did not say what the briefing said they did. A citation shows where to look, and nobody had looked." }],
      ties: [
        { moduleId: "M01", why: "The opening time sounded sure. This sounded sourced. Neither had been checked." },
        { moduleId: "M03", why: "The briefing was written for nobody in particular, about a club its author had never seen." },
      ],
    },
  },
  {
    moduleId: "M05",
    open: {
      "m05-argument": {
        id: "m05-open",
        place: "boardRoom",
        when: "Monday, with the board meeting on Thursday",
        beats: [
          { who: "nadia", text: "Thursday's proposal: replace the Wednesday homework drop-in with an AI tutor. Three of our six volunteers leave in December, so something has to give." },
          { who: "rafael", text: "And there's a product ready to go. Brightpath Tutor. You'll have seen the brochure." },
          { text: "You have. It is in the folder." },
          { who: "rafael", text: "I'm Rafael. Whatever you decide, I'll argue the other side. Somebody should." },
        ],
      },
    },
    close: {
      "m05-argument": {
        id: "m05-close",
        place: "boardRoom",
        when: "The week after the board meeting",
        beats: [
          {
            either: [
              { when: { flag: { id: "forty", is: ["caught"] } }, lines: [{ who: "nadia", text: "When the 40% came up on Thursday, you had the Eastfield passage in your hand. It never reached the minutes." }] },
              { lines: [{ who: "nadia", text: "The 40% is in the minutes as Eastfield's finding. I've sent a correction. Two trustees had already quoted it to other people." }] },
            ],
          },
          { text: "Eastfield's trial measured something real: more learners finished their homework. Somewhere between the trial and the brochure, that became a different figure about something else." },
          { who: "rafael", text: "I quoted it because it was in front of me and it sounded like research. That's how it gets about, I suppose." },
        ],
      },
    },
    clue: {
      title: "The 40% figure",
      text: [
        {
          when: { flag: { id: "forty", is: ["caught"] } },
          text: "Brightpath's brochure says homework is done “40% faster” and names no study. The Eastfield trial measured something else: completion rising from 61% to 74%. At the board, the figure was offered as Eastfield's finding, and you stopped it there.",
        },
        { text: "Brightpath's brochure says homework is done “40% faster” and names no study. The Eastfield trial measured something else: completion rising from 61% to 74%. The figure is now in the board's minutes as Eastfield's finding." },
      ],
      ties: [{ moduleId: "M04", why: "A real source, and a claim it doesn't make. This time the claim came from a seller." }],
    },
  },
  {
    moduleId: "M06",
    open: {
      "m06-gym": {
        id: "m06-gym-open",
        place: "homeworkRoom",
        when: "Saturday, before Homework Club",
        beats: [
          { who: "priya", text: "If you're helping on Saturdays, you'll get percentages and average speeds. Have a go at a couple first!" },
          { who: "priya", text: "The tool has a tutor now. It offers hints, examples and answers. The children press “answer”. Every time." },
        ],
      },
      "m06-teach": {
        id: "m06-teach-open",
        place: "homeworkRoom",
        when: "The next Saturday",
        beats: [
          { who: "priya", text: "This is Leo. Two of his answers came back marked wrong, and his app won't say why." },
          { who: "leo", text: "It just gives you the answer. I copied it down right." },
        ],
      },
    },
    close: {
      "m06-gym": {
        id: "m06-gym-close",
        place: "homeworkRoom",
        when: "Later that morning",
        beats: [
          { who: "priya", text: "Could you do the next one without it? That's all I ever ask them." },
          { text: "A finished answer feels like understanding while you read it. The test comes afterwards, when the help has gone." },
        ],
      },
      "m06-teach": {
        id: "m06-teach-close",
        place: "homeworkRoom",
        when: "An hour later",
        beats: [
          { who: "leo", text: "I get it now. Don't tell the app. It thinks it taught me." },
          { text: "Leo's app answered every question he put to it. It never asked him one." },
          { text: "“Homework done faster” is what the brochure in your folder is selling. You add a note to it." },
        ],
      },
    },
    clue: {
      title: "The answer button",
      text: [{ text: "A tutor that hands over a finished answer gets homework done faster, which is what the brochure promises. It says nothing about what the learner can do next week without it." }],
      ties: [{ moduleId: "M05", why: "The brochure counts speed. Eastfield counted homework finished. Neither counted what was learned." }],
    },
  },
  {
    moduleId: "M07",
    open: {
      "m07-numbers": {
        id: "m07-open",
        place: "office",
        when: "An hour before the board meets",
        beats: [
          { who: "joanna", text: "The board decides today whether to renew the drop-in's AI helper. The tool made me a slide deck for it." },
          { who: "joanna", text: "“Visits soared after we introduced the AI helper.” It's a lovely slide. Check it before the board does." },
        ],
      },
    },
    close: {
      "m07-numbers": {
        id: "m07-close",
        place: "office",
        when: "That evening",
        beats: [
          { who: "joanna", text: "At €180 the licence would have been a bargain. At €1,800 I'd like to know what it did for us." },
          { text: "Visits did rise. Nothing in the register says why. The deck was made by one AI tool, and made the case for another." },
          { text: "You print slide 2 as it first looked, and put it in the folder." },
        ],
      },
    },
    clue: {
      title: "The slide deck",
      text: [{ text: "“Visits soared after we introduced the AI helper.” Visits rose, and the records can't show the helper caused it. The same deck gave the licence as €180, not €1,800. Every error in it leaned towards renewing." }],
      ties: [
        { moduleId: "M04", why: "Another AI draft for the board, with figures that needed reading against the records." },
        { moduleId: "M05", why: "A number asked to prove more than it measured." },
      ],
    },
  },
  {
    moduleId: "T01",
    open: {
      "t01-transfer": {
        id: "t01-open",
        place: "studio",
        when: "Newsletter week",
        beats: [
          { who: "dev", text: "Lead article's done! The assistant drafted it, and I added a bit on why we should expand the course." },
          { who: "dev", text: "It reads really well. Honestly, I'd print it as it is." },
          { text: "You have heard that before. The newsletter goes out under the Commons' name." },
        ],
      },
    },
    close: {
      "t01-transfer": {
        id: "t01-close",
        place: "studio",
        when: "The day it goes to print",
        beats: [
          { who: "dev", text: "So a fact can be right and the argument built on it can still be wrong. I didn't know those came apart." },
          { who: "dev", text: "And I'd had the AI tutor check my percentages. One tool marking another tool's homework." },
          { text: "Nobody outside the Commons will see the draft. They will see whatever is printed, and take it as the Commons' own account of itself." },
        ],
      },
    },
    clue: {
      title: "The newsletter article",
      text: [{ text: "An accurate fact was asked to carry an argument for expanding the course that it couldn't bear. Once printed, it would have been the Commons saying so about itself." }],
      ties: [
        { moduleId: "B01", why: "Like the FAQ page, it goes out under the Commons' name, where others can pick it up." },
        { moduleId: "M07", why: "A true figure, and a conclusion it doesn't support." },
      ],
    },
  },
];
