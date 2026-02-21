import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const idolId = Number(id);
  if (isNaN(idolId)) return res.status(400).json({ error: 'Invalid id' });

  if (req.method === 'GET') {
    const idol = db.prepare('SELECT * FROM idols WHERE id = ?').get(idolId);
    if (!idol) return res.status(404).json({ error: 'Not found' });
    const groups = db.prepare(`
      SELECT g.* FROM groups g
      JOIN idol_groups ig ON ig.group_id = g.id
      WHERE ig.idol_id = ?
    `).all(idolId);
    const photos = db.prepare(`
      SELECT p.* FROM photos p
      JOIN photo_idols pi ON pi.photo_id = p.id
      WHERE pi.idol_id = ?
      ORDER BY p.upload_date DESC
    `).all(idolId);
    return res.status(200).json({ idol, groups, photos });
  }

  if (req.method === 'PUT') {
    const { name, groupIds } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    db.prepare('UPDATE idols SET name = ? WHERE id = ?').run(name, idolId);
    if (Array.isArray(groupIds)) {
      db.prepare('DELETE FROM idol_groups WHERE idol_id = ?').run(idolId);
      const ins = db.prepare('INSERT OR IGNORE INTO idol_groups (idol_id, group_id) VALUES (?, ?)');
      for (const gid of groupIds) ins.run(idolId, gid);
    }
    const idol = db.prepare('SELECT * FROM idols WHERE id = ?').get(idolId);
    return res.status(200).json(idol);
  }

  if (req.method === 'DELETE') {
    db.prepare('DELETE FROM idols WHERE id = ?').run(idolId);
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end();
}
