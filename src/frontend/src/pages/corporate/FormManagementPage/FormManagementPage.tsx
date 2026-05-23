import { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaWpforms, FaInbox } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { corpFormApi } from '../../../entities/CorpForm/api/corpFormApi';
import type { WebFormListItem, WebForm, WebFormSubmission } from '../../../entities/CorpForm/model/types';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { Button } from '../../../shared/ui/Button/Button';
import { Input } from '../../../shared/ui/Input/Input';
import styles from './FormManagementPage.module.css';

interface FormData {
  name: string;
  slug: string;
  notifyEmail: string;
  submitButtonText: string;
  successMessage: string;
  fieldsJson: string;
}

const emptyForm = (): FormData => ({
  name: '', slug: '', notifyEmail: '', submitButtonText: 'Gönder', successMessage: '', fieldsJson: '[]',
});

export default function FormManagementPage() {
  const [forms, setForms] = useState<WebFormListItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [formModal, setFormModal] = useState(false);
  const [editingForm, setEditingForm] = useState<WebFormListItem | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [submissionsModal, setSubmissionsModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState<WebFormListItem | null>(null);
  const [submissions, setSubmissions] = useState<WebFormSubmission[]>([]);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  const loadForms = async () => {
    setLoading(true);
    try {
      const res = await corpFormApi.getForms();
      setForms(res.data);
    } catch {
      toast.error('Formlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadForms(); }, []);

  const openCreate = () => {
    setEditingForm(null);
    setFormData(emptyForm());
    setFormModal(true);
  };

  const openEdit = async (f: WebFormListItem) => {
    try {
      const res = await corpFormApi.getFormBySlug(f.slug);
      const full: WebForm = res.data;
      setFormData({
        name: full.name, slug: full.slug, notifyEmail: full.notifyEmail ?? '',
        submitButtonText: full.submitButtonText, successMessage: full.successMessage ?? '',
        fieldsJson: full.fieldsJson ?? '[]',
      });
      setEditingForm(f);
      setFormModal(true);
    } catch {
      toast.error('Form yüklenemedi.');
    }
  };

  const save = async () => {
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error('Ad ve slug zorunlu.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: formData.name, slug: formData.slug,
        notifyEmail: formData.notifyEmail || undefined,
        submitButtonText: formData.submitButtonText || 'Gönder',
        successMessage: formData.successMessage || undefined,
        fieldsJson: formData.fieldsJson || undefined,
      };
      if (editingForm) {
        await corpFormApi.updateForm(editingForm.id, payload);
        toast.success('Form güncellendi.');
      } else {
        await corpFormApi.createForm(payload);
        toast.success('Form oluşturuldu.');
      }
      setFormModal(false);
      await loadForms();
    } catch {
      toast.error('Kayıt hatası.');
    } finally {
      setSaving(false);
    }
  };

  const deleteForm = async () => {
    if (!deleteId) return;
    try {
      await corpFormApi.deleteForm(deleteId);
      toast.success('Form silindi.');
      setDeleteId(null);
      await loadForms();
    } catch {
      toast.error('Silme hatası.');
    }
  };

  const openSubmissions = async (f: WebFormListItem) => {
    setSelectedForm(f);
    setSubmissionsModal(true);
    setSubmissionsLoading(true);
    try {
      const res = await corpFormApi.getSubmissions(f.id);
      setSubmissions(res.data.items);
      setTotalSubmissions(res.data.totalCount);
    } catch {
      toast.error('Başvurular yüklenemedi.');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}><FaWpforms /> Form Yönetimi</h1>
          <p className={styles.subtitle}>Kurumsal web formları ve başvurular</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <FaPlus /> Yeni Form
        </Button>
      </div>

      {loading ? (
        <div className={styles.loading}>Yükleniyor...</div>
      ) : (
        <div className={styles.table}>
          <table>
            <thead>
              <tr><th>Ad</th><th>Slug</th><th>Bildirim E-posta</th><th>Oluşturma</th><th></th></tr>
            </thead>
            <tbody>
              {forms.length === 0 && (
                <tr><td colSpan={5} className={styles.empty}>Henüz form yok.</td></tr>
              )}
              {forms.map(f => (
                <tr key={f.id}>
                  <td>{f.name}</td>
                  <td className={styles.slug}>{f.slug}</td>
                  <td>{f.notifyEmail || '—'}</td>
                  <td>{new Date(f.createdAt).toLocaleDateString('tr-TR')}</td>
                  <td className={styles.actions}>
                    <button className={styles.inboxBtn} title="Başvurular" onClick={() => void openSubmissions(f)}><FaInbox /></button>
                    <button className={styles.editBtn} onClick={() => void openEdit(f)}><FaEdit /></button>
                    <button className={styles.deleteBtn} onClick={() => setDeleteId(f.id)}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Form Modal ─────────────────────────────────────────────── */}
      <Modal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title={editingForm ? 'Form Düzenle' : 'Yeni Form'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setFormModal(false)}>İptal</Button>
            <Button variant="primary" isLoading={saving} onClick={() => void save()}>Kaydet</Button>
          </>
        }
      >
        <div className={styles.formGrid}>
          <Input label="Ad *" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
          <Input label="Slug *" value={formData.slug} onChange={e => setFormData(f => ({ ...f, slug: e.target.value }))} />
          <Input label="Gönder butonu metni" value={formData.submitButtonText} onChange={e => setFormData(f => ({ ...f, submitButtonText: e.target.value }))} />
          <Input label="Bildirim e-postası" type="email" value={formData.notifyEmail} onChange={e => setFormData(f => ({ ...f, notifyEmail: e.target.value }))} />
          <div className={styles.fullRow}>
            <label className={styles.textareaLabel}>Başarı mesajı</label>
            <textarea className={styles.textarea} rows={2} value={formData.successMessage} onChange={e => setFormData(f => ({ ...f, successMessage: e.target.value }))} />
          </div>
          <div className={styles.fullRow}>
            <label className={styles.textareaLabel}>Alan tanımları (JSON)</label>
            <textarea className={styles.textarea} rows={8} value={formData.fieldsJson} onChange={e => setFormData(f => ({ ...f, fieldsJson: e.target.value }))} />
          </div>
        </div>
      </Modal>

      {/* ── Delete Modal ───────────────────────────────────────────── */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Formu Sil"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Vazgeç</Button>
            <Button variant="danger" onClick={() => void deleteForm()}>Evet, Sil</Button>
          </>
        }
      >
        <p>Bu formu ve tüm başvurularını silmek istediğinize emin misiniz?</p>
      </Modal>

      {/* ── Submissions Modal ──────────────────────────────────────── */}
      <Modal
        isOpen={submissionsModal}
        onClose={() => setSubmissionsModal(false)}
        title={`${selectedForm?.name ?? ''} — Başvurular (${totalSubmissions})`}
        size="lg"
      >
        {submissionsLoading ? (
          <div className={styles.loading}>Yükleniyor...</div>
        ) : submissions.length === 0 ? (
          <p className={styles.empty}>Henüz başvuru yok.</p>
        ) : (
          <div className={styles.submissionsList}>
            {submissions.map(s => (
              <div key={s.id} className={styles.submission}>
                <div className={styles.submissionMeta}>
                  <span>{new Date(s.createdAt).toLocaleString('tr-TR')}</span>
                  {s.ipAddress && <span className={styles.ip}>{s.ipAddress}</span>}
                </div>
                <pre className={styles.submissionData}>
                  {s.dataJson ? JSON.stringify(JSON.parse(s.dataJson), null, 2) : '—'}
                </pre>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
