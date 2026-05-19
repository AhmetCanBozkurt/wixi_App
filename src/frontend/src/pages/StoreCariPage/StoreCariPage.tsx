import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaAddressBook, FaPlus, FaArrowLeft } from 'react-icons/fa';

import { AdvancedDataTable } from '../../shared/ui/AdvancedDataTable';
import type { ColumnConfig } from '../../shared/ui/AdvancedDataTable/AdvancedDataTable';
import { Input } from '../../shared/ui/Input/Input';
import { Select } from '../../shared/ui/Select/Select';
import { Button } from '../../shared/ui/Button/Button';
import { Switch } from '../../shared/ui/Switch/Switch';
import { Modal } from '../../shared/ui/Modal/Modal';
import { apiClient } from '../../shared/api/axiosConfig';

import s from '../StoreAdminPage/pages/storeAdmin.shared.module.css';
import cs from './StoreCariPage.module.css';

// ─── Data shapes ─────────────────────────────────────────────────────────────

interface ContactDto extends Record<string, unknown> {
  id: string;
  name: string;
  type: number;
  typeLabel: string;
  taxNumber?: string;
  taxOffice?: string;
  email?: string;
  phone?: string;
  city?: string;
  contactPersonName?: string;
  notes?: string;
  balance: number;
  isActive: boolean;
}

interface LedgerEntryDto {
  id: string;
  entryType: number;
  entryTypeLabel: string;
  amount: number;
  description?: string;
  referenceNo?: string;
  movementDate: string;
  balanceAfter: number;
}

interface ContactLedgerResult {
  contact: ContactDto;
  entries: LedgerEntryDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ─── Form shapes ─────────────────────────────────────────────────────────────

interface ContactFormData {
  name: string;
  type: number;
  taxNumber: string;
  taxOffice: string;
  email: string;
  phone: string;
  city: string;
  contactPersonName: string;
  notes: string;
  isActive: boolean;
}

interface LedgerFormData {
  entryType: number;
  amount: string;
  referenceNo: string;
  movementDate: string;
  description: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const EMPTY_CONTACT_FORM: ContactFormData = {
  name: '',
  type: 1,
  taxNumber: '',
  taxOffice: '',
  email: '',
  phone: '',
  city: '',
  contactPersonName: '',
  notes: '',
  isActive: true,
};

const EMPTY_LEDGER_FORM: LedgerFormData = {
  entryType: 1,
  amount: '',
  referenceNo: '',
  movementDate: new Date().toISOString().split('T')[0],
  description: '',
};

const TYPE_OPTIONS = [
  { label: 'Tedarikçi', value: 1 },
  { label: 'Müşteri', value: 2 },
  { label: 'Bayi', value: 3 },
];

const TYPE_FILTER_OPTIONS = [
  { label: 'Tümü', value: '' },
  { label: 'Tedarikçi', value: 1 },
  { label: 'Müşteri', value: 2 },
  { label: 'Bayi', value: 3 },
];

const ENTRY_TYPE_OPTIONS = [
  { label: 'Borç (Alacağımız)', value: 1 },
  { label: 'Alacak (Ödeme)', value: 2 },
];

const LEDGER_PAGE_SIZE = 30;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTRY(amount: number): string {
  return amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
}

function getTypeChipClass(type: number): string {
  if (type === 1) return `${cs.typeChip} ${cs.typeSupplier}`;
  if (type === 2) return `${cs.typeChip} ${cs.typeCustomer}`;
  return `${cs.typeChip} ${cs.typeDealer}`;
}

// ─── Main component ───────────────────────────────────────────────────────────

export const StoreCariPage = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();

  // Sync tenant slug to localStorage (same pattern as other store-admin pages)
  useEffect(() => {
    if (tenantSlug) localStorage.setItem('wixi-active-tenant', tenantSlug);
  }, [tenantSlug]);

  // ── View state ──
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedContact, setSelectedContact] = useState<ContactDto | null>(null);

