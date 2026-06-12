import { useEditor } from '../../context/EditorContext';
import type { BlockRendererProps } from '../renderers/types';
import { NestedComponentWrapper } from '../renderers/NestedComponentWrapper';

export function GridColumnPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  const { dispatch } = useEditor();
  const children = comp.children ?? [];
  const span = Number(p.span ?? 6);
  return (
    <div
      style={{
        gridColumn: `span ${span}`,
        minHeight: '40px',
        border: '1px dashed rgba(255,255,255,0.08)',
        padding: '8px',
      }}
    >
      {children.length > 0 ? (
        children.map(child => (
          <NestedComponentWrapper key={child.id} comp={child} theme={theme} />
        ))
      ) : (
        <div
          style={{ padding: '8px', textAlign: 'center', color: theme.colors.textMuted, fontSize: '0.75rem', cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: 'SELECT_COMPONENT', id: comp.id });
            dispatch({ type: 'SET_LEFT_TAB', tab: 'components' });
          }}
        >
          Kolon (Seçip bileşen ekleyin)
        </div>
      )}
    </div>
  );
}
