import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Loader2,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { appointmentService, type IHolidayDto, type ICreateHolidayDto, type IUpdateHolidayDto } from '../../ApiServices/services/AppointmentService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';

const HolidayManagement: React.FC = () => {
  const [holidays, setHolidays] = useState<IHolidayDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<IHolidayDto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());

  const [formData, setFormData] = useState<ICreateHolidayDto & IUpdateHolidayDto>({
    name: '',
    date: '',
    isRecurring: false,
    countryCode: 'TR',
  });

  useEffect(() => {
    loadHolidays();
  }, [filterYear]);

  const loadHolidays = async () => {
    try {
      setLoading(true);
      const startDate = new Date(filterYear, 0, 1);
      const endDate = new Date(filterYear, 11, 31, 23, 59, 59);
      const data = await appointmentService.getHolidays(startDate, endDate);
      setHolidays(data || []);
    } catch (error) {
      console.error('Error loading holidays:', error);
      toast.error('Tatiller yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingHoliday(null);
    setFormData({
      name: '',
      date: '',
      isRecurring: false,
      countryCode: 'TR',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (holiday: IHolidayDto) => {
    setEditingHoliday(holiday);
    const date = new Date(holiday.date);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    setFormData({
      name: holiday.name,
      date: dateStr,
      isRecurring: holiday.isRecurring,
      countryCode: holiday.countryCode,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (holiday: IHolidayDto) => {
    if (!confirm(`"${holiday.name}" tatilini silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      await appointmentService.deleteHoliday(holiday.id);
      toast.success('Tatil silindi');
      loadHolidays();
    } catch (error: any) {
      console.error('Error deleting holiday:', error);
      toast.error(error.message || 'Tatil silinirken hata oluştu');
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.date) {
      toast.error('Lütfen tüm gerekli alanları doldurun');
      return;
    }

    try {
      setSaving(true);
      if (editingHoliday) {
        await appointmentService.updateHoliday(editingHoliday.id, formData);
        toast.success('Tatil güncellendi');
      } else {
        await appointmentService.createHoliday(formData as ICreateHolidayDto);
        toast.success('Tatil eklendi');
      }
      setIsModalOpen(false);
      loadHolidays();
    } catch (error: any) {
      console.error('Error saving holiday:', error);
      toast.error(error.message || 'Tatil kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const filteredHolidays = holidays.filter(holiday => {
    const matchesSearch = holiday.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const years = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - 5 + i);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tatil Yönetimi</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Tatilleri ekleyin, düzenleyin ve yönetin</p>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1">
                <Input
                  placeholder="Tatil ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="year-filter">Yıl:</Label>
                <select
                  id="year-filter"
                  value={filterYear}
                  onChange={(e) => setFilterYear(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Tatil
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredHolidays.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">Tatil bulunmuyor</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHolidays.map((holiday) => {
                const holidayDate = new Date(holiday.date);
                return (
                  <div
                    key={holiday.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{holiday.name}</h3>
                          {holiday.isRecurring && (
                            <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-400">
                              Tekrarlayan
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {holiday.countryCode}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {holidayDate.toLocaleDateString('tr-TR', { 
                            day: '2-digit', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(holiday)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(holiday)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingHoliday ? 'Tatil Düzenle' : 'Yeni Tatil Ekle'}</DialogTitle>
            <DialogDescription>
              {editingHoliday ? 'Tatil bilgilerini güncelleyin' : 'Yeni bir tatil ekleyin'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Tatil Adı *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: Yılbaşı"
                className="border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <Label htmlFor="date">Tarih *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <Label htmlFor="countryCode">Ülke Kodu</Label>
              <Input
                id="countryCode"
                value={formData.countryCode}
                onChange={(e) => setFormData({ ...formData, countryCode: e.target.value || 'TR' })}
                placeholder="TR"
                maxLength={10}
                className="border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
              <div className="space-y-0.5">
                <Label htmlFor="isRecurring" className="text-base font-semibold">
                  Tekrarlayan Tatil
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Her yıl aynı tarihte tekrarlanır
                </p>
              </div>
              <Switch
                id="isRecurring"
                checked={formData.isRecurring || false}
                onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
            >
              İptal
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                editingHoliday ? 'Güncelle' : 'Ekle'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HolidayManagement;

