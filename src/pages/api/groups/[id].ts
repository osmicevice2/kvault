import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const groupId = Number(id);
  if (isNaN(groupId)) return res.status(400).json({ error: 'Invalid id' });

  if (req.method === 'GET') {
    const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId);
    if (!group) return res.status(404).json({ error: 'Not found' });
    const idols = db.prepare(`
      SELECT i.* FROM idols i
      JOIN idol_groups ig ON ig.idol_id = i.id
      WHERE ig.group_id = ?
    `).all(groupId);
    const photos = db.prepare(`
      SELECT p.* FROM photos p
      JOIN photo_groups pg ON pg.photo_id = p.id
      WHERE pg.group_id = ?
      ORDER BY p.upload_date DESC
    `).all(groupId);
    return res.status(200).json({ group, idols, photos });
  }

  if (req.method === 'PUT') {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    db.prepare('UPDATE groups SET name = ? WHERE id = ?').run(name, groupId);
    const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId);
    return res.status(200).json(group);
  }

  if (req.method === 'DELETE') {
    db.prepare('DELETE FROM groups WHERE id = ?').run(groupId);
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end();
}
