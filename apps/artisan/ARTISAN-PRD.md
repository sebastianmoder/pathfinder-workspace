# ARTISAN — Product Requirements Document

**Version:** 1.0  
**Date:** 2 November 2026  
**Status:** Proposed product scope for design and implementation  
**Product promise:** Learn to think better with AI.

## 1. Product purpose

ARTISAN is an interactive website where learners practise understanding, evaluating, and using AI. It develops critical thinking through investigations, experiments, quizzes, and roleplay. Learners make decisions, examine evidence, receive feedback, and apply their skills in a new situation.

The complete product covers the full AI literacy journey. It must be possible to build and release one module at a time, with each module providing a useful standalone experience and contributing to a coherent learning pathway.

The pilot will test the learning experience with minimal tooling. It will have no accounts or database. The learner's browser remembers which missions they have finished, so the journey map can show their path on a later visit; nothing they chose or wrote is stored. Most pilot interactions will use authored scenarios and feedback; a live AI connection is optional and is not required to launch.

## 2. Audience and assumptions

The initial design assumes general learners with no programming knowledge. Examples should be understandable to older students and adults, using situations from learning, work, and everyday life. The intended age group and pilot recruitment setting should be confirmed before participant testing; they do not prevent product design from starting.

Primary learner needs:

- Understand what AI can do, where it fails, and when using it is appropriate.
- Judge an output using evidence rather than confidence, fluency, or appearance.
- Use AI to question, develop, and communicate their own thinking.
- Recognize privacy, fairness, authorship, and broader social considerations.
- Practise in a safe setting before applying a skill elsewhere.
- Stop and return without registering or remembering a login.

Secondary users are facilitators who introduce ARTISAN to a group. The pilot should work in a facilitated session, but must also be understandable without an instructor. Facilitator accounts and dashboards are outside pilot scope.

## 3. Goals and boundaries

### Product goals

1. Build practical judgment across the main dimensions of AI literacy.
2. Make reasoning visible through learner decisions, evidence annotations, and explanations.
3. Use interaction to teach concepts that would be difficult to understand from text alone.
4. Support independent module releases without fragmenting the journey.
5. Demonstrate transfer: learners can apply a skill to a different case with less assistance.
6. Keep the pilot simple enough to produce, review, and maintain with a small team.

### Pilot success questions

- Can a learner start and complete a mission without facilitation?
- Do learners investigate evidence and revise judgments for defensible reasons?
- Can they apply verification and argument-evaluation skills in an unfamiliar case?
- Can they find their way back into the journey on a later visit, from the map?
- Which interactions improve understanding, and which merely add effort?

### Outside pilot scope

- Accounts, a database, permanent profiles, or synchronized learning records.
- A content management system, instructor dashboard, or learning management integration.
- Leaderboards, social feeds, multiplayer, or public learner portfolios.
- Automated certification or claims of validated proficiency.
- General-purpose AI chat, autonomous agents, or real external tool actions.
- Uploading personal documents, training models, or generating video and audio.
- Mandatory analytics or additional tracking services.

## 4. Experience principles

**Judgment before explanation.** Ask learners to make an initial decision before revealing an explanation, where doing so serves the activity.

**Interaction must have a learning purpose.** Every control should help a learner test an assumption, compare alternatives, inspect evidence, or make a consequential choice. Decorative clicking is insufficient.

**Evidence earns trust.** Include correct, incorrect, incomplete, and ambiguous AI outputs. Reward appropriate reliance as well as appropriate skepticism.

**Revision is progress.** Learners should feel comfortable changing their minds and explaining why. Do not award points for agreeing with an AI character.

**Assistance gradually fades.** Early missions provide examples and hints. Later missions reuse the skill with fewer prompts.

**Simplifications are visible.** Label fictional cases, scripted roleplay, and simplified model simulations clearly. Do not present an animation as access to a model's actual thoughts.

**Access does not depend on game performance.** Learners can retry, inspect an explanation, or continue. The journey recommends an order without enforcing account-based gates.

## 5. The complete learning journey

The curriculum has four stages, followed by a capstone. The stages organize the experience; they are not requirements to build an entire stage before releasing a module.

