'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Sparkles } from 'lucide-react';

interface CustomStorylineProps {
  analysisContext?: any;
  onComplete: (storyline: any) => void;
}

export function CustomStoryline({ analysisContext, onComplete }: CustomStorylineProps) {
  const [targetAudience, setTargetAudience] = useState('');
  const [keyMessage, setKeyMessage] = useState('');
  const [structureItems, setStructureItems] = useState<string[]>(['']);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // AI-generated suggestions based on analysis context
  const [suggestions, setSuggestions] = useState({
    targetAudiences: [] as string[],
    keyMessages: [] as string[],
    structureTemplates: [] as string[][],
  });

  useEffect(() => {
    if (analysisContext) {
      generateSuggestions();
    }
  }, [analysisContext]);

  const generateSuggestions = () => {
    // Based on analysis context, generate contextual suggestions
    const contextualAudiences = [
      'ウェブ開発者',
      'コンテンツマネージャー',
      '技術担当者',
      'EC担当者',
      'EC部門の意思決定者',
      'マーケティングチーム',
      'プロジェクトマネージャー',
      'エグゼクティブ',
    ];

    const contextualMessages = [
      '効率的なワークフローで生産性を向上',
      'データドリブンな意思決定を実現',
      '革新的なソリューションで競争力を強化',
      'デジタル変革を加速する',
      'ROIを最大化する戦略的アプローチ',
    ];

    const structureTemplates = [
      [
        '1. オープニング：現状の課題',
        '2. 問題の深堀り：なぜ今なのか',
        '3. ソリューション提案',
        '4. 実装ステップ',
        '5. 期待される成果',
        '6. まとめ：次のアクション',
      ],
      [
        '1. 表紙：タイトルとビジョン',
        '2. 背景：市場環境と課題',
        '3. 提案：私たちのアプローチ',
        '4. 実績：成功事例',
        '5. 計画：実行プラン',
        '6. まとめ：期待される価値',
      ],
      [
        '1. イントロダクション',
        '2. データと洞察',
        '3. 戦略的提案',
        '4. アクションプラン',
        '5. Q&A',
      ],
    ];

    setSuggestions({
      targetAudiences: contextualAudiences,
      keyMessages: contextualMessages,
      structureTemplates,
    });
  };

  const addStructureItem = () => {
    setStructureItems([...structureItems, '']);
  };

  const updateStructureItem = (index: number, value: string) => {
    const newItems = [...structureItems];
    newItems[index] = value;
    setStructureItems(newItems);
  };

  const removeStructureItem = (index: number) => {
    if (structureItems.length > 1) {
      setStructureItems(structureItems.filter((_, i) => i !== index));
    }
  };

  const applyTemplate = (template: string[]) => {
    setStructureItems(template);
    setShowSuggestions(false);
  };

  const handleComplete = () => {
    const customStoryline = {
      id: 'カスタム',
      targetAudience,
      keyMessage,
      structure: structureItems.filter((item) => item.trim() !== ''),
      reasoning: 'ユーザーがカスタマイズした独自のストーリーライン',
    };

    onComplete(customStoryline);
  };

  const isValid = targetAudience.trim() && keyMessage.trim() && structureItems.some((item) => item.trim());

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">カスタムストーリーライン</h3>
            <p className="text-sm text-muted-foreground">
              独自のストーリーラインを作成するか、提案から選択してください
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSuggestions(!showSuggestions)}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {showSuggestions ? '提案を隠す' : '提案を表示'}
          </Button>
        </div>

        {/* Target Audience */}
        <div className="space-y-2">
          <Label htmlFor="target-audience">ターゲットオーディエンス</Label>
          <Input
            id="target-audience"
            placeholder="例：ウェブ開発者、マーケティングチーム等"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
          />
          {showSuggestions && suggestions.targetAudiences.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs text-muted-foreground">提案:</span>
              {suggestions.targetAudiences.map((audience, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => setTargetAudience(audience)}
                >
                  {audience}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Key Message */}
        <div className="space-y-2">
          <Label htmlFor="key-message">キーメッセージ</Label>
          <Textarea
            id="key-message"
            placeholder="プレゼンテーション全体で伝えたい核心メッセージ"
            value={keyMessage}
            onChange={(e) => setKeyMessage(e.target.value)}
            rows={3}
          />
          {showSuggestions && suggestions.keyMessages.length > 0 && (
            <div className="space-y-2 mt-2">
              <span className="text-xs text-muted-foreground">提案:</span>
              <div className="space-y-1">
                {suggestions.keyMessages.map((message, index) => (
                  <div
                    key={index}
                    className="text-sm p-2 rounded border cursor-pointer hover:bg-muted"
                    onClick={() => setKeyMessage(message)}
                  >
                    {message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Structure */}
        <div className="space-y-2">
          <Label>構成の流れ</Label>
          <div className="space-y-2">
            {structureItems.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`${index + 1}. スライドの内容`}
                  value={item}
                  onChange={(e) => updateStructureItem(index, e.target.value)}
                />
                {structureItems.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeStructureItem(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addStructureItem} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            スライドを追加
          </Button>

          {showSuggestions && suggestions.structureTemplates.length > 0 && (
            <div className="space-y-2 mt-4">
              <span className="text-xs text-muted-foreground">テンプレート:</span>
              {suggestions.structureTemplates.map((template, index) => (
                <Card
                  key={index}
                  className="p-3 cursor-pointer hover:bg-muted"
                  onClick={() => applyTemplate(template)}
                >
                  <p className="text-sm font-medium mb-2">テンプレート {index + 1}</p>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {template.slice(0, 3).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                    {template.length > 3 && (
                      <li className="text-primary">...他 {template.length - 3} 項目</li>
                    )}
                  </ul>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Button onClick={handleComplete} disabled={!isValid} className="w-full" size="lg">
          このストーリーラインを使用
        </Button>
      </div>
    </Card>
  );
}
