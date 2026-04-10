import React, { useState, useEffect, useMemo } from 'react';
import { Star, User, MapPin, Building2, Image as ImageIcon, Plus, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import testimonialService, { type ITestimonialDto, type ICreateTestimonialDto, type IUpdateTestimonialDto } from '../../ApiServices/services/TestimonialService';
import { tablePreferenceService } from '../../ApiServices/services';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { DataTable, type ColumnDef, type TablePreferenceState } from '../../components/ui/DataTable';
import type { TablePreferenceDto } from '../../ApiServices/types/TablePreferenceTypes';
import { format } from 'date-fns';
import { API_ROUTES } from '../../ApiServices/config/api.config';

const TESTIMONIAL_TABLE_KEY = 'admin-testimonial-list';

const TestimonialManagement: React.FC = () => {
  const [testimonials, setTestimonials] = useState<ITestimonialDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTestimonial, setSelectedTestimonial] = useState<ITestimonialDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tablePreferences, setTablePreferences] = useState<TablePreferenceDto | null>(null);
  const [preferenceLoaded, setPreferenceLoaded] = useState(false);

  const [formData, setFormData] = useState<ICreateTestimonialDto & IUpdateTestimonialDto>({
    name: '',
    role: '',
    location: '',
    company: '',
    content: '',
    contentDe: '',
    contentEn: '',
    contentAr: '',
    rating: 5,
    imageUrl: '',
    isActive: true,
    displayOrder: 0,
  });

  useEffect(() => {
    loadTestimonials();
  }, []);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const pref = await tablePreferenceService.getTablePreference(TESTIMONIAL_TABLE_KEY);
        setTablePreferences(pref);
      } catch (error) {
        console.error('Testimonial table preferences could not be loaded:', error);
      } finally {
        setPreferenceLoaded(true);
      }
    };

    loadPreferences();
  }, []);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const result = await testimonialService.getAllTestimonials({
        page: 1,
        pageSize: 1000,
      });
      setTestimonials(result.items || []);
    } catch (error: any) {
      console.error('Error loading testimonials:', error);
      toast.error(error.message || 'Referanslar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setSelectedTestimonial(null);
    setFormData({
      name: '',
      role: '',
      location: '',
      company: '',
      content: '',
      contentDe: '',
      contentEn: '',
      contentAr: '',
      rating: 5,
      imageUrl: '',
      isActive: true,
      displayOrder: 0,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (testimonial: ITestimonialDto) => {
    setSelectedTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      role: testimonial.role || '',
      location: testimonial.location || '',
      company: testimonial.company || '',
      content: testimonial.content,
      contentDe: testimonial.contentDe || '',
      contentEn: testimonial.contentEn || '',
      contentAr: testimonial.contentAr || '',
      rating: testimonial.rating,
      imageUrl: testimonial.imageUrl || '',
      isActive: testimonial.isActive,
      displayOrder: testimonial.displayOrder,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (rows: ITestimonialDto[]) => {
    if (!confirm(`${rows.length} referansı silmek istediğinize emin misiniz?`)) return;

    try {
      await Promise.all(rows.map(row => testimonialService.deleteTestimonial(row.id)));
      toast.success(`${rows.length} referans silindi`);
      loadTestimonials();
    } catch (error) {
      console.error('Error deleting testimonials:', error);
      toast.error('Referanslar silinirken hata oluştu');
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.content) {
      toast.error('Lütfen isim ve içerik alanlarını doldurun');
      return;
    }

    try {
      setSaving(true);
      if (selectedTestimonial) {
        await testimonialService.updateTestimonial(selectedTestimonial.id, formData);
        toast.success('Referans güncellendi');
      } else {
        await testimonialService.createTestimonial(formData);
        toast.success('Referans oluşturuldu');
      }
      setIsModalOpen(false);
      loadTestimonials();
    } catch (error: any) {
      console.error('Error saving testimonial:', error);
      toast.error(error.message || 'Referans kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Sadece resim dosyaları yüklenebilir');
      return;
    }

    try {
      setUploading(true);
      const result = await testimonialService.uploadImage(file);
      setFormData({ ...formData, imageUrl: result.imageUrl });
      toast.success('Resim yüklendi');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Resim yüklenirken hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const toggleActive = async (id: number) => {
    try {
      await testimonialService.toggleActive(id);
      toast.success('Durum güncellendi');
      loadTestimonials();
    } catch (error: any) {
      console.error('Error toggling active:', error);
      toast.error(error.message || 'Durum güncellenirken hata oluştu');
    }
  };

  const columns: ColumnDef<ITestimonialDto>[] = useMemo(
    () => [
      {
        id: 'imageUrl',
        header: 'Resim',
        headerKey: 'admin.testimonial.table.image',
        translations: {
          tr: 'Resim',
          de: 'Bild',
          en: 'Image',
          ar: 'الصورة',
        },
        accessorKey: 'imageUrl',
        width: '100px',
        cell: (value, row) => (
          value ? (
            <img 
              src={`${API_ROUTES.BASE_URL}${value}`} 
              alt={row.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-400" />
            </div>
          )
        ),
      },
      {
        id: 'name',
        header: 'İsim',
        headerKey: 'admin.testimonial.table.name',
        translations: {
          tr: 'İsim',
          de: 'Name',
          en: 'Name',
          ar: 'الاسم',
        },
        accessorKey: 'name',
        width: '200px',
        filterType: 'text',
        filterPlaceholder: 'İsim ara',
        sortable: true,
        cell: (value, row) => (
          <div className="text-sm">
            <div className="font-medium">{value as string}</div>
            {row.role && (
              <div className="text-xs text-muted-foreground mt-1">
                {row.role}
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'location',
        header: 'Lokasyon',
        headerKey: 'admin.testimonial.table.location',
        translations: {
          tr: 'Lokasyon',
          de: 'Standort',
          en: 'Location',
          ar: 'الموقع',
        },
        accessorKey: 'location',
        width: '150px',
        filterType: 'text',
        filterPlaceholder: 'Lokasyon ara',
        sortable: true,
        cell: (value, row) => (
          <div className="text-sm">
            {value && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                {value as string}
              </div>
            )}
            {row.company && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Building2 className="w-3 h-3" />
                {row.company}
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'content',
        header: 'İçerik',
        headerKey: 'admin.testimonial.table.content',
        translations: {
          tr: 'İçerik',
          de: 'Inhalt',
          en: 'Content',
          ar: 'المحتوى',
        },
        accessorKey: 'content',
        width: '350px',
        filterType: 'text',
        filterPlaceholder: 'İçerik ara',
        sortable: true,
        cell: (value) => (
          <div className="text-sm text-muted-foreground line-clamp-2" title={value as string}>
            {value as string}
          </div>
        ),
      },
      {
        id: 'rating',
        header: 'Puan',
        headerKey: 'admin.testimonial.table.rating',
        translations: {
          tr: 'Puan',
          de: 'Bewertung',
          en: 'Rating',
          ar: 'التقييم',
        },
        accessorKey: 'rating',
        width: '120px',
        sortable: true,
        cell: (value) => (
          <div className="flex items-center gap-1">
            {[...Array(value as number)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        ),
      },
      {
        id: 'isActive',
        header: 'Durum',
        headerKey: 'admin.testimonial.table.status',
        translations: {
          tr: 'Durum',
          de: 'Status',
          en: 'Status',
          ar: 'الحالة',
        },
        accessorKey: 'isActive',
        width: '120px',
        filterType: 'list',
        filterOptions: [
          { label: 'Aktif', value: 'true' },
          { label: 'Pasif', value: 'false' },
        ],
        getFilterValue: (value) => String(value),
        sortable: true,
        cell: (value, row) => (
          <div className="flex items-center gap-2">
            {value ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle2 className="mr-1 w-3 h-3" /> Aktif
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400">
                <XCircle className="mr-1 w-3 h-3" /> Pasif
              </Badge>
            )}
          </div>
        ),
      },
      {
        id: 'displayOrder',
        header: 'Sıra',
        headerKey: 'admin.testimonial.table.order',
        translations: {
          tr: 'Sıra',
          de: 'Reihenfolge',
          en: 'Order',
          ar: 'الترتيب',
        },
        accessorKey: 'displayOrder',
        width: '80px',
        sortable: true,
        cell: (value) => (
          <Badge variant="secondary">{value}</Badge>
        ),
      },
      {
        id: 'createdAt',
        header: 'Oluşturma',
        headerKey: 'admin.testimonial.table.created',
        translations: {
          tr: 'Oluşturma',
          de: 'Erstellt',
          en: 'Created',
          ar: 'تاريخ الإنشاء',
        },
        accessorKey: 'createdAt',
        width: '180px',
        filterType: 'text',
        filterPlaceholder: 'Tarih ara',
        sortable: true,
        cell: (value) => (
          <div className="flex flex-col">
            <span className="text-sm">{format(new Date(value as string), 'dd.MM.yyyy')}</span>
            <span className="text-xs text-muted-foreground">{format(new Date(value as string), 'HH:mm')}</span>
          </div>
        ),
      },
    ],
    []
  );

  const stats = useMemo(() => {
    const active = testimonials.filter(t => t.isActive);
    const inactive = testimonials.filter(t => !t.isActive);

    return { total: testimonials.length, active: active.length, inactive: inactive.length };
  }, [testimonials]);

  return (
    <div className="p-6 space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Star className="text-yellow-600 dark:text-yellow-400" />
            Referans Yönetimi
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Müşteri referanslarını ve yorumlarını yönetin
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Card className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Star className="text-blue-600 dark:text-blue-400 w-5 h-5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Toplam</p>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-400">{stats.total}</p>
              </div>
            </div>
          </Card>
          <Card className="px-4 py-3 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-green-600 dark:text-green-400 w-5 h-5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Aktif</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-400">{stats.active}</p>
              </div>
            </div>
          </Card>
          <Button onClick={handleNew} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Referans
          </Button>
        </div>
      </div>

      {/* Data Table */}
      {preferenceLoaded && (
        <DataTable
          data={testimonials}
          columns={columns}
          searchPlaceholder="İsim, rol, lokasyon veya içerik ara..."
          pageSize={20}
          loading={loading}
          tableKey={TESTIMONIAL_TABLE_KEY}
          initialPreferences={tablePreferences ? {
            tableKey: tablePreferences.tableKey,
            visibleColumns: tablePreferences.visibleColumns || columns.map(c => c.id),
            columnOrder: tablePreferences.columnOrder || columns.map(c => c.id),
            columnFilters: tablePreferences.columnFilters || {},
            sortConfig: {
              key: tablePreferences.sortConfig?.key || 'displayOrder',
              direction: (tablePreferences.sortConfig?.direction as 'asc' | 'desc' | null) || 'asc',
            },
            pageSize: tablePreferences.pageSize || 20,
          } : undefined}
          onPreferencesChange={async (state: TablePreferenceState) => {
            try {
              await tablePreferenceService.saveTablePreference(TESTIMONIAL_TABLE_KEY, {
                tableKey: TESTIMONIAL_TABLE_KEY,
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
          onEdit={(row) => handleEdit(row)}
          onDelete={(rows) => handleDelete(rows)}
        />
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Star className="text-yellow-600 dark:text-yellow-400" />
              {selectedTestimonial ? 'Referans Düzenle' : 'Yeni Referans'}
            </DialogTitle>
            <DialogDescription>
              Referans bilgilerini girin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Image Upload */}
            <div>
              <Label htmlFor="image">Profil Resmi</Label>
              <div className="flex items-center gap-4 mt-2">
                {formData.imageUrl ? (
                  <img 
                    src={`${API_ROUTES.BASE_URL}${formData.imageUrl}`} 
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maksimum 5MB, JPG, PNG, GIF veya WebP
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">İsim *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Müşteri adı"
                />
              </div>

              <div>
                <Label htmlFor="role">Rol/Unvan</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Örn: Ausbildung Öğrencisi"
                />
              </div>

              <div>
                <Label htmlFor="location">Lokasyon</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Örn: Berlin"
                />
              </div>

              <div>
                <Label htmlFor="company">Şirket</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Şirket adı"
                />
              </div>
            </div>

            {/* Content - Turkish */}
            <div>
              <Label htmlFor="content">İçerik (Türkçe) *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Müşterinin yorumu (Türkçe)"
                rows={4}
              />
            </div>

            {/* Content - Other Languages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="contentDe">İçerik (Almanca)</Label>
                <Textarea
                  id="contentDe"
                  value={formData.contentDe}
                  onChange={(e) => setFormData({ ...formData, contentDe: e.target.value })}
                  placeholder="Almanca içerik"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="contentEn">İçerik (İngilizce)</Label>
                <Textarea
                  id="contentEn"
                  value={formData.contentEn}
                  onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                  placeholder="İngilizce içerik"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="contentAr">İçerik (Arapça)</Label>
                <Textarea
                  id="contentAr"
                  value={formData.contentAr}
                  onChange={(e) => setFormData({ ...formData, contentAr: e.target.value })}
                  placeholder="Arapça içerik"
                  rows={3}
                />
              </div>
            </div>

            {/* Rating, Order, Active */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="rating">Puan (1-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min={1}
                  max={5}
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) || 5 })}
                />
              </div>

              <div>
                <Label htmlFor="displayOrder">Görüntüleme Sırası</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="isActive" className="cursor-pointer">Aktif</Label>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving || uploading}>
              İptal
            </Button>
            <Button onClick={handleSave} disabled={saving || uploading}>
              {saving ? 'Kaydediliyor...' : selectedTestimonial ? 'Güncelle' : 'Oluştur'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestimonialManagement;

