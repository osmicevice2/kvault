import fs from 'fs';
import path from 'path';

export function ensureDataDir(): void {
  const DATA_DIR = process.env.DATA_DIR || './data';
  const photosDir = path.join(DATA_DIR, 'photos');
  if (!fs.existsSync(photosDir)) {
    fs.mkdirSync(photosDir, { recursive: true });
  }
}

export function getDataDir(): string {
  return process.env.DATA_DIR || './data';
}

export function getPhotosDir(): string {
  return path.join(getDataDir(), 'photos');
}
