import { NextRequest, NextResponse } from 'next/server';
import { writeFile, access } from 'fs/promises';
import path from 'path';
import { mkdirSync, existsSync } from 'fs';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Compute SHA-256 hash of the file, prevents duplicates
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  const ext = file.name.split('.').pop();
  const filename = `${hash}.${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  const filePath = path.join(uploadDir, filename);

  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  // Only write if file doesn't exist
  try {
    await access(filePath);
  } catch {
    await writeFile(filePath, buffer);
  }

  const fileUrl = `/uploads/${filename}`;
  return NextResponse.json({ url: fileUrl });
}
