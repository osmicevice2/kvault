import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const tags = db.prepare(`
      SELECT t.*, COUNT(pt.photo_id) as photo_count
      FROM tags t
      LEFT JOIN photo_tags pt ON pt.tag_id = t.id
      GROUP BY t.id
      ORDER BY t.name
    `).all();
    return res.status(200).json(tags);
  }

  if (req.method === 'POST') {
    const { name } = req.body;
    if (!name || typeof name !== 'string') return res.status(400).json({ error: 'Name required' });
    try {
      const result = db.prepare('INSERT INTO tags (name) VALUES (?)').run(name.trim());
      const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(result.lastInsertRowid);
      return res.status(201).json(tag);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error';
      if (msg.includes('UNIQUE')) return res.status(400).json({ error: 'Tag already exists' });
      return res.status(500).json({ error: msg });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end();
}
