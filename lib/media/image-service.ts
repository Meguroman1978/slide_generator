/**
 * Image Service - Image generation and search utilities
 * 
 * This service handles:
 * 1. Company logo search via web search
 * 2. Illustration generation using nano-banana
 * 3. Chart generation using gemini3
 * 4. Prioritize existing images from uploaded resources
 */

export interface ImageGenerationOptions {
  type: 'logo' | 'illustration' | 'chart' | 'photo';
  query: string;
  aspectRatio?: string;
  model?: string;
}

export interface ImageSearchResult {
  url: string;
  source: 'uploaded' | 'web-search' | 'ai-generated';
  description: string;
}

/**
 * Search for company logo
 */
export async function searchCompanyLogo(
  companyName: string
): Promise<ImageSearchResult | null> {
  if (!companyName) {
    return null;
  }

  try {
    // Web search for company logo
    const searchQuery = `${companyName} ロゴ 公式`;
    
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3010';
    const response = await fetch(`${baseUrl}/api/media/search-logo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ companyName, searchQuery }),
    });

    if (!response.ok) {
      throw new Error('Failed to search logo');
    }

    const result = await response.json();
    return result.logoUrl ? {
      url: result.logoUrl,
      source: 'web-search',
      description: `${companyName} logo`,
    } : null;

  } catch (error) {
    console.error('Error searching company logo:', error);
    return null;
  }
}

/**
 * Generate or search for illustration/chart images
 */
export async function generateOrSearchImage(
  options: ImageGenerationOptions,
  uploadedResources?: any[]
): Promise<ImageSearchResult | null> {
  // Step 1: Check if image exists in uploaded resources
  if (uploadedResources && uploadedResources.length > 0) {
    const matchedResource = findMatchingImageInResources(
      uploadedResources,
      options.query
    );
    
    if (matchedResource) {
      return {
        url: matchedResource.url,
        source: 'uploaded',
        description: matchedResource.description || options.query,
      };
    }
  }

  // Step 2: Generate image using AI
  if (options.type === 'illustration') {
    return await generateIllustration(options.query, options.aspectRatio);
  } else if (options.type === 'chart') {
    return await generateChart(options.query, options.aspectRatio);
  } else if (options.type === 'photo') {
    // For photos, prefer web search
    return await searchWebImage(options.query);
  }

  return null;
}

/**
 * Find matching image in uploaded resources
 */
function findMatchingImageInResources(
  resources: any[],
  query: string
): any | null {
  // Simple keyword matching
  const keywords = query.toLowerCase().split(' ');
  
  for (const resource of resources) {
    if (resource.type === 'image' && resource.url) {
      // Check if resource metadata or name matches keywords
      const resourceText = (
        (resource.name || '') +
        ' ' +
        (resource.description || '') +
        ' ' +
        JSON.stringify(resource.metadata || {})
      ).toLowerCase();

      const matchCount = keywords.filter((keyword) =>
        resourceText.includes(keyword)
      ).length;

      if (matchCount >= keywords.length * 0.5) {
        // At least 50% keywords match
        return resource;
      }
    }
  }

  return null;
}

/**
 * Generate illustration using nano-banana
 */
async function generateIllustration(
  query: string,
  aspectRatio: string = '16:9'
): Promise<ImageSearchResult | null> {
  try {
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3010';
    const response = await fetch(`${baseUrl}/api/media/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        model: 'nano-banana-pro',
        aspectRatio,
        imageType: 'illustration',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate illustration');
    }

    const result = await response.json();
    return {
      url: result.imageUrl,
      source: 'ai-generated',
      description: query,
    };
  } catch (error) {
    console.error('Error generating illustration:', error);
    return null;
  }
}

/**
 * Generate chart using gemini3
 */
async function generateChart(
  query: string,
  aspectRatio: string = '16:9'
): Promise<ImageSearchResult | null> {
  try {
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3010';
    const response = await fetch(`${baseUrl}/api/media/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        model: 'gemini/veo3',
        aspectRatio,
        imageType: 'chart',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate chart');
    }

    const result = await response.json();
    return {
      url: result.imageUrl,
      source: 'ai-generated',
      description: query,
    };
  } catch (error) {
    console.error('Error generating chart:', error);
    return null;
  }
}

/**
 * Search web for images
 */
async function searchWebImage(
  query: string
): Promise<ImageSearchResult | null> {
  try {
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3010';
    const response = await fetch(`${baseUrl}/api/media/search-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error('Failed to search image');
    }

    const result = await response.json();
    return result.imageUrl ? {
      url: result.imageUrl,
      source: 'web-search',
      description: query,
    } : null;
  } catch (error) {
    console.error('Error searching web image:', error);
    return null;
  }
}

/**
 * Batch process images for multiple slides
 */
export async function processImagesForSlides(
  slides: any[],
  uploadedResources: any[],
  companyName?: string
): Promise<Map<string, ImageSearchResult>> {
  const imageMap = new Map<string, ImageSearchResult>();

  // Search for company logo if needed
  if (companyName) {
    const logo = await searchCompanyLogo(companyName);
    if (logo) {
      imageMap.set('company_logo', logo);
    }
  }

  // Process images for each slide
  for (const slide of slides) {
    if (slide.visualPrompts && Array.isArray(slide.visualPrompts)) {
      for (const prompt of slide.visualPrompts) {
        const key = `slide_${slide.slideNumber}_${prompt}`;
        
        // Determine image type from prompt
        const imageType = determineImageType(prompt);
        
        const image = await generateOrSearchImage(
          {
            type: imageType,
            query: prompt,
            aspectRatio: '16:9',
          },
          uploadedResources
        );

        if (image) {
          imageMap.set(key, image);
        }
      }
    }
  }

  return imageMap;
}

/**
 * Determine image type from prompt
 */
function determineImageType(
  prompt: string
): 'logo' | 'illustration' | 'chart' | 'photo' {
  const lowerPrompt = prompt.toLowerCase();

  if (
    lowerPrompt.includes('グラフ') ||
    lowerPrompt.includes('チャート') ||
    lowerPrompt.includes('chart') ||
    lowerPrompt.includes('graph')
  ) {
    return 'chart';
  }

  if (
    lowerPrompt.includes('イラスト') ||
    lowerPrompt.includes('illustration') ||
    lowerPrompt.includes('アイコン') ||
    lowerPrompt.includes('icon')
  ) {
    return 'illustration';
  }

  if (lowerPrompt.includes('ロゴ') || lowerPrompt.includes('logo')) {
    return 'logo';
  }

  return 'photo';
}
