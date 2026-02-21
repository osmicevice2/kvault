export interface Group {
  id: number;
  name: string;
  image_path?: string | null;
  created_at: string;
  photo_count?: number;
  idol_count?: number;
}

export interface Idol {
  id: number;
  name: string;
  profile_image_path?: string | null;
  created_at: string;
  groups?: Group[];
  photo_count?: number;
}

export interface Tag {
  id: number;
  name: string;
  photo_count?: number;
}

export interface Photo {
  id: number;
  title?: string | null;
  description?: string | null;
  filename: string;
  original_name?: string | null;
  mime_type?: string | null;
  size?: number | null;
  upload_date: string;
  tags?: Tag[];
  groups?: Group[];
  idols?: Idol[];
}

export interface SearchResults {
  groups: Group[];
  idols: Idol[];
  photos: Photo[];
  tags: Tag[];
}

export interface PaginatedPhotos {
  photos: Photo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
