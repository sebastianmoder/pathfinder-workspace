import type { LabConfig } from '@/lib/types';
import { outputLanguageQuestion, outputLanguageSlot } from './output-language';

export const assignmentAiResilienceLab: LabConfig = {
  meta: {
    id: 'assignment-ai-resilience',
    title: 'Revise an Assignment for AI Use',
    description:
      'Upload an existing assignment and revise it so student AI use is handled fairly while preserving meaningful learning assessment.',
    estimatedTime: '30-45 min',
    learningOutcome:
      "You'll learn to identify AI-vulnerable assignment design, define fair AI-use expectations, and revise tasks to assess meaningful student learning.",
    coreSkill:
      'Assignment redesign for AI use, fairness, process evidence, meaningful assessment',
    icon: 'shield',
  },
  iterations: [
    // ========================================
    // ITERATION 1 — Assignment Diagnosis
    // ========================================
    {
      iterationNumber: 1,
      title: 'Assignment Diagnosis',
      focus:
        'Clarify the assignment purpose, AI exposure, and fairness constraints before revising.',
      isOptional: false,
      scaffoldingQuestions: [
        {
          id: 'q1',
          question:
            'What course or learning context is this assignment for, and who are the students?',
          placeholder:
            'e.g., Second-year sociology students, mixed prior experience with qualitative analysis...',
          templateSlot: 'COURSE_CONTEXT',
          inputType: 'textarea',
        },
        {
          id: 'q2',
          question:
            'What should this assignment validly assess? Name the learning outcomes, skills, habits of mind, or evidence of understanding that matter most.',
          placeholder:
            'e.g., Students should interpret primary evidence, justify claims, and connect theory to a local case...',
          templateSlot: 'LEARNING_EVIDENCE',
          inputType: 'textarea',
        },
        {
          id: 'q3',
          question:
            'How do you expect students might use AI on this assignment, whether allowed or not?',
          placeholder:
            'e.g., Generate essay outlines, summarize readings, draft code, polish language, invent references...',
          templateSlot: 'LIKELY_AI_USE',
          inputType: 'textarea',
        },
        {
          id: 'q4',
          question:
            'What AI-use stance should the revised assignment take: restrict, allow with disclosure, require AI as a tool, compare AI and human reasoning, or something else?',
          placeholder:
            'e.g., Allow brainstorming and language polishing with disclosure, but require original analysis and source checking...',
          templateSlot: 'AI_STANCE',
          inputType: 'textarea',
        },
        {
          id: 'q5',
          question:
            'What fairness constraints should the redesign respect? Consider access to AI tools, language support, disability accommodations, privacy, workload, and institutional policy.',
          placeholder:
            'e.g., Some students will only use free tools; no mandatory account creation; keep grading load manageable...',
          templateSlot: 'FAIRNESS_CONSTRAINTS',
          inputType: 'textarea',
        },
        {
          id: 'q6',
          question:
            'What practical constraints should the assignment still fit: time available, submission format, class size, grading workflow, required standards, or platform limits?',
          placeholder:
            'e.g., Two-week take-home assignment, 80 students, LMS submission, one teaching assistant...',
          templateSlot: 'PRACTICAL_CONSTRAINTS',
          inputType: 'textarea',
        },
        outputLanguageQuestion,
      ],
      promptTemplate: {
        templateText:
          'You are an experienced educator and assessment designer helping revise an existing assignment for a classroom where students may use AI tools.\n\nUse the uploaded assignment document in the additional context as the source assignment. If no assignment document is available in context, do not invent an assignment. Ask the educator to upload or paste the assignment and stop.\n\nCourse and students: [COURSE_CONTEXT].\n\nThe assignment should assess this learning evidence: [LEARNING_EVIDENCE].\n\nLikely student AI use: [LIKELY_AI_USE].\n\nDesired AI-use stance: [AI_STANCE].\n\nFairness constraints: [FAIRNESS_CONSTRAINTS].\n\nPractical constraints: [PRACTICAL_CONSTRAINTS].\n\nBefore drafting, privately analyze the uploaded assignment for parts that are easy to outsource to AI, parts where AI could support learning if structured, hidden assumptions about student access or prior knowledge, and places where the assignment may measure compliance or tool access instead of the intended learning.\n\nThen produce only a revised assignment draft in clear markdown format. Preserve the core learning purpose where possible, but revise the task so it can withstand or productively leverage student AI use.\n\nPlease include:\n- a concise diagnosis of the original assignment vulnerabilities\n- a revised student-facing assignment brief\n- a clear AI-use policy explaining what is permitted, required, discouraged, or prohibited\n- required evidence of student thinking, process, decision-making, or verification\n- fairness and accessibility considerations built into the assignment design\n- suggested submission components\n- a brief rationale explaining how the revision better assesses meaningful learning\n\nAlways respond in [LANGUAGE] language unless explicitly instructed otherwise.',
        slots: [
          {
            id: 'COURSE_CONTEXT',
            label: 'Course Context',
            defaultText: 'course context and student level',
          },
          {
            id: 'LEARNING_EVIDENCE',
            label: 'Learning Evidence',
            defaultText: 'what the assignment should assess',
          },
          {
            id: 'LIKELY_AI_USE',
            label: 'Likely AI Use',
            defaultText: 'how students might use AI',
          },
          {
            id: 'AI_STANCE',
            label: 'AI-Use Stance',
            defaultText: 'desired AI-use stance',
          },
          {
            id: 'FAIRNESS_CONSTRAINTS',
            label: 'Fairness Constraints',
            defaultText: 'fairness constraints',
          },
          {
            id: 'PRACTICAL_CONSTRAINTS',
            label: 'Practical Constraints',
            defaultText: 'practical constraints',
          },
          outputLanguageSlot,
        ],
      },
      evaluationTools: {
        reflectionQuestions: [
          {
            id: 'er1',
            question:
              'Does the revised assignment still assess the learning you actually care about, or did it mainly become an AI-detection exercise?',
          },
          {
            id: 'er2',
            question:
              'Would students with different AI access, language backgrounds, or support needs have a fair path to succeed?',
          },
        ],
        checklist: [
          {
            id: 'c1',
            text: 'Revision preserves the original learning purpose',
          },
          {
            id: 'c2',
            text: 'AI-use expectations are explicit and enforceable',
          },
          {
            id: 'c3',
            text: 'Students must provide evidence of thinking or process',
          },
          {
            id: 'c4',
            text: 'Design does not reward paid AI access or hidden support',
          },
          {
            id: 'c5',
            text: 'Submission components are realistic to grade',
          },
        ],
        failureModes: [
          {
            id: 'fm1',
            title: 'AI-Proofing by Surveillance',
            description:
              'AI-focused redesign can drift toward policing, detection, or excessive proof requirements. Check whether each added requirement improves learning evidence or merely raises anxiety and workload.',
          },
          {
            id: 'fm2',
            title: 'Access Blind Spot',
            description:
              'Assignments that require AI can become unfair if students need paid tools, accounts, strong English prompting skills, or private data entry. Build in equitable options and clear boundaries.',
          },
        ],
      },
    },

    // ========================================
    // ITERATION 2 — Fairness & Learning Evidence
    // ========================================
    {
      iterationNumber: 2,
      title: 'Fairness & Evidence',
      focus:
        'Strengthen the draft so AI use is transparent, equitable, and tied to learning evidence.',
      isOptional: false,
      scaffoldingQuestions: [
        {
          id: 'q1',
          question:
            'Where could students still outsource the core thinking to AI without demonstrating the intended learning?',
          placeholder:
            'e.g., The final essay is still generic enough that an AI draft could satisfy most criteria...',
          templateSlot: 'OUTSOURCING_RISK',
          inputType: 'textarea',
        },
        {
          id: 'q2',
          question:
            'Where could AI use be deliberately leveraged to deepen learning rather than hidden or ignored?',
          placeholder:
            'e.g., Students could critique an AI-generated interpretation against course concepts and their own evidence...',
          templateSlot: 'LEVERAGE_OPPORTUNITY',
          inputType: 'textarea',
        },
        {
          id: 'q3',
          question:
            'What process evidence would help you distinguish meaningful student work from polished AI output?',
          placeholder:
            'e.g., annotated sources, decision memo, version notes, short oral defense, in-class planning artifact...',
          templateSlot: 'PROCESS_EVIDENCE',
          inputType: 'textarea',
        },
        {
          id: 'q4',
          question:
            'What fairness or accessibility issue remains in the draft?',
          placeholder:
            'e.g., Disclosure expectations are vague; students without reliable internet may be disadvantaged...',
          templateSlot: 'FAIRNESS_GAP',
          inputType: 'textarea',
        },
        {
          id: 'q5',
          question:
            'What parts of the current draft are worth keeping because they support learning, clarity, or fair assessment?',
          placeholder:
            'e.g., Keep the reflective memo and the required source-checking step...',
          templateSlot: 'KEEP_ELEMENTS',
          inputType: 'textarea',
        },
        {
          id: 'q6',
          question:
            'What grading, feedback, or workload problem would this assignment create if used as written?',
          placeholder:
            'e.g., The process portfolio would be too long to grade; the AI disclosure might need a simple checklist...',
          templateSlot: 'GRADING_WORKLOAD',
          inputType: 'textarea',
        },
      ],
      promptTemplate: {
        templateText:
          'You are an experienced educator and assessment designer. Revise the most recent assignment draft in this conversation. Treat that previous draft as the source to improve, while continuing to respect the uploaded original assignment.\n\nI reviewed the draft and identified these issues:\n\nOutsourcing risk: [OUTSOURCING_RISK].\n\nOpportunity to leverage AI for learning: [LEVERAGE_OPPORTUNITY].\n\nNeeded evidence of student thinking or process: [PROCESS_EVIDENCE].\n\nRemaining fairness or accessibility gap: [FAIRNESS_GAP].\n\nGrading, feedback, or workload concern: [GRADING_WORKLOAD].\n\nElements worth keeping: [KEEP_ELEMENTS].\n\nBefore revising, privately decide which task components should be kept, simplified, replaced, or reframed. Make sure the assignment assesses the intended learning even when students use AI, and make sure the AI policy is fair, understandable, and usable in practice.\n\nThen produce only the revised assignment in clear markdown format.\n\nPlease include:\n- the revised student-facing assignment brief\n- the revised AI-use policy and disclosure expectations\n- process, verification, or reflection artifacts that are proportionate to the assignment stakes\n- equity options or alternatives where AI access differs\n- grading or feedback guidance for the instructor\n- a short revision rationale explaining how the changes improve fairness and meaningful assessment',
        slots: [
          {
            id: 'OUTSOURCING_RISK',
            label: 'Outsourcing Risk',
            defaultText: 'where students could outsource core thinking',
          },
          {
            id: 'LEVERAGE_OPPORTUNITY',
            label: 'AI Leverage Opportunity',
            defaultText: 'where AI could deepen learning',
          },
          {
            id: 'PROCESS_EVIDENCE',
            label: 'Process Evidence',
            defaultText: 'evidence of student thinking or process',
          },
          {
            id: 'FAIRNESS_GAP',
            label: 'Fairness Gap',
            defaultText: 'remaining fairness or accessibility issue',
          },
          {
            id: 'GRADING_WORKLOAD',
            label: 'Grading Workload',
            defaultText: 'grading, feedback, or workload concern',
          },
          {
            id: 'KEEP_ELEMENTS',
            label: 'Elements to Keep',
            defaultText: 'elements worth keeping',
          },
        ],
      },
      evaluationTools: {
        reflectionQuestions: [
          {
            id: 'er1',
            question:
              'Can you explain to students why each AI-related requirement exists in learning terms, not just integrity terms?',
          },
          {
            id: 'er2',
            question:
              'Does the revision reduce unfair advantages without making the assignment unnecessarily complicated?',
          },
        ],
        checklist: [
          {
            id: 'c1',
            text: 'Core thinking cannot be fully outsourced without detection through learning evidence',
          },
          {
            id: 'c2',
            text: 'AI use is leveraged where it supports the learning goal',
          },
          {
            id: 'c3',
            text: 'Disclosure expectations are specific and student-facing',
          },
          {
            id: 'c4',
            text: 'Fair alternatives exist for different levels of AI access',
          },
          {
            id: 'c5',
            text: 'Process artifacts are proportionate and gradeable',
          },
          {
            id: 'c6',
            text: 'Instructor workload remains realistic',
          },
        ],
        failureModes: [
          {
            id: 'fm1',
            title: 'Complexity Creep',
            description:
              'AI-resilient assignments can become over-engineered. If every safeguard adds another deliverable, students may lose sight of the learning goal and instructors may inherit unmanageable grading.',
          },
          {
            id: 'fm2',
            title: 'Disclosure Without Consequences',
            description:
              'A disclosure rule is weak if students do not know what to disclose, how it affects grading, or what counts as acceptable support. Make disclosure concrete and connected to assessment criteria.',
          },
        ],
      },
    },

    // ========================================
    // ITERATION 3 (Optional) — Classroom-Ready Version
    // ========================================
    {
      iterationNumber: 3,
      title: 'Classroom-Ready Version',
      focus:
        'Turn the revised draft into a usable assignment package for students and instructors.',
      isOptional: true,
      scaffoldingQuestions: [
        {
          id: 'q1',
          question:
            'What final student-facing tone or wording changes would make the assignment fit your teaching style?',
          placeholder:
            'e.g., Less punitive language, clearer examples of acceptable AI use, more direct instructions...',
          templateSlot: 'STUDENT_VOICE',
          inputType: 'textarea',
        },
        {
          id: 'q2',
          question:
            'What exact AI acknowledgement, citation, or disclosure language should students use?',
          placeholder:
            'e.g., Include a short appendix listing tool, purpose, prompt excerpt, and what the student changed...',
          templateSlot: 'DISCLOSURE_LANGUAGE',
          inputType: 'textarea',
        },
        {
          id: 'q3',
          question:
            'What checkpoints, in-class components, oral explanations, or feedback moments should be added or removed?',
          placeholder:
            'e.g., Add a 5-minute in-class planning note; remove the long process log; add peer review before submission...',
          templateSlot: 'CHECKPOINTS',
          inputType: 'textarea',
        },
        {
          id: 'q4',
          question:
            'What needs to align with your rubric, grading criteria, or institutional academic integrity guidance?',
          placeholder:
            'e.g., Add a criterion for verified evidence use; match our faculty AI policy wording...',
          templateSlot: 'RUBRIC_POLICY_ALIGNMENT',
          inputType: 'textarea',
        },
        {
          id: 'q5',
          question:
            'What support should students receive so expectations are fair and transparent before they begin?',
          placeholder:
            'e.g., Provide examples of acceptable and unacceptable AI use; offer a no-AI pathway; discuss source verification...',
          templateSlot: 'STUDENT_SUPPORT',
          inputType: 'textarea',
        },
        {
          id: 'q6',
          question:
            'What has typically worked well in your past teaching experiences that this final assignment should preserve or build on?',
          placeholder:
            'e.g., Short proposal checkpoints, annotated examples, clear submission checklists, in-class time to test ideas...',
          templateSlot: 'PAST_TEACHING_SUCCESSES',
          inputType: 'textarea',
        },
      ],
      promptTemplate: {
        templateText:
          'Transform the revised assignment in this conversation into a final classroom-ready assignment package. Treat the latest revised assignment as the source draft and continue to respect the uploaded original assignment and stated teaching context.\n\nMake these final adjustments:\n\nStudent-facing tone and wording: [STUDENT_VOICE].\n\nExact AI acknowledgement, citation, or disclosure language: [DISCLOSURE_LANGUAGE].\n\nCheckpoints, in-class components, oral explanations, or feedback moments: [CHECKPOINTS].\n\nRubric, grading, or institutional policy alignment: [RUBRIC_POLICY_ALIGNMENT].\n\nStudent support needed before they begin: [STUDENT_SUPPORT].\n\nAssignment structures, support routines, or teaching moves that have typically worked well for me: [PAST_TEACHING_SUCCESSES].\n\nBefore producing the final version, privately remove redundant safeguards, clarify ambiguous AI-use rules, ensure the final assignment remains fair, assessable, and understandable to students, and build on the past teaching successes where they strengthen student learning, transparency, or implementation.\n\nThen produce only the final assignment package in clear markdown format.\n\nPlease include:\n- final assignment title and overview\n- final student-facing directions\n- permitted, required, discouraged, and prohibited AI uses where relevant\n- exact student AI acknowledgement or disclosure template\n- submission checklist\n- process or checkpoint requirements\n- concise grading criteria or rubric-alignment notes\n- instructor implementation notes\n- student support or transparency notes to provide before launch\n- a brief final rationale explaining how this version withstands or leverages AI use while preserving meaningful learning assessment',
        slots: [
          {
            id: 'STUDENT_VOICE',
            label: 'Student-Facing Voice',
            defaultText: 'student-facing tone and wording changes',
          },
          {
            id: 'DISCLOSURE_LANGUAGE',
            label: 'Disclosure Language',
            defaultText: 'AI acknowledgement or disclosure language',
          },
          {
            id: 'CHECKPOINTS',
            label: 'Checkpoints',
            defaultText: 'checkpoints or feedback moments',
          },
          {
            id: 'RUBRIC_POLICY_ALIGNMENT',
            label: 'Rubric/Policy Alignment',
            defaultText: 'rubric, grading, or policy alignment',
          },
          {
            id: 'STUDENT_SUPPORT',
            label: 'Student Support',
            defaultText: 'support students need before beginning',
          },
          {
            id: 'PAST_TEACHING_SUCCESSES',
            label: 'Past Teaching Successes',
            defaultText: 'assignment practices that have worked well before',
          },
        ],
      },
      evaluationTools: {
        reflectionQuestions: [
          {
            id: 'er1',
            question:
              'Would a student know exactly what AI use is acceptable, what must be disclosed, and what evidence they must submit?',
          },
          {
            id: 'er2',
            question:
              'What will you need to adjust in your rubric, LMS page, or classroom explanation before launching this assignment?',
          },
        ],
        checklist: [
          {
            id: 'c1',
            text: 'Assignment is ready to share with students',
          },
          {
            id: 'c2',
            text: 'AI acknowledgement language is concrete',
          },
          {
            id: 'c3',
            text: 'Submission checklist matches grading criteria',
          },
          {
            id: 'c4',
            text: 'Student support is planned before the assignment begins',
          },
          {
            id: 'c5',
            text: 'Instructor notes make implementation realistic',
          },
        ],
        failureModes: [
          {
            id: 'fm1',
            title: 'Polished but Misaligned',
            description:
              'A final AI-generated assignment can look complete while drifting from course policy, rubric language, or what students have practiced. Check alignment before using it.',
          },
        ],
      },
    },
  ],
};
