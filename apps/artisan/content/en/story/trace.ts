import type { MatchSpec, RankSpec } from "../../types";

/**
 * "Trace it back": the one activity that belongs to the story. Before the review meeting, the player lays
 * out how the claims in the folder reached Riverside. It reuses the rank and match patterns, is checked like
 * any activity, and is never needed to go on. Every figure is one the cases establish.
 */
export const trace: { title: string; intro: string; travel: { title: string; intro: string; spec: RankSpec }; lost: { title: string; intro: string; spec: MatchSpec }; done: string } = {
  title: "Trace it back",
  intro: "Two things to lay out before the council meets: how one figure travelled, and what each claim in the folder lost on the way. This belongs to the story. It is checked, and you can go on whatever the result.",
  travel: {
    title: "How the 95% travelled",
    intro: "Put these in order, from where the figure started to where it ended up.",
    spec: {
      top: "Where it started",
      bottom: "Where it ended up",
      items: [
        { id: "evaluation", label: "The Northbrook evaluation: of 950 answers in English, 900 were correct.", explanation: "This is the measurement. It is about English, and it sits beside much lower figures for Polish and Arabic." },
        { id: "case", label: "The vendor's case: “Independent evaluation found it 95% accurate.”", explanation: "True of English. The language has already gone." },
        { id: "brochure", label: "The vendor's brochure: “95% accuracy in every language it supports.”", explanation: "Now the missing condition has been replaced by its opposite." },
        { id: "chamber", label: "The council chamber: “It's 95% accurate. Why not just trust the vendor?”", explanation: "By the time it is repeated aloud, it is a fact about the whole service." },
      ],
      first: ["evaluation"],
      last: ["chamber"],
      takeaway: "At no point did anyone invent a number. Each copy kept the figure and dropped a little more of what it was a figure of.",
    },
  },
  lost: {
    title: "What each claim lost on the way",
    intro: "Pin each claim, as it reached Riverside, to what its source actually showed.",
    spec: {
      leftLabel: "As it reached Riverside",
      rightLabel: "What the source showed",
      left: [
        { id: "forty", label: "“Students finish homework 40% faster.”", matchId: "eastfield", explanation: "Eastfield measured how many learners finished their homework, not how fast. The brochure names no study at all." },
        { id: "ninety-five", label: "“95% accuracy in every language.”", matchId: "northbrook", explanation: "The 95% was for English. Polish and Arabic answers were right about two times in three." },
        { id: "flood", label: "“Flooding at Riverside Bridge right now.”", matchId: "photo", explanation: "A real photo of a real flood, from 2024. It lost its date." },
        { id: "nine", label: "“The library opens at 9:00 on Saturdays.”", matchId: "notice", explanation: "Right when it was first said. The notice changed, and the sentence didn't." },
      ],
      right: [
        { id: "eastfield", label: "A trial in another town: homework completion rose from 61% to 74% among tutor users." },
        { id: "northbrook", label: "An evaluation in another town: English 900 of 950 correct, Polish 40 of 60, Arabic 25 of 40." },
        { id: "photo", label: "The Gazette's own photo of the 2024 flood." },
        { id: "notice", label: "The library's notice, which changed the opening time to ten from January." },
        { id: "nothing", label: "Nothing: it was made up from start to finish." },
      ],
      outcome: "None of the four was made up. Each was true of another place, another group or another time, and arrived in Riverside without saying so.",
    },
  },
  done: "Take it to the council",
};
