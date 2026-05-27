import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../../../shared/api/axiosConfig';
import { Button } from '../../../../shared/ui/Button/Button';
import { Input } from '../../../../shared/ui/Input/Input';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import { Switch } from '../../../../shared/ui/Switch/Switch';
import s from './TeamManagementPage.module.css';

interface TeamMemberTranslation {
  languageId: string;
  langCode: string;
  role: string;
  department: string;
}

interface TeamMemberAdmin {
  id: string;
  fullName: string;
  initials: string;
  avatarUrl?: string;
  avatarColor: string;
  sortOrder: number;
  isActive: boolean;
  translations: TeamMemberTranslation[];
}

type LangTab = 'tr' | 'en';

const EMPTY_MEMBER: Omit<TeamMemberAdmin, 'id'> = {
  fullName: '',
  initials: '',
  avatarUrl: '',
  avatarColor: '#6366f1',
  sortOrder: 0,
  isActive: true,
  translations: [
    { languageId: '', langCode: 'tr', role: '', department: '' },
    { languageId: '', langCode: 'en', role: '', department: '' },
  ],
};

function getTrTranslation(member: TeamMemberAdmin): TeamMemberTranslation | undefined {
  return member.translations.find((t) => t.langCode === 'tr');
}

export default function TeamManagementPage() {
  const [members, setMembers] = useState<TeamMemberAdmin[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberAdmin | null>(null);
  const [draft, setDraft] = useState<Omit<TeamMemberAdmin, 'id'>>(EMPTY_MEMBER);
  const [langTab, setLangTab] = useState<LangTab>('tr');
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    try {
      const { data } = await apiClient.get<TeamMemberAdmin[]>('/admin/landing/team');
      setMembers(data);
    } catch {
      setMembers([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openModal = (member?: TeamMemberAdmin) => {
    if (member) {
      setEditingMember(member);
      setDraft({
        fullName: member.fullName,
        initials: member.initials,
        avatarUrl: member.avatarUrl ?? '',
        avatarColor: member.avatarColor,
        sortOrder: member.sortOrder,
        isActive: member.isActive,
        translations: member.translations.length > 0
          ? member.translations
          : EMPTY_MEMBER.translations.map((t) => ({ ...t })),
      });
    } else {
      setEditingMember(null);
      setDraft({
        ...EMPTY_MEMBER,
        translations: EMPTY_MEMBER.translations.map((t) => ({ ...t })),
      });
    }
    setLangTab('tr');
    setModalOpen(true);
  };

  const setTranslation = (lang: string, field: 'role' | 'department', value: string) => {
    setDraft((prev) => ({
      ...prev,
      translations: prev.translations.map((t) =>
        t.langCode === lang ? { ...t, [field]: value } : t,
      ),
    }));
  };

  const save = async () => {
    setIsSaving(true);
    try {
      if (editingMember) {
        await apiClient.put(`/admin/landing/team/${editingMember.id}`, draft);
        toast.success('Üye güncellendi');
      } else {
        await apiClient.post('/admin/landing/team', draft);
        toast.success('Üye eklendi');
      }
      setModalOpen(false);
      await load();
    } catch {
      toast.error('Kayıt başarısız');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await apiClient.delete(`/admin/landing/team/${deleteId}`);
      toast.success('Üye silindi');
      setDeleteId(null);
      await load();
    } catch {
      toast.error('Silme başarısız');
    }
  };

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Takım Yönetimi</h1>
          <p className={s.pageSubtitle}>Platform ekip üyelerini yönetin</p>
        </div>
        <Button variant="primary" onClick={() => openModal()}>
          + Üye Ekle
        </Button>
      </div>

      {members.length === 0 && (
        <div className={s.empty}>Henüz takım üyesi yok</div>
      )}

      <div className={s.grid}>
        {members.map((member) => {
          const trTr = getTrTranslation(member);
          return (
            <div key={member.id} className={s.card}>
              <div className={s.cardTop}>
                <div
                  className={s.avatar}
                  style={{ backgroundColor: member.avatarColor }}
                >
                  {member.avatarUrl ? (
                    <img src={member.avatarUrl} alt={member.fullName} className={s.avatarImg} />
                  ) : (
                    <span className={s.avatarInitials}>{member.initials}</span>
                  )}
                </div>
                <span className={member.isActive ? s.badgeActive : s.badgeInactive}>
                  {member.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>
              <div className={s.cardBody}>
                <div className={s.memberName}>{member.fullName}</div>
                {trTr && (
                  <>
                    <div className={s.memberRole}>{trTr.role}</div>
                    <span className={s.deptBadge}>{trTr.department}</span>
                  </>
                )}
              </div>
              <div className={s.cardActions}>
                <Button variant="ghost" onClick={() => openModal(member)}>
                  Düzenle
                </Button>
                <Button variant="danger" onClick={() => setDeleteId(member.id)}>
                  Sil
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Create / Edit Modal ── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMember ? 'Üye Düzenle' : 'Yeni Üye'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>İptal</Button>
            <Button variant="primary" isLoading={isSaving} onClick={save}>Kaydet</Button>
          </>
        }
      >
        <div className={s.formGrid}>
          <Input
            label="Ad Soyad"
            value={draft.fullName}
            onChange={(e) => setDraft((p) => ({ ...p, fullName: e.target.value }))}
            placeholder="Ahmet Yılmaz"
          />
          <Input
            label="İnisiyaller (max 3)"
            value={draft.initials}
            onChange={(e) =>
              setDraft((p) => ({ ...p, initials: e.target.value.slice(0, 3).toUpperCase() }))
            }
            placeholder="AY"
          />
          <Input
            label="Avatar Rengi (hex)"
            value={draft.avatarColor}
            onChange={(e) => setDraft((p) => ({ ...p, avatarColor: e.target.value }))}
            placeholder="#6366f1"
          />
          <Input
            label="Avatar URL (opsiyonel)"
            value={draft.avatarUrl ?? ''}
            onChange={(e) => setDraft((p) => ({ ...p, avatarUrl: e.target.value }))}
            placeholder="https://..."
          />
          <Input
            label="Sıralama"
            type="number"
            value={draft.sortOrder}
            onChange={(e) => setDraft((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
          />

          <div className={s.langTabs}>
            <button
              className={`${s.langTab} ${langTab === 'tr' ? s.langTabActive : ''}`}
              onClick={() => setLangTab('tr')}
            >
              TR
            </button>
            <button
              className={`${s.langTab} ${langTab === 'en' ? s.langTabActive : ''}`}
              onClick={() => setLangTab('en')}
            >
              EN
            </button>
          </div>

          <Input
            label={`Unvan (${langTab.toUpperCase()})`}
            value={draft.translations.find((t) => t.langCode === langTab)?.role ?? ''}
            onChange={(e) => setTranslation(langTab, 'role', e.target.value)}
            placeholder="Yazılım Geliştirici"
          />
          <Input
            label={`Departman (${langTab.toUpperCase()})`}
            value={draft.translations.find((t) => t.langCode === langTab)?.department ?? ''}
            onChange={(e) => setTranslation(langTab, 'department', e.target.value)}
            placeholder="Mühendislik"
          />

          <Switch
            label="Aktif"
            checked={draft.isActive}
            onChange={(e) => setDraft((p) => ({ ...p, isActive: e.target.checked }))}
          />
        </div>
      </Modal>

      {/* ── Delete Confirm ── */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Üyeyi Sil"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Vazgeç</Button>
            <Button variant="danger" onClick={confirmDelete}>Evet, Sil</Button>
          </>
        }
      >
        <p>Bu takım üyesini silmek istediğinize emin misiniz?</p>
      </Modal>
    </div>
  );
}
