import { useEffect, useState } from 'react';
import {
  FaGlobe, FaSave, FaExternalLinkAlt, FaHistory, FaUndo, FaRedo,
  FaChevronLeft, FaChevronRight,
  FaFile, FaPlus, FaLayerGroup,
  FaEdit, FaSearch, FaLink,
} from 'react-icons/fa';

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

const LEFT_TABS = [
  { id: 'pages'      as const, label: 'Sayfalar',   Icon: FaFile       },
  { id: 'components' as const, label: 'Bileşenler', Icon: FaPlus       },
  { id: 'layers'     as const, label: 'Katmanlar',  Icon: FaLayerGroup },
];

const RIGHT_TABS = [
  { id: 'props'      as const, label: 'Özellikler', Icon: FaEdit   },
  { id: 'seo'        as const, label: 'SEO',         Icon: FaSearch },
  { id: 'backlinks'  as const, label: 'Bağlantılar', Icon: FaLink   },
];

function WebBuilderEditorInner() {
  const { state, dispatch } = useEditor();
  const { loadPages, saveAll } = useWebBuilder();
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [leftOpen, setLeftOpen]   = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  const canUndo = state._past.length   > 0;
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

      {/* ── Top Bar ──────────────────────────────────────────── */}
      <div className={styles.topBar}>
        <div className={styles.titleGroup}>
          <FaGlobe color="#ec4899" />
          <span>Web Builder</span>
          {state.activePage && (
            <>
              <span style={{ color: 'var(--editor-border)', fontSize: 14, userSelect: 'none' }}>›</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--editor-text-muted)' }}>
                {state.activePage.title}
              </span>
            </>
          )}
        </div>

        <div className={styles.topActions}>
          {state.isDirty && (
            <div className={styles.dirtyDot} title="Kaydedilmemiş değişiklikler" />
          )}

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

      {/* ── 3-Panel Layout ───────────────────────────────────── */}
      <div className={styles.mainArea}>

        {/* ── Left Sidebar ────────────────────────────────────── */}
        <div className={`${styles.sidebarLeft} ${!leftOpen ? styles.sidebarCollapsed : ''}`}
             style={{ overflowY: 'hidden' }}>
          {/* Tab Bar */}
          <div className={styles.leftTabBar}>
            {LEFT_TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                className={`${styles.leftTab} ${state.leftTab === id ? styles.leftTabActive : ''}`}
                onClick={() => dispatch({ type: 'SET_LEFT_TAB', tab: id })}
                title={label}
                type="button"
              >
                <Icon style={{ fontSize: 11, marginBottom: 2 }} />
                <span>{label}</span>
              </button>
            ))}
          </div>
          {/* Tab Content */}
          <div className={styles.leftContent}>
            {state.leftTab === 'pages'      && <WebPagesPanel />}
            {state.leftTab === 'components' && <ComponentsPanel excludeCategories={['commerce']} />}
            {state.leftTab === 'layers'     && <LayersPanel />}
          </div>
        </div>

        {/* ── Left Toggle ─────────────────────────────────────── */}
        <button
          className={styles.sidebarToggle}
          onClick={() => setLeftOpen(o => !o)}
          title={leftOpen ? 'Sol paneli gizle' : 'Sol paneli göster'}
          type="button"
        >
          {leftOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>

        {/* ── Center Canvas ────────────────────────────────────── */}
        <EditorCanvas />

        {/* ── Right Toggle ────────────────────────────────────── */}
        <button
          className={styles.sidebarToggle}
          onClick={() => setRightOpen(o => !o)}
          title={rightOpen ? 'Sağ paneli gizle' : 'Sağ paneli göster'}
          type="button"
        >
          {rightOpen ? <FaChevronRight /> : <FaChevronLeft />}
        </button>

        {/* ── Right Sidebar ───────────────────────────────────── */}
        <div className={`${styles.sidebarRight} ${!rightOpen ? styles.sidebarCollapsed : ''}`}
             style={{ overflowY: 'hidden' }}>
          {/* Tab Bar */}
          <div className={styles.rightTabBar}>
            {RIGHT_TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                className={`${styles.rightTab} ${state.rightTab === id ? styles.rightTabActive : ''}`}
                onClick={() => dispatch({ type: 'SET_RIGHT_TAB', tab: id })}
                title={label}
                type="button"
              >
                <Icon style={{ fontSize: 11, marginBottom: 2 }} />
                <span>{label}</span>
              </button>
            ))}
          </div>
          {/* Tab Content */}
          <div className={styles.rightContent}>
            {state.rightTab === 'props'     && <PropertiesPanel />}
            {state.rightTab === 'seo'       && <WebSeoPanel />}
            {state.rightTab === 'backlinks' && <WebBacklinksPanel />}
          </div>
        </div>

      </div>

      {/* ── Version History Modal ─────────────────────────────── */}
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
