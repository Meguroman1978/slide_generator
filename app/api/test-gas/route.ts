import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url');
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    console.log('Testing Google Apps Script URL:', url);

    // Test GET request first
    console.log('1. Testing GET request...');
    const getResponse = await fetch(url, {
      method: 'GET',
    });

    console.log('GET Response status:', getResponse.status);
    console.log('GET Response headers:', Object.fromEntries(getResponse.headers.entries()));
    
    const getBody = await getResponse.text();
    console.log('GET Response body:', getBody);

    // Test POST request
    console.log('2. Testing POST request...');
    const testPayload = {
      metadata: {
        title: 'Test Presentation',
        createdAt: new Date().toISOString(),
      },
      slides: [
        {
          slideNumber: 1,
          templateType: 'cover',
          title: 'Test Title',
          keyMessage: 'Test Key Message',
          layout: [],
          speakerNotes: 'Test notes',
        },
      ],
    };

    const postResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
      redirect: 'follow',
    });

    console.log('POST Response status:', postResponse.status);
    console.log('POST Response headers:', Object.fromEntries(postResponse.headers.entries()));
    
    const postBody = await postResponse.text();
    console.log('POST Response body:', postBody);

    return NextResponse.json({
      success: true,
      tests: {
        get: {
          status: getResponse.status,
          statusText: getResponse.statusText,
          headers: Object.fromEntries(getResponse.headers.entries()),
          body: getBody,
        },
        post: {
          status: postResponse.status,
          statusText: postResponse.statusText,
          headers: Object.fromEntries(postResponse.headers.entries()),
          body: postBody,
        },
      },
    });
  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json(
      { 
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
