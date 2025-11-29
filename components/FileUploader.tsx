'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { usePresentationStore } from '@/lib/stores/presentationStore';
import { parseFile, parseURL } from '@/lib/parsers/file-parser';
import { toast } from 'sonner';

export function FileUploader() {
  const { uploadedFiles, addFile, removeFile } = usePresentationStore();
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true);

    for (const file of acceptedFiles) {
      try {
        toast.info(`${file.name} を解析中...`);
        
        const { content, metadata } = await parseFile(file);

        const uploadedFile = {
          id: crypto.randomUUID(),
          name: file.name,
          type: getFileType(file),
          size: file.size,
          url: URL.createObjectURL(file),
          content,
          metadata,
        };

        addFile(uploadedFile);
        toast.success(`${file.name} の解析が完了しました`);
      } catch (error: any) {
        console.error('File upload error:', error);
        toast.error(`${file.name} の解析に失敗しました: ${error.message}`);
      }
    }

    setIsProcessing(false);
  }, [addFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/plain': ['.txt'],
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov'],
    },
  });

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;

    setIsProcessing(true);
    try {
      toast.info('URLを解析中...');
      
      const { content, metadata } = await parseURL(urlInput);

      const uploadedFile = {
        id: crypto.randomUUID(),
        name: new URL(urlInput).hostname,
        type: 'url' as const,
        size: 0,
        url: urlInput,
        content,
        metadata,
      };

      addFile(uploadedFile);
      toast.success('URLの解析が完了しました');
      setUrlInput('');
    } catch (error: any) {
      console.error('URL parse error:', error);
      toast.error(`URLの解析に失敗しました: ${error.message}`);
    }
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {/* Drag & Drop Area */}
      <Card
        {...getRootProps()}
        className={`p-12 border-2 border-dashed cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <Upload className="w-12 h-12 text-muted-foreground" />
          <div>
            <p className="text-lg font-medium">
              {isDragActive ? 'ここにドロップ' : 'ファイルをドラッグ&ドロップ'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              PDF, Word, Excel, Text, 音声, 画像, 動画ファイルに対応
            </p>
          </div>
          <Button variant="secondary" type="button">
            ファイルを選択
          </Button>
        </div>
      </Card>

      {/* URL Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="URLを入力（Webサイト、YouTube等）"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleUrlSubmit} disabled={!urlInput.trim() || isProcessing}>
          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : '追加'}
        </Button>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">アップロード済みファイル ({uploadedFiles.length})</h3>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <Card key={file.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <File className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {file.type} • {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getFileType(file: File): 'pdf' | 'excel' | 'word' | 'text' | 'audio' | 'image' | 'video' | 'url' {
  const mimeType = file.type.toLowerCase();
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'word';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'excel';
  if (mimeType.includes('text')) return 'text';
  if (mimeType.includes('audio')) return 'audio';
  if (mimeType.includes('image')) return 'image';
  if (mimeType.includes('video')) return 'video';

  return 'text';
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}
