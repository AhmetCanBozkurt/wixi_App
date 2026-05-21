import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaPaintBrush, FaSave, FaExternalLinkAlt, FaHistory } from 'react-icons/fa';

import { EditorProvider, useEditor } from './context/EditorContext';
import { useThemeEditor } from './hooks/useThemeEditor';
import { PagesPanel } from './panels/PagesPanel';
import { ComponentsPanel } from './panels/ComponentsPanel';
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

function ThemeEditorInner({ tenantSlug }: { tenantSlug: string }) {
  const { state, dispatch } = useEditor();
  const { loadPages, saveAll } = useThemeEditor(tenantSlug);
  const [versionModalOpen, setVersionModalOpen] = useState(false);

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
        {/* Left Sidebar */}
        <div className={styles.sidebarLeft}>
          <div className={styles.leftTabBar}>
            {([['pages', 'Sayfalar'], ['components', 'Bileşenler'], ['theme', 'Tema'], ['global', 'Global'], ['code', 'Kod']] as const).map(([tab, label]) => (
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
            {state.leftTab === 'pages' && <PagesPanel tenantSlug={tenantSlug} />}
            {state.leftTab === 'components' && <ComponentsPanel />}
            {state.leftTab === 'theme' && <ThemePanel tenantSlug={tenantSlug} />}
            {state.leftTab === 'global' && <GlobalPanel tenantSlug={tenantSlug} />}
            {state.leftTab === 'code' && <CodeEditorPanel tenantSlug={tenantSlug} />}
          </div>
        </div>

        {/* Center Canvas */}
        <EditorCanvas />

        {/* Right Sidebar — 3 tabs only */}
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
