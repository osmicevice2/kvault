import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import PhotoGrid from '@/components/PhotoGrid';
import PhotoModal from '@/components/PhotoModal';
import { Group, Idol, Photo } from '@/types';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

export default function IdolDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { showToast } = useToast();
  const [idol, setIdol] = useState<Idol | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selected, setSelected] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/idols/${id}`)
      .then(r => r.json())
      .then(data => {
        setIdol(data.idol);
        setGroups(data.groups || []);
        setPhotos(data.photos || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm('Delete this idol?')) return;
    const res = await fetch(`/api/idols/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Idol deleted', 'success');
      router.push('/idols');
    } else {
      showToast('Failed to delete', 'error');
    }
  }

  if (loading) return <Layout><div style={{ color: 'var(--text-muted)' }}>Loading...</div></Layout>;
  if (!idol) return <Layout><div>Idol not found</div></Layout>;

  return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 28 }}>
        <div style={{
          width: 100, height: 100, borderRadius: '50%', background: 'var(--primary-gradient)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, flexShrink: 0,
          border: '3px solid rgba(233, 30, 140, 0.2)',
        }}>
          ⭐
        </div>
        <div style={{ flex: 1 }}>
          <h1 className="page-title" style={{ marginBottom: 4 }}>{idol.name}</h1>
          {groups.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {groups.map(g => <span key={g.id} className="tag-badge">{g.name}</span>)}
            </div>
          )}
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>{photos.length} photos</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/idols"><button className="btn btn-secondary">← Back</button></Link>
            <button className="btn btn-danger" onClick={handleDelete}>Delete Idol</button>
          </div>
        </div>
      </div>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 12 }}>Photos</h2>
      <PhotoGrid photos={photos} onPhotoClick={setSelected} />

      <PhotoModal
        photo={selected}
        onClose={() => setSelected(null)}
        onDeleted={photoId => setPhotos(prev => prev.filter(p => p.id !== photoId))}
        onUpdated={updated => setPhotos(prev => prev.map(p => p.id === updated.id ? updated : p))}
      />
    </Layout>
  );
}
