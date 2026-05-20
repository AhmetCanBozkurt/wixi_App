import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../shared/api/axiosConfig';
import { Button } from '../../shared/ui/Button/Button';
import { Select } from '../../shared/ui/Select/Select';
import { Modal } from '../../shared/ui/Modal/Modal';
import styles from './AdminThemeManagementPage.module.css';

interface TenantSummary {
  id: string;
  name: string;
  slug: string;
  plan: string;
  isActive: boolean;
  updatedAt: string | null;
}

interface ThemeTemplate {
  id: number;
  name: string;
  description: string | null;
  previewImageUrl: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

const PLAN_COLORS: Record<string, string> = {
  Free: '#6b7280',
  Starter: '#3b82f6',
  Pro: '#8b5cf6',
  Enterprise: '#f59e0b',
};

export const AdminThemeManagementPage = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [templates, setTemplates] = useState<ThemeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkTemplateId, setBulkTemplateId] = useState<string>('');
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [tenantsRes, templatesRes] = await Promise.all([
          apiClient.get<TenantSummary[]>('/admin/theme-management/stores'),
          apiClient.get<ThemeTemplate[]>('/admin/theme-management/templates'),
        ]);
        setTenants(tenantsRes.data);
        setTemplates(templatesRes.data);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === tenants.length) setSelected(new Set());
    else setSelected(new Set(tenants.map(t => t.id)));
  };

  const handleBulkApply = async () => {
    if (!bulkTemplateId || selected.size === 0) return;
    setApplying(true);
    try {
      const res = await apiClient.post<{ success: number; failed: number }>(
        '/admin/theme-management/bulk-apply',
        { templateId: Number(bulkTemplateId), tenantIds: Array.from(selected) }
      );
      alert(`Başarılı: ${res.data.success}, Başarısız: ${res.data.failed}`);
      setBulkModalOpen(false);
      setSelected(new Set());
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('tr-TR') : '—';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Tema Yönetimi</h2>
          <p className={styles.subtitle}>Tüm mağazaların temalarını yönetin</p>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/theme-management/templates')}
          >
            Şablonlar
          </Button>
          {selected.size > 0 && (
            <Button variant="primary" onClick={() => setBulkModalOpen(true)}>
              {selected.size} Mağazaya Uygula
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Yükleniyor...</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selected.size === tenants.length && tenants.length > 0}
                    onChange={selectAll}
                  />
                </th>
                <th>Mağaza</th>
                <th>Plan</th>
                <th>Durum</th>
                <th>Son Güncelleme</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(t => (
                <tr key={t.id} className={selected.has(t.id) ? styles.selectedRow : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(t.id)}
                      onChange={() => toggleSelect(t.id)}
                    />
                  </td>
                  <td>
                    <div className={styles.tenantName}>{t.name}</div>
                    <div className={styles.tenantSlug}>{t.slug}</div>
                  </td>
                  <td>
                    <span
                      className={styles.planBadge}
                      style={{
                        background: (PLAN_COLORS[t.plan] ?? '#6b7280') + '22',
                        color: PLAN_COLORS[t.plan] ?? '#6b7280',
                      }}
                    >
                      {t.plan}
                    </span>
                  </td>
                  <td>
                    <span className={t.isActive ? styles.active : styles.inactive}>
                      {t.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className={styles.date}>{formatDate(t.updatedAt)}</td>
                  <td className={styles.actions}>
                    <Button
                      variant="ghost"
                      onClick={() => navigate(`/admin/theme-management/stores/${t.id}`)}
                    >
                      Geçmiş
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => navigate(`/admin/theme-management/editor/${t.slug}`)}
                    >
                      Tasarım Editörü →
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        title={`${selected.size} Mağazaya Şablon Uygula`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setBulkModalOpen(false)}>
              İptal
            </Button>
            <Button
              variant="primary"
              isLoading={applying}
              onClick={() => void handleBulkApply()}
            >
              Uygula
            </Button>
          </>
        }
      >
        <Select
          label="Şablon Seç"
          value={bulkTemplateId}
          onChange={v => setBulkTemplateId(v as string)}
          options={[
            { label: '— Şablon Seçin —', value: '' },
            ...templates.map(t => ({ label: t.name, value: String(t.id) })),
          ]}
        />
        <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted, #888)' }}>
          Seçilen {selected.size} mağazanın mevcut teması bu şablonla değiştirilecek ve
          yeni bir versiyon oluşturulacak.
        </p>
      </Modal>
    </div>
  );
};
