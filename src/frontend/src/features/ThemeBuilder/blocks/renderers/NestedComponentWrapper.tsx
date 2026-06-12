import { FaTrash } from 'react-icons/fa';
import { useEditor } from '../../context/EditorContext';
import type { LayoutComponent, ThemeConfig } from '../../../../entities/StorePage/model/types';
import { MiniRenderer } from './MiniRenderer';
import { buildDesignStyles } from './designStyles';
import styles from '../../canvas/EditorCanvas.module.css';

export function NestedComponentWrapper({ comp, theme }: { comp: LayoutComponent; theme: ThemeConfig }) {
  const { state, dispatch } = useEditor();
  const isSelected = state.selectedComponentId === comp.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'SELECT_COMPONENT', id: comp.id });
    dispatch({ type: 'SELECT_ROW', rowId: null });
    dispatch({ type: 'SELECT_COLUMN', rowId: null, columnId: null });
    dispatch({ type: 'SET_RIGHT_TAB', tab: 'props' });
  };

  const designStyles = buildDesignStyles(comp.props);

  return (
    <div
      className={`${styles.nestedWrapper} ${isSelected ? styles.nestedSelected : ''}`}
      onClick={handleClick}
      style={designStyles}
    >
      {isSelected && (
        <div className={styles.nestedToolbar} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={styles.nestedToolbarBtn}
            title="Bileşeni Sil"
            onClick={() => {
              dispatch({ type: 'REMOVE_COMPONENT', componentId: comp.id });
            }}
          >
            <FaTrash size={10} />
          </button>
        </div>
      )}
      <MiniRenderer comp={comp} theme={theme} />
    </div>
  );
}
