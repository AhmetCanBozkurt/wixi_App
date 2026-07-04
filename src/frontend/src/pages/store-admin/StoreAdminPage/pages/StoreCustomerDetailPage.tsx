import { useEffect, useState, useCallback } from 'react';
import { FaArrowLeft, FaUserCircle, FaStickyNote, FaShieldAlt, FaShoppingBag, FaMapMarkerAlt, FaBan } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../../shared/ui/Button/Button';
import { Select } from '../../../../shared/ui/Select/Select';
import { Switch } from '../../../../shared/ui/Switch/Switch';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import { apiClient } from '../../../../shared/api/axiosConfig';
import { SEGMENT_LABELS } from './StoreCustomersPage';
import s from './storeAdmin.shared.module.css';

interface OrderSummaryDto {
  id: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  status: number;
  createdAt: string;
}

interface NoteDto {
  id: string;
  customerId: string;
  noteType: number;
  content: string;
  isPrivate: boolean;
  createdByUser?: string;
  createdAt: string;
}

interface AddressDto {
  id: string;
  addressType: number;
  title: string;
  addressLine: string;
  city: string;
  district: string;
  companyName?: string;
  taxNumber?: string;
  taxOfficeName?: string;
  isDefault: boolean;
}

interface Customer360Dto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  isGuest: boolean;
  birthDate?: string;
  gender: number;
  emailOptIn: boolean;
  smsOptIn: boolean;
  pushOptIn: boolean;
  kvkkConsentDate?: string;
  rfmSegment?: string;
  ltvAmount: number;
  totalOrders: number;
  lastOrderDate?: string;
  isBlacklisted: boolean;
  blacklistReason?: string;
  createdAt: string;
  recentOrders: OrderSummaryDto[];
  notes: NoteDto[];
  addresses: AddressDto[];
}

const NOTE_TYPE_OPTIONS = [
  { label: 'Genel', value: 0 },
  { label: 'Şikayet', value: 1 },
  { label: 'VIP', value: 2 },
  { label: 'Takip', value: 3 },
  { label: 'Kara Liste', value: 4 },
];

const NOTE_TYPE_COLORS: Record<number, string> = {
  0: '#6366f1', 1: '#ef4444', 2: '#f59e0b', 3: '#3b82f6', 4: '#64748b',
};

const ORDER_STATUS_LABELS: Record<number, string> = {
  0: 'Bekliyor', 1: 'Ödendi', 2: 'Hazırlanıyor', 3: 'Kargoda', 4: 'Teslim Edildi', 5: 'İptal', 6: 'İade',
};

const GENDER_LABELS: Record<number, string> = {
  0: 'Belirtilmemiş', 1: 'Erkek', 2: 'Kadın', 3: 'Diğer',
};

const cardStyle: React.CSSProperties = {
  background: 'var(--surface-glass)',
  border: '1px solid var(--border-glass)',
  borderRadius: 'var(--radius-md)',
  padding: '1.25rem',
};

