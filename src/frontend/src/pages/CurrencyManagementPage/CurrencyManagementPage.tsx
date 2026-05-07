import { useState } from 'react';
import { FaDollarSign, FaPlus, FaStar } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { apiClient } from '../../shared/api/axiosConfig';
import { AdvancedDataTable, Badge, Card, Input, Button, Modal, Switch } from '../../shared/ui';
import styles from './CurrencyManagementPage.module.css';

interface Currency {
  id: string;
  code: string;
  name: string;
  nameEn?: string;
  symbol?: string;
  unit: number;
  isBase: boolean;
  isTcmbTracked: boolean;
  isActive: boolean;
  sortOrder: number;
}

const EMPTY_FORM = {
  code: '',
  name: '',
  nameEn: '',
  symbol: '',
  unit: 1,
  isTcmbTracked: false,
  isActive: true,
  sortOrder: 0
};

export const CurrencyManagementPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (currency?: Currency) => {
    if (currency) {
      setEditingCurrency(currency);
      setFormData({
        code: currency.code,
        name: currency.name,
        nameEn: currency.nameEn || '',
        symbol: currency.symbol || '',
        unit: currency.unit,
        isTcmbTracked: currency.isTcmbTracked,
        isActive: currency.isActive,
        sortOrder: currency.sortOrder
      });
    } else {
      setEditingCurrency(null);
      setFormData({ ...EMPTY_FORM });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error('Para birimi kodu ve adı zorunludur.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCurrency) {
        await apiClient.put('currency', { id: editingCurrency.id, ...formData });
        toast.success('Para birimi güncellendi.');
      } else {
        await apiClient.post('currency', formData);
        toast.success('Yeni para birimi eklendi.');
      }
      setIsModalOpen(false);
      setRefreshKey(prev => prev + 1);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'İşlem sırasında bir hata oluştu.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (currency: Currency) => {
    if (currency.isBase) {
      toast.error('Ana para birimi silinemez. Önce başka bir para birimini ana olarak belirleyin.');
      return;
    }

    const result = await Swal.fire({
      title: 'Para Birimini Sil?',
      text: `${currency.name} (${currency.code}) sistemden silinecektir.`,
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
        await apiClient.delete(`currency/${currency.id}`);
        toast.success('Para birimi silindi.');
        setRefreshKey(prev => prev + 1);
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Para birimi silinemedi.';
        toast.error(msg);
      }
    }
  };

  const handleSetBase = async (currency: Currency) => {
    const result = await Swal.fire({
      title: 'Ana Para Birimi Yap?',
      text: `${currency.name} (${currency.code}) sistem ana para birimi olarak ayarlanacaktır.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'var(--color-warning)',
      cancelButtonText: 'İptal',
      confirmButtonText: 'Evet, Ayarla',
      background: 'var(--surface)',
      color: 'var(--text-main)'
    });

    if (result.isConfirmed) {
      try {
        await apiClient.post(`currency/set-base/${currency.id}`);
        toast.success(`${currency.code} ana para birimi olarak ayarlandı.`);
        setRefreshKey(prev => prev + 1);
      } catch {
        toast.error('İşlem başarısız oldu.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <FaDollarSign className={styles.mainIcon} />
          <div>
            <h1>Para Birimi Yönetimi</h1>
            <p>Sistem para birimlerini ve TCMB takip ayarlarını yönetin.</p>
          </div>
        </div>
        <button className={styles.addBtn} onClick={() => handleOpenModal()}>
          <FaPlus /> Yeni Para Birimi
        </button>
      </div>

      <div className={styles.content}>
        <AdvancedDataTable<Currency>
          key={refreshKey}
          dataSource="currency"
          columns={[
            {
              field: 'code',
              title: 'Kod',
              width: 100,
              template: (row) => (
                <code className={styles.codeBadge}>{row.code}</code>
              )
            },
            { field: 'name', title: 'Ad' },
            {
              field: 'symbol',
              title: 'Sembol',
              width: 80,
              template: (row) => row.symbol
                ? <span className={styles.symbolText}>{row.symbol}</span>
                : <span style={{ color: 'var(--text-muted)' }}>—</span>
            },
            {
              field: 'unit',
              title: 'Birim',
              width: 80,
              template: (row) => <Badge variant="info" size="sm">{row.unit}</Badge>
            },
            {
              field: 'isBase',
              title: 'Ana Kur',
              width: 100,
              template: (row) => row.isBase
                ? <Badge variant="warning" size="sm"><FaStar style={{ marginRight: '4px' }} />BASE</Badge>
                : null
            },
            {
              field: 'isTcmbTracked',
              title: 'TCMB Takip',
              width: 120,
              template: (row) => (
                <Badge variant={row.isTcmbTracked ? 'primary' : 'default'} size="sm" showDot>
                  {row.isTcmbTracked ? 'Takip Ediliyor' : 'Takip Yok'}
                </Badge>
              )
            },
            {
              field: 'isActive',
              title: 'Durum',
              width: 100,
              template: (row) => (
                <Badge variant={row.isActive ? 'success' : 'danger'} size="sm" showDot>
                  {row.isActive ? 'Aktif' : 'Pasif'}
                </Badge>
              )
            }
          ]}
          groupable={true}
          sortable={true}
          selectable={true}
          reorderable={true}
          resizable={true}
          pageable={{ pageSize: 12 }}
          toolbar={['search', 'excel', 'pdf']}
          exportTitle="Para_Birimleri"
          onEdit={handleOpenModal}
          onDelete={handleDelete}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCurrency ? 'Para Birimini Düzenle' : 'Yeni Para Birimi Ekle'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Vazgeç</Button>
            <Button variant="primary" isLoading={isSubmitting} onClick={handleSubmit}>
              {editingCurrency ? 'Değişiklikleri Kaydet' : 'Para Birimini Oluştur'}
            </Button>
          </>
        }
      >
        <div className={styles.modalGrid}>
          <div className={styles.modalLeft}>
            <Card title="Ayarlar" subtitle="TCMB takip ve durum ayarları">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Switch
                  label="TCMB Takip"
                  description="Bu para birimi TCMB'den günlük olarak güncellenir."
                  checked={formData.isTcmbTracked}
                  onChange={e => setFormData({ ...formData, isTcmbTracked: e.target.checked })}
                />
                <Switch
                  label="Aktif"
                  description="Para birimi sistemde aktif olarak kullanılabilir."
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                />
              </div>
            </Card>

            {editingCurrency && !editingCurrency.isBase && (
              <div className={styles.setBaseCard}>
                <p className={styles.setBaseInfo}>
                  Bu para birimini sistem ana para birimi olarak belirlemek için butona tıklayın.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<FaStar />}
                  onClick={() => {
                    setIsModalOpen(false);
                    handleSetBase(editingCurrency);
                  }}
                >
                  Ana Para Birimi Yap
                </Button>
              </div>
            )}
          </div>

          <div className={styles.modalRight}>
            <Card title="Temel Bilgiler" subtitle="ISO kodu, ad ve sembol bilgileri">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Input
                  label="Para Birimi Kodu (ISO 4217)"
                  placeholder="USD, EUR, TRY"
                  required
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  leftIcon={<FaDollarSign size={14} />}
                />
                <Input
                  label="Türkçe Ad"
                  placeholder="ABD Doları"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  label="İngilizce Ad"
                  placeholder="US Dollar"
                  value={formData.nameEn}
                  onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                />
                <Input
                  label="Sembol"
                  placeholder="$, €, ₺"
                  value={formData.symbol}
                  onChange={e => setFormData({ ...formData, symbol: e.target.value })}
                />
                <Input
                  label="Birim"
                  type="number"
                  placeholder="1"
                  value={formData.unit}
                  onChange={e => setFormData({ ...formData, unit: parseInt(e.target.value) || 1 })}
                />
                <Input
                  label="Sıra"
                  type="number"
                  placeholder="0"
                  value={formData.sortOrder}
                  onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
            </Card>
          </div>
        </div>
      </Modal>
    </div>
  );
};
