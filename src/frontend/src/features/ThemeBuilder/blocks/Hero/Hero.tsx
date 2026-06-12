import type { BlockRendererProps } from '../renderers/types';
import styles from '../../canvas/EditorCanvas.module.css';

export function HeroPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  return (
    <div
      className={styles.heroPreview}
      style={{
        height: '220px',
        backgroundImage: p.imageUrl ? `url("${p.imageUrl as string}")` : 'none',
        background: p.imageUrl ? undefined : 'linear-gradient(135deg, #1e293b, #0f172a)',
      }}
    >
      <div className={styles.heroOverlayPrev} style={{ background: `rgba(0,0,0,${p.overlayOpacity ?? 0.4})` }}>
        <h2 data-prop-key="title" style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>
          {p.title as string}
        </h2>
        {!!p.subtitle && (
          <p data-prop-key="subtitle" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
            {p.subtitle as string}
          </p>
        )}
        {!!p.buttonText && (
          <span data-prop-key="buttonText" className={styles.previewBtn} style={{ background: theme.colors.primary }}>
            {p.buttonText as string}
          </span>
        )}
      </div>
    </div>
  );
}
