import React, { useState } from 'react';
import type { ReportElement, ReportElementStyle } from '../types';
import { PropertiesIcon } from './icons';

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
      className="w-full flex items-center justify-between px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
      style={{ background: 'var(--surface-hover)' }}
    >
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <svg className={`w-4 h-4 text-gray-500 transition-transform ${collapsedSections.has(id) ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );

  const renderCanvasControls = () => (
    <div className="space-y-4 mb-6">
      <SectionHeader id="canvas" label="🎛️ Canvas Kontrolleri" />
      {!collapsedSections.has('canvas') && (
        <div className="space-y-3 pl-2">
          {[
            { label: 'Cetvel', state: showRulers, set: setShowRulers, on: '📏 Açık', off: '📐 Kapalı', color: 'bg-blue-500' },
            { label: 'Hizalama', state: showAlignmentGuides, set: setShowAlignmentGuides, on: '📐 Açık', off: '📏 Kapalı', color: 'bg-purple-500' },
            { label: 'Izgara', state: snapToGrid, set: setSnapToGrid, on: '🔗 Açık', off: '🔓 Kapalı', color: 'bg-green-500' },
            { label: 'Otomatik Boyut', state: autoResize, set: setAutoResize, on: '🔲 Açık', off: '📐 Kapalı', color: 'bg-orange-500' },
          ].map(({ label, state, set, on, off, color }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
              <button
                onClick={() => set(!state)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${state ? `${color} text-white` : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                {state ? on : off}
              </button>
            </div>
          ))}
          {snapToGrid && (
            <div className="space-y-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">Izgara Boyutu</span>
              <select value={gridSize} onChange={(e) => setGridSize(Number(e.target.value))}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {[5, 10, 20, 50].map(v => <option key={v} value={v}>{v}px</option>)}
              </select>
            </div>
          )}
          <div className="space-y-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">Yakınlaştırma</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setZoom(Math.max(25, zoom - 25))} className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 transition-colors">➖</button>
              <span className="text-xs text-gray-600 dark:text-gray-400 flex-1 text-center">{zoom}%</span>
              <button onClick={() => setZoom(Math.min(200, zoom + 25))} className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 transition-colors">➕</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!selectedElement) {
    return (
      <div className="w-full h-full bg-white dark:bg-gray-800 p-4 flex flex-col">
        {renderCanvasControls()}
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <PropertiesIcon className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
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

  const inputCls = 'w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

  const renderTextProperties = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">İçerik</label>
        <input type="text" value={selectedElement.content} onChange={(e) => handleContentChange(e.target.value)} className={inputCls} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Yazı Tipi</label>
          <select value={selectedElement.style.fontFamily || 'Arial'} onChange={(e) => handleStyleChange('fontFamily', e.target.value)} className={inputCls}>
            {['Arial', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia'].map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Boyut</label>
          <input type="number" value={selectedElement.style.fontSize || 12} onChange={(e) => handleStyleChange('fontSize', Number(e.target.value))} min="8" max="72" className={inputCls} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Yazı Rengi</label>
        <input type="color" value={selectedElement.style.color || '#000000'} onChange={(e) => handleStyleChange('color', e.target.value)} className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hizalama</label>
        <select value={selectedElement.style.textAlign || 'left'} onChange={(e) => handleStyleChange('textAlign', e.target.value)} className={inputCls}>
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
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Resim Yükle</label>
        <input type="file" accept="image/*" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) { const r = new FileReader(); r.onloadend = () => handleStyleChange('imageUrl', r.result); r.readAsDataURL(file); }
        }} className={inputCls} />
      </div>
      {selectedElement.style.imageUrl && (
        <div className="border border-gray-300 rounded-md p-2">
          <img src={selectedElement.style.imageUrl} alt="Preview" className="w-full h-20 object-contain" />
        </div>
      )}
    </div>
  );

  const renderBarcodeProperties = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Barkod İçeriği</label>
        <input type="text" value={selectedElement.content} onChange={(e) => handleContentChange(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Barkod Tipi</label>
        <select value={(selectedElement.properties.barcodeType as string) || 'code128'} onChange={(e) => onElementUpdate({ ...selectedElement, properties: { ...selectedElement.properties, barcodeType: e.target.value } })} className={inputCls}>
          {[['code128', 'Code 128'], ['ean13', 'EAN-13'], ['ean8', 'EAN-8'], ['upc', 'UPC'], ['qr', 'QR Code']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
    </div>
  );

  const renderCommonProperties = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Genişlik</label>
          <input type="number" value={selectedElement.size.width} onChange={(e) => handleSizeChange('width', Number(e.target.value))} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Yükseklik</label>
          <input type="number" value={selectedElement.size.height} onChange={(e) => handleSizeChange('height', Number(e.target.value))} className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Arka Plan</label>
          <input type="color" value={selectedElement.style.backgroundColor || '#ffffff'} onChange={(e) => handleStyleChange('backgroundColor', e.target.value)} className="w-full h-10 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kenarlık</label>
          <input type="color" value={selectedElement.style.borderColor || '#000000'} onChange={(e) => handleStyleChange('borderColor', e.target.value)} className="w-full h-10 border border-gray-300 rounded-md" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kenarlık Kalınlığı</label>
        <input type="number" value={selectedElement.style.borderWidth || 0} onChange={(e) => handleStyleChange('borderWidth', Number(e.target.value))} min="0" max="10" className={inputCls} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Köşe Yuvarlaklığı</label>
        <input type="number" value={selectedElement.style.borderRadius || 0} onChange={(e) => handleStyleChange('borderRadius', Number(e.target.value))} min="0" max="50" className={inputCls} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Şeffaflık</label>
        <input type="range" min="0" max="100" value={(selectedElement.style.opacity || 1) * 100} onChange={(e) => handleStyleChange('opacity', Number(e.target.value) / 100)} className="w-full" />
        <div className="text-sm text-gray-500 text-center mt-1">{Math.round((selectedElement.style.opacity || 1) * 100)}%</div>
      </div>
    </div>
  );

  const renderSpecificProperties = () => {
    switch (selectedElement.type) {
      case 'text': case 'variable': return renderTextProperties();
      case 'logo': case 'image': return renderImageProperties();
      case 'barcode': return renderBarcodeProperties();
      default: return null;
    }
  };

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 p-4 flex flex-col">
      <div className="flex-shrink-0 mb-4">{renderCanvasControls()}</div>
      <div className="flex-1 overflow-y-auto space-y-6">
        <div className="space-y-4">
          <SectionHeader id="element" label={
            selectedElement.type === 'text' ? '📝 Metin Özellikleri' :
            selectedElement.type === 'logo' ? '🖼️ Logo Özellikleri' :
            selectedElement.type === 'image' ? '🖼️ Resim Özellikleri' :
            selectedElement.type === 'barcode' ? '📊 Barkod Özellikleri' : '⚙️ Genel Özellikler'
          } />
          {!collapsedSections.has('element') && <div className="pl-2">{renderSpecificProperties()}</div>}
        </div>
        <div className="space-y-4">
          <SectionHeader id="appearance" label="🎨 Görünüm" />
          {!collapsedSections.has('appearance') && <div className="pl-2">{renderCommonProperties()}</div>}
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
