import type { ScaffoldingQuestion, TemplateSlot } from '@/lib/types';

export const outputLanguageQuestion: ScaffoldingQuestion = {
  id: 'outputLanguage',
  question: 'What language should the AI use for its response?',
  templateSlot: 'LANGUAGE',
  inputType: 'select',
  defaultValue: 'English',
  options: [
    { value: 'English', label: 'English' },
    { value: 'Croatian', label: 'Croatian' },
    { value: 'German', label: 'German' },
    { value: 'Finnish', label: 'Finnish' },
  ],
};

export const outputLanguageSlot: TemplateSlot = {
  id: 'LANGUAGE',
  label: 'Output Language',
  defaultText: 'English',
};
