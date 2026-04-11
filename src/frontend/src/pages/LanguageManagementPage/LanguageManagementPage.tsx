import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaGlobe } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { apiClient } from '../../shared/api/axiosConfig';
import { AdvancedDataTable } from '../../shared/ui/AdvancedDataTable/AdvancedDataTable';
import { Badge } from '../../shared/ui/Badge/Badge';
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
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLang, setEditingLang] = useState<Language | null>(null);

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
    setLoading(true);
    try {
      const res = await apiClient.get<Language[]>('language');
      setLanguages(res.data);
    } catch {
      toast.error('Diller yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLanguages(); }, [fetchLanguages]);

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
      fetchLanguages();
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
        fetchLanguages();
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
          dataSource={languages}
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
          pageable={{ pageSize: 10 }}
          toolbar={['search', 'excel', 'pdf']}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
        />
      </div>

      {/* Modern Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>
                <FaGlobe style={{ color: 'var(--color-primary)' }} /> 
                {editingLang ? 'Dili Düzenle' : 'Yeni Dil Ekle'}
              </h3>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Dil Adı</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="örn: Türkçe" 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Dil Kodu</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.code} 
                    onChange={e => setFormData({ ...formData, code: e.target.value })} 
                    placeholder="örn: tr-TR" 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Bayrak Kodu (ISO 639-1)</label>
                  <input 
                    type="text" 
                    value={formData.flagCode} 
                    onChange={e => setFormData({ ...formData, flagCode: e.target.value })} 
                    placeholder="örn: tr, us" 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Bayrak Görseli (Dosya Seçin)</label>
                  <div className={styles.fileUploadWrapper}>
                    {formData.iconBase64 && (
                      <div className={styles.previewContainer}>
                        <img src={formData.iconBase64} alt="Önizleme" className={styles.flagPreview} />
                        <button 
                          type="button" 
                          className={styles.removeFileBtn}
                          onClick={() => setFormData(prev => ({ ...prev, iconBase64: '' }))}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    )}
                    <label className={styles.fileInputLabel}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className={styles.hiddenFileInput}
                      />
                      <FaPlus /> Görsel Yükle
                    </label>
                  </div>
                </div>
                
                <div className={styles.checkboxRow}>
                  <label className={styles.checkbox}>
                    <input 
                      type="checkbox" 
                      checked={formData.isActive} 
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })} 
                    />
                    <span>Aktif</span>
                  </label>
                  <label className={styles.checkbox}>
                    <input 
                      type="checkbox" 
                      checked={formData.isDefault} 
                      onChange={e => setFormData({ ...formData, isDefault: e.target.checked })} 
                    />
                    <span>Sistem Varsayılanı</span>
                  </label>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
                  Vazgeç
                </button>
                <button type="submit" className={styles.submitBtn}>
                  {editingLang ? 'Güncellemeleri Kaydet' : 'Dili Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
