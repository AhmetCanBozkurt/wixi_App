import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  FaPaintBrush, FaSave, FaExternalLinkAlt, FaHistory, FaUndo, FaRedo,
  FaChevronRight, FaChevronLeft,
  FaFile, FaPlus, FaLayerGroup, FaPalette, FaGlobe, FaCode,
  FaEdit, FaSearch, FaLink,
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
import styles from './ThemeEditor.module.css';

const LEFT_TABS = [
  { id: 'pages'      as const, label: 'Sayfalar',  Icon: FaFile      },
  { id: 'components' as const, label: 'Bloklar',   Icon: FaPlus      },
  { id: 'layers'     as const, label: 'Katmanlar', Icon: FaLayerGroup },
  { id: 'theme'      as const, label: 'Tema',      Icon: FaPalette   },
  { id: 'global'     as const, label: 'Global',    Icon: FaGlobe     },
  { id: 'code'       as const, label: 'Kod',       Icon: FaCode      },
];

const RIGHT_TABS = [
  { id: 'props'     as const, label: 'Özellikler', Icon: FaEdit   },
  { id: 'seo'       as const, label: 'SEO',        Icon: FaSearch },
  { id: 'backlinks' as const, label: 'Bağlantılar', Icon: FaLink  },
];

// ── Main Editor Component ──────────────────────────────────────────────────
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

        {/* ── Left Sidebar ─────────────────────────────────── */}
        <div
          className={`${styles.sidebarLeft} ${!leftOpen ? styles.sidebarCollapsed : ''}`}
          style={{ overflowY: 'hidden' }}
        >
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
            {state.leftTab === 'pages'      && <PagesPanel tenantSlug={tenantSlug} />}
            {state.leftTab === 'components' && <ComponentsPanel />}
            {state.leftTab === 'layers'     && <LayersPanel />}
            {state.leftTab === 'theme'      && <ThemePanel tenantSlug={tenantSlug} />}
            {state.leftTab === 'global'     && <GlobalPanel tenantSlug={tenantSlug} />}
            {state.leftTab === 'code'       && <CodeEditorPanel tenantSlug={tenantSlug} />}
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

        {/* ── Right Sidebar ────────────────────────────────── */}
        <div
          className={`${styles.sidebarRight} ${!rightOpen ? styles.sidebarCollapsed : ''}`}
          style={{ overflowY: 'hidden' }}
        >
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
            {state.rightTab === 'seo'       && <SeoPanel tenantSlug={tenantSlug} />}
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
