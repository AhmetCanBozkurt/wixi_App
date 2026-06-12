import type { BlockRendererProps } from '../renderers/types';
import styles from '../../canvas/EditorCanvas.module.css';

export function HeroSplitPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  return (
    <div className={styles.heroSplitPrev}>
      <div className={styles.heroSplitText}>
        <h3 data-prop-key="subtitle" style={{ color: theme.colors.primary, fontSize: '0.8rem', marginBottom: '4px' }}>
          {p.subtitle as string}
        </h3>
        <h2 data-prop-key="title" style={{ fontSize: '1.2rem', fontWeight: 700 }}>{p.title as string}</h2>
        {!!p.buttonText && (
          <span data-prop-key="buttonText" className={styles.previewBtn} style={{ background: theme.colors.primary }}>
            {p.buttonText as string}
          </span>
        )}
      </div>
      <div
        className={styles.heroSplitImg}
        style={{ background: p.imageUrl ? `url("${p.imageUrl as string}") center/cover` : '#f3f4f6' }}
      />
    </div>
  );
}
