'use client';

import { StorylineProposal } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

interface StorylineSelectorProps {
  proposals: StorylineProposal[];
  selectedId: string | null;
  onSelect: (proposal: StorylineProposal) => void;
}

export function StorylineSelector({
  proposals,
  selectedId,
  onSelect,
}: StorylineSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">ストーリーライン案を選択</h2>
        <p className="text-muted-foreground">
          以下の5つのストーリーライン案から最適なものを選択してください
        </p>
      </div>

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
    </div>
  );
}