| Stage | Learner question | Modules | Stage outcome |
| --- | --- | --- | --- |
| 1. Understand and choose | What is AI, and how should I work with it? | M01–M03 | Explain basic capabilities and limits, select an appropriate use, and prepare a useful brief. |
| 2. Investigate and think | How do I evaluate outputs and improve my thinking? | M04–M07 | Check claims, challenge arguments, learn with assistance, and evaluate numbers. |
| 3. Create and act responsibly | How do I work with AI in a way I can justify? | M08–M11 | Evaluate media, examine fairness, protect information, and make responsible creative choices. |
| 4. Design and participate | How do AI systems affect people beyond one conversation? | M12–M13 | Design a supervised workflow and evaluate wider consequences. |
| Capstone | Can I bring these skills together? | C01 | Produce and defend an evidence-based recommendation for an AI-supported service. |

### End-to-end learner flow

1. **Arrive:** See the product promise, a concrete example activity, an approximate time commitment, and Start or Continue options.
2. **Begin:** Start goes straight into the first mission; each mission opens with its own judgment before any explanation.
3. **Choose:** Follow the recommended next mission or open any available module from the journey map.
4. **Act:** Work through a short scenario, inspect evidence, make choices, and receive focused feedback.
5. **Reflect:** Compare the initial and final judgment and identify a principle to use elsewhere.
6. **Demonstrate:** Complete a short unfamiliar application with less guidance.
7. **Continue or leave:** The debrief shows this stage's stretch of the path and the next mission. Leaving for the map mid-mission keeps the place for the rest of the visit, and the map offers Resume.
8. **Return:** On a later visit, the map shows the missions finished on this device and where the learner left off. An unfinished mission restarts at its opening brief.
9. **Integrate:** Complete stage-level bridge challenges and eventually the capstone.

**Proposed duration:** 8–15 minutes for a typical mission, with longer modules divided into multiple missions. These are design targets to validate in the pilot, not enforced timers.

## 6. How modules work independently and together

### Shared module structure

Every module must contain:

1. A plain-language learning outcome and an opening scenario.
2. A short refresher covering any assumed knowledge.
3. An initial learner judgment or attempt.
4. At least one meaningful interactive activity.
5. Feedback tied to a visible choice, action, or piece of evidence.
6. A revised answer or explanation.
7. A transfer task using a different example.
8. A debrief, practical takeaway, replay option, and next-step recommendation.
9. A place on the journey map and a clearly defined restart point (the opening brief).

### Rules for independent release

- A module must not require an unfinished module to function.
- Recommended prior learning is advisory. An embedded refresher supplies essential context.
- Shared controls, terminology, and feedback patterns stay consistent across releases.
- The journey map shows only available modules as playable. Planned modules are clearly labeled and have no empty destinations.
- Each released module has a complete opening, activity, assessment, and ending.
- Retired routes keep working as redirects, so old links still lead somewhere useful.

### Integration across the journey

**Shared habits:** Reuse the same labels for claims, evidence, uncertainty, revision, and responsibility.

**Recurring fictional setting:** Revisit a fictional learning and community organization through different roles. The learner may be its researcher, editor, adviser, or system designer. Each case still explains its own context.

**Portable learning outputs:** Modules produce a small result, such as a checked claim, an argument map, a delegation decision, or a workflow plan. Later activities reuse the same format. Current-session work can be carried forward when available; a prepared example must always be available for returning learners.

**Bridge challenges:** A stage ends with a short case combining two or more earlier skills. Bridge challenges are added after the relevant modules exist.

**No hidden continuity dependency:** Later missions must not depend on answers from an earlier visit. Saved progress records which missions are finished, never the answers given in them. The capstone must remain usable with provided case materials.

## 7. Module requirements

### M01 — Inside the Machine

**Outcome:** Explain training versus use, identify common AI functions, and describe why plausible output can be wrong.

**Core mission:** Operate a miniature prediction machine. Change the examples it learns from, predict a continuation, then compare the result with the intended meaning. Sort everyday products by the AI functions they use.

**Interactive design:** A step-by-step data-to-output diagram, selectable training examples, and a next-word comparison. Use a deliberately small, labeled toy model with predictable behavior.

**Evidence of learning:** The learner distinguishes pattern prediction from evidence of factual correctness and explains one limitation in a new example.

