import { NextRequest, NextResponse } from 'next/server';
import { uploadToBlob, deleteFromBlob } from '@/lib/blobClient';

// POST: Upload a file to Vercel Blob
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const { url } = await uploadToBlob(file);
  return NextResponse.json({ url });
}

// DELETE: Remove a file from Vercel Blob
export async function DELETE(req: NextRequest) {
  const { key } = await req.json();
  if (!key) {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 });
  }

  await deleteFromBlob(key);
  return NextResponse.json({ success: true });
}
