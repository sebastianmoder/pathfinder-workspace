import type { Choice, Mission } from "../../types";

const firstMove = "Priya has messaged you about her first attempt. What do you say?";
const firstChoices: Choice[] = [
  {
    id: "a",
    label: "Yes. Some tools are much better at practical emails.",
    verdict: "weaker",
    explanation: "A different tool still wouldn't know who the email is for or what it must say. It would fill the same gaps with the same typical text.",
  },
  {
    id: "b",
    label: "No. Tell it who it's for, what it's for, and the details.",
    verdict: "correct",
    explanation: "A model fills gaps with the most typical text. Purpose, readers and the facts they need are what only Priya can supply.",
  },
  {
    id: "c",
    label: "No. Write it yourself: AI can't do this kind of email.",
    verdict: "weaker",
    explanation: "It can do this well, given a clear prompt. Generic output usually means generic instructions, not an impossible task.",
  },
];

/**
 * M03 — The Prompt Studio.
 * All cases are fictional. Outputs are authored per prompt element and labelled as such in the interface.
 */
export const m03: Mission = {
  id: "m03-briefing",
  title: "The Prompt Studio",
  outcome: "Give AI a clear objective, the context it needs, constraints and criteria, and judge the response against those criteria.",
  scenario:
    "You help Priya, the Homework Club coordinator at the Riverside Learning Commons, a community learning centre. Eight new volunteers start on Saturday, and Priya has asked you to get the AI tool to draft their welcome email. Her first attempt didn't go well.",
  approxMinutes: 12,
  meta: {
    version: "1.0",
    reviewedOn: "2026-11-03",
    reviewedBy: "Claude (author self-review against PRD §7 and §12; no independent subject-matter review yet)",
    sourcesToReview: ["Outputs are authored, not generated; keep the label in the interface if the studio ever connects to a live model."],
  },
  steps: [
    {
      kind: "brief",
      id: "brief",
      title: "Your task",
      body: "Improve a vague prompt one element at a time, compare what each change does, and check the result against Priya's criteria.",
    },
    {
      kind: "refresher",
      id: "refresher",
      title: "A quick refresher",
      body: "A language model continues text with what is most typical for the words it is given. It doesn't know your situation unless you tell it. A useful prompt says what you want (objective), what it needs to know (context), what it must include (criteria), and limits such as length or style (constraints). Facts it needs, like dates, should come from you, not from the model.",
    },
    {
      kind: "initialJudgment",
      id: "initial",
      prompt: firstMove,
      artefact: {
        kind: "chat",
        messages: [
          { from: "Priya, Homework Club coordinator", text: "I typed “Write something about volunteering” and got three paragraphs on why volunteering is rewarding. Nothing about Saturday! Should I try a different AI tool?" },
        ],
      },
      choices: firstChoices,
    },
    {
      kind: "faultTrace",
      id: "trace",
      title: "Trace the problems",
      prompt: "This is what the AI tool gave Priya. Before changing her prompt, work out which part of it caused each problem.",
      artifact: {
        label: "Priya's prompt: “Write something about volunteering.” The response:",
        text: "Volunteering is one of the most rewarding ways to give back. Across the country, millions of people give their time to causes they care about, and studies suggest it can improve wellbeing.\nVolunteering also builds skills for your CV, helps you meet new people and connects you with your community. Many volunteers say it is the highlight of their week. Whatever brought you here, we hope you find it as rewarding as so many others have, and that you'll stay with us for many terms to come. Thank you again for choosing to give your time.",
      },
      stages: [
        { id: "objective", label: "Objective", help: "What you want produced, and what it is for." },
        { id: "context", label: "Context", help: "What the AI can't know unless you tell it, such as the readers and the facts." },
        { id: "criteria", label: "What it must include", help: "The things a reader needs, which you can check afterwards." },
        { id: "constraints", label: "Length and style", help: "Limits on form, such as length, tone or format." },
      ],
      cases: [
        { id: "general", text: "It's about volunteering in general, not a welcome to Homework Club.", stageId: "objective", explanation: "The prompt never said what to write or what it was for, so the tool wrote the most typical text about the topic it was given." },
        { id: "when", text: "It never says when or where the first session is.", stageId: "context", explanation: "The date, time and room are facts only Priya has. A model can't supply them, only guess." },
        { id: "bring", text: "Nobody reading it would know what to bring or who to ask for.", stageId: "criteria", explanation: "Nothing in the prompt said what the email had to contain, so nothing could be checked, and the practical details were left out." },
        { id: "long", text: "It runs on about CVs and community for a whole paragraph.", stageId: "constraints", explanation: "With no limit on length or style, the tool kept going with typical filler." },
      ],
    },
    {
      kind: "compose",
      id: "studio",
      title: "Fix the brief",
      intro: "Now fix it. Priya's prompt is on the left, with each part set to what she wrote. Change one part at a time, run it, and compare the new response with the previous one.",
      compose: {
        workspaceLabel: "The prompt",
        outputLabel: "The AI's response",
        frame: { kind: "email", from: "Draft from the AI tool, for Priya", to: "New Homework Club volunteers" },
        oneAtATime: true,
        start: { objective: "vague", context: "none", criteria: "none", constraints: "none" },
        elements: [
          {
            id: "objective",
            label: "Objective",
            help: "What you want produced, and what it is for.",
            options: [
              { id: "vague", label: "Write something about volunteering.", output: "Volunteering is one of the most rewarding ways to give back. Across the country, millions of people give their time to causes they care about, and studies suggest it can improve wellbeing." },
              { id: "specific", label: "Write a welcome email to new Homework Club volunteers before their first session.", output: "Subject: Welcome to Homework Club!\nDear volunteer, welcome to Homework Club at the Riverside Learning Commons. We're delighted you're joining us." },
            ],
          },
          {
            id: "context",
            label: "Context",
            help: "What the AI can't know unless you tell it.",
            options: [
              { id: "none", label: "(no context given)", output: "" },
              { id: "wrong", label: "The readers are experienced teachers who have tutored before.", output: "As experienced teachers, you'll know how to plan a lesson, so we'll leave the structure of each session to you." },
              { id: "right", label: "The readers are adults, most new to tutoring. The first session is Saturday 9 November, 10:00, in Room 2.", output: "Your first session is on Saturday 9 November at 10:00 in Room 2. Most of our volunteers are new to tutoring, so there's nothing to plan: you'll be paired with a learner and a regular volunteer." },
            ],
          },
          {
            id: "criteria",
            label: "What it must include",
            help: "The things a reader needs, which you can check afterwards.",
            options: [
              { id: "none", label: "(no requirements given)", output: "" },
              { id: "vague", label: "Make it engaging.", output: "\nGet ready for an amazing journey of learning and growth! Every Saturday is a new adventure, and we can't wait to see the magic you'll bring." },
              { id: "right", label: "Say what to bring (photo ID for the sign-in desk), who to ask for (Priya), and how to cancel (text 07700 900123).", output: "\nPlease bring photo ID for the sign-in desk, and ask for Priya when you arrive. If you can't make it, text 07700 900123 by Friday evening." },
            ],
          },
          {
            id: "constraints",
            label: "Length and style",
            help: "Limits on form, such as length, tone or format.",
            options: [
              { id: "none", label: "(no constraints given)", output: "\nVolunteering also builds skills for your CV, helps you meet new people and connects you with your community. Many volunteers say it is the highlight of their week. Whatever brought you here, we hope you find it as rewarding as so many others have, and that you'll stay with us for many terms to come. Thank you again for choosing to give your time." },
              { id: "formal", label: "Formal register, as an official letter.", output: "\nWe thank you for your esteemed commitment to our institution.\nYours faithfully,\nThe Management" },
              { id: "short", label: "Under 120 words, plain and friendly.", output: "\nThank you for giving your time. See you on Saturday!\nPriya, Homework Club coordinator" },
            ],
          },
        ],
        rounds: [
          {
            id: "welcome",
            title: "Priya's welcome email",
            instruction: "Priya's criteria are in the checklist. Get a response that meets all four, and use the checklist to judge each version you run.",
            criteria: [
              { id: "audience", text: "It is written to new Homework Club volunteers.", requires: { objective: ["specific"] } },
              { id: "details", text: "It gives the right date, time and room, and suits people new to tutoring.", requires: { context: ["right"] } },
              { id: "practical", text: "It says what to bring, who to ask for and how to cancel.", requires: { criteria: ["right"] } },
              { id: "plain", text: "It is short, plain and friendly.", requires: { constraints: ["short"] } },
            ],
            solution: { objective: "specific", context: "right", criteria: "right", constraints: "short" },
            success: "Each criterion was met by the part of the prompt that addressed it. Notice the version with the teachers' context: a fluent response to the wrong context is still wrong, and only you could tell.",
          },
        ],
      },
    },
    {
      kind: "sort",
      id: "next-step",
      prompt: "A better prompt isn't always the answer. For each situation, choose the most useful next step.",
      hints: [{ text: "Ask yourself: is the problem what I told the AI, a fact that needs a source, or something I was never told?" }],
      categories: [
        { id: "brief", label: "Improve the prompt" },
        { id: "evidence", label: "Find evidence" },
        { id: "clarify", label: "Ask a clarifying question" },
      ],
      items: [
        { id: "deadline", label: "The AI's summary of the funding rules is fluent, but you must quote the exact deadline to applicants.", categoryId: "evidence", explanation: "The prompt isn't the problem. A deadline you will quote has to come from the funder's own document." },
        { id: "bullets", label: "The output is a 600-word essay. You needed three bullet points for a slide.", categoryId: "brief", explanation: "You never stated the format. Say it in the prompt." },
        { id: "note", label: "Your manager asked for “a quick note to parents”, and you don't know if it's about the closure or the new timetable.", categoryId: "clarify", explanation: "No prompt can fix a purpose you don't know. Ask the person who asked." },
        { id: "hours", label: "The AI's poster has the wrong opening hours, and you didn't include the hours in your prompt.", categoryId: "brief", explanation: "It can't know facts you didn't give it. Put the hours in the prompt." },
        { id: "grant", label: "The AI says a grant “typically” covers 80% of costs, and your budget depends on that figure.", categoryId: "evidence", explanation: "A figure a decision rests on needs a source. Asking again would only get you more generated text." },
        { id: "leaflet", label: "The draft leaflet is aimed at teenagers, but you were never told who it is for.", categoryId: "clarify", explanation: "The audience is a fact about the job, not something to guess. Ask before rewriting." },
      ],
    },
    {
      kind: "mark",
      id: "parents",
      title: "A new reader",
      prompt: "Priya likes the email and asks: “Can it go to the volunteers' parents too? Two of them are under 18.” Mark the parts of the prompt that must change for that reader.",
      frame: { kind: "document", title: "Priya's prompt", meta: "The version that produced the welcome email" },
      mark: [
        ["Objective: ", { id: "objective", text: "Write a welcome email to new Homework Club volunteers before their first session.", target: false, optional: true, explanation: "It could say who the email is for now. Changing it is reasonable; the parts below matter more." }],
        [
          "Context: ",
          { id: "readers", text: "The readers are adults, most new to tutoring.", target: true, explanation: "The reader has changed: parents of volunteers, two of them under 18. Everything the AI writes follows from who it thinks is reading." },
          " ",
          { id: "session", text: "The first session is Saturday 9 November, 10:00, in Room 2.", target: false, explanation: "Still true, and parents need it too." },
        ],
        ["What it must include: ", { id: "musts", text: "Say what to bring (photo ID for the sign-in desk), who to ask for (Priya), and how to cancel (text 07700 900123).", target: true, explanation: "Parents need other details, such as safeguarding and pick-up. New must-haves give you new criteria to check the response against." }],
        ["Length and style: ", { id: "style", text: "Under 120 words, plain and friendly.", target: false, explanation: "Still fits. A short, plain email suits parents as well as volunteers." }],
      ],
    },
    {
      kind: "revision",
      id: "revision",
      initialStepId: "initial",
      prompt:
        "The welcome email now meets all four of Priya's criteria, and it reads warmly. Priya's manager asks: “Is it ready to send?” What do you do before saying yes?",
      choices: [
        { id: "a", label: "Check every date, time and number against what Priya gave.", verdict: "correct", explanation: "The criteria say what to check, and facts in the email must match the ones in the prompt. A good prompt makes a good response likely, not certain." },
        { id: "b", label: "Check it sounds friendly and professional enough to send.", verdict: "weaker", explanation: "Tone matters, but a warm email with the wrong room still sends eight volunteers to the wrong place." },
        { id: "c", label: "Nothing more: a complete prompt gives a correct response.", verdict: "weaker", explanation: "A model can still slip on a detail it was given. Judging the result against your criteria is the last step of briefing, not an optional one." },
      ],
    },
    {
      kind: "transfer",
      id: "transfer-studio",
      title: "A new brief",
      prompt:
        "The Commons' repair café is changing its hours. Build a prompt for a noticeboard notice. This time there is no guidance on each part, and you can change as many parts as you like between runs.",
      compose: {
        workspaceLabel: "The prompt",
        outputLabel: "The AI's response",
        frame: { kind: "notice" },
        support: "independent",
        start: { objective: "vague", context: "none", criteria: "none", constraints: "none" },
        elements: [
          {
            id: "objective",
            label: "Objective",
            help: "",
            options: [
              { id: "vague", label: "Write about the repair café.", output: "Repair cafés are community events where people fix broken items together, reducing waste and sharing skills." },
              { id: "specific", label: "Write a noticeboard notice announcing the repair café's new hours.", output: "NEW HOURS: Riverside Repair Café." },
            ],
          },
          {
            id: "context",
            label: "Context",
            help: "",
            options: [
              { id: "none", label: "(no context given)", output: "" },
              { id: "old", label: "It runs every Thursday evening, as it always has.", output: "Every Thursday evening, as always." },
              { id: "right", label: "From January, it runs on the first Saturday of each month, 10:00–13:00, in the Workshop, instead of Thursday evenings.", output: "From January: first Saturday of every month, 10:00–13:00, in the Workshop. No more Thursday evenings." },
            ],
          },
          {
            id: "criteria",
            label: "What it must include",
            help: "",
            options: [
              { id: "none", label: "(no requirements given)", output: "" },
              { id: "vague", label: "Make it eye-catching.", output: "Don't miss out on the FIXING FUN!!!" },
              { id: "right", label: "Say what can be repaired (small electricals, bikes and clothes) and that it is free.", output: "Bring small electricals, bikes and clothes. Free." },
            ],
          },
          {
            id: "constraints",
            label: "Length and style",
            help: "",
            options: [
              { id: "none", label: "(no constraints given)", output: "\nThe repair café movement began in Amsterdam in 2009 and has spread around the world. Volunteers share their knowledge, and visitors learn to fix things themselves, which keeps useful items out of landfill." },
              { id: "long", label: "Detailed, including the café's history.", output: "\nOur café was founded by volunteers several years ago and has grown steadily, with many repairs completed and many friendships formed along the way." },
              { id: "short", label: "Under 60 words, in short lines that are easy to read from a distance.", output: "" },
            ],
          },
        ],
        rounds: [
          {
            id: "notice",
            title: "The repair café notice",
            instruction: "Get a notice that meets all four criteria, then judge it with the checklist.",
            criteria: [
              { id: "purpose", text: "It is a notice about the new hours.", requires: { objective: ["specific"] } },
              { id: "hours", text: "It gives the new day, time and place.", requires: { context: ["right"] } },
              { id: "what", text: "It says what can be repaired, and that it is free.", requires: { criteria: ["right"] } },
              { id: "short", text: "It is short and easy to read from a distance.", requires: { constraints: ["short"] } },
            ],
            solution: { objective: "specific", context: "right", criteria: "right", constraints: "short" },
            success: "The notice works because every fact in it came from you, and every requirement was stated and then checked.",
          },
        ],
      },
    },
    {
      kind: "openResponse",
      id: "write-brief",
      prompt:
        "Priya wants the AI tool to draft Homework Club's end-of-term report for the board. Write the prompt you would give it.",
      rubric: {
        samples: [
          { id: "weak", text: "Write a report about Homework Club this term. Make it good.", met: ["objective"], note: "It names the task, but the AI would have to invent the facts, the reader and what counts as good." },
          {
            id: "strong",
            text: "Draft a one-page end-of-term report on Homework Club for the Commons' board, who decide its funding. Use only these figures: 14 sessions, an average of 31 learners, 9 volunteers. It must cover attendance, one problem we faced, and what we need next term. Plain language, headings, no more than 300 words.",
            met: ["objective", "context", "criteria", "constraints"],
            note: "Purpose, reader, the facts to use, what it must cover and limits on form are all there, so the response can be checked.",
          },
        ],
        criteria: [
          { id: "objective", text: "Says what to produce and what it is for." },
          { id: "context", text: "Gives the reader and the facts to use, rather than leaving the AI to supply them." },
          { id: "criteria", text: "States what it must include, in a way that can be checked." },
          { id: "constraints", text: "Sets limits such as length, format or tone." },
        ],
        examples: [
          "Write a short report for the board on Homework Club's autumn term. The board decides next year's funding. Use these facts only: 14 sessions, average attendance 31, 9 volunteers, and the room was double-booked twice. Cover what went well, one problem and one request. Under 300 words, plain English.",
          "Objective: an end-of-term update for board members. Context: here are the attendance numbers and volunteer hours [attached]; don't add other figures. It must include a recommendation about a second session. Format: three short sections with headings, one page.",
        ],
      },
    },
    {
      kind: "debrief",
      id: "debrief",
      takeaway: "Tell AI what you want, who it is for, the facts it needs and how you will judge it. Then judge it that way.",
      skills: [
        {
          id: "trace-brief",
          label: "Tracing a weak response to the part of the prompt that caused it",
          kind: "action",
          items: ["trace/general", "trace/when", "trace/bring", "trace/long"],
        },
        {
          id: "one-element",
          label: "Improving a prompt one element at a time",
          kind: "action",
          items: ["studio/welcome"],
          practice: {
            prompt: "Your prompt for a job advert gives the role and the hours, but the response invents a salary. What should you change first?",
            choices: [
              { id: "a", label: "Add the real salary, or tell it not to mention pay.", verdict: "correct", explanation: "The model filled a gap with a typical figure. Supply the fact, or rule it out." },
              { id: "b", label: "Ask it to be more accurate and to stop inventing anything.", verdict: "weaker", explanation: "It doesn't know which details are invented. Without the real figure, it can only guess again." },
              { id: "c", label: "Make the prompt shorter, so it has less room to invent.", verdict: "weaker", explanation: "Shorter prompts leave more gaps, and gaps are what it fills with typical text." },
            ],
          },
        },
        {
          id: "check-criteria",
          label: "Judging a response against stated criteria",
          kind: "action",
          items: ["studio/welcome/checklist", "transfer-studio/notice/checklist"],
        },
        {
          id: "next-step",
          label: "Choosing between a better prompt, evidence and a question",
          kind: "knowledge",
          items: ["next-step/deadline", "next-step/bullets", "next-step/note", "next-step/hours", "next-step/grant", "next-step/leaflet"],
          practice: {
            prompt: "The AI drafts a reply to a customer quoting a refund policy. You aren't sure the policy it describes is yours. What next?",
            choices: [
              { id: "a", label: "Rewrite the prompt and ask it to describe the policy more carefully.", verdict: "weaker", explanation: "A better prompt won't make it know your policy. Its description is still generated text." },
              { id: "b", label: "Check the wording against your actual refund policy.", verdict: "correct", explanation: "The question is about a fact, so the answer is a source. Better still, put the policy in the prompt next time." },
              { id: "c", label: "Ask the customer what refund they were expecting.", verdict: "weaker", explanation: "The customer can't tell you what your policy says. That is your document to check." },
            ],
          },
        },
        {
          id: "audience",
          label: "Updating a prompt when the reader changes",
          kind: "knowledge",
          items: ["parents/readers", "parents/musts", "parents/style", "revision"],
        },
        {
          id: "new-brief",
          label: "Building a prompt for a new task without guidance",
          kind: "transfer",
          items: ["transfer-studio/notice", "transfer-studio/notice/checklist"],
        },
        {
          id: "write-brief",
          label: "Writing a complete prompt in your own words",
          kind: "reasoning",
          items: ["write-brief"],
        },
      ],
      nextMissionId: "b01-faq",
    },
  ],
};