**Integration:** Introduces the vocabulary used throughout ARTISAN. No prerequisite. **Pilot:** Required; implement a single complete mission first.

### M02 — The Delegation Desk

**Outcome:** Choose an appropriate role for AI and identify who remains responsible for a decision.

**Core mission:** Triage a fictional team's tasks into human-led, AI-assisted, and supervised automation options. Cases vary in stakes, available evidence, sensitivity, and reversibility.

**Interactive design:** A task inbox with selectable assignments and an outcome panel. Later events reveal the consequences of earlier choices. Show tradeoffs in words before introducing any numerical indicators.

**Evidence of learning:** The learner justifies a delegation choice and identifies a case where choosing not to use AI is appropriate.

**Integration:** Supplies task-selection habits for prompting and workflow design. M01 recommended; a short refresher is included. **Pilot:** Later release.

### M03 — The Briefing Studio

**Outcome:** Communicate an objective, relevant context, constraints, and criteria for a useful response.

**Core mission:** Improve an ambiguous brief. Change one element at a time, compare outputs, and decide whether the next step is a better prompt, more evidence, or a clarifying question.

**Interactive design:** A prompt workspace, a comparison view, and an editable checklist. Initial versions can show authored outputs for predefined changes.

**Evidence of learning:** The learner creates a usable brief for a new task and evaluates the response against stated criteria.

**Integration:** Introduces explicit criteria reused in creative work and system evaluation. M02 recommended. **Pilot:** Later release.

### M04 — The Evidence Bureau

**Outcome:** Identify checkable claims, assess source support, and distinguish false, unsupported, outdated, and misleading statements.

**Core mission:** Audit an AI-generated briefing containing a mixture of sound claims and problems. Inspect an authored source pack, connect claims to evidence, and decide what can be retained, qualified, corrected, or removed.

**Interactive design:** Clickable claim highlights, a source drawer, source dates, evidence links, and an annotated final briefing. A citation that exists but does not support its attached claim is a required case type.

**Evidence of learning:** The learner checks a new claim using the right passage and explains why the evidence does or does not support it. Include correct claims to test justified trust.

**Integration:** Produces the evidence-checking method reused in arguments, data, media, and the capstone. M01 recommended. **Pilot:** Required; the main investigation experience.

### M05 — The Argument Forge

**Outcome:** Identify assumptions, test objections, consider alternatives, and revise a position for evidence-based reasons.

**Core mission:** Take a position on a fictional proposal. Engage with a Socratic coach, an opposing advocate, and an evidence critic, then submit a revised argument.

**Interactive design:** A small argument map connecting a claim, reasons, evidence, and objections. Roleplay choices include asking for evidence, testing an assumption, proposing an alternative, and conceding a point.

**Evidence of learning:** The learner strengthens an opposing argument, identifies a missing premise, and states what evidence would change their mind. Changing a conclusion is not required if it remains justified.

**Integration:** Reuses M04's claim and evidence labels. M04 recommended; supply a refresher and complete evidence pack. **Pilot:** Required; authored branching dialogue is sufficient.

### M06 — The Thinking Gym

**Outcome:** Use AI assistance to learn while retaining the ability to perform independently.

**Core mission:** Attempt a problem, choose an appropriate form of help, and solve a related problem later without assistance. In a second mission, teach a fictional learner who holds a specific misconception.

**Interactive design:** A hint ladder, comparison of initial and revised work, and a teach-it-back roleplay. Help choices explain what support they provide.

**Evidence of learning:** Independent performance on the transfer task and a clear explanation of the concept. Using a hint is not itself a failure.

**Integration:** Establishes the fading-support pattern for advanced missions. M05 recommended. **Pilot:** Later release.

### M07 — The Numbers Lab

**Outcome:** Check numerical claims and recognize misleading comparisons, sampling problems, and unsupported causal conclusions.

**Core mission:** Audit a fictional AI-generated presentation. Check a calculation, repair a misleading chart, and assess whether a conclusion survives a change in the data.

**Interactive design:** Linked tables and charts; adjustable sample sizes, denominators, or thresholds; a visible comparison with the original claim. Calculations use known rules and reviewed examples.

**Evidence of learning:** The learner corrects a new numerical claim and explains the effect of the error on the decision.

