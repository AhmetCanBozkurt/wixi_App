import React, { useEffect, useState, useCallback, useMemo } from 'react';
import FormService from '../../ApiServices/services/FormService';
import ClientService from '../../ApiServices/services/ClientService';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Eye, UserPlus, Mail, Phone, Briefcase, GraduationCap, MessageSquare, Loader2, CheckCircle2, Clock, FileText, Download, Ticket, AlertCircle } from 'lucide-react';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DataTable, type ColumnDef, type TablePreferenceState } from '../ui/DataTable';
import { tablePreferenceService } from '../../ApiServices/services';
import type { TablePreferenceDto } from '../../ApiServices/types/TablePreferenceTypes';
import { format } from 'date-fns';

interface EmployeeSubmission {
  id: number;
  createdAt: string;
  salutation?: string;
  fullName: string;
  email: string;
  phone: string;
  profession?: string;
  experience?: number;
  education?: string;
  germanLevel?: string;
  additionalInfo?: string;
  specialRequests?: string;
  language?: string;
  clientCode?: string;
  clientCreatedAt?: string;
  cvFileName?: string;
  cvFilePath?: string;
  cvFileSize?: number;
}

interface PendingClientCode {
  id: number;
  clientCode: string;
  email: string;
  fullName: string;
  expirationDate: string;
  isUsed: boolean;
  usedAt?: string;
  employeeSubmissionId?: number;
  createdAt: string;
  isExpired: boolean;
  isValid: boolean;
  daysRemaining?: number;
  status: string;
  statusValue?: 'valid' | 'used' | 'expired';
}

const EMPLOYEE_TABLE_KEY = 'admin-employee-submissions';
const CODE_TABLE_KEY = 'admin-employee-pending-codes';

