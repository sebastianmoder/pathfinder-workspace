import type { Choice, Mission } from "../../types";

const firstMove =
  "Joanna asks: “Could the AI tool send the weekly room-availability email? It lists free rooms from the booking system, goes to staff only, and anyone can reply with a correction.” What do you tell her?";
const firstChoices: Choice[] = [
  {
    id: "a",
    label: "Yes: let it send them, and check a few each month.",
    verdict: "correct",
    explanation:
      "Staff-only, built from complete data, and easy to correct: a mistake here costs little and is quickly caught. A light check is enough supervision, and the time saved is real.",
  },
  {
    id: "b",
    label: "Yes, but a person reads and approves every one first.",
    verdict: "weaker",
    explanation:
      "It would work, but approving a routine list every week adds little. Checking effort belongs where a mistake would cost something.",
  },
  {
    id: "c",
    label: "No: anything sent in the Commons' name needs a person.",
    verdict: "weaker",
    explanation:
      "A blanket rule ignores what a mistake would cost. This email goes to staff, and a wrong room is fixed with one reply.",
  },
];

/**
 * M02 — The Delegation Desk.
 * All cases are fictional. Each role is the reviewed best fit for two of the six main tasks, so the desk rewards
 * appropriate reliance as well as appropriate caution (PRD §4, "Evidence earns trust").
 */
