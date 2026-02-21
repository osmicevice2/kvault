import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  const { q } = req.query;
  if (!q || typeof q !== 'string') return res.status(400).json({ error: 'Query required' });
  const like = `%${q}%`;

  const groups = db.prepare('SELECT * FROM groups WHERE name LIKE ? LIMIT 5').all(like);
  const idols = db.prepare('SELECT * FROM idols WHERE name LIKE ? LIMIT 5').all(like);
  const photos = db.prepare('SELECT * FROM photos WHERE title LIKE ? OR description LIKE ? LIMIT 10').all(like, like);
  const tags = db.prepare('SELECT * FROM tags WHERE name LIKE ? LIMIT 5').all(like);

  return res.status(200).json({ groups, idols, photos, tags });
}
