import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ciktiSablonuApi, yaziciApi, type CiktiSablonu, type Yazici } from './mockData';
import type { ReportElement, DesignMode } from './types';
import Toolbox from './components/Toolbox';
import DesignCanvas from './components/DesignCanvas';
import PropertiesPanel from './components/PropertiesPanel';
import FormatToolbar from './components/FormatToolbar';
import BandOverlay from './components/BandOverlay';
import { SaveIcon, PreviewIcon, SettingsIcon } from './components/icons';
import './tailwind.css';

const CiktiTasarlamaPage: React.FC = () => {
  const [elements, setElements] = useState<ReportElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<ReportElement | null>(null);
  const [paperSize, setPaperSize] = useState<'A4' | 'A5' | 'Letter' | 'Legal' | 'Custom'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margins, setMargins] = useState({ top: 20, right: 20, bottom: 20, left: 20 });
  const [templates, setTemplates] = useState<CiktiSablonu[]>([]);
  const [printers, setPrinters] = useState<Yazici[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [selectedTemplateForUpdate, setSelectedTemplateForUpdate] = useState<CiktiSablonu | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isToolboxCollapsed, setIsToolboxCollapsed] = useState(false);
  const [isPropertiesCollapsed, setIsPropertiesCollapsed] = useState(false);
  const [showRulers, setShowRulers] = useState(true);
  const [showAlignmentGuides, setShowAlignmentGuides] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(10);
  const [autoResize, setAutoResize] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [designMode, setDesignMode] = useState<DesignMode>('freeform');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tRes, pRes] = await Promise.all([ciktiSablonuApi.getAll(), yaziciApi.getAll()]);
        if (tRes.success && tRes.data) setTemplates(tRes.data);
        if (pRes.success && pRes.data) {
          setPrinters(pRes.data);
          if (pRes.data.length > 0) setSelectedPrinter(String(pRes.data[0].id));
        }
      } catch {
        toast.error('Veriler yüklenirken bir hata oluştu');
      }
    };
    loadData();
  }, []);

  const handleElementAdd = (element: ReportElement) => {
    setElements(prev => [...prev, element]);
    setSelectedElement(element);
  };

  const handleElementUpdate = (updated: ReportElement) => {
    setElements(prev => prev.map(el => el.id === updated.id ? updated : el));
    if (selectedElement?.id === updated.id) setSelectedElement(updated);
  };

  const handleElementDelete = () => {
    if (selectedElement) {
      setElements(prev => prev.filter(el => el.id !== selectedElement.id));
      setSelectedElement(null);
      toast.success('Öğe silindi');
    }
  };

  const handleVisibilityToggle = (id: string) => {
    setElements(prev => prev.map(el =>
      el.id === id ? { ...el, style: { ...el.style, opacity: (el.style.opacity ?? 1) === 0 ? 1 : 0 } } : el,
    ));
    if (selectedElement?.id === id) setSelectedElement(null);
  };

  const handleLoadTemplate = async (templateId: number) => {
    try {
      const res = await ciktiSablonuApi.getById(templateId);
      if (res.success && res.data) {
        const data = JSON.parse(res.data.icerik);
        if (data?.elements) {
          setElements(data.elements);
          setPaperSize(data.paperSize || 'A4');
          setOrientation(data.orientation || 'portrait');
          setMargins(data.margins || { top: 20, right: 20, bottom: 20, left: 20 });
          setSelectedTemplateForUpdate(res.data);
          setShowTemplateManager(false);
          toast.success('Şablon başarıyla yüklendi');
        }
      }
    } catch {
      toast.error('Şablon yüklenirken bir hata oluştu');
    }
  };

  const handleSaveTemplateConfirm = async () => {
    if (!newTemplateName.trim()) { toast.error('Lütfen şablon adını giriniz'); return; }
    const templateData = { elements, paperSize, orientation, margins };

    if (selectedTemplateForUpdate) {
      setIsUpdating(true);
      try {
        const res = await ciktiSablonuApi.update({ ...selectedTemplateForUpdate, ad: newTemplateName.trim(), icerik: JSON.stringify(templateData), aciklama: newTemplateDescription.trim() || undefined });
        if (res.success && res.data) {
          setTemplates(prev => prev.map(t => t.id === res.data!.id ? res.data! : t));
          setShowSaveModal(false);
          setNewTemplateName(''); setNewTemplateDescription('');
          toast.success('Şablon başarıyla güncellendi');
        }
      } catch { toast.error('Şablon güncellenirken hata oluştu'); }
      finally { setIsUpdating(false); }
    } else {
      try {
        const res = await ciktiSablonuApi.create({ ad: newTemplateName.trim(), tip: 'fatura', varsayilan: false, icerik: JSON.stringify(templateData), aciklama: newTemplateDescription.trim() || undefined });
        if (res.success && res.data) {
          setTemplates(prev => [...prev, res.data!]);
          setShowSaveModal(false);
          setNewTemplateName(''); setNewTemplateDescription('');
          toast.success('Şablon başarıyla kaydedildi');
        }
      } catch { toast.error('Şablon kaydedilirken hata oluştu'); }
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!window.confirm('Bu şablonu silmek istediğinizden emin misiniz?')) return;
    try {
      const res = await ciktiSablonuApi.delete(templateId);
      if (res.success) {
        setTemplates(prev => prev.filter(t => t.id !== templateId));
        toast.success('Şablon başarıyla silindi');
      }
    } catch { toast.error('Şablon silinirken hata oluştu'); }
  };

  const handleNewTemplate = () => {
    setElements([]); setSelectedElement(null); setSelectedTemplateForUpdate(null);
    setPaperSize('A4'); setOrientation('portrait'); setMargins({ top: 20, right: 20, bottom: 20, left: 20 });
    toast.success('Yeni şablon oluşturuldu');
  };

  const handleEditTemplate = (template: CiktiSablonu) => {
    setSelectedTemplateForUpdate(template);
    setNewTemplateName(template.ad);
    setNewTemplateDescription(template.aciklama || '');
    setShowTemplateManager(false);
    setShowSaveModal(true);
  };

  const PreviewModal = () => {
    if (!showPreview) return null;
    const pageStyle: React.CSSProperties = {
      width: orientation === 'portrait' ? '210mm' : '297mm',
      height: orientation === 'portrait' ? '297mm' : '210mm',
      padding: `${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm`,
      position: 'relative',
      backgroundColor: 'white',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      margin: '20px auto',
    };
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 overflow-auto">
        <div style={{ background: 'var(--surface)', color: 'var(--text-main)' }} className="p-4 rounded-lg max-w-full max-h-full overflow-auto relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Önizleme</h2>
            <button onClick={() => setShowPreview(false)} className="p-2 hover:opacity-70" style={{ color: 'var(--text-muted)' }}>✕</button>
          </div>
          <div style={pageStyle}>
            {elements.map(element => (
              <div key={element.id} style={{ position: 'absolute', left: `${element.position.x}px`, top: `${element.position.y}px`, width: `${element.size.width}px`, height: `${element.size.height}px`, ...element.style }}>
                {element.type === 'logo' && element.style?.imageUrl
                  ? <img src={element.style.imageUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  : element.content}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const SaveTemplateModal = () => {
    if (!showSaveModal) return null;
    const isUpdate = selectedTemplateForUpdate !== null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
        <div style={{ background: 'var(--surface)', color: 'var(--text-main)' }} className="rounded-lg p-6 w-96 relative">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-main)' }}>{isUpdate ? 'Şablon Güncelle' : 'Şablon Kaydet'}</h2>
          <div className="mb-4">
            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Şablon Adı</label>
            <input type="text" value={newTemplateName} onChange={(e) => setNewTemplateName(e.target.value)} placeholder="Şablon adını giriniz" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ background: 'var(--surface)', color: 'var(--text-main)', borderColor: 'var(--border-glass)' }} autoFocus />
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Açıklama (Opsiyonel)</label>
            <textarea value={newTemplateDescription} onChange={(e) => setNewTemplateDescription(e.target.value)} placeholder="Şablon açıklaması giriniz" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" style={{ background: 'var(--surface)', color: 'var(--text-main)', borderColor: 'var(--border-glass)' }} rows={3} />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => { setShowSaveModal(false); setNewTemplateName(''); setNewTemplateDescription(''); }} className="px-4 py-2 rounded-md transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)', background: 'var(--surface-hover)' }}>İptal</button>
            <button onClick={handleSaveTemplateConfirm} disabled={isUpdating} className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 ${isUpdate ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'}`}>
              {isUpdating ? 'İşleniyor...' : isUpdate ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const TemplateManagerModal = () => {
    if (!showTemplateManager) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
        <div style={{ background: 'var(--surface)', color: 'var(--text-main)' }} className="rounded-lg p-6 w-4/5 max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-main)' }}>Şablon Yöneticisi</h2>
            <button onClick={() => setShowTemplateManager(false)} className="p-2 hover:opacity-70" style={{ color: 'var(--text-muted)' }}>✕</button>
          </div>
          <div className="flex-1 overflow-auto">
            {templates.length === 0
              ? <div className="text-center py-8 text-gray-500">Henüz kaydedilmiş şablon bulunmuyor.</div>
              : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map(template => (
                    <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow" style={{ background: 'var(--surface-hover)', borderColor: 'var(--border-glass)', color: 'var(--text-main)' }}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold" style={{ color: 'var(--text-main)' }}>{template.ad}</h3>
                        {template.varsayilan && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Varsayılan</span>}
                      </div>
                      {template.aciklama && <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{template.aciklama}</p>}
                      <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                        <div>Tip: {template.tip}</div>
                        {template.olusturma_tarihi && <div>Oluşturma: {new Date(template.olusturma_tarihi).toLocaleDateString('tr-TR')}</div>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleLoadTemplate(template.id)} className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors">Yükle</button>
                        <button onClick={() => handleEditTemplate(template)} className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors">Düzenle</button>
                        <button onClick={() => handleDeleteTemplate(template.id)} className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors">Sil</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-gray-100 dark:bg-gray-900" style={{ height: 'calc(100vh - 114px)', background: 'var(--bg-secondary)' }}>
      {/* Navbar */}
      <div className="z-40 flex-shrink-0" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border-glass)' }}>
        <div className="flex items-center gap-3 px-4" style={{ height: '48px' }}>

          {/* Title */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span style={{ color: 'var(--color-primary)' }}><SettingsIcon className="w-4 h-4" /></span>
            <span className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>Çıktı Tasarımcısı</span>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '20px', background: 'var(--border-glass)', flexShrink: 0 }} />

          {/* Design mode toggle */}
          <div style={{ display: 'flex', gap: 2, background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 6, padding: 2 }}>
            <button
              onClick={() => setDesignMode('freeform')}
              style={designMode === 'freeform'
                ? { background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }
                : { background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }
              }
              className="px-2 py-1 rounded text-xs font-medium"
            >
              Serbest
            </button>
            <button
              onClick={() => setDesignMode('banded')}
              style={designMode === 'banded'
                ? { background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }
                : { background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }
              }
              className="px-2 py-1 rounded text-xs font-medium"
            >
              Bantlı
            </button>
          </div>

          {/* Page setup pill */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)' }}>
            <select
              style={{ background: 'transparent', color: 'var(--text-main)', border: 'none', outline: 'none', fontSize: '12px', cursor: 'pointer' }}
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value as typeof paperSize)}
            >
              {['A4', 'A5', 'Letter', 'Legal'].map(sz => <option key={sz} value={sz}>{sz}</option>)}
            </select>
            <span style={{ color: 'var(--border-glass)', fontSize: '14px' }}>│</span>
            <select
              style={{ background: 'transparent', color: 'var(--text-main)', border: 'none', outline: 'none', fontSize: '12px', cursor: 'pointer' }}
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as typeof orientation)}
            >
              <option value="portrait">Dikey</option>
              <option value="landscape">Yatay</option>
            </select>
            <span style={{ color: 'var(--border-glass)', fontSize: '14px' }}>│</span>
            <select
              style={{ background: 'transparent', color: 'var(--text-main)', border: 'none', outline: 'none', fontSize: '12px', cursor: 'pointer', maxWidth: '140px' }}
              value={selectedPrinter}
              onChange={(e) => setSelectedPrinter(e.target.value)}
            >
              <option value="">Yazıcı Seçin</option>
              {printers.map(p => <option key={p.id} value={p.id}>{p.ad}</option>)}
            </select>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {selectedElement && (
              <button
                onClick={handleElementDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-opacity hover:opacity-80"
                style={{ background: '#ef4444', color: '#fff' }}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Sil
              </button>
            )}
            <button
              onClick={handleNewTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-opacity hover:opacity-80"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Yeni
            </button>
            <button
              onClick={() => setShowTemplateManager(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-opacity hover:opacity-80"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}
            >
              <SettingsIcon className="w-3 h-3" />
              Şablonlar
            </button>
            <button
              onClick={() => {
                if (selectedTemplateForUpdate) {
                  setNewTemplateName(selectedTemplateForUpdate.ad);
                  setNewTemplateDescription(selectedTemplateForUpdate.aciklama || '');
                } else {
                  setNewTemplateName('');
                  setNewTemplateDescription('');
                }
                setShowSaveModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white transition-opacity hover:opacity-80"
              style={{ background: 'var(--color-primary, #3b82f6)' }}
            >
              <SaveIcon className="w-3 h-3" />
              {selectedTemplateForUpdate ? 'Güncelle' : 'Kaydet'}
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-opacity hover:opacity-80"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}
            >
              <PreviewIcon className="w-3 h-3" />
              Önizle
            </button>
            <button
              onClick={() => toast('PDF indirme yakında eklenecek', { icon: '📄' })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-opacity hover:opacity-80"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Format Toolbar */}
      <FormatToolbar selectedElement={selectedElement} onElementUpdate={handleElementUpdate} />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Toolbox */}
        <div className={`relative z-20 transition-all duration-300 ease-in-out overflow-hidden ${isToolboxCollapsed ? 'w-0' : 'w-64'}`} style={{ background: 'var(--surface)', borderRight: '1px solid var(--border-glass)' }}>
          {!isToolboxCollapsed && (
            <>
              <div className="flex items-center justify-between p-3" style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>Araç Kutusu</h3>
                <button onClick={() => setIsToolboxCollapsed(true)} className="p-1 rounded-full transition-colors hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="overflow-y-auto" style={{ height: 'calc(100% - 48px)' }}>
                <Toolbox onElementAdd={handleElementAdd} />
              </div>
            </>
          )}
        </div>

        {/* Toolbox collapsed tab */}
        {isToolboxCollapsed && (
          <div
            onClick={() => setIsToolboxCollapsed(false)}
            className="flex items-center justify-center cursor-pointer z-20 transition-opacity hover:opacity-70"
            style={{
              width: '24px',
              minWidth: '24px',
              writingMode: 'vertical-rl',
              background: 'var(--surface)',
              borderRight: '1px solid var(--border-glass)',
              borderLeft: '3px solid var(--color-primary)',
            }}
            title="Araç Kutusunu Aç"
          >
            <span className="text-xs font-semibold py-3 select-none" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
              ARAÇLAR
            </span>
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 relative z-0 overflow-hidden">
          <DesignCanvas
            elements={elements}
            selectedElement={selectedElement}
            onElementSelect={setSelectedElement}
            onElementUpdate={handleElementUpdate}
            onElementAdd={handleElementAdd}
            paperSize={paperSize}
            orientation={orientation}
            margins={margins}
            showRulers={showRulers}
            showAlignmentGuides={showAlignmentGuides}
            snapToGrid={snapToGrid}
            gridSize={gridSize}
            autoResize={autoResize}
            zoom={zoom}
          />
          {designMode === 'banded' && <BandOverlay />}
        </div>

        {/* Properties collapsed tab */}
        {isPropertiesCollapsed && (
          <div
            onClick={() => setIsPropertiesCollapsed(false)}
            className="flex items-center justify-center cursor-pointer z-20 transition-opacity hover:opacity-70"
            style={{
              width: '24px',
              minWidth: '24px',
              writingMode: 'vertical-rl',
              background: 'var(--surface)',
              borderLeft: '1px solid var(--border-glass)',
              borderRight: '3px solid var(--color-primary)',
            }}
            title="Özellikler Paneli Aç"
          >
            <span className="text-xs font-semibold py-3 select-none" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
              ÖZELLİKLER
            </span>
          </div>
        )}

        {/* Properties Panel */}
        <div className={`relative z-20 transition-all duration-300 ease-in-out flex flex-col overflow-hidden ${isPropertiesCollapsed ? 'w-0' : 'w-96'}`} style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border-glass)' }}>
          {!isPropertiesCollapsed && (
            <>
              <div className="flex-shrink-0 flex items-center justify-between p-3" style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>Özellikler</h3>
                <button onClick={() => setIsPropertiesCollapsed(true)} className="p-1 rounded-full transition-colors hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto">
                <PropertiesPanel
                  selectedElement={selectedElement}
                  onElementUpdate={handleElementUpdate}
                  onElementSelect={setSelectedElement}
                  showRulers={showRulers} setShowRulers={setShowRulers}
                  showAlignmentGuides={showAlignmentGuides} setShowAlignmentGuides={setShowAlignmentGuides}
                  snapToGrid={snapToGrid} setSnapToGrid={setSnapToGrid}
                  gridSize={gridSize} setGridSize={setGridSize}
                  autoResize={autoResize} setAutoResize={setAutoResize}
                  zoom={zoom} setZoom={setZoom}
                  elements={elements}
                  onVisibilityToggle={handleVisibilityToggle}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <PreviewModal />
      <SaveTemplateModal />
      <TemplateManagerModal />
    </div>
  );
};

export default CiktiTasarlamaPage;
