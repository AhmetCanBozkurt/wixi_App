import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tree, DndProvider, getBackendOptions, MultiBackend } from '@minoru/react-dnd-treeview';
import type { NodeModel } from '@minoru/react-dnd-treeview';
import {
  FaArrowLeft, FaPlus, FaTimes, FaSave, FaTrash, FaSearch, FaChevronRight, FaGlobe,
} from "react-icons/fa";
import * as FaIconsList from 'react-icons/fa';
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { moduleService } from "../../../shared/api/services/moduleService";
import type { ModuleMenuDto } from "../../../shared/api/services/moduleService";
import { apiClient } from "../../../shared/api/axiosConfig";
import { DynamicIcon, Select, Switch } from "../../../shared/ui";
import styles from "./AdminModuleMenusPage.module.css";

interface Language { id: string; code: string; name: string; }
interface SystemPage { id: string; path: string; name: string; group?: string; }

const POPULAR_ICONS = Object.keys(FaIconsList).filter(k => k.startsWith('Fa')).slice(0, 200);

type FormState = {
  path: string;
  icon: string;
  iconColor: string;
  sortOrder: number;
  visibleToTenant: boolean;
  parentId: string | null;
  translations: { languageId: string; title: string }[];
};

const defaultForm = (langs: Language[]): FormState => ({
  path: '',
  icon: 'FaCircle',
  iconColor: '#3b82f6',
  sortOrder: 0,
  visibleToTenant: true,
  parentId: null,
  translations: langs.map(l => ({ languageId: l.id, title: '' })),
});

