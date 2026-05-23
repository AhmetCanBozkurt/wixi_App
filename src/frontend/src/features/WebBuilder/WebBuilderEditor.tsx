import { useEffect, useState } from 'react';
import { FaGlobe, FaSave, FaExternalLinkAlt, FaHistory } from 'react-icons/fa';

import { useEditor } from '../ThemeBuilder/context/EditorContext';
import { useWebBuilder } from './hooks/useWebBuilder';
import { WebPagesPanel } from './panels/WebPagesPanel';
import { WebSeoPanel } from './panels/WebSeoPanel';
import { WebBacklinksPanel } from './panels/WebBacklinksPanel';
import { WebVersionHistoryPanel } from './panels/WebVersionHistoryPanel';
import { ComponentsPanel } from '../ThemeBuilder/panels/ComponentsPanel';
import { ThemePanel } from '../ThemeBuilder/panels/ThemePanel';
import { GlobalPanel } from '../ThemeBuilder/panels/GlobalPanel';
import { CodeEditorPanel } from '../ThemeBuilder/panels/CodeEditorPanel';
import { PropertiesPanel } from '../ThemeBuilder/panels/PropertiesPanel';
import { EditorCanvas } from '../ThemeBuilder/canvas/EditorCanvas';
import { Modal } from '../../shared/ui/Modal/Modal';
import styles from '../ThemeBuilder/ThemeEditor.module.css';

// ThemePanel / GlobalPanel / CodeEditorPanel require tenantSlug for save operations.
// In WebBuilder context, these panels are rendered with an empty slug so their
// display logic works but save will no-op (API call to storeAdminApi with '' fails silently).
// Full integration for corp theme saving is tracked as a future improvement.
const NOOP_TENANT = '';

function WebBuilderEditorInner() {
  const { state, dispatch } = useEditor();
  const { loadPages, saveAll } = useWebBuilder();
  const [versionModalOpen, setVersionModalOpen] = useState(false);

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
            {state.leftTab === 'pages' && <WebPagesPanel />}
            {state.leftTab === 'components' && <ComponentsPanel />}
            {state.leftTab === 'theme' && <ThemePanel tenantSlug={NOOP_TENANT} />}
            {state.leftTab === 'global' && <GlobalPanel tenantSlug={NOOP_TENANT} />}
            {state.leftTab === 'code' && <CodeEditorPanel tenantSlug={NOOP_TENANT} />}
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
