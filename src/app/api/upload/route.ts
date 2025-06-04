import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { mkdirSync, existsSync } from 'fs';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');

  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  const ext = file.name.split('.').pop();
  const filename = `${uuidv4()}.${ext}`;
  const filePath = path.join(uploadDir, filename);

  await writeFile(filePath, buffer);

  const fileUrl = `/uploads/${filename}`;

  return NextResponse.json({ url: fileUrl });
}