  // ── Contact list state ──
  const [contacts, setContacts] = useState<ContactDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string | number>('');
  const [activeOnly, setActiveOnly] = useState(false);

  // ── Contact modal state ──
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState<ContactFormData>(EMPTY_CONTACT_FORM);
  const [isSavingContact, setIsSavingContact] = useState(false);

  // ── Ledger state ──
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntryDto[]>([]);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerTotal, setLedgerTotal] = useState(0);
  const [isLedgerLoading, setIsLedgerLoading] = useState(false);

  // ── Ledger modal state ──
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [ledgerForm, setLedgerForm] = useState<LedgerFormData>(EMPTY_LEDGER_FORM);
  const [isSavingLedger, setIsSavingLedger] = useState(false);

  // ─── Data fetching ─────────────────────────────────────────────────────────

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<ContactDto[]>('/store-admin/cari');
      setContacts(res.data ?? []);
    } catch {
      toast.error('Cari hesaplar yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchContacts(); }, [fetchContacts]);

  const fetchLedger = useCallback(async (contactId: string, page: number) => {
    setIsLedgerLoading(true);
    try {
      const res = await apiClient.get<ContactLedgerResult>(
        `/store-admin/cari/${contactId}/ledger`,
        { params: { page, pageSize: LEDGER_PAGE_SIZE } },
      );
      setLedgerEntries(res.data.entries ?? []);
      setLedgerTotal(res.data.totalCount ?? 0);
      // Refresh the contact's balance in the detail view
      setSelectedContact(res.data.contact ?? null);
    } catch {
      toast.error('Hesap hareketleri yüklenemedi.');
    } finally {
      setIsLedgerLoading(false);
    }
  }, []);

  // ─── Filtered contacts for the table ──────────────────────────────────────

  const filteredContacts = useMemo(() => {
    let list = contacts;
    if (typeFilter !== '') {
      list = list.filter((c) => c.type === Number(typeFilter));
    }
    if (activeOnly) {
      list = list.filter((c) => c.isActive);
    }
    return list;
  }, [contacts, typeFilter, activeOnly]);

  // ─── Open detail view ─────────────────────────────────────────────────────

  const openDetail = (contact: ContactDto) => {
    setSelectedContact(contact);
    setLedgerPage(1);
    setView('detail');
    void fetchLedger(contact.id, 1);
  };

  const goBackToList = () => {
    setView('list');
    setSelectedContact(null);
    setLedgerEntries([]);
    setLedgerTotal(0);
  };

  // ─── Contact modal ────────────────────────────────────────────────────────

  const openCreateContact = () => {
    setEditingContactId(null);
    setContactForm(EMPTY_CONTACT_FORM);
    setIsContactModalOpen(true);
  };

  const openEditContact = (contact: ContactDto) => {
    setEditingContactId(contact.id);
    setContactForm({
      name: contact.name,
      type: contact.type,
      taxNumber: contact.taxNumber ?? '',
      taxOffice: (contact.taxOffice as string | undefined) ?? '',
      email: contact.email ?? '',
      phone: contact.phone ?? '',
      city: contact.city ?? '',
      contactPersonName: contact.contactPersonName ?? '',
      notes: (contact.notes as string | undefined) ?? '',
      isActive: contact.isActive,
    });
    setIsContactModalOpen(true);
  };

  const closeContactModal = () => {
    setIsContactModalOpen(false);
    setEditingContactId(null);
    setContactForm(EMPTY_CONTACT_FORM);
  };

  const setContactField = <K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) => {
    setContactForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveContact = async () => {
    if (!contactForm.name.trim()) {
      toast.error('Ad alanı zorunludur.');
      return;
    }
    setIsSavingContact(true);
    try {
      const payload = {
        name: contactForm.name.trim(),
        type: contactForm.type,
        taxNumber: contactForm.taxNumber.trim() || null,
        taxOffice: contactForm.taxOffice.trim() || null,
        email: contactForm.email.trim() || null,
        phone: contactForm.phone.trim() || null,
        city: contactForm.city.trim() || null,
        contactPersonName: contactForm.contactPersonName.trim() || null,
        notes: contactForm.notes.trim() || null,
        isActive: contactForm.isActive,
      };
      if (editingContactId) {
        await apiClient.put(`/store-admin/cari/${editingContactId}`, { id: editingContactId, ...payload });
        toast.success('Cari hesap güncellendi.');
      } else {
        await apiClient.post('/store-admin/cari', payload);
        toast.success('Cari hesap oluşturuldu.');
      }
      closeContactModal();
      void fetchContacts();
    } catch {
      toast.error('Kaydedilirken hata oluştu.');
    } finally {
      setIsSavingContact(false);
    }
  };

  // ─── Ledger entry modal ───────────────────────────────────────────────────

  const openLedgerModal = () => {
    setLedgerForm(EMPTY_LEDGER_FORM);
    setIsLedgerModalOpen(true);
  };

  const closeLedgerModal = () => {
    setIsLedgerModalOpen(false);
    setLedgerForm(EMPTY_LEDGER_FORM);
  };

  const setLedgerField = <K extends keyof LedgerFormData>(key: K, value: LedgerFormData[K]) => {
    setLedgerForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveLedgerEntry = async () => {
    if (!selectedContact) return;
    const parsedAmount = parseFloat(ledgerForm.amount);
    if (!ledgerForm.amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Geçerli bir tutar giriniz.');
      return;
    }
    if (!ledgerForm.movementDate) {
      toast.error('Hareket tarihi zorunludur.');
      return;
    }
    setIsSavingLedger(true);
    try {
      await apiClient.post(`/store-admin/cari/${selectedContact.id}/ledger`, {
        contactId: selectedContact.id,
        entryType: ledgerForm.entryType,
        amount: parsedAmount,
        description: ledgerForm.description.trim() || null,
        referenceNo: ledgerForm.referenceNo.trim() || null,
        movementDate: ledgerForm.movementDate,
      });
      toast.success('Hareket eklendi.');
      closeLedgerModal();
      // Refresh both ledger and contact list (for updated balance)
      void fetchLedger(selectedContact.id, 1);
      setLedgerPage(1);
      void fetchContacts();
    } catch {
      toast.error('Hareket eklenemedi.');
    } finally {
      setIsSavingLedger(false);
    }
  };

  // ─── Ledger pagination ────────────────────────────────────────────────────

  const handleLedgerPrev = () => {
    if (!selectedContact || ledgerPage <= 1) return;
    const newPage = ledgerPage - 1;
    setLedgerPage(newPage);
    void fetchLedger(selectedContact.id, newPage);
  };

  const handleLedgerNext = () => {
    if (!selectedContact) return;
    const totalPages = Math.ceil(ledgerTotal / LEDGER_PAGE_SIZE);
    if (ledgerPage >= totalPages) return;
    const newPage = ledgerPage + 1;
    setLedgerPage(newPage);
    void fetchLedger(selectedContact.id, newPage);
  };

  // ─── Table columns ────────────────────────────────────────────────────────

  const columns: ColumnConfig<ContactDto>[] = useMemo(() => [
    {
      field: 'name',
      title: 'Ad / Tür',
      width: 220,
      template: (row) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{row.name}</div>
          <span className={getTypeChipClass(row.type)} style={{ marginTop: 4, display: 'inline-block' }}>
            {row.typeLabel}
          </span>
        </div>
      ),
    },
    {
      field: 'taxNumber',
      title: 'Vergi No',
      width: 130,
      template: (row) => (
        <span className={s.muted}>{row.taxNumber || '—'}</span>
      ),
    },
    {
      field: 'email',
      title: 'İletişim',
      width: 200,
      template: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {row.email ? (
            <span style={{ fontSize: '0.83rem', color: 'var(--text-main)' }}>{row.email}</span>
          ) : (
            <span className={s.muted}>—</span>
          )}
          {row.phone && (
            <span className={s.muted} style={{ fontSize: '0.8rem' }}>{row.phone}</span>
          )}
        </div>
      ),
    },
    {
      field: 'city',
      title: 'Şehir',
      width: 120,
      template: (row) => <span className={s.muted}>{row.city || '—'}</span>,
    },
    {
      field: 'balance',
      title: 'Bakiye',
      width: 140,
      template: (row) => (
        <span className={row.balance >= 0 ? cs.balancePositive : cs.balanceNegative}>
          {formatTRY(row.balance)}
        </span>
      ),
    },
    {
      field: 'isActive',
      title: 'Durum',
      width: 90,
      template: (row) => (
        <span className={row.isActive ? s.badgeActive : s.badgeInactive}>
          {row.isActive ? 'Aktif' : 'Pasif'}
        </span>
      ),
    },
  ], []);

  // ─── Render ───────────────────────────────────────────────────────────────

  if (view === 'detail' && selectedContact) {
    return (
      <div className={s.page}>
        {/* Back button */}
        <div className={cs.backRow}>
          <Button variant="ghost" leftIcon={<FaArrowLeft />} onClick={goBackToList}>
            Geri
          </Button>
          <div>
            <h2 className={s.pageTitle}>{selectedContact.name}</h2>
            <p className={s.pageSubtitle}>Hesap Detayı &amp; Hareketler</p>
          </div>
        </div>

        {/* Contact info card */}
        <div className={cs.contactCard}>
          <p className={s.sectionTitle}>Cari Bilgileri</p>
          <div className={s.detailGrid} style={{ marginTop: 12 }}>
            <div className={s.detailField}>
              <span className={s.detailLabel}>Ad</span>
              <span className={s.detailValue}>{selectedContact.name}</span>
            </div>
            <div className={s.detailField}>
              <span className={s.detailLabel}>Tür</span>
              <span className={getTypeChipClass(selectedContact.type)} style={{ marginTop: 2, display: 'inline-block' }}>
                {selectedContact.typeLabel}
              </span>
            </div>
            {selectedContact.taxNumber && (
              <div className={s.detailField}>
                <span className={s.detailLabel}>Vergi No</span>
                <span className={s.detailValue}>{selectedContact.taxNumber}</span>
              </div>
            )}
            {selectedContact.taxOffice && (
              <div className={s.detailField}>
                <span className={s.detailLabel}>Vergi Dairesi</span>
                <span className={s.detailValue}>{String(selectedContact.taxOffice)}</span>
              </div>
            )}
            {selectedContact.email && (
              <div className={s.detailField}>
                <span className={s.detailLabel}>E-posta</span>
                <a href={`mailto:${selectedContact.email}`} className={s.detailLink}>{selectedContact.email}</a>
              </div>
            )}
            {selectedContact.phone && (
              <div className={s.detailField}>
                <span className={s.detailLabel}>Telefon</span>
                <span className={s.detailValue}>{selectedContact.phone}</span>
              </div>
            )}
            {selectedContact.city && (
              <div className={s.detailField}>
                <span className={s.detailLabel}>Şehir</span>
                <span className={s.detailValue}>{selectedContact.city}</span>
              </div>
            )}
            {selectedContact.contactPersonName && (
              <div className={s.detailField}>
                <span className={s.detailLabel}>İlgili Kişi</span>
                <span className={s.detailValue}>{selectedContact.contactPersonName}</span>
              </div>
            )}
            <div className={s.detailField}>
              <span className={s.detailLabel}>Güncel Bakiye</span>
              <span
                className={`${cs.bigBalance} ${selectedContact.balance >= 0 ? cs.balancePositive : cs.balanceNegative}`}
              >
                {formatTRY(selectedContact.balance)}
              </span>
            </div>
          </div>
        </div>

        {/* Ledger section */}
        <div>
          <div className={cs.ledgerHeader}>
            <p className={s.sectionTitle} style={{ marginBottom: 0 }}>Hesap Hareketleri</p>
            <Button variant="primary" leftIcon={<FaPlus />} onClick={openLedgerModal}>
              Hareket Ekle
            </Button>
          </div>

          {isLedgerLoading ? (
            <div className={cs.emptyState}>Yükleniyor...</div>
          ) : ledgerEntries.length === 0 ? (
            <div className={cs.emptyState}>Henüz hareket kaydı bulunmuyor.</div>
          ) : (
            <table className={cs.ledgerTable}>
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Tip</th>
                  <th>Tutar</th>
                  <th>Referans</th>
                  <th>Açıklama</th>
                  <th>Sonraki Bakiye</th>
                </tr>
              </thead>
              <tbody>
                {ledgerEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className={entry.entryType === 1 ? cs.debitRow : cs.creditRow}
                  >
                    <td>{new Date(entry.movementDate).toLocaleDateString('tr-TR')}</td>
                    <td>
                      {entry.entryType === 1 ? (
                        <span className={cs.debitAmount}>
                          ↑ Borç
                        </span>
                      ) : (
                        <span className={cs.creditAmount}>
                          ↓ Alacak
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={entry.entryType === 1 ? cs.debitAmount : cs.creditAmount}>
                        {formatTRY(entry.amount)}
                      </span>
                    </td>
                    <td>
                      <span className={s.muted}>{entry.referenceNo || '—'}</span>
                    </td>
                    <td>
                      <span className={s.muted}>{entry.description || '—'}</span>
                    </td>
                    <td>
                      <span className={entry.balanceAfter >= 0 ? cs.balancePositive : cs.balanceNegative}>
                        {formatTRY(entry.balanceAfter)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {ledgerTotal > LEDGER_PAGE_SIZE && (
            <div className={cs.pagination}>
              <Button
                variant="ghost"
                size="sm"
                disabled={ledgerPage <= 1}
                onClick={handleLedgerPrev}
              >
                Önceki
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={ledgerPage >= Math.ceil(ledgerTotal / LEDGER_PAGE_SIZE)}
                onClick={handleLedgerNext}
              >
                Sonraki
              </Button>
              <span className={cs.paginationInfo}>
                Sayfa {ledgerPage} / {Math.ceil(ledgerTotal / LEDGER_PAGE_SIZE)} ({ledgerTotal} hareket)
              </span>
            </div>
          )}
        </div>

        {/* Ledger entry modal */}
        <Modal
          isOpen={isLedgerModalOpen}
          onClose={closeLedgerModal}
          title="Hareket Ekle"
          size="md"
          footer={
            <>
              <Button variant="ghost" onClick={closeLedgerModal}>İptal</Button>
              <Button variant="primary" isLoading={isSavingLedger} onClick={handleSaveLedgerEntry}>
                Kaydet
              </Button>
            </>
          }
        >
          <div className={s.formGrid}>
            <Select
              label="Hareket Tipi"
              options={ENTRY_TYPE_OPTIONS}
              value={ledgerForm.entryType}
              onChange={(v) => setLedgerField('entryType', Number(v))}
              required
            />
            <Input
              label="Tutar *"
              type="number"
              placeholder="0.00"
              value={ledgerForm.amount}
              onChange={(e) => setLedgerField('amount', e.target.value)}
              required
            />
          </div>
          <div className={s.formGrid}>
            <Input
              label="Referans No"
              placeholder="Fatura / irsaliye no"
              value={ledgerForm.referenceNo}
              onChange={(e) => setLedgerField('referenceNo', e.target.value)}
            />
            <Input
              label="Hareket Tarihi"
              type="date"
              value={ledgerForm.movementDate}
              onChange={(e) => setLedgerField('movementDate', e.target.value)}
              required
            />
          </div>
          <div className={s.formRow}>
            <label className={s.label}>Açıklama</label>
            <textarea
              className={s.textarea}
              placeholder="İsteğe bağlı açıklama..."
              value={ledgerForm.description}
              onChange={(e) => setLedgerField('description', e.target.value)}
              rows={3}
            />
          </div>
        </Modal>
      </div>
    );
  }

  // ─── List view ─────────────────────────────────────────────────────────────

  return (
    <div className={s.page}>
      {/* Header */}
      <div className={s.pageHeader}>
        <div className={s.titleRow}>
          <FaAddressBook className={s.titleIcon} />
          <div>
            <h2 className={s.pageTitle}>Cari Hesaplar</h2>
            <p className={s.pageSubtitle}>Tedarikçi, müşteri ve bayi hesaplarını yönetin</p>
          </div>
        </div>
        <Button variant="primary" leftIcon={<FaPlus />} onClick={openCreateContact}>
          Yeni Cari
        </Button>
      </div>

      {/* Filter row */}
      <div className={cs.filterRow}>
        <Select
          options={TYPE_FILTER_OPTIONS}
          value={typeFilter}
          onChange={(v) => setTypeFilter(v)}
          placeholder="Tür Filtrele"
        />
        <Switch
          label="Sadece Aktif"
          checked={activeOnly}
          onChange={(e) => setActiveOnly(e.target.checked)}
        />
      </div>

      {/* Contact list table */}
      <AdvancedDataTable<ContactDto>
        dataSource={isLoading ? [] : filteredContacts}
        columns={columns}
        pageable={{ pageSize: 20 }}
        toolbar={['search', 'excel']}
        filterable
        onEdit={(row) => openEditContact(row)}
        onDetail={(row) => openDetail(row)}
        exportTitle="Cari-Hesaplar"
      />

      {/* Contact create/edit modal */}
      <Modal
        isOpen={isContactModalOpen}
        onClose={closeContactModal}
        title={editingContactId ? 'Cari Düzenle' : 'Yeni Cari Hesap'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={closeContactModal}>İptal</Button>
            <Button variant="primary" isLoading={isSavingContact} onClick={handleSaveContact}>
              Kaydet
            </Button>
          </>
        }
      >
        <div className={s.formGrid}>
          <Input
            label="Ad / Ünvan *"
            placeholder="Firma veya kişi adı"
            value={contactForm.name}
            onChange={(e) => setContactField('name', e.target.value)}
            required
          />
          <Select
            label="Tür *"
            options={TYPE_OPTIONS}
            value={contactForm.type}
            onChange={(v) => setContactField('type', Number(v))}
            required
          />
        </div>
        <div className={s.formGrid}>
          <Input
            label="Vergi No"
            placeholder="1234567890"
            value={contactForm.taxNumber}
            onChange={(e) => setContactField('taxNumber', e.target.value)}
          />
          <Input
            label="Vergi Dairesi"
            placeholder="Ör: Ankara VD"
            value={contactForm.taxOffice}
            onChange={(e) => setContactField('taxOffice', e.target.value)}
          />
        </div>
        <div className={s.formGrid}>
          <Input
            label="E-posta"
            type="email"
            placeholder="ornek@firma.com"
            value={contactForm.email}
            onChange={(e) => setContactField('email', e.target.value)}
          />
          <Input
            label="Telefon"
            placeholder="+90 5XX XXX XX XX"
            value={contactForm.phone}
            onChange={(e) => setContactField('phone', e.target.value)}
          />
        </div>
        <div className={s.formGrid}>
          <Input
            label="Şehir"
            placeholder="İstanbul"
            value={contactForm.city}
            onChange={(e) => setContactField('city', e.target.value)}
          />
          <Input
            label="İlgili Kişi"
            placeholder="Ad Soyad"
            value={contactForm.contactPersonName}
            onChange={(e) => setContactField('contactPersonName', e.target.value)}
          />
        </div>
        <div className={s.formRow}>
          <label className={s.label}>Notlar</label>
          <textarea
            className={s.textarea}
            placeholder="İsteğe bağlı notlar..."
            value={contactForm.notes}
            onChange={(e) => setContactField('notes', e.target.value)}
            rows={3}
          />
        </div>
        {editingContactId && (
          <Switch
            label="Aktif"
            checked={contactForm.isActive}
            onChange={(e) => setContactField('isActive', e.target.checked)}
          />
        )}
      </Modal>
    </div>
  );
};
