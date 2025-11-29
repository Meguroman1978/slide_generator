'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { FileText } from 'lucide-react';

interface PresentationTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const PRESENTATION_TYPES = [
  { value: 'sales', label: '営業資料' },
  { value: 'analysis', label: '分析資料' },
  { value: 'training', label: '研修資料' },
  { value: 'concept', label: '概念説明資料' },
  { value: 'proposal', label: '企画書・提案書' },
  { value: 'report', label: '報告書' },
  { value: 'minutes', label: '議事録・記録' },
  { value: 'manual', label: 'マニュアル・手順書' },
  { value: 'notice', label: '案内・通知資料' },
  { value: 'custom', label: 'カスタム（自由入力）' },
];

export default function PresentationTypeSelector({ value, onChange }: PresentationTypeSelectorProps) {
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const handleSelectChange = (newValue: string) => {
    if (newValue === 'custom') {
      setIsCustom(true);
      onChange(customValue);
    } else {
      setIsCustom(false);
      onChange(newValue);
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCustomValue(newValue);
    onChange(newValue);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          作成する資料のタイプ
        </CardTitle>
        <CardDescription>
          作成する資料のタイプを選択してください。ストーリーラインの提案に活用されます。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="presentation-type">資料タイプ</Label>
          <Select value={isCustom ? 'custom' : value} onValueChange={handleSelectChange}>
            <SelectTrigger id="presentation-type">
              <SelectValue placeholder="資料タイプを選択" />
            </SelectTrigger>
            <SelectContent>
              {PRESENTATION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isCustom && (
          <div className="space-y-2">
            <Label htmlFor="custom-type">カスタムタイプ</Label>
            <Input
              id="custom-type"
              placeholder="例: 製品紹介資料、技術仕様書など"
              value={customValue}
              onChange={handleCustomInputChange}
            />
          </div>
        )}

        {!isCustom && value && (
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium mb-1">選択した資料タイプ:</p>
            <p className="text-muted-foreground">
              {PRESENTATION_TYPES.find((t) => t.value === value)?.label || value}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
