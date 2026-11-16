import type { CaseStory, Chapter } from "../../story/types";

/**
 * Chapter 1: Something reads well (stage 1: M01, M02, M03 and the FAQ bridge).
 * Nothing here is yet a mystery. Four ordinary things go into the file, each of which sounded finished before
 * anyone had checked it. The FAQ page is the one the player publishes, and the later story returns to it.
 * Scenes only state what the cases themselves establish (see the mission files), plus the through-line.
 */
export const chapter1: Chapter = {
  stage: 1,
  title: "Chapter 1: Something reads well",
  opener: {
    id: "ch1-open",
    place: "office",
    when: "Your first week",
    title: "Chapter 1: Something reads well",
    beats: [
      { text: "The folder on your desk is still empty. The AI tool is not: everyone at the Commons has already asked it something." },
      { text: "Nobody has asked yet how it comes up with its answers." },
    ],
  },
  closer: {
    id: "ch1-close",
    place: "office",
    when: "The last week of term",
    beats: [
      { text: "The folder has four things in it now. An opening time, a sheet of suggestions, an email that could have come from anywhere, and a web page." },
      { text: "None of them is a crime. They have one thing in common: each sounded finished before anyone had checked it." },
      { who: "sam", text: "Post for you. Well, for “The Decision-Maker, Riverside Learning Commons”. I reckon that's you now." },
      { text: "A glossy brochure for something called Brightpath Tutor. “Students finish homework 40% faster.” It names no study." },
      { who: "sam", text: "Forty percent! That's loads." },
      { text: "You put it in the folder." },
    ],
  },
};

