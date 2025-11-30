'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Layers } from 'lucide-react';

interface SlideCountSelectorProps {
  slideCount: number;
  onSlideCountChange: (value: number) => void;
}

export function SlideCountSelector({
  slideCount,
  onSlideCountChange,
}: SlideCountSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 10;
    // 5枚から50枚の範囲に制限
    const clampedValue = Math.max(5, Math.min(50, value));
    onSlideCountChange(clampedValue);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          スライド枚数
        </CardTitle>
        <CardDescription>
          生成するスライドの枚数を指定してください（5〜50枚）
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="slide-count">スライド枚数</Label>
          <Input
            id="slide-count"
            type="number"
            min="5"
            max="50"
            value={slideCount}
            onChange={handleChange}
            placeholder="例: 15"
          />
          <p className="text-xs text-muted-foreground">
            推奨: 10〜20枚程度。内容の複雑さに応じて調整してください。
          </p>
        </div>

        <div className="rounded-lg bg-muted p-3 text-sm">
          <p className="font-medium mb-1">選択内容:</p>
          <p className="text-muted-foreground">
            <span className="font-medium text-primary">{slideCount}枚</span> のスライドを生成します
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            ※ カバースライド、アジェンダ、まとめスライドを含む合計枚数です
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
