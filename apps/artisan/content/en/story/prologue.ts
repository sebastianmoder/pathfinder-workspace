import type { Scene } from "../../story/types";

/**
 * The prologue: arrival at the Commons, and one judgment made before anything is explained (the same
 * claim-against-source check the welcome page used to offer).
 */
export const prologue: Scene = {
  id: "prologue",
  place: "street",
  when: "Monday, 8:40",
  title: "A year in Riverside",
  beats: [
    { text: "The Riverside Learning Commons is an old school building two streets from the river. The sign by the door lists Homework Club, English classes, a digital drop-in and a repair café." },
    { text: "It is your first day as its researcher." },
    { who: "joanna", text: "You found us. I'm Joanna. I run this place, which mostly means I find chairs." },
    { who: "joanna", text: "The job is simple to say. People bring me things that sound right. You find out whether they are." },
    { who: "sam", text: "Sam, front desk. If it's lost, late or locked, it comes to me." },
    { who: "sam", text: "We've got an AI tool now. It came with the new computers, free for the first year. It's brilliant. Ask it anything." },
    { who: "joanna", text: "Sam asked it about the library's new app this morning. Show them, Sam." },
    { who: "sam", text: "It says: “Most people in town now use the library's new app.” And it gives a source. Library report, 2026." },
    { text: "You open the library's report. It says the app was downloaded 900 times in 2026. The town has 12,000 residents." },
    {
      id: "app-claim",
      ask: { who: "joanna", text: "So. Does the report back the claim?" },
      options: [
        {
          id: "backs",
          label: "It backs the claim",
          reply: [{ who: "joanna", text: "Look again. 900 downloads in a town of 12,000 is about 8%, and a download isn't the same as use. The citation is real. It just doesn't say that." }],
        },
        {
          id: "not",
          label: "It does not",
          reply: [{ who: "joanna", text: "No. 900 downloads in a town of 12,000 is about 8%, and a download isn't the same as use. The citation is real. It just doesn't say that." }],
        },
      ],
    },
    { who: "sam", text: "Huh. It sounded so sure." },
    { who: "joanna", text: "It always does. Your desk is the one by the window." },
    { text: "On the desk: a notebook, a map of the town, and an empty folder. Someone has already written “Riverside” on the tab." },
  ],
};
