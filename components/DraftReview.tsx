'use client';

import { PresentationDraft } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DraftReviewProps {
  draft: PresentationDraft;
}

export function DraftReview({ draft }: DraftReviewProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">{draft.title}</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{draft.theme}</Badge>
          <Badge variant="outline">{draft.totalSlides} スライド</Badge>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">目次</h3>
        <ol className="list-decimal list-inside space-y-2">
          {draft.tableOfContents.map((item, index) => (
            <li key={index} className="text-muted-foreground">
              {item}
            </li>
          ))}
        </ol>
      </Card>

      <div className="space-y-4">
        <h3 className="font-bold text-lg">スライド構成</h3>
        <div className="grid gap-4">
          {draft.slides.map((slide) => (
            <Card key={slide.slideNumber} className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground font-bold flex-shrink-0">
                  {slide.slideNumber}
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="font-bold">{slide.title}</h4>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-primary">
                      💡 {slide.keyMessage}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {slide.estimatedContent}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
