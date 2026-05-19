import { useState, useEffect } from 'react';
import { FaStore, FaPlus, FaTimes, FaInfoCircle, FaDatabase, FaEnvelope, FaGlobe } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
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
  enabledModules: string;
  createdAt: string;
}

export const ECommerceTenantsPage = () => {
  const [tenants, setTenants] = useState<TenantDto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const doRefresh = () => setRefreshKey(k => k + 1);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    ownerEmail: '',
    plan: 0,
    currencyCode: 'TRY'
  });

  useEffect(() => {
    const load = async () => {
      try {
        interface TenantsResponse { items?: TenantDto[] | { items?: TenantDto[] } }
        const res = await apiClient.get<TenantsResponse>('admin/tenants');
        const rawItems = res.data.items;
        const data: TenantDto[] = Array.isArray(rawItems)
          ? rawItems
          : ((rawItems as { items?: TenantDto[] })?.items ?? []);
        setTenants(data);
      } catch {
        toast.error('Mağaza listesi alınamadı.');
      }
    };
    void load();
  }, [refreshKey]);

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
      doRefresh();
    } catch (err: unknown) {
      const errMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Mağaza oluşturulurken hata oluştu.';
      toast.error(errMsg, { id: 'createTenant' });
    }
  };

  const handleDeleteTenant = async (tenant: TenantDto) => {
    const result = await Swal.fire({
      title: 'Mağazayı Sil?',
      html: `<b>${tenant.name}</b> mağazası ve tüm veritabanı (<code>${tenant.databaseName}</code>) kalıcı olarak silinecektir.<br><br><span style="color:#ef4444;font-weight:bold">Bu işlem geri alınamaz.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'İptal',
      confirmButtonText: 'Evet, kalıcı olarak sil',
      background: 'var(--surface)',
      color: 'var(--text-main)',
    });

    if (!result.isConfirmed) return;

    // İkinci onay
    const confirm2 = await Swal.fire({
      title: 'Emin misiniz?',
      text: `"${tenant.name}" mağazasına ait tüm ürünler, siparişler ve müşteriler silinecek.`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Hayır, iptal et',
      confirmButtonText: 'Evet, veritabanını sil',
      background: 'var(--surface)',
      color: 'var(--text-main)',
    });

    if (!confirm2.isConfirmed) return;

    try {
      toast.loading('Mağaza siliniyor...', { id: 'deleteTenant' });
      await apiClient.delete(`admin/tenants/${tenant.id}`);
      toast.success('Mağaza ve veritabanı başarıyla silindi.', { id: 'deleteTenant' });
      doRefresh();
    } catch (err: unknown) {
      const errMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Silme işlemi başarısız.';
      toast.error(errMsg, { id: 'deleteTenant' });
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
              template: (row) => {
                const isActive = row.enabledModules?.includes('ecommerce');
                return (
                  <Badge variant={isActive ? 'success' : 'secondary'} size="sm">
                    {isActive ? (row.isMigrated ? 'Aktif (DB Hazır)' : 'Kuruluyor') : 'Kapalı'}
                  </Badge>
                );
              }
            },
            { 
              field: 'enabledModules', 
              title: 'CRM Modülü',
              width: 130,
              template: (row) => {
                const isActive = row.enabledModules?.includes('crm');
                return (
                  <Badge variant={isActive ? 'success' : 'secondary'} size="sm">
                    {isActive ? 'Aktif' : 'Kapalı'}
                  </Badge>
                );
              }
            },
            { 
              field: 'enabledModules', 
              title: 'İnsan Kaynakları',
              width: 150,
              template: (row) => {
                const isActive = row.enabledModules?.includes('hr');
                return (
                  <Badge variant={isActive ? 'success' : 'secondary'} size="sm">
                    {isActive ? 'Aktif' : 'Kapalı'}
                  </Badge>
                );
              }
            }
          ]}
          pageable={{ pageSize: 10 }}
          onDelete={handleDeleteTenant}
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
                  <label>Satın Alınan Modüller</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {row.enabledModules?.split(',').map(m => (
                      <Badge key={m} variant="success" size="sm">{m.toUpperCase()}</Badge>
                    ))}
                    {(!row.enabledModules || row.enabledModules.length === 0) && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Modül bulunamadı</span>}
                  </div>
                </div>
                <div className={styles.statusBox}>
                  <label>E-Ticaret Durumu</label>
                  <Badge variant={row.isMigrated ? 'success' : 'warning'}>
                    {row.isMigrated ? 'DB Aktif ve Hazır' : 'DB Kurulum Aşamasında'}
                  </Badge>
                </div>
                <div className={styles.statusBox}>
                  <label>Hesap Durumu</label>
                  <Badge variant={row.isActive ? 'success' : 'danger'}>
                    {row.isActive ? 'Aktif' : 'Askıda'}
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
