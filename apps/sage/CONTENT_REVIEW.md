# SAGE content review and revision plan

Reviewed: 3 November 2026. Scope: all 29 published MDX pages and their navigation
metadata in `content/`. This editorial record stays outside the public routes,
search index, and sitemap. Existing routes are retained.

## Findings and planned revisions

| Priority | Pages | Finding | Revision |
| --- | --- | --- | --- |
| High | `genai/ai_detection` | The purported Jawahar 2024 survey links to an unrelated mathematics paper. The description of Perkins et al. rules out educational benefit more broadly than the study does. | Replace the mismatched reference with a verified detection survey; distinguish punitive integrity decisions from non-punitive educational uses. |
| High | `students/ai_literacy`, `teaching/course_materials`, `teaching/rubrics` | Alkaissi and Thistlethwaite have mismatched publication details; the purported Panadero 2023 reference points to an outlining meta-analysis. | Correct the first two records, remove the unsupported rubric reference, and qualify the case-learning evidence. |
| High | `students/writing_instruction` | Claims that AI reliably produces correct documents and that personal judgment makes work harder to outsource contradict the limitations and assessment guidance. Some cited research concerns school pupils, rather than university GenAI use. | Remove the guarantees and outsourcing claim; state the evidence's scope; focus on observable student reasoning and independent transfer. |
| High | `teaching/exam_questions` | Unsupported editing superiority and fixed pool-size advice; prompts omit approved factual sources. Changing numbers is presented as producing equivalent questions. | Require source-grounded items, independent solutions, a checked answer key, workload-based pool size, and review of variant difficulty. |
| High | `genai/responsible_use`, `genai/when_to_use` | High-impact uses are framed mainly as escalation and human-review questions. Prohibited emotion recognition is not distinguished from reviewable uses. | Explain the specific EU educational emotion-recognition prohibition and its narrow exception; link the operative Annex III and classification rules; keep institutional classification and applicability review explicit. |
| Medium | New `teaching/evaluating_ai`; homepage and section links | Many pages say “pilot” without giving educators a reusable way to compare learning, quality, burden, access, and stop conditions. | Add one practical evaluation workflow, a worked example, and a copyable record; link from relevant workflows. |
| Medium | `students/tutoring` | Benefits and setup advice repeat; the final standalone prompt drops the earlier source boundary. No explicit check that students can perform without the tutor. | Consolidate to one copyable tutor prompt, add independent and delayed practice checks, and balance the positive trial with relevant evidence of learning harm in a different setting. |
| Medium | `students/ai_literacy` | Repeats the general limitations guide; overstates textbook consistency, invisible bias, and activity effectiveness. Sampling a few claims could be mistaken for validating a whole output. | Keep this page focused on classroom evaluation, distinguish practice sampling from consequential verification, and add an assessable claim-check record and account-free option. |
| Medium | `prompting`, `prompting/chain_of_thought_prompting`, `prompting/instruct`, `prompting/use_delimiters` | Multiple near-identical full prompt patterns obscure the difference between overview, instructions, and verification. | Keep the compact default on the overview, the task-field pattern on the instruction page, and the verification workflow and worked example on the existing reasoning-page route; correct the delimiter page's cross-link. |
| Medium | `genai/responsible_use`, `teaching/course_ai_policy`, `students/exams` | Disclosure templates and policy explanations overlap. The four-level model can be mistaken for an official classification. | Keep copyable assignment rules and disclosure in the policy guide; keep assessment-specific evidence in the assessment table; label the levels as SAGE's planning labels. |
| Medium | `teaching/curriculum_design`, `teaching/lesson_planning`, `teaching/rubrics` | Repeated generic advice crowds out the decisions educators need to make. Lesson material and workshop examples lack the source boundaries used elsewhere. | Consolidate rubric workflow/checklist advice, turn curriculum placeholder steps into a coherent planning sequence, and strengthen lesson prompts. |
| Medium | `index`, `genai`, `students/ai_competencies`, `students/simulations`, `teaching/feedback` | The homepage describes editorial dates separately from Nextra’s automatic page timestamps; audience and route labels are inconsistent. Some specialist pages already meet their main purpose. | Use Nextra’s automatic page timestamps without manual dates in content, clarify framework scope, and link good existing workflows to the new pilot guide. |
| Low | `genai/what_is_genai`, `genai/limitations`, `prompting/assign_job`, `prompting/give_examples`, `prompting/further_resources`, section landing pages | Core concepts and boundaries are useful; broad rewrites would duplicate existing material. The examples guide overstates what a format instruction can guarantee. | Retain the substantive guidance, correct that guarantee, and make only focused navigation or wording changes. |

