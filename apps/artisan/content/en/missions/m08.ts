import type { Choice, Mission } from "../../types";

/**
 * M08 — The Newsroom.
 * All people, accounts, outlets and records are fictional. Media are described in text (PRD M08: start with text and still images).
 */

const realQuestion = "A dramatic photo is spreading fast online, captioned as happening today. What is the best first test of whether the caption is true?";
const realChoices: Choice[] = [
  { id: "a", label: "Look closely at the image for signs that it has been edited.", verdict: "weaker", explanation: "A genuine, unedited photo can still be from another day or another place. How it looks can't tell you when it was taken." },
  { id: "b", label: "Find out where and when the image first appeared.", verdict: "correct", explanation: "Provenance answers the caption's actual claim, “today”. An earlier copy settles it whatever the image looks like." },
  { id: "c", label: "Check how many people have shared it and who they are.", verdict: "weaker", explanation: "Popularity measures attention, not accuracy. False posts often spread fastest." },
];

export const m08: Mission = {
  id: "m08-newsroom",
  title: "The Newsroom",
  outcome: "Judge a viral image or claim by its provenance, corroboration and context, and decide whether to publish, qualify, investigate or hold.",
  scenario:
    "You are on the Riverside Gazette's news desk, at a fictional local newspaper. A photo of flooding at Riverside Bridge is spreading fast. Your editor, Rosa, wants something online by 10:00.",
  approxMinutes: 14,
  meta: {
    version: "1.0",
    reviewedOn: "2026-11-03",
    reviewedBy: "Claude (author self-review against PRD §7 and §12; no independent subject-matter review yet)",
    sourcesToReview: ["Verification tools change, but the method here (earliest copy, independent records, people on the scene) is durable. Avoid naming specific tools."],
  },
  steps: [
    {
      kind: "brief",
      id: "brief",
      title: "Your task",
      body: "Investigate a viral photo before the deadline, sort what you know from what you don't, and decide what the paper should publish.",
    },
    {
      kind: "refresher",
      id: "refresher",
      title: "A quick refresher",
      body: "Check a claim against evidence, not against how convincing it looks: a fluent caption or a sharp photo can be wrong. With images, ask: where did this first appear, when, and what else confirms it? Independent records and people on the scene count for more than repeats of the same post.",
    },
    { kind: "initialJudgment", id: "initial", prompt: realQuestion, choices: realChoices },
    {
      kind: "casefile",
      id: "desk",
      title: "Check the photo",
      intro: "You have time to follow four of these six leads before Rosa's deadline. Choose carefully: each lead tells you something different.",
      casefile: {
        artifact: {
          label: "Viral post",
          title: "Flooding at Riverside Bridge RIGHT NOW. Council hasn't warned anyone!! #RiversideFlood",
          body: "[Photo: brown floodwater over the road at Riverside Bridge, a car stranded halfway across, the bridge railings just visible above the water.]",
          meta: "Posted at 08:12 today by @river_watcher_22 · shared about 4,000 times",
        },
        budget: { leads: 4, note: "Rosa wants a decision by 10:00." },
        timeline: [{ order: 50, when: "Today, 08:12", text: "@river_watcher_22 posts the photo, captioned as happening now." }],
        keyLeads: ["reverse", "gauge"],
        leads: [
          {
            id: "zoom",
            label: "Examine the image closely",
            kind: "check",
            description: "Look for signs of editing: odd shadows, repeated patterns, blurred edges.",
            finding: "Nothing looks edited. That doesn't say when or where it was taken.",
            pressure: "Rosa: “Looks real to me. Everyone else is running it.”",
          },
          {
            id: "reverse",
            label: "Search for earlier copies of the photo",
            kind: "check",
            description: "Find where this image appeared before this morning, if anywhere.",
            finding: "The same photo, car and all, appears in this paper's own article on the spring floods of March 2024.",
            timeline: { order: 10, when: "March 2024", text: "The photo appears in the Riverside Gazette's report on the spring floods." },
          },
          {
            id: "uploader",
            label: "Message the account that posted it",
            kind: "interview",
            description: "@river_watcher_22, who posted it this morning.",
            finding: "“A friend sent it to me this morning. I thought it was from today.” They can't say where the friend got it.",
            pressure: "Rosa: “We're being beaten on this. Can I have a yes or no?”",
          },
          {
            id: "gauge",
            label: "Check the river-level record",
            kind: "record",
            description: "The regional river-level gauge at Riverside Bridge, updated every 15 minutes.",
            finding: "The river has been within its normal range all night and all morning.",
            timeline: { order: 40, when: "Today, 06:00–09:30", text: "River gauge at Riverside Bridge within its normal range." },
          },
          {
            id: "council",
            label: "Call the council press office",
            kind: "interview",
            description: "The council is responsible for flood warnings.",
            finding: "“We've had no reports of flooding today. We'll check.” They can't yet say more.",
          },
          {
            id: "cafe",
            label: "Phone the café beside the bridge",
            kind: "interview",
            description: "Bridge Street Café, which looks out over the road.",
            finding: "“The road's dry and open. There was heavy rain overnight, but nothing like that.”",
            timeline: { order: 45, when: "Today, 09:10", text: "Bridge Street Café: the road is dry and open." },
          },
        ],
        statements: [
          { id: "old", text: "The photo was taken before today.", status: "known", leadIds: ["reverse"], explanation: "It appeared in this paper's own report in March 2024." },
          { id: "flood", text: "Riverside Bridge is flooded this morning.", status: "contradicted", leadIds: ["gauge", "cafe"], explanation: "The river gauge is normal, and the café next to the bridge says the road is dry." },
          { id: "warning", text: "The council failed to warn people about a flood today.", status: "contradicted", leadIds: ["gauge", "cafe"], explanation: "There is no flood today, so there was nothing to warn about." },
          { id: "motive", text: "The account posted it knowing it was old.", status: "uncertain", leadIds: [], explanation: "They say they thought it was current, and nothing you can find shows otherwise. Intent is often impossible to establish, and the report doesn't need it." },
          { id: "shares", text: "The post has been shared about 4,000 times.", status: "known", leadIds: [], explanation: "The post itself shows this. It tells you how far it has spread, not whether it's true." },
        ],
      },
    },
    {
      kind: "quiz",
      id: "looks",
      prompt: "Your close look at the image found no signs of editing. What does that tell you?",
      choices: [
        { id: "a", label: "That the photo is genuine and was taken this morning.", verdict: "weaker", explanation: "An unedited photo can still be from 2024, as this one is. Looks can't establish a date." },
        { id: "b", label: "Little: an unedited photo can still be old or from elsewhere.", verdict: "correct", explanation: "Editing is only one way to mislead. Reusing a real photo with a false caption is more common, and leaves nothing to see." },
        { id: "c", label: "That the account which posted it is being honest.", verdict: "weaker", explanation: "The image says nothing about the poster's knowledge or intent." },
      ],
      hints: [{ text: "What did the caption actually claim, and could looking at the photo test that?" }],
    },
    {
      kind: "quiz",
      id: "decide",
      prompt: "It's 10:00. Rosa needs your decision. What should the Gazette do?",
      choices: [
        { id: "a", label: "Run the photo with “unverified” in the caption, as other outlets have.", verdict: "weaker", explanation: "A label doesn't stop a false picture from spreading, and you have evidence that it is false." },
        { id: "b", label: "Publish a short report: the photo is from 2024, and the river is at normal levels.", verdict: "correct", explanation: "You can say what is established and how you know. That serves readers who have seen the post." },
        { id: "c", label: "Run nothing until the council has finished its checks.", verdict: "defensible", explanation: "Cautious, but you already have enough to correct the post, and it keeps spreading in the meantime." },
      ],
      hints: [{ text: "What can you already say with evidence behind it?" }],
    },
    {
      kind: "revision",
      id: "revision",
      initialStepId: "initial",
      prompt: `Having checked the photo, answer the first question again. ${realQuestion}`,
      choices: realChoices,
      withConfidence: true,
    },
    {
      kind: "transfer",
      id: "transfer",
      title: "A new viral post",
      prompt: "A screenshot of a quotation is spreading. You can follow three of the four leads. There are no hints this time.",
      casefile: {
        artifact: {
          label: "Viral screenshot",
          title: "Mayor Hale, 3 May: “Libraries are a waste of public money.”",
          body: "[Screenshot styled like a news headline, with the mayor's photo and the council's logo.]",
          meta: "Posted yesterday by @riverside_truth · shared about 2,000 times",
        },
        budget: { leads: 3, note: "The story conference starts soon." },
        keyLeads: ["transcript", "satire"],
        leads: [
          {
            id: "transcript",
            label: "Read the transcript of the 3 May speech",
            kind: "record",
            description: "The council publishes a transcript of every speech.",
            finding: "The speech was about library opening hours. The quoted line isn't in it.",
            timeline: { order: 10, when: "3 May", text: "The mayor's speech on library opening hours. The quoted line isn't in the transcript." },
          },
          {
            id: "satire",
            label: "Search for where the wording first appeared",
            kind: "check",
            description: "Look for the earliest appearance of the exact words.",
            finding: "It first appeared on 5 May on The Riverside Onion, a satire site, labelled as satire.",
            timeline: { order: 20, when: "5 May", text: "The wording appears on a satire site, labelled as satire." },
          },
          {
            id: "office",
            label: "Ask the mayor's office",
            kind: "interview",
            description: "The mayor's press officer.",
            finding: "“She never said that.” (Expected either way, so on its own it settles little.)",
          },
          {
            id: "account",
            label: "Look at the account that posted it",
            kind: "check",
            description: "@riverside_truth.",
            finding: "Created two days ago. It has posted nothing else.",
          },
        ],
        statements: [
          { id: "speech", text: "The mayor said this in her 3 May speech.", status: "contradicted", leadIds: ["transcript"], explanation: "The transcript of that speech doesn't contain it." },
          { id: "origin", text: "The wording first appeared as satire.", status: "known", leadIds: ["satire"], explanation: "Its earliest appearance is on a labelled satire site." },
          { id: "intent", text: "Whoever made the screenshot meant to deceive.", status: "uncertain", leadIds: [], explanation: "A new account is suspicious, but suspicion isn't evidence of intent. It may have been shared as a joke that lost its label." },
          { id: "spread", text: "The screenshot has been shared about 2,000 times.", status: "known", leadIds: [], explanation: "Shown on the post itself." },
        ],
      },
    },
    {
      kind: "openResponse",
      id: "explain",
      prompt: "Write a note to your editor about the mayor screenshot: what is established, what is uncertain, and what the paper should do.",
      rubric: {
        samples: [
          { id: "weak", text: "It looks fake, so we should ignore it.", met: [], note: "It rests on appearance, says nothing about how you know, and ignoring it leaves readers misled." },
          {
            id: "strong",
            text: "The quote isn't in the transcript of the 3 May speech, and the wording first appeared on a satire site on 5 May. We don't know whether whoever shared it meant to deceive. I'd publish a short correction saying where it came from, with the transcript as the source.",
            met: ["known", "uncertain", "decision"],
            note: "It names the evidence, separates what is uncertain, and recommends an action that fits.",
          },
        ],
        criteria: [
          { id: "known", text: "States what is established, and the evidence for it." },
          { id: "uncertain", text: "Says what remains uncertain." },
          { id: "decision", text: "Recommends publishing, qualifying, investigating or holding, consistent with the evidence." },
        ],
        examples: [
          "Established: the line isn't in the 3 May transcript, and the wording started on a satire site. Uncertain: who made the screenshot and why. Recommendation: run a brief fact-check now, linking the transcript.",
          "We can say the mayor didn't say this in the speech it cites, because the transcript doesn't include it. We can't say whether the poster knew it was satire. Publish a correction, and keep asking who made the image.",
        ],
      },
    },
    {
      kind: "debrief",
      id: "debrief",
      takeaway: "Judge a viral image by where it came from and what independent evidence says, not by how real it looks, and be clear about what is still uncertain.",
      skills: [
        { id: "provenance", label: "Tracing where and when an image first appeared", kind: "action", items: ["desk/lead/reverse", "desk/old"] },
        { id: "corroborate", label: "Checking a claim against independent records", kind: "action", items: ["desk/lead/gauge", "desk/flood", "desk/warning"] },
        {
          id: "appearance",
          label: "Not relying on how an image looks",
          kind: "knowledge",
          items: ["looks", "revision"],
          practice: {
            prompt: "A video of a politician saying something shocking looks completely real. What would best test it?",
            choices: [
              { id: "a", label: "Watch it frame by frame for glitches.", verdict: "weaker", explanation: "Absence of glitches proves little, and real footage can be cut misleadingly." },
              { id: "b", label: "Find the full original event and its record.", verdict: "correct", explanation: "The original recording or transcript shows whether it was said, and in what context." },
              { id: "c", label: "See whether trusted friends have shared it.", verdict: "weaker", explanation: "Sharing shows trust in each other, not evidence about the video." },
            ],
          },
        },
        { id: "uncertain", label: "Saying what remains uncertain", kind: "reasoning", items: ["desk/motive", "desk/shares"] },
        { id: "decide", label: "Making a publishing decision that fits the evidence", kind: "reasoning", items: ["decide"] },
        { id: "new-post", label: "Investigating a new viral post, without hints", kind: "transfer", items: ["transfer/lead/transcript", "transfer/lead/satire", "transfer/speech", "transfer/origin", "transfer/intent"] },
        { id: "explain", label: "Writing up what is known, uncertain and recommended", kind: "reasoning", items: ["explain"] },
      ],
      nextMissionId: "m09-fairness",
    },
  ],
};
