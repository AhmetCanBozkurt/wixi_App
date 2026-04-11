import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaGlobe } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { apiClient } from '../../shared/api/axiosConfig';
import { AdvancedDataTable, type Column } from '../../shared/ui/AdvancedDataTable/AdvancedDataTable';
import styles from './LanguageManagementPage.module.css';

interface Language {
  id: string;
  code: string;
  name: string;
  isDefault: boolean;
  flagCode?: string;
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
    flagCode: ''
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
        flagCode: lang.flagCode || ''
      });
    } else {
      setEditingLang(null);
      setFormData({ code: '', name: '', isDefault: false, isActive: true, flagCode: '' });
    }
    setIsModalOpen(true);
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
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'İptal',
      confirmButtonText: 'Evet, Sil!',
      background: 'var(--bg-secondary)',
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

  const columns: Column<Language>[] = [
    {
      key: 'flagCode',
      header: 'Bayrak',
      width: '100px',
      render: (val) => (
        <span className={styles.flagBadge}>
          {String(val || '?').toUpperCase()}
        </span>
      )
    },
    {
      key: 'name',
      header: 'Dil Adı',
      sortable: true,
      searchable: true,
      render: (val) => <strong className={styles.nameText}>{String(val)}</strong>
    },
    {
      key: 'code',
      header: 'Kod',
      sortable: true,
      searchable: true,
      render: (val) => <code>{String(val)}</code>
    },
    {
      key: 'isActive',
      header: 'Durum',
      width: '120px',
      render: (val) => (
        <span className={`${styles.statusBadge} ${val ? styles.active : ''}`}>
          {val ? 'Aktif' : 'Pasif'}
        </span>
      )
    },
    {
      key: 'isDefault',
      header: 'Varsayılan',
      width: '120px',
      render: (val) => val ? (
        <span className={styles.defaultBadge} title="Varsayılan Dil">
          <FaCheck />
        </span>
      ) : null
    },
    {
      key: 'actions',
      header: 'İşlemler',
      width: '120px',
      render: (_, row) => (
        <div className={styles.tableActions}>
          <button className={styles.actionBtn} title="Düzenle" onClick={() => handleOpenModal(row)}>
            <FaEdit />
          </button>
          <button className={styles.actionBtnDelete} title="Sil" onClick={() => handleDelete(row)}>
            <FaTrash />
          </button>
        </div>
      )
    }
  ];

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
        <AdvancedDataTable 
          columns={columns} 
          data={languages} 
          pageSize={10}
          loading={loading}
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
