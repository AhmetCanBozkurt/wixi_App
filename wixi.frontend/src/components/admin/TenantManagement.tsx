import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaBuilding, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import tenantService from '../../ApiServices/services/TenantService';
import { useToast } from '../../hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DataTable, type ColumnDef, type TablePreferenceState } from '../ui/DataTable';
import { tablePreferenceService } from '../../ApiServices/services';
import type { TenantDto, CreateTenantDto, UpdateTenantDto } from '../../ApiServices/types/LicensingTypes';
import type { TablePreferenceDto } from '../../ApiServices/types/TablePreferenceTypes';
import { format } from 'date-fns';

const TENANT_TABLE_KEY = 'admin-tenants';

type TenantWithId = TenantDto & { id: number };

const TenantManagement: React.FC = () => {
  const [tenants, setTenants] = useState<TenantWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantDto | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<TenantDto | null>(null);
  const [form, setForm] = useState<CreateTenantDto>({ companyName: '', domain: '', status: 'Active' });
  const [preferences, setPreferences] = useState<TablePreferenceDto | null>(null);
  const [prefLoaded, setPrefLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTenants();
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const pref = await tablePreferenceService.getTablePreference(TENANT_TABLE_KEY);
      setPreferences(pref);
    } catch (error) {
      console.error('Table preferences could not be loaded:', error);
    } finally {
      setPrefLoaded(true);
    }
  };

  const loadTenants = async () => {
    try {
      setLoading(true);
      const result = await tenantService.getAllTenants();
      if (result.success && result.data) {
        // Map tenantId to id for DataTable compatibility
        const mappedTenants = result.data.map(tenant => ({ ...tenant, id: tenant.tenantId })) as TenantWithId[];
        setTenants(mappedTenants);
      } else {
        toast({
          variant: 'destructive',
          title: 'Hata',
          description: result.error || 'Müşteriler yüklenemedi',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Müşteriler yüklenirken bir hata oluştu',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const result = await tenantService.createTenant(form);
      if (result.success && result.data) {
        toast({
          title: 'Başarılı',
          description: 'Müşteri başarıyla oluşturuldu',
        });
        setShowCreate(false);
        setForm({ companyName: '', domain: '', status: 'Active' });
        loadTenants();
      } else {
        toast({
          variant: 'destructive',
          title: 'Hata',
          description: result.error || 'Müşteri oluşturulamadı',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Müşteri oluşturulurken bir hata oluştu',
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingTenant) return;
    try {
      const updateDto: UpdateTenantDto = {
        companyName: form.companyName,
        domain: form.domain,
        status: form.status,
      };
      const result = await tenantService.updateTenant(editingTenant.tenantId, updateDto);
      if (result.success && result.data) {
        toast({
          title: 'Başarılı',
          description: 'Müşteri başarıyla güncellendi',
        });
        setEditingTenant(null);
        setForm({ companyName: '', domain: '', status: 'Active' });
        loadTenants();
      } else {
        toast({
          variant: 'destructive',
          title: 'Hata',
          description: result.error || 'Müşteri güncellenemedi',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Müşteri güncellenirken bir hata oluştu',
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingTenant) return;
    try {
      const result = await tenantService.deleteTenant(deletingTenant.tenantId);
      if (result.success) {
        toast({
          title: 'Başarılı',
          description: 'Müşteri başarıyla silindi',
        });
        setDeletingTenant(null);
        loadTenants();
      } else {
        toast({
          variant: 'destructive',
          title: 'Hata',
          description: result.error || 'Müşteri silinemedi',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Müşteri silinirken bir hata oluştu',
      });
    }
  };

  const openEditDialog = (tenant: TenantDto) => {
    setEditingTenant(tenant);
    setForm({
      companyName: tenant.companyName,
      domain: tenant.domain || '',
      status: tenant.status,
    });
  };

  const closeEditDialog = () => {
    setEditingTenant(null);
    setForm({ companyName: '', domain: '', status: 'Active' });
  };

  const initialPreferences = useMemo<TablePreferenceState | undefined>(() => {
    if (!preferences) return undefined;
    return {
      tableKey: TENANT_TABLE_KEY,
      visibleColumns: preferences.visibleColumns ?? [],
      columnOrder: preferences.columnOrder ?? [],
      columnFilters: preferences.columnFilters ?? {},
      sortConfig: {
        key: preferences.sortConfig?.key ?? '',
        direction: (preferences.sortConfig?.direction as 'asc' | 'desc' | null) ?? null,
      },
      pageSize: preferences.pageSize ?? 20,
    };
  }, [preferences]);

  const handlePreferenceChange = useCallback(async (state: TablePreferenceState) => {
    if (!prefLoaded) return;
    try {
      await tablePreferenceService.saveTablePreference(TENANT_TABLE_KEY, {
        tableKey: TENANT_TABLE_KEY,
        visibleColumns: state.visibleColumns,
        columnOrder: state.columnOrder,
        columnFilters: state.columnFilters,
        sortConfig: state.sortConfig,
        pageSize: state.pageSize,
      });
    } catch (error) {
      console.error('Table preferences could not be saved:', error);
    }
  }, [prefLoaded]);

  const handleExport = useCallback(async (rows: TenantWithId[]) => {
    try {
      const XLSX = await import('xlsx');
      const workbook = XLSX.utils.book_new();

      const exportData = rows.map((row) => ({
        'ID': row.tenantId,
        'Şirket Adı': row.companyName,
        'Domain': row.domain || '-',
        'Durum': row.status,
        'Lisans Sayısı': row.licenseCount || 0,
        'Oluşturulma': format(new Date(row.createDate), 'dd.MM.yyyy HH:mm'),
        'Güncellenme': row.updatedDate ? format(new Date(row.updatedDate), 'dd.MM.yyyy HH:mm') : '-',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Müşteriler');
      const dateStr = format(new Date(), 'yyyy-MM-dd');
      XLSX.writeFile(workbook, `musteriler_${dateStr}.xlsx`);

      toast({
        title: 'Başarılı',
        description: `${rows.length} kayıt Excel olarak indirildi.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Excel dosyası oluşturulamadı.',
      });
    }
  }, [toast]);

  const columns: ColumnDef<TenantWithId>[] = useMemo(
    () => [
      {
        id: 'tenantId',
        header: 'ID',
        accessorKey: 'tenantId',
        width: '80px',
        filterType: 'text',
        cell: (value) => <span className="text-sm text-gray-600">{value as number}</span>,
      },
      {
        id: 'companyName',
        header: 'Şirket Adı',
        accessorKey: 'companyName',
        width: '250px',
        filterType: 'text',
        cell: (value) => <span className="font-medium">{value as string}</span>,
      },
      {
        id: 'domain',
        header: 'Domain',
        accessorKey: 'domain',
        width: '200px',
        filterType: 'text',
        cell: (value) => <span className="text-sm text-gray-600">{value || '-'}</span>,
      },
      {
        id: 'status',
        header: 'Durum',
        accessorKey: 'status',
        width: '120px',
        filterType: 'list',
        cell: (value) => {
          const status = value as string;
          return (
            <span className={`px-2 py-1 text-xs rounded-full ${
              status === 'Active' 
                ? 'bg-green-100 text-green-800' 
                : status === 'Suspended'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {status}
            </span>
          );
        },
      },
      {
        id: 'licenseCount',
        header: 'Lisans Sayısı',
        accessorKey: 'licenseCount',
        width: '120px',
        filterType: 'text',
        cell: (value) => <span className="text-sm text-gray-600">{value || 0}</span>,
      },
      {
        id: 'createDate',
        header: 'Oluşturulma',
        accessorKey: 'createDate',
        width: '180px',
        filterType: 'text',
        cell: (value) => (
          <span className="text-sm text-gray-500">
            {format(new Date(value as string), 'dd.MM.yyyy HH:mm')}
          </span>
        ),
      },
    ],
    []
  );

  if (!prefLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaBuilding className="text-blue-600" />
          Müşteri Yönetimi
        </h1>
        <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2">
          <FaPlus /> Yeni Müşteri
        </Button>
      </div>

      <DataTable
        data={tenants}
        columns={columns}
        onEdit={openEditDialog}
        onDelete={(tenants) => setDeletingTenant(tenants[0])}
        onExport={handleExport}
        searchPlaceholder="Müşteri ara..."
        pageSize={20}
        tableKey={TENANT_TABLE_KEY}
        initialPreferences={initialPreferences}
        onPreferencesChange={handlePreferenceChange}
        loading={loading}
      />

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Müşteri Oluştur</DialogTitle>
            <DialogDescription>Yeni bir müşteri ekleyin</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="companyName">Şirket Adı *</Label>
              <Input
                id="companyName"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                placeholder="Şirket adı"
              />
            </div>
            <div>
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                value={form.domain}
                onChange={(e) => setForm({ ...form, domain: e.target.value })}
                placeholder="example.com"
              />
            </div>
            <div>
              <Label htmlFor="status">Durum</Label>
              <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Aktif</SelectItem>
                  <SelectItem value="Suspended">Askıya Alındı</SelectItem>
                  <SelectItem value="Inactive">Pasif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>İptal</Button>
            <Button onClick={handleCreate}>Oluştur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingTenant} onOpenChange={closeEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Müşteri Düzenle</DialogTitle>
            <DialogDescription>Müşteri bilgilerini güncelleyin</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-companyName">Şirket Adı *</Label>
              <Input
                id="edit-companyName"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                placeholder="Şirket adı"
              />
            </div>
            <div>
              <Label htmlFor="edit-domain">Domain</Label>
              <Input
                id="edit-domain"
                value={form.domain}
                onChange={(e) => setForm({ ...form, domain: e.target.value })}
                placeholder="example.com"
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Durum</Label>
              <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Aktif</SelectItem>
                  <SelectItem value="Suspended">Askıya Alındı</SelectItem>
                  <SelectItem value="Inactive">Pasif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog}>İptal</Button>
            <Button onClick={handleUpdate}>Güncelle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingTenant} onOpenChange={(open) => !open && setDeletingTenant(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Müşteriyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingTenant?.companyName} müşterisini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TenantManagement;