**Integration:** Extends evidence checking to quantitative material and prepares learners for fairness analysis. M04 recommended. **Pilot:** Later release.

### M08 — The Newsroom

**Outcome:** Evaluate provenance, corroboration, context, and persuasive framing in synthetic or potentially manipulated media.

**Core mission:** Decide whether a fictional newsroom should publish a viral story. Interview a source, inspect a timeline, check available records, and respond to pressure from an editor.

**Interactive design:** A media card, provenance timeline, source interview, and branching publication decision. Begin with text and still images; audio and video can be added later with transcripts.

**Evidence of learning:** The learner explains what is known, what remains uncertain, and whether to publish, qualify, investigate, or hold. Appearance alone must not be the decisive authenticity test.

**Integration:** Combines M04 verification with M05 argument evaluation. **Pilot:** Later release.

### M09 — The Fairness Council

**Outcome:** Recognize how data, labels, objectives, and deployment choices can create uneven outcomes.

**Core mission:** Evaluate a fictional application-screening system. Inspect mistakes, compare outcomes across groups, and hear from affected applicants, a manager, and an auditor.

**Interactive design:** A plain-language error table, linked outcome distributions, adjustable thresholds, and stakeholder cards. Add complexity progressively; explain terms when they appear.

**Evidence of learning:** The learner identifies a source of unfairness, proposes a change, and describes a tradeoff or limitation. Distinguish factual errors from choices requiring ethical justification.

**Integration:** Reuses numerical evaluation and feeds into workflow design and social impact. M07 recommended. **Pilot:** Later release.

### M10 — The Boundary Room

**Outcome:** Recognize sensitive information, choose appropriate permissions, and detect instructions embedded in untrusted material.

**Core mission:** Prepare fictional documents for an assistant by removing unnecessary sensitive details. Then inspect a document that tries to redirect the assistant away from its actual task.

**Interactive design:** Click-to-redact text, permission choices, and an information-flow diagram showing which party receives which information. All tool actions remain simulated.

**Evidence of learning:** The learner minimizes unnecessary disclosure and distinguishes task instructions from untrusted document content in a fresh example.

**Integration:** Supplies information and permission boundaries for creative work, agents, and the capstone. M01 and M04 recommended. **Pilot:** Later release.

### M11 — The Co-Creation Studio

**Outcome:** Develop creative work with AI while retaining intent, editorial responsibility, and appropriate transparency.

**Core mission:** Create a small campaign or story from a fictional client brief. Compare alternatives, respond to a change in requirements, and describe contributions by the learner and AI.

**Interactive design:** A version tree, comparison workspace, client roleplay, and contribution record. Start with text and provided visual assets; generation services are optional extensions.

**Evidence of learning:** The learner explains editorial decisions and applies supplied rules on attribution, permission, and disclosure. Context-dependent ownership questions should include the relevant policy or source material.

**Integration:** Combines briefing, critical evaluation, and privacy habits. M03 and M10 recommended. **Pilot:** Later release.

### M12 — The Systems Workshop

**Outcome:** Explain how models, source retrieval, tools, permissions, tests, and human review form an AI workflow.

**Core mission:** Assemble a simulated assistant from predefined steps, then test it against normal cases, missing evidence, misleading documents, and tool failures.

**Interactive design:** A step selector and executable workflow diagram showing inputs, outputs, and failure points. Begin with a small set of fixed arrangements; a freeform canvas is an optional extension.

**Evidence of learning:** The learner identifies a failure, changes the workflow, reruns the relevant tests, and makes a defensible launch or hold decision.

**Integration:** Combines delegation, verification, fairness, and permission boundaries. M02, M04, M09, and M10 recommended. **Pilot:** Later release; no real autonomous agents required.

### M13 — The Citizens' Assembly

**Outcome:** Evaluate who benefits from an AI system, who bears its costs, and what conditions should govern its use.

**Core mission:** Advise a fictional town considering an AI-supported service. Examine evidence about access, labor, accessibility, environmental resource use, and accountability. Interview stakeholders and propose conditions for adoption.

**Interactive design:** A stakeholder map, evidence cards, a resource-allocation activity, and a decision timeline. Any quantitative estimates must include their assumptions and sources; do not invent precision for the simulation.

