import React from 'react';
import type { ReportElement, ReportElementType } from '../types';
import { EyeIcon, EyeOffIcon } from './icons';

interface ReportExplorerProps {
  elements: ReportElement[];
  selectedElement: ReportElement | null;
  onSelect: (el: ReportElement) => void;
  onVisibilityToggle: (id: string) => void;
}

const TYPE_EMOJI: Record<ReportElementType, string> = {
  text: '📝',
  table: '📋',
  line: '📏',
  logo: '🖼️',
  barcode: '📊',
  variable: '🔤',
  image: '🖼️',
  shape: '⬜',
  chart: '📈',
  checkbox: '☑️',
  panel: '▭',
  pageInfo: '📄',
  richText: '📃',
};

const ReportExplorer: React.FC<ReportExplorerProps> = ({
  elements,
  selectedElement,
  onSelect,
  onVisibilityToggle,
}) => {
  return (
    <div style={{ padding: '8px 0' }}>
      <div
        style={{
          padding: '4px 12px 6px',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
        }}
      >
        📄 Rapor
      </div>

      {elements.length === 0 && (
        <div
          style={{
            padding: '6px 20px',
            fontSize: '11px',
            color: 'var(--text-muted)',
            fontStyle: 'italic',
          }}
        >
          Henüz öğe eklenmedi
        </div>
      )}

      {elements.map(el => {
        const isSelected = selectedElement?.id === el.id;
        const isHidden = (el.style.opacity ?? 1) === 0;
        const label = `${TYPE_EMOJI[el.type] ?? '▪'} ${el.content.substring(0, 20) || el.type}`;

        return (
          <div
            key={el.id}
            onClick={() => onSelect(el)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 12px 4px 20px',
              cursor: 'pointer',
              borderRadius: 4,
              margin: '1px 4px',
              background: isSelected ? 'var(--color-primary)22' : 'transparent',
              color: isSelected ? 'var(--color-primary)' : isHidden ? 'var(--text-muted)' : 'var(--text-secondary)',
              fontSize: '11px',
              opacity: isHidden ? 0.5 : 1,
              transition: 'background 0.1s',
            }}
          >
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}
              title={el.content || el.type}
            >
              {label}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVisibilityToggle(el.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                color: isHidden ? 'var(--text-muted)' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
              }}
              title={isHidden ? 'Göster' : 'Gizle'}
            >
              {isHidden
                ? <EyeOffIcon size={12} />
                : <EyeIcon size={12} />
              }
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ReportExplorer;
