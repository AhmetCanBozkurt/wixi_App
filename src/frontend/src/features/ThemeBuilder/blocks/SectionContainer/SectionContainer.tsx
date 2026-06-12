import { useEditor } from '../../context/EditorContext';
import type { BlockRendererProps } from '../renderers/types';
import { NestedComponentWrapper } from '../renderers/NestedComponentWrapper';

export function SectionContainerPreview({ comp, theme }: BlockRendererProps) {
  const p = comp.props;
  const { dispatch } = useEditor();
  const children = comp.children ?? [];
  return (
    <div
      style={{
        paddingTop: p.paddingY ? String(p.paddingY) : '20px',
        paddingBottom: p.paddingY ? String(p.paddingY) : '20px',
        paddingLeft: p.paddingX ? String(p.paddingX) : '20px',
        paddingRight: p.paddingX ? String(p.paddingX) : '20px',
        backgroundColor: (p.backgroundColor as string) || 'transparent',
        borderRadius: p.borderRadius ? String(p.borderRadius) : '8px',
        border: `1px dashed ${theme.colors.border}`,
        minHeight: '80px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {children.length > 0 ? (
        children.map(child => (
          <NestedComponentWrapper key={child.id} comp={child} theme={theme} />
        ))
      ) : (
        <div
          style={{ padding: '20px', textAlign: 'center', color: theme.colors.textMuted, fontSize: '0.8rem', cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: 'SELECT_COMPONENT', id: comp.id });
            dispatch({ type: 'SET_LEFT_TAB', tab: 'components' });
          }}
        >
          Kapsayıcı Kutu (Seçip bileşen ekleyin)
        </div>
      )}
    </div>
  );
}
