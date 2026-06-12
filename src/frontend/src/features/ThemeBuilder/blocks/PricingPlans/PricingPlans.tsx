import { useEditor } from '../../context/EditorContext';
import type { BlockRendererProps } from '../renderers/types';

export function PricingPlansPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  const { state } = useEditor();
  const { viewport } = state;
  const plans = (p.plans as { name: string; price: string; currency: string; highlighted?: boolean; badge?: string }[]) ?? [];
  const colsCount = viewport === 'mobile' ? 1 : viewport === 'tablet' ? 2 : Math.min(plans.length, 3);
  return (
    <div style={{ padding: '16px' }}>
      <h3 data-prop-key="title" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', textAlign: 'center', color: theme.colors.text }}>{p.title as string}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colsCount}, 1fr)`, gap: '8px' }}>
        {plans.slice(0, 3).map((pl, i) => (
          <div key={i} style={{ background: theme.colors.surface, borderRadius: theme.borderRadius.card, border: `2px solid ${pl.highlighted ? theme.colors.primary : theme.colors.border}`, padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.colors.text, marginBottom: '6px' }}>{pl.name}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: theme.colors.primary }}>{pl.currency}{pl.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
