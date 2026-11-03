# SAGE: journal evidence and contextual linking review

Implementation status: the evidence, wording, and contextual-link recommendations
have been applied. The review below records the original findings and insertion
points; validation results appear at the end of this document.

## Scope and overall assessment

Read all 30 published MDX pages, the navigation metadata, the five unpublished
drafts, and the existing `CONTENT_REVIEW.md`. Recommendations below concern the
current text, including the revisions already documented in that earlier review.
Line numbers refer to the files as reviewed. Paths in the tables are relative to
`content/`.

The strongest opportunity is targeted substantiation, rather than adding a
reference to every instructional sentence. Retrieval practice, constructive
alignment, rubric quality, feedback, tutoring, and simulation already have useful
journal references. The tutoring page also makes a valuable distinction between
different populations and tutor designs. Preserve those distinctions.

The content-link inventory contains 104 distinct directed links between different
published content routes. This counts authored Markdown links, excluding
automatic sidebar, previous/next navigation, self-links, and external references.
Every published page has an incoming content link. Four pages have no outgoing
SAGE content links: `prompting/assign_job`, `prompting/give_examples`,
`prompting/further_resources`, and `teaching/course_materials`. These are not
unreachable pages; the opportunity is to help readers continue directly from the
example they are reading.

## 1. Opportunities to strengthen evidence

### E1 — High: directly substantiate detector bias and update the evidence balance

**Location:** [genai/ai_detection.mdx](content/genai/ai_detection.mdx), lines 22–33
and 43–46.

