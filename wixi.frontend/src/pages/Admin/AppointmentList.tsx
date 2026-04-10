import React, { useState, useEffect, useMemo } from 'react';
import { Clock, User, Phone, Mail, Calendar as CalendarIcon, CheckCircle2, XCircle, AlertCircle, Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { appointmentService, type IAppointmentDto, type ICreateAppointmentDto, type IUpdateAppointmentDto } from '../../ApiServices/services/AppointmentService';
import { tablePreferenceService } from '../../ApiServices/services';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { DataTable, type ColumnDef, type TablePreferenceState } from '../../components/ui/DataTable';
import type { TablePreferenceDto } from '../../ApiServices/types/TablePreferenceTypes';
import { format } from 'date-fns';

const APPOINTMENT_TABLE_KEY = 'admin-appointment-list';

const AppointmentList: React.FC = () => {
  const [appointments, setAppointments] = useState<IAppointmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<IAppointmentDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tablePreferences, setTablePreferences] = useState<TablePreferenceDto | null>(null);
  const [preferenceLoaded, setPreferenceLoaded] = useState(false);

  const [formData, setFormData] = useState<ICreateAppointmentDto & IUpdateAppointmentDto>({
    title: '',
    description: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    startTime: '',
    endTime: '',
    status: 'Pending',
    color: '#3B82F6',
  });

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const pref = await tablePreferenceService.getTablePreference(APPOINTMENT_TABLE_KEY);
        setTablePreferences(pref);
      } catch (error) {
        console.error('Appointment table preferences could not be loaded:', error);
      } finally {
        setPreferenceLoaded(true);
      }
    };

    loadPreferences();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getAppointments();
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Randevular yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    const start = new Date();
    start.setHours(9, 0, 0, 0);
    const end = new Date();
    end.setHours(10, 0, 0, 0);

    setFormData({
      title: '',
      description: '',
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      startTime: start.toISOString().slice(0, 16),
      endTime: end.toISOString().slice(0, 16),
      status: 'Pending',
      color: '#3B82F6',
    });
    setIsModalOpen(true);
  };

  const handleEditAppointment = (appointment: IAppointmentDto) => {
    setSelectedAppointment(appointment);
    setFormData({
      title: appointment.title,
      description: appointment.description || '',
      clientName: appointment.clientName,
      clientPhone: appointment.clientPhone || '',
      clientEmail: appointment.clientEmail || '',
      startTime: new Date(appointment.startTime).toISOString().slice(0, 16),
      endTime: new Date(appointment.endTime).toISOString().slice(0, 16),
      status: appointment.status,
      color: appointment.color || '#3B82F6',
    });
    setIsModalOpen(true);
  };

  const handleDeleteAppointments = async (rows: IAppointmentDto[]) => {
    if (!confirm(`${rows.length} randevuyu silmek istediğinize emin misiniz?`)) return;

    try {
      await Promise.all(rows.map(row => appointmentService.deleteAppointment(row.id)));
      toast.success(`${rows.length} randevu silindi`);
      loadAppointments();
    } catch (error) {
      console.error('Error deleting appointments:', error);
      toast.error('Randevular silinirken hata oluştu');
    }
  };

  const handleSaveAppointment = async () => {
    if (!formData.title || !formData.clientName || !formData.startTime || !formData.endTime) {
      toast.error('Lütfen tüm gerekli alanları doldurun');
      return;
    }

    try {
      setSaving(true);
      if (selectedAppointment) {
        await appointmentService.updateAppointment(selectedAppointment.id, formData);
        toast.success('Randevu güncellendi');
      } else {
        await appointmentService.createAppointment(formData);
        toast.success('Randevu oluşturuldu');
      }
      setIsModalOpen(false);
      loadAppointments();
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error('Randevu kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="mr-1 w-3 h-3" /> Onaylandı
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400">
            <Clock className="mr-1 w-3 h-3" /> Beklemede
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400">
            <XCircle className="mr-1 w-3 h-3" /> İptal Edildi
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400">
            <CheckCircle2 className="mr-1 w-3 h-3" /> Tamamlandı
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const columns: ColumnDef<IAppointmentDto>[] = useMemo(
    () => [
      {
        id: 'startTime',
        header: 'Tarih & Saat',
        headerKey: 'admin.appointment.table.datetime',
        translations: {
          tr: 'Tarih & Saat',
          de: 'Datum & Uhrzeit',
          en: 'Date & Time',
          ar: 'التاريخ والوقت',
        },
        accessorKey: 'startTime',
        width: '200px',
        filterType: 'text',
        filterPlaceholder: 'Tarih ara',
        sortable: true,
        cell: (value, row) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-semibold">{format(new Date(value as string), 'dd.MM.yyyy')}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-muted-foreground">
                {format(new Date(value as string), 'HH:mm')} - {format(new Date(row.endTime), 'HH:mm')}
              </span>
            </div>
          </div>
        ),
      },
      {
        id: 'title',
        header: 'Başlık',
        headerKey: 'admin.appointment.table.title',
        translations: {
          tr: 'Başlık',
          de: 'Titel',
          en: 'Title',
          ar: 'العنوان',
        },
        accessorKey: 'title',
        width: '250px',
        filterType: 'text',
        filterPlaceholder: 'Başlık ara',
        sortable: true,
        cell: (value, row) => (
          <div className="text-sm">
            <div className="font-medium">{value as string}</div>
            {row.description && (
              <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {row.description}
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'clientName',
        header: 'Müşteri',
        headerKey: 'admin.appointment.table.client',
        translations: {
          tr: 'Müşteri',
          de: 'Kunde',
          en: 'Client',
          ar: 'العميل',
        },
        accessorKey: 'clientName',
        width: '250px',
        filterType: 'text',
        filterPlaceholder: 'Müşteri ara',
        sortable: true,
        cell: (value, row) => (
          <div className="text-sm">
            <div className="flex items-center gap-2 font-medium">
              <User className="w-4 h-4 text-gray-400" />
              {value as string}
            </div>
            {row.clientEmail && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Mail className="w-3 h-3" />
                {row.clientEmail}
              </div>
            )}
            {row.clientPhone && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Phone className="w-3 h-3" />
                {row.clientPhone}
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Durum',
        headerKey: 'admin.appointment.table.status',
        translations: {
          tr: 'Durum',
          de: 'Status',
          en: 'Status',
          ar: 'الحالة',
        },
        accessorKey: 'status',
        width: '150px',
        filterType: 'list',
        filterOptions: [
          { label: 'Onaylandı', value: 'confirmed' },
          { label: 'Beklemede', value: 'pending' },
          { label: 'İptal Edildi', value: 'cancelled' },
          { label: 'Tamamlandı', value: 'completed' },
        ],
        getFilterValue: (value) => String(value).toLowerCase(),
        sortable: true,
        cell: (value) => getStatusBadge(value as string),
      },
    ],
    []
  );

  const stats = useMemo(() => {
    const confirmed = appointments.filter(a => a.status?.toLowerCase() === 'confirmed');
    const pending = appointments.filter(a => a.status?.toLowerCase() === 'pending');
    const cancelled = appointments.filter(a => a.status?.toLowerCase() === 'cancelled');
    const completed = appointments.filter(a => a.status?.toLowerCase() === 'completed');

    return { confirmed: confirmed.length, pending: pending.length, cancelled: cancelled.length, completed: completed.length };
  }, [appointments]);

  return (
    <div className="p-6 space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="text-blue-600 dark:text-blue-400" />
            Randevu Yönetimi
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tüm randevuları görüntüleyin ve yönetin
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Card className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <CalendarIcon className="text-blue-600 dark:text-blue-400 w-5 h-5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Toplam</p>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-400">{appointments.length}</p>
              </div>
            </div>
          </Card>
          <Card className="px-4 py-3 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-green-600 dark:text-green-400 w-5 h-5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Onaylı</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-400">{stats.confirmed}</p>
              </div>
            </div>
          </Card>
          <Card className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2">
              <Clock className="text-yellow-600 dark:text-yellow-400 w-5 h-5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Beklemede</p>
                <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">{stats.pending}</p>
              </div>
            </div>
          </Card>
          <Button onClick={handleNewAppointment} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Randevu
          </Button>
        </div>
      </div>

      {/* Data Table */}
      {preferenceLoaded && (
        <DataTable
          data={appointments}
          columns={columns}
          searchPlaceholder="Başlık, müşteri, email veya telefon ara..."
          pageSize={20}
          loading={loading}
          tableKey={APPOINTMENT_TABLE_KEY}
          initialPreferences={tablePreferences ? {
            tableKey: tablePreferences.tableKey,
            visibleColumns: tablePreferences.visibleColumns || columns.map(c => c.id),
            columnOrder: tablePreferences.columnOrder || columns.map(c => c.id),
            columnFilters: tablePreferences.columnFilters || {},
            sortConfig: {
              key: tablePreferences.sortConfig?.key || 'startTime',
              direction: (tablePreferences.sortConfig?.direction as 'asc' | 'desc' | null) || 'desc',
            },
            pageSize: tablePreferences.pageSize || 20,
          } : undefined}
          onPreferencesChange={async (state: TablePreferenceState) => {
            try {
              await tablePreferenceService.saveTablePreference(APPOINTMENT_TABLE_KEY, {
                tableKey: APPOINTMENT_TABLE_KEY,
                visibleColumns: state.visibleColumns,
                columnOrder: state.columnOrder,
                columnFilters: state.columnFilters,
                sortConfig: {
                  key: state.sortConfig.key || '',
                  direction: state.sortConfig.direction || null,
                },
                pageSize: state.pageSize,
              });
            } catch (error) {
              console.error('Failed to save table preferences:', error);
            }
          }}
          onEdit={(row) => handleEditAppointment(row)}
          onDelete={(rows) => handleDeleteAppointments(rows)}
        />
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CalendarIcon className="text-blue-600 dark:text-blue-400" />
              {selectedAppointment ? 'Randevu Düzenle' : 'Yeni Randevu'}
            </DialogTitle>
            <DialogDescription>
              Randevu bilgilerini girin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="title">Başlık *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Randevu başlığı"
              />
            </div>

            <div>
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Randevu açıklaması"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Müşteri Adı *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="Ad Soyad"
                />
              </div>

              <div>
                <Label htmlFor="clientPhone">Telefon</Label>
                <Input
                  id="clientPhone"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  placeholder="05xx xxx xx xx"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="clientEmail">E-posta</Label>
              <Input
                id="clientEmail"
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Başlangıç Zamanı *</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="endTime">Bitiş Zamanı *</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Durum</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Beklemede</SelectItem>
                    <SelectItem value="Confirmed">Onaylandı</SelectItem>
                    <SelectItem value="Completed">Tamamlandı</SelectItem>
                    <SelectItem value="Cancelled">İptal Edildi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="color">Renk</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
              İptal
            </Button>
            <Button onClick={handleSaveAppointment} disabled={saving}>
              {saving ? 'Kaydediliyor...' : selectedAppointment ? 'Güncelle' : 'Oluştur'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentList;