const AdminModuleMenusPage = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();

  const [treeData, setTreeData] = useState<NodeModel<ModuleMenuDto>[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [systemPages, setSystemPages] = useState<SystemPage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  const [form, setForm] = useState<FormState>(defaultForm([]));

  const fetchData = useCallback(async () => {
    if (!moduleId) return;
    try {
      const [menus, langRes, pagesRes] = await Promise.all([
        moduleService.getModuleMenus(moduleId),
        apiClient.get<{ items?: Language[] } | Language[]>('/Language'),
        apiClient.get<{ items: SystemPage[] }>('/ref/system-pages'),
      ]);

      const langData = langRes.data;
      const langs: Language[] = Array.isArray(langData)
        ? langData
        : ((langData as { items?: Language[] }).items ?? []);
      setLanguages(langs);
      setSystemPages(pagesRes.data?.items ?? []);

      const flat: NodeModel<ModuleMenuDto>[] = [];
      const walk = (items: ModuleMenuDto[], parentId: string = '0') => {
        for (const item of items) {
          flat.push({ id: item.id, parent: parentId, text: item.translations[0]?.title || item.path, droppable: true, data: item });
          if (item.children?.length) walk(item.children, item.id);
        }
      };
      walk(menus);
      setTreeData(flat);
    } catch {
      toast.error('Veriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSelectNode = (node: NodeModel<ModuleMenuDto>) => {
    setSelectedId(node.id as string);
    const d = node.data!;
    setForm({
      path:            d.path,
      icon:            d.icon ?? 'FaCircle',
      iconColor:       d.iconColor ?? '#3b82f6',
      sortOrder:       d.sortOrder,
      visibleToTenant: d.visibleToTenant,
      parentId:        node.parent === '0' ? null : node.parent as string,
      translations:    languages.map(l => ({
        languageId: l.id,
        title: d.translations.find(t => t.languageId === l.id)?.title ?? '',
      })),
    });
  };

  const handleAddNew = () => {
    setSelectedId(null);
    setForm(defaultForm(languages));
  };

  const handleSave = async () => {
    if (isSaving || !moduleId) return;
    setIsSaving(true);
    try {
      if (selectedId) {
        await moduleService.updateModuleMenu(selectedId, {
          id: selectedId,
          path:            form.path,
          icon:            form.icon,
          iconColor:       form.iconColor,
          sortOrder:       form.sortOrder,
          visibleToTenant: form.visibleToTenant,
          parentId:        form.parentId ?? null,
          translations:    form.translations,
        });
        toast.success('Menü güncellendi.');
      } else {
        await moduleService.createModuleMenu({
          moduleId,
          path:            form.path,
          icon:            form.icon,
          iconColor:       form.iconColor,
          sortOrder:       form.sortOrder,
          visibleToTenant: form.visibleToTenant,
          parentId:        form.parentId ?? null,
          translations:    form.translations,
        });
        toast.success('Menü eklendi.');
      }
      await fetchData();
      setSelectedId(null);
    } catch {
      toast.error('Kayıt hatası.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId || isSaving) return;
    const res = await Swal.fire({
      title: 'Silmek istediğinize emin misiniz?',
      text: 'Bu menü kırılımı silinecek!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Vazgeç',
      confirmButtonText: 'Evet, Sil',
    });
    if (!res.isConfirmed) return;
    setIsSaving(true);
    try {
      await moduleService.deleteModuleMenu(selectedId);
      toast.success('Menü silindi.');
      setSelectedId(null);
      await fetchData();
    } catch {
      toast.error('Silme hatası.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncHierarchy = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const payload = treeData.map((node, i) => ({
        id:       node.id as string,
        parentId: node.parent === '0' ? null : node.parent as string,
        sortOrder: i + 1,
      }));
      await moduleService.syncModuleMenus(payload);
      toast.success('Hiyerarşi kaydedildi!');
    } catch {
      toast.error('Senkronizasyon başarısız.');
    } finally {
      setIsSaving(false);
    }
  };

  const pathOptions = useMemo(() => [
    { label: '— Yol seçin —', value: '' },
    ...systemPages.map(p => ({ label: p.group ? `[${p.group}] ${p.name}` : p.name, value: p.path })),
  ], [systemPages]);

  const filteredIcons = useMemo(() => {
    if (!iconSearch) return POPULAR_ICONS;
    return Object.keys(FaIconsList).filter(k => k.toLowerCase().includes(iconSearch.toLowerCase())).slice(0, 100);
  }, [iconSearch]);

  const renderNode = (node: NodeModel<ModuleMenuDto>, { depth, isOpen, onToggle }: { depth: number; isOpen: boolean; onToggle: () => void }) => {
    const isSelected = selectedId === node.id;
    const d = node.data;
    return (
      <div
        className={`${styles.treeItemContainer} ${isSelected ? styles.selected : ''}`}
        style={{ marginLeft: depth * 12 + 5 }}
        onClick={() => handleSelectNode(node)}
      >
        <div
          className={`${styles.carat} ${isOpen ? styles.open : ''}`}
          onClick={e => { e.stopPropagation(); onToggle(); }}
          style={{ visibility: treeData.some(n => n.parent === node.id) ? 'visible' : 'hidden' }}
        >
          <FaChevronRight size={10} />
        </div>
        <div className={styles.treeIcon} style={{ color: isSelected ? '#fff' : (d?.iconColor ?? undefined) }}>
          <DynamicIcon name={d?.icon || 'FaCircle'} />
        </div>
        <span className={styles.treeTitle}>{node.text}</span>
        {d?.visibleToTenant === false && (
          <span style={{ fontSize: '0.65rem', background: '#374151', color: '#9ca3af', padding: '1px 6px', borderRadius: '4px', marginLeft: 'auto' }}>Admin</span>
        )}
      </div>
    );
  };

  if (loading) return <div className={styles.container} style={{ padding: '40px' }}>Yükleniyor...</div>;

  return (
    <DndProvider backend={MultiBackend} options={getBackendOptions()}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div>
            <button className={styles.backBtn} onClick={() => navigate('/admin/modules')}>
              <FaArrowLeft /> Modüllere Dön
            </button>
            <h1>Modül Menü Şablonu</h1>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.addBtn} onClick={handleAddNew}>
              <FaPlus /> Yeni Menü Ekle
            </button>
          </div>
        </header>

        {/* Body */}
        <div className={styles.content}>
          {/* Tree pane */}
          <aside className={styles.treePanel}>
            {treeData.length === 0 ? (
              <div style={{ padding: '24px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Henüz menü yok.</div>
            ) : (
              <Tree
                tree={treeData}
                rootId="0"
                sort={false}
                initialOpen
                onDrop={newTree => setTreeData(newTree as NodeModel<ModuleMenuDto>[])}
                render={renderNode}
                classes={{ root: styles.treeRoot, draggingSource: styles.draggingSource, placeholder: styles.dropPlaceholder }}
              />
            )}
          </aside>

          {/* Detail pane */}
          <main className={styles.editorPanel}>
            <div className={styles.detailsHeader}>
              <h4>{selectedId ? 'Menü Detayları' : 'Yeni Menü Tanımla'}</h4>
            </div>

            <div className={styles.formGrid}>
              {/* Path */}
              <div className={styles.formGroup}>
                <Select
                  label="Hedef Yol (Path)"
                  value={form.path}
                  onChange={val => setForm(f => ({ ...f, path: val as string }))}
                  options={pathOptions}
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                  <code>{'{tenantSlug}'}</code> çalışma anında otomatik değiştirilir.
                </small>
              </div>

              {/* Visibility */}
              <div className={styles.formGroup}>
                <Switch
                  label="Müşteriye Görünür"
                  description={form.visibleToTenant ? 'Mağaza panelinde gösterilir' : 'Sadece master admin görür'}
                  checked={form.visibleToTenant}
                  onChange={e => setForm(f => ({ ...f, visibleToTenant: e.target.checked }))}
                />
              </div>
            </div>

            {/* Icon & Color */}
            <div className={styles.formGroup} style={{ marginTop: '20px' }}>
              <label className={styles.formLabel}>İkon ve Renk</label>
              <div className={styles.iconRow}>
                <div className={styles.iconDisplay} style={{ color: form.iconColor }}>
                  <DynamicIcon name={form.icon} />
                </div>
                <button className={styles.selectIconBtn} onClick={() => setIsIconPickerOpen(true)}>İkon Değiştir</button>
                <input
                  type="color"
                  className={styles.colorPicker}
                  value={form.iconColor}
                  onChange={e => setForm(f => ({ ...f, iconColor: e.target.value }))}
                />
              </div>
            </div>

            {/* Translations */}
            <div className={styles.sectionTitle}><FaGlobe /> Çoklu Dil Başlıkları</div>
            <div className={styles.translationsList}>
              {form.translations.map(t => {
                const lang = languages.find(l => l.id === t.languageId);
                return (
                  <div key={t.languageId} className={styles.translationRow}>
                    <div className={styles.flagBadge}>{lang?.code?.toUpperCase().slice(0, 2)}</div>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder={`${lang?.name ?? ''} başlığı...`}
                      value={t.title}
                      onChange={e => setForm(f => ({
                        ...f,
                        translations: f.translations.map(x => x.languageId === t.languageId ? { ...x, title: e.target.value } : x),
                      }))}
                    />
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className={styles.detailsFooter}>
              {selectedId && (
                <button className={styles.btnDeleteNode} onClick={handleDelete} disabled={isSaving}>
                  <FaTrash /> {isSaving ? '...' : 'Sil'}
                </button>
              )}
              <button className={styles.addBtnSmall} onClick={handleAddNew}>
                <FaPlus /> {selectedId ? 'Yeni Ekle' : 'Temizle'}
              </button>
              <button className={styles.btnSaveMainGreen} onClick={handleSave} disabled={isSaving}>
                <FaSave /> {isSaving ? 'Kaydediliyor...' : (selectedId ? 'Güncelle' : 'Oluştur')}
              </button>
            </div>
          </main>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={() => navigate('/admin/modules')} disabled={isSaving}>
            Geri Dön
          </button>
          <button className={styles.btnSave} onClick={handleSyncHierarchy} disabled={isSaving}>
            <FaSave /> {isSaving ? 'Senkronize ediliyor...' : 'Hiyerarşiyi Kaydet'}
          </button>
        </div>

        {/* Icon Picker Modal */}
        {isIconPickerOpen && (
          <div className={styles.modalOverlay} style={{ zIndex: 12000 }} onClick={() => setIsIconPickerOpen(false)}>
            <div className={styles.pickerModal} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <div className={styles.searchWrap}>
                  <FaSearch />
                  <input
                    autoFocus
                    placeholder="İkon ara..."
                    value={iconSearch}
                    onChange={e => setIconSearch(e.target.value)}
                  />
                </div>
                <button className={styles.closeBtn} onClick={() => setIsIconPickerOpen(false)}><FaTimes /></button>
              </div>
              <div className={styles.pickerGrid}>
                {filteredIcons.map(icon => (
                  <div key={icon} className={styles.iconOption} onClick={() => { setForm(f => ({ ...f, icon })); setIsIconPickerOpen(false); }}>
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

export default AdminModuleMenusPage;