## Editorial decisions

- Retain brief task-specific privacy/access warnings at the point of use. The
  responsible-use page owns detailed governance; the policy page owns assignment
  rules; the evaluation page owns the reusable pilot record.
- Distinguish evidence for a teaching method from evidence for a specific GenAI
  implementation. Present practical activities as suggestions unless evidence
  supports a stronger claim.
- Add one missing workflow rather than reviving incomplete vendor lists,
  administrative guidance, or unsubstantiated case reports from `drafts/`.
- Do not change app code, analytics, shared packages, funding text, or storage.

## Source verification

Primary records consulted for consequential corrections and additions:

- [Jawahar et al., COLING 2020](https://aclanthology.org/2020.coling-main.208/)
  replaces the unrelated [arXiv record](https://arxiv.org/abs/2409.02640).
- [Perkins et al., 2024](https://doi.org/10.1186/s41239-024-00487-w).
- [Alkaissi and McFarlane, 2023](https://doi.org/10.7759/cureus.35179).
- [Thistlethwaite et al., BEME Guide 23](https://doi.org/10.3109/0142159X.2012.680939).
- [Panadero and Jonsson, 2013](https://doi.org/10.1016/j.edurev.2013.01.002)
  is retained; the mismatched 2023 entry is removed.
- [Kestin et al., 2025](https://www.nature.com/articles/s41598-025-97652-6)
  and [Bastani et al., 2025](https://doi.org/10.1073/pnas.2422633122)
  concern different populations and tutor designs, not a universal effect.
- European Commission AI Act [Article 5](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-5),
  [Annex III](https://ai-act-service-desk.ec.europa.eu/en/ai-act/annex-3), and
  [Article 6](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-6).
- The [2026 Commission educator guidelines](https://op.europa.eu/en/publication-detail/-/publication/eab657c4-63a8-11f1-9b18-01aa75ed71a1/language-en)
  confirm the existing year and DOI; those details need no correction.

This is a substantive content review with targeted source verification, not an
exhaustive replication of every cited study or a guarantee that every external
URL remains available. No case-study outcomes or institutional approvals are
invented.

## Implementation and validation

1. Correct consequential claims and references, then fill the evaluation and
   independent-learning gaps.
2. Consolidate duplicate guidance and connect the revised pages through navigation.
3. Check internal destinations, fragment links, footnotes, preserved routes,
   and MDX compilation.
4. Build with Node 22.22.0 and pnpm 10.30.3 using
   `pnpm --filter @pathfinder/sage build`; verify sitemap and Pagefind inclusion.
5. Inspect affected pages and navigation at desktop and mobile widths, including
   search. Record results below after verification.

Status: implemented and verified on 3 November 2026.

- Revised 22 existing MDX pages and the teaching navigation; added the evaluation
  guide. All 29 original content pages remain, for 30 published content routes.
- `pnpm --filter @pathfinder/sage build` passed with Node 22.22.0 and pnpm
  10.30.3, including sitemap generation and Pagefind indexing of all 30 pages.
  Nextra warned that Git modification timestamps were unavailable; compilation
  and static generation succeeded.
- Checked rendered HTML for all 30 content routes: 2,775 internal links and
  fragments resolve, each page has one H1, and footnote references are defined
  and used. Confirmed the new route appears in the sitemap and unpublished
  drafts and this review do not.
- Temporary headless browser checks passed for ten key routes at 1440 × 1000
  and 375 × 812: HTTP 200, one H1, no page-level horizontal overflow, and no
  uncaught runtime errors. Search for “pilot record” finds the new guide at both
  widths. Inspected desktop/mobile page screenshots and mobile search results.
- `git diff --check` passed. Changes are confined to SAGE content, navigation,
  editorial records, and the generated sitemap, so cross-app checks were not
  required.

## Remaining maintenance

- Automate external-link availability checks separately. Availability alone
  cannot detect a citation that resolves to the wrong paper; retain human
  title/author/claim checks during reviews.
- Add real implementation case reports only when the project has documented
  context, approvals, results, limitations, and reusable materials. The pilot
  guide provides a record to support that future work.
