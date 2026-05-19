import React, { useState } from 'react';
import type { ReportElement, ReportElementStyle } from '../types';
import { PropertiesIcon } from './icons';
import s from './propertiesPanel.module.css';

interface PropertiesPanelProps {
  selectedElement: ReportElement | null;
  onElementUpdate: (element: ReportElement) => void;
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
}

const panelStyle: React.CSSProperties = {
  background: 'var(--surface)',
  color: 'var(--text-main)',
};

const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <label className={s.panelLabel}>{label}</label>
    <div className={s.colorWrapper}>
      <div className={s.colorSwatch} style={{ backgroundColor: value }} />
      <span className={s.colorLabel}>{value.toUpperCase()}</span>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  </div>
);

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedElement,
  onElementUpdate,
  showRulers, setShowRulers,
  showAlignmentGuides, setShowAlignmentGuides,
  snapToGrid, setSnapToGrid,
  gridSize, setGridSize,
  autoResize, setAutoResize,
  zoom, setZoom,
}) => {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = (id: string) => {
    const next = new Set(collapsedSections);
    if (next.has(id)) next.delete(id); else next.add(id);
    setCollapsedSections(next);
  };

  const SectionHeader = ({ id, label }: { id: string; label: string }) => (
    <button
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between px-2 py-1.5 rounded-md transition-colors"
      style={{ background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}
    >
      <span className="text-sm font-medium">{label}</span>
      <svg className={`w-4 h-4 transition-transform ${collapsedSections.has(id) ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );

  const renderCanvasControls = () => (
    <div className="space-y-3 mb-5">
      <SectionHeader id="canvas" label="🎛️ Canvas Kontrolleri" />
      {!collapsedSections.has('canvas') && (
        <div className="space-y-3 pl-2">
          {[
            { label: 'Cetvel', state: showRulers, set: setShowRulers, color: 'bg-blue-500' },
            { label: 'Hizalama', state: showAlignmentGuides, set: setShowAlignmentGuides, color: 'bg-purple-500' },
            { label: 'Izgara Yapışması', state: snapToGrid, set: setSnapToGrid, color: 'bg-green-500' },
            { label: 'Otomatik Boyut', state: autoResize, set: setAutoResize, color: 'bg-orange-500' },
          ].map(({ label, state, set, color }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
              <button
                onClick={() => set(!state)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${state ? `${color} text-white` : ''}`}
                style={!state ? { background: 'var(--surface-hover)', color: 'var(--text-secondary)' } : {}}
              >
                {state ? 'Açık' : 'Kapalı'}
              </button>
            </div>
          ))}
          {snapToGrid && (
            <div className="space-y-1.5">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Izgara Boyutu</span>
              <select
                value={gridSize}
                onChange={(e) => setGridSize(Number(e.target.value))}
                className={s.panelInput}
              >
                {[5, 10, 20, 50].map(v => <option key={v} value={v}>{v}px</option>)}
              </select>
            </div>
          )}
          <div className="space-y-1.5">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Yakınlaştırma</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(Math.max(25, zoom - 25))}
                className="px-2 py-1 text-xs rounded-md transition-colors"
                style={{ background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}
              >
                ➖
              </button>
              <span className="text-xs flex-1 text-center" style={{ color: 'var(--text-secondary)' }}>{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                className="px-2 py-1 text-xs rounded-md transition-colors"
                style={{ background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}
              >
                ➕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!selectedElement) {
    return (
      <div className="w-full h-full p-4 flex flex-col" style={panelStyle}>
        {renderCanvasControls()}
        <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
          <div style={{ color: 'var(--text-muted)' }}><PropertiesIcon className="w-12 h-12 mx-auto mb-2" /></div>
          <p className="text-sm">Bir öğe seçin</p>
        </div>
      </div>
    );
  }

  const handleStyleChange = (property: keyof ReportElementStyle, value: unknown) => {
    onElementUpdate({ ...selectedElement, style: { ...selectedElement.style, [property]: value } });
  };

  const handleContentChange = (content: string) => onElementUpdate({ ...selectedElement, content });
  const handleSizeChange = (dim: 'width' | 'height', value: number) =>
    onElementUpdate({ ...selectedElement, size: { ...selectedElement.size, [dim]: value } });

  const renderTextProperties = () => (
    <div className="space-y-4">
      <div>
        <label className={s.panelLabel}>İçerik</label>
        <input
          type="text"
          value={selectedElement.content}
          onChange={(e) => handleContentChange(e.target.value)}
          className={s.panelInput}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={s.panelLabel}>Yazı Tipi</label>
          <select
            value={selectedElement.style.fontFamily || 'Arial'}
            onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
            className={s.panelInput}
          >
            {['Arial', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia'].map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={s.panelLabel}>Boyut (pt)</label>
          <input
            type="number"
            value={selectedElement.style.fontSize || 12}
            onChange={(e) => handleStyleChange('fontSize', Number(e.target.value))}
            min="8" max="72"
            className={s.panelInput}
          />
        </div>
      </div>
      <ColorPicker
        label="Yazı Rengi"
        value={selectedElement.style.color || '#000000'}
        onChange={(v) => handleStyleChange('color', v)}
      />
      <div>
        <label className={s.panelLabel}>Hizalama</label>
        <select
          value={selectedElement.style.textAlign || 'left'}
          onChange={(e) => handleStyleChange('textAlign', e.target.value)}
          className={s.panelInput}
        >
          <option value="left">Sol</option>
          <option value="center">Orta</option>
          <option value="right">Sağ</option>
          <option value="justify">İki Yana</option>
        </select>
      </div>
    </div>
  );

  const renderImageProperties = () => (
    <div className="space-y-4">
      <div>
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
        <div className="rounded-md p-2" style={{ border: '1px solid var(--border-glass)' }}>
          <img src={selectedElement.style.imageUrl} alt="Preview" className="w-full h-20 object-contain" />
        </div>
      )}
    </div>
  );

  const renderBarcodeProperties = () => (
    <div className="space-y-4">
      <div>
        <label className={s.panelLabel}>Barkod İçeriği</label>
        <input
          type="text"
          value={selectedElement.content}
          onChange={(e) => handleContentChange(e.target.value)}
          className={s.panelInput}
        />
      </div>
      <div>
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

  const renderCommonProperties = () => {
    const opacityPct = Math.round((selectedElement.style.opacity ?? 1) * 100);
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={s.panelLabel}>Genişlik (px)</label>
            <input
              type="number"
              value={selectedElement.size.width}
              onChange={(e) => handleSizeChange('width', Number(e.target.value))}
              className={s.panelInput}
            />
          </div>
          <div>
            <label className={s.panelLabel}>Yükseklik (px)</label>
            <input
              type="number"
              value={selectedElement.size.height}
              onChange={(e) => handleSizeChange('height', Number(e.target.value))}
              className={s.panelInput}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ColorPicker
            label="Arka Plan"
            value={selectedElement.style.backgroundColor || '#ffffff'}
            onChange={(v) => handleStyleChange('backgroundColor', v)}
          />
          <ColorPicker
            label="Kenarlık Rengi"
            value={selectedElement.style.borderColor || '#000000'}
            onChange={(v) => handleStyleChange('borderColor', v)}
          />
        </div>
        <div>
          <label className={s.panelLabel}>Kenarlık Kalınlığı</label>
          <input
            type="number"
            value={selectedElement.style.borderWidth ?? 0}
            onChange={(e) => handleStyleChange('borderWidth', Number(e.target.value))}
            min="0" max="10"
            className={s.panelInput}
          />
        </div>
        <div>
          <label className={s.panelLabel}>Köşe Yuvarlaklığı</label>
          <input
            type="number"
            value={selectedElement.style.borderRadius ?? 0}
            onChange={(e) => handleStyleChange('borderRadius', Number(e.target.value))}
            min="0" max="50"
            className={s.panelInput}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={s.panelLabel} style={{ marginBottom: 0 }}>Şeffaflık</label>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{opacityPct}%</span>
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
      default: return null;
    }
  };

  const elementLabel =
    selectedElement.type === 'text' ? '📝 Metin Özellikleri' :
    selectedElement.type === 'logo' ? '🖼️ Logo Özellikleri' :
    selectedElement.type === 'image' ? '🖼️ Resim Özellikleri' :
    selectedElement.type === 'barcode' ? '📊 Barkod Özellikleri' :
    selectedElement.type === 'variable' ? '🔤 Değişken Özellikleri' : '⚙️ Genel Özellikler';

  return (
    <div className="w-full h-full p-4 flex flex-col" style={panelStyle}>
      <div className="flex-shrink-0 mb-4">{renderCanvasControls()}</div>
      <div className="flex-1 overflow-y-auto space-y-5">
        <div className="space-y-3">
          <SectionHeader id="element" label={elementLabel} />
          {!collapsedSections.has('element') && (
            <div className="pl-1">{renderSpecificProperties()}</div>
          )}
        </div>
        <div className="space-y-3">
          <SectionHeader id="appearance" label="🎨 Görünüm" />
          {!collapsedSections.has('appearance') && (
            <div className="pl-1">{renderCommonProperties()}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
