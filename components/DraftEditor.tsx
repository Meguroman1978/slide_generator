'use client';

import { useState } from 'react';
import { PresentationDraft, SlideDraft } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, MoveUp, MoveDown, Plus, Save } from 'lucide-react';

interface DraftEditorProps {
  draft: PresentationDraft;
  onSave: (updatedDraft: PresentationDraft) => void;
}

export function DraftEditor({ draft: initialDraft, onSave }: DraftEditorProps) {
  const [draft, setDraft] = useState<PresentationDraft>(initialDraft);
  const [editingSlide, setEditingSlide] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const updateTitle = (title: string) => {
    setDraft({ ...draft, title });
    setHasChanges(true);
  };

  const updateTheme = (theme: string) => {
    setDraft({ ...draft, theme });
    setHasChanges(true);
  };

  const updateTableOfContents = (index: number, value: string) => {
    const newToc = [...draft.tableOfContents];
    newToc[index] = value;
    setDraft({ ...draft, tableOfContents: newToc });
    setHasChanges(true);
  };

  const addTableOfContentsItem = () => {
    const newToc = [...draft.tableOfContents, '新しいセクション'];
    
    // 対応するスライドも追加（目次の項目数とスライド数が一致している場合）
    let newSlides = [...draft.slides];
    if (draft.tableOfContents.length === draft.slides.length) {
      const newSlideNumber = draft.slides.length + 1;
      newSlides = [...draft.slides, {
        slideNumber: newSlideNumber,
        title: '新しいスライド',
        keyMessage: 'キーメッセージを入力',
        estimatedContent: 'スライドの内容概要',
      }];
    }
    
    setDraft({
      ...draft,
      tableOfContents: newToc,
      slides: newSlides,
      totalSlides: newSlides.length,
    });
    setHasChanges(true);
  };

  const removeTableOfContentsItem = (index: number) => {
    const newToc = draft.tableOfContents.filter((_, i) => i !== index);
    
    // 対応するスライドも削除（目次の項目数とスライド数が一致する場合）
    let newSlides = [...draft.slides];
    if (draft.tableOfContents.length === draft.slides.length && index < draft.slides.length) {
      newSlides = draft.slides.filter((_, i) => i !== index);
      // スライド番号を再採番
      newSlides.forEach((slide, i) => {
        slide.slideNumber = i + 1;
      });
    }
    
    setDraft({ 
      ...draft, 
      tableOfContents: newToc,
      slides: newSlides,
      totalSlides: newSlides.length
    });
    setHasChanges(true);
  };

  const updateSlide = (index: number, field: keyof SlideDraft, value: string) => {
    const newSlides = [...draft.slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setDraft({ ...draft, slides: newSlides });
    setHasChanges(true);
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const newSlides = [...draft.slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    // Swap slides
    [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];

    // Update slide numbers
    newSlides[index].slideNumber = index + 1;
    newSlides[targetIndex].slideNumber = targetIndex + 1;

    setDraft({ ...draft, slides: newSlides, totalSlides: newSlides.length });
    setHasChanges(true);
  };

  const deleteSlide = (index: number) => {
    const newSlides = draft.slides.filter((_, i) => i !== index);
    
    // Renumber remaining slides
    newSlides.forEach((slide, i) => {
      slide.slideNumber = i + 1;
    });

    // 対応する目次項目も削除（目次の項目数とスライド数が一致する場合）
    let newToc = [...draft.tableOfContents];
    if (draft.tableOfContents.length === draft.slides.length && index < draft.tableOfContents.length) {
      newToc = draft.tableOfContents.filter((_, i) => i !== index);
    }

    setDraft({ 
      ...draft, 
      slides: newSlides, 
      tableOfContents: newToc,
      totalSlides: newSlides.length 
    });
    setHasChanges(true);
  };

  const addSlide = () => {
    const newSlideNumber = draft.slides.length + 1;
    const newSlide: SlideDraft = {
      slideNumber: newSlideNumber,
      title: '新しいスライド',
      keyMessage: 'キーメッセージを入力',
      estimatedContent: 'スライドの内容概要',
    };

    // 対応する目次項目も追加（目次の項目数とスライド数が一致している場合）
    const newToc = draft.tableOfContents.length === draft.slides.length
      ? [...draft.tableOfContents, '新しいセクション']
      : draft.tableOfContents;

    setDraft({
      ...draft,
      slides: [...draft.slides, newSlide],
      tableOfContents: newToc,
      totalSlides: newSlideNumber,
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(draft);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">ドラフト編集</h2>
          <p className="text-muted-foreground">
            目次やスライド内容を編集、並び替え、削除できます
          </p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} size="lg">
            <Save className="w-5 h-5 mr-2" />
            変更を保存
          </Button>
        )}
      </div>

      {/* Title and Theme */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">タイトル</label>
            <Input
              value={draft.title}
              onChange={(e) => updateTitle(e.target.value)}
              className="text-xl font-bold"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">テーマ</label>
              <Input
                value={draft.theme}
                onChange={(e) => updateTheme(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">総スライド数</label>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {draft.totalSlides}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Table of Contents */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">目次</h3>
              {draft.tableOfContents.length === draft.slides.length && (
                <p className="text-xs text-muted-foreground mt-1">
                  🔗 スライドと同期中（目次を削除すると対応スライドも削除されます）
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={addTableOfContentsItem}>
              <Plus className="w-4 h-4 mr-2" />
              項目を追加
            </Button>
          </div>
          <div className="space-y-2">
            {draft.tableOfContents.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Badge variant="outline" className="px-2 min-w-[32px] justify-center">
                  {index + 1}
                </Badge>
                <Input
                  value={item}
                  onChange={(e) => updateTableOfContents(index, e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTableOfContentsItem(index)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Slides */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">スライド構成</h3>
            {draft.tableOfContents.length === draft.slides.length && (
              <p className="text-xs text-muted-foreground mt-1">
                🔗 目次と同期中（スライドを削除すると対応する目次項目も削除されます）
              </p>
            )}
          </div>
          <Button variant="outline" onClick={addSlide}>
            <Plus className="w-4 h-4 mr-2" />
            スライドを追加
          </Button>
        </div>

        {draft.slides.map((slide, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-4">
              {/* Slide Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    {slide.slideNumber}
                  </div>
                  {editingSlide === index ? (
                    <div className="flex-1 space-y-2">
                      <Input
                        value={slide.title}
                        onChange={(e) => updateSlide(index, 'title', e.target.value)}
                        className="font-bold"
                        placeholder="スライドタイトル"
                      />
                    </div>
                  ) : (
                    <div className="flex-1">
                      <h4 className="font-bold">{slide.title}</h4>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingSlide(editingSlide === index ? null : index)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveSlide(index, 'up')}
                    disabled={index === 0}
                  >
                    <MoveUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveSlide(index, 'down')}
                    disabled={index === draft.slides.length - 1}
                  >
                    <MoveDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteSlide(index)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {/* Slide Content */}
              {editingSlide === index ? (
                <div className="space-y-3 pl-15">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      キーメッセージ
                    </label>
                    <Input
                      value={slide.keyMessage}
                      onChange={(e) => updateSlide(index, 'keyMessage', e.target.value)}
                      placeholder="このスライドで伝えたい核心メッセージ"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      内容概要
                    </label>
                    <Textarea
                      value={slide.estimatedContent}
                      onChange={(e) => updateSlide(index, 'estimatedContent', e.target.value)}
                      placeholder="スライドの内容概要"
                      rows={3}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingSlide(null)}
                  >
                    完了
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 pl-15">
                  <div>
                    <p className="text-sm font-medium text-primary">
                      💡 {slide.keyMessage}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {slide.estimatedContent}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Save Button at Bottom */}
      {hasChanges && (
        <Card className="p-4 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-100">
                未保存の変更があります
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                変更を保存してから次のステップに進んでください
              </p>
            </div>
            <Button onClick={handleSave} size="lg">
              <Save className="w-5 h-5 mr-2" />
              変更を保存
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
