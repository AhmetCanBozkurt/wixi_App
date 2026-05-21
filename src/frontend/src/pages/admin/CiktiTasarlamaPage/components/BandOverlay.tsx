import React from 'react';

interface BandSection {
  label: string;
  height: number | 'flex';
  color: string;
}

const BANDS: BandSection[] = [
  { label: 'Rapor Başlığı', height: 60, color: '#6366f1' },
  { label: 'Sayfa Başlığı', height: 40, color: '#0ea5e9' },
  { label: 'Detay', height: 120, color: '#10b981' },
  { label: 'Sayfa Altbilgisi', height: 40, color: '#f59e0b' },
  { label: 'Rapor Altbilgisi', height: 60, color: '#ef4444' },
];

const BandOverlay: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '72px',
        pointerEvents: 'none',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {BANDS.map((band) => (
        <div
          key={band.label}
          style={{
            height: typeof band.height === 'number' ? `${band.height}px` : undefined,
            flex: band.height === 'flex' ? 1 : undefined,
            borderTop: `2px solid ${band.color}`,
            borderRight: `2px solid ${band.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${band.color}18`,
          }}
        >
          <span
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: band.color,
              textTransform: 'uppercase',
              userSelect: 'none',
              opacity: 0.85,
            }}
          >
            {band.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default BandOverlay;
