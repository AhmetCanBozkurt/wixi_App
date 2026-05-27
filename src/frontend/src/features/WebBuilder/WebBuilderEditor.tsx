import { useEffect, useState } from 'react';
import {
  FaGlobe, FaSave, FaExternalLinkAlt, FaHistory, FaUndo, FaRedo,
  FaChevronLeft, FaChevronRight,
  FaFile, FaPlus, FaLayerGroup,
  FaEdit, FaSearch, FaLink,
} from 'react-icons/fa';

import { useEditor } from '../ThemeBuilder/context/EditorContext';
import { useWebBuilder } from './hooks/useWebBuilder';
import { AccordionSection } from '../ThemeBuilder/ThemeEditor';
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

        {/* ── Left Sidebar — Accordion ────────────────────────── */}
        <div className={`${styles.sidebarLeft} ${!leftOpen ? styles.sidebarCollapsed : ''}`}>
          <AccordionSection
            label="Sayfalar"
            icon={FaFile}
            badge={state.pages.length || undefined}
            defaultOpen
            height={220}
          >
            <WebPagesPanel />
          </AccordionSection>

          <AccordionSection
            label="Bileşenler"
            icon={FaPlus}
            defaultOpen
            height={380}
          >
            <ComponentsPanel excludeCategories={['commerce']} />
          </AccordionSection>

          <AccordionSection
            label="Katmanlar"
            icon={FaLayerGroup}
            badge={state.layout.length || undefined}
            height={300}
          >
            <LayersPanel />
          </AccordionSection>
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

        {/* ── Right Sidebar — Accordion ────────────────────────── */}
        <div className={`${styles.sidebarRight} ${!rightOpen ? styles.sidebarCollapsed : ''}`}>
          <AccordionSection label="Özellikler" icon={FaEdit} defaultOpen height={520}>
            <PropertiesPanel />
          </AccordionSection>

          <AccordionSection label="SEO" icon={FaSearch} height={440}>
            <WebSeoPanel />
          </AccordionSection>

          <AccordionSection label="Bağlantılar" icon={FaLink} height={360}>
            <WebBacklinksPanel />
          </AccordionSection>
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
