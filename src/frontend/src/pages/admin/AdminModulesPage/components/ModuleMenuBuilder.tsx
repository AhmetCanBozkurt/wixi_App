import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Tree, DndProvider, getBackendOptions, MultiBackend } from '@minoru/react-dnd-treeview';
import type { NodeModel } from '@minoru/react-dnd-treeview';
import { FaPlus, FaTrash, FaSave, FaSearch, FaTimes, FaGlobe, FaChevronRight } from "react-icons/fa";
import * as FaIconsList from 'react-icons/fa';
import { toast } from "react-hot-toast";
import { moduleService } from "../../../../shared/api/services/moduleService";
import type { ModuleMenuDto } from "../../../../shared/api/services/moduleService";
import { apiClient } from "../../../../shared/api/axiosConfig";
import { DynamicIcon, Select, Button, Input, Switch, Modal } from "../../../../shared/ui";
import styles from "./ModuleMenuBuilder.module.css";

const POPULAR_ICONS = Object.keys(FaIconsList).filter(key => key.startsWith('Fa')).slice(0, 200);

interface Language { id: string; name: string; code: string; }

interface SystemPage { id: string; path: string; name: string; group?: string; }

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

interface ModuleMenuBuilderProps {
  moduleId: string;
}

export const ModuleMenuBuilder: React.FC<ModuleMenuBuilderProps> = ({ moduleId }) => {
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
      const [menuData, langRes, pagesRes] = await Promise.all([
        moduleService.getModuleMenus(moduleId),
        apiClient.get<any>('/Language'),
        apiClient.get<{ items: SystemPage[] }>('/ref/system-pages'),
      ]);

      const langData = langRes.data;
      const langs: Language[] = Array.isArray(langData)
        ? langData
        : (langData?.items ?? []);
      setLanguages(langs);
      setSystemPages(pagesRes.data?.items ?? []);

      const flat: NodeModel<ModuleMenuDto>[] = [];
      const walk = (items: ModuleMenuDto[], parentId: string = '0') => {
        for (const item of items) {
          flat.push({
            id: item.id,
            parent: parentId,
            text: item.translations[0]?.title || item.path,
            droppable: true,
            data: item,
          });
          if (item.children?.length) walk(item.children, item.id);
        }
      };
      walk(menuData);
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
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (selectedId) {
        await moduleService.updateModuleMenu(selectedId, {
          id:              selectedId,
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
        setSelectedId(null);
      }
      await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Kayıt hatası.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!window.confirm('Bu menü öğesi silinecek. Emin misiniz?')) return;
    setIsSaving(true);
    try {
      await moduleService.deleteModuleMenu(selectedId);
      toast.success('Menü silindi.');
      setSelectedId(null);
      await fetchData();
    } catch {
      toast.error('Silme işlemi başarısız.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncHierarchy = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const payload = treeData.map((node, index) => ({
        id:        node.id as string,
        parentId:  node.parent === '0' ? null : node.parent as string,
        sortOrder: index + 1,
      }));
      await moduleService.syncModuleMenus(payload);
      toast.success('Hiyerarşi & sıralama kaydedildi.');
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

  // Parent dropdown options: root + mevcut tüm node'lar
  const parentOptions = useMemo(() => [
    { label: '— Kök (üst öğe yok) —', value: '' },
    ...treeData
      .filter(n => n.id !== selectedId)
      .map(n => ({ label: n.text, value: n.id as string })),
  ], [treeData, selectedId]);

  const filteredIcons = useMemo(() => {
    if (!iconSearch) return POPULAR_ICONS;
    return Object.keys(FaIconsList).filter(key =>
      key.toLowerCase().includes(iconSearch.toLowerCase())
    ).slice(0, 100);
  }, [iconSearch]);

  const renderNode = (node: NodeModel<ModuleMenuDto>, { depth, isOpen, onToggle }: any) => {
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
        <div className={styles.treeText}>
          <span className={styles.treeTitle}>{node.text}</span>
          {d?.path === 'folder' && (
            <span style={{ fontSize: '0.65rem', color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>klasör</span>
          )}
        </div>
        {d?.visibleToTenant === false && (
          <span style={{ fontSize: '0.65rem', background: '#374151', color: '#9ca3af', padding: '1px 6px', borderRadius: '4px', marginLeft: 'auto', flexShrink: 0 }}>
            Admin
          </span>
        )}
      </div>
    );
  };

  if (loading) return <div className={styles.loading}>Menü yapısı yükleniyor...</div>;

  return (
    <DndProvider backend={MultiBackend} options={getBackendOptions()}>
      <div className={styles.builderContent}>
        <div className={styles.builderLayout}>

          {/* ── Sol: Ağaç ─────────────────────────── */}
          <aside className={styles.treePanel}>
            <div className={styles.panelHeader}>
              <h3>Menü Ağacı</h3>
              <Button variant="secondary" size="sm" onClick={handleAddNew}>
                <FaPlus /> Ekle
              </Button>
            </div>
            {treeData.length === 0 ? (
              <div style={{ padding: '24px', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                Henüz menü yok. "Ekle" ile başlayın.
              </div>
            ) : (
              <Tree
                tree={treeData}
                rootId="0"
                sort={false}
                initialOpen
                onDrop={newTree => setTreeData(newTree as NodeModel<ModuleMenuDto>[])}
                render={renderNode}
                classes={{ root: styles.treeRoot }}
              />
            )}
          </aside>

          {/* ── Sağ: Form ─────────────────────────── */}
          <main className={styles.editorPanel}>
            <div className={styles.formHeader}>
              <h4>{selectedId ? 'Menü Düzenle' : 'Yeni Menü Ekle'}</h4>
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
                {form.path && (
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                    <code>{form.path}</code>
                  </small>
                )}
              </div>

              {/* Parent */}
              <div className={styles.formGroup}>
                <Select
                  label="Üst Öğe (Parent)"
                  value={form.parentId ?? ''}
                  onChange={val => setForm(f => ({ ...f, parentId: (val as string) || null }))}
                  options={parentOptions}
                />
              </div>

              {/* Sort Order */}
              <div className={styles.formGroup}>
                <Input
                  label="Sıra No"
                  type="number"
                  value={String(form.sortOrder ?? 0)}
                  onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                />
              </div>

              {/* Visible to tenant */}
              <div className={styles.formGroup} style={{ justifyContent: 'flex-end' }}>
                <Switch
                  label="Müşteriye Görünür"
                  description={form.visibleToTenant ? 'Mağaza panelinde gösterilir' : 'Sadece master admin görür'}
                  checked={form.visibleToTenant}
                  onChange={e => setForm(f => ({ ...f, visibleToTenant: e.target.checked }))}
                />
              </div>

              {/* Icon & Color */}
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.formLabel}>İkon ve Renk</label>
                <div className={styles.iconRow}>
                  <div className={styles.iconDisplay} style={{ color: form.iconColor }}>
                    <DynamicIcon name={form.icon || 'FaCircle'} />
                  </div>
                  <button
                    type="button"
                    className={styles.selectIconBtn}
                    onClick={() => setIsIconPickerOpen(true)}
                  >
                    İkon Değiştir
                  </button>
                  <input
                    type="color"
                    className={styles.colorPicker}
                    value={form.iconColor}
                    onChange={e => setForm(f => ({ ...f, iconColor: e.target.value }))}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                    {form.icon}
                  </span>
                </div>
              </div>

              {/* Translations */}
              <div className={`${styles.formGroup} ${styles.fullWidth} ${styles.translationBox}`}>
                <label className={styles.formLabel}><FaGlobe style={{ marginRight: 6 }} />Dil Başlıkları</label>
                <div className={styles.translationsList}>
                  {languages.map(lang => {
                    const trans = form.translations.find(t => t.languageId === lang.id);
                    return (
                      <div key={lang.id} className={styles.translationRow}>
                        <div className={styles.flagBadge}>{lang.code.toUpperCase().slice(0, 2)}</div>
                        <input
                          className={styles.textInput}
                          value={trans?.title ?? ''}
                          placeholder={`${lang.name} başlığı...`}
                          onChange={e => {
                            const updated = [...form.translations];
                            const idx = updated.findIndex(t => t.languageId === lang.id);
                            if (idx > -1) updated[idx] = { ...updated[idx], title: e.target.value };
                            else updated.push({ languageId: lang.id, title: e.target.value });
                            setForm(f => ({ ...f, translations: updated }));
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              {selectedId && (
                <Button variant="danger" size="sm" onClick={handleDelete} disabled={isSaving}>
                  <FaTrash /> Sil
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleAddNew} disabled={isSaving}>
                <FaPlus /> Yeni
              </Button>
              <Button onClick={handleSave} isLoading={isSaving}>
                <FaSave /> {selectedId ? 'Güncelle' : 'Kaydet'}
              </Button>
            </div>
          </main>
        </div>

        {/* ── Alt Bar: Hiyerarşi Kaydet ─────────────── */}
        <div className={styles.syncBar}>
          <span className={styles.syncBarHint}>
            Sürükle-bırak ile sıraladıktan sonra hiyerarşiyi kaydedin.
          </span>
          <Button onClick={handleSyncHierarchy} isLoading={isSaving} variant="primary">
            <FaSave /> Sıralama & Hiyerarşiyi Kaydet
          </Button>
        </div>

        {/* ── Icon Picker Modal ──────────────────────── */}
        <Modal
          isOpen={isIconPickerOpen}
          onClose={() => { setIsIconPickerOpen(false); setIconSearch(''); }}
          title="İkon Seç"
          size="lg"
        >
          <div className={styles.searchWrap} style={{ marginBottom: '16px' }}>
            <FaSearch />
            <input
              placeholder="İkon ara..."
              value={iconSearch}
              autoFocus
              onChange={e => setIconSearch(e.target.value)}
            />
            {iconSearch && (
              <button
                type="button"
                onClick={() => setIconSearch('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <FaTimes />
              </button>
            )}
          </div>
          <div className={styles.pickerGrid}>
            {filteredIcons.map(icon => (
              <div
                key={icon}
                className={styles.iconOption}
                onClick={() => {
                  setForm(f => ({ ...f, icon }));
                  setIsIconPickerOpen(false);
                  setIconSearch('');
                }}
              >
                <DynamicIcon name={icon} className={styles.optIcon} />
                <span className={styles.optName}>{icon.replace('Fa', '')}</span>
              </div>
            ))}
          </div>
        </Modal>
      </div>
    </DndProvider>
  );
};
