import { useState, useEffect, useCallback, useMemo } from 'react';
import { FaPlus, FaEdit, FaTrash, FaThList, FaGlobe, FaTimes, FaSearch, FaSave } from 'react-icons/fa';
import * as FaIconsList from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { apiClient } from '../../shared/api/axiosConfig';
import { DynamicIcon } from '../../shared/ui/DynamicIcon/DynamicIcon';
import { AdvancedDataTable, type Column } from '../../shared/ui/AdvancedDataTable/AdvancedDataTable';
import styles from './MenuManagementPage.module.css';

interface Language {
  id: string;
  code: string;
  name: string;
}

interface MenuTranslation {
  languageId: string;
  title: string;
}

interface MenuEdit {
  id?: string;
  parentId?: string;
  path: string;
  icon?: string;
  iconColor?: string;
  sortOrder: number;
  isVisible: boolean;
  translations: MenuTranslation[];
}

const SYSTEM_PAGES = [
  { name: 'Dashboard (Ana Sayfa)', path: '/' },
  { name: 'Menü Yönetimi', path: '/admin/menus' },
  { name: 'Kullanıcı Yönetimi', path: '/admin/users' },
  { name: 'Dil Yönetimi', path: '/admin/languages' },
  { name: 'Uygulama Logları', path: '/admin/logs' },
  { name: 'Chat İşlemleri', path: '/chat' },
  { name: 'Bağlı Cihazlar', path: '/devices' },
  { name: 'Ayarlar', path: '/settings' },
];

const POPULAR_ICONS = Object.keys(FaIconsList).filter(key => key.startsWith('Fa')).slice(0, 100);

