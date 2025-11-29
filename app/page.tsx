'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Loader2, Sparkles, FileText, Presentation, Download } from 'lucide-react';
import { FileUploader } from '@/components/FileUploader';
import { SettingsDialog } from '@/components/SettingsDialog';
import { StorylineSelector } from '@/components/StorylineSelector';
import { DraftReview } from '@/components/DraftReview';
import { usePresentationStore } from '@/lib/stores/presentationStore';
import { toast } from 'sonner';

export default function Home() {
  const {
    uploadedFiles,
    settings,
    analysisResults,
    setAnalysisResults,
    storylineProposals,
    setStorylineProposals,
    selectedStoryline,
    selectStoryline,
    draft,
    setDraft,
    slides,
    setSlides,
    currentStep,
    setCurrentStep,
  } = usePresentationStore();

  const [userInstructions, setUserInstructions] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleAnalyze = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('ファイルまたはURLをアップロードしてください');
      return;
    }

    if (!settings.openaiApiKey && !process.env.OPENAI_API_KEY) {
      toast.error('OpenAI API Keyを設定してください');
      return;
    }

    setIsProcessing(true);
    setProgress(20);

    try {
      toast.info('ファイルを分析中...');

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: uploadedFiles, settings }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Analysis failed');
      }

      const result = await response.json();
      setAnalysisResults([result.analysis]);
      setProgress(40);
      
      toast.success('分析が完了しました');

      // Auto-generate storylines
      await handleGenerateStorylines(result.analysis);
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(`分析に失敗しました: ${error.message}`);
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleGenerateStorylines = async (analysis?: any) => {
    const analysisData = analysis || analysisResults[0];
    
    if (!analysisData) {
      toast.error('先に分析を実行してください');
      return;
    }

    setProgress(50);
    toast.info('ストーリーライン案を生成中...');

    try {
      const response = await fetch('/api/storyline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis: analysisData,
          userInstructions,
          settings,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Storyline generation failed');
      }

      const result = await response.json();
      setStorylineProposals(result.proposals);
      setProgress(60);
      setCurrentStep('storyline');
      
      toast.success('ストーリーライン案を生成しました');
      setIsProcessing(false);
    } catch (error: any) {
      console.error('Storyline error:', error);
      toast.error(`ストーリーライン生成に失敗しました: ${error.message}`);
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleGenerateDraft = async () => {
    if (!selectedStoryline) {
      toast.error('ストーリーライン案を選択してください');
      return;
    }

    setIsProcessing(true);
    setProgress(70);
    toast.info('ドラフトを生成中...');

    try {
      const response = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyline: selectedStoryline,
          analysis: analysisResults[0],
          settings,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Draft generation failed');
      }

      const result = await response.json();
      setDraft(result);
      setProgress(80);
      setCurrentStep('draft');
      
      toast.success('ドラフトを生成しました');
      setIsProcessing(false);
    } catch (error: any) {
      console.error('Draft error:', error);
      toast.error(`ドラフト生成に失敗しました: ${error.message}`);
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleGenerateSlides = async () => {
    if (!draft) {
      toast.error('先にドラフトを生成してください');
      return;
    }

    setIsProcessing(true);
    setProgress(85);
    toast.info('詳細なスライドを生成中...');

    try {
      const response = await fetch('/api/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft,
          analysis: analysisResults[0],
          settings,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Slides generation failed');
      }

      const result = await response.json();
      setSlides(result.slides);
      setProgress(100);
      setCurrentStep('slides');
      
      toast.success('スライド生成が完了しました！');
      setIsProcessing(false);
    } catch (error: any) {
      console.error('Slides error:', error);
      toast.error(`スライド生成に失敗しました: ${error.message}`);
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleExport = async () => {
    if (slides.length === 0) {
      toast.error('先にスライドを生成してください');
      return;
    }

    toast.info('エクスポート機能は実装中です');
    // Export logic will be implemented
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Presentation className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                AI Presentation Generator
              </h1>
              <p className="text-muted-foreground">
                世界最高峰のプレゼンテーション生成ツール
              </p>
            </div>
          </div>
          <SettingsDialog />
        </div>

        {/* Progress Bar */}
        {progress > 0 && (
          <Card className="p-4 mb-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">進捗状況</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </Card>
        )}

        {/* Main Content */}
        <Tabs value={currentStep} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="upload" onClick={() => setCurrentStep('upload')}>
              1. アップロード
            </TabsTrigger>
            <TabsTrigger
              value="storyline"
              disabled={storylineProposals.length === 0}
              onClick={() => setCurrentStep('storyline')}
            >
              2. ストーリー
            </TabsTrigger>
            <TabsTrigger
              value="draft"
              disabled={!draft}
              onClick={() => setCurrentStep('draft')}
            >
              3. ドラフト
            </TabsTrigger>
            <TabsTrigger
              value="slides"
              disabled={slides.length === 0}
              onClick={() => setCurrentStep('slides')}
            >
              4. スライド
            </TabsTrigger>
            <TabsTrigger
              value="export"
              disabled={slides.length === 0}
              onClick={() => setCurrentStep('export')}
            >
              5. エクスポート
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card className="p-6">
              <FileUploader />
            </Card>

            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">追加指示（オプション）</h3>
                  <Textarea
                    placeholder="プレゼンテーションに関する追加の指示や要望があれば記入してください..."
                    value={userInstructions}
                    onChange={(e) => setUserInstructions(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={uploadedFiles.length === 0 || isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      分析中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      分析開始
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Storyline Tab */}
          <TabsContent value="storyline" className="space-y-6">
            <StorylineSelector
              proposals={storylineProposals}
              selectedId={selectedStoryline?.id || null}
              onSelect={selectStoryline}
            />

            <div className="flex justify-end">
              <Button
                onClick={handleGenerateDraft}
                disabled={!selectedStoryline || isProcessing}
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5 mr-2" />
                    ドラフト生成
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Draft Tab */}
          <TabsContent value="draft" className="space-y-6">
            {draft && <DraftReview draft={draft} />}

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setCurrentStep('storyline')}>
                戻る
              </Button>
              <Button onClick={handleGenerateSlides} disabled={isProcessing} size="lg">
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Presentation className="w-5 h-5 mr-2" />
                    スライド生成
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Slides Tab */}
          <TabsContent value="slides" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">生成されたスライド</h2>
              <div className="space-y-4">
                {slides.map((slide) => (
                  <Card key={slide.slideNumber} className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {slide.slideNumber}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{slide.title}</h3>
                          <p className="text-sm text-primary">{slide.keyMessage}</p>
                        </div>
                      </div>

                      <div className="pl-15">
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          スピーカーノート
                        </p>
                        <p className="text-sm">{slide.speakerNotes}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep('export')} size="lg">
                エクスポートへ進む
              </Button>
            </div>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">エクスポート</h2>
              <p className="text-muted-foreground mb-6">
                生成されたプレゼンテーションをGoogle SlidesまたはPowerPointとしてエクスポートします
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <Button onClick={handleExport} size="lg" className="h-24">
                  <div className="flex flex-col items-center gap-2">
                    <Download className="w-6 h-6" />
                    <span>Google Slides</span>
                  </div>
                </Button>
                <Button onClick={handleExport} size="lg" variant="outline" className="h-24">
                  <div className="flex flex-col items-center gap-2">
                    <Download className="w-6 h-6" />
                    <span>PowerPoint (PPTX)</span>
                  </div>
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
