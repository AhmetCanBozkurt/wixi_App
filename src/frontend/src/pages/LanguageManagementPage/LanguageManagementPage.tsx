import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaGlobe } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { apiClient } from '../../shared/api/axiosConfig';
import { AdvancedDataTable, Badge, Card, Input, Button } from '../../shared/ui';
import styles from './LanguageManagementPage.module.css';

interface Language {
  id: string;
  code: string;
  name: string;
  isDefault: boolean;
  flagCode?: string;
  iconBase64?: string;
  isActive: boolean;
}

export const LanguageManagementPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLang, setEditingLang] = useState<Language | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Grid'i tazelemek için

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    isDefault: false,
    isActive: true,
    flagCode: '',
    iconBase64: ''
  });

  const fetchLanguages = useCallback(async () => {
    const res = await apiClient.get<Language[]>('language');
    return res.data;
  }, []);

  const handleOpenModal = (lang?: Language) => {
    if (lang) {
      setEditingLang(lang);
      setFormData({
        code: lang.code,
        name: lang.name,
        isDefault: lang.isDefault,
        isActive: lang.isActive,
        flagCode: lang.flagCode || '',
        iconBase64: lang.iconBase64 || ''
      });
    } else {
      setEditingLang(null);
      setFormData({ code: '', name: '', isDefault: false, isActive: true, flagCode: '', iconBase64: '' });
    }
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Görsel boyutu 2MB\'dan küçük olmalıdır');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, iconBase64: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLang) {
        await apiClient.put('language', { id: editingLang.id, ...formData });
        toast.success('Dil başarıyla güncellendi');
      } else {
        await apiClient.post('language', formData);
        toast.success('Yeni dil eklendi');
      }
      setIsModalOpen(false);
      setRefreshKey(prev => prev + 1); // Grid'i tazele
    } catch {
      toast.error('İşlem sırasında bir hata oluştu');
    }
  };

  const handleDelete = async (lang: Language) => {
    const result = await Swal.fire({
      title: 'Dili Sil?',
      text: `${lang.name} (${lang.code}) sistemden silinecektir.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--color-danger)',
      cancelButtonText: 'İptal',
      confirmButtonText: 'Evet, Sil!',
      background: 'var(--surface)',
      color: 'var(--text-main)'
    });

    if (result.isConfirmed) {
      try {
        await apiClient.delete(`language/${lang.id}`);
        toast.success('Dil silindi');
        setRefreshKey(prev => prev + 1); // Grid'i tazele
      } catch {
        toast.error('Dil silinemedi (Varsayılan dili silemezsiniz)');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <FaGlobe className={styles.mainIcon} />
          <div>
            <h1>Dil Yönetimi</h1>
            <p>Sistemin desteklediği dilleri ve bölgesel ayarları yönetin.</p>
          </div>
        </div>
        <button className={styles.addBtn} onClick={() => handleOpenModal()}>
          <FaPlus /> Yeni Dil Ekle
        </button>
      </div>

      <div className={styles.content}>
        <AdvancedDataTable<Language>
          key={refreshKey}
          dataSource="language"
          columns={[
            {
              field: 'iconBase64',
              title: 'Bayrak',
              width: 100,
              template: (row) => (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  {row.iconBase64 ? (
                    <img src={row.iconBase64} alt={row.name} style={{ height: '24px', borderRadius: '2px', border: '1px solid var(--border-glass)' }} />
                  ) : (
                    <Badge variant="info" size="sm">{row.code.substring(0,2).toUpperCase()}</Badge>
                  )}
                </div>
              )
            },
            { field: 'name', title: 'Dil Adı' },
            { field: 'code', title: 'Kod', template: (row) => <code>{row.code}</code> },
            {
              field: 'isActive',
              title: 'Durum',
              width: 120,
              template: (row) => <Badge variant={row.isActive ? 'success' : 'danger'} size="sm" showDot>{row.isActive ? 'Aktif' : 'Pasif'}</Badge>
            },
            {
              field: 'isDefault',
              title: 'Varsayılan',
              width: 120,
              template: (row) => row.isDefault ? <Badge variant="primary" size="sm" outline><FaCheck style={{ marginRight: '4px' }} /> Ana Dil</Badge> : null
            }
          ]}
          groupable={true}
          sortable={true}
          selectable={true}
          reorderable={true}
          resizable={true}
          pageable={{ pageSize: 12 }}
          toolbar={['search', 'excel', 'pdf']}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
        />
      </div>

      {/* Modern Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.premiumModal} onClick={e => e.stopPropagation()}>
            <div className={styles.premiumModalHeader}>
              <div className={styles.modalTitleArea}>
                <FaGlobe className={styles.modalTitleIcon} />
                <div>
                  <h3>{editingLang ? 'Dili Düzenle' : 'Yeni Dil Ekle'}</h3>
                  <p>{editingLang ? 'Mevcut dil ayarlarını güncelleyin.' : 'Sisteme yeni bir dil ve bölgesel ayar ekleyin.'}</p>
                </div>
              </div>
              <button className={styles.premiumCloseBtn} onClick={() => setIsModalOpen(false)}>
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.premiumModalBody}>
                <div className={styles.modalGrid}>
                  <Card title="Temel Bilgiler" subtitle="Dilin sistem genelindeki adı ve kodu">
                    <div className={styles.cardFields}>
                      <Input 
                        label="Dil Adı" 
                        required 
                        value={formData.name} 
                        onChange={e => setFormData({ ...formData, name: e.target.value })} 
                        placeholder="örn: Türkçe" 
                        leftIcon={<FaGlobe />}
                      />
                      <Input 
                        label="Dil Kodu (ISO)" 
                        required 
                        value={formData.code} 
                        onChange={e => setFormData({ ...formData, code: e.target.value })} 
                        placeholder="örn: tr-TR" 
                      />
                      <Input 
                        label="Bayrak Kodu" 
                        value={formData.flagCode} 
                        onChange={e => setFormData({ ...formData, flagCode: e.target.value })} 
                        placeholder="örn: tr, us" 
                      />
                    </div>
                  </Card>

                  <Card title="Görsel & Durum" subtitle="İkon yönetimi ve aktiflik durumu">
                    <div className={styles.cardFields}>
                      <div className={styles.fileUploadSection}>
                        <label className={styles.fieldLabel}>Bayrak Görseli</label>
                        <div className={styles.uploadBox}>
                          {formData.iconBase64 ? (
                            <div className={styles.imagePreviewWrapper}>
                              <img src={formData.iconBase64} alt="Önizleme" className={styles.imagePreview} />
                              <button type="button" onClick={() => setFormData(prev => ({ ...prev, iconBase64: '' }))} className={styles.removeImgBtn}>
                                <FaTrash size={12} />
                              </button>
                            </div>
                          ) : (
                            <label className={styles.uploadPlaceholder}>
                              <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                              <FaPlus />
                              <span>Görsel Yükle</span>
                            </label>
                          )}
                        </div>
                      </div>

                      <div className={styles.switchGrid}>
                        <div className={styles.switchItem}>
                          <label className={styles.switchLabel}>
                            <input 
                              type="checkbox" 
                              checked={formData.isActive} 
                              onChange={e => setFormData({ ...formData, isActive: e.target.checked })} 
                            />
                            <span>Dili Aktif Et</span>
                          </label>
                          <p className={styles.switchDesc}>Kullanıcılar bu dili seçebilir.</p>
                        </div>

                        <div className={styles.switchItem}>
                          <label className={styles.switchLabel}>
                            <input 
                              type="checkbox" 
                              checked={formData.isDefault} 
                              onChange={e => setFormData({ ...formData, isDefault: e.target.checked })} 
                            />
                            <span>Varsayılan Dil</span>
                          </label>
                          <p className={styles.switchDesc}>Sistem açılış dili olur.</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              <div className={styles.premiumModalFooter}>
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Vazgeç</Button>
                <Button variant="primary" type="submit">
                  {editingLang ? 'Değişiklikleri Kaydet' : 'Dili Oluştur'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
