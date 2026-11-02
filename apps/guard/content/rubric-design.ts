import type { LabConfig } from '@/lib/types';
import { outputLanguageQuestion, outputLanguageSlot } from './output-language';

export const rubricDesignLab: LabConfig = {
  meta: {
    id: 'rubric-design',
    title: 'Design a Rubric',
    description:
      'Build a detailed grading rubric for an assignment, with criteria, performance levels, and descriptors generated through AI collaboration.',
    estimatedTime: '25-40 min',
    learningOutcome:
      "You'll learn to prompt for specificity, recognize vague AI language, and adapt outputs for practical classroom use.",
    coreSkill:
      'Specificity in prompting, recognizing vague AI language, adapting outputs for practical use',
    icon: 'rubric',
  },
  iterations: [
    // ========================================
    // ITERATION 1 — Structure & Criteria
    // ========================================
    {
      iterationNumber: 1,
      title: 'Structure & Criteria',
      focus: 'Define what the rubric should evaluate and how it should be structured.',
      isOptional: false,
      scaffoldingQuestions: [
        {
          id: 'q1',
          question:
            'What assignment or task will this rubric evaluate? Describe it as you would to a student.',
          placeholder:
            'e.g., A 5-page research paper analyzing a social issue using at least 3 academic sources...',
          templateSlot: 'ASSIGNMENT_DESCRIPTION',
          inputType: 'textarea',
        },
        {
          id: 'q2',
          question:
            'Who will use this rubric, and what should it help them do — grade consistently, give feedback, guide student revision, or something else?',
          placeholder:
            'e.g., First-year students will use it before submitting, and TAs will use it for consistent feedback...',
          templateSlot: 'STUDENT_CONTEXT',
          inputType: 'textarea',
        },
        {
          id: 'q3',
          question:
            'What are the most important qualities that distinguish excellent work from poor work on this assignment?',
          placeholder:
            'e.g., Quality of argument, use of evidence, clarity of writing, proper citations...',
          templateSlot: 'CRITERIA_LIST',
          inputType: 'textarea',
        },
        {
          id: 'q4',
          question:
            'How many performance levels do you want (e.g., Excellent / Proficient / Developing / Beginning), and what do those levels mean in your context?',
          placeholder:
            'e.g., 4 levels: Exemplary (A), Proficient (B), Developing (C), Beginning (D/F)...',
          templateSlot: 'LEVEL_NAMES',
          inputType: 'textarea',
        },
        {
          id: 'q5',
          question:
            'Should the rubric be analytic or holistic, and should criteria have weights or point values?',
          placeholder:
            'e.g., Analytic, 20 points total, with argument and evidence weighted more heavily than formatting...',
          templateSlot: 'RUBRIC_TYPE',
          inputType: 'textarea',
        },
        {
          id: 'q6',
          question:
            'What does the most common "good but not great" submission look like? Describing this helps define the middle of your scale.',
          placeholder:
            'e.g., Has a clear thesis but evidence is surface-level, writing is clear but not polished, citations present but inconsistent...',
          templateSlot: 'MIDDLE_DESCRIPTION',
          inputType: 'textarea',
        },
        outputLanguageQuestion,
      ],
      promptTemplate: {
        templateText:
          'You are an experienced educator and rubric designer. Create a rubric that is specific, observable, practical to grade with, and understandable to students.\n\nAssignment or task: [ASSIGNMENT_DESCRIPTION].\n\nRubric users and purpose: [STUDENT_CONTEXT].\n\nThe rubric should evaluate these key qualities: [CRITERIA_LIST].\n\nRubric type, weights, or points: [RUBRIC_TYPE].\n\nPerformance levels and what they mean: [LEVEL_NAMES].\n\nA typical "good but not great" submission looks like: [MIDDLE_DESCRIPTION].\n\nUse these inputs as design requirements. Before drafting, privately translate each key quality into observable evidence, define the middle level first using the typical submission, and then distinguish higher and lower levels by qualitative differences rather than vague adjective changes.\n\nThen produce only the rubric in clear markdown format.\n\nPlease include:\n- a concise rubric title\n- a short statement of what the rubric is designed to evaluate\n- a clean rubric table with criteria, performance levels, descriptors, and points or weights if requested\n- descriptors that name observable features of the work rather than internal states such as "understands" or "demonstrates excellence"\n- brief student-facing notes on how to use the rubric\n- brief grader-facing notes for applying the rubric consistently\n\nAlways respond in [LANGUAGE] language unless explicitly instructed otherwise.',
        slots: [
          {
            id: 'RUBRIC_TYPE',
            label: 'Rubric Type',
            defaultText: 'analytic or holistic',
          },
          {
            id: 'ASSIGNMENT_DESCRIPTION',
            label: 'Assignment Description',
            defaultText: 'the assignment description',
          },
          {
            id: 'STUDENT_CONTEXT',
            label: 'Rubric Users and Purpose',
            defaultText: 'who will use the rubric and why',
          },
          {
            id: 'CRITERIA_LIST',
            label: 'Evaluation Criteria',
            defaultText: 'key evaluation criteria',
          },
          {
            id: 'LEVEL_NAMES',
            label: 'Performance Levels',
            defaultText: 'performance level names',
          },
          {
            id: 'MIDDLE_DESCRIPTION',
            label: 'Middle Performance',
            defaultText: 'what "good but not great" looks like',
          },
          outputLanguageSlot,
        ],
      },
      evaluationTools: {
        reflectionQuestions: [
          {
            id: 'er1',
            question:
              'If a student read only this rubric (without other instructions), would they understand what excellent work looks like?',
          },
          {
            id: 'er2',
            question:
              'Are the distinctions between adjacent performance levels clear and meaningful, or do they blur together?',
          },
        ],
        checklist: [
          {
            id: 'c1',
            text: 'Criteria cover all important dimensions of the assignment',
          },
          {
            id: 'c2',
            text: 'Descriptors are specific and observable (not vague)',
          },
          {
            id: 'c3',
            text: 'Performance levels are meaningfully distinct',
          },
          {
            id: 'c4',
            text: 'Language is student-facing and clear',
          },
          {
            id: 'c5',
            text: 'Rubric is practical to use during grading',
          },
        ],
        failureModes: [
          {
            id: 'fm1',
            title: 'Vague Qualifiers',
            description:
              'AI-generated rubrics frequently use vague qualifiers ("demonstrates understanding," "shows proficiency") that don\'t help students or graders. Look for descriptors that describe observable behavior, not internal states.',
          },
        ],
      },
    },

    // ========================================
    // ITERATION 2 — Precision & Usability
    // ========================================
    {
      iterationNumber: 2,
      title: 'Precision & Usability',
      focus: 'Sharpen descriptors for consistency and practical use.',
      isOptional: false,
      scaffoldingQuestions: [
        {
          id: 'q1',
          question:
            'Read each descriptor: could two different graders independently assign the same score using this rubric, or is there too much room for interpretation?',
          placeholder:
            'e.g., The "Proficient" level for argument quality is too vague — "adequate" doesn\'t tell graders what to look for...',
          templateSlot: 'GRADER_CONSISTENCY',
          inputType: 'textarea',
        },
        {
          id: 'q2',
          question:
            'Are there criteria where the AI used circular language (e.g., "excellent work demonstrates excellence")? What specific behavior should replace it?',
          placeholder:
            'e.g., "Demonstrates strong analysis" should be "Identifies at least 3 perspectives and evaluates each with evidence"...',
          templateSlot: 'CIRCULAR_LANGUAGE',
          inputType: 'textarea',
        },
        {
          id: 'q3',
          question:
            'Would a student in your class understand every descriptor, or does the rubric use language that assumes expertise they don\'t have?',
          placeholder:
            'e.g., "Synthesizes sources" — my first-year students may not know what synthesis means in this context...',
          templateSlot: 'STUDENT_CLARITY',
          inputType: 'textarea',
        },
        {
          id: 'q4',
          question:
            'Try mentally grading a past student\'s work with this rubric — does it capture what you actually value?',
          placeholder:
            'e.g., When I think of my best student\'s paper, the rubric doesn\'t capture the originality of their argument...',
          templateSlot: 'REAL_WORLD_TEST',
          inputType: 'textarea',
        },
        {
          id: 'q5',
          question:
            'Where would this rubric slow down grading or make feedback harder to give?',
          placeholder:
            'e.g., The descriptors are too long to scan quickly, and two criteria overlap so I would double-count the same issue...',
          templateSlot: 'PRACTICALITY_GAPS',
          inputType: 'textarea',
        },
        {
          id: 'q6',
          question:
            'Which criteria, descriptors, or structural choices are worth keeping because they work well?',
          placeholder:
            'e.g., Keep the evidence criterion and the four-level structure, but revise the analysis descriptors...',
          templateSlot: 'KEEP_ELEMENTS',
          inputType: 'textarea',
        },
      ],
      promptTemplate: {
        templateText:
          'You are an experienced educator and rubric designer. Revise the most recent rubric in this conversation. Treat that previous rubric as the draft to improve, not as a prompt to start over from scratch.\n\nI reviewed the draft and identified these issues:\n\nGrader consistency: [GRADER_CONSISTENCY].\n\nCircular or vague language: [CIRCULAR_LANGUAGE].\n\nStudent clarity: [STUDENT_CLARITY].\n\nReal-world alignment with what I value: [REAL_WORLD_TEST].\n\nPractical grading or feedback problems: [PRACTICALITY_GAPS].\n\nCriteria, descriptors, or structural choices worth keeping: [KEEP_ELEMENTS].\n\nBefore revising, privately determine which descriptors need more observable evidence, which levels blur together, which wording students would not understand, and where the rubric needs to be easier to scan and apply during grading.\n\nThen produce only the revised rubric in clear markdown format. Preserve the elements worth keeping, but revise vague, circular, overlapping, impractical, or misaligned parts.\n\nPlease include:\n- the revised rubric table\n- points or weights if they belong in the rubric\n- student-facing wording that is clear and concrete\n- brief grader notes for consistent application\n- a short revision rationale explaining the most important changes',
        slots: [
          {
            id: 'GRADER_CONSISTENCY',
            label: 'Grader Consistency',
            defaultText: 'where graders would disagree',
          },
          {
            id: 'CIRCULAR_LANGUAGE',
            label: 'Circular Language',
            defaultText: 'vague language to replace',
          },
          {
            id: 'STUDENT_CLARITY',
            label: 'Student Clarity',
            defaultText: 'language students won\'t understand',
          },
          {
            id: 'REAL_WORLD_TEST',
            label: 'Real-World Test',
            defaultText: 'what the rubric misses about your values',
          },
          {
            id: 'PRACTICALITY_GAPS',
            label: 'Practicality Gaps',
            defaultText: 'where grading or feedback would be harder',
          },
          {
            id: 'KEEP_ELEMENTS',
            label: 'Elements to Keep',
            defaultText: 'criteria or descriptors to preserve',
          },
        ],
      },
      evaluationTools: {
        reflectionQuestions: [
          {
            id: 'er1',
            question:
              'Are the revised descriptors genuinely more specific, or did the AI just add more words without more precision?',
          },
          {
            id: 'er2',
            question:
              'Could you use this rubric to give a student concrete feedback on how to improve?',
          },
        ],
        checklist: [
          {
            id: 'c1',
            text: 'Criteria cover all important dimensions of the assignment',
          },
          {
            id: 'c2',
            text: 'Descriptors are specific and observable (not vague)',
          },
          {
            id: 'c3',
            text: 'Performance levels are meaningfully distinct',
          },
          {
            id: 'c4',
            text: 'Language is student-facing and clear',
          },
          {
            id: 'c5',
            text: 'Rubric is practical to use during grading',
          },
          {
            id: 'c6',
            text: 'Two graders would assign consistent scores',
          },
          {
            id: 'c7',
            text: 'No circular language or empty qualifiers remain',
          },
          {
            id: 'c8',
            text: 'Each level describes qualitatively different work, not just adjective substitution',
          },
        ],
        failureModes: [
          {
            id: 'fm1',
            title: 'Symmetrical Descriptors',
            description:
              'AI rubrics tend to create symmetrical descriptors (just substituting adjectives across levels) rather than describing qualitatively different performances. Check whether each level describes a genuinely different kind of work.',
          },
        ],
      },
    },

    // ========================================
    // ITERATION 3 (Optional) — Calibration
    // ========================================
    {
      iterationNumber: 3,
      title: 'Calibration',
      focus: 'Fine-tune for consistent, fair grading in practice.',
      isOptional: true,
      scaffoldingQuestions: [
        {
          id: 'q1',
          question:
            'Which criterion would be hardest to grade consistently? What would make it easier?',
          placeholder:
            'e.g., "Critical thinking" is hardest — adding example phrases or indicators would help...',
          templateSlot: 'HARDEST_CRITERION',
          inputType: 'textarea',
        },
        {
          id: 'q2',
          question:
            'Does this rubric reward what matters most to you, or has the AI subtly shifted the emphasis?',
          placeholder:
            'e.g., The rubric weights technical formatting too heavily compared to the quality of analysis...',
          templateSlot: 'EMPHASIS_CHECK',
          inputType: 'textarea',
        },
        {
          id: 'q3',
          question:
            'What instructions or context would you add when sharing this rubric with students?',
          placeholder:
            'e.g., I would explain that "original analysis" means going beyond what we discussed in class...',
          templateSlot: 'STUDENT_INSTRUCTIONS',
          inputType: 'textarea',
        },
        {
          id: 'q4',
          question:
            'What final grading workflow, calibration step, or feedback note would help you use this rubric consistently?',
          placeholder:
            'e.g., Before grading, norm with two sample papers; use margin comments only for the two lowest-scoring criteria...',
          templateSlot: 'GRADING_WORKFLOW',
          inputType: 'textarea',
        },
        {
          id: 'q5',
          question:
            'What has typically worked well in your past teaching experiences that this final rubric should preserve or build on?',
          placeholder:
            'e.g., Short descriptors students can scan, one concrete example per criterion, calibration with two sample submissions...',
          templateSlot: 'PAST_TEACHING_SUCCESSES',
          inputType: 'textarea',
        },
      ],
      promptTemplate: {
        templateText:
          'Transform the revised rubric in this conversation into a final classroom-ready version. Treat the latest revised rubric as the source draft.\n\nMake these final adjustments:\n\nHardest criterion to grade consistently: [HARDEST_CRITERION].\n\nEmphasis or weighting adjustment: [EMPHASIS_CHECK].\n\nStudent-facing instructions or context: [STUDENT_INSTRUCTIONS].\n\nGrading workflow, calibration, or feedback notes: [GRADING_WORKFLOW].\n\nRubric practices, feedback habits, or grading workflows that have typically worked well for me: [PAST_TEACHING_SUCCESSES].\n\nBefore producing the final version, privately use these inputs to clarify the hardest criterion, rebalance emphasis if needed, make the rubric practical for both student use and grading, and build on the rubric or feedback practices that have worked well in the instructor\'s previous teaching.\n\nThen produce only the final rubric in clear markdown format.\n\nPlease include:\n- a concise rubric title\n- final student-facing instructions\n- the final rubric table with criteria, levels, descriptors, and points or weights if used\n- concise grader notes or calibration guidance\n- a brief explanation of how the final version supports fair, consistent, useful feedback',
        slots: [
          {
            id: 'HARDEST_CRITERION',
            label: 'Hardest Criterion',
            defaultText: 'which criterion is hardest to grade',
          },
          {
            id: 'EMPHASIS_CHECK',
            label: 'Emphasis Check',
            defaultText: 'where emphasis needs adjustment',
          },
          {
            id: 'STUDENT_INSTRUCTIONS',
            label: 'Student Instructions',
            defaultText: 'context to add for students',
          },
          {
            id: 'GRADING_WORKFLOW',
            label: 'Grading Workflow',
            defaultText: 'grading workflow or calibration notes',
          },
          {
            id: 'PAST_TEACHING_SUCCESSES',
            label: 'Past Teaching Successes',
            defaultText: 'rubric or feedback practices that have worked well before',
          },
        ],
      },
      evaluationTools: {
        reflectionQuestions: [
          {
            id: 'er1',
            question:
              'Could you hand this rubric to students and feel confident it communicates your expectations clearly?',
          },
          {
            id: 'er2',
            question:
              'What have you learned about how AI handles rubric creation — and where does your expertise remain essential?',
          },
        ],
        checklist: [
          {
            id: 'c1',
            text: 'Rubric is ready for classroom use',
          },
          {
            id: 'c2',
            text: 'Grading would be consistent across different graders',
          },
          {
            id: 'c3',
            text: 'Emphasis reflects your pedagogical priorities',
          },
          {
            id: 'c4',
            text: 'Students would understand expectations from the rubric alone',
          },
        ],
        failureModes: [
          {
            id: 'fm1',
            title: 'Polish Without Substance',
            description:
              'A rubric can look professional and complete while still being impractical to use. The ultimate test is: does it help you grade faster and more fairly, and does it help students understand how to improve?',
          },
        ],
      },
    },
  ],
};
