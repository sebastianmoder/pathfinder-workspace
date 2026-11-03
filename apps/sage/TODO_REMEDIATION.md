# Content Remediation Backlog

Reviewed: 3 November 2026

This file tracks editorial TODOs that remain in published content. Incomplete
pages are kept in `drafts/` and are intentionally excluded from the public
content tree.

## Completed in the September 2026 review

- Published an EU-oriented responsible-use guide covering privacy, AI Act
  escalation, oversight, transparency, copyright, accessibility, and tool
  selection.
- Replaced the former chain-of-thought page with outcome-first, checkable
  prompting guidance.
- Rewrote the task-level "When to use AI" guidance and corrected the consent and
  copyright framing.
- Published the feedback page with a privacy gate, rubric-grounded workflow,
  copyable prompt, and human-review checklist.
- Completed the lecture-slide section of the course-materials page.
- Moved incomplete standalone pages out of `content/` so they are not routed,
  searched, or included in the sitemap.

## Completed in the follow-up review

- Rewrote the AI-detection page around what scores can and cannot establish,
  current independent evidence, fair response procedures, and assessment
  alternatives.
- Reworked the prompting guides with higher-education examples, explicit source
  boundaries, and clearer limits on roles, examples, and delimiters.
- Added outcomes–activities–assessment alignment checks to lesson and curriculum
  planning.
- Added a task-oriented homepage, a course and assignment AI-policy toolkit, and
  a progressive AI-competency pathway.
- Revised assessment, writing, tutoring, simulations, and course-material
  guidance for evidence quality, privacy, access, and human review.
- Expanded the introductory and limitations pages and updated the 2026 European
  Commission ethical-guidance reference.

## Completed in the November 2026 review

See [the content audit and revision plan](CONTENT_REVIEW.md) for findings,
source verification, editorial decisions, and validation results.

- Corrected mismatched references and qualified claims about AI reliability,
  assessment outsourcing, case-based learning, and detector uses.
- Added an evaluation workflow covering comparison measures, independent
  learning, total workload, access, and stop conditions.
- Strengthened exam answer-key and variant checks, tutoring, writing transfer,
  source-evaluation activities, and rubric calibration.
- Distinguished prohibited biometric emotion recognition from high-risk uses
  requiring institutional classification and review.
- Consolidated repeated disclosure and prompting templates. Page timestamps
  remain managed automatically by Nextra, without manual dates in content.
- Built and indexed all 30 published pages; checked links, desktop/mobile
  rendering, and search while preserving the original routes.

## Future development candidates

The content-extension work is recorded in
[CONTENT_EXTENSION_REVIEW.md](CONTENT_EXTENSION_REVIEW.md). It adds seven guides
and practical examples in existing workflows. The teacher-training placeholder
has been replaced by the published `teaching/teacher_training` pack.

- Publish implementation case reports only when they include context,
  safeguards, observed results, failures, and reusable material.
- Pilot and refine the teacher-training pack using documented participant work
  and follow-up, without presenting the proposed workshop as validated training.
- Add a maintained external-link check to continuous integration.
- Consider administrative-work guidance after core teaching workflows are
  validated; keep vendor-specific tool directories unpublished unless someone
  owns their maintenance.

## Publication checks

Before marking an item complete:

1. remove its inline `TODO` comment;
2. verify time-sensitive claims with current primary sources;
3. confirm examples do not encourage disclosure of student data;
4. check internal links and references;
5. run `pnpm build`; and
6. inspect the affected routes, sidebar, sitemap, and search results.
