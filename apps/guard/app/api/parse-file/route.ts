import { NextResponse } from 'next/server';
import 'pdf-parse/worker';
import { PDFParse } from 'pdf-parse';
import * as mammoth from 'mammoth';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export const maxRequestBodySize = '20mb';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') ?? '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds 20MB limit' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    let text = '';

    if (ext === 'txt' || ext === 'md') {
      text = await file.text();
    } else if (ext === 'pdf') {
      const buffer = Buffer.from(await file.arrayBuffer());
      const parser = new PDFParse({ data: buffer });
      try {
        const result = await parser.getText();
        text = result.text;
      } finally {
        await parser.destroy();
      }
    } else if (ext === 'docx') {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF, DOCX, TXT, or MD file.' },
        { status: 400 }
      );
    }

    // Normalize whitespace
    text = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

    return NextResponse.json({ text, truncated: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to parse file';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
