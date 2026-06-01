import { useState } from 'react';
import { FaPlus, FaTrash, FaGripVertical, FaCopy, FaCheck, FaEdit, FaCompass, FaBorderAll } from 'react-icons/fa';
import { useEditor, findComponentInRows, findColumnInRows } from '../context/EditorContext';
import { BLOCK_BY_TYPE } from '../blocks/blockRegistry';
import type { PropField, BlockDefinition, RowFieldSchema } from '../blocks/blockRegistry';
import type { LayoutComponent, ThemeConfig } from '../../../entities/StorePage/model/types';
import styles from './Panels.module.css';
import { Button, Input, ImageUpload, Modal } from '../../../shared/ui';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ── Types ─────────────────────────────────────────────────────────────────────

type PropTab = 'props' | 'inspect';

type RowData = Record<string, unknown>;

// ── Image input with preview ──────────────────────────────────────────────────

function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <ImageUpload
        value={value ? String(value) : null}
        onChange={(base64) => onChange(base64 || '')}
        shape="square"
        size={80}
        hint="Görsel yükleyin."
      />
      <input
        type="url"
        className={styles.input}
        value={value}
        placeholder="Veya görsel URL'si yapıştırın"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// ── Generic prop input (non-array fields) ──────────────────────────────────────

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

// ── Sortable row card (nested editor inside modal) ──────────────────────────

