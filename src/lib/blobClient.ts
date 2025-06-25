import { put, del } from '@vercel/blob';
import crypto from 'crypto';

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN!;

// Upload a File object to Vercel Blob under uploads/
export async function uploadToBlob(file: File): Promise<{ url: string }> {
  // read file data
  const buf = Buffer.from(await file.arrayBuffer());

  // compute a hash‐name to dedupe
  const hash = crypto.createHash('sha256').update(buf).digest('hex');
  const ext = file.name.split('.').pop();
  const key = `uploads/${hash}.${ext}`;

  // send to blob
  const { url } = await put(key, buf, {
    access: 'public',
    token: TOKEN,
    metadata: { originalName: file.name },
  });
  return { url };
}

// Delete a blob by its stored key (e.g. 'uploads/…')
export async function deleteFromBlob(key: string): Promise<void> {
  await del(key, { token: TOKEN });
}
