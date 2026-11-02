import type { LabConfig } from '@/lib/types';
import { outputLanguageQuestion, outputLanguageSlot } from './output-language';

export const curriculumRevisionLab: LabConfig = {
  meta: {
    id: 'curriculum-revision',
    title: 'Revise an Existing Curriculum',
    description:
      'Upload an existing curriculum, syllabus, or module sequence and revise it for stronger alignment, coherence, AI literacy, and realistic implementation.',
    estimatedTime: '35-50 min',
    learningOutcome:
      "You'll learn to diagnose curriculum alignment, refine sequencing and learning evidence, and turn a revision into an implementable curriculum plan.",
    coreSkill:
      'Curriculum alignment, sequencing, AI literacy integration, implementation planning',
    icon: 'curriculum',
  },
  iterations: [
    // ========================================
    // ITERATION 1 - Curriculum Diagnosis
    // ========================================
    {
      iterationNumber: 1,
      title: 'Curriculum Diagnosis',
      focus:
        'Clarify the purpose, constraints, and revision direction before changing the curriculum.',
      isOptional: false,
      scaffoldingQuestions: [
        {
          id: 'q1',
          question:
            'What curriculum context is this for: course, unit, module, program, grade level, discipline, and student group?',
          placeholder:
            'e.g., First-year data literacy module for non-majors, 12 weeks, mixed quantitative confidence...',
          templateSlot: 'CURRICULUM_CONTEXT',
          inputType: 'textarea',
        },
        {
          id: 'q2',
          question:
            'What learning outcomes, capabilities, or graduate attributes should the revised curriculum protect or strengthen?',
          placeholder:
            'e.g., Students should evaluate evidence, explain model limitations, collaborate ethically, and communicate findings...',
          templateSlot: 'LEARNING_GOALS',
          inputType: 'textarea',
        },
        {
          id: 'q3',
          question:
            'What is not working in the current curriculum? Consider sequencing, overload, gaps, duplication, assessment alignment, engagement, or student support.',
          placeholder:
            'e.g., Too much content in weeks 3-5, weak bridge from concepts to practice, final project arrives too late...',
          templateSlot: 'CURRENT_PROBLEMS',
          inputType: 'textarea',
        },
        {
          id: 'q4',
          question:
            'How should AI tools or AI literacy fit into this curriculum, if at all?',
          placeholder:
            'e.g., Students should practice critique of AI outputs, use AI for feedback with disclosure, and understand limitations...',
          templateSlot: 'AI_LITERACY_ROLE',
          inputType: 'textarea',
        },
        {
          id: 'q5',
          question:
            'What constraints must the revision respect: contact hours, accreditation, institutional policy, required topics, staffing, technology access, or assessment rules?',
          placeholder:
            'e.g., Keep 10 weekly seminars, meet accreditation outcome B2, no paid AI tools, same final assessment weight...',
          templateSlot: 'CONSTRAINTS',
          inputType: 'textarea',
        },
        {
          id: 'q6',
          question:
            'What should the first revised version prioritize: alignment, sequencing, workload, AI readiness, inclusion, assessment evidence, or another goal?',
          placeholder:
            'e.g., Prioritize clearer sequencing and formative checkpoints without increasing student workload...',
          templateSlot: 'REVISION_PRIORITY',
          inputType: 'textarea',
        },
        outputLanguageQuestion,
      ],
      promptTemplate: {
        templateText:
          'You are an experienced curriculum designer helping revise an existing curriculum.\n\nUse the uploaded curriculum document in the additional context as the source curriculum. If no curriculum document is available in context, do not invent a curriculum. Ask the educator to upload or paste the curriculum and stop.\n\nCurriculum context: [CURRICULUM_CONTEXT].\n\nLearning goals to protect or strengthen: [LEARNING_GOALS].\n\nCurrent curriculum problems: [CURRENT_PROBLEMS].\n\nDesired role of AI tools or AI literacy: [AI_LITERACY_ROLE].\n\nConstraints: [CONSTRAINTS].\n\nRevision priority: [REVISION_PRIORITY].\n\nBefore drafting, privately analyze the uploaded curriculum for alignment among outcomes, learning activities, assessments, sequencing, workload, student support, and the stated AI literacy role. Look for gaps, duplication, hidden prerequisite assumptions, overpacked sections, missing evidence of learning, inequitable access requirements, and places where AI use may either support or undermine the intended learning.\n\nThen produce only a revised curriculum draft in clear markdown format. Preserve the curriculum purpose where possible, but revise the structure so it is coherent, teachable, and aligned with the stated priorities.\n\nPlease include:\n- a concise diagnosis of the current curriculum strengths and problems\n- revised learning outcomes or capability statements where needed\n- a revised sequence, module map, or week-by-week outline\n- where key learning activities, practice opportunities, and assessments fit\n- how AI tools or AI literacy are included, limited, or deliberately excluded\n- student support and equity considerations\n- workload and implementation notes for the instructor\n- a brief rationale explaining how the revision improves alignment and coherence\n\nAlways respond in [LANGUAGE] language unless explicitly instructed otherwise.',
        slots: [
          {
            id: 'CURRICULUM_CONTEXT',
            label: 'Curriculum Context',
            defaultText: 'curriculum context and student group',
          },
          {
            id: 'LEARNING_GOALS',
            label: 'Learning Goals',
            defaultText: 'learning goals to protect or strengthen',
          },
          {
            id: 'CURRENT_PROBLEMS',
            label: 'Current Problems',
            defaultText: 'current curriculum problems',
          },
          {
            id: 'AI_LITERACY_ROLE',
            label: 'AI Literacy Role',
            defaultText: 'desired role of AI tools or AI literacy',
          },
          {
            id: 'CONSTRAINTS',
            label: 'Constraints',
            defaultText: 'constraints the revision must respect',
          },
          {
            id: 'REVISION_PRIORITY',
            label: 'Revision Priority',
            defaultText: 'top revision priority',
          },
          outputLanguageSlot,
        ],
      },
      evaluationTools: {
        reflectionQuestions: [
          {
            id: 'er1',
            question:
              'Does the revised curriculum make the learning journey clearer, or did it mainly rearrange topics without improving progression?',
          },
          {
            id: 'er2',
            question:
              'Are the AI-related elements tied to learning goals and student support, rather than added as a separate novelty layer?',
          },
        ],
        checklist: [
          {
            id: 'c1',
            text: 'Revision preserves the core curriculum purpose',
          },
          {
            id: 'c2',
            text: 'Outcomes, activities, and assessments are visibly aligned',
          },
          {
            id: 'c3',
            text: 'Sequence builds from prerequisite knowledge to more complex performance',
          },
          {
            id: 'c4',
            text: 'AI use or AI literacy has a clear pedagogical reason',
          },
          {
            id: 'c5',
            text: 'Student workload and instructor workload are realistic',
          },
          {
            id: 'c6',
            text: 'Access, inclusion, and support needs are addressed',
          },
        ],
        failureModes: [
          {
            id: 'fm1',
            title: 'Topic Shuffle',
            description:
              'A curriculum revision can look different without improving learning progression. Check whether each change strengthens alignment, sequence, evidence, support, or feasibility.',
          },
          {
            id: 'fm2',
            title: 'AI Add-On',
            description:
              'AI activities can become detached from the curriculum. Keep AI use connected to the stated outcomes, assessment evidence, and equitable student access.',
          },
        ],
      },
    },

    // ========================================
    // ITERATION 2 - Coherence and Evidence
    // ========================================
    {
      iterationNumber: 2,
      title: 'Coherence & Evidence',
      focus:
        'Strengthen the draft by checking progression, assessment evidence, workload, and student support.',
      isOptional: false,
      scaffoldingQuestions: [
        {
          id: 'q1',
          question:
            'Where does the current draft still feel misaligned with the intended learning outcomes or required curriculum purpose?',
          placeholder:
            'e.g., The assessment still emphasizes recall, but the outcome asks students to evaluate competing explanations...',
          templateSlot: 'ALIGNMENT_GAP',
          inputType: 'textarea',
        },
        {
          id: 'q2',
          question:
            'Where is the sequence too fast, too slow, repetitive, or missing a bridge between ideas or skills?',
          placeholder:
            'e.g., Students jump from introductory concepts to independent project work before practicing methods...',
          templateSlot: 'SEQUENCE_ISSUE',
          inputType: 'textarea',
        },
        {
          id: 'q3',
          question:
            'What learning evidence should be clearer across the curriculum: formative checks, assessments, artifacts, performances, reflections, or feedback moments?',
          placeholder:
            'e.g., Add short weekly evidence checks before the final portfolio; make feedback on the proposal explicit...',
          templateSlot: 'LEARNING_EVIDENCE',
          inputType: 'textarea',
        },
        {
          id: 'q4',
          question:
            'What workload, pacing, or implementation concern would make this draft difficult for students or instructors?',
          placeholder:
            'e.g., Week 6 contains too much reading and a major submission; staff cannot give detailed feedback twice...',
          templateSlot: 'WORKLOAD_CONCERN',
          inputType: 'textarea',
        },
        {
          id: 'q5',
          question:
            'What student support, accessibility, or equity gap remains?',
          placeholder:
            'e.g., Students need examples before using AI critique; provide alternatives for students without stable tool access...',
          templateSlot: 'SUPPORT_GAP',
          inputType: 'textarea',
        },
        {
          id: 'q6',
          question:
            'Which parts of the draft are worth keeping because they improve coherence, learning, or feasibility?',
          placeholder:
            'e.g., Keep the three milestone structure and the explicit AI verification activity...',
          templateSlot: 'KEEP_ELEMENTS',
          inputType: 'textarea',
        },
      ],
      promptTemplate: {
        templateText:
          'You are an experienced curriculum designer. Revise the most recent curriculum draft in this conversation. Treat that previous draft as the source to improve, while continuing to respect the uploaded original curriculum.\n\nI reviewed the draft and identified these issues:\n\nAlignment gap: [ALIGNMENT_GAP].\n\nSequencing issue: [SEQUENCE_ISSUE].\n\nLearning evidence that should be clearer: [LEARNING_EVIDENCE].\n\nWorkload, pacing, or implementation concern: [WORKLOAD_CONCERN].\n\nStudent support, accessibility, or equity gap: [SUPPORT_GAP].\n\nElements worth keeping: [KEEP_ELEMENTS].\n\nBefore revising, privately decide which curriculum components should be kept, condensed, moved, removed, or reframed. Check the learning progression from early exposure to guided practice to independent performance. Make sure assessment evidence is proportionate, meaningful, and feasible to collect.\n\nThen produce only the revised curriculum in clear markdown format.\n\nPlease include:\n- revised outcomes or capability statements only where needed\n- revised curriculum sequence or module map\n- explicit alignment between outcomes, activities, assessment evidence, and feedback moments\n- student support, accessibility, and equity adjustments\n- workload and pacing adjustments for students and instructors\n- how AI-related activities or policies fit the progression\n- a short revision rationale explaining how the changes improve coherence and evidence of learning',
        slots: [
          {
            id: 'ALIGNMENT_GAP',
            label: 'Alignment Gap',
            defaultText: 'remaining alignment gap',
          },
          {
            id: 'SEQUENCE_ISSUE',
            label: 'Sequence Issue',
            defaultText: 'sequencing issue',
          },
          {
            id: 'LEARNING_EVIDENCE',
            label: 'Learning Evidence',
            defaultText: 'learning evidence that should be clearer',
          },
          {
            id: 'WORKLOAD_CONCERN',
            label: 'Workload Concern',
            defaultText: 'workload, pacing, or implementation concern',
          },
          {
            id: 'SUPPORT_GAP',
            label: 'Support Gap',
            defaultText: 'student support, accessibility, or equity gap',
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
              'Can you trace at least one major outcome through instruction, practice, feedback, and assessment evidence?',
          },
          {
            id: 'er2',
            question:
              'What would students experience as the hardest transition in this curriculum, and does the revision now support that transition?',
          },
        ],
        checklist: [
          {
            id: 'c1',
            text: 'Major outcomes are traceable through activities and assessment evidence',
          },
          {
            id: 'c2',
            text: 'Sequence includes bridges between concepts, practice, and performance',
          },
          {
            id: 'c3',
            text: 'Feedback moments are placed before high-stakes assessment',
          },
          {
            id: 'c4',
            text: 'Workload is distributed realistically across the curriculum',
          },
          {
            id: 'c5',
            text: 'Support and accessibility adjustments are built into the design',
          },
          {
            id: 'c6',
            text: 'AI-related expectations are understandable and feasible',
          },
        ],
        failureModes: [
          {
            id: 'fm1',
            title: 'Alignment Theater',
            description:
              'Curriculum maps can claim alignment without changing what students actually do. Check whether each mapped activity produces evidence for the outcome it names.',
          },
          {
            id: 'fm2',
            title: 'Unfunded Support',
            description:
              'A draft may add feedback, coaching, or checkpoints that sound helpful but exceed available time or staffing. Make supports feasible within the stated constraints.',
          },
        ],
      },
    },

    // ========================================
    // ITERATION 3 - Implementation Package
    // ========================================
    {
      iterationNumber: 3,
      title: 'Implementation Package',
      focus:
        'Turn the revised curriculum into language, structures, and next steps that can actually be used.',
      isOptional: false,
      scaffoldingQuestions: [
        {
          id: 'q1',
          question:
            'What final format do you need: syllabus section, curriculum map, weekly plan, program proposal, instructor guide, LMS-ready outline, or another form?',
          placeholder:
            'e.g., A syllabus-ready weekly schedule plus instructor notes for the first delivery...',
          templateSlot: 'FINAL_FORMAT',
          inputType: 'textarea',
        },
        {
          id: 'q2',
          question:
            'What exact language should students, colleagues, or reviewers see about AI use, AI literacy, academic integrity, or tool access?',
          placeholder:
            'e.g., Students may use AI for feedback and planning with disclosure; no paid tools are required...',
          templateSlot: 'AI_POLICY_LANGUAGE',
          inputType: 'textarea',
        },
        {
          id: 'q3',
          question:
            'What implementation details must be explicit: calendar dates, contact hours, resources, readings, checkpoints, assessment weights, or staff roles?',
          placeholder:
            'e.g., 12 teaching weeks, proposal due week 4, feedback in week 5, final project 40 percent...',
          templateSlot: 'IMPLEMENTATION_DETAILS',
          inputType: 'textarea',
        },
        {
          id: 'q4',
          question:
            'What needs to align with institutional policy, accreditation requirements, departmental expectations, or existing program structures?',
          placeholder:
            'e.g., Must retain outcome 3.2, use department assessment categories, and fit the approved credit hours...',
          templateSlot: 'POLICY_ALIGNMENT',
          inputType: 'textarea',
        },
        {
          id: 'q5',
          question:
            'How will you evaluate whether the curriculum revision worked after implementation?',
          placeholder:
            'e.g., Compare portfolio quality, collect student workload feedback, review checkpoint completion, discuss in teaching team...',
          templateSlot: 'EVALUATION_PLAN',
          inputType: 'textarea',
        },
        {
          id: 'q6',
          question:
            'What should be simplified, clarified, or removed before this becomes the final version?',
          placeholder:
            'e.g., Simplify the AI disclosure instructions, reduce one reading week, clarify the milestone rubric...',
          templateSlot: 'FINAL_ADJUSTMENTS',
          inputType: 'textarea',
        },
        {
          id: 'q7',
          question:
            'What has typically worked well in your past teaching experiences that this final curriculum should preserve or build on?',
          placeholder:
            'e.g., Weekly low-stakes checkpoints, project milestones with short feedback cycles, examples before independent work...',
          templateSlot: 'PAST_TEACHING_SUCCESSES',
          inputType: 'textarea',
        },
      ],
      promptTemplate: {
        templateText:
          'Transform the revised curriculum in this conversation into a final implementation-ready curriculum package. Treat the latest revised curriculum as the source draft and continue to respect the uploaded original curriculum and stated constraints.\n\nFinal format needed: [FINAL_FORMAT].\n\nExact AI-use, AI literacy, academic integrity, or tool access language: [AI_POLICY_LANGUAGE].\n\nImplementation details to make explicit: [IMPLEMENTATION_DETAILS].\n\nPolicy, accreditation, department, or program alignment: [POLICY_ALIGNMENT].\n\nEvaluation plan after implementation: [EVALUATION_PLAN].\n\nFinal adjustments to simplify, clarify, or remove: [FINAL_ADJUSTMENTS].\n\nTeaching practices, curriculum structures, or student support routines that have typically worked well for me: [PAST_TEACHING_SUCCESSES].\n\nBefore producing the final version, privately remove redundant language, check feasibility, clarify AI-related expectations, ensure the curriculum remains aligned, inclusive, and implementable, and build on the past teaching successes where they support the stated outcomes and constraints.\n\nThen produce only the final curriculum package in clear markdown format.\n\nPlease include:\n- final curriculum title and brief overview\n- final outcomes or capability statements\n- final sequence, module map, weekly outline, or requested format\n- aligned learning activities, assessment evidence, and feedback moments\n- exact AI-use, AI literacy, academic integrity, or tool access language where relevant\n- student support and accessibility notes\n- instructor implementation notes and rollout checklist\n- policy, accreditation, or program-alignment notes\n- plan for evaluating the revision after delivery\n- a brief final rationale explaining how this version improves learning progression, coherence, and feasibility',
        slots: [
          {
            id: 'FINAL_FORMAT',
            label: 'Final Format',
            defaultText: 'final format needed',
          },
          {
            id: 'AI_POLICY_LANGUAGE',
            label: 'AI Policy Language',
            defaultText: 'AI-use or AI literacy language',
          },
          {
            id: 'IMPLEMENTATION_DETAILS',
            label: 'Implementation Details',
            defaultText: 'implementation details',
          },
          {
            id: 'POLICY_ALIGNMENT',
            label: 'Policy Alignment',
            defaultText: 'policy, accreditation, department, or program alignment',
          },
          {
            id: 'EVALUATION_PLAN',
            label: 'Evaluation Plan',
            defaultText: 'evaluation plan after implementation',
          },
          {
            id: 'FINAL_ADJUSTMENTS',
            label: 'Final Adjustments',
            defaultText: 'final adjustments',
          },
          {
            id: 'PAST_TEACHING_SUCCESSES',
            label: 'Past Teaching Successes',
            defaultText: 'teaching practices that have worked well before',
          },
        ],
      },
      evaluationTools: {
        reflectionQuestions: [
          {
            id: 'er1',
            question:
              'Could another instructor implement this curriculum from the final package without relying on hidden assumptions you have not written down?',
          },
          {
            id: 'er2',
            question:
              'What evidence will tell you that the revised curriculum improved student learning rather than only improving the document?',
          },
        ],
        checklist: [
          {
            id: 'c1',
            text: 'Final format matches the intended use',
          },
          {
            id: 'c2',
            text: 'Students can understand expectations, workload, and support',
          },
          {
            id: 'c3',
            text: 'AI policy or AI literacy language is concrete and equitable',
          },
          {
            id: 'c4',
            text: 'Implementation details are specific enough for rollout',
          },
          {
            id: 'c5',
            text: 'Policy, accreditation, or program requirements are addressed',
          },
          {
            id: 'c6',
            text: 'Evaluation plan focuses on evidence of student learning',
          },
        ],
        failureModes: [
          {
            id: 'fm1',
            title: 'Document-Ready, Not Teaching-Ready',
            description:
              'A polished curriculum package can still lack the timing, resources, staff roles, examples, and support needed for delivery. Check the rollout details before using it.',
          },
          {
            id: 'fm2',
            title: 'Policy Language Drift',
            description:
              'AI-use or integrity wording may sound reasonable while conflicting with institutional policy or assessment rules. Align final language with local requirements before launch.',
          },
        ],
      },
    },
  ],
};
