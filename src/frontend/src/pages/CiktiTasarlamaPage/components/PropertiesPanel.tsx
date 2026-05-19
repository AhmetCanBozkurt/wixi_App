import React, { useRef, useState } from 'react';
import type { ReportElement, ReportElementStyle } from '../types';
import { PropertiesIcon } from './icons';
import ReportExplorer from './ReportExplorer';
import s from './propertiesPanel.module.css';

interface PropertiesPanelProps {
  selectedElement: ReportElement | null;
  onElementUpdate: (element: ReportElement) => void;
  onElementSelect: (element: ReportElement) => void;
  showRulers: boolean;
  setShowRulers: (show: boolean) => void;
  showAlignmentGuides: boolean;
  setShowAlignmentGuides: (show: boolean) => void;
  snapToGrid: boolean;
  setSnapToGrid: (snap: boolean) => void;
  gridSize: number;
  setGridSize: (size: number) => void;
  autoResize: boolean;
  setAutoResize: (resize: boolean) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  elements: ReportElement[];
  onVisibilityToggle: (id: string) => void;
}

/* Reliable color picker: the native input is truly hidden (0×0, no pointer events)
   and we programmatically click it via a ref when the button is activated. */
const ColorPicker = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className={s.panelLabel}>{label}</label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={s.colorWrapper}
      >
        <div className={s.colorSwatch} style={{ backgroundColor: value }} />
        <span className={s.colorHex}>{value.toUpperCase()}</span>
        <svg className={s.colorChevron} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <input
        ref={inputRef}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
      />
    </div>
  );
};

