import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Tree, DndProvider, getBackendOptions, MultiBackend } from '@minoru/react-dnd-treeview';
import type { NodeModel } from '@minoru/react-dnd-treeview';
import {
  FaPlus, FaTrash, FaSave,
  FaGlobe, FaSearch, FaTimes
} from "react-icons/fa";
import * as FaIconsList from 'react-icons/fa';
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { moduleService } from "../../../shared/api/services/moduleService";
import type { ModuleMenuDto } from "../../../shared/api/services/moduleService";
import { apiClient } from "../../../shared/api/axiosConfig";
import { DynamicIcon, Select, Button } from "../../../shared/ui";
import styles from "./ModuleMenuBuilder.module.css";

interface Language {
  id: string;
  name: string;
  code: string;
}

const SYSTEM_PAGES = [
  { name: '[ GRUP / BAŞLIK / KLASÖR ]', path: 'folder' },
  { name: 'Dashboard (Ana Sayfa)', path: '/admin' },
  { name: 'Ziyaret & Randevu Yönetimi', path: '/admin/visits' },
  { name: 'CRM & Cari Yönetimi', path: '/admin/crm' },
  { name: 'Proje & Görev Yönetimi', path: '/admin/projects' },
  { name: 'Destek & Ticket Yönetimi', path: '/admin/support' },
  { name: 'Stok & Envanter Yönetimi', path: '/admin/inventory' },
  { name: 'Kullanıcı Yönetimi', path: '/admin/users' },
  { name: 'Rol & Yetki Yönetimi', path: '/admin/roles' },
  { name: 'Modül Yönetimi', path: '/admin/modules' },
  { name: 'Audit Log (Sistem)', path: '/admin/audit' },
  { name: 'Döviz Yönetimi', path: '/admin/currencies' },
  { name: 'Uygulama Logları (Debug)', path: '/admin/logs' },
  { name: 'E-Ticaret Özeti', path: '/tenant/{tenantSlug}/ecommerce/dashboard' },
  { name: 'Ürün Yönetimi (Mağaza)', path: '/tenant/{tenantSlug}/ecommerce/products' },
];

const POPULAR_ICONS = Object.keys(FaIconsList).filter(key => key.startsWith('Fa')).slice(0, 100);

interface ModuleMenuBuilderProps {
  moduleId: string;
}

