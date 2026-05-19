import { lazy, Suspense, useState } from 'react';
import { useEditor } from '../context/EditorContext';
import { useThemeEditor } from '../hooks/useThemeEditor';
import { Button } from '../../../../../shared/ui/Button/Button';
import styles from './CodeEditorPanel.module.css';

const MonacoEditor = lazy(() => import('@monaco-editor/react').then(m => ({ default: m.default })));

type CodeTab = 'css' | 'js';

interface Props { tenantSlug: string; }

export function CodeEditorPanel({ tenantSlug }: Props) {
  const { state, dispatch } = useEditor();
  const { saveCustomCode } = useThemeEditor(tenantSlug);
  const [activeTab, setActiveTab] = useState<CodeTab>('css');

  return (
    <div className={styles.panel}>
      <div className={styles.tabBar}>
        <button
          className={`${styles.tab} ${activeTab === 'css' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('css')}
        >
          CSS
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'js' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('js')}
        >
          JS
        </button>
      </div>

      <Suspense fallback={<div className={styles.loading}>Editör yükleniyor...</div>}>
        {activeTab === 'css' && (
          <MonacoEditor
            height="400px"
            language="css"
            theme="vs-dark"
            value={state.customCss}
            onChange={v => dispatch({ type: 'SET_CUSTOM_CSS', css: v ?? '' })}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
            }}
          />
        )}
        {activeTab === 'js' && (
          <MonacoEditor
            height="400px"
            language="javascript"
            theme="vs-dark"
            value={state.customJs}
            onChange={v => dispatch({ type: 'SET_CUSTOM_JS', js: v ?? '' })}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
            }}
          />
        )}
      </Suspense>

      <div className={styles.actions}>
        <Button
          variant="primary"
          isLoading={state.isSaving}
          onClick={() => void saveCustomCode()}
        >
          Kodu Kaydet
        </Button>
      </div>
    </div>
  );
}
