'use client';

import { useState } from 'react';
import { StorylineProposal } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { CustomStoryline } from './CustomStoryline';

interface StorylineSelectorProps {
  proposals: StorylineProposal[];
  selectedId: string | null;
  onSelect: (proposal: StorylineProposal) => void;
  analysisContext?: any;
}

export function StorylineSelector({
  proposals,
  selectedId,
  onSelect,
  analysisContext,
}: StorylineSelectorProps) {
  const [activeTab, setActiveTab] = useState<'proposals' | 'custom'>('proposals');

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">ストーリーライン案を選択</h2>
        <p className="text-muted-foreground">
          AI提案から選択するか、独自のストーリーラインを作成してください
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="proposals">AI提案（5案）</TabsTrigger>
          <TabsTrigger value="custom">
            <Sparkles className="w-4 h-4 mr-2" />
            カスタム作成
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proposals" className="space-y-4 mt-4">
          <div className="grid gap-4">
            {proposals.map((proposal, index) => (
          <Card
            key={proposal.id}
            className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
              selectedId === proposal.id
                ? 'border-primary ring-2 ring-primary ring-offset-2'
                : ''
            }`}
            onClick={() => onSelect(proposal)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold">{proposal.id}</h3>
                  {selectedId === proposal.id && (
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  )}
                </div>

                <div className="space-y-3 pl-13">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      ターゲットオーディエンス
                    </p>
                    <p className="font-medium">{proposal.targetAudience}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      キーメッセージ
                    </p>
                    <p className="font-medium text-primary">{proposal.keyMessage}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      構成の流れ
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      {proposal.structure.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      この案を選ぶべき理由
                    </p>
                    <p className="text-sm">{proposal.reasoning}</p>
                  </div>
                </div>
              </div>
            </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="mt-4">
          <CustomStoryline
            analysisContext={analysisContext}
            onComplete={(storyline) => {
              onSelect(storyline);
              setActiveTab('proposals');
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
