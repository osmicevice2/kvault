import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const idols = db.prepare(`
      SELECT i.*,
        COUNT(DISTINCT pi.photo_id) as photo_count
      FROM idols i
      LEFT JOIN photo_idols pi ON pi.idol_id = i.id
      GROUP BY i.id
      ORDER BY i.name
    `).all() as Array<Record<string, unknown> & { id: number }>;

    const result = idols.map(idol => {
      const groups = db.prepare(`
        SELECT g.* FROM groups g
        JOIN idol_groups ig ON ig.group_id = g.id
        WHERE ig.idol_id = ?
      `).all(idol.id);
      return { ...idol, groups };
    });

    return res.status(200).json(result);
  }

  if (req.method === 'POST') {
    const { name, groupIds } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required' });
    }
    try {
      const result = db.prepare('INSERT INTO idols (name) VALUES (?)').run(name.trim());
      const idolId = result.lastInsertRowid;
      if (Array.isArray(groupIds) && groupIds.length > 0) {
        const insertGroup = db.prepare('INSERT OR IGNORE INTO idol_groups (idol_id, group_id) VALUES (?, ?)');
        for (const gid of groupIds) {
          insertGroup.run(idolId, gid);
        }
      }
      const idol = db.prepare('SELECT * FROM idols WHERE id = ?').get(idolId);
      return res.status(201).json(idol);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      return res.status(500).json({ error: msg });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end();
}
