import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import UploadZone from '@/components/UploadZone';
import { Group, Idol, Tag } from '@/types';
import { useRouter } from 'next/router';

export default function Upload() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [idols, setIdols] = useState<Idol[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/groups').then(r => r.json()),
      fetch('/api/idols').then(r => r.json()),
      fetch('/api/tags').then(r => r.json()),
    ]).then(([g, i, t]) => { setGroups(g); setIdols(i); setTags(t); });
  }, []);

  return (
    <Layout>
      <h1 className="page-title">Upload Photos</h1>
      <p className="page-subtitle">Add new photos to your K-pop vault</p>
      <div className="card" style={{ padding: 28 }}>
        <UploadZone
          groups={groups}
          idols={idols}
          tags={tags}
          onUploaded={() => router.push('/photos')}
        />
      </div>
    </Layout>
  );
}