function SortableRowCard({
  id,
  index,
  row,
  itemSchema,
  isExpanded,
  onToggleExpand,
  onUpdateField,
  onDelete,
}: {
  id: string;
  index: number;
  row: RowData;
  itemSchema: RowFieldSchema[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdateField: (key: string, val: unknown) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  // Inferred card header title from first available text fields
  const titleField = itemSchema.find((f) => ['title', 'name', 'label', 'heading', 'text'].includes(f.key));
  const cardTitle = titleField ? String(row[titleField.key] ?? '') : '';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.modalCard} ${isDragging ? styles.modalCardDragging : ''}`}
    >
      <div className={styles.modalCardHeader}>
        <span className={styles.modalCardGrip} {...attributes} {...listeners}>
          <FaGripVertical />
        </span>
        <div className={styles.modalCardTitle} onClick={onToggleExpand}>
          {cardTitle || `Eleman #${index + 1}`}
        </div>
        <div className={styles.modalCardActions}>
          <button
            className={styles.modalCardChevron}
            onClick={onToggleExpand}
            title={isExpanded ? 'Daralt' : 'Genişlet'}
            type="button"
          >
            {isExpanded ? '▲' : '▼'}
          </button>
          <button
            className={styles.modalCardDelete}
            onClick={onDelete}
            title="Sil"
            type="button"
          >
            <FaTrash />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.modalCardBody}>
          <div className={styles.modalInputGrid}>
            {itemSchema.map((f) => {
              const isImageField =
                f.key.toLowerCase().includes('image') ||
                f.key.toLowerCase().includes('logo') ||
                f.label.toLowerCase().includes('görsel') ||
                f.label.toLowerCase().includes('fotoğraf') ||
                f.label.toLowerCase().includes('logo');

              return (
                <div key={f.key} className={styles.modalFormRow}>
                  <label className={styles.modalFormRowLabel}>
                    {f.label}
                  </label>
                  {isImageField ? (
                    <div className={styles.imageInput}>
                      <ImageUpload
                        value={row[f.key] ? String(row[f.key]) : null}
                        onChange={(base64) => onUpdateField(f.key, base64)}
                        shape="square"
                        size={80}
                        hint="Görsel yükleyin."
                      />
                      <Input
                        type="url"
                        value={row[f.key] ? String(row[f.key]) : ''}
                        onChange={(e) => onUpdateField(f.key, e.target.value)}
                        placeholder="Veya görsel URL'si yapıştırın"
                      />
                    </div>
                  ) : f.type === 'textarea' ? (
                    <textarea
                      className={styles.textarea}
                      rows={3}
                      value={row[f.key] ? String(row[f.key]) : ''}
                      onChange={(e) => onUpdateField(f.key, e.target.value)}
                      placeholder={f.placeholder}
                    />
                  ) : (
                    <Input
                      type={f.type === 'number' ? 'number' : f.type === 'url' ? 'url' : 'text'}
                      value={row[f.key] ? String(row[f.key]) : ''}
                      onChange={(e) =>
                        onUpdateField(
                          f.key,
                          f.type === 'number' ? Number(e.target.value) : e.target.value
                        )
                      }
                      placeholder={f.placeholder}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Array Field Modal (Phase 1) ──────────────────────────────────────────────

function ArrayFieldModal({
  isOpen,
  field,
  rows: initialRows,
  expandedIdx: initialExpandedIdx,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  field: PropField;
  rows: RowData[];
  expandedIdx: number | null;
  onClose: () => void;
  onSave: (nextRows: RowData[]) => void;
}) {
  const [localRows, setLocalRows] = useState<RowData[]>(initialRows);
  const [expandedRowIdx, setExpandedRowIdx] = useState<number | null>(initialExpandedIdx);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = parseInt(String(active.id), 10);
      const newIndex = parseInt(String(over.id), 10);
      setLocalRows((prev) => {
        const next = arrayMove(prev, oldIndex, newIndex);
        if (expandedRowIdx === oldIndex) {
          setExpandedRowIdx(newIndex);
        } else if (expandedRowIdx === newIndex) {
          setExpandedRowIdx(oldIndex);
        }
        return next;
      });
    }
  };

  const handleAdd = () => {
    const blank: RowData = {};
    if (field.itemSchema) {
      field.itemSchema.forEach((f) => {
        blank[f.key] = f.type === 'number' ? 0 : '';
      });
    }
    const next = [...localRows, blank];
    setLocalRows(next);
    setExpandedRowIdx(next.length - 1);
  };

  const handleDelete = (index: number) => {
    Swal.fire({
      title: 'Emin misiniz?',
      text: 'Bu satırı silmek istediğinize emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--color-primary, #ec4899)',
      cancelButtonColor: 'var(--color-danger, #ef4444)',
      confirmButtonText: 'Evet, sil!',
      cancelButtonText: 'İptal',
      background: 'var(--editor-surface, #1e1e1e)',
      color: 'var(--editor-text, #ffffff)',
      backdrop: 'rgba(0,0,0,0.5)',
    }).then((result) => {
      if (result.isConfirmed) {
        setLocalRows((prev) => prev.filter((_, i) => i !== index));
        if (expandedRowIdx === index) {
          setExpandedRowIdx(null);
        } else if (expandedRowIdx !== null && expandedRowIdx > index) {
          setExpandedRowIdx(expandedRowIdx - 1);
        }
        toast.success('Kayıt silindi.', {
          style: {
            background: 'var(--bg-secondary, #18181b)',
            color: 'var(--text-main, #ffffff)',
            border: '1px solid var(--color-success, #10b981)',
          },
        });
      }
    });
  };

  const handleUpdateField = (index: number, key: string, val: unknown) => {
    setLocalRows((prev) =>
      prev.map((row, idx) => (idx === index ? { ...row, [key]: val } : row))
    );
  };

  const sortableItems = localRows.map((_, idx) => String(idx));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${field.label} Düzenle`}
      size="lg"
      footer={
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="ghost" onClick={onClose}>
            Vazgeç
          </Button>
          <Button variant="primary" onClick={() => onSave(localRows)}>
            Değişiklikleri Kaydet
          </Button>
        </div>
      }
    >
      <div className={styles.modalInnerContent}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--editor-text-muted)' }}>
            Sürükleyip bırakarak sıralayabilirsiniz.
          </span>
          <Button variant="glass" size="sm" leftIcon={<FaPlus />} onClick={handleAdd}>
            Yeni Ekle
          </Button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
            <div className={styles.modalCardList}>
              {localRows.map((row, idx) => (
                <SortableRowCard
                  key={idx}
                  id={String(idx)}
                  index={idx}
                  row={row}
                  itemSchema={field.itemSchema || []}
                  isExpanded={expandedRowIdx === idx}
                  onToggleExpand={() => setExpandedRowIdx(expandedRowIdx === idx ? null : idx)}
                  onUpdateField={(key, val) => handleUpdateField(idx, key, val)}
                  onDelete={() => handleDelete(idx)}
                />
              ))}
              {localRows.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--editor-text-muted)', fontSize: '13px' }}>
                  Henüz kayıt eklenmemiş. "Yeni Ekle" butonunu kullanarak ekleyebilirsiniz.
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </Modal>
  );
}

// ── PropsTab ──────────────────────────────────────────────────────────────────

function PropsTab({
  comp,
  schema,
  selectedPropKey,
  onUpdate,
  onSelectProp,
  onOpenArrayModal,
}: {
  comp: LayoutComponent;
  schema: PropField[];
  selectedPropKey: string | null;
  onUpdate: (propKey: string, val: unknown) => void;
  onSelectProp: (propKey: string | null) => void;
  onOpenArrayModal: (field: PropField) => void;
}) {
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
              const rowsVal = comp.props[field.field];
              const rows = Array.isArray(rowsVal) ? (rowsVal as unknown[]) : [];
              const count = rows.length;
              return (
                <div key={field.field} className={styles.arrayEditWidget}>
                  <div className={styles.arrayEditWidgetInfo}>
                    <label className={styles.propLabel} style={{ margin: 0 }}>{field.label}</label>
                    <span className={styles.arrayEditWidgetCount}>{count} kayıt</span>
                  </div>
                  <button
                    className={styles.arrayEditWidgetBtn}
                    onClick={() => onOpenArrayModal(field)}
                    type="button"
                  >
                    <FaEdit size={12} /> Düzenle
                  </button>
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
            <button className={styles.cssOutputCopyBtn} onClick={onCopy} type="button">
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

// ── Row Settings Panel ────────────────────────────────────────────────────────

function RowSettingsPanel() {
  const { state, dispatch } = useEditor();
  const { layout, selectedRowId } = state;
  const row = layout.find(r => r.id === selectedRowId);

  if (!row) return null;

  const p = row.props;
  const update = (key: string, val: unknown) => {
    dispatch({ type: 'UPDATE_ROW_PROPS', rowId: row.id, props: { [key]: val } });
  };

  return (
    <div className={styles.propList}>
      <div className={styles.propGroupSection}>
        <div className={styles.propGroupSectionHeader}>
          <span className={`${styles.propGroupDot} ${styles.propGroupDotVisual}`} />
          Arka Plan
        </div>
        <div className={styles.propGroup}>
          <label className={styles.propLabel}>Arka Plan Rengi</label>
          <div className={styles.colorRow}>
            <input
              type="color"
              value={String(p.backgroundColor || '#ffffff')}
              onChange={e => update('backgroundColor', e.target.value)}
              className={styles.colorSwatch}
            />
            <input
              type="text"
              value={String(p.backgroundColor || '')}
              onChange={e => update('backgroundColor', e.target.value)}
              className={styles.colorText}
              placeholder="#ffffff veya transparent"
            />
          </div>
        </div>
        <div className={styles.propGroup}>
          <label className={styles.propLabel}>Arka Plan Gorsel URL</label>
          <input
            type="url"
            className={styles.input}
            value={String(p.backgroundImage || '')}
            onChange={e => update('backgroundImage', e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className={styles.propGroupSection}>
        <div className={styles.propGroupSectionHeader}>
          <span className={`${styles.propGroupDot} ${styles.propGroupDotStyle}`} />
          Bosluk
        </div>
        <div className={styles.propGroup}>
          <label className={styles.propLabel}>Dikey Bosluk (paddingY)</label>
          <input
            type="text"
            className={styles.input}
            value={String(p.paddingY || '')}
            onChange={e => update('paddingY', e.target.value)}
            placeholder="40px"
          />
        </div>
        <div className={styles.propGroup}>
          <label className={styles.propLabel}>Yatay Bosluk (paddingX)</label>
          <input
            type="text"
            className={styles.input}
            value={String(p.paddingX || '')}
            onChange={e => update('paddingX', e.target.value)}
            placeholder="0px"
          />
        </div>
      </div>

      <div className={styles.propGroupSection}>
        <div className={styles.propGroupSectionHeader}>
          <span className={`${styles.propGroupDot} ${styles.propGroupDotAdvanced}`} />
          Diger
        </div>
        <div className={styles.propGroup}>
          <label className={styles.toggleRow}>
            <input
              type="checkbox"
              checked={Boolean(p.fullWidth)}
              onChange={e => update('fullWidth', e.target.checked)}
            />
            <span>Tam Genislik</span>
          </label>
        </div>
      </div>
    </div>
  );
}

// ── Column Settings Panel ─────────────────────────────────────────────────────

function ColumnSettingsPanel() {
  const { state, dispatch } = useEditor();
  const { layout, selectedColumnId, selectedRowId } = state;

  const row = layout.find(r => r.id === selectedRowId);
  const col = row?.columns.find(c => c.id === selectedColumnId);

  if (!row || !col) return null;

  return (
    <div className={styles.propList}>
      <div className={styles.propGroupSection}>
        <div className={styles.propGroupSectionHeader}>
          <span className={`${styles.propGroupDot} ${styles.propGroupDotStyle}`} />
          Kolon Ayarlari
        </div>
        <div className={styles.propGroup}>
          <label className={styles.propLabel}>Genislik (1–12)</label>
          <input
            type="range"
            min={1}
            max={12}
            value={col.span}
            onChange={e => dispatch({ type: 'UPDATE_COLUMN_SPAN', rowId: row.id, columnId: col.id, span: Number(e.target.value) })}
            style={{ width: '100%' }}
          />
          <span style={{ fontSize: '11px', color: 'var(--editor-text-muted)' }}>{col.span} / 12</span>
        </div>
      </div>

      <div style={{ padding: '8px 12px' }}>
        <button
          style={{
            width: '100%',
            padding: '6px',
            background: 'rgba(239,68,68,0.1)',
            color: '#ef4444',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 600,
          }}
          onClick={() => dispatch({ type: 'REMOVE_COLUMN', rowId: row.id, columnId: col.id })}
          type="button"
        >
          Kolonu Sil
        </button>
      </div>
    </div>
  );
}

// ── Navbar Properties Panel ────────────────────────────────────────────────────

function NavbarPropertiesPanel() {
  const { state, dispatch } = useEditor();
  const { navbar } = state.globalComponents;

  const updateNavbar = (key: string, value: unknown) =>
    dispatch({
      type: 'SET_GLOBAL_COMPONENTS',
      globalComponents: {
        ...state.globalComponents,
        navbar: { ...navbar, [key]: value },
      },
    });

  const navLinks = navbar.links || [];

  return (
    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div>
        <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--editor-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Düzen</label>
        <select className={styles.select} value={navbar.layout} onChange={e => updateNavbar('layout', e.target.value)}>
          <option value="classic">Klasik</option>
          <option value="centered">Ortalı</option>
          <option value="mega">Mega</option>
        </select>
      </div>
      <div>
        <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--editor-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Logo Metni</label>
        <input className={styles.input} type="text" value={navbar.logoText || ''} onChange={e => updateNavbar('logoText', e.target.value)} placeholder="Mağaza Adı" />
      </div>
      <div>
        <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--editor-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Logo URL</label>
        <input className={styles.input} type="text" value={navbar.logoUrl || ''} onChange={e => updateNavbar('logoUrl', e.target.value)} placeholder="https://..." />
      </div>
      <label className={styles.toggleRow}>
        <input type="checkbox" checked={navbar.isSticky} onChange={e => updateNavbar('isSticky', e.target.checked)} />
        <span>Sticky Header</span>
      </label>
      <label className={styles.toggleRow}>
        <input type="checkbox" checked={navbar.showSearch} onChange={e => updateNavbar('showSearch', e.target.checked)} />
        <span>Arama Kutusu</span>
      </label>
      <label className={styles.toggleRow}>
        <input type="checkbox" checked={navbar.showLanguagePicker} onChange={e => updateNavbar('showLanguagePicker', e.target.checked)} />
        <span>Dil Seçici</span>
      </label>

      <div style={{ borderTop: '1px solid var(--editor-border)', paddingTop: '10px' }}>
        <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--editor-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Menü Linkleri</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navLinks.map((link, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '4px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <input className={styles.input} type="text" value={link.label} onChange={e => { const u = navLinks.map((l, i) => i === idx ? { ...l, label: e.target.value } : l); updateNavbar('links', u); }} placeholder="Link Metni" />
                <input className={styles.input} type="text" value={link.href} onChange={e => { const u = navLinks.map((l, i) => i === idx ? { ...l, href: e.target.value } : l); updateNavbar('links', u); }} placeholder="URL" />
              </div>
              <button type="button" className={styles.toolbarBtn} style={{ color: '#ef4444' }} onClick={() => { updateNavbar('links', navLinks.filter((_, i) => i !== idx)); }}>×</button>
            </div>
          ))}
          <button type="button" className={styles.addRowBtn} onClick={() => updateNavbar('links', [...navLinks, { label: 'Yeni Link', href: '#' }])}>
            + Link Ekle
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Footer Properties Panel ────────────────────────────────────────────────────

function FooterPropertiesPanel() {
  const { state, dispatch } = useEditor();
  const { footer } = state.globalComponents;

  const updateFooter = (key: string, value: unknown) =>
    dispatch({
      type: 'SET_GLOBAL_COMPONENTS',
      globalComponents: {
        ...state.globalComponents,
        footer: { ...footer, [key]: value },
      },
    });

  const footerCols = footer.columns || [];

  return (
    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div>
        <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--editor-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Kolon Sayısı</label>
        <select className={styles.select} value={String(footer.columnCount)} onChange={e => updateFooter('columnCount', Number(e.target.value))}>
          <option value="1">1 Kolon</option>
          <option value="2">2 Kolon</option>
          <option value="3">3 Kolon</option>
          <option value="4">4 Kolon</option>
        </select>
      </div>
      <div>
        <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--editor-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Telif Metni</label>
        <input className={styles.input} type="text" value={footer.copyrightText} onChange={e => updateFooter('copyrightText', e.target.value)} placeholder="© 2026 Mağazam" />
      </div>
      <label className={styles.toggleRow}>
        <input type="checkbox" checked={footer.showSocials} onChange={e => updateFooter('showSocials', e.target.checked)} />
        <span>Sosyal İkonlar</span>
      </label>
      <label className={styles.toggleRow}>
        <input type="checkbox" checked={footer.showNewsletter} onChange={e => updateFooter('showNewsletter', e.target.checked)} />
        <span>Newsletter</span>
      </label>

      <div style={{ borderTop: '1px solid var(--editor-border)', paddingTop: '10px' }}>
        <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--editor-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Footer Kolonlar</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Array.from({ length: footer.columnCount }).map((_, colIdx) => {
            const col = footerCols[colIdx] || { title: `Kolon ${colIdx + 1}`, links: [] };
            return (
              <div key={colIdx} style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid var(--editor-border)' }}>
                <input className={styles.input} type="text" value={col.title} onChange={e => {
                  const updated = Array.from({ length: footer.columnCount }).map((_, i) => {
                    const existing = footerCols[i] || { title: `Kolon ${i + 1}`, links: [] };
                    return i === colIdx ? { ...existing, title: e.target.value } : existing;
                  });
                  updateFooter('columns', updated);
                }} placeholder={`Kolon ${colIdx + 1} Başlığı`} style={{ marginBottom: '6px' }} />
                {col.links && col.links.map((link, lIdx) => (
                  <div key={lIdx} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    <input className={styles.input} style={{ flex: 1 }} type="text" value={link.label} placeholder="Etiket" onChange={e => {
                      const updated = Array.from({ length: footer.columnCount }).map((_, i) => {
                        const existing = footerCols[i] || { title: `Kolon ${i + 1}`, links: [] };
                        if (i !== colIdx) return existing;
                        return { ...existing, links: existing.links.map((l, li) => li === lIdx ? { ...l, label: e.target.value } : l) };
                      });
                      updateFooter('columns', updated);
                    }} />
                    <input className={styles.input} style={{ flex: 1 }} type="text" value={link.href} placeholder="URL" onChange={e => {
                      const updated = Array.from({ length: footer.columnCount }).map((_, i) => {
                        const existing = footerCols[i] || { title: `Kolon ${i + 1}`, links: [] };
                        if (i !== colIdx) return existing;
                        return { ...existing, links: existing.links.map((l, li) => li === lIdx ? { ...l, href: e.target.value } : l) };
                      });
                      updateFooter('columns', updated);
                    }} />
                    <button type="button" style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }} onClick={() => {
                      const updated = Array.from({ length: footer.columnCount }).map((_, i) => {
                        const existing = footerCols[i] || { title: `Kolon ${i + 1}`, links: [] };
                        if (i !== colIdx) return existing;
                        return { ...existing, links: existing.links.filter((_, li) => li !== lIdx) };
                      });
                      updateFooter('columns', updated);
                    }}>×</button>
                  </div>
                ))}
                <button type="button" className={styles.addRowBtn} style={{ fontSize: '10px', padding: '4px 8px' }} onClick={() => {
                  const updated = Array.from({ length: footer.columnCount }).map((_, i) => {
                    const existing = footerCols[i] || { title: `Kolon ${i + 1}`, links: [] };
                    if (i !== colIdx) return existing;
                    return { ...existing, links: [...existing.links, { label: 'Yeni Link', href: '#' }] };
                  });
                  updateFooter('columns', updated);
                }}>+ Link Ekle</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function PropertiesPanel() {
  const { state, dispatch, selectProp } = useEditor();
  const { selectedComponentId, selectedRowId, selectedColumnId, layout, theme, selectedPropKey } = state;

  const comp = selectedComponentId && selectedComponentId !== 'global-navbar' && selectedComponentId !== 'global-footer'
    ? findComponentInRows(layout, selectedComponentId)
    : null;
  const colContext = selectedColumnId && !selectedComponentId
    ? findColumnInRows(layout, selectedColumnId)
    : null;

  const [propTab, setPropTab] = useState<PropTab>('props');
  const [copied, setCopied] = useState(false);

  // Modal-based array editing state
  const [editingField, setEditingField] = useState<PropField | null>(null);
  const [editingRows, setEditingRows] = useState<RowData[]>([]);
  const [expandedRowIdx, setExpandedRowIdx] = useState<number | null>(null);

  // Global Navbar selected
  if (selectedComponentId === 'global-navbar') {
    return (
      <div className={styles.panel}>
        <div className={styles.panelHeader} style={{ borderBottom: '1px solid var(--editor-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaCompass size={12} color="#ec4899" />
          <span>Navbar Özellikleri</span>
        </div>
        <NavbarPropertiesPanel />
      </div>
    );
  }

  // Global Footer selected
  if (selectedComponentId === 'global-footer') {
    return (
      <div className={styles.panel}>
        <div className={styles.panelHeader} style={{ borderBottom: '1px solid var(--editor-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaBorderAll size={12} color="#ec4899" />
          <span>Footer Özellikleri</span>
        </div>
        <FooterPropertiesPanel />
      </div>
    );
  }

  // Row selected — no component, no column
  if (selectedRowId && !selectedComponentId && !selectedColumnId) {
    return (
      <div className={styles.panel}>
        <div className={styles.panelHeader} style={{ borderBottom: '1px solid var(--editor-border)' }}>
          <span>Satir Ayarlari</span>
        </div>
        <RowSettingsPanel />
      </div>
    );
  }

  // Column selected — no component
  if ((selectedColumnId || colContext) && !selectedComponentId) {
    return (
      <div className={styles.panel}>
        <div className={styles.panelHeader} style={{ borderBottom: '1px solid var(--editor-border)' }}>
          <span>Kolon Ayarlari</span>
        </div>
        <ColumnSettingsPanel />
      </div>
    );
  }

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
    dispatch({ type: 'UPDATE_COMPONENT_PROPS', componentId: comp.id, props: { [propKey]: val } });
  };

  const handleCopyCss = () => {
    const css = def?.toCss?.(comp.props, theme) ?? '';
    navigator.clipboard.writeText(css).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => { /* clipboard erisimi basarisiz */ });
  };

  return (
    <div className={styles.panel}>
      {/* Tab Bar */}
      <div className={styles.rightTabBar}>
        <button
          className={`${styles.rightTab} ${propTab === 'props' ? styles.rightTabActive : ''}`}
          onClick={() => setPropTab('props')}
          type="button"
        >
          Ozellikler
        </button>
        <button
          className={`${styles.rightTab} ${propTab === 'inspect' ? styles.rightTabActive : ''}`}
          onClick={() => setPropTab('inspect')}
          type="button"
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
          onOpenArrayModal={(field) => {
            const rowsVal = comp.props[field.field];
            const rows = Array.isArray(rowsVal) ? (rowsVal as RowData[]) : [];
            setEditingField(field);
            setEditingRows(JSON.parse(JSON.stringify(rows)));
            setExpandedRowIdx(rows.length > 0 ? 0 : null);
          }}
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

      {/* Phase 1: Array Editor Modal */}
      {editingField && (
        <ArrayFieldModal
          isOpen={!!editingField}
          field={editingField}
          rows={editingRows}
          expandedIdx={expandedRowIdx}
          onClose={() => setEditingField(null)}
          onSave={(nextRows) => {
            update(editingField.field, nextRows);
            setEditingField(null);
            toast.success('Degisiklikler basariyla kaydedildi!', {
              style: {
                background: 'var(--bg-secondary, #18181b)',
                color: 'var(--text-main, #ffffff)',
                border: '1px solid var(--color-success, #10b981)',
              },
            });
          }}
        />
      )}
    </div>
  );
}