export const chapter1Cases: CaseStory[] = [
  {
    moduleId: "M01",
    open: {
      "m01-foundations": {
        id: "m01-open",
        place: "office",
        when: "Tuesday, 9:05",
        beats: [
          { text: "The team chat pings before your coat is off." },
          { who: "sam", text: "The newsletter goes to print tomorrow and I've got a hole on page two. So I asked the tool when the library opens on Saturdays." },
          { who: "sam", text: "Nine o'clock, and it has done since 2019. Sorted! It even knew the year." },
          { text: "It reads well. Sam is already pasting it into the layout." },
        ],
      },
    },
    close: {
      "m01-foundations": {
        id: "m01-close",
        place: "frontDesk",
        when: "Tuesday, 4:30",
        beats: [
          {
            either: [
              { when: { flag: { id: "firstAnswer", is: ["used"] } }, lines: [{ who: "sam", text: "You were going to let me print it, weren't you? Don't worry. So was I." }] },
              { when: { flag: { id: "firstAnswer", is: ["dropped"] } }, lines: [{ who: "sam", text: "You wanted to bin it. And it turns out to be right! I'm not sure which of us that's worse for." }] },
              { lines: [{ who: "sam", text: "You went and read the library's own notice. For one line in a newsletter. I respect that." }] },
            ],
          },
          { text: "The time was right, this once. What stays with you is the rest of the sentence: “as it has since 2019.” Nobody asked it for a year." },
          { text: "You copy the answer onto a card and put it in the folder." },
        ],
      },
    },
    clue: {
      title: "The opening time",
      text: [{ text: "The AI tool gave the library's Saturday opening time, firmly, with a year nobody had asked for. It happened to be right. Nothing in the answer showed that anyone had checked." }],
      ties: [],
    },
  },
  {
    moduleId: "M02",
    open: {
      "m02-delegation": {
        id: "m02-open",
        place: "office",
        when: "The following Monday",
        beats: [
          { who: "joanna", text: "Term starts in a fortnight, and I have six requests on my desk that all begin “Could the AI tool…”" },
          { who: "joanna", text: "It came with a sheet of suggested uses. Reminders, translations, summaries. “Awards and allocations: quicker, and fairer.” I'll admit that one tempted me." },
          {
            either: [
              { when: { flag: { id: "firstAnswer", is: ["used"] } }, lines: [{ who: "joanna", text: "Sam says you'd have printed the library's hours unchecked. Then you know how easy it is." }] },
              { when: { flag: { id: "firstAnswer", is: ["dropped"] } }, lines: [{ who: "joanna", text: "Sam says you wanted to throw the library answer out. It was right, you know. I can't use a researcher who says no to everything." }] },
              { when: { flag: { id: "firstAnswer", is: ["checked"] } }, lines: [{ who: "joanna", text: "Sam says you checked the library's hours before they went to print. Good. Now tell me where that much checking is worth it, and where it isn't." }] },
              { lines: [] },
            ],
          },
          { who: "joanna", text: "Decide how each one should be handled. I'll back you. But for every one, I want to know who answers for it." },
        ],
      },
    },
    close: {
      "m02-delegation": {
        id: "m02-close",
        place: "office",
        when: "The end of term",
        beats: [
          {
            either: [
              { when: { flag: { id: "bursaries", is: ["ranked"] } }, lines: [{ who: "joanna", text: "Two people asked me why they were refused a bursary, and I had nothing to tell them. I won't put my name to something I can't explain again." }] },
              { when: { flag: { id: "bursaries", is: ["summaries"] } }, lines: [{ who: "joanna", text: "One bursary applicant appealed. The summary had left out that she cares for her mother. We reread all fourteen statements in the end." }] },
              { lines: [{ who: "joanna", text: "The bursary panel took an afternoon. One line about caring for a mother decided a close call. I'd never have seen it in a summary." }] },
            ],
          },
          { text: "The sheet of suggested uses is still pinned above Joanna's desk. It doesn't say who wrote it, or who answers when a suggestion goes wrong." },
          { text: "You ask to borrow it, and put it in the folder." },
        ],
      },
    },
    clue: {
      title: "The sheet of suggested uses",
      text: [{ text: "The AI tool arrived with a list of jobs to hand over to it, decisions about people among them. It has no author, and never says who answers when one goes wrong." }],
      ties: [{ moduleId: "M01", why: "Both sound sure of themselves. Neither says who checked." }],
    },
  },
  {
    moduleId: "M03",
    open: {
      "m03-briefing": {
        id: "m03-open",
        place: "homeworkRoom",
        when: "Thursday afternoon",
        beats: [
          { who: "priya", text: "Eight new volunteers on Saturday and no welcome email! So I asked the tool. Look what it gave me!" },
          { who: "priya", text: "Three paragraphs on why volunteering is rewarding. It could be about any club in any town." },
          { who: "priya", text: "Sam says the tool is brilliant. So is it me?" },
        ],
      },
    },
    close: {
      "m03-briefing": {
        id: "m03-close",
        place: "homeworkRoom",
        when: "Friday morning",
        beats: [
          { who: "priya", text: "It's a proper email now! All I did was tell it what I actually wanted, and then check that I'd got it." },
          { who: "priya", text: "The first one wasn't wrong, exactly. It was just nobody's. You could have sent it from anywhere." },
          { text: "You have read writing like that before, this month. Smooth, warm, and about nowhere in particular." },
          { text: "You print Priya's first attempt and put it in the folder." },
        ],
      },
    },
    clue: {
      title: "The email from nowhere",
      text: [{ text: "Ask for nothing in particular and you get writing that could have come from anywhere. It is quick to make and easy to pass on, and it carries no trace of who asked for it or why." }],
      ties: [{ moduleId: "M02", why: "The sheet of suggested uses reads the same way: smooth, and written for nobody in particular." }],
    },
  },
  {
    moduleId: "B01",
    open: {
      "b01-faq": {
        id: "b01-open",
        place: "frontDesk",
        when: "Monday, with a Friday deadline",
        beats: [
          { who: "sam", text: "The same twelve questions, all day. Opening hours, parking, refunds. I could answer them in my sleep." },
          { who: "joanna", text: "So we're putting up an FAQ page. By Friday, and with the tool's help, since we have it." },
          { who: "joanna", text: "Remember what a web page is. Once it's up, it's the Commons saying it. People will take it as our word. So will anything else that reads our site." },
          { text: "It is the first thing you will publish under the Commons' name." },
        ],
      },
    },
    close: {
      "b01-faq": {
        id: "b01-close",
        place: "office",
        when: "Two weeks later",
        beats: [
          {
            either: [
              {
                when: { flag: { id: "faq", is: ["unchecked"] } },
                lines: [
                  { text: "The page went live with a café the Commons doesn't have. A member found it before you did." },
                  { who: "joanna", text: "We've corrected it, and I've written to her. But it was up for a week, and pages get copied." },
                ],
              },
              {
                when: { flag: { id: "faq", is: ["handwritten"] } },
                lines: [{ who: "priya", text: "Twenty answers, all mine, all right. And a week late! Sam answered “where do I park” another two hundred times while I wrote them." }],
              },
              { lines: [{ who: "priya", text: "Three wrong times and one wrong fee. That's what I caught, checking the drafts against the handbook. And every one of them read perfectly!" }] },
            ],
          },
          { who: "joanna", text: "Somebody rang yesterday to say how useful the page is. Not a member. A company. They asked whether their system could “learn from” our public pages." },
          { who: "joanna", text: "I said it's public, so I can hardly stop them. Was that wrong?" },
          { text: "You don't know yet. You print the page as it stood on the day it went live, write the date on it, and put it in the folder." },
        ],
      },
    },
    clue: {
      title: "The FAQ page",
      text: [
        { when: { flag: { id: "faq", is: ["unchecked"] } }, text: "Your FAQ page went live with an invented café and stayed that way for a week. It is public, and a company has asked to let its system learn from it." },
        { when: { flag: { id: "faq", is: ["handwritten"] } }, text: "Your FAQ page went live a week late, every answer written by hand. It is public, and a company has asked to let its system learn from it." },
        { text: "Your FAQ page went live with every fact checked against the handbook. It is public, and a company has asked to let its system learn from it." },
      ],
      ties: [
        { moduleId: "M01", why: "An answer that reads well gets printed. This one carries the Commons' name." },
        { moduleId: "M03", why: "Whatever the page says, it can now be passed on by something that never asks who wrote it." },
      ],
    },
  },
];
