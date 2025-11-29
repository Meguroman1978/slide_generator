'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Users, Building2 } from 'lucide-react';

interface AudienceSelectorProps {
  audienceType: 'external' | 'internal';
  companyName: string;
  onAudienceTypeChange: (value: 'external' | 'internal') => void;
  onCompanyNameChange: (value: string) => void;
}

export function AudienceSelector({
  audienceType,
  companyName,
  onAudienceTypeChange,
  onCompanyNameChange,
}: AudienceSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          対象オーディエンス
        </CardTitle>
        <CardDescription>
          資料の対象者を選択してください。社外向けか社内向けかで資料の内容やトーンが変わります。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="audience-type">対象オーディエンス</Label>
          <Select value={audienceType} onValueChange={onAudienceTypeChange}>
            <SelectTrigger id="audience-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="external">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>社外向け資料</span>
                </div>
              </SelectItem>
              <SelectItem value="internal">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>社内向け資料</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {audienceType === 'external' && (
          <div className="space-y-2">
            <Label htmlFor="company-name">
              会社名/ブランド名
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="company-name"
              placeholder="例: 株式会社サンプル、ABC Corporation"
              value={companyName}
              onChange={(e) => onCompanyNameChange(e.target.value)}
              autoComplete="off"
              data-form-type="other"
              data-lpignore="true"
              required
            />
            <p className="text-xs text-muted-foreground">
              プレゼンテーション対象の会社名やブランド名を入力してください。会社ロゴも自動的に検索されます。
            </p>
          </div>
        )}

        <div className="rounded-lg bg-muted p-3 text-sm">
          <p className="font-medium mb-1">選択内容:</p>
          <p className="text-muted-foreground">
            {audienceType === 'external' ? (
              <>
                <span className="font-medium">社外向け資料</span>
                {companyName && (
                  <>
                    {' '}
                    - 対象: <span className="font-medium">{companyName}</span>
                  </>
                )}
              </>
            ) : (
              <span className="font-medium">社内向け資料</span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