const EmployeeSubmissions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'codes'>('submissions');
  
  // Employee Submissions state
  const [items, setItems] = useState<EmployeeSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Pending Client Codes state
  const [pendingCodes, setPendingCodes] = useState<PendingClientCode[]>([]);
  const [codesLoading, setCodesLoading] = useState(false);
  
  // Table preferences
  const [employeePreferences, setEmployeePreferences] = useState<TablePreferenceDto | null>(null);
  const [employeePrefLoaded, setEmployeePrefLoaded] = useState(false);
  const [codePreferences, setCodePreferences] = useState<TablePreferenceDto | null>(null);
  const [codePrefLoaded, setCodePrefLoaded] = useState(false);
  
  // Detail modal
  const [selectedItem, setSelectedItem] = useState<EmployeeSubmission | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Create client modal
  const [isCreateClientModalOpen, setIsCreateClientModalOpen] = useState(false);
  const [creatingClient, setCreatingClient] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await FormService.getEmployeeSubmissions({ page: 1, pageSize: 1000 });
      setItems(res.items || []);
    } catch (e) {
      console.error(e);
      toast.error('Kayıtlar alınırken hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingCodes = useCallback(async () => {
    setCodesLoading(true);
    try {
      const res = await FormService.getPendingClientCodes({ 
        page: 1, 
        pageSize: 1000
      });
      const mapped = (res.items || []).map((code) => ({
        ...code,
        statusValue: code.isUsed ? 'used' : code.isExpired ? 'expired' : 'valid',
      }));
      setPendingCodes(mapped);
    } catch (e) {
      console.error(e);
      toast.error('Bekleyen müşteri kodları alınırken hata oluştu.');
    } finally {
      setCodesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'submissions') {
      fetchData();
    } else if (activeTab === 'codes') {
      fetchPendingCodes();
    }
  }, [activeTab, fetchData, fetchPendingCodes]);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const [employeePref, codePref] = await Promise.all([
          tablePreferenceService.getTablePreference(EMPLOYEE_TABLE_KEY),
          tablePreferenceService.getTablePreference(CODE_TABLE_KEY),
        ]);
        setEmployeePreferences(employeePref);
        setCodePreferences(codePref);
      } catch (error) {
        console.error('Table preferences could not be loaded:', error);
      } finally {
        setEmployeePrefLoaded(true);
        setCodePrefLoaded(true);
      }
    };

    loadPreferences();
  }, []);

  const handleViewDetail = async (item: EmployeeSubmission) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    
    try {
      const detail = await FormService.getEmployeeSubmissionDetail(item.id);
      setSelectedItem({ ...item, ...detail.item });
    } catch (error) {
      console.error('Error fetching detail:', error);
      toast.error('Detay bilgileri yüklenirken hata oluştu.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateClient = async () => {
    if (!selectedItem) return;

    setCreatingClient(true);
    try {
      const result = await FormService.createClientFromEmployeeSubmission(selectedItem.id);
      
      toast.success(`Müşteri kodu oluşturuldu: ${result.clientCode}. Mail gönderildi.`);
      
      setIsCreateClientModalOpen(false);
      setSelectedItem(null);
      
      // Refresh data
      await fetchData();
      if (activeTab === 'codes') {
        await fetchPendingCodes();
      }
    } catch (error: any) {
      console.error('Error creating client:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast.error(error.message || 'Müşteri oluşturulurken hata oluştu.');
    } finally {
      setCreatingClient(false);
    }
  };

  const openCreateClientModal = useCallback((item: EmployeeSubmission) => {
    setSelectedItem(item);
    setIsCreateClientModalOpen(true);
  }, []);

  const employeeInitialPreferences = useMemo<TablePreferenceState | undefined>(() => {
    if (!employeePreferences) return undefined;
    return {
      tableKey: EMPLOYEE_TABLE_KEY,
      visibleColumns: employeePreferences.visibleColumns ?? [],
      columnOrder: employeePreferences.columnOrder ?? [],
      columnFilters: employeePreferences.columnFilters ?? {},
      sortConfig: {
        key: employeePreferences.sortConfig?.key ?? '',
        direction: (employeePreferences.sortConfig?.direction as 'asc' | 'desc' | null) ?? null,
      },
      pageSize: employeePreferences.pageSize ?? 20,
    };
  }, [employeePreferences]);

  const codeInitialPreferences = useMemo<TablePreferenceState | undefined>(() => {
    if (!codePreferences) return undefined;
    return {
      tableKey: CODE_TABLE_KEY,
      visibleColumns: codePreferences.visibleColumns ?? [],
      columnOrder: codePreferences.columnOrder ?? [],
      columnFilters: codePreferences.columnFilters ?? {},
      sortConfig: {
        key: codePreferences.sortConfig?.key ?? '',
        direction: (codePreferences.sortConfig?.direction as 'asc' | 'desc' | null) ?? null,
      },
      pageSize: codePreferences.pageSize ?? 20,
    };
  }, [codePreferences]);

  const handleEmployeePreferenceChange = useCallback(async (state: TablePreferenceState) => {
    if (!employeePrefLoaded) return;
    try {
      await tablePreferenceService.saveTablePreference(EMPLOYEE_TABLE_KEY, {
        tableKey: EMPLOYEE_TABLE_KEY,
        visibleColumns: state.visibleColumns,
        columnOrder: state.columnOrder,
        columnFilters: state.columnFilters,
        sortConfig: state.sortConfig,
        pageSize: state.pageSize,
      });
    } catch (error) {
      console.error('Employee table preferences could not be saved:', error);
    }
  }, [employeePrefLoaded]);

  const handleCodePreferenceChange = useCallback(async (state: TablePreferenceState) => {
    if (!codePrefLoaded) return;
    try {
      await tablePreferenceService.saveTablePreference(CODE_TABLE_KEY, {
        tableKey: CODE_TABLE_KEY,
        visibleColumns: state.visibleColumns,
        columnOrder: state.columnOrder,
        columnFilters: state.columnFilters,
        sortConfig: state.sortConfig,
        pageSize: state.pageSize,
      });
    } catch (error) {
      console.error('Pending code table preferences could not be saved:', error);
    }
  }, [codePrefLoaded]);

  const handleEmployeeExport = useCallback(async (rows: EmployeeSubmission[]) => {
    try {
      const XLSX = await import('xlsx');
      const workbook = XLSX.utils.book_new();

      const exportData = rows.map((row) => ({
        'Tarih': format(new Date(row.createdAt), 'dd.MM.yyyy HH:mm'),
        'Ad Soyad': row.fullName,
        'E-posta': row.email,
        'Telefon': row.phone,
        'Meslek': row.profession || '-',
        'Deneyim': typeof row.experience === 'number' ? `${row.experience} yıl` : '-',
        'Eğitim': row.education || '-',
        'Almanca': row.germanLevel || '-',
        'Dil': row.language || '-',
        'Durum': row.clientCode ? 'Müşteri Oluşturuldu' : 'Beklemede',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'İş Başvuruları');
      const dateStr = format(new Date(), 'yyyy-MM-dd');
      XLSX.writeFile(workbook, `is_basvurulari_${dateStr}.xlsx`);

      toast.success(`${rows.length} kayıt Excel olarak indirildi.`);
    } catch (error) {
      console.error('Employee export error:', error);
      toast.error('Excel dosyası oluşturulamadı.');
    }
  }, []);

  const handlePendingCodesExport = useCallback(async (rows: PendingClientCode[]) => {
    try {
      const XLSX = await import('xlsx');
      const workbook = XLSX.utils.book_new();

      const exportData = rows.map((row) => ({
        'Oluşturulma': row.createdAt ? format(new Date(row.createdAt), 'dd.MM.yyyy HH:mm') : '-',
        'Müşteri Kodu': row.clientCode,
        'Ad Soyad': row.fullName,
        'E-posta': row.email,
        'Bitiş Tarihi': row.expirationDate ? format(new Date(row.expirationDate), 'dd.MM.yyyy HH:mm') : '-',
        'Kalan Süre': row.daysRemaining ?? '-',
        'Durum': row.isUsed ? 'Kullanılmış' : row.isExpired ? 'Süresi Dolmuş' : 'Geçerli',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Bekleyen Kodlar');
      const dateStr = format(new Date(), 'yyyy-MM-dd');
      XLSX.writeFile(workbook, `bekleyen_kodlar_${dateStr}.xlsx`);

      toast.success(`${rows.length} kod Excel olarak indirildi.`);
    } catch (error) {
      console.error('Pending codes export error:', error);
      toast.error('Excel dosyası oluşturulamadı.');
    }
  }, []);

  const employeeColumns: ColumnDef<EmployeeSubmission>[] = useMemo(
    () => [
    {
      id: 'createdAt',
      header: 'Tarih',
      headerKey: 'admin.employee.table.date',
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
      id: 'fullName',
      header: 'Ad Soyad',
      headerKey: 'admin.employee.table.name',
        translations: {
          tr: 'Ad Soyad',
          de: 'Vor- und Nachname',
          en: 'Full Name',
        },
      accessorKey: 'fullName',
        width: '220px',
      filterType: 'list',
        filterPlaceholder: 'İsim ara',
        cell: (value) => <span className="font-medium">{value}</span>,
    },
    {
      id: 'email',
      header: 'E-mail',
      headerKey: 'admin.employee.table.email',
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
      headerKey: 'admin.employee.table.phone',
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
      id: 'profession',
      header: 'Meslek',
      headerKey: 'admin.employee.table.profession',
        translations: {
          tr: 'Meslek',
          de: 'Beruf',
          en: 'Profession',
        },
      accessorKey: 'profession',
        width: '180px',
      filterType: 'list',
        filterPlaceholder: 'Meslek ara',
        cell: (value) =>
          value ? (
            <Badge variant="secondary" className="font-normal">
              {value}
            </Badge>
          ) : (
            '-'
          ),
      },
      {
        id: 'germanLevel',
        header: 'Almanca',
        headerKey: 'admin.employee.table.germanLevel',
        translations: {
          tr: 'Almanca',
          de: 'Deutsch',
          en: 'German',
        },
        accessorKey: 'germanLevel',
        width: '140px',
        filterType: 'list',
        filterPlaceholder: 'Almanca ara',
        cell: (value) => value || '-',
      },
      {
        id: 'language',
        header: 'Dil',
        headerKey: 'admin.employee.table.language',
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
    {
      id: 'status',
      header: 'Durum',
      headerKey: 'admin.employee.table.status',
        translations: {
          tr: 'Durum',
          de: 'Status',
          en: 'Status',
        },
      accessorKey: 'clientCode',
        width: '180px',
      filterType: 'list',
        filterPlaceholder: 'Durum seç',
        filterOptions: [
          { label: 'Müşteri Oluşturuldu', value: 'created' },
          { label: 'Beklemede', value: 'pending' },
        ],
      getFilterValue: (_, row) => (row.clientCode ? 'created' : 'pending'),
      cell: (_, row) =>
        row.clientCode ? (
          <Badge className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" />
            <span>Müşteri Oluşturuldu</span>
          </Badge>
        ) : (
          <Badge className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" />
            <span>Beklemede</span>
          </Badge>
        ),
    },
    {
        id: 'quickActions',
      header: 'İşlemler',
      headerKey: 'admin.employee.table.actions',
        translations: {
          tr: 'İşlemler',
          de: 'Aktionen',
          en: 'Actions',
        },
      accessorKey: 'id',
        width: '140px',
        cell: (_, row) =>
          row.clientCode ? (
            <span className="text-xs text-muted-foreground">-</span>
          ) : (
          <Button
              variant="outline"
              size="sm"
              onClick={() => openCreateClientModal(row)}
              className="h-8"
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Oluştur
            </Button>
      ),
    },
    ],
    [openCreateClientModal]
  );

  const codeColumns: ColumnDef<PendingClientCode>[] = useMemo(
    () => [
    {
      id: 'createdAt',
      header: 'Oluşturulma',
      headerKey: 'admin.employee.codes.createdAt',
        translations: {
          tr: 'Oluşturulma',
          de: 'Erstellt am',
          en: 'Created At',
        },
      accessorKey: 'createdAt',
        width: '180px',
        filterType: 'text',
        filterPlaceholder: 'Tarih ara',
      cell: (value) => format(new Date(value as string), 'dd.MM.yyyy HH:mm'),
    },
    {
      id: 'clientCode',
      header: 'Müşteri Kodu',
      headerKey: 'admin.employee.codes.code',
        translations: {
          tr: 'Müşteri Kodu',
          de: 'Kundencode',
          en: 'Client Code',
        },
      accessorKey: 'clientCode',
        width: '160px',
      filterType: 'text',
        filterPlaceholder: 'Kod ara',
    },
    {
      id: 'fullName',
      header: 'Ad Soyad',
      headerKey: 'admin.employee.codes.name',
        translations: {
          tr: 'Ad Soyad',
          de: 'Vor- und Nachname',
          en: 'Full Name',
        },
      accessorKey: 'fullName',
        width: '200px',
      filterType: 'list',
        filterPlaceholder: 'İsim ara',
    },
    {
      id: 'email',
      header: 'E-mail',
      headerKey: 'admin.employee.codes.email',
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
      id: 'expirationDate',
      header: 'Bitiş Tarihi',
      headerKey: 'admin.employee.codes.expiration',
        translations: {
          tr: 'Bitiş Tarihi',
          de: 'Ablaufdatum',
          en: 'Expiration',
        },
      accessorKey: 'expirationDate',
        width: '180px',
        filterType: 'text',
        filterPlaceholder: 'Bitiş ara',
      cell: (value) => (value ? format(new Date(value as string), 'dd.MM.yyyy HH:mm') : '-'),
    },
    {
      id: 'daysRemaining',
      header: 'Kalan Süre',
      headerKey: 'admin.employee.codes.remaining',
        translations: {
          tr: 'Kalan Süre',
          de: 'Restzeit',
          en: 'Remaining',
        },
      accessorKey: 'daysRemaining',
        width: '140px',
      cell: (value) => {
        if (value === null || value === undefined) return '-';
        if ((value as number) < 0) return '0';
        return `${value} gün`;
      },
    },
    {
      id: 'status',
      header: 'Durum',
      headerKey: 'admin.employee.codes.status',
        translations: {
          tr: 'Durum',
          de: 'Status',
          en: 'Status',
        },
      accessorKey: 'statusValue',
        width: '160px',
      filterType: 'list',
        filterPlaceholder: 'Durum seç',
      filterOptions: [
        { label: 'Geçerli', value: 'valid' },
        { label: 'Kullanılmış', value: 'used' },
        { label: 'Süresi Dolmuş', value: 'expired' },
      ],
      cell: (_, code) => {
        if (code.isUsed) {
          return (
            <Badge className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 flex items-center gap-1 w-fit">
              <CheckCircle2 className="w-3 h-3" />
              <span>Kullanılmış</span>
            </Badge>
          );
        }
        if (code.isExpired) {
          return (
            <Badge className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 flex items-center gap-1 w-fit">
              <AlertCircle className="w-3 h-3" />
              <span>Süresi Dolmuş</span>
            </Badge>
          );
        }
        return (
          <Badge className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" />
            <span>Geçerli</span>
          </Badge>
        );
      },
    },
    ],
    []
  );

  const compactTableClass =
    "text-[12px] leading-snug [&_th]:py-1.5 [&_th]:px-2 [&_td]:py-1.5 [&_td]:px-2 [&_.dt-toolbar]:px-2 [&_.dt-toolbar]:py-1.5 [&_.dt-footer]:px-2 [&_.dt-footer]:py-1.5";

  return (
    <div className="p-4 lg:p-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'submissions' | 'codes')} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-4 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger 
            value="submissions"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:font-semibold transition-colors"
          >
            İş Başvuruları
          </TabsTrigger>
          <TabsTrigger 
            value="codes"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:font-semibold transition-colors"
          >
            Bekleyen Müşteri Kodları
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-4">
          <DataTable<EmployeeSubmission>
            data={items}
            columns={employeeColumns}
            searchPlaceholder="Ara (isim, email, telefon...)"
            pageSize={20}
            loading={loading}
            tableKey={EMPLOYEE_TABLE_KEY}
            initialPreferences={employeeInitialPreferences}
            onPreferencesChange={handleEmployeePreferenceChange}
            onEdit={handleViewDetail}
            onExport={handleEmployeeExport}
            className={compactTableClass}
          />
        </TabsContent>

        <TabsContent value="codes" className="space-y-4">
          <DataTable<PendingClientCode>
            data={pendingCodes}
            columns={codeColumns}
            searchPlaceholder="Ara (kod, email, isim...)"
            pageSize={20}
            loading={codesLoading}
            tableKey={CODE_TABLE_KEY}
            initialPreferences={codeInitialPreferences}
            onPreferencesChange={handleCodePreferenceChange}
            onExport={handlePendingCodesExport}
            className={compactTableClass}
          />
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Talep Detayları</DialogTitle>
            <DialogDescription>
              {selectedItem?.fullName} - Talep Bilgileri
            </DialogDescription>
          </DialogHeader>
          
          {detailLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500 dark:text-gray-400">Ad Soyad</Label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedItem.fullName}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 dark:text-gray-400">Hitap</Label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedItem.salutation || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    E-posta
                  </Label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedItem.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Telefon
                  </Label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedItem.phone}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    Meslek
                  </Label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedItem.profession || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 dark:text-gray-400">Deneyim</Label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {typeof selectedItem.experience === 'number' ? `${selectedItem.experience} yıl` : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    Eğitim
                  </Label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedItem.education || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 dark:text-gray-400">Almanca Seviyesi</Label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedItem.germanLevel || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 dark:text-gray-400">Dil</Label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedItem.language || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 dark:text-gray-400">Talep Tarihi</Label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(selectedItem.createdAt).toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>

              {/* CV Information Section */}
              {selectedItem.cvFileName && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <Label className="text-sm font-semibold text-blue-900 dark:text-blue-100">CV Dosyası</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const blob = await FormService.downloadEmployeeCv(selectedItem.id);
                            const url = window.URL.createObjectURL(blob);
                            window.open(url, '_blank');
                            toast.success('CV yeni sekmede açılıyor');
                          } catch (error: any) {
                            console.error('Error viewing CV:', error);
                            toast.error(error.message || 'CV görüntülenirken hata oluştu');
                          }
                        }}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Görüntüle
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={async () => {
                          try {
                            const blob = await FormService.downloadEmployeeCv(selectedItem.id);
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = selectedItem.cvFileName || 'cv.pdf';
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                            toast.success('CV indirildi');
                          } catch (error: any) {
                            console.error('Error downloading CV:', error);
                            toast.error(error.message || 'CV indirilirken hata oluştu');
                          }
                        }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        <Download className="w-4 h-4" />
                        İndir
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <Label className="text-xs text-blue-700 dark:text-blue-300">Dosya Adı</Label>
                      <p className="text-blue-900 dark:text-blue-100 font-medium break-words">{selectedItem.cvFileName}</p>
                    </div>
                    {selectedItem.cvFileSize && (
                      <div>
                        <Label className="text-xs text-blue-700 dark:text-blue-300">Dosya Boyutu</Label>
                        <p className="text-blue-900 dark:text-blue-100">
                          {(selectedItem.cvFileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {selectedItem.additionalInfo && (
                <div>
                  <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    Ek Bilgiler
                  </Label>
                  <p className="text-sm text-gray-900 dark:text-white mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    {selectedItem.additionalInfo}
                  </p>
                </div>
              )}
              
              {selectedItem.specialRequests && (
                <div>
                  <Label className="text-xs text-gray-500 dark:text-gray-400">Özel İstekler</Label>
                  <p className="text-sm text-gray-900 dark:text-white mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    {selectedItem.specialRequests}
                  </p>
                </div>
              )}

              {selectedItem.clientCode && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <Label className="text-sm font-semibold text-green-900 dark:text-green-100">Müşteri Oluşturuldu</Label>
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>Müşteri Kodu:</strong> {selectedItem.clientCode}
                  </p>
                  {selectedItem.clientCreatedAt && (
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      Oluşturulma Tarihi: {new Date(selectedItem.clientCreatedAt).toLocaleString('tr-TR')}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            {selectedItem && !selectedItem.clientCode && (
              <Button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  openCreateClientModal(selectedItem);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Müşteri Oluştur
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Client Modal */}
      <Dialog open={isCreateClientModalOpen} onOpenChange={setIsCreateClientModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Müşteri Oluştur</DialogTitle>
            <DialogDescription>
              {selectedItem?.fullName} için müşteri kodu oluşturun. 3 gün geçerli olacak ve mail gönderilecektir.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Bilgi:</strong> Müşteri kodu ve kullanıcı hesabı otomatik olarak oluşturulacaktır. 
                {selectedItem?.email} adresine mail gönderilecektir. Kod 3 gün geçerli olacaktır.
              </p>
            </div>
            
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-900 dark:text-green-100">
                <strong>Otomatik İşlemler:</strong>
              </p>
              <ul className="text-xs text-green-800 dark:text-green-200 mt-2 space-y-1 list-disc list-inside">
                <li>Kullanıcı hesabı otomatik oluşturulacak (eğer yoksa)</li>
                <li>Müşteri profili oluşturulacak</li>
                <li>Müşteri kodu üretilecek (3 gün geçerli)</li>
                <li>E-posta gönderilecek (kod + şifre sıfırlama linki)</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateClientModalOpen(false)}
              disabled={creatingClient}
            >
              İptal
            </Button>
            <Button
              onClick={handleCreateClient}
              disabled={creatingClient}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {creatingClient ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Müşteri Oluştur
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeSubmissions;
