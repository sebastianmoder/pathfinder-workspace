# SAGE content extensions

Reviewed and implemented: 3 November 2026. Scope: SAGE content and navigation.
This record is outside the public content tree. Existing published routes remain.

## Published additions

| Route | Practical contribution |
| --- | --- |
| `teaching/assessment_examples` | Three complete designs: argumentative essay, quantitative audit, and professional decision case. Each connects source material, student brief, AI rules, submissions, rubric, anchor responses, workload, and an independent check. |
| `students/data_analysis` | Synthetic conversion-rate exercise, pooled versus unweighted rates, a duplicate-join fault, reproducible checking, and a bounded review prompt. |
| `students/programming` | Specification-based debugging exercise, hint sequence, test expectations, execution precautions, and independent transfer. |
| `teaching/adapting_materials` | Worked language and chart-description corrections, caption and translation review, and preservation of the learning construct. |
| `teaching/course_sources` | Source manifest, version authority, extraction checks, fictional source pack, test questions with an answer key, embedded-instruction test, and maintenance decisions. |
| `students/entrepreneurial_learning` | A fictional repair-service project linking opportunities, assumptions, real evidence, bounded experiments, and revision. Simulated customers are explicitly excluded as demand evidence. |
| `teaching/teacher_training` | Two-hour facilitation pack with preparation, schedule, scenario cards, source-check exercise and key, worksheet, peer review, exit task, and follow-up. |

The teacher-training placeholder in `drafts/teachertraining.mdx` has been removed.
Its old unpublished route remains excluded from the sitemap; the new published
guide is under `teaching/teacher_training`. Four incomplete drafts remain outside
the public tree. There are now 37 published content pages.

## Existing-page expansions

- Tutoring: educator-written dialogue from attempt through bounded hint,
  verification, withdrawal of help, and later transfer.
- Feedback: synthetic submission, intentionally flawed AI-style feedback, and a
  corrected evidence-linked educator response.
- Rubrics: two conflicting grader interpretations, an explicit descriptor
  revision, and further calibration steps.
- Workflow evaluation: completed fictional pilot record showing why faster
  drafting can still require a decision to revise.
- Curriculum design: programme-level progression, prerequisites, assessment
  evidence, workload, and ownership.
- Homepage, section overviews, navigation, assessment, materials, competency,
  and delimiter guides: links into the new workflows.

## Editorial and evidence decisions

- New activities are proposed SAGE designs, not validated interventions.
- Fictional source packs, dialogue, model-like outputs, and pilot figures are
  labelled. No institutional approvals, customer interviews, implementation
  outcomes, or learning benefits are invented.
- Required participation has an accessible, account-free route or shared
  artefact. Independent checks retain approved accommodations.
- Source instructions do not guarantee grounding or protection from embedded
  instructions. Source support and calculations require independent review.
- Existing governance owns institutional approval and privacy; new guides link
  to it and retain short task-specific safeguards.
- Case reports remain deferred until documented implementation is available.
  Vendor lists and general administrative automation remain unpublished.
- No shared packages, app behaviour, analytics, storage, funding language, or
  GUARD functions were changed.

Primary records checked for the new framing:

- [ASA Ethical Guidelines for Statistical Practice](https://www.amstat.org/your-career/ethical-guidelines-for-statistical-practice): data provenance, transparent assumptions, reproducibility, interpretation.
- [CAST UDL Guidelines 3.0](https://udlguidelines.cast.org/): representation, language, action/expression, and access.
- [UNESCO teacher competency framework](https://www.unesco.org/en/articles/ai-competency-framework-teachers): dimensions and progression levels; not endorsement of this workshop.
- [European Commission JRC EntreComp](https://joint-research-centre.ec.europa.eu/scientific-activities/key-competences-lifelong-learning/entrecomp-entrepreneurship-competence-framework_en): entrepreneurial competence and social, cultural, and financial value.
- [Doshi and Hauser's author preprint](https://arxiv.org/abs/2312.00506) and its linked [journal record](https://doi.org/10.1126/sciadv.adn5290): the limited short-story creativity finding, explicitly distinguished from entrepreneurial learning.

These checks support particular claims; they are not a fresh audit of every
reference in the existing site.

## Validation

- `pnpm --filter @pathfinder/sage build` passed with Node 22.22.0 and pnpm
  10.30.3, including MDX compilation, static generation, sitemap generation,
  and Pagefind indexing of all 37 content pages. Nextra emitted Git modification
  timestamp warnings; these did not prevent compilation or generation.
- Checked all 37 rendered content pages: 4,012 internal links and fragments
  resolve, each page has one H1, and footnote references match definitions.
  Every content route appears in the sitemap; unpublished draft routes do not.
- Independently checked numerical answer keys, the duplicate-join calculation,
  transfer examples, tutor equations, pilot time totals, and the 120-minute
  workshop schedule. Executed the programming excerpt to confirm its expected
  valid results and intentional empty-input exception.
- Headless Chromium checked 15 routes at both 1440 × 1000 and 375 × 812:
  HTTP 200, a visible H1, no page-level horizontal overflow, preserved funding
  footer, and no uncaught runtime errors. This covers all new guides, the five
  expanded workflows, and the homepage and section overviews.
- Search for “campus repair” finds the entrepreneurship guide and navigates to
  it at both widths. Pagefind queries find all seven new guides; the temporary
  verification accounts for Pagefind's existing `.html` result URLs. No search
  implementation change was needed.
- Inspected desktop/mobile screenshots of all seven new guides, the homepage,
  and search results. Navigation, typography, tables, and callouts follow the
  existing SAGE layout.
- `git diff --check` passed. Changes are limited to SAGE content, navigation,
  editorial documentation, and the generated sitemap; cross-app checks were
  not required.
