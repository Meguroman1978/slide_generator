import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  UserSettings,
  UploadedFile,
  StorylineProposal,
  PresentationDraft,
  SlideDetail,
  ProcessingStep,
  AnalysisResult,
} from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/constants/fonts';

interface PresentationState {
  // User Settings
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;

  // Presentation Type
  presentationType: string;
  setPresentationType: (type: string) => void;

  // File Management
  uploadedFiles: UploadedFile[];
  addFile: (file: UploadedFile) => void;
  removeFile: (fileId: string) => void;
  clearFiles: () => void;

  // Analysis Results
  analysisResults: AnalysisResult[];
  setAnalysisResults: (results: AnalysisResult[]) => void;

  // Storyline Proposals
  storylineProposals: StorylineProposal[];
  setStorylineProposals: (proposals: StorylineProposal[]) => void;
  selectedStoryline: StorylineProposal | null;
  selectStoryline: (proposal: StorylineProposal) => void;

  // Draft & Slides
  draft: PresentationDraft | null;
  setDraft: (draft: PresentationDraft) => void;
  slides: SlideDetail[];
  setSlides: (slides: SlideDetail[]) => void;

  // Processing State
  processingSteps: ProcessingStep[];
  setProcessingSteps: (steps: ProcessingStep[]) => void;
  updateProcessingStep: (stepNumber: number, update: Partial<ProcessingStep>) => void;

  // Current Step
  currentStep: 'upload' | 'analyze' | 'storyline' | 'draft' | 'slides' | 'export';
  setCurrentStep: (step: PresentationState['currentStep']) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  settings: DEFAULT_SETTINGS,
  presentationType: '',
  uploadedFiles: [],
  analysisResults: [],
  storylineProposals: [],
  selectedStoryline: null,
  draft: null,
  slides: [],
  processingSteps: [],
  currentStep: 'upload' as const,
};

export const usePresentationStore = create<PresentationState>()(
  persist(
    (set) => ({
      ...initialState,

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      setPresentationType: (type) =>
        set({
          presentationType: type,
        }),

      addFile: (file) =>
        set((state) => ({
          uploadedFiles: [...state.uploadedFiles, file],
        })),

      removeFile: (fileId) =>
        set((state) => ({
          uploadedFiles: state.uploadedFiles.filter((f) => f.id !== fileId),
        })),

      clearFiles: () =>
        set({
          uploadedFiles: [],
          analysisResults: [],
        }),

      setAnalysisResults: (results) =>
        set({
          analysisResults: results,
        }),

      setStorylineProposals: (proposals) =>
        set({
          storylineProposals: proposals,
        }),

      selectStoryline: (proposal) =>
        set({
          selectedStoryline: proposal,
        }),

      setDraft: (draft) =>
        set({
          draft,
        }),

      setSlides: (slides) =>
        set({
          slides,
        }),

      setProcessingSteps: (steps) =>
        set({
          processingSteps: steps,
        }),

      updateProcessingStep: (stepNumber, update) =>
        set((state) => ({
          processingSteps: state.processingSteps.map((step) =>
            step.step === stepNumber ? { ...step, ...update } : step
          ),
        })),

      setCurrentStep: (step) =>
        set({
          currentStep: step,
        }),

      reset: () =>
        set(initialState),
    }),
    {
      name: 'presentation-storage',
      partialize: (state) => ({
        settings: state.settings,
      }),
    }
  )
);
