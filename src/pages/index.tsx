import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { Photo } from '@/types';

interface Stats {
  photos: number;
  groups: number;
  idols: number;
  tags: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats>({ photos: 0, groups: 0, idols: 0, tags: 0 });
  const [recent, setRecent] = useState<Photo[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/photos?limit=6').then(r => r.json()),
      fetch('/api/groups').then(r => r.json()),
      fetch('/api/idols').then(r => r.json()),
      fetch('/api/tags').then(r => r.json()),
    ]).then(([photosData, groups, idols, tags]) => {
      setStats({
        photos: photosData.total || 0,
        groups: groups.length || 0,
        idols: idols.length || 0,
        tags: tags.length || 0,
      });
      setRecent(photosData.photos || []);
    }).catch(console.error);
  }, []);

  const statCards = [
    { label: 'Photos', value: stats.photos, icon: '📸', href: '/photos', color: '#E91E8C' },
    { label: 'Groups', value: stats.groups, icon: '🎵', href: '/groups', color: '#9C27B0' },
    { label: 'Idols', value: stats.idols, icon: '⭐', href: '/idols', color: '#FF6B9D' },
    { label: 'Tags', value: stats.tags, icon: '🏷️', href: '/tags', color: '#E040FB' },
  ];

  return (
    <Layout>
      <h1 className="page-title">Welcome to KVault 💗</h1>
      <p className="page-subtitle">Your personal K-pop photo collection</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {statCards.map(card => (
          <Link key={card.label} href={card.href}>
            <div className="card" style={{ padding: 20, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-lg)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)', color: card.color }}>{card.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {recent.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Recent Photos</h2>
            <Link href="/photos" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>View all →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {recent.map(photo => (
              <Link key={photo.id} href="/photos">
                <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', aspectRatio: '4/3', background: '#f0e0ec' }}>
                  <img src={`/api/photos/serve/${photo.id}`} alt={photo.title || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {recent.length === 0 && (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 8 }}>Start your collection</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 14 }}>Upload your first K-pop photos to get started</p>
          <Link href="/upload">
            <button className="btn btn-primary">Upload Photos</button>
          </Link>
        </div>
      )}
    </Layout>
  );
}
