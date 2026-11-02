import type { LabConfig } from '@/lib/types';
import { outputLanguageQuestion, outputLanguageSlot } from './output-language';

export const activityPlanningLab: LabConfig = {
  meta: {
    id: 'activity-planning',
    title: 'Plan a Class Activity',
    description:
      'Design a learning activity or lesson segment for a specific topic, audience, and learning objective using AI as a collaborative tool.',
    estimatedTime: '20-30 min',
    learningOutcome:
      "You'll learn to formulate effective prompts, evaluate AI outputs, and recognize generic vs. context-specific suggestions.",
    coreSkill:
      'Prompt formulation, output evaluation, recognizing generic vs. context-specific outputs',
    icon: 'activity',
  },
  iterations: [
    // ========================================
    // ITERATION 1 — Intent & Context
    // ========================================
    {
      iterationNumber: 1,
      title: 'Intent & Context',
      focus: 'Articulate your pedagogical goal, context, and constraints.',
      isOptional: false,
      scaffoldingQuestions: [
        {
          id: 'q1',
          question:
            'What subject or discipline do you teach?',
          placeholder:
            'e.g., Biology, World History, Introduction to Psychology...',
          templateSlot: 'ROLE_SUBJECT',
          inputType: 'text',
        },
        {
          id: 'q2',
          question:
            'What specific topic or concept should this activity help students understand?',
          placeholder:
            'e.g., Photosynthesis, The French Revolution, Linear Algebra...',
          templateSlot: 'TOPIC',
          inputType: 'textarea',
        },
        {
          id: 'q3',
          question:
            'What should students be able to do after completing this activity that they couldn\'t do before?',
          placeholder:
            'e.g., Explain the process of cellular respiration, Compare two historical perspectives...',
          templateSlot: 'LEARNING_OBJECTIVE',
          inputType: 'textarea',
        },
        {
          id: 'q4',
          question:
            'Who are your students? Consider their level, prior knowledge, and what typically challenges them with this material.',
          placeholder:
            'e.g., Second-year undergraduates with basic chemistry knowledge who struggle with...',
          templateSlot: 'STUDENT_CONTEXT',
          inputType: 'textarea',
        },
        {
          id: 'q5',
          question:
            'How much time do you have for this activity, and what constraints should the design respect (class size, available resources, physical space)?',
          placeholder:
            'e.g., 50-minute lecture, 30 students, standard classroom with projector...',
          templateSlot: 'TIME_CONSTRAINT',
          inputType: 'textarea',
        },
        {
          id: 'q6',
          question:
            'What should student engagement look like during the activity — individual thinking, collaborative work, hands-on practice, discussion, or something else?',
          placeholder:
            'e.g., Students first make an individual prediction, then compare reasoning in small groups before a whole-class debrief...',
          templateSlot: 'ENGAGEMENT_TYPE',
          inputType: 'textarea',
        },
        outputLanguageQuestion,
      ],
      promptTemplate: {
        templateText:
          'You are an experienced educational consultant specializing in pedagogical design and instructional methods. Your task is to create a well-structured, pedagogically sound classroom activity tailored to a specific educational context.\n\nI am a [ROLE_SUBJECT] educator. I need a class activity about [TOPIC] that helps students achieve this learning objective: [LEARNING_OBJECTIVE].\n\nAbout my students: [STUDENT_CONTEXT].\n\nThe activity must fit within these constraints: [TIME_CONSTRAINT]. I want student engagement to look like this: [ENGAGEMENT_TYPE].\n\nUse the educator\'s inputs as design requirements, not generic background. Before drafting, privately check what students need to know, understand, or be able to do; identify the Bloom\'s taxonomy level implied by the objective; note whether the learning is mainly factual, conceptual, procedural, or metacognitive; and choose an activity structure that fits the student context, constraints, and desired engagement.\n\nThen produce only the classroom activity plan in clear markdown format. The plan should be concrete enough that I could implement it without asking follow-up questions.\n\nPlease include:\n- a concise activity title\n- the learning objective and why the activity directly supports it\n- a brief activity overview\n- materials and setup needed\n- step-by-step teacher and student instructions with timing for each stage\n- topic-specific prompts, examples, or tasks students will work with\n- scaffolding for likely student difficulties\n- a check for understanding or formative assessment\n- a brief note on how the activity fits the stated students, constraints, and engagement goals\n\nAlways respond in [LANGUAGE] language unless explicitly instructed otherwise.',
        slots: [
          {
            id: 'ROLE_SUBJECT',
            label: 'Subject/Discipline',
            defaultText: 'your subject or discipline',
          },
          { id: 'TOPIC', label: 'Topic', defaultText: 'the topic' },
          {
            id: 'LEARNING_OBJECTIVE',
            label: 'Learning Objective',
            defaultText: 'the learning objective',
          },
          {
            id: 'STUDENT_CONTEXT',
            label: 'Student Context',
            defaultText: 'student context and challenges',
          },
          {
            id: 'TIME_CONSTRAINT',
            label: 'Constraints',
            defaultText: 'time and constraints',
          },
          {
            id: 'ENGAGEMENT_TYPE',
            label: 'Engagement Type',
            defaultText: 'type of engagement',
          },
          outputLanguageSlot,
        ],
      },
      evaluationTools: {
        reflectionQuestions: [
          {
            id: 'er1',
            question:
              'Does this activity actually require students to demonstrate the learning objective you specified, or could they complete it without achieving it?',
          },
          {
            id: 'er2',
            question:
              'Would this activity work differently than what you currently do — and is that difference an improvement?',
          },
        ],
        checklist: [
          { id: 'c1', text: 'Aligns with stated learning objective' },
          { id: 'c2', text: 'Appropriate for specified student level' },
          { id: 'c3', text: 'Respects time and resource constraints' },
          { id: 'c4', text: 'Instructions are specific enough to implement' },
          {
            id: 'c5',
            text: 'Includes some form of assessment or check for understanding',
          },
        ],
        failureModes: [
          {
            id: 'fm1',
            title: 'Generic Activities',
            description:
              'Watch for generic activities. AI often suggests activities that sound engaging but could apply to any topic. Ask yourself: Is this activity specific to your topic, or is it a template with your topic name dropped in?',
          },
        ],
      },
    },

    // ========================================
    // ITERATION 2 — Critical Refinement
    // ========================================
    {
      iterationNumber: 2,
      title: 'Critical Refinement',
      focus: 'Probe the AI output for problems, assumptions, and gaps.',
      isOptional: false,
      scaffoldingQuestions: [
        {
          id: 'q1',
          question:
            'What did the AI assume about your students or context that wasn\'t accurate?',
          placeholder:
            'e.g., It assumed students already know X, but they actually struggle with...',
          templateSlot: 'INACCURATE_ASSUMPTIONS',
          inputType: 'textarea',
        },
        {
          id: 'q2',
          question:
            'If a student who struggles with this topic attempted this activity, where would they get stuck? Does the activity account for that?',
          placeholder:
            'e.g., The transition between steps 2 and 3 requires a conceptual leap that...',
          templateSlot: 'STRUGGLE_POINTS',
          inputType: 'textarea',
        },
        {
          id: 'q3',
          question:
            'Is the activity genuinely engaging, or does it just sound engaging? What would students actually experience moment-to-moment?',
          placeholder:
            'e.g., The group discussion might fall flat because students don\'t have enough context to...',
          templateSlot: 'ENGAGEMENT_REALITY',
          inputType: 'textarea',
        },
        {
          id: 'q4',
          question:
            'What\'s missing from this output that only you would know about your specific teaching context?',
          placeholder:
            'e.g., My students respond better to visual examples, and the classroom has limited...',
          templateSlot: 'MISSING_CONTEXT',
          inputType: 'textarea',
        },
        {
          id: 'q5',
          question:
            'Which parts of the current activity are worth keeping because they support the objective or fit your students?',
          placeholder:
            'e.g., Keep the initial prediction task and the final debrief, but revise the group analysis task...',
          templateSlot: 'KEEP_ELEMENTS',
          inputType: 'textarea',
        },
      ],
      promptTemplate: {
        templateText:
          'You are an experienced educational consultant specializing in pedagogical design, instructional improvement, and the critical evaluation of AI-generated teaching materials. Your task is to revise the most recent classroom activity plan in this conversation. Treat that previous plan as the draft to improve, not as a prompt to start over from scratch.\n\nI have reviewed the draft and identified several issues that need to be addressed.\n\nWhat the AI assumed incorrectly about my students or teaching context: [INACCURATE_ASSUMPTIONS].\n\nWhere students who struggle with this topic would likely get stuck: [STRUGGLE_POINTS].\n\nMy honest assessment of the activity\'s engagement in practice: [ENGAGEMENT_REALITY].\n\nImportant context missing from the original output: [MISSING_CONTEXT].\n\nParts of the current activity that are worth keeping: [KEEP_ELEMENTS].\n\nBefore revising, privately diagnose how each issue should change the design. Identify which assumptions need correction, what scaffolds students need at the likely struggle points, what students should actually be doing or producing moment to moment, and how the missing context should affect instructions, pacing, grouping, materials, transitions, and assessment.\n\nThen redesign the activity. Preserve the elements worth keeping, but revise anything inaccurate, generic, poorly scaffolded, unrealistic, or insufficiently connected to the learning objective. The revised version should visibly respond to every issue above and should be realistic for the actual teaching situation.\n\nYour final output should consist only of the revised activity plan in clear markdown format with section headers. The activity plan should be concrete enough that I could implement it directly.\n\nPlease include:\n- a brief activity overview\n- the revised learning objective alignment\n- step-by-step teacher and student instructions\n- explicit scaffolding for struggling students\n- materials and setup needed\n- timing and transition logistics for each stage\n- a check for understanding or formative assessment\n- a brief revision rationale explaining how the changes better fit my students and context',
        slots: [
          {
            id: 'INACCURATE_ASSUMPTIONS',
            label: 'Inaccurate Assumptions',
            defaultText: 'what the AI assumed incorrectly',
          },
          {
            id: 'STRUGGLE_POINTS',
            label: 'Struggle Points',
            defaultText: 'where students would get stuck',
          },
          {
            id: 'ENGAGEMENT_REALITY',
            label: 'Engagement Reality',
            defaultText: 'honest assessment of engagement',
          },
          {
            id: 'MISSING_CONTEXT',
            label: 'Missing Context',
            defaultText: 'what was missing from the output',
          },
          {
            id: 'KEEP_ELEMENTS',
            label: 'Elements to Keep',
            defaultText: 'what should be preserved from the current activity',
          },
        ],
      },
      evaluationTools: {
        reflectionQuestions: [
          {
            id: 'er1',
            question:
              'Did the substance of the activity actually change, or just the framing? Compare carefully with the first version.',
          },
          {
            id: 'er2',
            question:
              'Are the new scaffolding elements genuinely helpful, or are they generic additions that don\'t address the specific struggle points you identified?',
          },
        ],
        checklist: [
          { id: 'c1', text: 'Aligns with stated learning objective' },
          { id: 'c2', text: 'Appropriate for specified student level' },
          { id: 'c3', text: 'Respects time and resource constraints' },
          { id: 'c4', text: 'Instructions are specific enough to implement' },
          {
            id: 'c5',
            text: 'Includes some form of assessment or check for understanding',
          },
          {
            id: 'c6',
            text: 'Addresses differentiation for struggling students',
          },
          {
            id: 'c7',
            text: 'Accounts for common student misconceptions',
          },
          {
            id: 'c8',
            text: 'Transition logistics between activity stages are clear',
          },
        ],
        failureModes: [
          {
            id: 'fm1',
            title: 'Sycophantic Agreement',
            description:
              'AI tends toward sycophancy — it may agree with your refinements without meaningfully changing the output. Compare carefully: did the substance actually change, or just the framing?',
          },
        ],
      },
    },

    // ========================================
    // ITERATION 3 (Optional) — Ownership
    // ========================================
    {
      iterationNumber: 3,
      title: 'Ownership',
      focus: 'Transition from AI output to usable classroom material.',
      isOptional: true,
      scaffoldingQuestions: [
        {
          id: 'q1',
          question:
            'What would you change about this activity before actually using it in your classroom tomorrow?',
          placeholder:
            'e.g., I would simplify the instructions, add a warm-up question, change the group size...',
          templateSlot: 'CHANGES_NEEDED',
          inputType: 'textarea',
        },
        {
          id: 'q2',
          question:
            'What elements of this activity reflect your teaching style and values, and what feels like generic AI output?',
          placeholder:
            'e.g., The discussion prompts feel authentic, but the assessment rubric feels generic...',
          templateSlot: 'STYLE_ASSESSMENT',
          inputType: 'textarea',
        },
        {
          id: 'q3',
          question:
            'What is this activity\'s core purpose — how would you explain it to a colleague, and what in the current draft still distracts from that purpose?',
          placeholder:
            'e.g., Its purpose is to help students distinguish correlation from causation through hands-on data analysis; the extra debate step distracts from that...',
          templateSlot: 'PURPOSE_EXPLANATION',
          inputType: 'textarea',
        },
        {
          id: 'q4',
          question:
            'What has typically worked well in your past teaching experiences that this final activity should preserve or build on?',
          placeholder:
            'e.g., Short individual predictions before discussion, concrete examples from student interests, visible worked examples...',
          templateSlot: 'PAST_TEACHING_SUCCESSES',
          inputType: 'textarea',
        },
      ],
      promptTemplate: {
        templateText:
          'Your task is to transform the revised classroom activity in this conversation into a final version that reflects the instructor\'s professional judgment, teaching style, and practical classroom needs. Treat the latest revised activity as the source draft.\n\nI have reviewed the current version of the activity and want to make final adjustments before using it in my teaching.\n\nWhat I would still change before using it in class: [CHANGES_NEEDED].\n\nWhat feels authentic to my teaching style and what still feels generic or AI-generated: [STYLE_ASSESSMENT].\n\nThe single most important purpose of this activity is: [PURPOSE_EXPLANATION].\n\nTeaching practices, routines, or activity features that have typically worked well for me: [PAST_TEACHING_SUCCESSES].\n\nBefore producing the final version, privately sort the requested changes into clarity, pedagogy, classroom logistics, and teaching voice. Use the stated core purpose as the main design filter: every component should support that purpose, and anything distracting or overly elaborate should be removed or simplified. Build on the reported past teaching successes when choosing facilitation moves, examples, pacing, interaction patterns, and teacher notes.\n\nThen produce a final polished version of the activity that is ready for immediate classroom use or sharing with a colleague. Preserve the pedagogical strength of the revised draft, but make the instructions, transitions, teacher language, and facilitation notes feel realistic and instructor-owned rather than AI-generated.\n\nYour final output should consist only of the finished activity plan in clear markdown format with section headers.\n\nPlease include:\n- a concise activity title\n- a short statement of the activity\'s core purpose\n- final step-by-step implementation instructions\n- student-facing prompts or directions where useful\n- materials and setup needed\n- timing and logistics\n- final teacher notes or facilitation tips\n- a brief explanation of why this version is especially well suited to my classroom and teaching approach',
        slots: [
          {
            id: 'CHANGES_NEEDED',
            label: 'Changes Needed',
            defaultText: 'specific changes for classroom use',
          },
          {
            id: 'STYLE_ASSESSMENT',
            label: 'Style Assessment',
            defaultText: 'what feels generic vs. authentic',
          },
          {
            id: 'PURPOSE_EXPLANATION',
            label: 'Purpose Explanation',
            defaultText: 'how you would explain this activity',
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
              'Could you use this activity as-is tomorrow, or does it still need your personal touch?',
          },
          {
            id: 'er2',
            question:
              'What did you learn about working with AI through this process that you\'ll apply next time?',
          },
        ],
        checklist: [
          {
            id: 'c1',
            text: 'Activity is ready to use in your specific classroom',
          },
          {
            id: 'c2',
            text: 'Reflects your teaching style and values',
          },
          {
            id: 'c3',
            text: 'All instructions are clear enough for another instructor to follow',
          },
          {
            id: 'c4',
            text: 'You could explain the pedagogical rationale to a colleague',
          },
        ],
        failureModes: [
          {
            id: 'fm1',
            title: 'AI as Finished Product',
            description:
              'Remember: AI output is a starting point, not a finished product. The most effective educators treat AI-generated content as raw material that requires their professional judgment to shape into something that truly serves their students.',
          },
        ],
      },
    },
  ],
};
