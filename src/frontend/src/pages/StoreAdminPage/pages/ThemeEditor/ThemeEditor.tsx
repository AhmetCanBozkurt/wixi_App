import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaPaintBrush, FaSave, FaExternalLinkAlt } from 'react-icons/fa';

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
import styles from './ThemeEditor.module.css';

function ThemeEditorInner({ tenantSlug }: { tenantSlug: string }) {
  const { state, dispatch } = useEditor();
  const { loadPages, saveAll } = useThemeEditor(tenantSlug);

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

        {/* Right Sidebar */}
        <div className={styles.sidebarRight}>
          <div className={styles.rightTabBar}>
            {([['props', 'Özellikler'], ['seo', 'SEO'], ['backlinks', 'Bağlantılar'], ['versions', 'Geçmiş']] as const).map(([tab, label]) => (
              <button
                key={tab}
                className={`${styles.rightTab} ${state.rightTab === tab ? styles.rightTabActive : ''}`}
                onClick={() => dispatch({ type: 'SET_RIGHT_TAB', tab })}
              >
                {label}
              </button>
            ))}
          </div>
          <div className={styles.rightContent}>
            {state.rightTab === 'props' && <PropertiesPanel />}
            {state.rightTab === 'seo' && <SeoPanel tenantSlug={tenantSlug} />}
            {state.rightTab === 'backlinks' && <BacklinksPanel tenantSlug={tenantSlug} />}
            {state.rightTab === 'versions' && <VersionHistoryPanel tenantSlug={tenantSlug} />}
          </div>
        </div>
      </div>
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
