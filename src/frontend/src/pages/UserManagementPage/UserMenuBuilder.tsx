import React, { useState, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Tree, DndProvider, getBackendOptions, MultiBackend } from '@minoru/react-dnd-treeview';
import type { NodeModel } from '@minoru/react-dnd-treeview';
import { FaPlus, FaTimes, FaSave, FaSearch, FaTrash, FaGlobe } from 'react-icons/fa';
import * as FaIconsList from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { apiClient } from '../../shared/api/axiosConfig';
import { DynamicIcon, Select, Switch } from '../../shared/ui';
import { useAuthStore } from '../../entities/User/model/store';
import styles from './UserManagementPage.module.css';

// --- TYPES ---
interface Language {
  id: string;
  code: string;
  name: string;
}

export interface UserMenuBuilderProps {
  userId: string;
  userName: string;
  onClose: () => void;
  isEmbedded?: boolean;
}

const SYSTEM_PAGES = [
  { name: '[ GRUP / BAŞLIK / KLASÖR ]', path: 'folder' },
  { name: 'Dashboard (Ana Sayfa)', path: '/' },
  { name: 'Menü Yönetimi', path: '/admin/menus' },
  { name: 'Kullanıcı Yönetimi', path: '/admin/users' },
  { name: 'Dil Yönetimi', path: '/admin/languages' },
  { name: 'Uygulama Logları (App Logs)', path: '/admin/logs' },
  { name: 'Sistem Değişiklik Logları (Audit)', path: '/admin/audit' },
  { name: 'UI Tasarım Vitrini (Showcase)', path: '/admin/ui-showcase' },
];

const POPULAR_ICONS = Object.keys(FaIconsList).filter(key => key.startsWith('Fa')).slice(0, 100);