**Evidence of learning:** The learner supports a recommendation with evidence, considers affected groups, and explains what new information would justify a change. Multiple conclusions may be defensible.

**Integration:** Extends individual decisions to collective consequences and prepares the capstone. M09 and M12 recommended. **Pilot:** Later release.

### C01 — The ARTISAN Commission

**Outcome:** Combine the curriculum's skills in a coherent recommendation.

**Core mission:** A fictional organization wants to launch an AI-supported public information service. The learner selects appropriate uses, checks claims, evaluates a numerical argument, handles sensitive information, tests a workflow, and responds to stakeholder objections.

**Interactive design:** A project workspace connecting an evidence board, workflow plan, decision memo, and review meeting. Divide the capstone into independently restartable chapters.

**Evidence of learning:** A final recommendation covering benefits, limitations, evidence, safeguards, and unresolved questions. Provide a rubric and an opportunity to revise after challenge.

**Integration:** Uses a self-contained case pack, so it remains usable without access to earlier answers. Recommend completing the full pathway first. **Pilot:** Deferred; the pilot transfer mission is a small precursor, not a substitute for this capstone.

## 8. Interactive design requirements

### Shared mission workspace

The main workspace should provide:

- A concise mission brief and current task.
- A central artifact, such as a report, chart, conversation, or workflow.
- Contextual access to evidence or relevant controls.
- A visible place to record the learner's judgment.
- A clear primary action and a secondary way to ask for help.
- Mission progress, and a way back to the journey map that keeps the learner's place.

On larger screens, the artifact and evidence can appear side by side. On smaller screens, use clearly labeled views that retain the learner's selection and place. Avoid nested scrolling or interactions that require hovering.

### Reusable interaction patterns

| Pattern | Learner action | Learning purpose | First use |
| --- | --- | --- | --- |
| Claim highlighter | Select a claim and classify it | Separate assertions from their support | M04 |
| Source drawer | Open a passage, date, and source description | Check relevance and reliability | M04 |
| Before-and-after comparison | Compare an initial and revised answer | Make learning and revision visible | M01/M04 |
| Confidence check-in | Record certainty before and after investigation | Reflect on the relationship between certainty and evidence | M04 |
| Branching conversation | Choose a question or response strategy | Practise reasoning under social pressure | M05 |
| Small argument map | Connect a claim, reasons, objections, and evidence | Inspect the structure of an argument | M05 |
| Adjustable simulation | Change an assumption and inspect the result | Learn through controlled comparison | M01/M07 |
| Version tree | Compare alternative drafts and choices | Retain creative intent and accountability | M11 |
| Workflow runner | Arrange steps and run reviewed test cases | Understand system behavior and failure | M12 |
| Matching board | Pin each card to its partner, one to one, with a thread drawn between them | See what each check, source or contributor can and can't account for | M08/M11 |
| Ranking | Order a few cards between two labelled ends; only the ends are judged | Weigh problems or actions by what a decision depends on | M07/B01 |
| First move cards | Play an in-scenario first move from a hand of cards, then see it again when rethinking | Commit to a judgment before explanation, in the case's own terms | M01 onward |
| Replay decision | Revisit one choice and see an alternative outcome | Explore consequences without repeating the whole mission | Selected missions |

### Quizzes and feedback

- Use short quizzes at relevant moments rather than long blocks of recall questions.
- Prefer evidence selection, matching claims to sources, identifying a missing premise, and choosing a useful next action.
- Explain why an answer fits the case and why plausible alternatives are weaker.
- Distinguish an incorrect factual answer from a defensible judgment under uncertainty.
- Reveal full explanations after commitment, while keeping help available beforehand.
- Allow retries. Never trap learners in an incorrect branch.
- Keep feedback close to the relevant choice or passage.

### Roleplay

Each character needs a clear role, limited knowledge, and a reason to participate. The activity must explain whether the conversation is scripted or generated.

Pilot roleplay uses authored branches, a small number of meaningful response strategies, and optional private reflection text. Branches reconverge where possible to keep content manageable. Free text is not presented as understood by a scripted character.

A later live AI version may respond more freely, but must preserve the same mission objective, evidence pack, and reviewed feedback criteria. The application determines progression; a model's approval alone must not establish mastery.

### Accessibility and tone

