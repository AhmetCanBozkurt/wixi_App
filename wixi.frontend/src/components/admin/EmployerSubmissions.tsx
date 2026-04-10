import React, { useEffect, useState, useCallback, useMemo } from 'react';
import FormService from '../../ApiServices/services/FormService';
import { tablePreferenceService } from '../../ApiServices/services';
import { useToast } from '../../hooks/use-toast';
import { DataTable, type ColumnDef, type TablePreferenceState } from '../ui/DataTable';
import type { TablePreferenceDto } from '../../ApiServices/types/TablePreferenceTypes';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Loader2 } from 'lucide-react';

interface EmployerSubmission {
  id: number;
  createdAt: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  industry: string;
  companySize?: string;
  positions: string;
  requirements: string;
  message?: string;
  specialRequests?: string;
  language?: string;
}

const EMPLOYER_TABLE_KEY = 'admin-employer-submissions';

const EmployerSubmissions: React.FC = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<EmployerSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<EmployerSubmission | null>(null);
  const [detailData, setDetailData] = useState<EmployerSubmission | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [tablePreferences, setTablePreferences] = useState<TablePreferenceDto | null>(null);
  const [preferenceLoaded, setPreferenceLoaded] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await FormService.getEmployerSubmissions({ page: 1, pageSize: 1000 });
      setItems(res.items || []);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: '❌ Hata', description: 'Kayıtlar alınırken hata oluştu.' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const pref = await tablePreferenceService.getTablePreference(EMPLOYER_TABLE_KEY);
        setTablePreferences(pref);
      } catch (error) {
        console.error('Employer table preferences could not be loaded:', error);
      } finally {
        setPreferenceLoaded(true);
      }
    };

    loadPreferences();
  }, []);

  const columns: ColumnDef<EmployerSubmission>[] = useMemo(
    () => [
      {
        id: 'createdAt',
        header: 'Tarih',
        headerKey: 'admin.employer.table.date',
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
            {format(new Date(value as string), 'dd.MM.yyyy HH:mm')}
          </span>
        ),
      },
      {
        id: 'companyName',
        header: 'Şirket Adı',
        headerKey: 'admin.employer.table.company',
        translations: {
          tr: 'Şirket Adı',
          de: 'Firmenname',
          en: 'Company Name',
        },
        accessorKey: 'companyName',
        width: '220px',
        filterType: 'list',
        filterPlaceholder: 'Şirket ara',
        cell: (value) => (
          <div className="flex flex-col">
            <span className="font-medium">{value}</span>
          </div>
        ),
      },
      {
        id: 'contactPerson',
        header: 'İletişim Kişisi',
        headerKey: 'admin.employer.table.contact',
        translations: {
          tr: 'İletişim Kişisi',
          de: 'Ansprechpartner',
          en: 'Contact Person',
        },
        accessorKey: 'contactPerson',
        width: '200px',
        filterType: 'list',
        filterPlaceholder: 'Kişi ara',
      },
      {
        id: 'email',
        header: 'E-mail',
        headerKey: 'admin.employer.table.email',
        translations: {
          tr: 'E-posta',
          de: 'E-Mail',
          en: 'E-mail',
        },
        accessorKey: 'email',
        width: '220px',
        filterType: 'list',
        filterPlaceholder: 'E-posta ara',
        cell: (value) => (
          <a href={`mailto:${value}`} className="text-sm text-blue-600 hover:underline">
            {value}
          </a>
        ),
      },
      {
        id: 'phone',
        header: 'Telefon',
        headerKey: 'admin.employer.table.phone',
        translations: {
          tr: 'Telefon',
          de: 'Telefon',
          en: 'Phone',
        },
        accessorKey: 'phone',
        width: '160px',
        filterType: 'list',
        filterPlaceholder: 'Telefon ara',
        cell: (value) => (
          <a href={`tel:${value}`} className="text-sm text-blue-600 hover:underline">
            {value}
          </a>
        ),
      },
      {
        id: 'industry',
        header: 'Branş',
        headerKey: 'admin.employer.table.industry',
        translations: {
          tr: 'Branş',
          de: 'Branche',
          en: 'Industry',
        },
        accessorKey: 'industry',
        width: '180px',
        filterType: 'list',
        filterPlaceholder: 'Branş ara',
        cell: (value) => (
          <Badge variant="secondary" className="font-normal">
            {value}
          </Badge>
        ),
      },
      {
        id: 'positions',
        header: 'Pozisyonlar',
        headerKey: 'admin.employer.table.positions',
        translations: {
          tr: 'Pozisyonlar',
          de: 'Positionen',
          en: 'Positions',
        },
        accessorKey: 'positions',
        width: '260px',
        filterType: 'text',
        filterPlaceholder: 'Pozisyon ara',
        cell: (value) => (
          <span className="text-sm text-muted-foreground line-clamp-2" title={value as string}>
            {value}
          </span>
        ),
      },
      {
        id: 'companySize',
        header: 'Şirket Büyüklüğü',
        headerKey: 'admin.employer.table.size',
        translations: {
          tr: 'Şirket Büyüklüğü',
          de: 'Firmengröße',
          en: 'Company Size',
        },
        accessorKey: 'companySize',
        width: '160px',
        filterType: 'list',
        filterPlaceholder: 'Büyüklük ara',
        cell: (value) => value || '-',
      },
      {
        id: 'language',
        header: 'Dil',
        headerKey: 'admin.employer.table.language',
        translations: {
          tr: 'Dil',
          de: 'Sprache',
          en: 'Language',
        },
        accessorKey: 'language',
        width: '120px',
        filterType: 'list',
        filterPlaceholder: 'Dil ara',
        cell: (value) => value || '-',
      },
    ],
    []
  );

  const initialPreferences = useMemo<TablePreferenceState | undefined>(() => {
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

  const handlePreferencesChange = useCallback(
    async (state: TablePreferenceState) => {
      if (!preferenceLoaded) return;
      try {
        await tablePreferenceService.saveTablePreference(EMPLOYER_TABLE_KEY, {
          tableKey: EMPLOYER_TABLE_KEY,
          visibleColumns: state.visibleColumns,
          columnOrder: state.columnOrder,
          columnFilters: state.columnFilters,
          sortConfig: state.sortConfig,
          pageSize: state.pageSize,
        });
      } catch (error) {
        console.error('Employer table preferences could not be saved:', error);
      }
    },
    [preferenceLoaded]
  );

  const handleEdit = useCallback(
    async (submission: EmployerSubmission) => {
      setSelectedSubmission(submission);
      setDetailDialogOpen(true);
      setDetailLoading(true);
      try {
        const res = await FormService.getEmployerSubmissionDetail(submission.id);
        if (res.success && res.item) {
          setDetailData(res.item);
        } else {
          setDetailData(submission);
        }
      } catch (error) {
        console.error('Error fetching detail:', error);
        toast({ variant: 'destructive', title: '❌ Hata', description: 'Detay bilgileri alınırken hata oluştu.' });
        setDetailData(submission);
      } finally {
        setDetailLoading(false);
      }
    },
    [toast]
  );

  const handleExport = useCallback(
    async (rows: EmployerSubmission[]) => {
      try {
        const XLSX = await import('xlsx');
        const workbook = XLSX.utils.book_new();

        const exportData = rows.map((row) => ({
          'Tarih': format(new Date(row.createdAt), 'dd.MM.yyyy HH:mm'),
          'Şirket': row.companyName,
          'İletişim Kişisi': row.contactPerson,
          'E-posta': row.email,
          'Telefon': row.phone,
          'Branş': row.industry,
          'Pozisyonlar': row.positions,
          'Şirket Büyüklüğü': row.companySize || '-',
          'Dil': row.language || '-',
          'Gereksinimler': row.requirements,
          'Mesaj': row.message || '-',
          'Özel İstekler': row.specialRequests || '-',
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'İşveren Başvuruları');

        const dateStr = format(new Date(), 'yyyy-MM-dd');
        XLSX.writeFile(workbook, `isveren_basvurulari_${dateStr}.xlsx`);

        toast({ title: '✅ Başarılı', description: `${rows.length} kayıt Excel olarak indirildi.` });
      } catch (error) {
        console.error('Export error:', error);
        toast({ variant: 'destructive', title: '❌ Hata', description: 'Excel dosyası oluşturulamadı.' });
      }
    },
    [toast]
  );

  const handleDialogChange = useCallback((open: boolean) => {
    setDetailDialogOpen(open);
    if (!open) {
      setSelectedSubmission(null);
      setDetailData(null);
    }
  }, []);

  const activeDetail = detailData ?? selectedSubmission;

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">İşveren Başvuruları</h1>
        <p className="text-muted-foreground mt-1">
          Tüm işveren taleplerini modern tablo deneyimiyle görüntüleyin ve yönetin.
        </p>
      </div>

      <DataTable
        data={items}
        columns={columns}
        loading={loading}
        onEdit={handleEdit}
        onExport={handleExport}
        searchPlaceholder="Ara (şirket, kişi, email, telefon...)"
        pageSize={20}
        tableKey={EMPLOYER_TABLE_KEY}
        initialPreferences={initialPreferences}
        onPreferencesChange={handlePreferencesChange}
      />

      <Dialog open={detailDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>İşveren Talep Detayı</DialogTitle>
            <DialogDescription>
              {activeDetail && `${activeDetail.companyName} - ${activeDetail.contactPerson}`}
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : activeDetail ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Tarih</p>
                  <p className="text-sm mt-1">{format(new Date(activeDetail.createdAt), 'dd.MM.yyyy HH:mm')}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Dil</p>
                  <p className="text-sm mt-1">{activeDetail.language || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Şirket Adı</p>
                  <p className="text-sm mt-1">{activeDetail.companyName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Şirket Büyüklüğü</p>
                  <p className="text-sm mt-1">{activeDetail.companySize || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">İletişim Kişisi</p>
                  <p className="text-sm mt-1">{activeDetail.contactPerson}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Branş</p>
                  <p className="text-sm mt-1">{activeDetail.industry}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">E-posta</p>
                  <p className="text-sm mt-1">{activeDetail.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Telefon</p>
                  <p className="text-sm mt-1">{activeDetail.phone}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Pozisyonlar</p>
                <p className="text-sm bg-muted/50 rounded-md p-3 whitespace-pre-wrap">{activeDetail.positions}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Gereksinimler</p>
                <p className="text-sm bg-muted/50 rounded-md p-3 whitespace-pre-wrap">{activeDetail.requirements}</p>
              </div>

              {activeDetail.message && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Mesaj</p>
                  <p className="text-sm bg-muted/50 rounded-md p-3 whitespace-pre-wrap">{activeDetail.message}</p>
                </div>
              )}

              {activeDetail.specialRequests && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Özel İstekler</p>
                  <p className="text-sm bg-muted/50 rounded-md p-3 whitespace-pre-wrap">{activeDetail.specialRequests}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-10 text-center text-muted-foreground">Detay bilgileri yüklenemedi.</div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => handleDialogChange(false)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployerSubmissions;