// --- COMPONENT ---
export const UserMenuBuilder = forwardRef<{ syncHierarchy: () => void }, UserMenuBuilderProps>(({ userId, userName, onClose, isEmbedded }, ref) => {
  const [treeData, setTreeData] = useState<NodeModel<any>[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  useImperativeHandle(ref, () => ({
    syncHierarchy: handleSyncHierarchy
  }));

  // UI State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const { user: currentUser } = useAuthStore();
  
  const [formData, setFormData] = useState<any>({
    path: '/',
    icon: 'FaCircle',
    iconColor: '#3b82f6',
    sortOrder: 1,
    isVisible: true,
    translations: []
  });

  const fetchLanguages = useCallback(async () => {
    try {
      const resp = await apiClient.get<Language[]>('language');
      setLanguages(resp.data);
      return resp.data;
    } catch {
      toast.error('Diller yüklenemedi');
      return [];
    }
  }, []);

  const fetchUserMenus = useCallback(async (currentLangs: Language[]) => {
    try {
      const menusRes = await apiClient.get<any[]>(`usermanagement/users/${userId}/menus`);
      
      const mapped = menusRes.data.map(m => {
        const displayTitles = m.titles || {};
        const displayTitle = displayTitles['tr-TR'] || displayTitles['tr'] || Object.values(displayTitles)[0] || m.path || 'İsimsiz';
        
        return {
          id: m.id,
          parent: m.parentId || "0",
          text: displayTitle as string,
          droppable: true, // Allow nesting into any node
          data: {
            path: m.path,
            icon: m.icon,
            iconColor: m.iconColor,
            isVisible: m.isVisible,
            sortOrder: m.sortOrder,
            translations: currentLangs.map(lang => ({
              languageId: lang.id,
              title: displayTitles[lang.code] || ''
            }))
          }
        };
      });
      setTreeData(mapped);
    } catch {
      toast.error('Kullanıcı menüleri yüklenemedi.');
    } finally {
      setInitialLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const init = async () => {
      const langs = await fetchLanguages();
      if (langs.length > 0) {
        await fetchUserMenus(langs);
        // Initialize translations for the "Add New" state if nothing is selected
        setFormData(prev => ({
          ...prev,
          translations: langs.map(l => ({ languageId: l.id, title: '' }))
        }));
      }
    };
    init();
  }, [userId, fetchLanguages, fetchUserMenus]);

  // --- ACTIONS ---
  const handleSelectNode = (node: NodeModel<any>) => {
    setSelectedNodeId(node.id as string);
    setFormData({
      ...node.data,
      parentId: node.parent === "0" ? null : node.parent
    });
  };

  const handleAddNew = () => {
    setSelectedNodeId(null);
    setFormData({
      path: '/',
      icon: 'FaCircle',
      iconColor: '#3b82f6',
      sortOrder: treeData.length + 1,
      isVisible: true,
      translations: languages.map(l => ({ languageId: l.id, title: '' })),
      parentId: null
    });
  };

  const handleCopyNode = async () => {
    if (!selectedNodeId || isSaving) return;
    setIsSaving(true);
    try {
      await apiClient.post(`usermanagement/users/${userId}/menus`, { 
        userId: userId,
        ...formData,
        parentId: selectedNodeId 
      });
      toast.success('Menü kopyalandı (Alt kırılım olarak eklendi)');
      await fetchUserMenus(languages);
    } catch {
      toast.error('Kopyalama hatası');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNode = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (selectedNodeId) {
        await apiClient.put(`usermanagement/users/${userId}/menus`, { 
          id: selectedNodeId,
          userId: userId,
          ...formData 
        });
        toast.success('Menü güncellendi');
      } else {
        await apiClient.post(`usermanagement/users/${userId}/menus`, { 
          userId: userId,
          ...formData 
        });
        toast.success('Yeni menü eklendi');
      }
      await fetchUserMenus(languages);
    } catch {
      toast.error('Kaydetme hatası');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNode = async () => {
    if (!selectedNodeId || isSaving) return;
    
    const result = await Swal.fire({
      title: 'Silmek istediğinize emin misiniz?',
      text: "Bu menü düğümü ve altındaki her şey silinecek!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444'
    });

    if (result.isConfirmed) {
      setIsSaving(true);
      try {
        await apiClient.delete(`usermanagement/users/${userId}/menus/${selectedNodeId}`);
        toast.success('Menü silindi');
        setSelectedNodeId(null);
        await fetchUserMenus(languages);
      } catch {
        toast.error('Silme hatası');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDrop = (newTree: NodeModel<any>[]) => {
    setTreeData(newTree);
  };

  const handleSyncHierarchy = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const payload = treeData.map((node, index) => ({
        id: node.id,
        parentId: node.parent === "0" ? null : node.parent,
        sortOrder: index + 1
      }));
      await apiClient.post(`usermanagement/users/${userId}/menus/sync`, payload);
      toast.success('Hiyerarşi şeması buluta işlendi!');

      // If the admin is editing their own menu, notify the sidebar to refresh
      if (currentUser?.id === userId) {
        window.dispatchEvent(new CustomEvent('wixi-refresh-menu'));
      }
    } catch {
      toast.error('Senkronizasyon başarısız');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredIcons = useMemo(() => {
    if (!iconSearch) return POPULAR_ICONS;
    return Object.keys(FaIconsList).filter(key => 
      key.toLowerCase().includes(iconSearch.toLowerCase())
    ).slice(0, 100);
  }, [iconSearch]);

  const renderNode = (node: NodeModel<any>, { depth, isOpen, onToggle }: any) => {
    const isSelected = selectedNodeId === node.id;
    const isFolder = node.data?.path === 'folder';

    return (
      <div 
        className={`${styles.treeItemContainer} ${isSelected ? styles.selected : ''}`} 
        style={{ marginLeft: (depth * 12) + 5 }}
        onClick={() => handleSelectNode(node)}
      >
        <div 
          className={`${styles.carat} ${isOpen ? styles.open : ''}`} 
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          style={{ visibility: treeData.some(n => n.parent === node.id) ? 'visible' : 'hidden' }}
        >
          <DynamicIcon name="FaChevronRight" />
        </div>

        <div className={styles.treeIcon} style={{ color: isSelected ? '#fff' : node.data?.iconColor }}>
          <DynamicIcon name={node.data?.icon || (isFolder ? 'FaFolder' : 'FaCircle')} />
        </div>
        
        <div className={styles.treeText}>
          <span className={styles.treeTitle}>{node.text}</span>
        </div>
      </div>
    );
  };

  const content = (
    <div className={isEmbedded ? styles.embeddedDnd : styles.dndModal} style={!isEmbedded ? { height: '90vh', maxWidth: '1200px' } : {}} onClick={e => e.stopPropagation()}>
      {!isEmbedded && (
        <div className={styles.modalHeader}>
          <div>
             <h3>Kullanıcı Menü Mimarı: {userName}</h3>
             <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sürükleyerek ağaç yapısını oluşturun, sağ panelden detayları düzenleyin.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
             <button className={styles.addBtn} onClick={handleAddNew}>
               <FaPlus /> Yeni Menü/Klasör Ekle
             </button>
             <button className={styles.closeBtn} onClick={onClose}><FaTimes /></button>
          </div>
        </div>
      )}

      <div className={styles.modalBody}>
          <div className={styles.treePane}>
            {initialLoading ? (
              <div className={styles.placeholder}>Yükleniyor...</div>
            ) : treeData.length === 0 ? (
              <div className={styles.placeholder}>Henüz menü yok.</div>
            ) : (
              <Tree
                tree={treeData}
                rootId="0"
                sort={false}
                initialOpen={true}
                onDrop={handleDrop}
                render={renderNode}
                classes={{ 
                  root: styles.treeRoot,
                  draggingSource: styles.draggingSource,
                  placeholder: styles.dropPlaceholder
                }}
              />
            )}
          </div>

          <div className={styles.detailsPane}>
            <div className={styles.detailsHeader}>
                <h4>{selectedNodeId ? 'Menü Detayları' : 'Yeni Menü Tanımlama'}</h4>
            </div>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                  <Select 
                    label="Hedef Yol (Path)"
                    value={formData.path}
                    onChange={val => setFormData({...formData, path: val as string})}
                    options={SYSTEM_PAGES.map(p => ({ label: p.name, value: p.path }))}
                  />
              </div>
              <div className={styles.formGroup}>
                  <Switch 
                    label="Görünürlük"
                    description={formData.isVisible ? "Sidebar'da Gösteriliyor" : "Menü Gizli"}
                    checked={formData.isVisible}
                    onChange={e => setFormData({...formData, isVisible: e.target.checked})}
                  />
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginTop: '20px' }}>
              <label className={styles.formLabel}>İkon ve Renk</label>
              <div className={styles.iconRow}>
                  <div className={styles.iconDisplay} style={{ color: formData.iconColor }}>
                    <DynamicIcon name={formData.icon} />
                  </div>
                  <button className={styles.selectIconBtn} onClick={() => setIsIconPickerOpen(true)}>İkon Değiştir</button>
                  <input type="color" className={styles.colorPicker} value={formData.iconColor} onChange={e => setFormData({...formData, iconColor: e.target.value})} />
              </div>
            </div>

            <div className={styles.sectionTitle}><FaGlobe /> Çoklu Dil Başlıkları</div>
            <div className={styles.translationsList}>
              {formData.translations.map((t: any) => {
                const lang = languages.find(l => l.id === t.languageId);
                return (
                  <div key={t.languageId} className={styles.translationRow}>
                    <div className={styles.flagBadge}>{lang?.code?.toUpperCase().slice(0,2)}</div>
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      placeholder={`${lang?.name} başlık...`}
                      value={t.title} 
                      onChange={e => {
                        const newTrans = formData.translations.map((x: any) => x.languageId === t.languageId ? { ...x, title: e.target.value } : x);
                        setFormData({...formData, translations: newTrans});
                      }}
                    />
                  </div>
                );
              })}
            </div>

              <div className={styles.detailsFooter}>
                {selectedNodeId && (
                  <>
                      <button className={styles.btnCopy} onClick={handleCopyNode} disabled={isSaving}>
                        <DynamicIcon name="FaCopy" /> {isSaving ? '...' : 'Kopyala'}
                      </button>
                      <button className={styles.btnDeleteNode} onClick={handleDeleteNode} disabled={isSaving}>
                        <FaTrash /> {isSaving ? '...' : 'Sil'}
                      </button>
                  </>
                )}
                <button className={styles.addBtnSmall} onClick={handleAddNew}>
                  <FaPlus /> {selectedNodeId ? 'Yeni Menü/Grup Ekle' : 'Temizle'}
                </button>
                <button className={styles.btnSaveMainGreen} onClick={handleSaveNode} disabled={isSaving}>
                  <FaSave /> {isSaving ? 'Kaydediliyor...' : (selectedNodeId ? 'Değişiklikleri Kaydet' : 'Menüyü Oluştur')}
                </button>
              </div>
          </div>
      </div>

      {!isEmbedded && (
        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose} disabled={isSaving}>İptal</button>
          <button className={styles.btnSave} onClick={handleSyncHierarchy} disabled={isSaving}>
            <FaSave /> {isSaving ? 'Senkronize ediliyor...' : 'Hiyerarşiyi Kaydet'}
          </button>
        </div>
      )}

      {isEmbedded && (
        <div style={{ padding: '0 30px 20px', display: 'flex', justifyContent: 'flex-end' }}>
          {/* Moved to parent footer */}
        </div>
      )}

      {/* --- ICON PICKER --- */}
      {isIconPickerOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 12000 }} onClick={() => setIsIconPickerOpen(false)}>
           <div className={styles.pickerModal} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                 <div className={styles.searchWrap}>
                    <FaSearch />
                    <input placeholder="İkon ara..." value={iconSearch} onChange={e => setIconSearch(e.target.value)} />
                 </div>
                 <button className={styles.closeBtn} onClick={() => setIsIconPickerOpen(false)}><FaTimes /></button>
              </div>
              <div className={styles.pickerGrid}>
                 {filteredIcons.map(icon => (
                   <div key={icon} className={styles.iconOption} onClick={() => { setFormData({...formData, icon}); setIsIconPickerOpen(false); }}>
                      <DynamicIcon name={icon} className={styles.optIcon} />
                      <span className={styles.optName}>{icon.replace('Fa', '')}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );

  return (
    <DndProvider backend={MultiBackend} options={getBackendOptions()}>
       {isEmbedded ? content : (
         <div className={styles.modalOverlay} onClick={onClose}>
           {content}
         </div>
       )}
    </DndProvider>
  );
});