- All activities must be usable with a keyboard and touch.
- Any dragging must have an equivalent select-and-place interaction.
- Labels and shapes must carry meaning alongside color.
- Charts need text summaries and access to underlying values.
- Support reduced motion. Do not require animation to understand a result.
- Provide transcripts and equivalent text tasks for any future audio or video.
- Avoid compulsory timers, punitive streaks, or loss of progress for taking a break.
- Keep the tone curious, clear, and respectful. The workshop metaphor should support adults as well as students.

## 9. Progression and gamification

Use the craft metaphor through mission names, tools, and visible work. The interface should remain understandable without game terminology.

**Journey map:** Show the journey as one route: a sheet per stage, bridge challenges on the seams between stages, and the capstone at the end, whose seal fills one notch per finished stage. Mark each stop as finished, under way, next, or not started, by shape as well as colour. Selecting a stop shows what the mission is and practises, and the one action that opens it. Completion is kept on this device only, and the learner can clear it. It is not a credential or a learner record.

**Skill recognition:** Mission debriefs can recognize specific demonstrated actions, such as tracing a claim to evidence or identifying an unsupported assumption. These are formative acknowledgments, not credentials.

**Revision feedback:** Highlight useful changes in reasoning. Do not reward revision simply because an answer changed.

**Confidence:** Show initial and final confidence alongside the evidence considered. Keep confidence separate from points or badges so learners have no incentive to misreport certainty. Avoid a single overall literacy score in the pilot.

**Replay:** Let learners inspect another decision path after completing a mission. Keep the original and replayed outcomes distinguishable within the session.

**Learning summary:** Present a short end-of-session summary with takeaways and judgments from this tab. Learners can copy or print it, and can clear the progress this device remembers. A permanent portfolio can be considered after the pilot.

## 10. Pilot scope

### Included journey

| Step | Pilot content | Proposed duration | Purpose |
| --- | --- | --- | --- |
| P0 | Welcome, with a one-question example | 1–2 minutes | Establish expectations; Start opens M01 directly |
| P1 | M01: one foundations mission | 8–10 minutes | Establish a usable mental model |
| P2 | M04: one evidence investigation | 12–15 minutes | Practise claim checking and source support |
| P3 | M05: one argument roleplay | 12–15 minutes | Practise assumptions, objections, and revision |
| P4 | T01: a new combined transfer case | 8–10 minutes | Apply verification and reasoning with fewer hints |
| P5 | Debrief and the next stop on the map | 3–5 minutes | Capture reflection and show the way on |

The proposed total is approximately 45–60 minutes and can be split across visits. If pilot testing shows fatigue, reduce case length before removing the independent transfer task.

### Pilot content requirements

- One fictional setting and a limited cast of characters.
- One complete source pack for M04 and a separate source pack for T01.
- Examples of supported, unsupported, misleading, and incorrect claims across those cases.
- Reviewed answer explanations and a short rubric for open judgments.
- An authored branching roleplay for M05 with meaningful choices and manageable branches.
- A shared brief, evidence drawer, judgment control, debrief, and journey map.
- Text, simple diagrams, and still assets. No media generation or uploads required.
- Complete scripted operation without an AI service dependency.

### Pilot release acceptance

The pilot is ready when:

1. A new learner can complete P0–P5 without an account or instructor intervention.
2. M01, M04, and M05 also work as individual entry points with their own refreshers.
3. Every scored factual item has a reviewed answer and evidence-based explanation.
4. Open judgments use transparent criteria rather than an unexplained right/wrong verdict.
5. Each mission includes a deliberate learner action and a distinct transfer check.
6. A learner returning in the same browser sees their finished missions on the map; a fresh browser shows an empty path with every mission still open.
7. Saved progress holds only finished missions, how far an unfinished one got, and familiar activities; never answers.
8. All essential activities work with keyboard, touch, reduced motion, and a narrow screen.
9. A refresh does not produce a broken state; the learner can restart the mission clearly.
10. The experience remains complete when no external AI service is configured.

## 11. Returning without a database

### Product decision

The browser remembers a learner's path, on this device only, under one key (`artisan_progress`). It holds three things: which missions are finished, the furthest step reached in an unfinished mission, and which kinds of activity are familiar (so their instructions can fold). It never holds a choice, a confidence rating, a note or any written text, and nothing is sent anywhere. Mission passwords and the intake questions were retired; their old pages redirect to the first mission and to the map.

