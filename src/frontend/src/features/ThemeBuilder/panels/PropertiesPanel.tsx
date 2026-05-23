import { useState } from 'react';
import { FaPlus, FaTrash, FaGripVertical, FaCopy, FaCheck } from 'react-icons/fa';
import { useEditor } from '../context/EditorContext';
import { BLOCK_BY_TYPE } from '../blocks/blockRegistry';
import type { PropField, BlockDefinition, RowFieldSchema } from '../blocks/blockRegistry';
import type { LayoutComponent, ThemeConfig } from '../../../entities/StorePage/model/types';
import styles from './Panels.module.css';

// ── Types ─────────────────────────────────────────────────────────────────────

type PropTab = 'props' | 'inspect';

type RowData = Record<string, unknown>;

// ── Inline row editor for json-array fields ───────────────────────────────────

function InlineRowEditor({
  value,
  itemSchema,
  onChange,
}: {
  value: unknown;
  itemSchema: RowFieldSchema[];
  onChange: (rows: RowData[]) => void;
}) {
  const rows: RowData[] = Array.isArray(value) ? (value as RowData[]) : [];

  const update = (idx: number, key: string, val: unknown) => {
    const next = rows.map((r, i) => (i === idx ? { ...r, [key]: val } : r));
    onChange(next);
  };

  const addRow = () => {
    const blank: RowData = {};
    itemSchema.forEach((f) => { blank[f.key] = f.type === 'number' ? 0 : ''; });
    onChange([...rows, blank]);
  };

  const remove = (idx: number) => onChange(rows.filter((_, i) => i !== idx));

  return (
    <div className={styles.rowEditor}>
      {rows.map((row, idx) => (
        <div key={idx} className={styles.rowItem}>
          <span className={styles.rowDrag}><FaGripVertical /></span>
          <div className={styles.rowFields}>
            {itemSchema.map((f) => (
              <div key={f.key} className={styles.rowField}>
                <label className={styles.rowFieldLabel}>{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea
                    className={styles.textarea}
                    rows={2}
                    value={String(row[f.key] ?? '')}
                    placeholder={f.placeholder}
                    onChange={(e) => update(idx, f.key, e.target.value)}
                  />
                ) : (
                  <input
                    type={f.type === 'number' ? 'number' : f.type === 'url' ? 'url' : 'text'}
                    className={styles.input}
                    value={String(row[f.key] ?? '')}
                    placeholder={f.placeholder}
                    onChange={(e) =>
                      update(idx, f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)
                    }
                  />
                )}
              </div>
            ))}
          </div>
          <button className={styles.rowDelete} onClick={() => remove(idx)} title="Sil">
            <FaTrash />
          </button>
        </div>
      ))}
      <button className={styles.addRowBtn} onClick={addRow}>
        <FaPlus /> Satır Ekle
      </button>
    </div>
  );
}

// ── Image input with preview ──────────────────────────────────────────────────

function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className={styles.imageInput}>
      <input
        type="url"
        className={styles.input}
        value={value}
        placeholder="https://example.com/image.jpg"
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <div className={styles.imagePreview}>
          <img
            src={value}
            alt="Onizleme"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}
    </div>
  );
}

// ── Generic prop input ────────────────────────────────────────────────────────

