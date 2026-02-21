import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const tagId = Number(id);
  if (isNaN(tagId)) return res.status(400).json({ error: 'Invalid id' });

  if (req.method === 'DELETE') {
    db.prepare('DELETE FROM tags WHERE id = ?').run(tagId);
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', ['DELETE']);
  res.status(405).end();
}
