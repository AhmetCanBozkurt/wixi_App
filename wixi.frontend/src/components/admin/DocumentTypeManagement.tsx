import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { 
  FileText, 
  Plus,
  Edit,
  Trash2,
  Loader2,
  Search,
  BookOpen,
  Save,
  X
} from 'lucide-react';
import { documentService } from '../../ApiServices/services';
import type { IDocumentTypeDto } from '../../ApiServices/types/DocumentTypes';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

type DocumentTypeFormState = {
  code: string;
  educationTypeId?: number;
  nameTr: string;
  nameEn: string;
  nameDe: string;
  nameAr: string;
  noteTr: string;
  allowedFileTypes: string;
  maxFileSizeBytes?: number;
  isRequired: boolean;
  requiresApproval: boolean;
  isActive: boolean;
  displayOrder?: number;
};

const MB_IN_BYTES = 1024 * 1024;

const defaultFormState: DocumentTypeFormState = {
  code: '',
  nameTr: '',
  nameEn: '',
  nameDe: '',
  nameAr: '',
  noteTr: '',
  allowedFileTypes: '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  maxFileSizeBytes: 5 * MB_IN_BYTES,
  isRequired: false,
  requiresApproval: true,
  isActive: true,
  educationTypeId: undefined,
  displayOrder: undefined,
};

const normalizeFileTypesForApi = (value: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const formatted = value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((part) => (part.startsWith('.') ? part.toLowerCase() : `.${part.toLowerCase()}`));

  return formatted.length ? formatted.join(',') : undefined;
};

