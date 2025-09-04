import { NextRequest, NextResponse } from 'next/server';
import { replaceTextInComponent } from '@vina/diff-patcher';
import path from 'path';

interface PatchRequest {
  file: string;
  componentName: string;
  newText: string;
}

interface PatchResponse {
  ok: boolean;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PatchRequest = await request.json();
    const { file, componentName, newText } = body;
    
    if (!file || !componentName || !newText) {
      return NextResponse.json(
        { ok: false, error: 'Missing required parameters: file, componentName, newText' },
        { status: 400 }
      );
    }

    // Get the project root path for the preview runner
    const projectRoot = path.join(process.cwd(), '..', 'preview-runner');
    
    console.log(`🔧 AST Patch request: ${file} -> ${componentName} -> "${newText}"`);
    
    // Call the diff-patcher function
    const result = await replaceTextInComponent({
      projectRoot,
      filePath: file,
      componentName,
      newText
    });
    
    console.log(`✅ AST transformation completed for ${file}`);
    
    // Send the updated content to the preview runner
    const runnerUrl = 'http://localhost:5173/api/update';
    const updateResponse = await fetch(runnerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filePath: file,
        content: result.updatedContent
      })
    });
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error(`❌ Failed to update runner: ${errorText}`);
      return NextResponse.json(
        { ok: false, error: `Failed to update preview runner: ${errorText}` },
        { status: 500 }
      );
    }
    
    const updateResult = await updateResponse.json();
    console.log(`🚀 Preview runner updated: ${updateResult.message}`);
    
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error('❌ AST Patch error:', error);
    return NextResponse.json(
      { 
        ok: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}