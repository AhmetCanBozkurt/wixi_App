import { useState } from 'react';
import { FaPlus, FaCheck, FaGlobe } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { apiClient } from '../../shared/api/axiosConfig';
import { AdvancedDataTable, Badge, Card, Input, Button, Modal, Switch, ImageUpload } from '../../shared/ui';
import styles from './LanguageManagementPage.module.css';

interface Language extends Record<string, unknown> {
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
            },
            { field: 'createdAt', title: 'Oluşturma', hidden: true, template: (row) => row.createdAt ? new Date(row.createdAt as string).toLocaleString() : '-' },
            { field: 'createdByUser', title: 'Oluşturan', hidden: true },
            { field: 'updatedAt', title: 'Güncelleme', hidden: true, template: (row) => row.updatedAt ? new Date(row.updatedAt as string).toLocaleString() : '-' },
            { field: 'updatedByUser', title: 'Güncelleyen', hidden: true }
          ]}
          groupable={true}
          sortable={true}
          selectable={true}
          reorderable={true}
          resizable={true}
          pageable={{ pageSize: 12 }}
          toolbar={['search', 'excel', 'pdf']}
          exportTitle="Dil_Listesi"
          onEdit={handleOpenModal}
          onDelete={handleDelete}
        />
      </div>

      {/* Premium Modal Upgrade */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingLang ? 'Dili Düzenle' : 'Yeni Dil Ekle'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Vazgeç</Button>
            <Button variant="primary" onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}>
              {editingLang ? 'Değişiklikleri Kaydet' : 'Dili Oluştur'}
            </Button>
          </>
        }
      >
        <div className={styles.premiumModalContent}>
          <div className={styles.modalGrid}>
            <div className={styles.modalLeft}>
              <Card title="Görsel & Bayrak" subtitle="Dil ikonunu buradan yükleyebilirsiniz">
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                  <ImageUpload 
                    label="Bayrak İkonu" 
                    value={formData.iconBase64} 
                    onChange={val => setFormData({ ...formData, iconBase64: val || '' })}
                    shape="square"
                    size={120}
                    required
                  />
                </div>
              </Card>

              <Card title="Durum Ayarları" subtitle="Dilin sistem genelindeki görünürlüğü" style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Switch 
                    label="Dili Aktif Et" 
                    description="Kullanıcılar bu dili arayüzde seçebilir."
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <Switch 
                    label="Varsayılan Dil" 
                    description="Sistem açılışında bu dil otomatik seçilir."
                    checked={formData.isDefault}
                    onChange={e => setFormData({ ...formData, isDefault: e.target.checked })}
                  />
                </div>
              </Card>
            </div>

            <div className={styles.modalRight}>
              <Card title="Temel Bilgiler" subtitle="ISO standartlarına göre dil ayarları">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <Input 
                    label="Dil Adı" 
                    placeholder="Türkçe, English vb."
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    leftIcon={<FaGlobe size={14} />}
                  />
                  <Input 
                    label="Dil Kodu (ISO)" 
                    placeholder="tr-TR, en-US vb."
                    required
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                  />
                  <Input 
                    label="Flag Code" 
                    placeholder="tr, us, gb vb."
                    value={formData.flagCode}
                    onChange={e => setFormData({ ...formData, flagCode: e.target.value })}
                  />
                </div>
              </Card>
              
              <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(37, 99, 235, 0.05)', borderRadius: '12px', border: '1px dashed var(--color-primary-glow)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    <strong>Not:</strong> Dil dosyasını (JSON) oluşturmak için dili kaydettikten sonra Dil Dosyası Düzenleyici'ye gitmeniz gerekmektedir.
                  </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
