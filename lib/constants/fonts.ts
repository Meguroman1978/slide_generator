import { FontFamily } from '@/types';

export const FONT_OPTIONS: { value: FontFamily; label: string }[] = [
  { value: 'メイリオ', label: 'メイリオ（推奨）' },
  { value: '游ゴシック', label: '游ゴシック' },
  { value: 'MS ゴシック', label: 'MS ゴシック' },
  { value: 'BIZ UDPゴシック', label: 'BIZ UDPゴシック' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS（カジュアルのみ）' },
];

export const ANIMATION_OPTIONS = [
  { value: 'none', label: 'なし' },
  { value: 'minimal', label: '必要最低限' },
  { value: 'moderate', label: 'ほどほどに使う' },
  { value: 'heavy', label: '多用する' },
];

export const TONE_OPTIONS = [
  { value: 'standard', label: 'スタンダード（ビジネスライク）' },
  { value: 'casual', label: 'カジュアル（親しみやすい）' },
];

export const DEFAULT_SETTINGS = {
  fontFamily: 'メイリオ' as FontFamily,
  animationLevel: 'none' as const,
  toneStyle: 'standard' as const,
  audienceType: 'external' as const,
  templateUrl: 'https://docs.google.com/presentation/d/1p826KUscu_89-uu7-ILYdxD21EpJbhcSTUhGX3WrI5Q/edit',
  googleAppsScriptUrl: 'https://script.google.com/macros/s/AKfycbwtVoGswlpuwW_A9rMyB_N5lOeaOJHk1DT1I2zxsDjtk1DsJv2B8RGGwUF58uwXrpfz_Q/exec',
};
