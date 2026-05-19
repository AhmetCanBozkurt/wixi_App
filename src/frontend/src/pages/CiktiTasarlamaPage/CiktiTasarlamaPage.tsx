import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ciktiSablonuApi, yaziciApi, type CiktiSablonu, type Yazici } from './mockData';
import type { ReportElement } from './types';
import Toolbox from './components/Toolbox';
import DesignCanvas from './components/DesignCanvas';
import PropertiesPanel from './components/PropertiesPanel';
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
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-40 flex-shrink-0" style={{ background: 'var(--surface)', borderColor: 'var(--border-glass)' }}>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Çıktı Tasarımcısı</h1>
            <div className="flex items-center gap-2 text-gray-500">
              <SettingsIcon className="w-4 h-4" />
              <span className="text-xs">Rapor / Fatura Tasarımı</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select style={{ background: 'var(--surface)', color: 'var(--text-main)', borderColor: 'var(--border-glass)' }} className="px-2 py-1.5 text-xs border rounded-md" value={paperSize} onChange={(e) => setPaperSize(e.target.value as typeof paperSize)}>
              {['A4', 'A5', 'Letter', 'Legal'].map(sz => <option key={sz} value={sz}>{sz}</option>)}
            </select>
            <select style={{ background: 'var(--surface)', color: 'var(--text-main)', borderColor: 'var(--border-glass)' }} className="px-2 py-1.5 text-xs border rounded-md" value={orientation} onChange={(e) => setOrientation(e.target.value as typeof orientation)}>
              <option value="portrait">Dikey</option>
              <option value="landscape">Yatay</option>
            </select>
            <select style={{ background: 'var(--surface)', color: 'var(--text-main)', borderColor: 'var(--border-glass)' }} className="px-2 py-1.5 text-xs border rounded-md" value={selectedPrinter} onChange={(e) => setSelectedPrinter(e.target.value)}>
              <option value="">Yazıcı Seçin</option>
              {printers.map(p => <option key={p.id} value={p.id}>{p.ad}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {selectedElement && (
              <button onClick={handleElementDelete} className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-xs">
                <span>Sil</span>
              </button>
            )}
            <button onClick={handleNewTemplate} className="px-3 py-1.5 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors text-xs">+ Yeni</button>
            <button onClick={() => setShowTemplateManager(true)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-xs">
              <SettingsIcon className="w-3 h-3" /> Şablonlar
            </button>
            <button onClick={() => { if (selectedTemplateForUpdate) { setNewTemplateName(selectedTemplateForUpdate.ad); setNewTemplateDescription(selectedTemplateForUpdate.aciklama || ''); } else { setNewTemplateName(''); setNewTemplateDescription(''); } setShowSaveModal(true); }}
              className={`flex items-center gap-1 px-3 py-1.5 text-white rounded-md transition-colors text-xs ${selectedTemplateForUpdate ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'}`}>
              <SaveIcon className="w-3 h-3" /> {selectedTemplateForUpdate ? 'Güncelle' : 'Kaydet'}
            </button>
            <button onClick={() => setShowPreview(true)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-xs">
              <PreviewIcon className="w-3 h-3" /> Önizle
            </button>
            <button onClick={() => toast('PDF indirme yakında eklenecek', { icon: '📄' })} className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-xs">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              PDF
            </button>
          </div>
        </div>
      </div>

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
              <div className="overflow-y-auto h-full pb-12">
                <Toolbox onElementAdd={handleElementAdd} />
              </div>
            </>
          )}
        </div>

        {/* Toolbox collapsed tab */}
        {isToolboxCollapsed && (
          <div
            onClick={() => setIsToolboxCollapsed(false)}
            className="flex items-center justify-center cursor-pointer bg-blue-500 hover:bg-blue-600 transition-colors z-20"
            style={{ width: '24px', minWidth: '24px', writingMode: 'vertical-rl' }}
            title="Araç Kutusunu Aç"
          >
            <span className="text-white text-xs font-medium py-3 select-none" style={{ letterSpacing: '0.05em' }}>
              ◀ Araç Kutusu
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
        </div>

        {/* Properties collapsed tab */}
        {isPropertiesCollapsed && (
          <div
            onClick={() => setIsPropertiesCollapsed(false)}
            className="flex items-center justify-center cursor-pointer bg-blue-500 hover:bg-blue-600 transition-colors z-20"
            style={{ width: '24px', minWidth: '24px', writingMode: 'vertical-rl' }}
            title="Özellikler Paneli Aç"
          >
            <span className="text-white text-xs font-medium py-3 select-none" style={{ letterSpacing: '0.05em' }}>
              Özellikler ▶
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
                  showRulers={showRulers} setShowRulers={setShowRulers}
                  showAlignmentGuides={showAlignmentGuides} setShowAlignmentGuides={setShowAlignmentGuides}
                  snapToGrid={snapToGrid} setSnapToGrid={setSnapToGrid}
                  gridSize={gridSize} setGridSize={setGridSize}
                  autoResize={autoResize} setAutoResize={setAutoResize}
                  zoom={zoom} setZoom={setZoom}
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
