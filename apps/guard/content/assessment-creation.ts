import type { LabConfig } from '@/lib/types';
import { outputLanguageQuestion, outputLanguageSlot } from './output-language';

export const assessmentCreationLab: LabConfig = {
  meta: {
    id: 'assessment-creation',
    title: 'Create a Learning Assessment',
    description:
      'Develop quiz questions, exam prompts, or formative assessment items with AI assistance while maintaining academic rigor.',
    estimatedTime: '25-35 min',
    learningOutcome:
      "You'll learn to evaluate assessment alignment, detect AI tendencies toward surface-level questions, and refine iteratively.",
    coreSkill:
      'Evaluating assessment alignment, detecting shallow questions, iterative refinement',
    icon: 'assessment',
  },
  iterations: [
    // ========================================
    // ITERATION 1 — Intent & Alignment
    // ========================================
    {
      iterationNumber: 1,
      title: 'Intent & Alignment',
      focus: 'Define what the assessment should measure and how.',
      isOptional: false,
      scaffoldingQuestions: [
        {
          id: 'q1',
          question:
            'What course or learning context is this assessment for, and who are the students?',
          placeholder:
            'e.g., First-year biology students in an introductory cell biology unit...',
          templateSlot: 'COURSE_CONTEXT',
          inputType: 'textarea',
        },
        {
          id: 'q2',
          question:
            'What topic or unit is this assessment for?',
          placeholder:
            'e.g., Photosynthesis, The Civil Rights Movement, Linear Equations...',
          templateSlot: 'TOPIC',
          inputType: 'text',
        },
        {
          id: 'q3',
          question:
            'What specific knowledge or skill should this assessment measure? Try to be precise: what would a successful student demonstrate?',
          placeholder:
            'e.g., Students should be able to apply Newton\'s second law to novel scenarios...',
          templateSlot: 'SPECIFIC_SKILL',
          inputType: 'textarea',
        },
        {
          id: 'q4',
          question:
            'What level of cognitive demand are you targeting — recall of facts, application to new scenarios, analysis, or evaluation?',
          placeholder:
            'e.g., Application — students should use concepts in new situations, not just recall definitions...',
          templateSlot: 'COGNITIVE_LEVEL',
          inputType: 'textarea',
        },
        {
          id: 'q5',
          question:
            'What format, length, and conditions should the assessment use?',
          placeholder:
            'e.g., 8 questions, mix of multiple choice and short answer, 20 minutes, individual, closed-book...',
          templateSlot: 'ASSESSMENT_FORMAT',
          inputType: 'textarea',
        },
        {
          id: 'q6',
          question:
            'What would a common misconception or error look like on this assessment? Knowing this helps ensure the assessment actually catches misunderstanding.',
          placeholder:
            'e.g., Students often confuse velocity with acceleration, or think heavier objects fall faster...',
          templateSlot: 'MISCONCEPTION',
          inputType: 'textarea',
        },
        {
          id: 'q7',
          question:
            'Is this formative (to guide learning) or summative (to measure achievement)? How does that affect what you need?',
          placeholder:
            'e.g., Formative — I want to identify gaps before the final exam, so questions should reveal specific misunderstandings...',
          templateSlot: 'ASSESSMENT_PURPOSE',
          inputType: 'textarea',
        },
        outputLanguageQuestion,
      ],
      promptTemplate: {
        templateText:
          'You are an experienced educator and assessment designer. Create an assessment that is aligned, rigorous, and practical for the stated classroom context.\n\nCourse and students: [COURSE_CONTEXT].\n\nAssessment purpose: [ASSESSMENT_PURPOSE].\n\nTopic or unit: [TOPIC].\n\nThe assessment should measure students\' ability to [SPECIFIC_SKILL].\n\nTarget cognitive demand: [COGNITIVE_LEVEL].\n\nRequired format, length, and conditions: [ASSESSMENT_FORMAT].\n\nCommon misconception or error to diagnose: [MISCONCEPTION].\n\nUse these inputs as design requirements. Before drafting, privately map the target skill to the requested cognitive demand, decide what evidence each question should elicit, and ensure at least some items distinguish genuine understanding from memorized or easily searchable knowledge.\n\nThen produce only the assessment in clear markdown format.\n\nPlease include:\n- a concise assessment title\n- a short overview of what the assessment measures\n- the full set of questions in the requested format\n- answer key or model answers\n- brief scoring guidance or point values where useful\n- a note for each question explaining what it tests and which misconception, if any, it can reveal\n- a brief alignment note explaining how the assessment fits the purpose, students, and cognitive demand\n\nAlways respond in [LANGUAGE] language unless explicitly instructed otherwise.',
        slots: [
          {
            id: 'COURSE_CONTEXT',
            label: 'Course Context',
            defaultText: 'course context and student level',
          },
          {
            id: 'ASSESSMENT_PURPOSE',
            label: 'Purpose (Formative/Summative)',
            defaultText: 'formative or summative',
          },
          { id: 'TOPIC', label: 'Topic', defaultText: 'the topic' },
          {
            id: 'SPECIFIC_SKILL',
            label: 'Specific Skill/Knowledge',
            defaultText: 'what students should demonstrate',
          },
          {
            id: 'COGNITIVE_LEVEL',
            label: 'Cognitive Level',
            defaultText: 'the cognitive level',
          },
          {
            id: 'MISCONCEPTION',
            label: 'Common Misconception',
            defaultText: 'a common misconception',
          },
          {
            id: 'ASSESSMENT_FORMAT',
            label: 'Format and Conditions',
            defaultText: 'assessment format, length, and conditions',
          },
          outputLanguageSlot,
        ],
      },
      evaluationTools: {
        reflectionQuestions: [
          {
            id: 'er1',
            question:
              'Could a student answer these questions correctly by memorizing, even if they don\'t truly understand the concept?',
          },
          {
            id: 'er2',
            question:
              'Do the distractors (wrong answers) reflect real student thinking, or are they obviously wrong?',
          },
        ],
        checklist: [
          {
            id: 'c1',
            text: 'Questions align with stated skill/knowledge target',
          },
          { id: 'c2', text: 'Cognitive level matches intent' },
          { id: 'c3', text: 'Distractors are plausible' },
          { id: 'c4', text: 'Questions are free of ambiguity' },
          {
            id: 'c5',
            text: 'Assessment distinguishes understanding from recall',
          },
        ],
        failureModes: [
          {
            id: 'fm1',
            title: 'Recall-Level Default',
            description:
              'AI-generated assessments often default to recall-level questions even when asked for higher-order thinking. Check each question: does it truly require the cognitive level you specified?',
          },
        ],
      },
    },

    // ========================================
    // ITERATION 2 — Rigor & Authenticity
    // ========================================
    {
      iterationNumber: 2,
      title: 'Rigor & Authenticity',
      focus: 'Ensure questions test genuine understanding, not surface knowledge.',
      isOptional: false,
      scaffoldingQuestions: [
        {
          id: 'q1',
          question:
            'For each question, ask: could a student find the answer by searching online in 10 seconds? If so, is that the kind of understanding you\'re assessing?',
          placeholder:
            'e.g., Questions 1 and 3 could be Googled instantly — they test recall, not understanding...',
          templateSlot: 'SEARCHABILITY',
          inputType: 'textarea',
        },
        {
          id: 'q2',
          question:
            'Do the questions test what you actually taught, or what the AI assumes is important about this topic?',
          placeholder:
            'e.g., The AI focused on dates and names, but my course emphasizes analytical frameworks...',
          templateSlot: 'ALIGNMENT_GAP',
          inputType: 'textarea',
        },
        {
          id: 'q3',
          question:
            'Would these questions reveal the difference between a student who deeply understands and one who superficially knows the material?',
          placeholder:
            'e.g., A student who memorized the textbook could score well — need questions that require synthesis...',
          templateSlot: 'DEPTH_CHECK',
          inputType: 'textarea',
        },
        {
          id: 'q4',
          question:
            'Are there questions that unintentionally test reading comprehension or vocabulary rather than subject knowledge?',
          placeholder:
            'e.g., Question 4 uses complex wording that might confuse ESL students regardless of their subject knowledge...',
          templateSlot: 'LANGUAGE_BIAS',
          inputType: 'textarea',
        },
        {
          id: 'q5',
          question:
            'Where do the answer key, explanations, or factual claims need correction or verification?',
          placeholder:
            'e.g., The answer to Q4 is debatable, and the explanation for Q6 oversimplifies...',
          templateSlot: 'ACCURACY_CONCERNS',
          inputType: 'textarea',
        },
        {
          id: 'q6',
          question:
            'Which questions or design choices are worth keeping because they align well with your goals?',
          placeholder:
            'e.g., Keep Q2 because it uses a scenario students recognize; keep the short-answer format for synthesis...',
          templateSlot: 'KEEP_ELEMENTS',
          inputType: 'textarea',
        },
      ],
      promptTemplate: {
        templateText:
          'You are an experienced educator and assessment designer. Revise the most recent assessment in this conversation. Treat that previous assessment as the draft to improve, not as a prompt to start over from scratch.\n\nI reviewed the draft and identified these issues:\n\nSearchability concern: [SEARCHABILITY].\n\nAlignment gap: [ALIGNMENT_GAP].\n\nDepth issue: [DEPTH_CHECK].\n\nLanguage or accessibility concern: [LANGUAGE_BIAS].\n\nAnswer key, explanation, or factual accuracy concerns: [ACCURACY_CONCERNS].\n\nQuestions or design choices worth keeping: [KEEP_ELEMENTS].\n\nBefore revising, privately determine which items should be kept, edited, replaced, or reordered. Replace easily searchable or recall-only items with items that require the intended reasoning, application, analysis, or evaluation. Preserve strong items, correct any answer-key or explanation problems, and simplify wording where language complexity obscures the subject knowledge being assessed.\n\nThen produce only the revised assessment in clear markdown format.\n\nPlease include:\n- the revised question set\n- answer key or model answers\n- scoring guidance or point values where useful\n- a brief note for each question explaining what changed or why it was kept\n- a short alignment note explaining how the revision better measures genuine understanding',
        slots: [
          {
            id: 'SEARCHABILITY',
            label: 'Searchability Concern',
            defaultText: 'which questions are too easily searchable',
          },
          {
            id: 'ALIGNMENT_GAP',
            label: 'Alignment Gap',
            defaultText: 'where questions don\'t match your teaching',
          },
          {
            id: 'DEPTH_CHECK',
            label: 'Depth Check',
            defaultText: 'where questions lack depth',
          },
          {
            id: 'LANGUAGE_BIAS',
            label: 'Language Concern',
            defaultText: 'language issues in questions',
          },
          {
            id: 'ACCURACY_CONCERNS',
            label: 'Accuracy Concerns',
            defaultText: 'answer key or factual accuracy concerns',
          },
          {
            id: 'KEEP_ELEMENTS',
            label: 'Elements to Keep',
            defaultText: 'questions or design choices to preserve',
          },
        ],
      },
      evaluationTools: {
        reflectionQuestions: [
          {
            id: 'er1',
            question:
              'Are the revised questions measurably better at testing genuine understanding, or did the AI just rephrase the same questions?',
          },
          {
            id: 'er2',
            question:
              'Could you defend each question\'s inclusion to a colleague? Does every question earn its place?',
          },
        ],
        checklist: [
          {
            id: 'c1',
            text: 'Questions align with stated skill/knowledge target',
          },
          { id: 'c2', text: 'Cognitive level matches intent' },
          { id: 'c3', text: 'Distractors are plausible' },
          { id: 'c4', text: 'Questions are free of ambiguity' },
          {
            id: 'c5',
            text: 'Assessment distinguishes understanding from recall',
          },
          {
            id: 'c6',
            text: 'Questions require thinking, not just searching',
          },
          {
            id: 'c7',
            text: 'Language is accessible and doesn\'t create barriers',
          },
          {
            id: 'c8',
            text: 'Factual accuracy verified for every question',
          },
        ],
        failureModes: [
          {
            id: 'fm1',
            title: 'Shallow Revision',
            description:
              'AI often generates questions that are technically correct but pedagogically shallow. It may also hallucinate plausible-sounding but inaccurate content, especially in specialized fields. Verify factual accuracy for every question.',
          },
        ],
      },
    },

    // ========================================
    // ITERATION 3 (Optional) — Contextualization
    // ========================================
    {
      iterationNumber: 3,
      title: 'Contextualization',
      focus: 'Adapt the assessment for your specific classroom context.',
      isOptional: true,
      scaffoldingQuestions: [
        {
          id: 'q1',
          question:
            'Which questions would you keep as-is, which need editing, and which would you replace entirely?',
          placeholder:
            'e.g., Keep Q1 and Q5, edit Q3 to add more context, replace Q2 and Q4 entirely...',
          templateSlot: 'KEEP_EDIT_REPLACE',
          inputType: 'textarea',
        },
        {
          id: 'q2',
          question:
            'How would you sequence these questions in an actual assessment? Does the AI\'s ordering make pedagogical sense?',
          placeholder:
            'e.g., Start with easier recall questions to build confidence, then move to application...',
          templateSlot: 'SEQUENCING',
          inputType: 'textarea',
        },
        {
          id: 'q3',
          question:
            'What would you add that only someone who knows your students could contribute?',
          placeholder:
            'e.g., Include a question about the case study we discussed in week 3, reference the lab experiment...',
          templateSlot: 'PERSONAL_ADDITIONS',
          inputType: 'textarea',
        },
        {
          id: 'q4',
          question:
            'What final administration, scoring, or feedback notes would make this assessment usable in your classroom?',
          placeholder:
            'e.g., Allow calculators, collect written justifications separately, use Q4 as a discussion starter if many students miss it...',
          templateSlot: 'ADMIN_SCORING_NOTES',
          inputType: 'textarea',
        },
        {
          id: 'q5',
          question:
            'What has typically worked well in your past teaching experiences that this final assessment should preserve or build on?',
          placeholder:
            'e.g., Starting with a confidence-building item, using brief justification prompts, giving fast whole-class feedback on common errors...',
          templateSlot: 'PAST_TEACHING_SUCCESSES',
          inputType: 'textarea',
        },
      ],
      promptTemplate: {
        templateText:
          'Transform the revised assessment in this conversation into a final classroom-ready version. Treat the latest revised assessment as the source draft.\n\nMake these final adjustments:\n\nQuestion selection: [KEEP_EDIT_REPLACE].\n\nQuestion sequence: [SEQUENCING].\n\nContext-specific additions: [PERSONAL_ADDITIONS].\n\nAdministration, scoring, or feedback notes: [ADMIN_SCORING_NOTES].\n\nAssessment practices, feedback routines, or question structures that have typically worked well for me: [PAST_TEACHING_SUCCESSES].\n\nBefore producing the final version, privately use these inputs to remove weak items, reorder the assessment for a sensible student experience, make the scoring and feedback guidance practical, and build on the assessment practices that have worked well in the instructor\'s previous teaching.\n\nThen produce only the final assessment in clear markdown format.\n\nPlease include:\n- a concise assessment title\n- final student-facing directions\n- final numbered questions in the intended order\n- answer key or model answers\n- scoring guidance or point values\n- administration or feedback notes for the instructor\n- a brief explanation of why this final version is well aligned to the assessment purpose',
        slots: [
          {
            id: 'KEEP_EDIT_REPLACE',
            label: 'Keep/Edit/Replace',
            defaultText: 'which to keep, edit, or replace',
          },
          {
            id: 'SEQUENCING',
            label: 'Sequencing',
            defaultText: 'preferred question order',
          },
          {
            id: 'PERSONAL_ADDITIONS',
            label: 'Personal Additions',
            defaultText: 'context-specific elements to add',
          },
          {
            id: 'ADMIN_SCORING_NOTES',
            label: 'Administration and Scoring Notes',
            defaultText: 'final administration, scoring, or feedback notes',
          },
          {
            id: 'PAST_TEACHING_SUCCESSES',
            label: 'Past Teaching Successes',
            defaultText: 'assessment practices that have worked well before',
          },
        ],
      },
      evaluationTools: {
        reflectionQuestions: [
          {
            id: 'er1',
            question:
              'Is this assessment ready to give to your students, or does it still need your personal review and adjustment?',
          },
          {
            id: 'er2',
            question:
              'What did this process teach you about how AI approaches assessment creation — and where does it fall short?',
          },
        ],
        checklist: [
          {
            id: 'c1',
            text: 'Assessment is ready for classroom use',
          },
          {
            id: 'c2',
            text: 'Question sequence makes pedagogical sense',
          },
          {
            id: 'c3',
            text: 'Includes context your students will recognize',
          },
          {
            id: 'c4',
            text: 'Answer key is accurate and complete',
          },
        ],
        failureModes: [
          {
            id: 'fm1',
            title: 'False Confidence',
            description:
              'AI-generated assessments can look polished and professional while containing subtle errors or misalignments. The professional appearance can create false confidence. Always verify every answer and every claim.',
          },
        ],
      },
    },
  ],
};
