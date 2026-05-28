import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  FaPaintBrush, FaSave, FaExternalLinkAlt, FaHistory, FaUndo, FaRedo,
  FaChevronRight, FaChevronLeft,
  FaFile, FaPlus, FaLayerGroup, FaPalette, FaGlobe, FaCode,
  FaEdit, FaSearch, FaLink,
} from 'react-icons/fa';

import { useEditor } from './context/EditorContext';
import { EditorProvider } from './context/EditorContext';
import { useThemeEditor } from './hooks/useThemeEditor';
import { PagesPanel } from './panels/PagesPanel';
import { ComponentsPanel } from './panels/ComponentsPanel';
import { LayersPanel } from './panels/LayersPanel';
import { ThemePanel } from './panels/ThemePanel';
import { GlobalPanel } from './panels/GlobalPanel';
import { CodeEditorPanel } from './panels/CodeEditorPanel';
import { PropertiesPanel } from './panels/PropertiesPanel';
import { SeoPanel } from './panels/SeoPanel';
import { BacklinksPanel } from './panels/BacklinksPanel';
import { VersionHistoryPanel } from './panels/VersionHistoryPanel';
import { DesignPanel } from '../WebBuilder/panels/DesignPanel';
import { EditorCanvas } from './canvas/EditorCanvas';
import { Modal } from '../../shared/ui/Modal/Modal';
import styles from './ThemeEditor.module.css';

function ThemeEditorInner({ tenantSlug }: { tenantSlug: string }) {
  const { state, dispatch } = useEditor();
  const { loadPages, saveAll } = useThemeEditor(tenantSlug);
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  const canUndo = state._past.length > 0;
  const canRedo = state._future.length > 0;

  useEffect(() => {
    void loadPages();
    // Default left and right tabs for Theme Editor
    dispatch({ type: 'SET_LEFT_TAB', tab: 'components' });
    dispatch({ type: 'SET_RIGHT_TAB', tab: 'design' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantSlug]);

  if (state.isLoading) {
    return <div className={styles.loading}>Yükleniyor...</div>;
  }

  return (
    <div className={styles.editor}>
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <div className={styles.topBar}>
        <div className={styles.titleGroup}>
          <FaPaintBrush color="#ec4899" />
          <span>Tasarım Editörü</span>
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
            href={`/store/${tenantSlug}/${state.activePage?.slug ?? ''}`}
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

        {/* ── Left Sidebar — Tabbed Panel ─────────────────────── */}
        <div className={`${styles.sidebarLeft} ${!leftOpen ? styles.sidebarCollapsed : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
          <div className={styles.leftTabBar} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)' }}>
            <button
              type="button"
              className={`${styles.leftTab} ${state.leftTab === 'pages' ? styles.leftTabActive : ''}`}
              onClick={() => dispatch({ type: 'SET_LEFT_TAB', tab: 'pages' })}
              title="Sayfalar"
            >
              <FaFile size={11} />
            </button>
            <button
              type="button"
              className={`${styles.leftTab} ${state.leftTab === 'layers' ? styles.leftTabActive : ''}`}
              onClick={() => dispatch({ type: 'SET_LEFT_TAB', tab: 'layers' })}
              title="Katmanlar"
            >
              <FaLayerGroup size={11} />
            </button>
            <button
              type="button"
              className={`${styles.leftTab} ${state.leftTab === 'components' ? styles.leftTabActive : ''}`}
              onClick={() => dispatch({ type: 'SET_LEFT_TAB', tab: 'components' })}
              title="Bileşenler"
            >
              <FaPlus size={11} />
            </button>
            <button
              type="button"
              className={`${styles.leftTab} ${state.leftTab === 'theme' ? styles.leftTabActive : ''}`}
              onClick={() => dispatch({ type: 'SET_LEFT_TAB', tab: 'theme' })}
              title="Tema"
            >
              <FaPalette size={11} />
            </button>
            <button
              type="button"
              className={`${styles.leftTab} ${state.leftTab === 'global' ? styles.leftTabActive : ''}`}
              onClick={() => dispatch({ type: 'SET_LEFT_TAB', tab: 'global' })}
              title="Global"
            >
              <FaGlobe size={11} />
            </button>
            <button
              type="button"
              className={`${styles.leftTab} ${state.leftTab === 'code' ? styles.leftTabActive : ''}`}
              onClick={() => dispatch({ type: 'SET_LEFT_TAB', tab: 'code' })}
              title="Kod"
            >
              <FaCode size={11} />
            </button>
          </div>
          <div className={styles.leftContent} style={{ flex: 1, overflowY: 'auto' }}>
            {state.leftTab === 'pages' && <PagesPanel tenantSlug={tenantSlug} />}
            {state.leftTab === 'layers' && <LayersPanel />}
            {state.leftTab === 'components' && <ComponentsPanel />}
            {state.leftTab === 'theme' && <ThemePanel tenantSlug={tenantSlug} />}
            {state.leftTab === 'global' && <GlobalPanel tenantSlug={tenantSlug} />}
            {state.leftTab === 'code' && <CodeEditorPanel tenantSlug={tenantSlug} />}
          </div>
        </div>

        {/* ── Left Toggle ──────────────────────────────────── */}
        <button
          className={styles.sidebarToggle}
          onClick={() => setLeftOpen(o => !o)}
          title={leftOpen ? 'Sol paneli gizle' : 'Sol paneli göster'}
          type="button"
        >
          {leftOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>

        {/* ── Center Canvas ─────────────────────────────────── */}
        <EditorCanvas />

        {/* ── Right Toggle ─────────────────────────────────── */}
        <button
          className={styles.sidebarToggle}
          onClick={() => setRightOpen(o => !o)}
          title={rightOpen ? 'Sağ paneli gizle' : 'Sağ paneli göster'}
          type="button"
        >
          {rightOpen ? <FaChevronRight /> : <FaChevronLeft />}
        </button>

        {/* ── Right Sidebar — Tabbed Panel ─────────────────────── */}
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
            {state.rightTab === 'seo' && <SeoPanel tenantSlug={tenantSlug} />}
            {state.rightTab === 'backlinks' && <BacklinksPanel tenantSlug={tenantSlug} />}
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
        <VersionHistoryPanel tenantSlug={tenantSlug} onClose={() => setVersionModalOpen(false)} />
      </Modal>
    </div>
  );
}

export const ThemeEditor = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();

  if (!tenantSlug) return <div>Tenant bulunamadı.</div>;

  return (
    <EditorProvider>
      <ThemeEditorInner tenantSlug={tenantSlug} />
    </EditorProvider>
  );
};
