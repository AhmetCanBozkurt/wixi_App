import { useEffect, useState } from 'react';
import {
  FaGlobe, FaSave, FaExternalLinkAlt, FaHistory, FaUndo, FaRedo,
  FaChevronLeft, FaChevronRight,
  FaFile, FaPlus, FaLayerGroup,
  FaEdit, FaSearch, FaLink, FaPalette
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
import { DesignPanel } from './panels/DesignPanel';
import { EditorCanvas } from '../ThemeBuilder/canvas/EditorCanvas';
import { Modal } from '../../shared/ui/Modal/Modal';
import styles from '../ThemeBuilder/ThemeEditor.module.css';

function WebBuilderEditorInner() {
  const { state, dispatch } = useEditor();
  const { loadPages, saveAll } = useWebBuilder();
  const activeTenantSlug = localStorage.getItem('wixi-active-tenant') ?? '';
  const previewHref = state.activePage && activeTenantSlug
    ? `/corp/${activeTenantSlug}/${state.activePage.slug}`
    : undefined;
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  const canUndo = state._past.length > 0;
  const canRedo = state._future.length > 0;

  useEffect(() => {
    void loadPages();
    // Default left and right tabs for Wixi
    dispatch({ type: 'SET_LEFT_TAB', tab: 'components' });
    dispatch({ type: 'SET_RIGHT_TAB', tab: 'design' });
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

          {previewHref ? (
            <a
              className={styles.previewBtn}
              href={previewHref}
              target="_blank"
              rel="noreferrer"
              title={`Önizle: ${previewHref}`}
            >
              <FaExternalLinkAlt /> Önizle
            </a>
          ) : (
            <span
              className={styles.previewBtn}
              style={{ opacity: 0.4, cursor: 'not-allowed' }}
              title="Önizlemek için /corp/builder/{tenantSlug} URL'sini kullanın"
            >
              <FaExternalLinkAlt /> Önizle
            </span>
          )}

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

        {/* ── Left Sidebar — Tabbed Panel ────────────────────────── */}
        <div className={`${styles.sidebarLeft} ${!leftOpen ? styles.sidebarCollapsed : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
          <div className={styles.leftTabBar}>
            <button
              type="button"
              className={`${styles.leftTab} ${state.leftTab === 'pages' ? styles.leftTabActive : ''}`}
              onClick={() => dispatch({ type: 'SET_LEFT_TAB', tab: 'pages' })}
            >
              <FaFile size={11} />
              <span>Sayfalar</span>
            </button>
            <button
              type="button"
              className={`${styles.leftTab} ${state.leftTab === 'layers' ? styles.leftTabActive : ''}`}
              onClick={() => dispatch({ type: 'SET_LEFT_TAB', tab: 'layers' })}
            >
              <FaLayerGroup size={11} />
              <span>Katmanlar</span>
            </button>
            <button
              type="button"
              className={`${styles.leftTab} ${state.leftTab === 'components' ? styles.leftTabActive : ''}`}
              onClick={() => dispatch({ type: 'SET_LEFT_TAB', tab: 'components' })}
            >
              <FaPlus size={11} />
              <span>Bileşenler</span>
            </button>
          </div>
          <div className={styles.leftContent} style={{ flex: 1, overflowY: 'auto' }}>
            {state.leftTab === 'pages' && <WebPagesPanel />}
            {state.leftTab === 'layers' && <LayersPanel />}
            {state.leftTab === 'components' && <ComponentsPanel excludeCategories={['commerce']} />}
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

        {/* ── Right Sidebar — Tabbed Panel ────────────────────────── */}
        <div className={`${styles.sidebarRight} ${!rightOpen ? styles.sidebarCollapsed : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
          <div className={styles.rightTabBar}>
            <button
              type="button"
              className={`${styles.rightTab} ${state.rightTab === 'design' ? styles.rightTabActive : ''}`}
              onClick={() => dispatch({ type: 'SET_RIGHT_TAB', tab: 'design' })}
            >
              <FaPalette size={11} />
              <span>Tasarım</span>
            </button>
            <button
              type="button"
              className={`${styles.rightTab} ${state.rightTab === 'props' ? styles.rightTabActive : ''}`}
              onClick={() => dispatch({ type: 'SET_RIGHT_TAB', tab: 'props' })}
            >
              <FaEdit size={11} />
              <span>İçerik</span>
            </button>
            <button
              type="button"
              className={`${styles.rightTab} ${state.rightTab === 'seo' ? styles.rightTabActive : ''}`}
              onClick={() => dispatch({ type: 'SET_RIGHT_TAB', tab: 'seo' })}
            >
              <FaSearch size={11} />
              <span>SEO</span>
            </button>
            <button
              type="button"
              className={`${styles.rightTab} ${state.rightTab === 'backlinks' ? styles.rightTabActive : ''}`}
              onClick={() => dispatch({ type: 'SET_RIGHT_TAB', tab: 'backlinks' })}
            >
              <FaLink size={11} />
              <span>Linkler</span>
            </button>
          </div>
          <div className={styles.rightContent} style={{ flex: 1, overflowY: 'auto' }}>
            {state.rightTab === 'design' && <DesignPanel />}
            {state.rightTab === 'props' && <PropertiesPanel />}
            {state.rightTab === 'seo' && <WebSeoPanel />}
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
