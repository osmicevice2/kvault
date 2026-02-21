import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';
import fs from 'fs';
import path from 'path';
import { getPhotosDir } from '@/lib/helpers';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const photoId = Number(id);
  if (isNaN(photoId)) return res.status(400).json({ error: 'Invalid id' });

  if (req.method === 'GET') {
    const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(photoId) as (Record<string, unknown> & { id: number }) | undefined;
    if (!photo) return res.status(404).json({ error: 'Not found' });
    const tags = db.prepare('SELECT t.* FROM tags t JOIN photo_tags pt ON pt.tag_id = t.id WHERE pt.photo_id = ?').all(photoId);
    const groups = db.prepare('SELECT g.* FROM groups g JOIN photo_groups pg ON pg.group_id = g.id WHERE pg.photo_id = ?').all(photoId);
    const idols = db.prepare('SELECT i.* FROM idols i JOIN photo_idols pi ON pi.idol_id = i.id WHERE pi.photo_id = ?').all(photoId);
    return res.status(200).json({ ...photo, tags, groups, idols });
  }

  if (req.method === 'PUT') {
    const { title, description } = req.body;
    db.prepare('UPDATE photos SET title = ?, description = ? WHERE id = ?').run(title || null, description || null, photoId);
    const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(photoId) as (Record<string, unknown> & { id: number }) | undefined;
    if (!photo) return res.status(404).json({ error: 'Not found' });
    const tags = db.prepare('SELECT t.* FROM tags t JOIN photo_tags pt ON pt.tag_id = t.id WHERE pt.photo_id = ?').all(photoId);
    const groups = db.prepare('SELECT g.* FROM groups g JOIN photo_groups pg ON pg.group_id = g.id WHERE pg.photo_id = ?').all(photoId);
    const idols = db.prepare('SELECT i.* FROM idols i JOIN photo_idols pi ON pi.idol_id = i.id WHERE pi.photo_id = ?').all(photoId);
    return res.status(200).json({ ...photo, tags, groups, idols });
  }

  if (req.method === 'DELETE') {
    const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(photoId) as { filename: string } | undefined;
    if (!photo) return res.status(404).json({ error: 'Not found' });
    try {
      const filePath = path.join(getPhotosDir(), photo.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch { /* ignore */ }
    db.prepare('DELETE FROM photos WHERE id = ?').run(photoId);
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end();
}