export const MenuManagementPage = () => {
  const [menus, setMenus] = useState<MenuEdit[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuEdit | null>(null);
  const [iconSearch, setIconSearch] = useState('');

  const [formData, setFormData] = useState<MenuEdit>({
    path: '',
    sortOrder: 1,
    isVisible: true,
    translations: [],
    icon: 'FaCircle',
    iconColor: '#3b82f6',
    parentId: undefined
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [langsRes, menusRes] = await Promise.all([
        apiClient.get<Language[]>('language'),
        apiClient.get<any[]>('menu/all')
      ]);
      setLanguages(langsRes.data);
      
      const mappedMenus = menusRes.data.map(m => ({
        id: m.id,
        parentId: m.parentId,
        path: m.path,
        icon: m.icon,
        iconColor: m.iconColor,
        sortOrder: m.sortOrder,
        isVisible: m.isVisible,
        translations: m.translations || m.Translations || []
      }));
      
      setMenus(mappedMenus);
    } catch {
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenModal = (menu?: any) => {
    if (menu) {
      setEditingMenu(menu);
      setFormData({ 
        ...menu,
        translations: menu.translations || menu.Translations || []
      });
    } else {
      setEditingMenu(null);
      setFormData({
        path: '/',
        sortOrder: menus.length + 1,
        isVisible: true,
        icon: 'FaCircle',
        iconColor: '#3b82f6',
        translations: languages.map(l => ({ languageId: l.id, title: '' })),
        parentId: undefined
      });
    }
    setIsModalOpen(true);
  };

  const handleTranslationChange = (langId: string, title: string) => {
    setFormData(prev => ({
      ...prev,
      translations: (prev.translations || []).map(t => 
        t.languageId === langId ? { ...t, title } : t
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { 
        ...formData, 
        parentId: formData.parentId === "" ? null : formData.parentId 
      };

      if (editingMenu) {
        await apiClient.put('menu', { menu: payload });
        toast.success('Menü başarıyla güncellendi');
      } else {
        await apiClient.post('menu', { menu: payload });
        toast.success('Sisteme yeni menü eklendi');
      }
      setIsModalOpen(false);
      fetchData();
    } catch {
      toast.error('İşlem sırasında hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    // STANDARD: SweetAlert2 ile silme onayı (asking-modal rule)
    const result = await Swal.fire({
      title: 'Emin misiniz?',
      text: "Bu menüyü tamamen sistemden silmek üzeresiniz. Bu işlem geri alınamaz!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Evet, Sil!',
      cancelButtonText: 'İptal',
      background: 'var(--bg-secondary)',
      color: 'var(--text-main)'
    });

    if (!result.isConfirmed) return;

    try {
      await apiClient.delete(`menu/${id}`);
      Swal.fire({
        title: 'Silindi!',
        text: 'Seçili menü başarıyla silindi.',
        icon: 'success',
        background: 'var(--bg-secondary)',
        color: 'var(--text-main)',
        timer: 2000,
        showConfirmButton: false
      });
      fetchData();
    } catch {
      toast.error('Menü silinemedi');
    }
  };

  const filteredIcons = useMemo(() => {
    if (!iconSearch) return POPULAR_ICONS;
    return Object.keys(FaIconsList).filter(key => 
      key.toLowerCase().includes(iconSearch.toLowerCase())
    ).slice(0, 100);
  }, [iconSearch]);

  const parentMenus = useMemo(() => {
    return menus.filter(m => !m.parentId && m.id !== editingMenu?.id);
  }, [menus, editingMenu]);

  const columns: Column<MenuEdit>[] = [
    {
      key: 'icon',
      header: 'İkon',
      width: '80px',
      render: (_, row) => (
        <div style={{ color: row.iconColor, fontSize: '1.4rem' }}>
          <DynamicIcon name={row.icon || 'FaCircle'} color={row.iconColor} />
        </div>
      )
    },
    {
      key: 'title',
      header: 'Başlık (Varsayılan)',
      accessor: (row) => row.translations.find(t => t.languageId === languages[0]?.id)?.title || 'İsimsiz',
      sortable: true,
      render: (val, row) => (
        <div className={styles.titleWithContext}>
          {row.parentId && <span className={styles.subIndicator} title="Alt Menü">↪</span>}
          <strong>{val}</strong>
        </div>
      )
    },
    {
      key: 'path',
      header: 'Yol',
      sortable: true,
      render: (val) => <code style={{ color: 'var(--color-primary)' }}>{val}</code>
    },
    {
      key: 'sortOrder',
      header: 'Sıra',
      width: '80px',
      sortable: true,
      render: (val) => <span className={styles.orderBadge}>{val}</span>
    },
    {
      key: 'isVisible',
      header: 'Durum',
      width: '100px',
      render: (val) => (
        <span className={`${styles.statusBadge} ${val ? styles.active : ''}`}>
          {val ? 'Aktif' : 'Pasif'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'İşlemler',
      width: '120px',
      render: (_, row) => (
        <div className={styles.tableActions}>
          <button onClick={() => handleOpenModal(row)} title="Düzenle" className={styles.actionBtn}><FaEdit /></button>
          <button onClick={() => handleDelete(row.id!)} title="Sil" className={styles.actionBtnDelete}><FaTrash /></button>
        </div>
      )
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <FaThList className={styles.mainIcon} />
          <div>
            <h1>Menü Yönetimi</h1>
            <p>Sistemin navigasyon yapısını temiz standartlarla yönetin.</p>
          </div>
        </div>
        <button className={styles.addBtn} onClick={() => handleOpenModal()}>
          <FaPlus /> Yeni Ekle
        </button>
      </div>

      <div className={styles.content}>
        <AdvancedDataTable 
          columns={columns} 
          data={menus} 
          pageSize={10}
          loading={loading}
        />
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.standardModal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingMenu ? 'Menü Düzenle' : 'Yeni Menü'}</h3>
              <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}><FaTimes /></button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.modalBody}>
              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Üst Menü (Opsiyonel)</label>
                  <select 
                    className={styles.formInput}
                    value={formData.parentId || ''}
                    onChange={e => setFormData({...formData, parentId: e.target.value || undefined})}
                  >
                    <option value="">(Ana Menü Olarak Ekle)</option>
                    {parentMenus.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.translations.find(t => t.languageId === languages[0]?.id)?.title || 'İsimsiz'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Hedef Sayfa (Path)</label>
                  <select 
                    className={styles.formInput}
                    value={formData.path} 
                    onChange={e => setFormData({...formData, path: e.target.value})}
                  >
                    <option value="">Hedef Sayfa Seçiniz...</option>
                    {SYSTEM_PAGES.map(p => (
                      <option key={p.path} value={p.path}>{p.name} ({p.path})</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Menü İkonu & Rengi</label>
                  <div className={styles.iconRow}>
                    <div className={styles.iconDisplay} style={{ color: formData.iconColor }}>
                      <DynamicIcon name={formData.icon} />
                    </div>
                    <button type="button" className={styles.selectIconBtn} onClick={() => setIsIconPickerOpen(true)}>
                      İkon Seç
                    </button>
                    <input type="color" className={styles.colorPicker} title="Renk Seç" value={formData.iconColor} onChange={e => setFormData({...formData, iconColor: e.target.value})} />
                  </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Sıralama İndeksi</label>
                    <input type="number" className={styles.formInput} value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: parseInt(e.target.value)})} />
                </div>
              </div>

              <div className={styles.checkboxRow}>
                <label className={styles.customCheckbox}>
                  <input type="checkbox" checked={formData.isVisible} onChange={e => setFormData({...formData, isVisible: e.target.checked})} />
                  <span>Bu menü sol barda listelenmeye uygun (Aktif)</span>
                </label>
              </div>

              <div className={styles.sectionTitle}>
                <FaGlobe /> Çoklu Dil Çevirileri
              </div>
              <div className={styles.translationsList}>
                {(formData.translations || []).map((t, idx) => {
                  const lang = languages.find(l => l.id === t.languageId);
                  return (
                    <div key={t.languageId || idx} className={styles.translationRow}>
                      <div className={styles.flagBadge}>{lang?.code.split('-')[0].toUpperCase() || '??'}</div>
                      <input 
                        required 
                        type="text" 
                        className={styles.formInput}
                        value={t.title || ''}
                        onChange={e => handleTranslationChange(t.languageId, e.target.value)}
                        placeholder={`${lang?.name || 'Dil'} için panel başlığı yazın...`}
                      />
                    </div>
                  );
                })}
              </div>
            </form>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.btnCancel} onClick={() => setIsModalOpen(false)}>İptal</button>
              <button onClick={handleSubmit} className={styles.btnSave}>
                <FaSave /> {editingMenu ? 'Değişiklikleri Kaydet' : 'Sisteme Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isIconPickerOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 1100 }} onClick={() => setIsIconPickerOpen(false)}>
          <div className={styles.pickerModal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.searchWrap}>
                <FaSearch />
                <input 
                  autoFocus
                  placeholder="İkon arayın (Home, Setting, User vb.)..." 
                  value={iconSearch} 
                  onChange={e => setIconSearch(e.target.value)} 
                />
              </div>
              <button className={styles.closeBtn} onClick={() => setIsIconPickerOpen(false)}><FaTimes /></button>
            </div>
            <div className={styles.pickerGrid}>
              {filteredIcons.map(iconName => (
                <div 
                  key={iconName} 
                  className={`${styles.iconOption} ${formData.icon === iconName ? styles.selected : ''}`}
                  onClick={() => {
                    setFormData({...formData, icon: iconName});
                    setIsIconPickerOpen(false);
                  }}
                >
                  <DynamicIcon name={iconName} className={styles.optIcon} />
                  <span className={styles.optName}>{iconName.replace('Fa', '')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
