import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Award, Calendar, Clock, Star, TrendingUp, CheckCircle2, Plus, Edit, Trash2, Eye, Upload, X, MapPin, Building2, GraduationCap, User } from 'lucide-react';
import { toast } from 'sonner';
import projectReferenceService from '../../ApiServices/services/ProjectReferenceService';
import type { ProjectReferenceDto, CreateProjectReferenceDto } from '../../ApiServices/services/ProjectReferenceService';
import { tablePreferenceService } from '../../ApiServices/services';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { DataTable, type ColumnDef, type TablePreferenceState } from '../../components/ui/DataTable';
import type { TablePreferenceDto } from '../../ApiServices/types/TablePreferenceTypes';
import { format } from 'date-fns';
import { API_ROUTES } from '../../ApiServices/config/api.config';

const PROJECT_REFERENCE_TABLE_KEY = 'admin-project-reference-list';

const ProjectReferenceManagement: React.FC = () => {
  const [projectReferences, setProjectReferences] = useState<ProjectReferenceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectReferenceDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tablePreferences, setTablePreferences] = useState<TablePreferenceDto | null>(null);
  const [preferenceLoaded, setPreferenceLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'tr' | 'de' | 'en' | 'ar'>('tr');

  const [formData, setFormData] = useState<CreateProjectReferenceDto>({
    title: '',
    titleDe: '',
    titleEn: '',
    titleAr: '',
    description: '',
    descriptionDe: '',
    descriptionEn: '',
    descriptionAr: '',
    clientName: '',
    country: '',
    documentType: '',
    documentTypeDe: '',
    documentTypeEn: '',
    documentTypeAr: '',
    university: '',
    applicationDate: undefined,
    approvalDate: undefined,
    processingDays: undefined,
    documentImageUrl: '',
    status: '',
    statusDe: '',
    statusEn: '',
    statusAr: '',
    highlights: '',
    highlightsDe: '',
    highlightsEn: '',
    highlightsAr: '',
    isActive: true,
    isFeatured: false,
    displayOrder: 0,
  });

  useEffect(() => {
    loadProjectReferences();
  }, []);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const pref = await tablePreferenceService.getTablePreference(PROJECT_REFERENCE_TABLE_KEY);
        setTablePreferences(pref);
      } catch (error) {
        console.error('Project reference table preferences could not be loaded:', error);
      } finally {
        setPreferenceLoaded(true);
      }
    };

    loadPreferences();
  }, []);

  const loadProjectReferences = async () => {
    try {
      setLoading(true);
      const data = await projectReferenceService.getAllProjectReferences();
      setProjectReferences(data);
    } catch (error: any) {
      console.error('Error loading project references:', error);
      toast.error(error.message || 'Proje referansları yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setSelectedProject(null);
    setFormData({
      title: '',
      titleDe: '',
      titleEn: '',
      titleAr: '',
      description: '',
      descriptionDe: '',
      descriptionEn: '',
      descriptionAr: '',
      clientName: '',
      country: '',
      documentType: '',
      documentTypeDe: '',
      documentTypeEn: '',
      documentTypeAr: '',
      university: '',
      applicationDate: undefined,
      approvalDate: undefined,
      processingDays: undefined,
      documentImageUrl: '',
      status: '',
      statusDe: '',
      statusEn: '',
      statusAr: '',
      highlights: '',
      highlightsDe: '',
      highlightsEn: '',
      highlightsAr: '',
      isActive: true,
      isFeatured: false,
      displayOrder: 0,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (project: ProjectReferenceDto) => {
    setSelectedProject(project);
    setFormData({
      title: project.title,
      titleDe: project.titleDe || '',
      titleEn: project.titleEn || '',
      titleAr: project.titleAr || '',
      description: project.description,
      descriptionDe: project.descriptionDe || '',
      descriptionEn: project.descriptionEn || '',
      descriptionAr: project.descriptionAr || '',
      clientName: project.clientName || '',
      country: project.country || '',
      documentType: project.documentType || '',
      documentTypeDe: project.documentTypeDe || '',
      documentTypeEn: project.documentTypeEn || '',
      documentTypeAr: project.documentTypeAr || '',
      university: project.university || '',
      applicationDate: project.applicationDate,
      approvalDate: project.approvalDate,
      processingDays: project.processingDays,
      documentImageUrl: project.documentImageUrl || '',
      status: project.status || '',
      statusDe: project.statusDe || '',
      statusEn: project.statusEn || '',
      statusAr: project.statusAr || '',
      highlights: project.highlights || '',
      highlightsDe: project.highlightsDe || '',
      highlightsEn: project.highlightsEn || '',
      highlightsAr: project.highlightsAr || '',
      isActive: project.isActive,
      isFeatured: project.isFeatured,
      displayOrder: project.displayOrder,
    });
    setIsModalOpen(true);
  };

  const handleView = (project: ProjectReferenceDto) => {
    setSelectedProject(project);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (rows: ProjectReferenceDto[]) => {
    if (!confirm(`${rows.length} proje referansını silmek istediğinize emin misiniz?`)) return;

    try {
      await Promise.all(rows.map(row => projectReferenceService.deleteProjectReference(row.id)));
      toast.success(`${rows.length} proje referansı silindi`);
      loadProjectReferences();
    } catch (error) {
      console.error('Error deleting project references:', error);
      toast.error('Proje referansları silinirken hata oluştu');
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      toast.error('Lütfen başlık ve açıklama alanlarını doldurun');
      return;
    }

    console.log('Saving formData:', formData);
    console.log('documentImageUrl:', formData.documentImageUrl);

    try {
      setSaving(true);
      if (selectedProject) {
        await projectReferenceService.updateProjectReference(selectedProject.id, formData);
        toast.success('Proje referansı güncellendi');
      } else {
        await projectReferenceService.createProjectReference(formData);
        toast.success('Proje referansı oluşturuldu');
      }
      setIsModalOpen(false);
      loadProjectReferences();
    } catch (error: any) {
      console.error('Error saving project reference:', error);
      toast.error(error.message || 'Proje referansı kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (rows: ProjectReferenceDto[]) => {
    try {
      await Promise.all(rows.map(row => projectReferenceService.toggleProjectReferenceActive(row.id)));
      toast.success('Durum güncellendi');
      loadProjectReferences();
    } catch (error) {
      console.error('Error toggling active status:', error);
      toast.error('Durum güncellenirken hata oluştu');
    }
  };

  const handleToggleFeatured = async (rows: ProjectReferenceDto[]) => {
    try {
      await Promise.all(rows.map(row => projectReferenceService.toggleProjectReferenceFeatured(row.id)));
      toast.success('Öne çıkarma durumu güncellendi');
      loadProjectReferences();
    } catch (error) {
      console.error('Error toggling featured status:', error);
      toast.error('Öne çıkarma durumu güncellenirken hata oluştu');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen bir görsel dosyası seçin');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Görsel boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    try {
      setUploading(true);
      const result = await projectReferenceService.uploadImage(file);
      console.log('Upload result:', result);
      console.log('Setting documentImageUrl to:', result.imageUrl);
      setFormData(prev => {
        const newData = { ...prev, documentImageUrl: result.imageUrl };
        console.log('New formData after upload:', newData);
        return newData;
      });
      toast.success('Görsel yüklendi');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Görsel yüklenirken hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const handlePreferencesChange = useCallback(async (preferences: TablePreferenceState) => {
    try {
      if (!preferences.tableKey) {
        preferences.tableKey = PROJECT_REFERENCE_TABLE_KEY;
      }
      await tablePreferenceService.saveTablePreference(PROJECT_REFERENCE_TABLE_KEY, preferences as any);
    } catch (error) {
      console.error('Error saving table preferences:', error);
    }
  }, []);

  const parseHighlights = (highlights?: string): string[] => {
    if (!highlights) return [];
    try {
      const parsed = JSON.parse(highlights);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return highlights.split(',').map(h => h.trim()).filter(h => h);
    }
  };

  const columns: ColumnDef<ProjectReferenceDto>[] = useMemo(() => [
    {
      id: 'title',
      header: 'Başlık',
      headerKey: 'projectRef.column.title',
      translations: {
        tr: 'Başlık',
        de: 'Titel',
        en: 'Title',
        ar: 'العنوان',
      },
      accessorKey: 'title',
      width: '300px',
      filterType: 'text',
      filterPlaceholder: 'Başlık ara',
      sortable: true,
      cell: (value, row) => (
        <div className="flex items-center gap-3">
          {row.documentImageUrl ? (
            <img
              src={`${API_ROUTES.BASE_URL}${row.documentImageUrl}`}
              alt={row.title}
              className="w-12 h-12 object-cover rounded border border-gray-200 dark:border-gray-700"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 dark:text-white truncate">
            {row.title}
          </div>
          {row.isFeatured && (
            <Badge variant="secondary" className="mt-1">
              <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
              Öne Çıkan
            </Badge>
          )}
          </div>
        </div>
      ),
    },
    {
      id: 'clientName',
      header: 'Müşteri',
      headerKey: 'projectRef.column.clientName',
      translations: {
        tr: 'Müşteri',
        de: 'Kunde',
        en: 'Client',
        ar: 'العميل',
      },
      accessorKey: 'clientName',
      width: '150px',
      filterType: 'text',
      filterPlaceholder: 'Müşteri ara',
      sortable: true,
      cell: (value) => value || 'Anonim',
    },
    {
      id: 'country',
      header: 'Ülke',
      headerKey: 'projectRef.column.country',
      translations: {
        tr: 'Ülke',
        de: 'Land',
        en: 'Country',
        ar: 'البلد',
      },
      accessorKey: 'country',
      width: '120px',
      filterType: 'text',
      filterPlaceholder: 'Ülke ara',
      sortable: true,
      cell: (value) => value || '-',
    },
    {
      id: 'documentType',
      header: 'Belge Türü',
      headerKey: 'projectRef.column.documentType',
      translations: {
        tr: 'Belge Türü',
        de: 'Dokumenttyp',
        en: 'Document Type',
        ar: 'نوع المستند',
      },
      accessorKey: 'documentType',
      width: '180px',
      filterType: 'text',
      filterPlaceholder: 'Belge türü ara',
      sortable: true,
      cell: (value) => value || '-',
    },
    {
      id: 'university',
      header: 'Üniversite',
      headerKey: 'projectRef.column.university',
      translations: {
        tr: 'Üniversite',
        de: 'Universität',
        en: 'University',
        ar: 'الجامعة',
      },
      accessorKey: 'university',
      width: '200px',
      filterType: 'text',
      filterPlaceholder: 'Üniversite ara',
      sortable: true,
      cell: (value) => value || '-',
    },
    {
      id: 'processingDays',
      header: 'İşlem Süresi',
      headerKey: 'projectRef.column.processingDays',
      translations: {
        tr: 'İşlem Süresi',
        de: 'Bearbeitungszeit',
        en: 'Processing Time',
        ar: 'وقت المعالجة',
      },
      accessorKey: 'processingDays',
      width: '130px',
      sortable: true,
      cell: (value) => value ? (
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-gray-400" />
          {value} Gün
        </div>
      ) : '-',
    },
    {
      id: 'status',
      header: 'Durum',
      headerKey: 'projectRef.column.status',
      translations: {
        tr: 'Durum',
        de: 'Status',
        en: 'Status',
        ar: 'الحالة',
      },
      accessorKey: 'status',
      width: '140px',
      filterType: 'text',
      filterPlaceholder: 'Durum ara',
      sortable: true,
      cell: (value) => value ? (
        <Badge variant="default" className="bg-green-600">
          {value as string}
        </Badge>
      ) : '-',
    },
    {
      id: 'isActive',
      header: 'Aktif',
      headerKey: 'projectRef.column.active',
      translations: {
        tr: 'Aktif',
        de: 'Aktiv',
        en: 'Active',
        ar: 'نشط',
      },
      accessorKey: 'isActive',
      width: '100px',
      filterType: 'list',
      filterOptions: [
        { label: 'Aktif', value: 'true' },
        { label: 'Pasif', value: 'false' },
      ],
      getFilterValue: (value) => String(value),
      sortable: true,
      cell: (value) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Aktif' : 'Pasif'}
        </Badge>
      ),
    },
  ], []);

  const stats = useMemo(() => {
    const total = projectReferences.length;
    const active = projectReferences.filter(p => p.isActive).length;
    const featured = projectReferences.filter(p => p.isFeatured).length;
    const avgDays = projectReferences.filter(p => p.processingDays).length > 0
      ? Math.round(
          projectReferences
            .filter(p => p.processingDays)
            .reduce((sum, p) => sum + (p.processingDays || 0), 0) /
          projectReferences.filter(p => p.processingDays).length
        )
      : 0;

    return { total, active, featured, avgDays };
  }, [projectReferences]);

  if (!preferenceLoaded) {
    return <div className="flex items-center justify-center h-64">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Başvuru Referansları
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Başarılı Denklik Belgesi Başvuruları
          </p>
        </div>
        <Button onClick={handleNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Yeni Başvuru Ekle
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Toplam</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <CheckCircle2 className="w-10 h-10 text-blue-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Aktif</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Öne Çıkan</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.featured}</p>
            </div>
            <Star className="w-10 h-10 text-yellow-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ort. İşlem</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.avgDays}</p>
              <p className="text-xs text-gray-500">Gün</p>
            </div>
            <Clock className="w-10 h-10 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Data Table */}
      <DataTable
        data={projectReferences}
        columns={columns}
        loading={loading}
        searchPlaceholder="Başlık, müşteri, ülke, belge türü ara..."
        pageSize={20}
        tableKey={PROJECT_REFERENCE_TABLE_KEY}
        initialPreferences={tablePreferences ? {
          tableKey: tablePreferences.tableKey,
          visibleColumns: tablePreferences.visibleColumns || columns.map(c => c.id),
          columnOrder: tablePreferences.columnOrder || columns.map(c => c.id),
          columnFilters: tablePreferences.columnFilters || {},
          sortConfig: {
            key: tablePreferences.sortConfig?.key || '',
            direction: tablePreferences.sortConfig?.direction || null,
          },
          pageSize: tablePreferences.pageSize || 20,
        } : undefined}
        onPreferencesChange={handlePreferencesChange}
        onEdit={handleEdit}
        onDelete={(rows) => handleDelete(rows)}
      />

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="!max-w-[98vw] !max-h-[98vh] !w-[98vw] !h-[98vh] overflow-hidden !flex !flex-col p-0 gap-0 !grid-cols-1">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <Award className="text-blue-600 dark:text-blue-400 w-7 h-7" />
              {selectedProject ? 'Başvuru Düzenle' : 'Yeni Başvuru Ekle'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Language Tabs */}
              <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setActiveTab('tr')}
                  className={`px-4 py-2 font-medium border-b-2 transition-all rounded-t-md ${
                    activeTab === 'tr'
                      ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-950/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  🇹🇷 Türkçe
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('de')}
                  className={`px-4 py-2 font-medium border-b-2 transition-all rounded-t-md ${
                    activeTab === 'de'
                      ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-950/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  🇩🇪 Deutsch
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('en')}
                  className={`px-4 py-2 font-medium border-b-2 transition-all rounded-t-md ${
                    activeTab === 'en'
                      ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-950/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  🇬🇧 English
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ar')}
                  className={`px-4 py-2 font-medium border-b-2 transition-all rounded-t-md ${
                    activeTab === 'ar'
                      ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-950/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  🇸🇦 العربية
                </button>
              </div>

              {/* Image Upload */}
              <div>
                <Label>Belge Görseli</Label>
               <div className="flex items-center gap-4 mt-2">
                 {formData.documentImageUrl && (
                   <div className="relative w-32 h-32">
                     <img
                       src={`${API_ROUTES.BASE_URL}${formData.documentImageUrl}`}
                       alt="Document preview"
                       className="w-full h-full object-cover rounded border"
                     />
                     <button
                       type="button"
                       onClick={() => setFormData(prev => ({ ...prev, documentImageUrl: '' }))}
                       className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                     >
                       <X className="w-4 h-4" />
                     </button>
                   </div>
                 )}
                 <div className="flex-1">
                   <input
                     type="file"
                     accept="image/*"
                     onChange={handleImageUpload}
                     className="hidden"
                     id="image-upload"
                     disabled={uploading}
                   />
                   <label htmlFor="image-upload">
                     <Button
                       type="button"
                       variant="outline"
                       disabled={uploading}
                       onClick={() => document.getElementById('image-upload')?.click()}
                     >
                       <Upload className="w-4 h-4 mr-2" />
                       {uploading ? 'Yükleniyor...' : formData.documentImageUrl ? 'Görseli Değiştir' : 'Görsel Yükle'}
                     </Button>
                   </label>
                   <p className="text-xs text-gray-500 mt-1">
                     JPG, PNG veya WEBP, max 5MB
                   </p>
                 </div>
               </div>
             </div>

             {/* Turkish Content */}
             {activeTab === 'tr' && (
                <div className="space-y-4">
                 <div>
                   <Label>Başlık (Türkçe) *</Label>
                   <Input
                     value={formData.title}
                     onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                     placeholder="Örn: Makine Mühendisliği Diploması Denkliği"
                     required
                   />
                 </div>

                 <div>
                   <Label>Açıklama (Türkçe) *</Label>
                   <Textarea
                     value={formData.description}
                     onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                     rows={3}
                     placeholder="Başvuru sürecinin detaylı açıklaması..."
                     required
                   />
                 </div>

                 <div>
                   <Label>Belge Türü (Türkçe)</Label>
                   <Input
                     value={formData.documentType}
                     onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value }))}
                     placeholder="Örn: Mühendislik Diploması"
                   />
                 </div>

                 <div>
                   <Label>Durum (Türkçe)</Label>
                   <Input
                     value={formData.status}
                     onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                     placeholder="Örn: Onaylandı, Hızlı Süreç"
                   />
                 </div>

                 <div>
                   <Label>Öne Çıkan Özellikler (Türkçe)</Label>
                   <Textarea
                     value={formData.highlights}
                     onChange={(e) => setFormData(prev => ({ ...prev, highlights: e.target.value }))}
                     rows={2}
                     placeholder='Virgül ile ayırın: Hızlı işlem, Ek belge gerektirmedi'
                   />
                   <p className="text-xs text-gray-500 mt-1">
                     Her özelliği virgül ile ayırın
                   </p>
                 </div>
               </div>
             )}

            {/* German Content */}
            {activeTab === 'de' && (
                <div className="space-y-4">
                <div>
                  <Label>Titel (Deutsch)</Label>
                  <Input
                    value={formData.titleDe}
                    onChange={(e) => setFormData(prev => ({ ...prev, titleDe: e.target.value }))}
                    placeholder="z.B.: Anerkennung Maschinenbau-Diplom"
                  />
                </div>

                <div>
                  <Label>Beschreibung (Deutsch)</Label>
                  <Textarea
                    value={formData.descriptionDe}
                    onChange={(e) => setFormData(prev => ({ ...prev, descriptionDe: e.target.value }))}
                    rows={3}
                    placeholder="Detaillierte Beschreibung des Bewerbungsprozesses..."
                  />
                </div>

                <div>
                  <Label>Dokumenttyp (Deutsch)</Label>
                  <Input
                    value={formData.documentTypeDe}
                    onChange={(e) => setFormData(prev => ({ ...prev, documentTypeDe: e.target.value }))}
                    placeholder="z.B.: Ingenieurabschluss"
                  />
                </div>

                <div>
                  <Label>Status (Deutsch)</Label>
                  <Input
                    value={formData.statusDe}
                    onChange={(e) => setFormData(prev => ({ ...prev, statusDe: e.target.value }))}
                    placeholder="z.B.: Genehmigt, Schneller Prozess"
                  />
                </div>

                <div>
                  <Label>Highlights (Deutsch)</Label>
                  <Textarea
                    value={formData.highlightsDe}
                    onChange={(e) => setFormData(prev => ({ ...prev, highlightsDe: e.target.value }))}
                    rows={2}
                    placeholder='Mit Komma trennen: Schnelle Bearbeitung'
                  />
                </div>
              </div>
            )}

            {/* English Content */}
            {activeTab === 'en' && (
              <div className="space-y-4">
                  <div>
                    <Label>Title (English)</Label>
                  <Input
                    value={formData.titleEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                    placeholder="e.g.: Mechanical Engineering Degree Recognition"
                  />
                  </div>

                  <div>
                    <Label>Description (English)</Label>
                  <Textarea
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
                      rows={3}
                    placeholder="Detailed description of the application process..."
                  />
                  </div>

                  <div>
                    <Label>Document Type (English)</Label>
                  <Input
                    value={formData.documentTypeEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, documentTypeEn: e.target.value }))}
                    placeholder="e.g.: Engineering Degree"
                  />
                  </div>

                  <div>
                    <Label>Status (English)</Label>
                  <Input
                    value={formData.statusEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, statusEn: e.target.value }))}
                    placeholder="e.g.: Approved, Fast Process"
                  />
                  </div>

                  <div>
                    <Label>Highlights (English)</Label>
                  <Textarea
                    value={formData.highlightsEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, highlightsEn: e.target.value }))}
                    rows={2}
                    placeholder='Separate with commas: Fast processing, No additional documents required'
                  />
                  </div>
              </div>
            )}

            {/* Arabic Content */}
            {activeTab === 'ar' && (
              <div className="space-y-4" dir="rtl">
                  <div>
                    <Label>العنوان (عربي)</Label>
                  <Input
                    value={formData.titleAr}
                    onChange={(e) => setFormData(prev => ({ ...prev, titleAr: e.target.value }))}
                    placeholder="مثال: معادلة شهادة الهندسة الميكانيكية"
                      className="text-right"
                  />
                  </div>

                  <div>
                    <Label>الوصف (عربي)</Label>
                  <Textarea
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData(prev => ({ ...prev, descriptionAr: e.target.value }))}
                      rows={3}
                    placeholder="وصف تفصيلي لعملية التقديم..."
                      className="text-right"
                  />
                  </div>

                  <div>
                    <Label>نوع المستند (عربي)</Label>
                  <Input
                    value={formData.documentTypeAr}
                    onChange={(e) => setFormData(prev => ({ ...prev, documentTypeAr: e.target.value }))}
                    placeholder="مثال: شهادة الهندسة"
                    className="text-right"
                  />
                  </div>

                  <div>
                    <Label>الحالة (عربي)</Label>
                  <Input
                    value={formData.statusAr}
                    onChange={(e) => setFormData(prev => ({ ...prev, statusAr: e.target.value }))}
                    placeholder="مثال: تمت الموافقة، معالجة سريعة"
                    className="text-right"
                  />
                  </div>

                  <div>
                    <Label>المميزات (عربي)</Label>
                  <Textarea
                    value={formData.highlightsAr}
                    onChange={(e) => setFormData(prev => ({ ...prev, highlightsAr: e.target.value }))}
                    rows={2}
                    placeholder='افصل بالفواصل: معالجة سريعة، لا حاجة لمستندات إضافية'
                    className="text-right"
                  />
                  </div>
              </div>
            )}

              {/* General Information */}
              <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Genel Bilgiler
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Müşteri Adı</Label>
                  <Input
                    value={formData.clientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder="A. Y. (Anonim kalabilir)"
                  />
                  </div>

                  <div>
                    <Label>Ülke</Label>
                  <Input
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="Örn: Türkiye, Suriye"
                  />
                  </div>

                  <div>
                    <Label>Üniversite/Kurum</Label>
                  <Input
                    value={formData.university}
                    onChange={(e) => setFormData(prev => ({ ...prev, university: e.target.value }))}
                    placeholder="Örn: İstanbul Teknik Üniversitesi"
                  />
                  </div>

                  <div>
                    <Label>İşlem Süresi (Gün)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.processingDays || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, processingDays: e.target.value ? parseInt(e.target.value) : undefined }))}
                    placeholder="Örn: 7"
                  />
                  </div>
              </div>
            </div>

            {/* Dates */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Tarihler
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Başvuru Tarihi</Label>
                  <Input
                    type="date"
                    value={formData.applicationDate ? formData.applicationDate.split('T')[0] : ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, applicationDate: e.target.value ? new Date(e.target.value).toISOString() : undefined }))}
                  />
                  </div>

                  <div>
                    <Label>Onay Tarihi</Label>
                  <Input
                    type="date"
                    value={formData.approvalDate ? formData.approvalDate.split('T')[0] : ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, approvalDate: e.target.value ? new Date(e.target.value).toISOString() : undefined }))}
                  />
                  </div>
              </div>
            </div>

            {/* Settings */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Ayarlar
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-5 h-5 rounded"
                    />
                    <Label htmlFor="isActive" className="cursor-pointer">
                      Aktif (Public sayfada görünsün)
                    </Label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="w-5 h-5 rounded"
                    />
                    <Label htmlFor="isFeatured" className="cursor-pointer">
                      Öne Çıkan
                    </Label>
                  </div>

                  <div>
                    <Label>Görüntülenme Sırası</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                  </div>
              </div>
            </div>
          </div>
        </div>

           <DialogFooter className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800 flex-shrink-0 flex gap-3">
             <Button variant="outline" onClick={() => setIsModalOpen(false)}>
               İptal
             </Button>
             <Button onClick={handleSave} disabled={saving}>
               {saving ? 'Kaydediliyor...' : selectedProject ? 'Güncelle' : 'Oluştur'}
             </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProject?.title}</DialogTitle>
          </DialogHeader>

          {selectedProject && (
            <div className="space-y-4">
              {selectedProject.documentImageUrl && (
                <div className="flex justify-center">
                  <img
                    src={`${API_ROUTES.BASE_URL}${selectedProject.documentImageUrl}`}
                    alt={selectedProject.title}
                    className="max-w-full h-auto rounded border"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Müşteri</div>
                  <div className="font-medium">{selectedProject.clientName || 'Anonim'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Ülke</div>
                  <div className="font-medium">{selectedProject.country || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Belge Türü</div>
                  <div className="font-medium">{selectedProject.documentType || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Üniversite</div>
                  <div className="font-medium">{selectedProject.university || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Başvuru Tarihi</div>
                  <div className="font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {selectedProject.applicationDate ? format(new Date(selectedProject.applicationDate), 'dd.MM.yyyy') : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Onay Tarihi</div>
                  <div className="font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {selectedProject.approvalDate ? format(new Date(selectedProject.approvalDate), 'dd.MM.yyyy') : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">İşlem Süresi</div>
                  <div className="font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {selectedProject.processingDays ? `${selectedProject.processingDays} Gün` : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Durum</div>
                  <div>
                    {selectedProject.status ? (
                      <Badge>{selectedProject.status}</Badge>
                    ) : '-'}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Açıklama</div>
                <div className="text-gray-700 dark:text-gray-300">{selectedProject.description}</div>
              </div>

              {selectedProject.highlights && (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Öne Çıkan Özellikler</div>
                  <div className="flex flex-wrap gap-2">
                    {parseHighlights(selectedProject.highlights).map((highlight, idx) => (
                      <Badge key={idx} variant="secondary">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectReferenceManagement;
