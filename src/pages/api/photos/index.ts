import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import db from '@/lib/db';
import { ensureDataDir, getPhotosDir } from '@/lib/helpers';

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { groupId, idolId, tagId, search, page = '1', limit = '24' } = req.query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const offset = (pageNum - 1) * limitNum;

    const joins: string[] = [];
    const where: string[] = [];
    const params: unknown[] = [];

    if (groupId) {
      joins.push('JOIN photo_groups pg ON pg.photo_id = p.id');
      where.push('pg.group_id = ?');
      params.push(Number(groupId));
    }
    if (idolId) {
      joins.push('JOIN photo_idols pi ON pi.photo_id = p.id');
      where.push('pi.idol_id = ?');
      params.push(Number(idolId));
    }
    if (tagId) {
      joins.push('JOIN photo_tags pt ON pt.photo_id = p.id');
      where.push('pt.tag_id = ?');
      params.push(Number(tagId));
    }
    if (search && typeof search === 'string') {
      where.push('(p.title LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const joinClause = joins.length ? ' ' + joins.join(' ') : '';
    const whereClause = where.length ? ' WHERE ' + where.join(' AND ') : '';

    const baseQuery = `SELECT DISTINCT p.* FROM photos p${joinClause}${whereClause}`;
    const countQuery = `SELECT COUNT(DISTINCT p.id) as cnt FROM photos p${joinClause}${whereClause}`;

    const countRow = db.prepare(countQuery).get(...params) as { cnt: number };
    const total = countRow.cnt;

    const dataQuery = baseQuery + ' ORDER BY p.upload_date DESC LIMIT ? OFFSET ?';
    const photos = db.prepare(dataQuery).all(...params, limitNum, offset) as Array<Record<string, unknown> & { id: number }>;

    const enriched = photos.map(photo => {
      const tags = db.prepare('SELECT t.* FROM tags t JOIN photo_tags pt ON pt.tag_id = t.id WHERE pt.photo_id = ?').all(photo.id);
      const groups = db.prepare('SELECT g.* FROM groups g JOIN photo_groups pg ON pg.group_id = g.id WHERE pg.photo_id = ?').all(photo.id);
      const idols = db.prepare('SELECT i.* FROM idols i JOIN photo_idols pi ON pi.idol_id = i.id WHERE pi.photo_id = ?').all(photo.id);
      return { ...photo, tags, groups, idols };
    });

    return res.status(200).json({ photos: enriched, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  }

  if (req.method === 'POST') {
    ensureDataDir();
    const form = formidable({ uploadDir: getPhotosDir(), keepExtensions: true });
    try {
      const [fields, files] = await form.parse(req);
      const fileArr = files.file;
      if (!fileArr || fileArr.length === 0) return res.status(400).json({ error: 'No file' });
      const file = fileArr[0];
      const ext = path.extname(file.originalFilename || '').toLowerCase() || '.jpg';
      const filename = uuidv4() + ext;
      const dest = path.join(getPhotosDir(), filename);
      fs.renameSync(file.filepath, dest);

      const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
      const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
      const groupIdsRaw = Array.isArray(fields.groupIds) ? fields.groupIds[0] : fields.groupIds;
      const idolIdsRaw = Array.isArray(fields.idolIds) ? fields.idolIds[0] : fields.idolIds;
      const tagsRaw = Array.isArray(fields.tags) ? fields.tags[0] : fields.tags;

      const groupIds: number[] = groupIdsRaw ? JSON.parse(groupIdsRaw) : [];
      const idolIds: number[] = idolIdsRaw ? JSON.parse(idolIdsRaw) : [];
      const tagNames: string[] = tagsRaw ? JSON.parse(tagsRaw) : [];

      const result = db.prepare(
        'INSERT INTO photos (title, description, filename, original_name, mime_type, size) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(title || null, description || null, filename, file.originalFilename, file.mimetype, file.size);

      const photoId = result.lastInsertRowid;

      const insertPhotoGroup = db.prepare('INSERT OR IGNORE INTO photo_groups (photo_id, group_id) VALUES (?, ?)');
      const insertPhotoIdol = db.prepare('INSERT OR IGNORE INTO photo_idols (photo_id, idol_id) VALUES (?, ?)');
      const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)');
      const insertPhotoTag = db.prepare('INSERT OR IGNORE INTO photo_tags (photo_id, tag_id) VALUES (?, ?)');

      db.transaction(() => {
        for (const gid of groupIds) insertPhotoGroup.run(photoId, gid);
        for (const iid of idolIds) insertPhotoIdol.run(photoId, iid);
        for (const tagName of tagNames) {
          insertTag.run(tagName);
          const tag = db.prepare('SELECT id FROM tags WHERE name = ?').get(tagName) as { id: number };
          insertPhotoTag.run(photoId, tag.id);
        }
      })();

      const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(photoId);
      return res.status(201).json(photo);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Upload error';
      return res.status(500).json({ error: msg });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end();
}