const DocumentTypeManagement: React.FC = () => {
  const [documentTypes, setDocumentTypes] = useState<IDocumentTypeDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEducation, setFilterEducation] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<IDocumentTypeDto | null>(null);
  const [editingDocumentType, setEditingDocumentType] = useState<DocumentTypeFormState>(defaultFormState);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    loadDocumentTypes();
  }, []);

  const loadDocumentTypes = async () => {
    try {
      setLoading(true);
      console.log('📄 Loading document types...');
      const response: any = await documentService.getAllDocumentTypes();
      console.log('📄 Raw API Response:', response);
      
      // Parse API response - handle wrapper object {success, data, count}
      const data = response?.data || response || [];
      console.log('📄 Parsed document types:', data);
      
      // Map backend response to frontend format with multi-language support
      const mappedData = Array.isArray(data) ? data.map((doc: any) => ({
        ...doc,
        // Ensure multi-language fields exist
        name_TR: doc.name_TR || doc.Name_TR || doc.name || '',
        name_EN: doc.name_EN || doc.Name_EN || doc.nameEn || '',
        name_DE: doc.name_DE || doc.Name_DE || '',
        name_AR: doc.name_AR || doc.Name_AR || '',
        description_TR: doc.description_TR || doc.Description_TR || '',
        description_EN: doc.description_EN || doc.Description_EN || '',
        description_DE: doc.description_DE || doc.Description_DE || '',
        description_AR: doc.description_AR || doc.Description_AR || '',
        note_TR: doc.note_TR || doc.Note_TR || doc.note || '',
        note_EN: doc.note_EN || doc.Note_EN || '',
        note_DE: doc.note_DE || doc.Note_DE || '',
        note_AR: doc.note_AR || doc.Note_AR || '',
        // Legacy fields for backward compatibility (default to TR)
        name: doc.name_TR || doc.Name_TR || doc.name || 'İsimsiz',
        nameEn: doc.name_EN || doc.Name_EN || doc.nameEn || '',
        note: doc.note_TR || doc.Note_TR || doc.note || ''
      })) : [];
      
      setDocumentTypes(mappedData);
    } catch (error) {
      console.error('❌ Error loading document types:', error);
      toast.error('Belge türleri yüklenirken hata oluştu');
      setDocumentTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const getEducationTypeName = (educationTypeId?: number) => {
    if (!educationTypeId) return 'Genel';
    const educationTypes: Record<number, string> = {
      1: 'Lisans',
      2: 'Yüksek Lisans',
      3: 'Meslek Okulu',
      4: 'Dil Eğitimi'
    };
    return educationTypes[educationTypeId] || 'Bilinmeyen';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Sınırsız';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handleAddNew = () => {
    setIsEditMode(false);
    setEditingDocumentType({
      ...defaultFormState,
      displayOrder: documentTypes.length + 1,
    });
    setSelectedDocumentType(null);
    setDialogOpen(true);
  };

  const handleEdit = (docType: IDocumentTypeDto) => {
    setIsEditMode(true);
    setSelectedDocumentType(docType);
    setEditingDocumentType({
      code: docType.code,
      educationTypeId: docType.educationTypeId,
      nameTr: docType.name_TR || docType.name || '',
      nameEn: docType.name_EN || docType.nameEn || '',
      nameDe: docType.name_DE || '',
      nameAr: docType.name_AR || '',
      noteTr: docType.note_TR || docType.note || '',
      allowedFileTypes: docType.allowedFileTypes || defaultFormState.allowedFileTypes,
      maxFileSizeBytes: docType.maxFileSizeBytes ?? defaultFormState.maxFileSizeBytes,
      isRequired: docType.isRequired,
      requiresApproval: docType.requiresApproval,
      isActive: docType.isActive ?? true,
      displayOrder: docType.displayOrder,
    });
    setDialogOpen(true);
  };

  const handleDelete = (docType: IDocumentTypeDto) => {
    setSelectedDocumentType(docType);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDocumentType) return;

    try {
      await documentService.deleteDocumentType(selectedDocumentType.id);
      await loadDocumentTypes();
      setDeleteDialogOpen(false);
      setSelectedDocumentType(null);
    } catch (error) {
      console.error('❌ Error deleting document type:', error);
      toast.error('Belge türü silinirken hata oluştu');
    }
  };

  const handleSave = async () => {
    if (!editingDocumentType.nameTr?.trim() || !editingDocumentType.code?.trim()) {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }

    setSaving(true);
    try {
      const normalizedCode = editingDocumentType.code.trim().toLowerCase();
      const fallbackName = editingDocumentType.nameTr.trim();
      const payload = {
        code: normalizedCode,
        name_TR: fallbackName,
        name_EN: (editingDocumentType.nameEn || fallbackName).trim(),
        name_DE: (editingDocumentType.nameDe || fallbackName).trim(),
        name_AR: (editingDocumentType.nameAr || fallbackName).trim(),
        note_TR: editingDocumentType.noteTr?.trim() || undefined,
        note_EN: selectedDocumentType?.note_EN,
        note_DE: selectedDocumentType?.note_DE,
        note_AR: selectedDocumentType?.note_AR,
        description_TR: selectedDocumentType?.description_TR,
        description_EN: selectedDocumentType?.description_EN,
        description_DE: selectedDocumentType?.description_DE,
        description_AR: selectedDocumentType?.description_AR,
        allowedFileTypes: normalizeFileTypesForApi(editingDocumentType.allowedFileTypes),
        maxFileSizeBytes: editingDocumentType.maxFileSizeBytes && editingDocumentType.maxFileSizeBytes > 0
          ? editingDocumentType.maxFileSizeBytes
          : undefined,
        isRequired: editingDocumentType.isRequired,
        requiresApproval: editingDocumentType.requiresApproval,
        educationTypeId: editingDocumentType.educationTypeId,
        isActive: editingDocumentType.isActive,
        displayOrder: editingDocumentType.displayOrder,
        iconName: selectedDocumentType?.iconName,
      };

      if (isEditMode && selectedDocumentType) {
        await documentService.updateDocumentType(selectedDocumentType.id, payload);
      } else {
        await documentService.createDocumentType({
          ...payload,
          displayOrder: editingDocumentType.displayOrder ?? documentTypes.length + 1,
        });
      }

      await loadDocumentTypes();
      setDialogOpen(false);
      setSelectedDocumentType(null);
      setEditingDocumentType({
        ...defaultFormState,
        displayOrder: documentTypes.length + 1,
      });
    } catch (error) {
      console.error('❌ Error saving document type:', error);
      toast.error('Belge türü kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const filteredDocumentTypes = Array.isArray(documentTypes)
    ? documentTypes.filter(doc => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = searchTerm === '' ||
          (doc.name_TR?.toLowerCase() || '').includes(searchLower) ||
          (doc.name_EN?.toLowerCase() || '').includes(searchLower) ||
          (doc.name_DE?.toLowerCase() || '').includes(searchLower) ||
          (doc.name_AR?.toLowerCase() || '').includes(searchLower) ||
          (doc.name?.toLowerCase() || '').includes(searchLower) ||
          (doc.nameEn?.toLowerCase() || '').includes(searchLower) ||
          (doc.code?.toLowerCase() || '').includes(searchLower);
        const matchesEducation = filterEducation === 'all' || 
          (doc.educationTypeId && doc.educationTypeId.toString() === filterEducation) ||
          (!doc.educationTypeId && filterEducation === 'all');
        return matchesSearch && matchesEducation;
      })
    : [];

  // Group by education type
  const groupedDocuments = filteredDocumentTypes.reduce((acc, doc) => {
    const eduType = getEducationTypeName(doc.educationTypeId);
    if (!acc[eduType]) {
      acc[eduType] = [];
    }
    acc[eduType].push(doc);
    return acc;
  }, {} as Record<string, IDocumentTypeDto[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Belge Türleri</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Eğitim türlerine göre belge türlerini yönetin</p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Yeni Belge Türü
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Belge türü ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>
            <Select value={filterEducation} onValueChange={setFilterEducation}>
              <SelectTrigger className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400">
                <SelectValue placeholder="Eğitim türü seç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="1">Lisans</SelectItem>
                <SelectItem value="2">Yüksek Lisans</SelectItem>
                <SelectItem value="3">Meslek Okulu</SelectItem>
                <SelectItem value="4">Dil Eğitimi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {documentTypes.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Belge Türü</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {[1, 2, 3, 4].map(eduType => (
          <Card key={eduType}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {documentTypes.filter(d => d.educationTypeId === eduType).length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{getEducationTypeName(eduType)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Document Types by Education Type */}
      {Object.entries(groupedDocuments).map(([educationType, docs]) => (
        <Card key={educationType}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {educationType}
              <Badge variant="outline" className="ml-2">{docs.length} Belge</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {docs.map((doc) => (
                <Card key={doc.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mt-1">
                          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base mb-1">
                            {doc.name_TR || doc.name || 'İsimsiz'}
                          </CardTitle>
                          {(doc.name_EN || doc.nameEn) && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {doc.name_EN || doc.nameEn}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {doc.isRequired && (
                              <Badge variant="outline" className="text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">
                                Zorunlu
                              </Badge>
                            )}
                            {doc.requiresApproval && (
                              <Badge variant="outline" className="text-xs bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
                                Onay Gerekli
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>Kod:</span>
                        <span className="font-mono font-medium">{doc.code || 'N/A'}</span>
                      </div>
                      {doc.allowedFileTypes && (
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                          <span>Dosya Türleri:</span>
                          <span className="font-medium">{doc.allowedFileTypes}</span>
                        </div>
                      )}
                      {doc.maxFileSizeBytes && (
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                          <span>Maks. Boyut:</span>
                          <span className="font-medium">{formatFileSize(doc.maxFileSizeBytes)}</span>
                        </div>
                      )}
                      {(doc.note_TR || doc.note) && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                            {doc.note_TR || doc.note}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEdit(doc)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Düzenle
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleDelete(doc)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {filteredDocumentTypes.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Belge Türü Bulunamadı
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || filterEducation !== 'all'
                ? 'Arama kriterlerine uygun belge türü bulunamadı.'
                : 'Henüz belge türü oluşturulmamış.'}
            </p>
            {!searchTerm && filterEducation === 'all' && (
              <Button onClick={handleAddNew} className="mt-4 gap-2">
                <Plus className="w-4 h-4" />
                İlk Belge Türünü Oluştur
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Belge Türü Düzenle' : 'Yeni Belge Türü'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? 'Belge türü bilgilerini düzenleyin'
                : 'Yeni bir belge türü oluşturun'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Kod *</Label>
                <Input
                  id="code"
                  value={editingDocumentType.code}
                  onChange={(e) => setEditingDocumentType({ ...editingDocumentType, code: e.target.value })}
                  placeholder="örn: PASSPORT"
                  className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
              <div>
                <Label htmlFor="education-type">Eğitim Türü</Label>
                <Select
                  value={editingDocumentType.educationTypeId?.toString() || 'all'}
                onValueChange={(value) => {
                  const numericValue = value === 'all' ? undefined : Number(value);
                  setEditingDocumentType({
                    ...editingDocumentType,
                    educationTypeId: numericValue === undefined || Number.isNaN(numericValue) ? undefined : numericValue,
                  });
                }}
                >
                  <SelectTrigger className="mt-1 w-full border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400">
                    <SelectValue placeholder="Eğitim türü seç" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Genel (Tüm Eğitimler)</SelectItem>
                    <SelectItem value="1">Lisans</SelectItem>
                    <SelectItem value="2">Yüksek Lisans</SelectItem>
                    <SelectItem value="3">Meslek Okulu</SelectItem>
                    <SelectItem value="4">Dil Eğitimi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Ad (TR) *</Label>
                <Input
                  id="name"
                  value={editingDocumentType.nameTr}
                  onChange={(e) => setEditingDocumentType({ ...editingDocumentType, nameTr: e.target.value })}
                  placeholder="örn: Pasaport (Renkli Fotokopi - PDF)"
                  className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
              <div>
                <Label htmlFor="nameEn">Ad (EN) *</Label>
                <Input
                  id="nameEn"
                  value={editingDocumentType.nameEn}
                  onChange={(e) => setEditingDocumentType({ ...editingDocumentType, nameEn: e.target.value })}
                  placeholder="e.g. Passport (Color Copy - PDF)"
                  className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nameDe">Ad (DE) *</Label>
                <Input
                  id="nameDe"
                  value={editingDocumentType.nameDe || ''}
                  onChange={(e) => setEditingDocumentType({ ...editingDocumentType, nameDe: e.target.value })}
                  placeholder="z.B. Reisepass (Farbkopie - PDF)"
                  className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
              <div>
                <Label htmlFor="nameAr">Ad (AR) *</Label>
                <Input
                  id="nameAr"
                  value={editingDocumentType.nameAr || ''}
                  onChange={(e) => setEditingDocumentType({ ...editingDocumentType, nameAr: e.target.value })}
                  placeholder="مثل: جواز السفر (نسخة ملونة - PDF)"
                  className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="required">Zorunlu Belge</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Bu belge türü müşteriler için zorunlu olacak
                  </p>
                </div>
                <Switch
                  id="required"
                  checked={editingDocumentType.isRequired}
                  onCheckedChange={(checked) => setEditingDocumentType({ ...editingDocumentType, isRequired: checked === true })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="approval">Onay Gerekli</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Yüklenen belgeler admin onayı gerektirecek
                  </p>
                </div>
                <Switch
                  id="approval"
                  checked={editingDocumentType.requiresApproval}
                  onCheckedChange={(checked) => setEditingDocumentType({ ...editingDocumentType, requiresApproval: checked === true })}
                />
              </div>
            </div>

            {/* File Settings */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <Label htmlFor="file-types">İzin Verilen Dosya Türleri</Label>
                <Input
                  id="file-types"
                  value={editingDocumentType.allowedFileTypes || ''}
                  onChange={(e) => setEditingDocumentType({ ...editingDocumentType, allowedFileTypes: e.target.value })}
                  placeholder="örn: pdf,doc,docx,jpg,jpeg,png"
                  className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Virgülle ayrılmış dosya uzantıları (örn: pdf,doc,docx)
                </p>
              </div>

              <div>
                <Label htmlFor="max-size">Maksimum Dosya Boyutu (MB)</Label>
                <Input
                  id="max-size"
                  type="number"
                  value={
                    editingDocumentType.maxFileSizeBytes
                      ? editingDocumentType.maxFileSizeBytes / MB_IN_BYTES
                      : ''
                  }
                  onChange={(e) => {
                    const numericValue = Number(e.target.value);
                    setEditingDocumentType({
                      ...editingDocumentType,
                      maxFileSizeBytes:
                        Number.isNaN(numericValue) || numericValue <= 0
                          ? undefined
                          : Math.round(numericValue * MB_IN_BYTES),
                    });
                  }}
                  placeholder="5"
                  className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
            </div>

            {/* Note */}
            <div>
              <Label htmlFor="note">Not/Açıklama (TR)</Label>
              <Textarea
                id="note"
                value={editingDocumentType.noteTr}
                onChange={(e) => setEditingDocumentType({ ...editingDocumentType, noteTr: e.target.value })}
                placeholder="Belge türü hakkında ek bilgiler..."
                className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              İptal
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditMode ? 'Güncelle' : 'Oluştur'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Belge Türünü Sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{selectedDocumentType?.name}</strong> belge türünü silmek istediğinizden emin misiniz?
              Bu işlem geri alınamaz ve bu belge türüne ait tüm kayıtlar etkilenebilir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DocumentTypeManagement;
