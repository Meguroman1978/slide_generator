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
import { DraftEditor } from '@/components/DraftEditor';
import { PresentationTypeSelector } from '@/components/PresentationTypeSelector';
import { usePresentationStore } from '@/lib/stores/presentationStore';
import { toast } from 'sonner';

export default function Home() {
  const {
    uploadedFiles,
    settings,
    presentationType,
    setPresentationType,
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
          presentationType,
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

  const handleExportGoogleSlides = async () => {
    if (slides.length === 0) {
      toast.error('先にスライドを生成してください');
      return;
    }

    setIsProcessing(true);
    toast.info('Google Slidesを生成中...');

    try {
      const response = await fetch('/api/export/google-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides,
          metadata: {
            title: draft?.title || 'AI生成プレゼンテーション',
          },
          settings,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.needsSetup) {
          toast.error(result.error, {
            duration: 5000,
            action: {
              label: '設定を開く',
              onClick: () => {
                // Settings dialog will open
              },
            },
          });
        } else {
          throw new Error(result.error || 'エクスポートに失敗しました');
        }
        setIsProcessing(false);
        return;
      }

      toast.success('Google Slidesの作成に成功しました！');
      
      // Open the generated presentation in a new tab
      if (result.url) {
        window.open(result.url, '_blank');
      }

      setIsProcessing(false);
    } catch (error: any) {
      console.error('Google Slides export error:', error);
      toast.error(`エクスポートに失敗しました: ${error.message}`);
      setIsProcessing(false);
    }
  };

  const handleExportPowerPoint = async () => {
    if (slides.length === 0) {
      toast.error('先にスライドを生成してください');
      return;
    }

    setIsProcessing(true);
    toast.info('PowerPointデータを生成中...');

    try {
      const response = await fetch('/api/export/powerpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides,
          metadata: {
            title: draft?.title || 'AI生成プレゼンテーション',
          },
          settings,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'エクスポートに失敗しました');
      }

      const result = await response.json();

      // Download as JSON file
      const dataStr = JSON.stringify(result.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${result.data.metadata.title || 'presentation'}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('PowerPointデータをダウンロードしました！', {
        description: 'Aspose等のオンライン変換ツールでPPTXに変換できます',
        duration: 7000,
        action: {
          label: '変換ツールを開く',
          onClick: () => {
            window.open('https://products.aspose.app/cells/ja/conversion/json-to-powerpoint', '_blank');
          },
        },
      });

      setIsProcessing(false);
    } catch (error: any) {
      console.error('PowerPoint export error:', error);
      toast.error(`エクスポートに失敗しました: ${error.message}`);
      setIsProcessing(false);
    }
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

            <PresentationTypeSelector
              value={presentationType}
              onChange={setPresentationType}
            />

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
              analysisContext={analysisResults[0]}
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
            {draft && (
              <>
                <Tabs defaultValue="preview">
                  <TabsList>
                    <TabsTrigger value="preview">プレビュー</TabsTrigger>
                    <TabsTrigger value="edit">編集モード</TabsTrigger>
                  </TabsList>
                  <TabsContent value="preview" className="mt-4">
                    <DraftReview draft={draft} />
                  </TabsContent>
                  <TabsContent value="edit" className="mt-4">
                    <DraftEditor draft={draft} onSave={(updatedDraft) => setDraft(updatedDraft)} />
                  </TabsContent>
                </Tabs>
              </>
            )}

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
                <Card className="p-6 border-2 hover:border-primary transition-colors">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Presentation className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Google Slides</h3>
                        <p className="text-sm text-muted-foreground">
                          クラウドで直接編集可能
                        </p>
                      </div>
                    </div>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>✓ ブラウザで即座に開く</li>
                      <li>✓ リアルタイム共同編集</li>
                      <li>✓ 自動保存・バージョン管理</li>
                    </ul>
                    <Button 
                      onClick={handleExportGoogleSlides} 
                      disabled={isProcessing}
                      size="lg" 
                      className="w-full"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5 mr-2" />
                          Google Slidesで開く
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      ※ Google Apps Script URLの設定が必要です
                    </p>
                  </div>
                </Card>

                <Card className="p-6 border-2 hover:border-primary transition-colors">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">PowerPoint</h3>
                        <p className="text-sm text-muted-foreground">
                          JSONデータをダウンロード
                        </p>
                      </div>
                    </div>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>✓ 構造化データを取得</li>
                      <li>✓ カスタム変換ツール対応</li>
                      <li>✓ オフライン編集可能</li>
                    </ul>
                    <Button 
                      onClick={handleExportPowerPoint}
                      disabled={isProcessing}
                      size="lg" 
                      variant="outline"
                      className="w-full"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5 mr-2" />
                          JSONをダウンロード
                        </>
                      )}
                    </Button>
                    <div className="text-xs space-y-2">
                      <p className="text-muted-foreground">
                        ※ JSONファイルを変換ツールで処理してください
                      </p>
                      <div className="p-2 bg-muted rounded text-xs">
                        <p className="font-medium mb-1">推奨変換ツール:</p>
                        <a 
                          href="https://products.aspose.app/cells/ja/conversion/json-to-powerpoint"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Aspose JSON to PowerPoint Converter ↗
                        </a>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>

            {/* Google Apps Script 401 Error Help */}
            <Card className="p-6 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-900">
              <h3 className="font-bold mb-3 text-amber-900 dark:text-amber-100">
                ⚠️ Google Slides 401エラーが発生する場合
              </h3>
              <div className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium">3ステップで簡単に解決:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>
                    <code className="bg-amber-100 dark:bg-amber-900 px-2 py-0.5 rounded">apps-script/Code.gs</code>
                    をコピー
                  </li>
                  <li>
                    <a 
                      href="https://script.google.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      Google Apps Script ↗
                    </a>
                    で新規プロジェクトを作成してペースト
                  </li>
                  <li>
                    デプロイ → 新しいデプロイ → ウェブアプリ →{' '}
                    <strong>「アクセスできるユーザー」を「全員」</strong>に設定してURLを取得
                  </li>
                </ol>
                <p className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800">
                  詳細は{' '}
                  <a 
                    href="/docs/API_SETUP_GUIDE.md"
                    className="text-primary hover:underline font-medium"
                  >
                    APIセットアップガイド
                  </a>
                  {' '}をご覧ください
                </p>
              </div>
            </Card>

            {/* Instructions */}
            <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                エクスポート後の使い方
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Google Slides:</p>
                  <p className="text-muted-foreground">
                    1. 「Google Slidesで開く」をクリック
                    <br />
                    2. 新しいタブでプレゼンテーションが開きます
                    <br />
                    3. Google Driveに自動保存されます
                  </p>
                </div>
                <div>
                  <p className="font-medium">PowerPoint:</p>
                  <p className="text-muted-foreground">
                    1. 「JSONをダウンロード」をクリック
                    <br />
                    2. <a href="https://products.aspose.app/cells/ja/conversion/json-to-powerpoint" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Aspose Converter</a>でJSONをアップロード
                    <br />
                    3. 変換されたPPTXファイルをダウンロード
                    <br />
                    ※ 今後のアップデートで直接PPTX出力に対応予定
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
