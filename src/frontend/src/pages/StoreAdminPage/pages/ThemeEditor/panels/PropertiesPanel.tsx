import { useState } from 'react';
import { FaPlus, FaTrash, FaGripVertical } from 'react-icons/fa';
import { useEditor } from '../context/EditorContext';
import { BLOCK_BY_TYPE } from '../blocks/blockRegistry';
import type { PropField, RowFieldSchema } from '../blocks/blockRegistry';
import styles from './Panels.module.css';

// ── Inline row editor for json-array fields ───────────────────────────────────

type RowData = Record<string, unknown>;

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
          <img src={value} alt="Önizleme" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
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
    // fallback: raw JSON for arrays without itemSchema
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
        <p style={{ fontSize: '10px', color: '#9ca3af', margin: '2px 0 0' }}>JSON array formatı</p>
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
        <span>{value ? 'Açık' : 'Kapalı'}</span>
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

// ── Main panel ────────────────────────────────────────────────────────────────

export function PropertiesPanel() {
  const { state, dispatch } = useEditor();
  const { selectedComponentId, layout } = state;
  const comp = layout.find((c) => c.id === selectedComponentId);
  const [openSection, setOpenSection] = useState<string | null>(null);

  if (!comp) {
    return (
      <div className={styles.panel}>
        <div className={styles.noSelection}>
          <p>Düzenlemek için canvas'tan bir bileşen seçin.</p>
        </div>
      </div>
    );
  }

  const def = BLOCK_BY_TYPE[comp.type];
  const schema = def?.propsSchema ?? [];

  const update = (propKey: string, val: unknown) => {
    dispatch({ type: 'UPDATE_COMPONENT_PROPS', id: comp.id, props: { [propKey]: val } });
  };

  // group: content fields vs array fields
  const simpleFields = schema.filter((f) => f.type !== 'json-array');
  const arrayFields = schema.filter((f) => f.type === 'json-array');

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span>{def?.name ?? comp.type}</span>
      </div>

      <div className={styles.propList}>
        {/* Simple fields */}
        {simpleFields.map((field) => (
          <div key={field.field} className={styles.propGroup}>
            <label className={styles.propLabel}>{field.label}</label>
            <PropInput
              field={field}
              value={comp.props[field.field]}
              onChange={(v) => update(field.field, v)}
            />
          </div>
        ))}

        {/* Array/list fields — collapsible sections */}
        {arrayFields.map((field) => {
          const rows = Array.isArray(comp.props[field.field]) ? (comp.props[field.field] as unknown[]).length : 0;
          const isOpen = openSection === field.field;
          return (
            <div key={field.field} className={styles.arraySectionWrap}>
              <button
                className={styles.arraySectionHeader}
                onClick={() => setOpenSection(isOpen ? null : field.field)}
              >
                <span>{field.label}</span>
                <span className={styles.arrayBadge}>{rows} kayıt</span>
                <span className={styles.arraySectionChevron}>{isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && (
                <div className={styles.arraySectionBody}>
                  <PropInput
                    field={field}
                    value={comp.props[field.field]}
                    onChange={(v) => update(field.field, v)}
                  />
                </div>
              )}
            </div>
          );
        })}

        {schema.length === 0 && (
          <p style={{ color: '#9ca3af', fontSize: '13px' }}>
            Bu bileşenin düzenlenebilir özelliği yok.
          </p>
        )}
      </div>
    </div>
  );
}
