'use client';

import { useState } from 'react';
import { Settings, Info, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { usePresentationStore } from '@/lib/stores/presentationStore';
import { FONT_OPTIONS, ANIMATION_OPTIONS, TONE_OPTIONS } from '@/lib/constants/fonts';

export function SettingsDialog() {
  const { settings, updateSettings } = usePresentationStore();
  const [showApiGuide, setShowApiGuide] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          設定
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>プレゼンテーション設定</DialogTitle>
          <DialogDescription>
            フォント、アニメーション、API キーなどの設定を管理します
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="design" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="design">デザイン設定</TabsTrigger>
            <TabsTrigger value="api">API 設定</TabsTrigger>
          </TabsList>

          {/* Design Settings */}
          <TabsContent value="design" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="font">フォント</Label>
                <Select
                  value={settings.fontFamily}
                  onValueChange={(value) => updateSettings({ fontFamily: value as any })}
                >
                  <SelectTrigger id="font">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="animation">アニメーション</Label>
                <Select
                  value={settings.animationLevel}
                  onValueChange={(value) => updateSettings({ animationLevel: value as any })}
                >
                  <SelectTrigger id="animation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ANIMATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">素材のトーン</Label>
                <Select
                  value={settings.toneStyle}
                  onValueChange={(value) => updateSettings({ toneStyle: value as any })}
                >
                  <SelectTrigger id="tone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template">
                  テンプレートURL
                  <span className="ml-2 text-xs font-normal text-muted-foreground">(オプション)</span>
                </Label>
                <Input
                  id="template"
                  type="url"
                  placeholder="デフォルトテンプレートを使用"
                  value={settings.templateUrl || ''}
                  onChange={(e) => updateSettings({ templateUrl: e.target.value })}
                  autoComplete="off"
                  data-form-type="other"
                />
                <p className="text-xs text-muted-foreground">
                  <strong>デフォルト:</strong> https://docs.google.com/presentation/d/1p826KUscu_89-uu7-ILYdxD21EpJbhcSTUhGX3WrI5Q/edit<br />
                  空欄の場合、デフォルトテンプレート（変数置換対応）が自動的に使用されます。<br />
                  別のテンプレートを使用する場合のみURLを入力してください。
                </p>
              </div>
            </div>
          </TabsContent>

          {/* API Settings */}
          <TabsContent value="api" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium">API キー設定</h4>
                  <p className="text-sm text-muted-foreground">
                    AI分析とスライド生成に必要なAPIキーを設定します
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowApiGuide(!showApiGuide)}
                >
                  <Info className="w-4 h-4 mr-2" />
                  ガイド
                </Button>
              </div>

              {showApiGuide && (
                <Card className="p-4 bg-muted">
                  <h5 className="font-medium mb-3">API キー取得ガイド</h5>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-primary">Google AI Studio API Key（推奨）</p>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground mt-1">
                        <li>
                          <a
                            href="https://aistudio.google.com/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                          >
                            Google AI Studio
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          を開く
                        </li>
                        <li>「Create API Key」をクリック</li>
                        <li>生成されたキー（AIzaSy...）をコピーして下記に貼り付け</li>
                      </ol>
                      <div className="mt-2 p-2 bg-green-50 dark:bg-green-950 rounded text-xs">
                        <p className="text-green-800 dark:text-green-200">
                          ✨ Gemini 3やNano Bananaなど最新モデルを高速・低コストで利用できます
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium">OpenAI API Key（オプション）</p>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground mt-1">
                        <li>
                          <a
                            href="https://platform.openai.com/signup"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                          >
                            OpenAI Platform
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          でアカウント作成
                        </li>
                        <li>API Keys ページで「Create new secret key」をクリック</li>
                        <li>生成されたキーをコピー（フォールバック用）</li>
                      </ol>
                    </div>

                    <div>
                      <p className="font-medium">Google Apps Script URL（スライド生成用）</p>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground mt-1">
                        <li>
                          <a
                            href="https://script.google.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                          >
                            script.google.com
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          で新しいプロジェクト作成
                        </li>
                        <li>
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">apps-script/Code.gs</code>
                          の内容をコピー&ペースト
                        </li>
                        <li>「デプロイ」→「新しいデプロイ」→「ウェブアプリ」を選択</li>
                        <li>
                          <strong>アクセス権限:</strong> 「アクセスできるユーザー」を
                          <span className="text-primary font-medium">「全員」</span>に設定
                        </li>
                        <li>「デプロイ」をクリックしてURLをコピー</li>
                        <li>取得したURLを下記に貼り付け</li>
                      </ol>
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 rounded text-xs">
                        <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                          💡 簡単3ステップ:
                        </p>
                        <p className="text-blue-800 dark:text-blue-200">
                          1️⃣ コードをコピー → 2️⃣ ウェブアプリとしてデプロイ → 3️⃣ URLを取得
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              <div className="space-y-2">
                <Label htmlFor="google-ai-key">
                  Google AI Studio API Key（推奨・優先使用）
                  <span className="ml-2 text-xs font-normal text-primary">Gemini 3, Nano Banana</span>
                </Label>
                <Input
                  id="google-ai-key"
                  type="password"
                  placeholder="AIzaSy..."
                  value={settings.googleAiStudioApiKey || ''}
                  onChange={(e) => updateSettings({ googleAiStudioApiKey: e.target.value })}
                  autoComplete="off"
                  data-form-type="other"
                  data-lpignore="true"
                />
                <p className="text-xs text-muted-foreground">
                  Gemini APIを優先的に使用します。高速で低コストです。
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="openai-key">
                  OpenAI API Key（フォールバック）
                  <span className="ml-2 text-xs font-normal text-muted-foreground">必要時のみ使用</span>
                </Label>
                <Input
                  id="openai-key"
                  type="password"
                  placeholder="sk-..."
                  value={settings.openaiApiKey || ''}
                  onChange={(e) => updateSettings({ openaiApiKey: e.target.value })}
                  autoComplete="off"
                  data-form-type="other"
                  data-lpignore="true"
                />
                <p className="text-xs text-muted-foreground">
                  Google AI Studio APIが利用できない場合に使用されます。
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gas-url">Google Apps Script URL（オプション）</Label>
                <Input
                  id="gas-url"
                  type="url"
                  placeholder="https://script.google.com/..."
                  value={settings.googleAppsScriptUrl || ''}
                  onChange={(e) => updateSettings({ googleAppsScriptUrl: e.target.value })}
                  autoComplete="off"
                  data-form-type="other"
                />
              </div>

              <Card className="p-4 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-900">
                <div className="flex gap-2">
                  <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-900 dark:text-amber-100">
                      セキュリティについて
                    </p>
                    <p className="text-amber-800 dark:text-amber-200 mt-1">
                      APIキーはブラウザのローカルストレージに安全に保存されます。サーバーには送信されません。
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
