import { useEffect, useState } from 'react';
import { FaGlobe, FaSave, FaExternalLinkAlt, FaHistory, FaUndo, FaRedo } from 'react-icons/fa';

import { useEditor } from '../ThemeBuilder/context/EditorContext';
import { useWebBuilder } from './hooks/useWebBuilder';
import { WebPagesPanel } from './panels/WebPagesPanel';
import { WebSeoPanel } from './panels/WebSeoPanel';
import { WebBacklinksPanel } from './panels/WebBacklinksPanel';
import { WebVersionHistoryPanel } from './panels/WebVersionHistoryPanel';
import { ComponentsPanel } from '../ThemeBuilder/panels/ComponentsPanel';
import { LayersPanel } from '../ThemeBuilder/panels/LayersPanel';
import { PropertiesPanel } from '../ThemeBuilder/panels/PropertiesPanel';
import { EditorCanvas } from '../ThemeBuilder/canvas/EditorCanvas';
import { Modal } from '../../shared/ui/Modal/Modal';
import styles from '../ThemeBuilder/ThemeEditor.module.css';

function WebBuilderEditorInner() {
  const { state, dispatch } = useEditor();
  const { loadPages, saveAll } = useWebBuilder();
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const canUndo = state._past.length > 0;
  const canRedo = state._future.length > 0;

  useEffect(() => {
    void loadPages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state.isLoading) {
    return <div className={styles.loading}>Yükleniyor...</div>;
  }

  return (
    <div className={styles.editor}>
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <div className={styles.topBar}>
        <div className={styles.titleGroup}>
          <FaGlobe color="#ec4899" />
          <span>Web Builder</span>
        </div>

        <div className={styles.topActions}>
          {state.isDirty && <div className={styles.dirtyDot} title="Kaydedilmemiş değişiklikler" />}

          <button
            className={styles.undoRedoBtn}
            onClick={() => dispatch({ type: 'UNDO' })}
            disabled={!canUndo}
            title="Geri Al (Ctrl+Z)"
            type="button"
          >
            <FaUndo />
          </button>
          <button
            className={styles.undoRedoBtn}
            onClick={() => dispatch({ type: 'REDO' })}
            disabled={!canRedo}
            title="Yeniden Yap (Ctrl+Y)"
            type="button"
          >
            <FaRedo />
          </button>

          <button
            className={styles.historyBtn}
            onClick={() => setVersionModalOpen(true)}
            title="Versiyon geçmişi"
            type="button"
          >
            <FaHistory /> Geçmiş
          </button>

          <a
            className={styles.previewBtn}
            href={`/corp/${state.activePage?.slug ?? ''}`}
            target="_blank"
            rel="noreferrer"
          >
            <FaExternalLinkAlt /> Önizle
          </a>

          <button
            className={styles.saveBtn}
            onClick={() => void saveAll()}
            disabled={state.isSaving}
            type="button"
          >
            <FaSave /> {state.isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      {/* ── 3-Panel Layout ──────────────────────────────────── */}
      <div className={styles.mainArea}>
        {/* Left Sidebar */}
        <div className={styles.sidebarLeft}>
          <div className={styles.leftTabBar}>
            {([['pages', 'Sayfalar'], ['components', 'Bileşenler'], ['layers', 'Katmanlar']] as const).map(([tab, label]) => (
              <button
                key={tab}
                className={`${styles.leftTab} ${state.leftTab === tab ? styles.leftTabActive : ''}`}
                onClick={() => dispatch({ type: 'SET_LEFT_TAB', tab })}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
          <div className={styles.leftContent}>
            {state.leftTab === 'pages' && <WebPagesPanel />}
            {state.leftTab === 'components' && <ComponentsPanel excludeCategories={['commerce']} />}
            {state.leftTab === 'layers' && <LayersPanel />}
          </div>
        </div>

        {/* Center Canvas */}
        <EditorCanvas />

        {/* Right Sidebar */}
        <div className={styles.sidebarRight}>
          <div className={styles.rightTabBar}>
            {([['props', 'Özellikler'], ['seo', 'SEO'], ['backlinks', 'Bağlantılar']] as const).map(([tab, label]) => (
              <button
                key={tab}
                className={`${styles.rightTab} ${state.rightTab === tab ? styles.rightTabActive : ''}`}
                onClick={() => dispatch({ type: 'SET_RIGHT_TAB', tab })}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
          <div className={styles.rightContent}>
            {state.rightTab === 'props' && <PropertiesPanel />}
            {state.rightTab === 'seo' && <WebSeoPanel />}
            {state.rightTab === 'backlinks' && <WebBacklinksPanel />}
          </div>
        </div>
      </div>

      {/* ── Version History Modal ────────────────────────────── */}
      <Modal
        isOpen={versionModalOpen}
        onClose={() => setVersionModalOpen(false)}
        title="Versiyon Geçmişi"
        size="lg"
      >
        <WebVersionHistoryPanel onClose={() => setVersionModalOpen(false)} />
      </Modal>
    </div>
  );
}

export function WebBuilderEditor() {
  return <WebBuilderEditorInner />;
}
