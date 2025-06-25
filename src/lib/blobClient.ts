import { put, del } from '@vercel/blob';
import crypto from 'crypto';

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN!;

// Upload a File object to Vercel Blob under uploads/
export async function uploadToBlob(file: File): Promise<{ url: string }> {
  const buf = Buffer.from(await file.arrayBuffer());
  const hash = crypto.createHash('sha256').update(buf).digest('hex');
  const ext = file.name.split('.').pop();
  const key = `uploads/${hash}.${ext}`;

  try {
    const { url } = await put(key, buf, {
      access: 'public',
      token: TOKEN,
    });
    return { url };
  } catch (err: unknown) {
    // If the error says "already exists", reconstruct the URL and return it
    if (err instanceof Error && err.message.includes('This blob already exists')) {
      // Construct the public URL based on your blob storage domain
      const url = `https://lzj8oxh8diwkqpgg.public.blob.vercel-storage.com/${key}`;
      return { url };
    }
    throw err;
  }
}

// Delete a blob by its stored key (e.g. 'uploads/…')
export async function deleteFromBlob(key: string): Promise<void> {
  await del(key, { token: TOKEN });
}
