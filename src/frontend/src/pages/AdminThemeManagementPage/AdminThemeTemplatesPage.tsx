import { useEffect, useState, useCallback } from 'react';
import apiClient from '../../shared/api/axiosConfig';
import { Button } from '../../shared/ui/Button/Button';
import { Input } from '../../shared/ui/Input/Input';
import { Modal } from '../../shared/ui/Modal/Modal';
import { Switch } from '../../shared/ui/Switch/Switch';
import styles from './AdminThemeTemplatesPage.module.css';

interface ThemeTemplate {
  id: number;
  name: string;
  description: string | null;
  previewImageUrl: string | null;
  themeConfigJson: string | null;
  globalComponentsConfigJson: string | null;
  customCssOverride: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

interface TemplateForm {
  name: string;
  description: string;
  previewImageUrl: string;
  themeConfigJson: string;
  globalComponentsConfigJson: string;
  customCssOverride: string;
  isDefault: boolean;
}

const EMPTY_FORM: TemplateForm = {
  name: '',
  description: '',
  previewImageUrl: '',
  themeConfigJson: '',
  globalComponentsConfigJson: '',
  customCssOverride: '',
  isDefault: false,
};

export const AdminThemeTemplatesPage = () => {
  const [templates, setTemplates] = useState<ThemeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<TemplateForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<ThemeTemplate[]>('/admin/theme-management/templates');
      setTemplates(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = async (id: number) => {
    const res = await apiClient.get<ThemeTemplate>(
      `/admin/theme-management/templates/${id}`
    );
    const t = res.data;
    setForm({
      name: t.name,
      description: t.description ?? '',
      previewImageUrl: t.previewImageUrl ?? '',
      themeConfigJson: t.themeConfigJson ?? '',
      globalComponentsConfigJson: t.globalComponentsConfigJson ?? '',
      customCssOverride: t.customCssOverride ?? '',
      isDefault: t.isDefault,
    });
    setEditId(id);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) {
        await apiClient.put(`/admin/theme-management/templates/${editId}`, form);
      } else {
        await apiClient.post('/admin/theme-management/templates', form);
      }
      setModalOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/admin/theme-management/templates/${deleteId}`);
      setDeleteId(null);
      await load();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Tema Şablonları</h2>
          <p className={styles.subtitle}>Super Admin tarafından yönetilen şablonlar</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          + Yeni Şablon
        </Button>
      </div>

      {loading ? (
        <div className={styles.loading}>Yükleniyor...</div>
      ) : (
        <div className={styles.grid}>
          {templates.map(t => (
            <div key={t.id} className={styles.card}>
              {t.previewImageUrl && (
                <img src={t.previewImageUrl} alt={t.name} className={styles.preview} />
              )}
              <div className={styles.cardBody}>
                <div className={styles.cardName}>{t.name}</div>
                {t.description && (
                  <p className={styles.cardDesc}>{t.description}</p>
                )}
                {t.isDefault && (
                  <span className={styles.defaultBadge}>Varsayılan</span>
                )}
              </div>
              <div className={styles.cardActions}>
                <Button variant="ghost" onClick={() => void openEdit(t.id)}>
                  Düzenle
                </Button>
                <Button variant="danger" onClick={() => setDeleteId(t.id)}>
                  Sil
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Şablonu Düzenle' : 'Yeni Şablon'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              İptal
            </Button>
            <Button
              variant="primary"
              isLoading={saving}
              onClick={() => void handleSave()}
            >
              Kaydet
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input
            label="Ad"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Açıklama"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
          <Input
            label="Önizleme Görseli URL"
            value={form.previewImageUrl}
            onChange={e => setForm(f => ({ ...f, previewImageUrl: e.target.value }))}
          />
          <Switch
            label="Varsayılan Şablon"
            checked={form.isDefault}
            onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
          />
        </div>
      </Modal>

      <Modal
        isOpen={deleteId != null}
        onClose={() => setDeleteId(null)}
        title="Şablonu Sil"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>
              Vazgeç
            </Button>
            <Button
              variant="danger"
              isLoading={deleting}
              onClick={() => void handleDelete()}
            >
              Evet, Sil
            </Button>
          </>
        }
      >
        <p>Bu şablonu silmek istediğinize emin misiniz?</p>
      </Modal>
    </div>
  );
};