export const StoreCustomerDetailPage = () => {
  const { tenantSlug, customerId } = useParams<{ tenantSlug: string; customerId: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer360Dto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Not modalı
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState(0);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);

  // Kara liste modalı
  const [isBlacklistModalOpen, setIsBlacklistModalOpen] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState('');
  const [isSavingBlacklist, setIsSavingBlacklist] = useState(false);

  // KVKK
  const [isSavingConsent, setIsSavingConsent] = useState(false);

  useEffect(() => {
    if (tenantSlug) localStorage.setItem('wixi-active-tenant', tenantSlug);
  }, [tenantSlug]);

  const fetchCustomer = useCallback(async () => {
    if (!customerId) return;
    setIsLoading(true);
    try {
      const res = await apiClient.get<Customer360Dto>(`/store-admin/customers/${customerId}`);
      setCustomer(res.data);
    } catch {
      toast.error('Müşteri yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useEffect(() => { void fetchCustomer(); }, [fetchCustomer]);

  const handleConsentChange = async (field: 'emailOptIn' | 'smsOptIn' | 'pushOptIn', value: boolean) => {
    if (!customer) return;
    const next = { emailOptIn: customer.emailOptIn, smsOptIn: customer.smsOptIn, pushOptIn: customer.pushOptIn, [field]: value };
    setIsSavingConsent(true);
    try {
      await apiClient.patch(`/store-admin/customers/${customer.id}/consent`, next);
      setCustomer({ ...customer, ...next });
      toast.success('İzinler güncellendi.');
    } catch {
      toast.error('İzinler güncellenemedi.');
    } finally {
      setIsSavingConsent(false);
    }
  };

  const handleSaveNote = async () => {
    if (!customer) return;
    if (!noteContent.trim()) { toast.error('Not içeriği zorunludur.'); return; }
    setIsSavingNote(true);
    try {
      await apiClient.post(`/store-admin/customers/${customer.id}/notes`, {
        noteType, content: noteContent.trim(), isPrivate: true,
      });
      toast.success('Not eklendi.');
      setIsNoteModalOpen(false);
      setNoteContent('');
      setNoteType(0);
      void fetchCustomer();
    } catch {
      toast.error('Not eklenemedi.');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!deleteNoteId) return;
    try {
      await apiClient.delete(`/store-admin/customers/notes/${deleteNoteId}`);
      toast.success('Not silindi.');
      setDeleteNoteId(null);
      void fetchCustomer();
    } catch {
      toast.error('Not silinemedi.');
    }
  };

  const handleToggleBlacklist = async () => {
    if (!customer) return;
    const adding = !customer.isBlacklisted;
    if (adding && !blacklistReason.trim()) { toast.error('Sebep zorunludur.'); return; }
    setIsSavingBlacklist(true);
    try {
      await apiClient.patch(`/store-admin/customers/${customer.id}/blacklist`, {
        isBlacklisted: adding,
        reason: adding ? blacklistReason.trim() : null,
      });
      toast.success(adding ? 'Müşteri kara listeye alındı.' : 'Kara liste kaldırıldı.');
      setIsBlacklistModalOpen(false);
      setBlacklistReason('');
      void fetchCustomer();
    } catch {
      toast.error('İşlem başarısız.');
    } finally {
      setIsSavingBlacklist(false);
    }
  };

  if (isLoading) {
    return <div className={s.page}><p className={s.muted}>Yükleniyor…</p></div>;
  }

  if (!customer) {
    return (
      <div className={s.page}>
        <p className={s.muted}>Müşteri bulunamadı.</p>
        <Button variant="ghost" leftIcon={<FaArrowLeft />} onClick={() => navigate(`/tenant/${tenantSlug}/customers`)}>
          Listeye Dön
        </Button>
      </div>
    );
  }

  const segment = customer.rfmSegment ? SEGMENT_LABELS[customer.rfmSegment] : undefined;

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div className={s.titleRow}>
          <FaUserCircle className={s.titleIcon} />
          <div>
            <h2 className={s.pageTitle}>
              {customer.firstName} {customer.lastName}
              {customer.isBlacklisted && (
                <span style={{ marginLeft: 10, fontSize: '0.72rem', padding: '3px 10px', borderRadius: 20, background: 'rgba(239,68,68,0.12)', color: '#ef4444', fontWeight: 700, verticalAlign: 'middle' }}>
                  Kara Liste
                </span>
              )}
            </h2>
            <p className={s.pageSubtitle}>{customer.email}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="ghost" leftIcon={<FaArrowLeft />} onClick={() => navigate(`/tenant/${tenantSlug}/customers`)}>
            Listeye Dön
          </Button>
          <Button
            variant={customer.isBlacklisted ? 'secondary' : 'danger'}
            leftIcon={<FaBan />}
            onClick={() => customer.isBlacklisted ? void handleToggleBlacklist() : setIsBlacklistModalOpen(true)}
            isLoading={isSavingBlacklist}
          >
            {customer.isBlacklisted ? 'Kara Listeden Çıkar' : 'Kara Listeye Al'}
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem' }}>
        {/* Profil */}
        <div style={cardStyle}>
          <h3 className={s.sectionTitle}><FaUserCircle style={{ marginRight: 6 }} />Profil</h3>
          <div className={s.detailGrid}>
            <div className={s.detailField}>
              <span className={s.detailLabel}>E-posta</span>
              <span className={s.detailValue}>
                {customer.email}{' '}
                <span className={customer.isEmailVerified ? s.badgeActive : s.badgeInactive}>
                  {customer.isEmailVerified ? 'Doğrulanmış' : 'Doğrulanmamış'}
                </span>
              </span>
            </div>
            <div className={s.detailField}>
              <span className={s.detailLabel}>Telefon</span>
              <span className={s.detailValue}>{customer.phoneNumber ?? '—'}</span>
            </div>
            <div className={s.detailField}>
              <span className={s.detailLabel}>Cinsiyet</span>
              <span className={s.detailValue}>{GENDER_LABELS[customer.gender] ?? '—'}</span>
            </div>
            <div className={s.detailField}>
              <span className={s.detailLabel}>Doğum Tarihi</span>
              <span className={s.detailValue}>
                {customer.birthDate ? new Date(customer.birthDate).toLocaleDateString('tr-TR') : '—'}
              </span>
            </div>
            <div className={s.detailField}>
              <span className={s.detailLabel}>Kayıt Tarihi</span>
              <span className={s.detailValue}>{new Date(customer.createdAt).toLocaleDateString('tr-TR')}</span>
            </div>
            <div className={s.detailField}>
              <span className={s.detailLabel}>Hesap</span>
              <span className={s.detailValue}>{customer.isGuest ? 'Misafir' : 'Kayıtlı'}</span>
            </div>
          </div>
          {customer.isBlacklisted && customer.blacklistReason && (
            <p style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: '#ef4444' }}>
              Kara liste sebebi: {customer.blacklistReason}
            </p>
          )}
        </div>

        {/* Segment / RFM */}
        <div style={cardStyle}>
          <h3 className={s.sectionTitle}><FaShoppingBag style={{ marginRight: 6 }} />Satış Özeti</h3>
          <div className={s.detailGrid}>
            <div className={s.detailField}>
              <span className={s.detailLabel}>Segment</span>
              <span className={s.detailValue}>
                {segment ? (
                  <span style={{ fontSize: '0.8rem', padding: '3px 12px', borderRadius: 20, background: `${segment.color}1a`, color: segment.color, border: `1px solid ${segment.color}33`, fontWeight: 600 }}>
                    {segment.label}
                  </span>
                ) : <span className={s.muted}>Henüz hesaplanmadı</span>}
              </span>
            </div>
            <div className={s.detailField}>
              <span className={s.detailLabel}>Yaşam Boyu Değer (LTV)</span>
              <span className={s.detailValue} style={{ fontWeight: 700 }}>
                {customer.ltvAmount > 0 ? `${customer.ltvAmount.toLocaleString('tr-TR')} ₺` : '—'}
              </span>
            </div>
            <div className={s.detailField}>
              <span className={s.detailLabel}>Toplam Sipariş</span>
              <span className={s.detailValue}>{customer.totalOrders}</span>
            </div>
            <div className={s.detailField}>
              <span className={s.detailLabel}>Son Sipariş</span>
              <span className={s.detailValue}>
                {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString('tr-TR') : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* KVKK */}
        <div style={cardStyle}>
          <h3 className={s.sectionTitle}><FaShieldAlt style={{ marginRight: 6 }} />KVKK / İletişim İzinleri</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Switch
              label="E-posta izni"
              checked={customer.emailOptIn}
              disabled={isSavingConsent}
              onChange={(e) => void handleConsentChange('emailOptIn', e.target.checked)}
            />
            <Switch
              label="SMS izni"
              checked={customer.smsOptIn}
              disabled={isSavingConsent}
              onChange={(e) => void handleConsentChange('smsOptIn', e.target.checked)}
            />
            <Switch
              label="Push bildirim izni"
              checked={customer.pushOptIn}
              disabled={isSavingConsent}
              onChange={(e) => void handleConsentChange('pushOptIn', e.target.checked)}
            />
            {customer.kvkkConsentDate && (
              <p className={s.muted} style={{ fontSize: '0.78rem' }}>
                KVKK onay tarihi: {new Date(customer.kvkkConsentDate).toLocaleDateString('tr-TR')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Siparişler */}
      <div style={{ ...cardStyle, marginTop: '1rem' }}>
        <h3 className={s.sectionTitle}><FaShoppingBag style={{ marginRight: 6 }} />Son Siparişler</h3>
        {customer.recentOrders.length === 0 ? (
          <p className={s.muted}>Henüz sipariş yok.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {customer.recentOrders.map((o) => (
              <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{o.orderNumber}</span>
                <span className={s.muted} style={{ fontSize: '0.8rem' }}>{new Date(o.createdAt).toLocaleDateString('tr-TR')}</span>
                <span style={{ fontSize: '0.8rem' }}>{ORDER_STATUS_LABELS[o.status] ?? o.status}</span>
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{o.totalAmount.toLocaleString('tr-TR')} {o.currency}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notlar */}
      <div style={{ ...cardStyle, marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 className={s.sectionTitle} style={{ margin: 0 }}><FaStickyNote style={{ marginRight: 6 }} />CRM Notları</h3>
          <Button variant="primary" size="sm" onClick={() => setIsNoteModalOpen(true)}>Not Ekle</Button>
        </div>
        {customer.notes.length === 0 ? (
          <p className={s.muted}>Henüz not yok.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {customer.notes.map((n) => {
              const typeOpt = NOTE_TYPE_OPTIONS.find((o) => o.value === n.noteType);
              const color = NOTE_TYPE_COLORS[n.noteType] ?? '#6366f1';
              return (
                <div key={n.id} style={{ padding: '0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.72rem', padding: '2px 10px', borderRadius: 20, background: `${color}1a`, color, fontWeight: 700 }}>
                      {typeOpt?.label ?? 'Genel'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={s.muted} style={{ fontSize: '0.75rem' }}>
                        {n.createdByUser ?? '—'} · {new Date(n.createdAt).toLocaleString('tr-TR')}
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteNoteId(n.id)}>Sil</Button>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>{n.content}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Adresler */}
      <div style={{ ...cardStyle, marginTop: '1rem' }}>
        <h3 className={s.sectionTitle}><FaMapMarkerAlt style={{ marginRight: 6 }} />Adresler</h3>
        {customer.addresses.length === 0 ? (
          <p className={s.muted}>Kayıtlı adres yok.</p>
        ) : (
          <div className={s.detailGrid}>
            {customer.addresses.map((a) => (
              <div key={a.id} className={s.detailField}>
                <span className={s.detailLabel}>
                  {a.title} {a.addressType === 2 ? '(Fatura)' : '(Teslimat)'} {a.isDefault && '· Varsayılan'}
                </span>
                <span className={s.detailValue}>
                  {a.addressLine}, {a.district} / {a.city}
                  {a.companyName && <><br />{a.companyName} — VN: {a.taxNumber ?? '—'} ({a.taxOfficeName ?? '—'})</>}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Not ekleme modalı */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title="CRM Notu Ekle"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsNoteModalOpen(false)}>İptal</Button>
            <Button variant="primary" isLoading={isSavingNote} onClick={() => void handleSaveNote()}>Kaydet</Button>
          </>
        }
      >
        <Select
          label="Not Türü"
          options={NOTE_TYPE_OPTIONS}
          value={noteType}
          onChange={(v) => setNoteType(Number(v))}
        />
        <div className={s.formRow} style={{ marginTop: '0.75rem' }}>
          <label className={s.label}>İçerik *</label>
          <textarea
            className={s.textarea}
            rows={4}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Müşteri hakkında not…"
          />
        </div>
      </Modal>

      {/* Not silme onayı */}
      <Modal
        isOpen={!!deleteNoteId}
        onClose={() => setDeleteNoteId(null)}
        title="Notu Sil"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteNoteId(null)}>Vazgeç</Button>
            <Button variant="danger" onClick={() => void handleDeleteNote()}>Evet, Sil</Button>
          </>
        }
      >
        <p>Bu notu silmek istediğinizden emin misiniz?</p>
      </Modal>

      {/* Kara liste modalı */}
      <Modal
        isOpen={isBlacklistModalOpen}
        onClose={() => setIsBlacklistModalOpen(false)}
        title="Kara Listeye Al"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsBlacklistModalOpen(false)}>Vazgeç</Button>
            <Button variant="danger" isLoading={isSavingBlacklist} onClick={() => void handleToggleBlacklist()}>Kara Listeye Al</Button>
          </>
        }
      >
        <div className={s.formRow}>
          <label className={s.label}>Sebep *</label>
          <textarea
            className={s.textarea}
            rows={3}
            value={blacklistReason}
            onChange={(e) => setBlacklistReason(e.target.value)}
            placeholder="Kara listeye alma sebebi…"
          />
        </div>
      </Modal>
    </div>
  );
};
