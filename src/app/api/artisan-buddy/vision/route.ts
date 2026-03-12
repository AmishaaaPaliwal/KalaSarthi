/**
 * Vision Service API Endpoint
 * 
 * Handles image analysis requests for Artisan Buddy
 * Supports both image URLs and file uploads
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let imageData: string | null = null;
    let message = '';
    let mimeType = 'image/jpeg';

    // Handle FormData (file upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const imageFile = formData.get('image') as File;
      message = (formData.get('message') as string) || 'What can you tell me about this image?';

      if (!imageFile) {
        return NextResponse.json(
          { error: 'Image file is required' },
          { status: 400 }
        );
      }

      // Convert file to base64
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      imageData = buffer.toString('base64');
      mimeType = imageFile.type || 'image/jpeg';
    }
    // Handle JSON (image URL - legacy support)
    else {
      const body = await request.json();
      const { imageUrl, options = {} } = body;

      if (!imageUrl) {
        return NextResponse.json(
          { error: 'Image URL or file is required' },
          { status: 400 }
        );
      }

      // Fetch image from URL and convert to base64
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageData = buffer.toString('base64');
      mimeType = response.headers.get('content-type') || 'image/jpeg';
      message = 'Analyze this image';
    }

    if (!imageData) {
      return NextResponse.json(
        { error: 'Failed to process image' },
        { status: 400 }
      );
    }

    // Use Gemini Vision API
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageData,
          mimeType: mimeType,
        },
      },
      message,
    ]);

    const response = result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      response: text,
      metadata: {
        model: 'gemini-2.0-flash-exp',
        hasImage: true,
      },
    });
  } catch (error) {
    console.error('[Vision API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Vision Service API',
    endpoints: {
      POST: {
        description: 'Analyze an image',
        body: {
          imageUrl: 'string (required)',
          options: {
            includeCraftDetection: 'boolean (default: true)',
            includeTextExtraction: 'boolean (default: false)',
            craftAnalysisOptions: {
              detectMaterials: 'boolean (default: true)',
              detectTechniques: 'boolean (default: true)',
              detectRegion: 'boolean (default: true)',
              generateSuggestions: 'boolean (default: true)',
            },
          },
        },
      },
    },
  });
}
