import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { useParams } from 'react-router-dom';
import {
  FaPaintBrush, FaSave, FaExternalLinkAlt, FaHistory, FaUndo, FaRedo,
  FaChevronRight, FaFile, FaPlus, FaLayerGroup, FaPalette, FaGlobe, FaCode,
} from 'react-icons/fa';

import { EditorProvider, useEditor } from './context/EditorContext';
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
import { EditorCanvas } from './canvas/EditorCanvas';
import { Modal } from '../../shared/ui/Modal/Modal';
import { BLOCK_REGISTRY } from './blocks/blockRegistry';
import styles from './ThemeEditor.module.css';

// ── Accordion Section ──────────────────────────────────────────────────────
interface AccordionSectionProps {
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number | string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  height?: number;
}

function AccordionSection({
  label,
  icon: Icon,
  badge,
  children,
  defaultOpen = false,
  height = 320,
}: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.accordionSection}>
      <button
        className={styles.accordionHeader}
        onClick={() => setOpen(o => !o)}
        type="button"
        aria-expanded={open}
      >
        <FaChevronRight
          className={`${styles.accordionChevron} ${open ? styles.accordionChevronOpen : ''}`}
        />
        <Icon className={styles.accordionHeaderIcon} />
        <span className={styles.accordionLabel}>{label}</span>
        {badge !== undefined && <span className={styles.accordionBadge}>{badge}</span>}
      </button>
      {open && (
        <div
          className={styles.accordionContent}
          style={{ '--accordion-h': `${height}px` } as React.CSSProperties}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ── Main Editor Component ──────────────────────────────────────────────────
function ThemeEditorInner({ tenantSlug }: { tenantSlug: string }) {
  const { state, dispatch } = useEditor();
  const { loadPages, saveAll } = useThemeEditor(tenantSlug);
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const canUndo = state._past.length > 0;
  const canRedo = state._future.length > 0;

  useEffect(() => {
    void loadPages();
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

        {/* ── Left Sidebar — Accordion ─────────────────────── */}
        <div className={styles.sidebarLeft}>

          <AccordionSection
            label="Sayfalar"
            icon={FaFile}
            badge={state.pages.length || undefined}
            defaultOpen
            height={220}
          >
            <PagesPanel tenantSlug={tenantSlug} />
          </AccordionSection>

          <AccordionSection
            label="Bileşenler"
            icon={FaPlus}
            badge={BLOCK_REGISTRY.length}
            defaultOpen
            height={380}
          >
            <ComponentsPanel />
          </AccordionSection>

          <AccordionSection
            label="Katmanlar"
            icon={FaLayerGroup}
            badge={state.layout.length || undefined}
            height={300}
          >
            <LayersPanel />
          </AccordionSection>

          <AccordionSection
            label="Tema"
            icon={FaPalette}
            height={440}
          >
            <ThemePanel tenantSlug={tenantSlug} />
          </AccordionSection>

          <AccordionSection
            label="Global"
            icon={FaGlobe}
            height={400}
          >
            <GlobalPanel tenantSlug={tenantSlug} />
          </AccordionSection>

          <AccordionSection
            label="Kod"
            icon={FaCode}
            height={500}
          >
            <CodeEditorPanel tenantSlug={tenantSlug} />
          </AccordionSection>

        </div>

        {/* ── Center Canvas ─────────────────────────────────── */}
        <EditorCanvas />

        {/* ── Right Sidebar — Tabs ──────────────────────────── */}
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