const SectionHeader = ({
  id,
  label,
  collapsed,
  onToggle,
}: {
  id: string;
  label: string;
  collapsed: boolean;
  onToggle: (id: string) => void;
}) => (
  <button
    onClick={() => onToggle(id)}
    className={s.sectionHeader}
    style={{ borderLeft: `3px solid var(--color-primary)` }}
  >
    <span className={s.sectionLabel}>{label}</span>
    <svg
      className={s.sectionChevron}
      style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>
);

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedElement,
  onElementUpdate,
  onElementSelect,
  showRulers, setShowRulers,
  showAlignmentGuides, setShowAlignmentGuides,
  snapToGrid, setSnapToGrid,
  gridSize, setGridSize,
  autoResize, setAutoResize,
  zoom, setZoom,
  elements,
  onVisibilityToggle,
}) => {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = (id: string) => {
    const next = new Set(collapsedSections);
    if (next.has(id)) next.delete(id); else next.add(id);
    setCollapsedSections(next);
  };

  const renderExplorer = () => (
    <div className={s.section}>
      <SectionHeader id="explorer" label="🗂️ Rapor Gezgini" collapsed={collapsedSections.has('explorer')} onToggle={toggleSection} />
      {!collapsedSections.has('explorer') && (
        <div className={s.sectionBody} style={{ paddingLeft: 0, paddingRight: 0 }}>
          <ReportExplorer
            elements={elements}
            selectedElement={selectedElement}
            onSelect={onElementSelect}
            onVisibilityToggle={onVisibilityToggle}
          />
        </div>
      )}
    </div>
  );

  const renderCanvasControls = () => (
    <div className={s.section}>
      <SectionHeader id="canvas" label="🎛️ Canvas Kontrolleri" collapsed={collapsedSections.has('canvas')} onToggle={toggleSection} />
      {!collapsedSections.has('canvas') && (
        <div className={s.sectionBody}>
          {([
            ['Cetvel', showRulers, setShowRulers],
            ['Hizalama', showAlignmentGuides, setShowAlignmentGuides],
            ['Izgara Yapışması', snapToGrid, setSnapToGrid],
            ['Otomatik Boyut', autoResize, setAutoResize],
          ] as [string, boolean, (v: boolean) => void][]).map(([label, state, set]) => (
            <div key={label} className={s.toggleRow}>
              <span className={s.toggleLabel}>{label}</span>
              <button
                onClick={() => set(!state)}
                className={s.toggleBtn}
                style={
                  state
                    ? { background: 'var(--color-primary)', color: '#fff' }
                    : { background: 'var(--surface-hover)', color: 'var(--text-muted)' }
                }
              >
                {state ? 'Açık' : 'Kapalı'}
              </button>
            </div>
          ))}

          {snapToGrid && (
            <div className={s.field}>
              <label className={s.panelLabel}>Izgara Boyutu</label>
              <select value={gridSize} onChange={(e) => setGridSize(Number(e.target.value))} className={s.panelInput}>
                {[5, 10, 20, 50].map(v => <option key={v} value={v}>{v}px</option>)}
              </select>
            </div>
          )}

          <div className={s.field}>
            <label className={s.panelLabel}>Yakınlaştırma</label>
            <div className={s.zoomRow}>
              <button
                onClick={() => setZoom(Math.max(25, zoom - 25))}
                className={s.zoomBtn}
                title="Uzaklaştır"
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                </svg>
              </button>
              <span className={s.zoomValue}>{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                className={s.zoomBtn}
                title="Yakınlaştır"
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!selectedElement) {
    return (
      <div className={s.panel}>
        {renderExplorer()}
        <div className={s.divider} />
        {renderCanvasControls()}
        <div className={s.emptyState}>
          <div style={{ color: 'var(--text-muted)' }}>
            <PropertiesIcon className="w-10 h-10 mx-auto mb-2" />
          </div>
          <p className={s.emptyText}>Bir öğe seçin</p>
        </div>
      </div>
    );
  }

  const handleStyleChange = (property: keyof ReportElementStyle, value: unknown) =>
    onElementUpdate({ ...selectedElement, style: { ...selectedElement.style, [property]: value } });

  const handleContentChange = (content: string) =>
    onElementUpdate({ ...selectedElement, content });

  const handleSizeChange = (dim: 'width' | 'height', value: number) =>
    onElementUpdate({ ...selectedElement, size: { ...selectedElement.size, [dim]: value } });

  const renderTextProperties = () => (
    <div className={s.fieldGroup}>
      <div className={s.field}>
        <label className={s.panelLabel}>İçerik</label>
        <input type="text" value={selectedElement.content} onChange={(e) => handleContentChange(e.target.value)} className={s.panelInput} />
      </div>
      <div className={s.gridTwo}>
        <div className={s.field}>
          <label className={s.panelLabel}>Yazı Tipi</label>
          <select value={selectedElement.style.fontFamily || 'Arial'} onChange={(e) => handleStyleChange('fontFamily', e.target.value)} className={s.panelInput}>
            {['Arial', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia'].map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        <div className={s.field}>
          <label className={s.panelLabel}>Boyut (pt)</label>
          <input type="number" value={selectedElement.style.fontSize || 12} onChange={(e) => handleStyleChange('fontSize', Number(e.target.value))} min="8" max="72" className={s.panelInput} />
        </div>
      </div>
      <ColorPicker label="Yazı Rengi" value={selectedElement.style.color || '#000000'} onChange={(v) => handleStyleChange('color', v)} />
      <div className={s.field}>
        <label className={s.panelLabel}>Hizalama</label>
        <select value={selectedElement.style.textAlign || 'left'} onChange={(e) => handleStyleChange('textAlign', e.target.value)} className={s.panelInput}>
          <option value="left">Sol</option>
          <option value="center">Orta</option>
          <option value="right">Sağ</option>
          <option value="justify">İki Yana</option>
        </select>
      </div>
    </div>
  );

  const renderImageProperties = () => (
    <div className={s.fieldGroup}>
      <div className={s.field}>
        <label className={s.panelLabel}>Resim Yükle</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const r = new FileReader();
              r.onloadend = () => handleStyleChange('imageUrl', r.result);
              r.readAsDataURL(file);
            }
          }}
          className={s.panelInput}
        />
      </div>
      {selectedElement.style.imageUrl && (
        <div className={s.imagePreview}>
          <img src={selectedElement.style.imageUrl} alt="Önizleme" className="w-full h-20 object-contain" />
        </div>
      )}
    </div>
  );

  const renderBarcodeProperties = () => (
    <div className={s.fieldGroup}>
      <div className={s.field}>
        <label className={s.panelLabel}>Barkod İçeriği</label>
        <input type="text" value={selectedElement.content} onChange={(e) => handleContentChange(e.target.value)} className={s.panelInput} />
      </div>
      <div className={s.field}>
        <label className={s.panelLabel}>Barkod Tipi</label>
        <select
          value={(selectedElement.properties.barcodeType as string) || 'code128'}
          onChange={(e) => onElementUpdate({ ...selectedElement, properties: { ...selectedElement.properties, barcodeType: e.target.value } })}
          className={s.panelInput}
        >
          {[['code128', 'Code 128'], ['ean13', 'EAN-13'], ['ean8', 'EAN-8'], ['upc', 'UPC'], ['qr', 'QR Code']].map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderCheckboxProperties = () => {
    const isChecked = selectedElement.style.checked ?? false;
    return (
      <div className={s.fieldGroup}>
        <div className={s.field}>
          <label className={s.panelLabel}>Etiket</label>
          <input type="text" value={selectedElement.content} onChange={(e) => handleContentChange(e.target.value)} className={s.panelInput} />
        </div>
        <div className={s.toggleRow}>
          <span className={s.toggleLabel}>Varsayılan Durum</span>
          <button
            onClick={() => handleStyleChange('checked', !isChecked)}
            className={s.toggleBtn}
            style={
              isChecked
                ? { background: 'var(--color-primary)', color: '#fff' }
                : { background: 'var(--surface-hover)', color: 'var(--text-muted)' }
            }
          >
            {isChecked ? 'İşaretli' : 'Boş'}
          </button>
        </div>
      </div>
    );
  };

  const renderPageInfoProperties = () => (
    <div className={s.fieldGroup}>
      <div className={s.field}>
        <label className={s.panelLabel}>Format</label>
        <select
          value={(selectedElement.properties.pageInfoFormat as string) || 'pageNumber'}
          onChange={(e) => onElementUpdate({ ...selectedElement, properties: { ...selectedElement.properties, pageInfoFormat: e.target.value } })}
          className={s.panelInput}
        >
          <option value="pageNumber">Sayfa Numarası</option>
          <option value="totalPages">Toplam Sayfa</option>
          <option value="date">Tarih</option>
          <option value="datetime">Tarih ve Saat</option>
          <option value="author">Yazar</option>
          <option value="custom">Özel ({'{Sayfa}'} / {'{ToplamSayfa}'})</option>
        </select>
      </div>
    </div>
  );

  const renderRichTextProperties = () => (
    <div className={s.fieldGroup}>
      <div className={s.field}>
        <label className={s.panelLabel}>İçerik</label>
        <textarea
          value={selectedElement.content}
          onChange={(e) => handleContentChange(e.target.value)}
          className={s.panelInput}
          rows={4}
          style={{ resize: 'vertical' }}
        />
      </div>
    </div>
  );

  const renderCommonProperties = () => {
    const opacityPct = Math.round((selectedElement.style.opacity ?? 1) * 100);
    return (
      <div className={s.fieldGroup}>
        <div className={s.gridTwo}>
          <div className={s.field}>
            <label className={s.panelLabel}>Genişlik (px)</label>
            <input type="number" value={selectedElement.size.width} onChange={(e) => handleSizeChange('width', Number(e.target.value))} className={s.panelInput} />
          </div>
          <div className={s.field}>
            <label className={s.panelLabel}>Yükseklik (px)</label>
            <input type="number" value={selectedElement.size.height} onChange={(e) => handleSizeChange('height', Number(e.target.value))} className={s.panelInput} />
          </div>
        </div>
        <div className={s.gridTwo}>
          <ColorPicker label="Arka Plan" value={selectedElement.style.backgroundColor || '#ffffff'} onChange={(v) => handleStyleChange('backgroundColor', v)} />
          <ColorPicker label="Kenarlık Rengi" value={selectedElement.style.borderColor || '#000000'} onChange={(v) => handleStyleChange('borderColor', v)} />
        </div>
        <div className={s.field}>
          <label className={s.panelLabel}>Kenarlık Kalınlığı</label>
          <input type="number" value={selectedElement.style.borderWidth ?? 0} onChange={(e) => handleStyleChange('borderWidth', Number(e.target.value))} min="0" max="10" className={s.panelInput} />
        </div>
        <div className={s.field}>
          <label className={s.panelLabel}>Köşe Yuvarlaklığı</label>
          <input type="number" value={selectedElement.style.borderRadius ?? 0} onChange={(e) => handleStyleChange('borderRadius', Number(e.target.value))} min="0" max="50" className={s.panelInput} />
        </div>
        <div className={s.field}>
          <div className={s.opacityHeader}>
            <label className={s.panelLabel} style={{ marginBottom: 0 }}>Şeffaflık</label>
            <span className={s.opacityValue}>{opacityPct}%</span>
          </div>
          <input
            type="range"
            min="0" max="100"
            value={opacityPct}
            onChange={(e) => handleStyleChange('opacity', Number(e.target.value) / 100)}
            className={s.rangeInput}
          />
        </div>
      </div>
    );
  };

  const renderSpecificProperties = () => {
    switch (selectedElement.type) {
      case 'text': case 'variable': return renderTextProperties();
      case 'logo': case 'image': return renderImageProperties();
      case 'barcode': return renderBarcodeProperties();
      case 'checkbox': return renderCheckboxProperties();
      case 'pageInfo': return renderPageInfoProperties();
      case 'richText': return renderRichTextProperties();
      case 'panel': return null;
      default: return null;
    }
  };

  const elementLabel =
    selectedElement.type === 'text' ? '📝 Metin' :
    selectedElement.type === 'logo' ? '🖼️ Logo' :
    selectedElement.type === 'image' ? '🖼️ Resim' :
    selectedElement.type === 'barcode' ? '📊 Barkod' :
    selectedElement.type === 'variable' ? '🔤 Değişken' :
    selectedElement.type === 'table' ? '📋 Tablo' :
    selectedElement.type === 'line' ? '📏 Çizgi' :
    selectedElement.type === 'shape' ? '⬜ Şekil' :
    selectedElement.type === 'checkbox' ? '☑️ Onay Kutusu' :
    selectedElement.type === 'pageInfo' ? '📄 Sayfa Bilgisi' :
    selectedElement.type === 'richText' ? '📃 Zengin Metin' :
    selectedElement.type === 'panel' ? '▭ Panel' : '⚙️ Öğe';

  return (
    <div className={s.panel}>
      {renderExplorer()}

      <div className={s.divider} />

      {renderCanvasControls()}

      <div className={s.divider} />

      <div className={s.section}>
        <SectionHeader id="element" label={elementLabel} collapsed={collapsedSections.has('element')} onToggle={toggleSection} />
        {!collapsedSections.has('element') && (
          <div className={s.sectionBody}>{renderSpecificProperties()}</div>
        )}
      </div>

      <div className={s.section}>
        <SectionHeader id="appearance" label="🎨 Görünüm" collapsed={collapsedSections.has('appearance')} onToggle={toggleSection} />
        {!collapsedSections.has('appearance') && (
          <div className={s.sectionBody}>{renderCommonProperties()}</div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;
