import React from 'react';

interface DocMetadataProps {
  owner: string;
  reviewCycle: string;
  status?: string;
}

export default function DocMetadata({ owner, reviewCycle, status = 'published' }: DocMetadataProps) {
  const statusColors: Record<string, string> = {
    published: '#10B981',
    draft: '#F59E0B',
    archived: '#6B7280',
  };

  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      padding: '0.5rem 0',
      marginBottom: '1rem',
      borderBottom: '1px solid var(--ifm-color-emphasis-300)',
      fontSize: '0.85rem',
      color: 'var(--ifm-color-emphasis-600)',
    }}>
      <span>Owner: <strong>{owner}</strong></span>
      <span>Review: <strong>{reviewCycle}</strong></span>
      <span style={{ color: statusColors[status] || statusColors.published }}>
        {status.toUpperCase()}
      </span>
    </div>
  );
}