### Learner experience

**During a visit:** Everything a learner does stays in memory for the tab. Leaving a mission for the map keeps its place, and the map offers Resume.

**After a mission:** The debrief shows this stage's stretch of the path with the mission stamped, the next mission and a Start action, and links back to the map, to replay, and to the summary.

**On a later visit:** The welcome page offers to continue with the next or unfinished mission. The map shows finished stops, and for an unfinished one says how far the learner got and that it starts again from the brief, because its answers weren't kept.

### State and limitations

- Restoring a step without its answers would break revisions, branches and epilogues, so an unfinished mission restarts from its brief on a new visit.
- If storage is blocked or cleared, the app works as before; the map just shows no finished missions.
- The summary page offers "Clear my progress on this device", which empties both the stored path and the tab's work.
- Progress on one device does not follow the learner to another. Reliable portable progress would need a separate product decision.

## 12. Content and assessment standards

### Each authored mission needs

- A specific outcome and a plausible scenario.
- A task sequence and all required evidence.
- Reviewed correct answers for factual checks.
- Explanations for likely misconceptions and distractors.
- A rubric for any open response, with more than one acceptable example where appropriate.
- A hint sequence that supports learning without immediately revealing the answer.
- A transfer case that changes the context or surface details.
- A debrief, practical takeaway, and next destination on the journey map.
- A content version and a record of which sources need periodic review.

### Assessment approach

Use four kinds of evidence across the journey:

| Evidence | Example | Use |
| --- | --- | --- |
| Knowledge | Distinguish training from a model responding to an input | Check essential concepts |
| Action | Select the source passage that supports a claim | Assess practical technique |
| Reasoning | Explain why a conclusion needs qualification | Assess judgment against a rubric |
| Transfer | Apply the method to a new report with fewer hints | Check independent application |

The pilot can check closed tasks automatically and provide a rubric with example responses for learner self-assessment on open tasks. Facilitators may review voluntarily shared work. Do not imply that unreviewed free text has received an expert assessment.

Use initial and final judgments to support reflection. A small pilot can reveal usability problems and promising learning signals; it cannot by itself establish that ARTISAN produces lasting improvement in critical thinking.

## 13. Minimal tooling and implementation boundaries

Next.js is the intended framework. The PRD specifies learner behavior and content requirements rather than particular libraries or infrastructure.

The pilot needs only:

- A hosted website containing the journey map, missions, reviewed evidence, and feedback.
- Interactive controls and simple visualizations within the website.
- Temporary state for the active visit, and a small record of finished missions in the browser.
- Copy and browser-print support for the learning summary.

Write and review mission content alongside the website rather than introducing a separate authoring platform. Prefer a few reusable interaction patterns over a unique engine for each module.

**Optional later addition:** One AI provider for a bounded roleplay or coach. Introduce it only after the scripted activity has a clear learning objective and reviewed evaluation criteria. Preserve a scripted fallback and show an understandable retry or fallback option if the connection fails. Keep service credentials outside the browser.

Do not add a database, account service, analytics platform, or third-party workflow tool solely to support the pilot.

## 14. Delivery sequence

Development order differs from the curriculum order so that useful experiences can launch earlier.

| Release | Scope | Integration outcome | Exit condition |
| --- | --- | --- | --- |
| R0 — Shared foundation | Welcome, map, mission shell, debrief, reviewed content format | A reusable structure for all modules | A sample activity can be completed, and the map shows it on return |
| R1 — Foundations | M01 | First complete standalone module | Learners can explain the core limitation in a new example |
| R2 — Verification | M04 and source interactions | M01 → M04 pathway | Learners can distinguish support from citation appearance |
| R3 — Reasoning pilot | M05, T01, pilot learning summary | Complete pilot journey | All pilot acceptance criteria are met |
| R4 — Effective collaboration | M02 and M03, one at a time | Complete Stage 1; connect task choice to briefing | Each module works alone and within the guided sequence |
| R5 — Learning and numbers | M06 and M07, one at a time | Complete Stage 2 and its bridge challenge | Independent transfer and numerical checks are reviewed |
| R6 — Responsible practice | M08, M09, M10, and M11, one at a time | Complete Stage 3 and its bridge challenge | Each new module reuses shared habits and adds its specialist interactions |
| R7 — Systems and society | M12, then M13 | Complete Stage 4 | Workflow and stakeholder decisions have transparent feedback |
| R8 — Synthesis | C01 in restartable chapters | Full integrated journey | Learners can assemble and defend a complete recommendation |

