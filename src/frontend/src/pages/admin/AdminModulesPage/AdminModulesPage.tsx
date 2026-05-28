import React, { useEffect, useState, useCallback, useMemo } from "react";
import { FaLayerGroup, FaPlus, FaSave, FaSearch, FaTimes } from 'react-icons/fa';
import * as FaIconsList from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { moduleService } from "../../../shared/api/services/moduleService";
import type { ModuleDto } from "../../../shared/api/services/moduleService";
import { AdvancedDataTable, type ColumnConfig } from "../../../shared/ui/AdvancedDataTable/AdvancedDataTable";
import { Modal } from "../../../shared/ui/Modal/Modal";
import { Button } from "../../../shared/ui/Button/Button";
import { DynamicIcon } from "../../../shared/ui/DynamicIcon/DynamicIcon";
import styles from "./AdminModulesPage.module.css";
import { ModuleMenuBuilder } from "./components/ModuleMenuBuilder";

const AdminModulesPage: React.FC = () => {
  const [modules, setModules] = useState<ModuleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleDto | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'menu'>('details');
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [iconSearch, setIconSearch] = useState('');

  const POPULAR_ICONS = useMemo(() => 
    Object.keys(FaIconsList).filter(key => key.startsWith('Fa')).slice(0, 100)
  , []);

  const filteredIcons = useMemo(() => {
    if (!iconSearch) return POPULAR_ICONS;
    return Object.keys(FaIconsList).filter(key => 
      key.toLowerCase().includes(iconSearch.toLowerCase())
    ).slice(0, 100);
  }, [iconSearch, POPULAR_ICONS]);

  const CATEGORIES = [
    { value: '',      label: '— Kategori seçin —' },
    { value: 'satis', label: 'Satış & Pazarlama' },
    { value: 'ik',    label: 'İnsan Kaynakları' },
    { value: 'finans',label: 'Finans' },
    { value: 'stok',  label: 'Stok & Lojistik' },
    { value: 'destek',label: 'Müşteri Desteği' },
    { value: 'uretim',label: 'Üretim' },
    { value: 'verim', label: 'Verimlilik' },
  ];

  const TAGS = [
    { value: '',        label: '— Etiket yok —' },
    { value: 'popular', label: '★ Popüler' },
    { value: 'new',     label: 'Yeni' },
    { value: 'beta',    label: 'Beta' },
    { value: 'coming',  label: 'Yakında' },
  ];

  const [formData, setFormData] = useState<Partial<ModuleDto>>({
    code: '',
    name: '',
    description: '',
    icon: 'FaPuzzlePiece',
    colorAccent: '#3b82f6',
    priceMonthly: 0,
    priceYearly: 0,
    isPublic: true,
    isPopular: false,
    featuresJson: '',
    category: null,
    tag: null,
  });

  const fetchModules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await moduleService.getModules();
      setModules(data);
    } catch {
      toast.error("Modüller yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const handleOpenModal = (module?: ModuleDto) => {
    setActiveTab('details');
    if (module) {
      setEditingModule(module);
      let feats = "";
      try {
        if (module.featuresJson) {
          const parsed = JSON.parse(module.featuresJson);
          feats = Array.isArray(parsed) ? parsed.join(", ") : "";
        }
      } catch {
        feats = "";
      }
      
      setFormData({
        ...module,
        featuresJson: feats,
        category: module.category ?? null,
        tag: module.tag ?? null,
      });
    } else {
      setEditingModule(null);
      setFormData({
        code: '',
        name: '',
        description: '',
        icon: 'FaPuzzlePiece',
        colorAccent: '#3b82f6',
        priceMonthly: 0,
        priceYearly: 0,
        isPublic: true,
        isPopular: false,
        featuresJson: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      const featuresArr = (formData.featuresJson || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        featuresJson: featuresArr.length > 0 ? JSON.stringify(featuresArr) : null,
      };

      if (editingModule) {
        await moduleService.updateModule(payload);
        toast.success("Modül güncellendi");
      } else {
        await moduleService.createModule(payload);
        toast.success("Yeni modül oluşturuldu");
      }
      setIsModalOpen(false);
      fetchModules();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "İşlem sırasında hata oluştu");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Emin misiniz?',
      text: "Bu modülü silmek üzeresiniz. Bu işlem geri alınamaz!",
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
      await moduleService.deleteModule(id);
      toast.success("Modül silindi");
      fetchModules();
    } catch {
      toast.error("Modül silinemedi");
    }
  };

  const columns: ColumnConfig<ModuleDto>[] = [
    {
      field: 'icon',
      title: 'İkon',
      width: 80,
      template: (row) => (
        <div className={styles.iconPreview} style={{ color: row.colorAccent || 'var(--color-primary)' }}>
          <DynamicIcon name={row.icon || 'FaPuzzlePiece'} />
        </div>
      )
    },
    {
      field: 'name',
      title: 'Modül Adı',
      sortable: true,
      template: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.name}</div>
          <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.code}</code>
        </div>
      )
    },
    {
      field: 'priceMonthly',
      title: 'Fiyat (Aylık)',
      width: 150,
      sortable: true,
      template: (row) => (
        <span className={styles.priceBadge}>
          {row.priceMonthly ? `₺${row.priceMonthly.toLocaleString('tr-TR')}` : 'Ücretsiz'}
        </span>
      )
    },
    {
      field: 'isPublic',
      title: 'Durum',
      width: 120,
      template: (row) => (
        <span className={`${styles.statusBadge} ${row.isPublic ? styles.statusPublic : styles.statusPrivate}`}>
          {row.isPublic ? 'Public' : 'Private'}
        </span>
      )
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <FaLayerGroup className={styles.mainIcon} />
          <div>
            <h1 className={styles.pageTitle}>Sistem Modülleri</h1>
            <p className={styles.pageSubtitle}>Platform modüllerini ve yeteneklerini yönetin</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Button variant="ghost" onClick={async () => {
            try {
              toast.loading("Sistem menüleri kuruluyor...", { id: 'seed' });
              await moduleService.seedSystemMenus();
              toast.success("Sistem menüleri başarıyla güncellendi", { id: 'seed' });
              fetchModules();
            } catch {
              toast.error("İşlem başarısız", { id: 'seed' });
            }
          }}>
            Sistem Menülerini Kur/Güncelle
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <FaPlus /> Yeni Modül
          </Button>
        </div>
      </header>

      <div className={styles.content}>
        <AdvancedDataTable<ModuleDto>
          columns={columns}
          dataSource={modules}
          loading={loading}
          onEdit={handleOpenModal}
          onDelete={(row) => handleDelete(row.id)}
          toolbar={['search', 'excel', 'pdf']}
          exportTitle="Sistem_Modulleri"
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingModule ? `Modül Yönetimi: ${editingModule.name}` : 'Yeni Modül Tanımla'}
        size="xl"
        footer={activeTab === 'details' ? (
          <div className={styles.formActions}>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>İptal</Button>
            <Button onClick={() => handleSubmit()} leftIcon={<FaSave />}>
              {editingModule ? 'Değişiklikleri Kaydet' : 'Modülü Oluştur'}
            </Button>
          </div>
        ) : null}
      >
        <div className={styles.modalContent}>
          {editingModule && (
            <div className={styles.tabContainer}>
              <div 
                className={`${styles.tab} ${activeTab === 'details' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Genel Bilgiler
              </div>
              <div 
                className={`${styles.tab} ${activeTab === 'menu' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('menu')}
              >
                Menü Yapısı
              </div>
            </div>
          )}

          <div className={styles.modalBody}>
            {activeTab === 'details' ? (
              <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Modül Kodu</label>
                    <input 
                      required
                      className={styles.formInput}
                      value={formData.code}
                      onChange={e => setFormData({...formData, code: e.target.value})}
                      placeholder="örn: ecommerce"
                      disabled={!!editingModule}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Modül Adı</label>
                    <input 
                      required
                      className={styles.formInput}
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="örn: E-Ticaret Modülü"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>İkon</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div className={styles.iconPreview} style={{ 
                        width: '42px', 
                        height: '42px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        fontSize: '1.2rem',
                        color: formData.colorAccent || '#3b82f6'
                      }}>
                        <DynamicIcon name={formData.icon || 'FaPuzzlePiece'} />
                      </div>
                      <Button variant="ghost" onClick={() => setIsIconPickerOpen(true)}>
                        İkon Seç
                      </Button>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formData.icon}</span>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tema Rengi</label>
                    <input 
                      type="color"
                      className={styles.formInput}
                      style={{ height: '42px', padding: '4px' }}
                      value={formData.colorAccent || '#3b82f6'}
                      onChange={e => setFormData({...formData, colorAccent: e.target.value})}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Aylık Fiyat (₺)</label>
                    <input 
                      type="number"
                      className={styles.formInput}
                      value={formData.priceMonthly || 0}
                      onChange={e => setFormData({...formData, priceMonthly: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Yıllık Fiyat (₺)</label>
                    <input 
                      type="number"
                      className={styles.formInput}
                      value={formData.priceYearly || 0}
                      onChange={e => setFormData({...formData, priceYearly: parseFloat(e.target.value)})}
                    />
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.formLabel}>Özellikler (Virgülle ayırın)</label>
                    <textarea 
                      className={`${styles.formInput} ${styles.formTextarea}`}
                      value={formData.featuresJson ?? ''}
                      onChange={e => setFormData({...formData, featuresJson: e.target.value})}
                      placeholder="Ürün kataloğu, Stok takibi, Ödeme entegrasyonu"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Kategori</label>
                    <select
                      className={styles.formInput}
                      value={formData.category ?? ''}
                      onChange={e => setFormData({...formData, category: e.target.value || null})}
                    >
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Etiket (Rozet)</label>
                    <select
                      className={styles.formInput}
                      value={formData.tag ?? ''}
                      onChange={e => setFormData({...formData, tag: e.target.value || null})}
                    >
                      {TAGS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>

                  <div className={`${styles.checkboxGroup} ${styles.fullWidth}`}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={e => setFormData({...formData, isPublic: e.target.checked})}
                      />
                      Müşterilere Açık (Public)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginLeft: '20px' }}>
                      <input
                        type="checkbox"
                        checked={formData.isPopular}
                        onChange={e => setFormData({...formData, isPopular: e.target.checked})}
                      />
                      Popüler Etiketi Ekle
                    </label>
                  </div>
                </div>
              </form>
            ) : (
              editingModule && <ModuleMenuBuilder moduleId={editingModule.id} />
            )}
          </div>
        </div>
      </Modal>

      {/* --- ICON PICKER MODAL --- */}
      {isIconPickerOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 1200 }} onClick={() => setIsIconPickerOpen(false)}>
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
  );
};

export default AdminModulesPage;
