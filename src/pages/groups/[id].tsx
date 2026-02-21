import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import PhotoGrid from '@/components/PhotoGrid';
import PhotoModal from '@/components/PhotoModal';
import { Group, Idol, Photo } from '@/types';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

export default function GroupDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { showToast } = useToast();
  const [group, setGroup] = useState<Group | null>(null);
  const [idols, setIdols] = useState<Idol[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selected, setSelected] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/groups/${id}`)
      .then(r => r.json())
      .then(data => {
        setGroup(data.group);
        setIdols(data.idols || []);
        setPhotos(data.photos || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm('Delete this group?')) return;
    const res = await fetch(`/api/groups/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Group deleted', 'success');
      router.push('/groups');
    } else {
      showToast('Failed to delete', 'error');
    }
  }

  if (loading) return <Layout><div style={{ color: 'var(--text-muted)' }}>Loading...</div></Layout>;
  if (!group) return <Layout><div>Group not found</div></Layout>;

  return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 28 }}>
        <div style={{
          width: 100, height: 100, borderRadius: '50%', background: 'var(--primary-gradient)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, flexShrink: 0,
          border: '3px solid rgba(233, 30, 140, 0.2)',
        }}>
          🎵
        </div>
        <div style={{ flex: 1 }}>
          <h1 className="page-title" style={{ marginBottom: 4 }}>{group.name}</h1>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>
            {photos.length} photos · {idols.length} idols
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/groups"><button className="btn btn-secondary">← Back</button></Link>
            <button className="btn btn-danger" onClick={handleDelete}>Delete Group</button>
          </div>
        </div>
      </div>

      {idols.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 12 }}>Members</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {idols.map(idol => (
              <Link key={idol.id} href={`/idols/${idol.id}`}>
                <div className="card" style={{ padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>⭐</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{idol.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

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