For each module release: define the outcome, author and review the case, build the simplest complete interaction, check accessibility, test with learners, and connect it to the map and recommended next step.

Avoid blocking an otherwise complete module on optional visual polish or a planned live AI feature.

## 15. Pilot evaluation without tracking infrastructure

Use observed sessions, brief interviews, and optional learner-shared summaries. Aggregate findings manually. The website does not need to record participant activity centrally.

**Proposed operational targets:** At least 80% of observed pilot participants should start the first mission and find their way back to a specified mission from the map without facilitator help. Treat these as provisional design targets, not research claims.

| Question | Evidence to collect | Product response |
| --- | --- | --- |
| Can learners navigate independently? | Observation of starting, opening evidence, and continuing | Simplify labels and task structure where help is needed |
| Does returning work? | Ask learners to come back on a later visit and continue | Improve the map's states and the welcome page's continue action |
| Is verification more systematic? | Compare the starting judgment with the transfer case | Refine examples and feedback where misconceptions persist |
| Does roleplay improve reasoning? | Review assumptions, objections, and revisions using a short rubric | Remove branches that add conversation without learning |
| Is the workload appropriate? | Time observed, unfinished tasks, and learner comments | Shorten case materials or split missions |
| Are interactions accessible? | Keyboard, touch, narrow-screen checks and participant feedback | Fix barriers before adding optional effects |

Where learners voluntarily share a summary, make clear what it contains. Do not send reflections or activity records automatically. The mechanism and consent process for any formal research study must be defined separately before study recruitment.

## 16. Risks and product responses

| Risk | Response |
| --- | --- |
| The curriculum becomes too large to launch | Release complete modules independently and protect the small pilot pathway |
| Learners become suspicious of every AI answer | Include correct outputs and reward evidence-based reliance |
| The game rewards speed or compliance | Prioritize explanation, evidence, and useful revision; keep timers optional |
| Roleplay feels like a quiz in disguise | Give characters distinct motivations and choices with meaningful consequences |
| Scripted dialogue appears to understand arbitrary text | Label it clearly and keep free reflection separate from character responses |
| Live AI gives incorrect feedback | Use reviewed evidence and rubrics; retain authored feedback and a fallback |
| Saved progress implies saved answers | Say on the map and the summary what is kept, and that an unfinished mission restarts from its brief |
| A learner changes device or clears the browser | Keep every published mission open on the map; nothing is locked |
| Later activities require forgotten earlier work | Include refreshers and prepared examples; avoid dependencies on prior-session answers |
| Visual complexity obscures the concept | Start with small diagrams and add controls only when they serve the outcome |
| Content becomes outdated | Prefer durable skills; version cases and review time-sensitive sources |

## 17. Decisions to validate during the pilot

The following choices remain open for evidence from testing. They do not block the initial implementation:

- Which age group and learning context should shape the first examples?
- Is 45–60 minutes suitable, or should the pathway be split into two shorter visits?
- Do learners prefer a visible workshop map or a simpler sequential mission list?
- Which roleplay choices feel meaningful enough to justify expanding the dialogue?
- Does live AI add learning value beyond reviewed scripted branches?
- Are mission-level restart points sufficient, or do longer missions need chapter-level restarts?
- Do learners understand the difference between completing an activity and demonstrating independent transfer?

## 18. Curriculum references

These references inform curriculum breadth. ARTISAN's module structure and interactions are proposed product choices, not claims of endorsement or formal alignment certification.

- [UNESCO — AI competency framework for students](https://www.unesco.org/en/articles/ai-competency-framework-students): human-centered thinking, ethics, AI techniques and applications, and system design.
- [OECD/European Commission — Empowering Learners for the Age of AI](https://www.oecd.org/en/publications/empowering-learners-for-the-age-of-ai_65cd27d4-en.html): AI literacy spanning understanding, critical evaluation, responsible use, and creation.
