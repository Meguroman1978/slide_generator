// Core types for the presentation generator

export type FontFamily = 
  | 'メイリオ'
  | '游ゴシック'
  | 'MS ゴシック'
  | 'BIZ UDPゴシック'
  | 'Arial'
  | 'Helvetica'
  | 'Times New Roman'
  | 'Verdana'
  | 'Georgia'
  | 'Comic Sans MS';

export type AnimationLevel = 'none' | 'minimal' | 'moderate' | 'heavy';

export type ToneStyle = 'standard' | 'casual';

export type AudienceType = 'external' | 'internal';

export type FileType = 'pdf' | 'excel' | 'word' | 'text' | 'audio' | 'image' | 'video' | 'url';

export interface UserSettings {
  fontFamily: FontFamily;
  animationLevel: AnimationLevel;
  toneStyle: ToneStyle;
  audienceType?: AudienceType;
  companyName?: string;
  templateUrl?: string;
  googleAiStudioApiKey?: string;
  openaiApiKey?: string;
  googleAppsScriptUrl?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: FileType;
  size: number;
  url: string;
  content?: string;
  metadata?: Record<string, any>;
}

export interface StorylineProposal {
  id: string;
  targetAudience: string;
  keyMessage: string;
  structure: string[];
  reasoning: string;
}

export interface SlideDraft {
  slideNumber: number;
  title: string;
  keyMessage: string;
  estimatedContent: string;
}

export interface PresentationDraft {
  title: string;
  theme: string;
  totalSlides: number;
  tableOfContents: string[];
  slides: SlideDraft[];
}

export interface LayoutElement {
  type: 'text' | 'image' | 'chart' | 'icon' | 'shape';
  position: { x: number; y: number; width: number; height: number };
  content: string;
  style?: Record<string, any>;
}

export interface SlideDetail {
  slideNumber: number;
  templateType: 'cover' | 'content' | 'section' | 'conclusion';
  title: string;
  keyMessage: string;
  layout: LayoutElement[];
  speakerNotes: string;
  animations?: AnimationInstruction[];
  visualPrompts?: string[];
}

export interface AnimationInstruction {
  elementId: string;
  type: 'appear' | 'emphasis' | 'exit' | 'transition';
  timing: 'onLoad' | 'onClick' | 'afterPrevious';
  duration: number;
}

export interface GeneratedPresentation {
  metadata: {
    title: string;
    createdAt: string;
    settings: UserSettings;
  };
  storyline: StorylineProposal;
  draft: PresentationDraft;
  slides: SlideDetail[];
}

export interface AnalysisResult {
  fileId: string;
  summary: string;
  keyPoints: string[];
  emotionalTone: string;
  suggestedVisuals: string[];
  extractedData?: any;
}

export interface ProcessingStep {
  step: number;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message?: string;
}
