import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Assignment, AssignmentFormData, GenerationProgress, QuestionType } from '@/types';
import { assignmentApi } from '@/services/api';
import { v4 as uuidv4 } from 'uuid';

interface AssignmentState {
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  generationProgress: GenerationProgress | null;
  formData: AssignmentFormData;
  isLoading: boolean;
  isCreating: boolean;
  isGenerating: boolean;
  error: string | null;
  searchQuery: string;
  filterStatus: string;
  pagination: { page: number; limit: number; total: number; pages: number };

  fetchAssignments: (params?: { search?: string; status?: string; page?: number }) => Promise<void>;
  fetchAssignment: (id: string) => Promise<void>;
  createAssignment: (data: AssignmentFormData) => Promise<string | null>;
  deleteAssignment: (id: string) => Promise<void>;
  regenerateAssignment: (id: string) => Promise<void>;
  setCurrentAssignment: (assignment: Assignment | null) => void;
  setGenerationProgress: (progress: GenerationProgress | null) => void;
  updateAssignmentStatus: (id: string, status: Assignment['status'], paper?: Assignment['generatedPaper']) => void;
  updateFormData: (data: Partial<AssignmentFormData>) => void;
  addQuestionType: () => void;
  removeQuestionType: (id: string) => void;
  updateQuestionType: (id: string, field: keyof QuestionType, value: string | number) => void;
  resetForm: () => void;
  resetGenerationState: () => void;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: string) => void;
  setError: (error: string | null) => void;
}

const defaultQuestionTypes = (): QuestionType[] => [
  { id: uuidv4(), type: 'Multiple Choice Questions', count: 4, marks: 1 },
  { id: uuidv4(), type: 'Short Questions', count: 3, marks: 2 },
  { id: uuidv4(), type: 'Diagram/Graph-Based Questions', count: 5, marks: 5 },
  { id: uuidv4(), type: 'Numerical Problems', count: 5, marks: 5 },
];

const defaultFormData: AssignmentFormData = {
  title: '',
  subject: '',
  className: '',
  dueDate: '',
  questionTypes: defaultQuestionTypes(),
  additionalInstructions: '',
  file: null,
};

export const useAssignmentStore = create<AssignmentState>()(
  devtools(
    (set, get) => ({
      assignments: [],
      currentAssignment: null,
      generationProgress: null,
      formData: { ...defaultFormData },
      isLoading: false,
      isCreating: false,
      isGenerating: false,
      error: null,
      searchQuery: '',
      filterStatus: '',
      pagination: { page: 1, limit: 20, total: 0, pages: 0 },

      fetchAssignments: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const response = await assignmentApi.getAll({
            search: params?.search || get().searchQuery || undefined,
            status: params?.status || get().filterStatus || undefined,
            page: params?.page || 1,
          });
          if (response.success && response.data) {
            set({
              assignments: response.data,
              pagination: response.pagination || get().pagination,
            });
          }
        } catch (error: unknown) {
          set({ error: error instanceof Error ? error.message : 'Failed to load' });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchAssignment: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await assignmentApi.getById(id);
          if (response.success && response.data) {
            set({ currentAssignment: response.data });
          }
        } catch (error: unknown) {
          set({ error: error instanceof Error ? error.message : 'Failed to load' });
        } finally {
          set({ isLoading: false });
        }
      },

      createAssignment: async (data) => {
        set({ isCreating: true, error: null });
        try {
          const response = await assignmentApi.create(data);
          if (response.success && response.data) {
            set({ isGenerating: true });
            // Immediately add a pending assignment to the list so sidebar count updates
            const newAssignment = {
              _id: response.data.assignmentId,
              title: data.title,
              subject: data.subject,
              className: data.className,
              dueDate: data.dueDate,
              questionTypes: data.questionTypes,
              additionalInstructions: data.additionalInstructions || '',
              status: 'pending' as const,
              totalQuestions: data.questionTypes.reduce((s, q) => s + q.count, 0),
              totalMarks: data.questionTypes.reduce((s, q) => s + q.count * q.marks, 0),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            set((state) => ({
              assignments: [newAssignment as any, ...state.assignments],
            }));
            return response.data.assignmentId;
          }
          return null;
        } catch (error: unknown) {
          set({ error: error instanceof Error ? error.message : 'Failed to create' });
          return null;
        } finally {
          set({ isCreating: false });
        }
      },

      deleteAssignment: async (id) => {
        try {
          await assignmentApi.delete(id);
          set((state) => ({
            assignments: state.assignments.filter((a) => a._id !== id),
          }));
        } catch (error: unknown) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete' });
          throw error;
        }
      },

      regenerateAssignment: async (id) => {
        set({ isGenerating: true, error: null });
        try {
          await assignmentApi.regenerate(id);
          set((state) => ({
            assignments: state.assignments.map((a) =>
              a._id === id ? { ...a, status: 'pending' as const } : a
            ),
            currentAssignment:
              state.currentAssignment?._id === id
                ? { ...state.currentAssignment, status: 'pending' as const }
                : state.currentAssignment,
          }));
        } catch (error: unknown) {
          set({ error: error instanceof Error ? error.message : 'Failed', isGenerating: false });
          throw error;
        }
      },

      setCurrentAssignment: (assignment) => set({ currentAssignment: assignment }),
      setGenerationProgress: (progress) => {
        set({ generationProgress: progress });
        if (progress?.status === 'completed' || progress?.status === 'failed') {
          set({ isGenerating: false });
        }
      },
      updateAssignmentStatus: (id, status, paper) => {
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a._id === id ? { ...a, status, ...(paper ? { generatedPaper: paper } : {}) } : a
          ),
          currentAssignment:
            state.currentAssignment?._id === id
              ? { ...state.currentAssignment, status, ...(paper ? { generatedPaper: paper } : {}) }
              : state.currentAssignment,
          isGenerating: status === 'processing',
        }));
      },
      updateFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
      addQuestionType: () =>
        set((state) => ({
          formData: {
            ...state.formData,
            questionTypes: [
              ...state.formData.questionTypes,
              { id: uuidv4(), type: 'Short Questions', count: 3, marks: 2 },
            ],
          },
        })),
      removeQuestionType: (id) =>
        set((state) => ({
          formData: {
            ...state.formData,
            questionTypes: state.formData.questionTypes.filter((qt) => qt.id !== id),
          },
        })),
      updateQuestionType: (id, field, value) =>
        set((state) => ({
          formData: {
            ...state.formData,
            questionTypes: state.formData.questionTypes.map((qt) =>
              qt.id === id ? { ...qt, [field]: value } : qt
            ),
          },
        })),
      resetForm: () =>
        set({
          formData: {
            ...defaultFormData,
            questionTypes: defaultQuestionTypes(),
          },
        }),
      resetGenerationState: () =>
        set({
          generationProgress: null,
          isGenerating: false,
          isCreating: false,
          currentAssignment: null,
          error: null,
        }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilterStatus: (status) => set({ filterStatus: status }),
      setError: (error) => set({ error }),
    }),
    { name: 'assignment-store' }
  )
);
