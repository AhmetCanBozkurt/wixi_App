import { lazy, Suspense, useState } from 'react';
import { FaCode, FaCube } from 'react-icons/fa';
import { useEditor } from '../context/EditorContext';
import { useThemeEditor } from '../hooks/useThemeEditor';
import { Button } from '../../../shared/ui/Button/Button';
import styles from './CodeEditorPanel.module.css';

const MonacoEditor = lazy(() => import('@monaco-editor/react').then(m => ({ default: m.default })));

type CodeTab = 'css' | 'js' | 'component';

interface Props { tenantSlug: string; }

export function CodeEditorPanel({ tenantSlug }: Props) {
  const { state, dispatch } = useEditor();
  const { saveCustomCode } = useThemeEditor(tenantSlug);
  const [activeTab, setActiveTab] = useState<CodeTab>('css');
  const [componentJson, setComponentJson] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const selectedComponent = state.selectedComponentId
    ? state.layout.find(c => c.id === state.selectedComponentId) ?? null
    : null;

  const [prevSelectedComponentId, setPrevSelectedComponentId] = useState<string | null>(null);

  // Sync JSON editor when selected component changes
  if (state.selectedComponentId !== prevSelectedComponentId) {
    setPrevSelectedComponentId(state.selectedComponentId);
    if (selectedComponent) {
      setComponentJson(JSON.stringify(selectedComponent.props, null, 2));
      setJsonError(null);
    }
  }

  const handleApplyProps = () => {
    if (!selectedComponent) return;
    try {
      const parsed = JSON.parse(componentJson) as Record<string, unknown>;
      dispatch({ type: 'UPDATE_COMPONENT_PROPS', id: selectedComponent.id, props: parsed });
      setJsonError(null);
    } catch {
      setJsonError('Geçersiz JSON formatı.');
    }
  };

  return (
    <div className={styles.panel}>
      {/* Tab bar */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tab} ${activeTab === 'css' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('css')}
          type="button"
        >
          <FaCode style={{ fontSize: 10 }} /> CSS
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'js' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('js')}
          type="button"
        >
          <FaCode style={{ fontSize: 10 }} /> JS
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'component' ? styles.tabActive : ''} ${selectedComponent ? styles.tabHighlight : ''}`}
          onClick={() => setActiveTab('component')}
          type="button"
          title="Seçili bileşenin props'larını düzenle"
        >
          <FaCube style={{ fontSize: 10 }} /> Bileşen
          {selectedComponent && <span className={styles.tabDot} />}
        </button>
      </div>

      {/* CSS editor */}
      {activeTab === 'css' && (
        <>
          <div className={styles.hint}>Sayfaya özgü CSS — tüm bileşenleri etkiler</div>
          <Suspense fallback={<div className={styles.loading}>Editör yükleniyor...</div>}>
            <MonacoEditor
              height="360px"
              language="css"
              theme="vs-dark"
              value={state.customCss}
              onChange={v => dispatch({ type: 'SET_CUSTOM_CSS', css: v ?? '' })}
              options={{ minimap: { enabled: false }, fontSize: 13, wordWrap: 'on', scrollBeyondLastLine: false }}
            />
          </Suspense>
          <div className={styles.actions}>
            <Button variant="primary" isLoading={state.isSaving} onClick={() => void saveCustomCode()}>
              Kodu Kaydet
            </Button>
          </div>
        </>
      )}

      {/* JS editor */}
      {activeTab === 'js' && (
        <>
          <div className={styles.hint}>Sayfaya özgü JavaScript</div>
          <Suspense fallback={<div className={styles.loading}>Editör yükleniyor...</div>}>
            <MonacoEditor
              height="360px"
              language="javascript"
              theme="vs-dark"
              value={state.customJs}
              onChange={v => dispatch({ type: 'SET_CUSTOM_JS', js: v ?? '' })}
              options={{ minimap: { enabled: false }, fontSize: 13, wordWrap: 'on', scrollBeyondLastLine: false }}
            />
          </Suspense>
          <div className={styles.actions}>
            <Button variant="primary" isLoading={state.isSaving} onClick={() => void saveCustomCode()}>
              Kodu Kaydet
            </Button>
          </div>
        </>
      )}

      {/* Component props editor */}
      {activeTab === 'component' && (
        <div className={styles.componentPanel}>
          {!selectedComponent ? (
            <div className={styles.noComponent}>
              <FaCube style={{ fontSize: 28, color: '#4b5563', marginBottom: 8 }} />
              <p>Canvas'ta bir bileşen seçin.</p>
              <span>Seçilen bileşenin tüm prop'ları burada JSON olarak düzenlenebilir.</span>
            </div>
          ) : (
            <>
              <div className={styles.componentInfo}>
                <span className={styles.componentType}>{selectedComponent.type}</span>
                <span className={styles.componentId}>#{selectedComponent.id.slice(0, 8)}</span>
              </div>
              <Suspense fallback={<div className={styles.loading}>Editör yükleniyor...</div>}>
                <MonacoEditor
                  height="320px"
                  language="json"
                  theme="vs-dark"
                  value={componentJson}
                  onChange={v => {
                    setComponentJson(v ?? '');
                    setJsonError(null);
                  }}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                    formatOnPaste: true,
                    formatOnType: true,
                  }}
                />
              </Suspense>
              {jsonError && <p className={styles.jsonError}>{jsonError}</p>}
              <div className={styles.actions}>
                <Button variant="ghost" onClick={() => {
                  if (selectedComponent) setComponentJson(JSON.stringify(selectedComponent.props, null, 2));
                  setJsonError(null);
                }}>
                  Sıfırla
                </Button>
                <Button variant="primary" onClick={handleApplyProps}>
                  Uygula
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