export const ModuleMenuBuilder: React.FC<ModuleMenuBuilderProps> = ({ moduleId }) => {
  const [treeData, setTreeData] = useState<NodeModel<any>[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Icon Picker State
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [iconSearch, setIconSearch] = useState('');

  const [formData, setFormData] = useState<Partial<ModuleMenuDto>>({
    moduleId: moduleId,
    parentId: null,
    path: "",
    icon: "FaLink",
    iconColor: "#3b82f6",
    sortOrder: 0,
    visibleToTenant: true,
    translations: [],
  });

  const fetchData = useCallback(async () => {
    if (!moduleId) return;
    try {
      const [menuData, langData] = await Promise.all([
        moduleService.getModuleMenus(moduleId),
        apiClient.get<any>("/Language"),
      ]);
      
      const langs = langData.data?.items || langData.data || [];
      setLanguages(langs);
      
      const mapped: NodeModel<any>[] = [];
      const flatten = (items: ModuleMenuDto[], parentId: string = "0") => {
        items.forEach(item => {
          mapped.push({
            id: item.id,
            parent: parentId,
            text: item.translations[0]?.title || "İsimsiz",
            droppable: true,
            data: { ...item }
          });
          if (item.children && item.children.length > 0) {
            flatten(item.children, item.id);
          }
        });
      };
      flatten(menuData);
      setTreeData(mapped);
      
    } catch {
      toast.error("Veriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectNode = (node: NodeModel<any>) => {
    setSelectedNodeId(node.id as string);
    setFormData({
      ...node.data,
      parentId: node.parent === "0" ? null : node.parent
    });
  };

  const handleAddNew = (parentId: string | null = null) => {
    setSelectedNodeId(null);
    setFormData({
      moduleId: moduleId,
      parentId: parentId,
      path: "",
      icon: "FaLink",
      iconColor: "#3b82f6",
      sortOrder: treeData.length + 1,
      visibleToTenant: true,
      translations: languages.map(l => ({ languageId: l.id, title: "" })),
    });
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (selectedNodeId) {
        toast.error("Güncelleme henüz desteklenmiyor.");
      } else {
        await moduleService.createModuleMenu(formData);
        toast.success("Menü şablona eklendi.");
        setSelectedNodeId(null);
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Kayıt sırasında hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedNodeId) return;
    const result = await Swal.fire({
      title: 'Silmek istediğinize emin misiniz?',
      text: "Bu menü kırılımı silinecek!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Vazgeç',
      confirmButtonText: 'Evet, Sil'
    });
    if (result.isConfirmed) {
      toast.success("Menü silindi.");
      setSelectedNodeId(null);
      fetchData();
    }
  };

  const handleDrop = (newTree: NodeModel<any>[]) => setTreeData(newTree);

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
          <DynamicIcon name={node.data?.icon || (isFolder ? 'FaFolder' : 'FaLink')} />
        </div>
        
        <div className={styles.treeText}>
          <span className={styles.treeTitle}>{node.text}</span>
        </div>
      </div>
    );
  };

  if (loading) return <div className={styles.loading}>Menü yapısı yükleniyor...</div>;

  return (
    <DndProvider backend={MultiBackend} options={getBackendOptions()}>
      <div className={styles.builderContent}>
        <div className={styles.builderLayout}>
          <aside className={styles.treePanel}>
            <div className={styles.panelHeader}>
               <h3>Menü Ağacı</h3>
               <Button variant="secondary" size="sm" onClick={() => handleAddNew(null)}>
                  <FaPlus /> Ekle
               </Button>
            </div>
            <Tree
              tree={treeData}
              rootId="0"
              initialOpen={true}
              onDrop={handleDrop}
              render={renderNode}
              classes={{ root: styles.treeRoot }}
            />
          </aside>

          <main className={styles.editorPanel}>
            {selectedNodeId || formData.moduleId ? (
              <div className={styles.formContainer}>
                <div className={styles.formHeader}>
                   <h4>{selectedNodeId ? "Menü Detayı" : "Yeni Menü Ekle"}</h4>
                </div>
                
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <Select 
                      label="Yol (Path)"
                      value={formData.path}
                      onChange={val => setFormData({...formData, path: val as string})}
                      options={SYSTEM_PAGES.map(p => ({ label: p.name, value: p.path }))}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>İkon ve Renk</label>
                    <div className={styles.iconRow}>
                      <div className={styles.iconDisplay} style={{ color: formData.iconColor }}>
                        <DynamicIcon name={formData.icon || 'FaLink'} />
                      </div>
                      <button 
                        className={styles.selectIconBtn} 
                        onClick={() => setIsIconPickerOpen(true)}
                      >
                        İkon Değiştir
                      </button>
                      <input 
                        type="color"
                        className={styles.colorPicker}
                        value={formData.iconColor || "#3b82f6"}
                        onChange={e => setFormData({...formData, iconColor: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Sıralama</label>
                    <input 
                      type="number"
                      className={styles.textInput}
                      value={formData.sortOrder}
                      onChange={e => setFormData({...formData, sortOrder: parseInt(e.target.value)})}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Görünürlük</label>
                    <select 
                      className={styles.selectInput}
                      value={formData.visibleToTenant ? "true" : "false"}
                      onChange={e => setFormData({...formData, visibleToTenant: e.target.value === "true"})}
                    >
                      <option value="true">Müşteriye Açık</option>
                      <option value="false">Sistem Admin</option>
                    </select>
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullWidth} ${styles.translationBox}`}>
                    <label className={styles.formLabel}><FaGlobe /> Dil Çevirileri</label>
                    <div className={styles.translationsList}>
                      {Array.isArray(languages) && languages.map(lang => {
                        const trans = formData.translations?.find(t => t.languageId === lang.id);
                        return (
                          <div key={lang.id} className={styles.translationRow}>
                            <div className={styles.flagBadge}>{lang.code.toUpperCase().slice(0, 2)}</div>
                            <input 
                              className={styles.textInput}
                              value={trans?.title || ""}
                              placeholder={`${lang.name} başlık...`}
                              onChange={e => {
                                const newTrans = [...(formData.translations || [])];
                                const idx = newTrans.findIndex(t => t.languageId === lang.id);
                                if (idx > -1) newTrans[idx].title = e.target.value;
                                else newTrans.push({ languageId: lang.id, title: e.target.value });
                                setFormData({...formData, translations: newTrans});
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className={styles.formActions}>
                  {selectedNodeId && (
                    <Button variant="danger" size="sm" onClick={handleDelete}>
                      <FaTrash /> Sil
                    </Button>
                  )}
                  <Button onClick={handleSave} disabled={isSaving}>
                    <FaSave /> {isSaving ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>Bir menü öğesi seçin veya yeni bir tane ekleyin.</p>
              </div>
            )}
          </main>
        </div>

        {/* --- ICON PICKER MODAL --- */}
        {isIconPickerOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsIconPickerOpen(false)}>
             <div className={styles.pickerModal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                   <div className={styles.searchWrap}>
                      <FaSearch />
                      <input 
                        placeholder="İkon ara..." 
                        value={iconSearch} 
                        autoFocus
                        onChange={e => setIconSearch(e.target.value)} 
                      />
                   </div>
                   <button className={styles.closeBtn} onClick={() => setIsIconPickerOpen(false)}>
                     <FaTimes />
                   </button>
                </div>
                <div className={styles.pickerGrid}>
                   {filteredIcons.map(icon => (
                     <div 
                      key={icon} 
                      className={styles.iconOption} 
                      onClick={() => { setFormData({...formData, icon}); setIsIconPickerOpen(false); }}
                     >
                        <DynamicIcon name={icon} className={styles.optIcon} />
                        <span className={styles.optName}>{icon.replace('Fa', '')}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};