The multilingual-writing paragraph lacks a directly attached citation. Add
Liang et al. (2023), **GPT detectors are biased against non-native English
writers**, *Patterns, 4*(7), 100779. The tested detectors frequently misclassified
the non-native English writing samples. Present this as evidence from those
samples and systems, without extending the result to every accessibility aid,
genre, language, or current detector. [Journal article](https://doi.org/10.1016/j.patter.2023.100779).

For the accuracy discussion, supplement the existing conference survey with
Weber-Wulff et al. (2023), **Testing of detection tools for AI-generated text**,
*International Journal for Educational Integrity, 19*, 26. Its evaluation covers
translation, editing, and obfuscation conditions. Retain the date and tested-tool
scope. [Journal article](https://doi.org/10.1007/s40979-023-00146-z).

Balance the older evidence with Van Vlasselaer, Van Droogenbroeck, and Spruyt
(2026), **Who wrote this? Evaluating the reliability of AI detection tools in
higher education**, *International Journal for Educational Integrity, 22*, 16.
It reports stronger performance for one tool on its constructed dataset, while
still rejecting sole-evidence use in consequential decisions. Its analysis of
real theses lacks known authorship ground truth; flagging rates cannot establish
misconduct prevalence. The October correction clarifies the Deep Research model
label and leaves the conclusions unchanged.
[Updated article](https://doi.org/10.1007/s40979-026-00226-w),
[correction](https://doi.org/10.1007/s40979-026-00236-8).

**Suggested framing:** “Evaluations show that detector performance depends on
the tool, text, model, and editing conditions. Some newer systems perform well
on particular datasets; a detector score still cannot establish authorship or
whether an assignment rule was broken.”

### E2 — High: support the automation-bias and human-review rationale

**Location:** [genai/limitations.mdx](content/genai/limitations.mdx), lines 74–83;
[genai/responsible_use.mdx](content/genai/responsible_use.mdx), lines 128–141.

These passages describe overreliance without a directly attached research
reference. Add Goddard, Roudsari, and Wyatt (2012), **Automation bias: a systematic
review of frequency, effect mediators, and mitigators**, *Journal of the American
Medical Informatics Association, 19*(1), 121–127. It supports the risk of accepting
incorrect automated advice and the relevance of workload and verification.
It concerns decision-support systems across fields, with a healthcare focus;
it does not measure an effect size for university chatbot use.
[Journal article](https://doi.org/10.1136/amiajnl-2011-000089).

Separate the model's tendency to agree from the user's automation bias. This
review supports the latter; it does not establish the former or the specific
comparison that users favour AI output over “equally strong human evidence”.
Replace that comparison with “Users may accept automated advice without
adequately checking the underlying evidence.”

### E3 — High: attach existing learning-harm evidence to the general risk page

**Location:** [genai/limitations.mdx](content/genai/limitations.mdx), lines 85–91;
[genai/when_to_use.mdx](content/genai/when_to_use.mdx), lines 19–23.

Reuse Bastani et al. (2025), **Generative AI without guardrails can harm learning:
Evidence from high school mathematics**, *PNAS, 122*(26), e2422633122, already
cited in tutoring and evaluation. It gives the otherwise uncited displaced-
learning warning a concrete empirical example: assisted performance and later
unassisted performance can diverge. Preserve the high-school mathematics setting
and distinction between unrestricted help and the structured tutor; do not
present it as evidence that all AI assistance harms university learning.
[Journal article](https://doi.org/10.1073/pnas.2422633122).

### E4 — High: ground the distinction between task performance and learning

**Location:** [teaching/evaluating_ai.mdx](content/teaching/evaluating_ai.mdx), lines
5–8 and 61–68; [students/writing_instruction.mdx](content/students/writing_instruction.mdx),
lines 156–162; [students/tutoring.mdx](content/students/tutoring.mdx), final learning-check section.

Add Soderstrom and Bjork (2015), **Learning versus performance: An integrative
review**, *Perspectives on Psychological Science, 10*(2), 176–199. It provides
the general learning-science rationale for delayed retention and transfer checks,
complementing the specific Bastani trial. Cite it where the evaluation guide
first distinguishes successful assisted work from enduring learning. It predates
GenAI and does not validate SAGE's particular pilot design.
[Journal article](https://doi.org/10.1177/1745691615569000).

### E5 — High: add university GenAI evidence to the writing guide

**Location:** [students/writing_instruction.mdx](content/students/writing_instruction.mdx),
lines 63–73 and 114–128.

The page correctly limits its school-based writing reviews, but has no direct
GenAI journal evidence for its university feedback activities. Add Escalante,
Pack, and Barrett (2023), **AI-generated feedback on writing: insights into
efficacy and ENL student preference**, *International Journal of Educational
Technology in Higher Education, 20*, 57. Its six-week quasi-experiment with
48 university ENL learners found no detected difference in learning outcomes
between GPT-4 feedback and human-tutor feedback; a separate preference study
involved 43 learners. This supports a cautious pilot, rather than superiority,
equivalence, universal disciplinary precision, or proven independent transfer.
[Journal article](https://doi.org/10.1186/s41239-023-00425-2).

### E6 — Medium: use a systematic empirical example for invented references

**Location:** [teaching/course_materials.mdx](content/teaching/course_materials.mdx),
lines 130–139; [students/ai_literacy.mdx](content/students/ai_literacy.mdx), lines
18–22 and 61–68.

Supplement Alkaissi and McFarlane with Walters and Wilder (2023), **Fabrication
and errors in the bibliographic citations generated by ChatGPT**, *Scientific
Reports, 13*, 14045. It examines 636 citations from generated literature reviews
and distinguishes fabricated publications from errors in real references.
This directly supports checking existence, metadata, and claim support
separately. Its observed error rates belong to the tested 2023 models and prompts,
and should not be presented as current rates for every retrieval-enabled product.
[Journal article](https://doi.org/10.1038/s41598-023-41032-5).

### E7 — Medium: complement UNESCO with scholarly AI-literacy foundations

**Location:** [students/ai_competencies.mdx](content/students/ai_competencies.mdx),
lines 5–16 and 23–100.

Add Ng, Leung, Chu, and Qiao (2021), **Conceptualizing AI literacy: An exploratory
review**, *Computers and Education: Artificial Intelligence, 2*, 100041. Its
understanding, application, evaluation/creation, and ethical dimensions help
substantiate the opening claim that competency extends beyond prompting.
Keep UNESCO for its actual framework, and keep the explicit description of
SAGE's pathway as an adaptation. Neither source validates this exact four-part
higher-education sequence as a tested intervention or certification.
[Journal article](https://doi.org/10.1016/j.caeai.2021.100041).

### E8 — Medium: substantiate comparative judgment without promising an effect

**Location:** [students/writing_instruction.mdx](content/students/writing_instruction.mdx),
lines 92–100; [students/ai_literacy.mdx](content/students/ai_literacy.mdx), lines
70–77 and 120–131.

Add Tai, Ajjawi, Boud, Dawson, and Panadero (2018), **Developing evaluative
judgement: enabling students to make decisions about the quality of work**,
*Higher Education, 76*, 467–481. This conceptual paper connects exemplars,
self-assessment, peer assessment, feedback, and rubrics to evaluative judgment.
It is a rationale for the comparison activity, not an experimental test of
AI-versus-human comparisons. Change “This comparative exercise builds…” to
“Use this comparison to help students articulate and discuss disciplinary
criteria for quality.” [Journal article](https://doi.org/10.1007/s10734-017-0220-3).

### E9 — Medium: make learner uptake part of feedback's evidence base

**Location:** [teaching/feedback.mdx](content/teaching/feedback.mdx), lines 68–72;
[students/writing_instruction.mdx](content/students/writing_instruction.mdx), line 70.

Add Carless and Boud (2018), **The development of student feedback literacy:
enabling uptake of feedback**, *Assessment & Evaluation in Higher Education,
43*(8), 1315–1325. Its conceptual framework supports designing opportunities to
interpret, judge, and act on feedback, alongside the existing feedback syntheses.
Avoid using it to assert that a recorded AI dialogue itself establishes learning.
In the writing guide, replace “This response is where the learning happens” with
“The response makes the student's judgment visible; use later independent work
to check learning.” [Journal article](https://doi.org/10.1080/02602938.2018.1463354).

### E10 — Medium: directly support the three-option MCQ recommendation

**Location:** [teaching/exam_questions.mdx](content/teaching/exam_questions.mdx),
lines 117–130.

Add Rodriguez (2005), **Three options are optimal for multiple-choice items:
A meta-analysis of 80 years of research**, *Educational Measurement: Issues and
Practice, 24*(2), 3–13. This is a closer journal source for the option-count
recommendation than the current teaching-centre tip sheet. Explain that three
well-written options are a reasonable default, subject to purpose and item
review. The meta-analysis does not establish the quality of AI-generated
distractors or make three options mandatory for every assessment.
[Journal article](https://doi.org/10.1111/j.1745-3992.2005.00006.x).

### E11 — Medium: attach evidence specifically to simulation debriefing

**Location:** [students/simulations.mdx](content/students/simulations.mdx), lines
75–79 and 137–155.

Add Tannenbaum and Cerasoli (2013), **Do team and individual debriefs enhance
performance? A meta-analysis**, *Human Factors, 55*(1), 231–245. It supports
structured reflection and discussion after experience. Describe it as evidence
for debriefing in training and work settings, complementing the existing
simulation reviews. It does not test chatbot debriefing, establish that every
simulation must use the same format, or validate automated character judgments.
[Journal article](https://doi.org/10.1177/0018720812448394).

### E12 — Medium: add an LLM-specific example of linguistic bias

**Location:** [genai/limitations.mdx](content/genai/limitations.mdx), lines 61–72;
potential reuse in [teaching/feedback.mdx](content/teaching/feedback.mdx), lines
125–129, and [students/ai_literacy.mdx](content/students/ai_literacy.mdx), lines 49–51.

Complement the broad 2020 AI-bias survey with Hofmann, Kalluri, Jurafsky, and
King (2024), **AI generates covertly racist decisions about people based on their
dialect**, *Nature, 633*, 147–154. It demonstrates dialect prejudice concerning
African American English in the tested models and decision scenarios. Use it as
a concrete reason to inspect language-related assumptions, without claiming it
measures unfairness in SAGE's feedback workflow or proves equivalent effects for
all languages, disabilities, or student groups.
[Journal article](https://doi.org/10.1038/s41586-024-07856-5).

## 2. Claims to qualify before adding citations

Some sentences need a narrower claim more than another footnote:

| Location | Issue | Recommended treatment |
| --- | --- | --- |
| `students/writing_instruction.mdx:166` | Says clear AI rules reduce anxiety and unintended misuse and create a better learning environment. | Recast as a purpose: “Publish concrete rules so students can determine which assistance is allowed and where to ask questions.” A policy framework is not a causal test of anxiety or misconduct. |
| `students/ai_literacy.mdx:59, 76, 94, 111` | Says particular activities “work well”, reduce reliance, produce “strong evidence of learning”, or “work best” in routine practice. | Identify these as suggested designs. Annotated revisions expose judgments for assessment, but independent transfer still needs checking. E8 provides a rationale, not proof of each activity's effectiveness. |
| `teaching/exam_questions.mdx:6, 28` | Assessment standards are attached to claims about AI saving time and reducing “AI drift”. | Keep standards for assessment design. Say AI can draft items; test net workload locally. Describe blueprinting as the proposed safeguard rather than a measured reduction in model drift. |
| `teaching/lesson_planning.mdx:10, 27, 122` | Learning-science citations can read as support for AI efficiency, every listed method, and the particular workshop template. | Specify which source supports which method. Freeman concerns undergraduate STEM active learning; the other studies do not establish AI planning efficiency or that this template “works well”. Call it a starting template. |
| `teaching/curriculum_design.mdx:6, 84` | A lesson-planning study sits beside claims about whole-curriculum capabilities. | Keep the example within its lesson-planning scope; use Biggs for alignment and label the broader curriculum workflow as SAGE's recommendation. |
| `prompting.mdx:5` and `prompting/instruct.mdx:29` | “Most reliable workflow” and claims that criteria matter more than politeness or personas imply comparative evidence. | Use “A practical workflow…” and explain what the prompt makes checkable. Lin's journal Comment is practical guidance, not a comparative teaching-outcome trial. |

Lin's publication is explicitly a [journal Comment](https://doi.org/10.1038/s41562-024-01847-2).
Preserve official sources for legal obligations, accessibility standards, and
institutional rules. Journal articles should complement those sources, not
replace them. Keep peer-reviewed conference papers and preprints accurately
labelled: Brown, Bender, Jawahar, and Turpin are not journal articles; Kong is
currently cited as a preprint. Journal publication alone also does not make a
Comment or conceptual framework an empirical effectiveness study.

## 3. Contextual interlink opportunities

All 28 proposed source-to-destination pairs below are absent from the current
authored content links. Each destination is an existing published route. Link
the phrase at its first relevant occurrence outside code fences, or add the
suggested bridging sentence after the example. Priorities describe reader value,
not a requirement to add all links at once.

### First pass: connect examples to complete workflows

| # | Source and insertion point | Suggested linked phrase and destination | Why the reader would continue |
| --- | --- | --- | --- |
| 1 | `prompting/assign_job.mdx:19` | “Socratic tutor” → `/students/tutoring` | Move from a role label to setup, a full prompt, and independent learning checks. |
| 2 | `prompting/assign_job.mdx:21` or after its simulation example | “stakeholder in a simulation” → `/students/simulations` | Learn scenario grounding, testing, and debriefing. |
| 3 | `prompting/assign_job.mdx:35–50`, after the curriculum-colleague example | “Apply this review within the curriculum-design workflow” → `/teaching/curriculum_design` | Connect a short prompting example to outcomes and course-level decisions. |
| 4 | `prompting/give_examples.mdx:31–34` | “feedback grounded in observable work” → `/teaching/feedback` | The classifier example leads naturally to producing and reviewing feedback. |
| 5 | `teaching/course_materials.mdx:52–56` | “Pilot the material” → `/teaching/evaluating_ai` | Supply a method where the page currently just says to test and record changes. |
| 6 | `teaching/course_materials.mdx:95–97`, after the case prompt | “For a case students interact with, design a simulation and debrief” → `/students/simulations` | Explain the transition from a static case to interactive role-play. |
| 7 | `teaching/course_materials.mdx:159–162` | “Use the source-verification activity with students” → `/students/ai_literacy#source-verification` | Turn educator bibliography checks into a teachable student activity. |
| 8 | `teaching/feedback.mdx:39` or 50 | “rubric criteria” → `/teaching/rubrics` | Help educators who need to create or calibrate criteria before drafting feedback. |
| 9 | `teaching/feedback.mdx:70–72` | “For a student-led revision activity…” → `/students/writing_instruction#ai-as-revision-partner` | Connect educator drafting with students judging and acting on suggestions. |
| 10 | `students/writing_instruction.mdx:65–73` | “review feedback against the published criteria” → `/teaching/feedback` | Give writing instructors the evidence-linked review procedure; this direction serves a different need from #9. |
| 11 | `students/exams.mdx:91–96` | “AI critique or comparison” → `/students/ai_literacy#make-evaluation-assessable` | Provide a concrete claim-check table and assessable revision method. |
| 12 | `students/exams.mdx:105–110` | “respond to an unfolding case” → `/students/simulations` | Show how to build, test, and debrief the proposed assessment format. |
| 13 | `students/exams.mdx:58–63` | “Pilot and calibrate” → `/teaching/evaluating_ai` | Make the comparison and stop-condition advice actionable. |
| 14 | `students/tutoring.mdx`, humanities/writing examples | “For a writing-focused version…” → `/students/writing_instruction` | Make a page currently linked only from its section overview easier to discover. |

### Second pass: connect foundations, design, and evaluation

| # | Source and insertion point | Suggested linked phrase and destination | Why the reader would continue |
| --- | --- | --- | --- |
| 15 | `genai/limitations.mdx:87–91` | “preserve the student's own practice” → `/students/tutoring#check-learning-without-the-tutor` | Follow the learning-displacement risk with a concrete safeguard. |
| 16 | `genai/limitations.mdx:44–48` | “test and re-test a repeated workflow” → `/teaching/evaluating_ai` | Turn a general variability warning into an evaluation record. |
| 17 | `genai/responsible_use.mdx:139–141` | “test errors and define stop conditions” → `/teaching/evaluating_ai` | Bridge institutional safeguards and practical workflow evaluation. |
| 18 | `genai/when_to_use.mdx:60–61` | “an AI detector score” → `/genai/ai_detection` | Explain a potentially unfamiliar warning at the moment it appears. |
| 19 | `genai/when_to_use.mdx:65–68` | “state permitted uses and disclosure” → `/teaching/course_ai_policy` | Take readers directly from a checklist requirement to copyable wording. |
| 20 | `teaching/lesson_planning.mdx:48` or 70 | “retrieval practice” / “formative quizzes” → `/teaching/exam_questions` | Connect a teaching strategy to question design, keys, and feedback. |
| 21 | `teaching/lesson_planning.mdx:22` | “approved learning outcomes and course context” → `/teaching/curriculum_design` | Offer prerequisite help to someone starting at lesson level. |
| 22 | `teaching/curriculum_design.mdx:84–94` | “simulations” / “role-play” → `/students/simulations` | The environmental-policy example closely matches the simulation guide's worked scenario. |
| 23 | `teaching/course_ai_policy.mdx:65–69` | “Align the rubric with the learning outcome” → `/teaching/rubrics` | Connect the published policy to the criteria used to apply it. |
| 24 | `students/writing_instruction.mdx:130–154` | “design assessment around the target capability” → `/students/exams` | Provide staged, oral, portfolio, and transfer options beyond the writing page. |
| 25 | `students/simulations.mdx:49–52` | “build the case from verified material” → `/teaching/course_materials#case-studies` | Help readers prepare the source-grounded scenario before making it interactive. |
| 26 | `students/simulations.mdx:152–155` | “educator-applied criteria” → `/teaching/rubrics` | Help assess explanations and decisions without relying on the AI character's score. |
| 27 | `prompting/chain_of_thought_prompting.mdx:29–35` | Link the “Assessment design” task label → `/teaching/exam_questions` | Move from the generic verification table to the blueprint and item-review workflow. |
| 28 | `prompting/chain_of_thought_prompting.mdx:40–60`, after the worked example | “Use this check after drafting a lesson plan” → `/teaching/lesson_planning` | Complete the reader's path from checking to drafting the underlying artefact. |

Avoid adding another generic “Related pages” list to every page. The existing
homepage and section overviews already provide broad navigation. Use destination
sections where they answer the immediate question, keep descriptive anchor text,
and prefer two or three useful contextual additions per page over linking every
mention. Do not put links inside copyable prompt text.

`prompting/further_resources` can reasonably remain a terminal external-resource
page; zero outgoing internal links is not inherently a defect. If adding a
return path, a closing sentence directing readers to test a technique with the
evaluation guide is more useful than a redundant list of all prompting pages.

## 4. Recommended implementation order

1. Apply E1–E5 and qualify the strongest unsupported effectiveness claims.
2. Add the first-pass contextual links, especially on course materials, role
   prompting, assessment, and feedback. Preserve the existing route names.
3. Add E6–E12 at the relevant claims, using the existing footnote convention.
4. Add selected second-pass links where the paragraph remains easy to read.
5. For a subsequent implementation, validate destinations and fragments,
   footnote definitions, and MDX compilation with the app's documented build.

Keep drafts unpublished. The case-report, teacher-training, promptathon, and
tool-list drafts are mostly placeholders and offer no substantive published
claims to strengthen. The administrative-work draft would need source-grounded
institutional boundaries before its extension-granting email example could be
published; do not create public links to these draft routes.

## Verification and limitations

- Read the current content rather than relying on the earlier editorial record.
- Checked proposed route pairs against the source link inventory; all proposed
  destinations exist. Suggested fragment names follow the current headings and
  still need a rendered check if implemented.
- Verified proposed journal records and relevant findings using publisher pages,
  journal abstracts/full text, and author/institutional records where publisher
  retrieval was restricted. Checked the correction for the 2026 detector study.
- This is a targeted evidence search, not a systematic literature review or an
  exhaustive audit of every existing bibliography entry, external URL, or study.
- No app code, public MDX, navigation, sitemap, analytics, or shared packages were
  changed. No application build is needed for this review document alone.
