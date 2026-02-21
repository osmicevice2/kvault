import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';
import fs from 'fs';
import path from 'path';
import { getPhotosDir } from '@/lib/helpers';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const photoId = Number(id);
  if (isNaN(photoId)) return res.status(400).end();

  const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(photoId) as { filename: string; mime_type?: string } | undefined;
  if (!photo) return res.status(404).end();

  const filePath = path.join(getPhotosDir(), photo.filename);
  if (!fs.existsSync(filePath)) return res.status(404).end();

  const ext = path.extname(photo.filename).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.gif': 'image/gif', '.webp': 'image/webp', '.avif': 'image/avif',
  };
  const contentType = photo.mime_type || mimeMap[ext] || 'application/octet-stream';

  const buffer = fs.readFileSync(filePath);
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.status(200).send(buffer);
}