export const m02: Mission = {
  id: "m02-delegation",
  title: "The Delegation Desk",
  outcome: "Choose an appropriate role for AI in a task, and say who stays responsible for the result.",
  scenario:
    "You are the operations adviser at the Riverside Learning Commons, a community learning centre. The team has a new AI tool, and before the new term starts the director has asked you to decide how each waiting request should be handled.",
  approxMinutes: 13,
  meta: {
    version: "1.0",
    reviewedOn: "2026-11-03",
    reviewedBy: "Claude (author self-review against PRD §7 and §12; no independent subject-matter review yet)",
    sourcesToReview: [
      "Whether organisations may paste health or financial details into general AI tools depends on local data-protection rules and the tool's terms; the bursary and food-bank cases keep this general.",
      "Machine translation quality between English, Polish and Arabic changes over time; the translation case relies only on the need for a checker, not on a quality claim.",
    ],
  },
  steps: [
    {
      kind: "brief",
      id: "brief",
      title: "Your task",
      body: "Sort the team's waiting requests into three roles for AI, see what happens a few weeks later, and work out who answers for each result.",
    },
    {
      kind: "refresher",
      id: "refresher",
      title: "A quick refresher",
      body: "AI tools produce output from patterns learned in training. The output reads fluently whether it is right or wrong, so somebody has to decide when that matters. Handing a task to AI can mean three things: a person does it without AI (human-led), AI drafts and a person checks every result (AI-assisted), or AI does it and a person checks samples and fixes problems (supervised automation).",
    },
    {
      kind: "initialJudgment",
      id: "initial",
      prompt: firstMove,
      choices: firstChoices,
      motifs: ["decisiveFits"],
    },
    {
      kind: "delegation",
      id: "desk",
      title: "Triage the inbox",
      intro:
        "Six requests are waiting. Choose a role for AI in each one. Nothing is revealed until you send all six, and then you will see how each went a few weeks into term.",
      delegation: {
        later: "Three weeks into term",
        tasks: [
          {
            id: "bursary",
            from: "Joanna, director",
            title: "Award the hardship bursaries",
            text: "We have 14 applications for 6 hardship bursaries. Each has a personal statement about money, health or family. Could the AI tool decide who gets them? It would be quicker, and maybe fairer.",
            factors: {
              stakes: "A refused applicant may not be able to afford the course at all.",
              evidence: "Fourteen personal statements, read against criteria that need judgment.",
              sensitivity: "Health, money and family details.",
              reversibility: "Hard. A refusal can make someone give up before they could appeal.",
            },
            hint: "With 14 applications, is speed really the problem? And what would a refused applicant need to be told?",
            responsible: "Joanna and the bursary panel answer for every award and refusal. A tool can't explain a decision to an applicant.",
            outcomes: {
              human: {
                verdict: "correct",
                event: "The panel of two read all 14 statements in an afternoon. One applicant had mentioned, in a single line, that she cared for her mother, and that decided a close call. Every applicant heard the reason from a named person.",
                explanation: "High stakes, sensitive details, a small number of cases and a decision that is hard to undo: this is a case where not using AI is the sound choice. Speed was never the bottleneck.",
              },
              assisted: {
                verdict: "weaker",
                event: "The panel decided from the AI's tidy summaries. One summary left out that an applicant was a carer. She appealed, and the panel had to reread every statement anyway. The statements had also been pasted into a tool the Commons had not approved for health information.",
                explanation: "A summary decides what the panel sees, so it shapes the decision even when a person signs it off. With only 14 statements, it saved little time, and it sent sensitive details somewhere they shouldn't have gone.",
              },
              automated: {
                verdict: "weaker",
                event: "The tool ranked the applications, and the top six were told they had a bursary. Two refused applicants asked why. Nobody could explain the ranking, and one had been marked down for a short statement written in their second language.",
                explanation: "Nobody could give a reason for a refusal, and a pattern in the writing, not the need, decided an outcome. Spot-checks after the event don't help someone already turned away.",
              },
            },
          },
          {
            id: "reminders",
            from: "Sam, front desk",
            title: "Send booking reminders",
            text: "Could we send the reminder texts the day before each room booking? Room, time, and how to cancel. It's about 120 a week, and the booking system already holds all the details.",
            factors: {
              stakes: "Someone might go to the wrong room or forget to cancel.",
              evidence: "Every detail is already in the booking system.",
              sensitivity: "Names and phone numbers the Commons already holds for this purpose.",
              reversibility: "Easy. A follow-up text can correct a wrong reminder.",
            },
            hint: "If one reminder is wrong, what happens next, and how would anyone find out?",
            responsible: "Sam, who runs the bookings, answers for the reminders, whoever or whatever sends them.",
            outcomes: {
              human: {
                verdict: "weaker",
                event: "Sam typed every reminder. It took four hours a week, two went to the wrong numbers after a copying slip, and the queue at the front desk grew while Sam typed.",
                explanation: "Keeping AI out is not automatically the safe choice. Copying by hand creates its own mistakes, and nothing in this task needs a person's judgment.",
              },
              assisted: {
                verdict: "defensible",
                event: "Sam approved every reminder before it went. It took about two hours a week, and by the third week Sam was clicking approve without reading. The one wrong room slipped through anyway.",
                explanation: "It works, but checking 120 near-identical messages a week wears attention down until the check means little. A sample check would have caught as much for far less time.",
              },
              automated: {
                verdict: "correct",
                event: "360 reminders went out. Sam's weekly check of ten found one listing the old room: the booking had been changed after the reminder was sent. Sam added a rule to resend after any change.",
                explanation: "Low stakes, complete data and easy correction suit supervised automation. The spot-check did its job: it found a problem and led to a fix.",
              },
            },
          },
          {
            id: "translation",
            from: "Tomasz, communications",
            title: "Translate the term newsletter",
            text: "Can we translate the term newsletter into Polish and Arabic? It's mostly events and opening times. There's no budget for a translator, but two volunteers read those languages.",
            factors: {
              stakes: "A wrong date or time could send families to a locked building.",
              evidence: "The English newsletter, and two volunteers who could check a translation.",
              sensitivity: "None. It is public information.",
              reversibility: "Partly. A correction can follow, but printed copies stay wrong.",
            },
            hint: "Who could check the result, and how long would checking take compared with translating from scratch?",
            responsible: "Tomasz answers for what the newsletter says in every language, including the translations.",
            outcomes: {
              human: {
                verdict: "defensible",
                event: "The volunteers translated it from scratch over a weekend. The translations were good, but the newsletter went out a week late, after the first event had already happened.",
                explanation: "Accurate, but slow. The volunteers' time was better spent checking a draft than writing one, because checking is where their knowledge mattered.",
              },
              assisted: {
                verdict: "correct",
                event: "Each volunteer checked a draft in about an hour. One noticed the Arabic version said the Commons was open on 1 May, a bank holiday, when the English said closed. The newsletter went out on time.",
                explanation: "AI did the slow part, and people who could read the result checked the details that mattered. The check caught exactly the kind of error that would have hurt readers.",
              },
              automated: {
                verdict: "weaker",
                event: "The translations went straight out. Three families arrived on 1 May to find the doors locked: the Arabic version said the Commons was open.",
                explanation: "Nobody on the team could read the output, so a spot-check by staff was impossible. If no one can check a result, supervision is only a word.",
              },
            },
          },
          {
            id: "complaint",
            from: "Sam, front desk",
            title: "Reply to a parent's complaint",
            text: "A parent emailed, upset. Their son was told off in front of everyone at Homework Club and came home in tears. They want to know what we'll do. Could the AI reply?",
            factors: {
              stakes: "The family's trust, and a child's willingness to come back.",
              evidence: "Nobody knows yet what happened. The volunteer hasn't been asked.",
              sensitivity: "A child, a named volunteer, and an upset family.",
              reversibility: "No. A cold or wrong reply can't be unsent.",
            },
            hint: "What does the parent need that a well-written reply can't provide on its own?",
            responsible: "Sam answers for the reply, and Joanna for any action about the volunteer.",
            outcomes: {
              human: {
                verdict: "correct",
                event: "Sam phoned the parent that day, then spoke to the volunteer, who hadn't known the boy was dyslexic. The volunteer apologised to him the next week, and the family stayed.",
                explanation: "The reply depended on facts nobody had yet, and on the parent feeling listened to. Neither can be drafted. This is another case where not using AI was right.",
              },
              assisted: {
                verdict: "defensible",
                event: "Sam spoke to the volunteer first, then asked the AI for a structure for the reply, leaving out all names. Sam rewrote it in their own words. The parent felt heard, though they also asked for a call.",
                explanation: "Defensible, because a person found out what happened, kept names out of the tool and wrote the final reply. AI helped with wording only, and the parent still wanted a person.",
              },
              automated: {
                verdict: "weaker",
                event: "An automatic reply arrived within a minute: “Thank you for your feedback. We take all concerns seriously.” The parent forwarded it to the board, saying nobody had read their email.",
                explanation: "A fast reply that commits to nothing reads as no reply at all. The task needed someone to find out what happened and take responsibility for it.",
              },
            },
          },
          {
            id: "tags",
            from: "Ines, librarian",
            title: "Tag the donated books",
            text: "We've been given 2,000 books. Could the AI tag each one by topic and reading level from its title and blurb, so the catalogue can be searched? Anyone can report a bad tag.",
            factors: {
              stakes: "A book turns up in the wrong search.",
              evidence: "Titles and blurbs for every book.",
              sensitivity: "None.",
              reversibility: "Easy. A tag can be changed in seconds.",
            },
            hint: "A wrong tag is easy to spot and quick to fix. How much checking does that justify?",
            responsible: "Ines answers for the catalogue, including tags she didn't set herself.",
            outcomes: {
              human: {
                verdict: "weaker",
                event: "Ines tagged books by hand, about 60 a day. A month later, 800 books were on the shelves and 1,200 were still in boxes.",
                explanation: "The cost of doing everything by hand was books nobody could borrow. A wrong tag would have cost far less than a month's delay.",
              },
              assisted: {
                verdict: "defensible",
                event: "Ines checked every tag before it went live. It took three weeks, and the books stayed boxed until she finished. She changed about one tag in twelve.",
                explanation: "Careful, and better than by hand, but checking all 2,000 delayed every book to catch mistakes that readers could have reported in minutes.",
              },
              automated: {
                verdict: "correct",
                event: "The tags were done in a day. Ines checked 50 and fixed four reading levels set too high. Readers reported two odd tags in the first month, and both were fixed in minutes.",
                explanation: "Low stakes and easy correction suit supervised automation. The sample check and the reporting route are the supervision.",
              },
            },
          },
          {
            id: "feedback",
            from: "Joanna, director",
            title: "Summarise the course feedback",
            text: "We have 300 anonymous feedback forms from last term. Could the AI summarise them for the board report? The board will decide next term's timetable from it.",
            factors: {
              stakes: "The timetable for next term depends on the summary.",
              evidence: "300 forms that anyone can go back and read.",
              sensitivity: "Low. The forms are anonymous.",
              reversibility: "Partly. Courses can change later, but booked tutors and rooms cost money.",
            },
            hint: "Where will the summary end up, and what decision rests on it?",
            responsible: "Joanna answers for the board report, and the board for the timetable it decides.",
            outcomes: {
              human: {
                verdict: "defensible",
                event: "Two staff read all 300 forms over most of a week. The themes were accurate, but the report reached the board a week late.",
                explanation: "Sound, but slow. The forms are anonymous and can be reread, so checking an AI summary against them would have been just as reliable.",
              },
              assisted: {
                verdict: "correct",
                event: "The AI grouped the comments in minutes. Checking its themes against 30 forms, you found that “most learners want evening classes” rested on 11 comments. The report said 11 of 300, and the board trialled one evening class.",
                explanation: "AI did the sorting, and a person checked the claims that a decision would rest on. The check turned a misleading summary into an accurate one.",
              },
              automated: {
                verdict: "weaker",
                event: "The summary went into the board pack as written: “most learners want evening classes”. Only 11 of 300 forms mentioned evenings. The board approved three evening classes, and two were cancelled for low numbers.",
                explanation: "A decision rested directly on the output, and nobody checked it. A spot-check after the board meeting would have been too late.",
              },
            },
          },
        ],
      },
    },
    {
      kind: "quiz",
      id: "responsible",
      prompt:
        "The booking reminders are automated. One week a reminder gives the wrong room, and a tutor's group waits in the wrong place. Who answers for it?",
      choices: [
        {
          id: "a",
          label: "The company behind the AI tool, since its system sent the text.",
          verdict: "weaker",
          explanation: "The company answers for its tool working as described. The Commons chose to use it for its members and decided how it was checked, so the Commons answers to them.",
        },
        {
          id: "b",
          label: "Sam, who runs bookings and decides how reminders are checked.",
          verdict: "correct",
          explanation: "Handing a task to AI moves the work to setting it up and checking it, but the responsibility stays with the person who runs the task.",
        },
        {
          id: "c",
          label: "Nobody in particular, because an automated system made the error.",
          verdict: "weaker",
          explanation: "Automation doesn't remove responsibility. If nobody answers for a mistake, nobody fixes the cause.",
        },
      ],
      hints: [{ text: "Who chose to automate this, and who could change how it is checked?" }],
    },
    {
      kind: "revision",
      id: "revision",
      initialStepId: "initial",
      prompt:
        "The room emails went well. Now Joanna asks whether the same tool could choose who gets the last three places on the free English course. Twelve people applied, each with a note about their situation. What should decide the role AI plays?",
      choices: [
        {
          id: "a",
          label: "That it did well on the room emails, so it has earned more.",
          verdict: "weaker",
          explanation: "A good record on low-stakes work says little about a decision like this. What matters is what a mistake would cost here, and who would catch it.",
        },
        {
          id: "b",
          label: "That a wrong refusal is costly, hard to undo and easy to miss.",
          verdict: "correct",
          explanation: "Twelve personal notes, a decision that is hard to reverse, and an applicant who may never complain: a person should decide, and be able to explain why.",
        },
        {
          id: "c",
          label: "That twelve is few enough to check every ranking it makes.",
          verdict: "weaker",
          explanation: "Checking a ranking still lets the tool frame the decision, and the notes hold personal details. With only twelve, a person can simply read them.",
        },
      ],
    },
    {
      kind: "transfer",
      id: "transfer-desk",
      title: "A different desk",
      prompt:
        "You are volunteering at the Hillside Food Bank, a fictional charity with a new AI tool of its own. Three requests are waiting. This time there are no trade-offs listed and no hints.",
      delegation: {
        later: "Two months later",
        support: "independent",
        tasks: [
          {
            id: "shifts",
            from: "Dev, volunteer coordinator",
            title: "Sort the volunteer sign-ups",
            text: "400 people filled in our volunteer form, with free-text answers about when they can help. Could the AI sort them into morning, afternoon and weekend shifts? Everyone gets their shift by email and can ask to swap.",
            responsible: "Dev answers for the rota, however the first draft of it was made.",
            outcomes: {
              human: {
                verdict: "weaker",
                event: "Dev sorted the forms by hand over three weeks. By the time the rota went out, a third of the volunteers had found other things to do.",
                explanation: "The cost of a wrong shift is one swap request. The cost of three weeks' delay was a third of the volunteers.",
              },
              assisted: {
                verdict: "defensible",
                event: "Dev checked all 400 placements before sending them. It took a week, and Dev moved about one in twenty.",
                explanation: "It works, but every volunteer can already check and correct their own shift, so a full check before sending was mostly repeated effort.",
              },
              automated: {
                verdict: "correct",
                event: "The rota went out in two days. Dev checked 30 placements and fixed one, and 14 volunteers asked to swap. All were sorted within the week.",
                explanation: "Low stakes, easy correction, and the people affected can see and fix the result: this suits supervised automation.",
              },
            },
          },
          {
            id: "extra-visits",
            from: "Grace, manager",
            title: "Decide on extra visits",
            text: "A family has used their six visits for the year and asked for more. Their message mentions a job loss and a child's illness. Could the AI decide, so we're consistent?",
            responsible: "Grace answers for the decision and for explaining it to the family.",
            outcomes: {
              human: {
                verdict: "correct",
                event: "Grace spoke to the family and agreed four more visits, with a referral to a debt adviser. The family came back to say the referral helped most.",
                explanation: "One family, sensitive details, and a decision that matters a great deal to them: a person should decide and be able to explain why. Consistency comes from clear criteria, not from a tool.",
              },
              assisted: {
                verdict: "weaker",
                event: "The AI recommended refusing, citing the six-visit limit. Grace agreed without speaking to the family. They didn't come back, and a neighbour later told staff what had happened.",
                explanation: "A recommendation from a tool pulls a decision towards itself, and this one had nothing to go on but a short message. The family's details also went to a tool for no good reason.",
              },
              automated: {
                verdict: "weaker",
                event: "The tool sent an automatic refusal citing the six-visit limit. The family didn't come back.",
                explanation: "A rule applied automatically can't weigh circumstances, and a refusal nobody can explain can't be put right once the family has gone.",
              },
            },
          },
          {
            id: "grant-letter",
            from: "Grace, manager",
            title: "Draft the council grant letter",
            text: "Our council grant needs renewing. Could the AI write the letter? Our annual figures are in last year's report.",
            responsible: "Grace answers for every figure and promise in the letter she signs.",
            outcomes: {
              human: {
                verdict: "defensible",
                event: "Grace wrote the letter herself over two evenings. It was accurate and was sent on time.",
                explanation: "Fine, if Grace has the time. A draft she checked would have done the same job sooner.",
              },
              assisted: {
                verdict: "correct",
                event: "The AI drafted the letter in minutes. Checking it against the report, Grace found it said 12,000 families had been helped. The report said 1,200. She corrected it, and the grant was renewed.",
                explanation: "AI did the drafting, and a person checked every figure against the source before signing. The figures were exactly where checking mattered.",
              },
              automated: {
                verdict: "weaker",
                event: "The letter went out as drafted, claiming 12,000 families helped. The report said 1,200. A council officer noticed, and the grant was delayed while the food bank explained.",
                explanation: "A letter makes claims in the charity's name. Once it is sent, a mistake becomes the charity's mistake.",
              },
            },
          },
        ],
      },
    },
    {
      kind: "openResponse",
      id: "justify",
      prompt:
        "A colleague at the food bank says: “The AI gets the extra-visit decisions right 19 times out of 20, so let's let it make them and save hours.” Write a reply that agrees or disagrees, and give your reasons.",
      rubric: {
        samples: [
          {
            id: "partial",
            text: "I disagree. AI makes mistakes, so a person should do it.",
            met: [],
            note: "It takes a position, but “AI makes mistakes” would rule out every task. It doesn't say what the mistake costs here, or who answers for it.",
          },
          {
            id: "full",
            text: "I disagree. The one family in twenty that is wrongly refused may go without food, and they might never tell us, so we wouldn't catch it. Grace would still have to explain a decision she didn't make. AI could help by drafting letters, but a person should decide.",
            met: ["cost", "catch", "responsible"],
            note: "It names the cost and who bears it, says the mistake would go unnoticed, and says who stays responsible.",
          },
        ],
        criteria: [
          { id: "cost", text: "Says what the 1-in-20 mistake would cost, and who would bear it." },
          { id: "catch", text: "Says whether a mistake would be noticed, and whether it could be put right." },
          { id: "responsible", text: "Says who would still answer for each decision." },
        ],
        examples: [
          "No. The twentieth family could be refused food they needed, and a refused family usually just doesn't come back, so nobody would spot the error. Grace would still be the one answering for it. Saving hours isn't worth that.",
          "I'd keep a person deciding. Being wrong once in twenty sounds small, but here it means a family going hungry, and the mistake can't be undone afterwards. The manager remains responsible either way, so she should make the call. AI could help with the paperwork instead.",
        ],
      },
    },
    {
      kind: "debrief",
      id: "debrief",
      takeaway: "Before handing work to AI, ask what a mistake would cost, who would notice it, and who answers for it. Then decide how much a person checks.",
      skills: [
        {
          id: "keep-ai-out",
          label: "Recognising when not to use AI",
          kind: "action",
          items: ["desk/bursary", "desk/complaint"],
          practice: {
            prompt: "A school wants AI to decide which pupils are reported to social services, based on attendance and teachers' notes. What role suits AI here?",
            choices: [
              { id: "a", label: "Supervised automation, with a weekly review of a sample of reports.", verdict: "weaker", explanation: "A report can't be undone for a family, and a sample review comes after the harm. Spot-checks suit low-stakes, reversible work." },
              { id: "b", label: "AI-assisted, with a teacher approving each report the tool proposes.", verdict: "weaker", explanation: "A proposal from a tool shapes what the teacher looks at, and sensitive notes about children go into the tool. The safeguards should come from trained staff." },
              { id: "c", label: "Human-led: trained staff decide each case.", verdict: "correct", explanation: "The stakes are high, the information is sensitive and the decision is hard to undo. A person needs to decide and be able to explain why." },
            ],
          },
        },
        {
          id: "rely-where-fits",
          label: "Relying on AI where a mistake is cheap to fix",
          kind: "action",
          items: ["desk/reminders", "desk/tags"],
          practice: {
            prompt: "A sports club wants to send its 600 members an automatic text when a match is moved. All match details are in the club's fixture system. What role suits AI here?",
            choices: [
              { id: "a", label: "Supervised automation, spot-checking a few texts.", verdict: "correct", explanation: "The data is complete, a wrong text is easy to correct, and the stakes are low. Checking a few is enough supervision." },
              { id: "b", label: "Human-led, so no member ever gets a wrong text.", verdict: "weaker", explanation: "Typing 600 texts by hand creates its own mistakes and delays. Keeping AI out isn't automatically the safe option." },
              { id: "c", label: "AI-assisted, approving each text before it goes.", verdict: "weaker", explanation: "Approving 600 identical texts wears attention down until the check means little. A sample check does the same job." },
            ],
          },
        },
        {
          id: "check-where-matters",
          label: "Putting a person's check where a decision rests on AI output",
          kind: "action",
          items: ["desk/translation", "desk/feedback"],
          practice: {
            prompt: "A council wants AI to summarise 2,000 public comments on a new bus route before a vote. What is the soundest set-up?",
            choices: [
              { id: "a", label: "Let the AI summarise, and correct the report if anyone complains after the vote.", verdict: "weaker", explanation: "The vote rests on the summary, so a correction afterwards comes too late." },
              { id: "b", label: "AI groups the comments, and an officer checks key claims against the comments before the vote.", verdict: "correct", explanation: "AI does the sorting, and a person checks the claims the decision rests on, while there is still time to fix them." },
              { id: "c", label: "Officers read all 2,000 comments themselves, and the vote waits until they finish.", verdict: "weaker", explanation: "Reliable, but slow, and checking an AI grouping against the comments would be just as reliable." },
            ],
          },
        },
        {
          id: "who-answers",
          label: "Saying who stays responsible when AI does the work",
          kind: "knowledge",
          items: ["responsible", "revision"],
          practice: {
            prompt: "A bakery uses AI to write the allergen labels for its cakes. A label leaves out nuts. Who answers to the customer?",
            choices: [
              { id: "a", label: "The bakery, because it chose the tool and sells the cake.", verdict: "correct", explanation: "Using a tool doesn't hand over responsibility. The bakery decided how labels are made and checked." },
              { id: "b", label: "The tool's maker, because their system wrote the label.", verdict: "weaker", explanation: "The maker answers for its tool working as described. The bakery chose to rely on it for allergen labels, so it answers to its customers." },
              { id: "c", label: "The customer, who should have asked about allergens.", verdict: "weaker", explanation: "A label exists so customers can rely on it. Shifting the burden to them doesn't fix the cause." },
            ],
          },
        },
        {
          id: "new-desk",
          label: "Choosing roles for AI in a new setting, without hints",
          kind: "transfer",
          items: ["transfer-desk/shifts", "transfer-desk/extra-visits", "transfer-desk/grant-letter"],
        },
        {
          id: "justify-choice",
          label: "Justifying a delegation choice in your own words",
          kind: "reasoning",
          items: ["justify"],
        },
      ],
      nextMissionId: "m03-briefing",
    },
  ],
};
