import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const groups = db.prepare(`
      SELECT g.*,
        COUNT(DISTINCT pg.photo_id) as photo_count,
        COUNT(DISTINCT ig.idol_id) as idol_count
      FROM groups g
      LEFT JOIN photo_groups pg ON pg.group_id = g.id
      LEFT JOIN idol_groups ig ON ig.group_id = g.id
      GROUP BY g.id
      ORDER BY g.name
    `).all();
    return res.status(200).json(groups);
  }

  if (req.method === 'POST') {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required' });
    }
    try {
      const result = db.prepare('INSERT INTO groups (name) VALUES (?)').run(name.trim());
      const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(result.lastInsertRowid);
      return res.status(201).json(group);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      if (msg.includes('UNIQUE')) return res.status(400).json({ error: 'Group already exists' });
      return res.status(500).json({ error: msg });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end();
}