function PropInput({
  field,
  value,
  onChange,
}: {
  field: PropField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const strVal = value !== undefined && value !== null ? String(value) : '';

  if (field.type === 'json-array') {
    if (field.itemSchema && field.itemSchema.length > 0) {
      return (
        <InlineRowEditor
          value={value}
          itemSchema={field.itemSchema}
          onChange={onChange}
        />
      );
    }
    let displayVal = strVal;
    try { displayVal = JSON.stringify(JSON.parse(strVal), null, 2); } catch { /* keep */ }
    return (
      <>
        <textarea
          className={styles.textarea}
          rows={6}
          value={displayVal}
          onChange={(e) => {
            try { onChange(JSON.parse(e.target.value)); } catch { /* keep string while typing */ }
          }}
          style={{ fontFamily: 'monospace', fontSize: '11px' }}
        />
        <p style={{ fontSize: '10px', color: '#9ca3af', margin: '2px 0 0' }}>JSON array formati</p>
      </>
    );
  }

  if (field.type === 'image') {
    return <ImageInput value={strVal} onChange={(v) => onChange(v)} />;
  }

  if (field.type === 'select' && field.options) {
    return (
      <select className={styles.select} value={strVal} onChange={(e) => onChange(e.target.value)}>
        {field.options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }

  if (field.type === 'boolean') {
    return (
      <label className={styles.toggleRow}>
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
        <span>{value ? 'Acik' : 'Kapali'}</span>
      </label>
    );
  }

  if (field.type === 'number') {
    return (
      <input
        type="number"
        className={styles.input}
        value={strVal}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    );
  }

  if (field.type === 'color') {
    return (
      <div className={styles.colorRow}>
        <input
          type="color"
          value={strVal || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className={styles.colorSwatch}
        />
        <input
          type="text"
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          className={styles.colorText}
        />
      </div>
    );
  }

  if (field.type === 'textarea' || field.type === 'richtext') {
    return (
      <textarea
        className={styles.textarea}
        rows={field.rows || 4}
        value={strVal}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
      />
    );
  }

  return (
    <input
      type={field.type === 'url' ? 'url' : 'text'}
      className={styles.input}
      value={strVal}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
    />
  );
}

// ── Group constants ───────────────────────────────────────────────────────────

const GROUP_LABELS: Record<string, string> = {
  content:  'Icerik',
  visual:   'Gorsel',
  style:    'Stil',
  advanced: 'Gelismis',
};

const GROUP_DOT_CLASS: Record<string, string> = {
  content:  styles.propGroupDotContent,
  visual:   styles.propGroupDotVisual,
  style:    styles.propGroupDotStyle,
  advanced: styles.propGroupDotAdvanced,
};

const GROUP_ORDER = ['content', 'visual', 'style', 'advanced'] as const;

// ── PropsTab ──────────────────────────────────────────────────────────────────

function PropsTab({
  comp,
  schema,
  selectedPropKey,
  onUpdate,
  onSelectProp,
}: {
  comp: LayoutComponent;
  schema: PropField[];
  selectedPropKey: string | null;
  onUpdate: (propKey: string, val: unknown) => void;
  onSelectProp: (propKey: string | null) => void;
}) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const grouped = schema.reduce<Record<string, PropField[]>>((acc, field) => {
    const g = field.group ?? 'content';
    if (!acc[g]) acc[g] = [];
    acc[g].push(field);
    return acc;
  }, {});

  if (schema.length === 0) {
    return (
      <div className={styles.propList}>
        <p style={{ color: '#9ca3af', fontSize: '13px' }}>
          Bu bilesenim duzenlenebilir ozelligi yok.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.propList}>
      {GROUP_ORDER.map((group) => {
        const fields = grouped[group];
        if (!fields?.length) return null;

        const simpleFields = fields.filter((f) => f.type !== 'json-array');
        const arrayFields = fields.filter((f) => f.type === 'json-array');

        return (
          <div key={group} className={styles.propGroupSection}>
            <div className={styles.propGroupSectionHeader}>
              <span className={`${styles.propGroupDot} ${GROUP_DOT_CLASS[group]}`} />
              {GROUP_LABELS[group]}
            </div>

            {simpleFields.map((field) => {
              const isHighlighted = selectedPropKey === field.field;
              return (
                <div
                  key={field.field}
                  className={styles.propGroup}
                  style={
                    isHighlighted
                      ? {
                          background: 'rgba(236,72,153,0.06)',
                          borderRadius: '6px',
                          padding: '4px',
                          margin: '-4px',
                        }
                      : undefined
                  }
                  onClick={() => onSelectProp(field.field)}
                >
                  <label className={styles.propLabel}>{field.label}</label>
                  <PropInput
                    field={field}
                    value={comp.props[field.field]}
                    onChange={(v) => onUpdate(field.field, v)}
                  />
                </div>
              );
            })}

            {arrayFields.map((field) => {
              const rows = Array.isArray(comp.props[field.field])
                ? (comp.props[field.field] as unknown[]).length
                : 0;
              const isOpen = openSection === field.field;
              return (
                <div key={field.field} className={styles.arraySectionWrap}>
                  <button
                    className={styles.arraySectionHeader}
                    onClick={() => setOpenSection(isOpen ? null : field.field)}
                  >
                    <span>{field.label}</span>
                    <span className={styles.arrayBadge}>{rows} kayit</span>
                    <span className={styles.arraySectionChevron}>{isOpen ? '▲' : '▼'}</span>
                  </button>
                  {isOpen && (
                    <div className={styles.arraySectionBody}>
                      <PropInput
                        field={field}
                        value={comp.props[field.field]}
                        onChange={(v) => onUpdate(field.field, v)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ── InspectTab ────────────────────────────────────────────────────────────────

function InspectTab({
  comp,
  def,
  theme,
  copied,
  onCopy,
}: {
  comp: LayoutComponent;
  def: BlockDefinition | undefined;
  theme: ThemeConfig;
  copied: boolean;
  onCopy: () => void;
}) {
  const cssOutput = def?.toCss?.(comp.props, theme) ?? '';

  const typoFields =
    def?.propsSchema.filter((f) =>
      ['title', 'subtitle', 'text', 'html'].includes(f.field)
    ) ?? [];

  if (!def) {
    return (
      <div className={styles.inspectPanel}>
        <div className={styles.inspectEmpty}>Bu bilesenim icin inspect bilgisi yok.</div>
      </div>
    );
  }

  return (
    <div className={styles.inspectPanel}>
      {/* Temel bilgiler */}
      <div className={styles.inspectSection}>
        <div className={styles.inspectSectionTitle}>Bilesenim Bilgisi</div>
        <div className={styles.inspectGrid}>
          <div className={styles.inspectRow}>
            <span className={styles.inspectLabel}>TIP</span>
            <span className={styles.inspectValue}>{comp.type}</span>
          </div>
          <div className={styles.inspectRow}>
            <span className={styles.inspectLabel}>KATEGORI</span>
            <span className={styles.inspectValue}>{def.category}</span>
          </div>
          {typoFields.slice(0, 2).map((f) => (
            <div key={f.field} className={styles.inspectRow}>
              <span className={styles.inspectLabel}>{f.label.toUpperCase()}</span>
              <span className={styles.inspectValue} style={{ fontSize: '10px' }}>
                {String(comp.props[f.field] ?? '-')
                  .replace(/<[^>]+>/g, '')
                  .slice(0, 20)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tema renkleri */}
      <div className={styles.inspectSection}>
        <div className={styles.inspectSectionTitle}>Tema Renkleri</div>
        <div className={styles.inspectGrid}>
          {(
            [
              { label: 'PRIMARY',    value: theme.colors.primary    },
              { label: 'TEXT',       value: theme.colors.text       },
              { label: 'BACKGROUND', value: theme.colors.background },
              { label: 'SURFACE',    value: theme.colors.surface    },
            ] as const
          ).map(({ label, value }) => (
            <div key={label} className={styles.inspectRow}>
              <span className={styles.inspectLabel}>{label}</span>
              <span
                className={styles.inspectValue}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '2px',
                    background: value,
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CSS Output */}
      {cssOutput ? (
        <div className={styles.cssOutputBox}>
          <div className={styles.cssOutputHeader}>
            <span>CSS</span>
            <button className={styles.cssOutputCopyBtn} onClick={onCopy}>
              {copied ? (
                <><FaCheck /> Kopyalandi</>
              ) : (
                <><FaCopy /> Kopyala</>
              )}
            </button>
          </div>
          <pre className={styles.cssOutputCode}>{cssOutput}</pre>
        </div>
      ) : (
        <div className={styles.inspectEmpty}>Bu bilesenim icin CSS ciktisi yok.</div>
      )}
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function PropertiesPanel() {
  const { state, dispatch, selectProp } = useEditor();
  const { selectedComponentId, layout, theme, selectedPropKey } = state;
  const comp = layout.find((c) => c.id === selectedComponentId);
  const [propTab, setPropTab] = useState<PropTab>('props');
  const [copied, setCopied] = useState(false);

  if (!comp) {
    return (
      <div className={styles.panel}>
        <div className={styles.noSelection}>
          <p>Duzenlemek icin canvas'tan bir bilesenim secin.</p>
        </div>
      </div>
    );
  }

  const def = BLOCK_BY_TYPE[comp.type];
  const schema = def?.propsSchema ?? [];

  const update = (propKey: string, val: unknown) => {
    dispatch({ type: 'UPDATE_COMPONENT_PROPS', id: comp.id, props: { [propKey]: val } });
  };

  const handleCopyCss = () => {
    const css = def?.toCss?.(comp.props, theme) ?? '';
    navigator.clipboard.writeText(css).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => { /* clipboard erişimi başarısız — sessizce geç */ });
  };

  return (
    <div className={styles.panel}>
      {/* Tab Bar */}
      <div className={styles.rightTabBar}>
        <button
          className={`${styles.rightTab} ${propTab === 'props' ? styles.rightTabActive : ''}`}
          onClick={() => setPropTab('props')}
        >
          Ozellikler
        </button>
        <button
          className={`${styles.rightTab} ${propTab === 'inspect' ? styles.rightTabActive : ''}`}
          onClick={() => setPropTab('inspect')}
        >
          Incele
        </button>
      </div>

      {/* Component name */}
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid var(--editor-border)',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--editor-text)',
        }}
      >
        {def?.name ?? comp.type}
      </div>

      {propTab === 'props' ? (
        <PropsTab
          comp={comp}
          schema={schema}
          selectedPropKey={selectedPropKey}
          onUpdate={update}
          onSelectProp={selectProp}
        />
      ) : (
        <InspectTab
          comp={comp}
          def={def}
          theme={theme}
          copied={copied}
          onCopy={handleCopyCss}
        />
      )}
    </div>
  );
}
