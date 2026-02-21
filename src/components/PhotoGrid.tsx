import React from 'react';
import { Photo } from '@/types';
import PhotoCard from './PhotoCard';

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
  loading?: boolean;
}

export default function PhotoGrid({ photos, onPhotoClick, loading }: PhotoGridProps) {
  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{
            borderRadius: 'var(--radius-lg)', background: 'var(--bg-secondary)',
            aspectRatio: '4/3', animation: 'pulse 1.5s infinite',
          }} />
        ))}
        <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }`}</style>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon">📸</div>
        <h3>No photos yet</h3>
        <p>Upload your first K-pop photo!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
      {photos.map(photo => (
        <PhotoCard key={photo.id} photo={photo} onClick={() => onPhotoClick(photo)} />
      ))}
    </div>
  );
}
