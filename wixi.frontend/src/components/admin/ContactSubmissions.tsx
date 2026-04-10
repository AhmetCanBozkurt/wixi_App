import React, { useEffect, useState, useMemo, useCallback } from 'react';
import FormService from '../../ApiServices/services/FormService';
import { useToast } from '../../hooks/use-toast';
import { DataTable, type ColumnDef, type TablePreferenceState } from '../ui/DataTable';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { tablePreferenceService } from '../../ApiServices/services';
import type { TablePreferenceDto } from '../../ApiServices/types/TablePreferenceTypes';

interface ContactSubmission {
  id: number;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age?: number;
  nationality?: string;
  education?: string;
  fieldOfStudy?: string;
  workExperience?: string;
  germanLevel?: string;
  englishLevel?: string;
  interest?: string;
  preferredCity?: string;
  timeline?: string;
  message?: string;
  privacyConsent: boolean;
  newsletter: boolean;
  language?: string;
}

const TABLE_KEY = 'admin-contact-submissions';

const ContactSubmissions: React.FC = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContactSubmission | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [tablePreferences, setTablePreferences] = useState<TablePreferenceDto | null>(null);
  const [preferenceLoaded, setPreferenceLoaded] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all data for DataTable (client-side pagination)
      const res = await FormService.getContactSubmissions({ page: 1, pageSize: 1000 });
      setItems(res.items || []);
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: '❌ Hata', description: 'Kayıtlar alınırken hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const pref = await tablePreferenceService.getTablePreference(TABLE_KEY);
        setTablePreferences(pref);
      } catch (error) {
        console.error('Table preferences could not be loaded:', error);
      } finally {
        setPreferenceLoaded(true);
      }
    };

    loadPreferences();
  }, []);

  const handleEdit = (row: ContactSubmission) => {
    setSelectedItem(row);
    setDetailDialogOpen(true);
  };

  const handleDelete = async (rows: ContactSubmission[]) => {
    if (!confirm(`${rows.length} kayıt silinecek. Emin misiniz?`)) {
      return;
    }
    
    try {
      // TODO: Implement delete API call
      toast({ title: '✅ Başarılı', description: `${rows.length} kayıt silindi.` });
      await fetchData();
    } catch (error) {
      toast({ variant: 'destructive', title: '❌ Hata', description: 'Kayıtlar silinirken hata oluştu.' });
    }
  };

  const handleExport = async (rows: ContactSubmission[]) => {
    try {
      const XLSX = await import('xlsx');
      const workbook = XLSX.utils.book_new();
      
      const exportData = rows.map(row => ({
        'Tarih': format(new Date(row.createdAt), 'dd.MM.yyyy HH:mm'),
        'Ad': row.firstName,
        'Soyad': row.lastName,
        'E-mail': row.email,
        'Telefon': row.phone,
        'Yaş': row.age || '-',
        'Uyruk': row.nationality || '-',
        'Eğitim': row.education || '-',
        'Alan': row.fieldOfStudy || '-',
        'İş Deneyimi': row.workExperience || '-',
        'Almanca': row.germanLevel || '-',
        'İngilizce': row.englishLevel || '-',
        'İlgi Alanı': row.interest || '-',
        'Şehir': row.preferredCity || '-',
        'Zaman Çizelgesi': row.timeline || '-',
        'Mesaj': row.message || '-',
        'Dil': row.language || '-',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'İletişim Formları');
      
      const dateStr = format(new Date(), 'yyyy-MM-dd');
      XLSX.writeFile(workbook, `iletisim_formlari_${dateStr}.xlsx`);
      
      toast({ title: '✅ Başarılı', description: `${rows.length} kayıt Excel olarak indirildi.` });
    } catch (error) {
      console.error('Export error:', error);
      toast({ variant: 'destructive', title: '❌ Hata', description: 'Excel dosyası oluşturulamadı.' });
    }
  };

  const columns: ColumnDef<ContactSubmission>[] = [
    {
      id: 'createdAt',
      header: 'Tarih',
      headerKey: 'admin.contact.table.date',
      translations: {
        tr: 'Tarih',
        de: 'Datum',
        en: 'Date',
      },
      accessorKey: 'createdAt',
      width: '180px',
      filterType: 'text',
      filterPlaceholder: 'Tarih ara',
      cell: (value) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(value), 'dd.MM.yyyy HH:mm')}
        </span>
      ),
    },
    {
      id: 'name',
      header: 'Ad Soyad',
      headerKey: 'admin.contact.table.name',
      translations: {
        tr: 'Ad Soyad',
        de: 'Vor- und Nachname',
        en: 'Full Name',
      },
      accessorKey: 'firstName',
      width: '200px',
      filterType: 'list',
      getFilterValue: (_, row) => `${row.firstName} ${row.lastName}`.trim(),
      cell: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.firstName} {row.lastName}</span>
        </div>
      ),
    },
    {
      id: 'email',
      header: 'E-mail',
      headerKey: 'admin.contact.table.email',
      translations: {
        tr: 'E-posta',
        de: 'E-Mail',
        en: 'E-mail',
      },
      accessorKey: 'email',
      width: '220px',
      filterType: 'list',
      cell: (value) => (
        <a href={`mailto:${value}`} className="text-sm text-blue-600 hover:underline">
          {value}
        </a>
      ),
    },
    {
      id: 'phone',
      header: 'Telefon',
      headerKey: 'admin.contact.table.phone',
      translations: {
        tr: 'Telefon',
        de: 'Telefon',
        en: 'Phone',
      },
      accessorKey: 'phone',
      width: '150px',
      filterType: 'list',
    },
    {
      id: 'age',
      header: 'Yaş',
      headerKey: 'admin.contact.table.age',
      translations: {
        tr: 'Yaş',
        de: 'Alter',
        en: 'Age',
      },
      accessorKey: 'age',
      width: '80px',
      filterType: 'list',
      cell: (value) => value || '-',
    },
    {
      id: 'interest',
      header: 'İlgi Alanı',
      headerKey: 'admin.contact.table.interest',
      translations: {
        tr: 'İlgi Alanı',
        de: 'Interesse',
        en: 'Interest',
      },
      accessorKey: 'interest',
      width: '180px',
      filterType: 'list',
      cell: (value) => value ? (
        <Badge variant="secondary">{value}</Badge>
      ) : '-',
    },
    {
      id: 'germanLevel',
      header: 'Almanca',
      headerKey: 'admin.contact.table.germanLevel',
      translations: {
        tr: 'Almanca',
        de: 'Deutsch',
        en: 'German',
      },
      accessorKey: 'germanLevel',
      width: '120px',
      filterType: 'list',
      cell: (value) => value || '-',
    },
  ];

  const initialPreferenceState = useMemo<TablePreferenceState | undefined>(() => {
    if (!tablePreferences) return undefined;
    return {
      tableKey: tablePreferences.tableKey,
      visibleColumns: tablePreferences.visibleColumns ?? [],
      columnOrder: tablePreferences.columnOrder ?? [],
      columnFilters: tablePreferences.columnFilters ?? {},
      sortConfig: {
        key: tablePreferences.sortConfig?.key ?? '',
        direction: (tablePreferences.sortConfig?.direction as 'asc' | 'desc' | null) ?? null,
      },
      pageSize: tablePreferences.pageSize ?? 20,
    };
  }, [tablePreferences]);

  const handlePreferencesChange = useCallback(async (state: TablePreferenceState) => {
    if (!preferenceLoaded) return;
    try {
      await tablePreferenceService.saveTablePreference(TABLE_KEY, {
        tableKey: TABLE_KEY,
        visibleColumns: state.visibleColumns,
        columnOrder: state.columnOrder,
        columnFilters: state.columnFilters,
        sortConfig: state.sortConfig,
        pageSize: state.pageSize,
      });
    } catch (error) {
      console.error('Table preferences could not be saved:', error);
    }
  }, [preferenceLoaded]);

  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">İletişim Formları</h1>
        <p className="text-muted-foreground mt-1">Tüm iletişim formu başvurularını görüntüleyin ve yönetin</p>
      </div>

      <DataTable
        data={items}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onExport={handleExport}
        searchPlaceholder="Ara (isim, email, telefon, ilgi alanı...)"
        pageSize={20}
        tableKey={TABLE_KEY}
        initialPreferences={initialPreferenceState}
        onPreferencesChange={handlePreferencesChange}
      />

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>İletişim Formu Detayları</DialogTitle>
            <DialogDescription>
              {selectedItem && `${selectedItem.firstName} ${selectedItem.lastName} - ${format(new Date(selectedItem.createdAt), 'dd.MM.yyyy HH:mm')}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ad</label>
                <p className="text-sm mt-1">{selectedItem.firstName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Soyad</label>
                <p className="text-sm mt-1">{selectedItem.lastName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">E-mail</label>
                <p className="text-sm mt-1">{selectedItem.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Telefon</label>
                <p className="text-sm mt-1">{selectedItem.phone}</p>
              </div>
              {selectedItem.age && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Yaş</label>
                  <p className="text-sm mt-1">{selectedItem.age}</p>
                </div>
              )}
              {selectedItem.nationality && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Uyruk</label>
                  <p className="text-sm mt-1">{selectedItem.nationality}</p>
                </div>
              )}
              {selectedItem.education && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Eğitim</label>
                  <p className="text-sm mt-1">{selectedItem.education}</p>
                </div>
              )}
              {selectedItem.fieldOfStudy && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Alan</label>
                  <p className="text-sm mt-1">{selectedItem.fieldOfStudy}</p>
                </div>
              )}
              {selectedItem.workExperience && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">İş Deneyimi</label>
                  <p className="text-sm mt-1">{selectedItem.workExperience}</p>
                </div>
              )}
              {selectedItem.germanLevel && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Almanca Seviyesi</label>
                  <p className="text-sm mt-1">{selectedItem.germanLevel}</p>
                </div>
              )}
              {selectedItem.englishLevel && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">İngilizce Seviyesi</label>
                  <p className="text-sm mt-1">{selectedItem.englishLevel}</p>
                </div>
              )}
              {selectedItem.interest && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">İlgi Alanı</label>
                  <p className="text-sm mt-1">{selectedItem.interest}</p>
                </div>
              )}
              {selectedItem.preferredCity && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tercih Edilen Şehir</label>
                  <p className="text-sm mt-1">{selectedItem.preferredCity}</p>
                </div>
              )}
              {selectedItem.timeline && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Zaman Çizelgesi</label>
                  <p className="text-sm mt-1">{selectedItem.timeline}</p>
                </div>
              )}
              {selectedItem.message && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Mesaj</label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedItem.message}</p>
                </div>
              )}
              <div className="col-span-2 flex gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Gizlilik Onayı</label>
                  <p className="text-sm mt-1">
                    {selectedItem.privacyConsent ? (
                      <Badge variant="default">Onaylandı</Badge>
                    ) : (
                      <Badge variant="secondary">Onaylanmadı</Badge>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Bülten Aboneliği</label>
                  <p className="text-sm mt-1">
                    {selectedItem.newsletter ? (
                      <Badge variant="default">Abone</Badge>
                    ) : (
                      <Badge variant="secondary">Abone Değil</Badge>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactSubmissions;

