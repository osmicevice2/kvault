import React from 'react';
import { Photo } from '@/types';

interface PhotoCardProps {
  photo: Photo;
  onClick: () => void;
}

export default function PhotoCard({ photo, onClick }: PhotoCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        background: '#f0e0ec',
        border: '1px solid var(--border)',
        transition: 'all 0.2s ease',
        aspectRatio: '4/3',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-lg)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = '';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '';
      }}
    >
      <img
        src={`/api/photos/serve/${photo.id}`}
        alt={photo.title || 'Photo'}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        loading="lazy"
      />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(transparent, rgba(45, 27, 46, 0.8))',
        padding: '20px 10px 10px',
        transform: 'translateY(100%)',
        transition: 'transform 0.2s ease',
      }} className="photo-overlay">
        {photo.title && (
          <div style={{ color: 'white', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{photo.title}</div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {photo.tags?.slice(0, 3).map(t => (
            <span key={t.id} style={{ background: 'rgba(233,30,140,0.7)', color: 'white', fontSize: 10, padding: '2px 6px', borderRadius: 10 }}>{t.name}</span>
          ))}
        </div>
      </div>
      <style>{`.photo-card:hover .photo-overlay { transform: translateY(0); }`}</style>
    </div>
  );
}
