export interface QuestionType {
  id: string;
  type: string;
  count: number;
  marks: number;
}

export interface Question {
  id: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  type: string;
  answerKey?: string;
}

export interface Section {
  id: string;
  title: string;
  instruction: string;
  questionType: string;
  questions: Question[];
  totalMarks: number;
}

export interface GeneratedPaper {
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maximumMarks: number;
  sections: Section[];
  answerKey: { questionId: string; answer: string }[];
  generatedAt: string;
}

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  questionTypes: QuestionType[];
  additionalInstructions: string;
  fileUrl?: string;
  fileName?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  jobId?: string;
  generatedPaper?: GeneratedPaper;
  errorMessage?: string;
  totalQuestions: number;
  totalMarks: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentFormData {
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  questionTypes: QuestionType[];
  additionalInstructions: string;
  file?: File | null;
}

export interface GenerationProgress {
  assignmentId: string;
  progress: number;
  message: string;
  status: 'processing' | 'completed' | 'failed';
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const QUESTION_TYPE_OPTIONS = [
  'Multiple Choice Questions',
  'Short Questions',
  'Long Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'Fill in the Blanks',
  'True/False Questions',
  'Match the Following',
  'Essay Questions',
  'Case Study Questions',
] as const;

export const DIFFICULTY_COLORS = {
  easy: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
    label: 'Easy',
  },
  medium: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
    label: 'Moderate',
  },
  hard: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
    label: 'Hard',
  },
} as const;
