import { useState, useEffect, useCallback } from 'react';
import { FaStore, FaPlus, FaCheck, FaTimes, FaInfoCircle, FaDatabase, FaEnvelope, FaGlobe } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../shared/api/axiosConfig';
import { AdvancedDataTable, Badge, Button, Modal, Input } from '../../shared/ui';
import styles from './ECommerceTenantsPage.module.css';

interface TenantDto {
  id: string;
  name: string;
  slug: string;
  databaseName: string;
  plan: string;
  ownerEmail: string;
  currencyCode: string;
  isMigrated: boolean;
  isActive: boolean;
  createdAt: string;
}

export const ECommerceTenantsPage = () => {
  const [tenants, setTenants] = useState<TenantDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    ownerEmail: '',
    plan: 0,
    currencyCode: 'TRY'
  });

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ items: TenantDto[] }>('admin/tenants');
      const data = (res.data as any).items?.items || (res.data as any).items || [];
      setTenants(data);
    } catch {
      toast.error('Mağaza listesi alınamadı.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const handleCreateTenant = async () => {
    if (!formData.name || !formData.slug || !formData.ownerEmail) {
      toast.error('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    try {
      toast.loading('Mağaza oluşturuluyor ve veritabanı kuruluyor... Bu işlem biraz sürebilir.', { id: 'createTenant' });
      await apiClient.post('admin/tenants', formData);
      toast.success('Mağaza başarıyla oluşturuldu!', { id: 'createTenant' });
      setIsModalOpen(false);
      setFormData({ name: '', slug: '', ownerEmail: '', plan: 0, currencyCode: 'TRY' });
      fetchTenants();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Mağaza oluşturulurken hata oluştu.';
      toast.error(errMsg, { id: 'createTenant' });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerCard}>
        <div className={styles.headerTitleWrapper}>
          <FaStore className={styles.headerIcon} />
          <div>
            <h1 className={styles.headerTitle}>Mağazalar (Tenants)</h1>
            <p className={styles.headerSubtitle}>Sistemdeki tüm e-ticaret mağazalarını yönetin ve aktif mağaza seçin.</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)} leftIcon={<FaPlus />}>
          Yeni Mağaza Ekle
        </Button>
      </div>

      <div className={styles.tableContainer}>
        <AdvancedDataTable<TenantDto>
          dataSource={tenants}
          columns={[
            { field: 'name', title: 'Mağaza Adı', template: (row) => <strong>{row.name}</strong> },
            { field: 'slug', title: 'Slug' },
            { field: 'ownerEmail', title: 'Sahip Email' },
            { 
              field: 'isMigrated', 
              title: 'E-Ticaret Modülü',
              width: 150,
              template: (row) => (
                <Badge variant={row.isMigrated ? 'success' : 'warning'} size="sm">
                  {row.isMigrated ? 'Aktif (DB Hazır)' : 'Kuruluyor'}
                </Badge>
              )
            },
            { 
              field: 'crm_status', 
              title: 'CRM Modülü',
              width: 130,
              template: () => (
                <Badge variant="secondary" size="sm">
                  Kapalı
                </Badge>
              )
            },
            { 
              field: 'hr_status', 
              title: 'İnsan Kaynakları',
              width: 150,
              template: () => (
                <Badge variant="secondary" size="sm">
                  Kapalı
                </Badge>
              )
            }
          ]}
          pageable={{ pageSize: 10 }}
          onDetail={(row) => console.log('Detail:', row)}
          detailModal={(row, onClose) => (
            <div className={styles.detailContainer}>
              <div className={styles.detailHeader}>
                <FaStore className={styles.detailIcon} />
                <div>
                  <h2 className={styles.detailTitle}>{row.name}</h2>
                  <p className={styles.detailSubtitle}>Mağaza Kimliği: {row.id}</p>
                </div>
              </div>
              
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <FaGlobe />
                  <div>
                    <label>Adres (Slug)</label>
                    <span>{row.slug}.wixi.com</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <FaDatabase />
                  <div>
                    <label>Veritabanı</label>
                    <span>{row.databaseName}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <FaEnvelope />
                  <div>
                    <label>Sahip Email</label>
                    <span>{row.ownerEmail}</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <FaInfoCircle />
                  <div>
                    <label>Plan / Para Birimi</label>
                    <span>{row.plan === 0 ? 'Standart' : 'Premium'} / {row.currencyCode}</span>
                  </div>
                </div>
              </div>

              <div className={styles.detailStatus}>
                <div className={styles.statusBox}>
                  <label>E-Ticaret Modülü</label>
                  <Badge variant={row.isMigrated ? 'success' : 'warning'}>
                    {row.isMigrated ? 'Aktif ve Hazır' : 'Kurulum Aşamasında'}
                  </Badge>
                </div>
                <div className={styles.statusBox}>
                  <label>Genel Durum</label>
                  <Badge variant={row.isActive ? 'success' : 'danger'}>
                    {row.isActive ? 'Hesap Aktif' : 'Hesap Askıda'}
                  </Badge>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <Button variant="secondary" onClick={onClose}>Kapat</Button>
                <Button variant="primary" onClick={() => {
                   localStorage.setItem('wixi-active-tenant', row.slug);
                   toast.success(`${row.name} mağazası aktif edildi.`);
                   onClose();
                   window.location.reload();
                }}>Bu Mağazayı Yönet</Button>
              </div>
            </div>
          )}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yeni Mağaza Ekle">
        <div className={styles.modalContent}>
          <Input 
            label="Mağaza Adı"
            placeholder="Örn: ABC Moda"
            value={formData.name}
            onChange={(e) => {
              const val = e.target.value;
              setFormData({...formData, name: val, slug: val.toLowerCase().replace(/[^a-z0-9]/g, '-')});
            }}
            required
          />
          <Input 
            label="Mağaza Adresi (Slug)"
            placeholder="Örn: abc-moda"
            value={formData.slug}
            onChange={(e) => setFormData({...formData, slug: e.target.value})}
            required
            hint="Subdomain olarak kullanılacaktır."
          />
          <Input 
            label="Mağaza Sahibi Email"
            type="email"
            placeholder="ornek@firma.com"
            value={formData.ownerEmail}
            onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})}
            required
          />
          <div className={styles.modalFooter}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} leftIcon={<FaTimes />}>İptal</Button>
            <Button variant="primary" onClick={handleCreateTenant} leftIcon={<FaPlus />}>Oluştur</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
