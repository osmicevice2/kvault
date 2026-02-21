import React, { useEffect, useState, useCallback } from 'react';
import Layout from '@/components/Layout';
import PhotoGrid from '@/components/PhotoGrid';
import PhotoModal from '@/components/PhotoModal';
import FilterBar from '@/components/FilterBar';
import SearchBar from '@/components/SearchBar';
import { Photo, Group, Idol, Tag } from '@/types';

export default function Photos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Photo | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [idols, setIdols] = useState<Idol[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [groupId, setGroupId] = useState<number>();
  const [idolId, setIdolId] = useState<number>();
  const [tagId, setTagId] = useState<number>();
  const [search, setSearch] = useState('');
  const limit = 24;

  useEffect(() => {
    Promise.all([
      fetch('/api/groups').then(r => r.json()),
      fetch('/api/idols').then(r => r.json()),
      fetch('/api/tags').then(r => r.json()),
    ]).then(([g, i, t]) => { setGroups(g); setIdols(i); setTags(t); });
  }, []);

  const fetchPhotos = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (groupId) params.set('groupId', String(groupId));
    if (idolId) params.set('idolId', String(idolId));
    if (tagId) params.set('tagId', String(tagId));
    if (search) params.set('search', search);
    fetch(`/api/photos?${params}`)
      .then(r => r.json())
      .then(data => { setPhotos(data.photos || []); setTotal(data.total || 0); setLoading(false); })
      .catch(() => setLoading(false));
  }, [page, groupId, idolId, tagId, search, limit]);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  function handleReset() {
    setGroupId(undefined);
    setIdolId(undefined);
    setTagId(undefined);
    setSearch('');
    setPage(1);
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <Layout>
      <h1 className="page-title">Photos</h1>
      <p className="page-subtitle">{total} photo{total !== 1 ? 's' : ''} in your vault</p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search photos..." />
        </div>
        <FilterBar
          groups={groups} idols={idols} tags={tags}
          groupId={groupId} idolId={idolId} tagId={tagId}
          onGroupChange={id => { setGroupId(id); setPage(1); }}
          onIdolChange={id => { setIdolId(id); setPage(1); }}
          onTagChange={id => { setTagId(id); setPage(1); }}
          onReset={handleReset}
        />
      </div>

      <PhotoGrid photos={photos} onPhotoClick={setSelected} loading={loading} />

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          <button className="btn btn-secondary" onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            Page {page} of {totalPages}
          </span>
          <button className="btn btn-secondary" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next →</button>
        </div>
      )}

      <PhotoModal
        photo={selected}
        onClose={() => setSelected(null)}
        onDeleted={id => { setPhotos(prev => prev.filter(p => p.id !== id)); setTotal(t => t - 1); }}
        onUpdated={updated => setPhotos(prev => prev.map(p => p.id === updated.id ? updated : p))}
      />
    </Layout>
  );
}
