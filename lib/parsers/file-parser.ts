// File parsing utilities for different file types

export async function parseFile(file: File): Promise<{
  content: string;
  metadata: Record<string, any>;
}> {
  const fileType = getFileType(file);

  switch (fileType) {
    case 'pdf':
      return parsePDF(file);
    case 'word':
      return parseWord(file);
    case 'excel':
      return parseExcel(file);
    case 'text':
      return parseText(file);
    case 'audio':
      return parseAudio(file);
    case 'image':
      return parseImage(file);
    case 'video':
      return parseVideo(file);
    default:
      throw new Error(`Unsupported file type: ${file.type}`);
  }
}

function getFileType(file: File): string {
  const mimeType = file.type.toLowerCase();
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (mimeType.includes('pdf') || extension === 'pdf') return 'pdf';
  if (
    mimeType.includes('word') ||
    mimeType.includes('document') ||
    extension === 'docx' ||
    extension === 'doc'
  )
    return 'word';
  if (
    mimeType.includes('sheet') ||
    mimeType.includes('excel') ||
    extension === 'xlsx' ||
    extension === 'xls'
  )
    return 'excel';
  if (mimeType.includes('text') || extension === 'txt') return 'text';
  if (mimeType.includes('audio') || ['mp3', 'wav', 'ogg', 'm4a'].includes(extension || ''))
    return 'audio';
  if (mimeType.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || ''))
    return 'image';
  if (mimeType.includes('video') || ['mp4', 'webm', 'mov', 'avi'].includes(extension || ''))
    return 'video';

  return 'unknown';
}

async function parsePDF(file: File): Promise<{ content: string; metadata: Record<string, any> }> {
  // In browser, we'll send to API endpoint for server-side parsing
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'pdf');

  const response = await fetch('/api/parse', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    const errorMessage = errorData.error || 'Failed to parse PDF';
    throw new Error(`PDF解析に失敗しました: ${errorMessage}`);
  }

  return response.json();
}

async function parseWord(file: File): Promise<{ content: string; metadata: Record<string, any> }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'word');

  const response = await fetch('/api/parse', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to parse Word document');
  }

  return response.json();
}

async function parseExcel(file: File): Promise<{ content: string; metadata: Record<string, any> }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'excel');

  const response = await fetch('/api/parse', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to parse Excel file');
  }

  return response.json();
}

async function parseText(file: File): Promise<{ content: string; metadata: Record<string, any> }> {
  const content = await file.text();
  return {
    content,
    metadata: {
      encoding: 'utf-8',
      lines: content.split('\n').length,
    },
  };
}

async function parseAudio(file: File): Promise<{ content: string; metadata: Record<string, any> }> {
  // Audio files need transcription via API
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'audio');

  const response = await fetch('/api/parse', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to transcribe audio');
  }

  return response.json();
}

async function parseImage(file: File): Promise<{ content: string; metadata: Record<string, any> }> {
  // Images need OCR/Vision API analysis
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'image');

  const response = await fetch('/api/parse', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to analyze image');
  }

  return response.json();
}

async function parseVideo(file: File): Promise<{ content: string; metadata: Record<string, any> }> {
  // Videos need transcription and scene analysis via API
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'video');

  const response = await fetch('/api/parse', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to analyze video');
  }

  return response.json();
}

export async function parseURL(url: string): Promise<{
  content: string;
  metadata: Record<string, any>;
}> {
  const response = await fetch('/api/parse', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, type: 'url' }),
  });

  if (!response.ok) {
    throw new Error('Failed to parse URL');
  }

  return response.json();
}
