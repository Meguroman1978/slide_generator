export const PRESENTATION_TYPES = [
  {
    value: 'sales',
    label: '営業資料',
    description: '製品やサービスの販売促進、顧客への提案を目的とした資料',
    icon: '💼',
  },
  {
    value: 'analysis',
    label: '分析資料',
    description: 'データや現状を分析し、課題の特定や意思決定の根拠を示す資料',
    icon: '📊',
  },
  {
    value: 'training',
    label: '研修資料',
    description: '従業員や参加者への知識やスキルの伝達、教育を目的とした資料',
    icon: '📚',
  },
  {
    value: 'concept',
    label: '概念説明資料',
    description: '新しいアイデア、フレームワーク、専門用語などを分かりやすく解説するための資料',
    icon: '💡',
  },
  {
    value: 'proposal',
    label: '企画書・提案書',
    description: '新しいプロジェクトや戦略を提案し、承認を得ることを目的とした資料',
    icon: '📝',
  },
  {
    value: 'report',
    label: '報告書',
    description: '業務の進捗状況、結果、特定の出来事に関する事実などを関係者に伝えるための資料',
    icon: '📋',
  },
  {
    value: 'minutes',
    label: '議事録・記録',
    description: '会議や打ち合わせの内容、決定事項、タスクなどを正確に記録し、共有するための資料',
    icon: '📄',
  },
  {
    value: 'manual',
    label: 'マニュアル・手順書',
    description: '特定の業務や操作の手順を標準化し、実行者が迷わずに行えるようにするための資料',
    icon: '📖',
  },
  {
    value: 'announcement',
    label: '案内・通知資料',
    description: 'イベントの告知、変更の連絡、指示などを広く知らせるための資料',
    icon: '📢',
  },
  {
    value: 'custom',
    label: 'カスタム',
    description: '独自のタイプを指定',
    icon: '✨',
  },
] as const;

export type PresentationType = typeof PRESENTATION_TYPES[number]['value'];
