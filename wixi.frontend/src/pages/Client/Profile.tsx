import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  FileText, 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  Eye,
  User,
  Loader2,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { clientService, documentService, authService } from '../../ApiServices/services';
import type { IClientResponseDto, IEducationInfoDto } from '../../ApiServices/types/ClientTypes';
import type { IDocumentResponseDto } from '../../ApiServices/types/DocumentTypes';
import { useLanguage } from '../../contexts/language-context';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [clientData, setClientData] = useState<IClientResponseDto | null>(null);
  const [documents, setDocuments] = useState<IDocumentResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<IEducationInfoDto | null>(null);
  const [educationForm, setEducationForm] = useState({
    level: '',
    degree: '',
    institution: '',
    fieldOfStudy: '',
    startDate: '',
    graduationDate: '',
    country: '',
    city: '',
    isCurrent: false,
    gpa: '',
    description: ''
  });
  const [savingEducation, setSavingEducation] = useState(false);

  const loadProfileData = useCallback(async () => {
    console.log('🚀 Loading profile data...');
    try {
      setLoading(true);
      
      // Get current user info first
      let currentClientId: number | null = null;
      
      try {
        const currentUser = await authService.getCurrentUser(false);
        
        if (currentUser) {
          // Get client data by user ID
          try {
            const client = await clientService.getClientByUserId(currentUser.id);
            console.log('✅ Client Data:', client);
            
            // Ensure fullName is set (fallback to firstName + lastName if not present)
            if (client && !client.fullName && (client.firstName || client.lastName)) {
              client.fullName = `${client.firstName || ''} ${client.lastName || ''}`.trim();
            }
            
            setClientData(client);
            currentClientId = client?.id || null;
          } catch (clientError) {
            console.warn('⚠️ Could not load client by user ID:', clientError);
            // Try fallback - get client by ID (using user ID as client ID)
            try {
              const client = await clientService.getClientById(currentUser.id);
              if (client) {
                // Ensure fullName is set
                if (!client.fullName && (client.firstName || client.lastName)) {
                  client.fullName = `${client.firstName || ''} ${client.lastName || ''}`.trim();
                }
                
                setClientData(client);
                currentClientId = client?.id || null;
              }
            } catch (fallbackError) {
              console.warn('⚠️ Could not load client data:', fallbackError);
            }
          }
        }
      } catch (userError) {
        console.warn('⚠️ Could not load user info:', userError);
      }
      
      // If we couldn't get client ID, we can't load documents
      if (!currentClientId) {
        console.warn('⚠️ No client ID found, cannot load documents');
        setLoading(false);
        return;
      }

      // Load documents - wrapped in try-catch to not fail entire profile
      try {
        console.log('📄 Fetching documents for client:', currentClientId);
        const docsResponse: any = await documentService.getClientDocuments(currentClientId, language);
        console.log('📊 Documents Response:', docsResponse);
        
        // Handle API response format { success: true, data: { documents: [...] } }
        const docsData = docsResponse?.data || docsResponse;
        const documentsArray = docsData?.documents || docsData || [];
        console.log('✅ Documents Data:', documentsArray);
        
        setDocuments(Array.isArray(documentsArray) ? documentsArray : []);
      } catch (docError) {
        console.warn('⚠️ Could not load documents:', docError);
        setDocuments([]);
      }
    } catch (error) {
      console.error('❌ Error loading profile data:', error);
      toast.error('Profil verileri yüklenirken hata oluştu');
    } finally {
      console.log('🏁 Profile data loading finished');
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const handleDownload = async (doc: IDocumentResponseDto) => {
    try {
      const blob = await documentService.downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.originalFileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Belge indirildi');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Belge indirilirken hata oluştu');
    }
  };

  const openEducationModal = (edu?: IEducationInfoDto) => {
    if (edu) {
      setEditingEducation(edu);
      setEducationForm({
        level: edu.level || '',
        degree: edu.degree || '',
        institution: edu.institution || '',
        fieldOfStudy: edu.fieldOfStudy || '',
        startDate: edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : '',
        graduationDate: edu.graduationDate ? new Date(edu.graduationDate).toISOString().split('T')[0] : '',
        country: edu.country || '',
        city: edu.city || '',
        isCurrent: edu.isCurrent || false,
        gpa: edu.gpa?.toString() || '',
        description: edu.description || ''
      });
    } else {
      setEditingEducation(null);
      setEducationForm({
        level: '',
        degree: '',
        institution: '',
        fieldOfStudy: '',
        startDate: '',
        graduationDate: '',
        country: '',
        city: '',
        isCurrent: false,
        gpa: '',
        description: ''
      });
    }
    setIsEducationModalOpen(true);
  };

  const handleSaveEducation = async () => {
    if (!clientData) return;

    if (!educationForm.degree.trim() || !educationForm.institution.trim()) {
      toast.error('Lütfen derece ve kurum bilgilerini doldurun');
      return;
    }

    try {
      setSavingEducation(true);

      const educationData = {
        clientId: clientData.id,
        level: educationForm.level || 'Bachelor',
        degree: educationForm.degree,
        institution: educationForm.institution,
        fieldOfStudy: educationForm.fieldOfStudy || undefined,
        startDate: educationForm.startDate || undefined,
        graduationDate: educationForm.graduationDate || undefined,
        country: educationForm.country || undefined,
        city: educationForm.city || undefined,
        isCurrent: educationForm.isCurrent,
        gpa: educationForm.gpa ? parseFloat(educationForm.gpa) : undefined,
        description: educationForm.description || undefined
      };

      if (editingEducation) {
        await clientService.updateEducationInfo(editingEducation.id, educationData);
      } else {
        await clientService.addEducationInfo(educationData);
      }

      // Reload profile data
      await loadProfileData();
      setIsEducationModalOpen(false);
      toast.success(editingEducation ? 'Eğitim bilgisi güncellendi' : 'Eğitim bilgisi eklendi');
    } catch (error) {
      console.error('Error saving education info:', error);
      toast.error('Eğitim bilgisi kaydedilirken hata oluştu');
    } finally {
      setSavingEducation(false);
    }
  };

  const handleDeleteEducation = async (eduId: number) => {
    if (!confirm('Bu eğitim bilgisini silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await clientService.deleteEducationInfo(eduId);
      // Reload profile data
      await loadProfileData();
      toast.success('Eğitim bilgisi silindi');
    } catch (error) {
      console.error('Error deleting education info:', error);
      toast.error('Eğitim bilgisi silinirken hata oluştu');
    }
  };

  const getStatusBadge = (status: string | null | undefined) => {
    if (!status) {
      return {
        className: 'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-300',
        icon: null,
        text: 'Beklemede',
      };
    }
    
    const normalizedStatus = status.trim().toLowerCase();
    
    switch (normalizedStatus) {
      case 'accepted':
      case 'approved':
        return {
          className: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          text: 'Onaylandı',
        };
      case 'rejected':
        return {
          className: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300',
          icon: <XCircle className="w-3.5 h-3.5" />,
          text: 'Reddedildi',
        };
      case 'pending':
        return {
          className: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300',
          icon: <Clock className="w-3.5 h-3.5" />,
          text: 'İnceleniyor',
        };
      case 'underreview':
        return {
          className: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300',
          icon: <Eye className="w-3.5 h-3.5" />,
          text: 'Değerlendiriliyor',
        };
      case 'missinginfo':
      case 'needsmoreinfo':
        return {
          className: 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300',
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          text: 'Eksik Bilgi',
        };
      default:
        return {
          className: 'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-300',
          icon: null,
          text: status,
        };
    }
  };

  const getMessageStyle = (status: string | null | undefined) => {
    if (!status) {
      return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
    
    const normalizedStatus = status.trim().toLowerCase();
    
    switch (normalizedStatus) {
      case 'rejected':
        return 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'missinginfo':
      case 'needsmoreinfo':
        return 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      default:
        return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
        <p className="text-gray-500">Profil bilgileri yüklenemedi</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <button 
          onClick={() => navigate('/client/dashboard')}
          className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
        >
          Dashboard
        </button>
        <span className="text-gray-500 dark:text-gray-400">/</span>
        <span className="text-gray-900 dark:text-white font-medium">Profilim</span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap justify-between gap-4 items-start mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white">Profilim</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kişisel bilgilerinizi, eğitim geçmişinizi ve yüklediğiniz belgeleri görüntüleyin.
          </p>
        </div>
      </div>

      {/* Show message if no client data */}
      {!clientData && !loading && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Profil Bulunamadı</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Henüz bir danışan profiliniz bulunmamaktadır.
              </p>
              <Button onClick={() => navigate('/client/dashboard')}>
                Dashboard'a Dön
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Card */}
      {clientData && (
      <>
      <div className="mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                {(clientData.fullName || `${clientData.firstName || ''} ${clientData.lastName || ''}`.trim())?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              
              {/* Profile Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {clientData.fullName || `${clientData.firstName || ''} ${clientData.lastName || ''}`.trim() || 'Kullanıcı'}
                </h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>Müşteri Kodu: {clientData.clientCode}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Kayıt: {
                      clientData.registrationDate 
                        ? new Date(clientData.registrationDate).toLocaleDateString('tr-TR')
                        : clientData.createdAt 
                          ? new Date(clientData.createdAt).toLocaleDateString('tr-TR')
                          : 'Belirtilmemiş'
                    }</span>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-700 dark:bg-blue-500/30 dark:text-blue-400">
                    {clientData.status}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Personal Info & Education */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Kişisel Bilgiler</CardTitle>
              <CardDescription>Temel iletişim bilgileriniz</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                    <User className="w-4 h-4" />
                    Ad Soyad
                  </label>
                  <p className="text-base text-gray-800 dark:text-gray-200">
                    {clientData.fullName || `${clientData.firstName || ''} ${clientData.lastName || ''}`.trim() || 'Belirtilmemiş'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4" />
                    E-posta
                  </label>
                  <p className="text-base text-gray-800 dark:text-gray-200">{clientData.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                    <Phone className="w-4 h-4" />
                    Telefon
                  </label>
                  <p className="text-base text-gray-800 dark:text-gray-200">{clientData.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4" />
                    Doğum Tarihi
                  </label>
                  <p className="text-base text-gray-800 dark:text-gray-200">
                    {clientData.dateOfBirth 
                      ? new Date(clientData.dateOfBirth).toLocaleDateString('tr-TR')
                      : 'Belirtilmemiş'
                    }
                  </p>
                </div>
                {clientData.nationality && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Uyruk
                    </label>
                    <p className="text-base text-gray-800 dark:text-gray-200">{clientData.nationality}</p>
                  </div>
                )}
                {clientData.educationTypeName && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                      <GraduationCap className="w-4 h-4" />
                      Eğitim Türü
                    </label>
                    <p className="text-base text-gray-800 dark:text-gray-200">{clientData.educationTypeName}</p>
                  </div>
                )}
                {clientData.address && (
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4" />
                      Adres
                    </label>
                    <p className="text-base text-gray-800 dark:text-gray-200">{clientData.address}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Educational Background */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    Eğitim Geçmişi
                  </CardTitle>
                </div>
                <Button
                  size="sm"
                  onClick={() => openEducationModal()}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {clientData.educationHistory && clientData.educationHistory.length > 0 ? (
                <div className="space-y-4">
                  {clientData.educationHistory.map((edu) => (
                    <div 
                      key={edu.id} 
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{edu.degree}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{edu.institution}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {edu.isCurrent && (
                            <Badge className="bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-400">
                              Devam Ediyor
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEducationModal(edu)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEducation(edu.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {edu.level && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Seviye: {edu.level}
                        </p>
                      )}
                      {edu.fieldOfStudy && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Alan: {edu.fieldOfStudy}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                        {edu.country && (
                          <span>Ülke: {edu.country}</span>
                        )}
                        {edu.city && (
                          <span>Şehir: {edu.city}</span>
                        )}
                        {edu.startDate && (
                          <span>Başlangıç: {new Date(edu.startDate).toLocaleDateString('tr-TR')}</span>
                        )}
                        {edu.graduationDate && (
                          <span>Mezuniyet: {new Date(edu.graduationDate).toLocaleDateString('tr-TR')}</span>
                        )}
                        {edu.gpa && (
                          <span>Not Ortalaması: {edu.gpa}</span>
                        )}
                      </div>
                      {edu.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Henüz eğitim bilgisi eklenmemiş</p>
                  <Button
                    size="sm"
                    onClick={() => openEducationModal()}
                    className="flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    İlk Eğitim Bilgisini Ekle
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Documents */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Yüklenen Belgeler
              </CardTitle>
              <CardDescription>
                Toplam {documents.length} belge
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Henüz belge yüklenmemiş</p>
                  <Button
                    size="sm"
                    className="mt-4"
                    onClick={() => navigate('/client/documents')}
                  >
                    Belge Yükle
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => {
                    // Use reviewDecision if available, otherwise use status
                    const decisionValue = doc.reviewDecision || doc.status;
                    const statusBadge = getStatusBadge(decisionValue);
                    const messageStyleStatus = decisionValue;
                    
                    return (
                      <div 
                        key={doc.id} 
                        className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800/50 p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        {/* Document Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* Icon */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex-shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            
                            {/* Document Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate mb-1">
                                {doc.documentTypeName}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-1">
                                {doc.originalFileName}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <span>{doc.fileSizeFormatted}</span>
                                <span>•</span>
                                <span>
                                  {new Date(doc.uploadedAt).toLocaleDateString('tr-TR', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Download Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(doc)}
                            className="h-8 w-8 p-0 flex-shrink-0"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Status Badge */}
                        <div className="mb-2">
                          <Badge className={`${statusBadge.className} flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium w-fit`}>
                            {statusBadge.icon}
                            <span>{statusBadge.text}</span>
                          </Badge>
                        </div>

                        {/* Feedback Message if exists */}
                        {doc.feedbackMessage && doc.feedbackMessage.trim() && (
                          <div className={`flex items-start gap-2 p-2.5 rounded-md text-xs mt-2 ${getMessageStyle(messageStyleStatus)}`}>
                            {messageStyleStatus?.toLowerCase() === 'rejected' && <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />}
                            {(messageStyleStatus?.toLowerCase() === 'missinginfo' || messageStyleStatus?.toLowerCase() === 'needsmoreinfo') && <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />}
                            <p className="leading-relaxed break-words">{doc.feedbackMessage.trim()}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </>
      )}

      {/* Education Info Modal */}
      <Dialog open={isEducationModalOpen} onOpenChange={setIsEducationModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEducation ? 'Eğitim Bilgisini Düzenle' : 'Yeni Eğitim Bilgisi Ekle'}
            </DialogTitle>
            <DialogDescription>
              Eğitim geçmişinize yeni bir kayıt ekleyin veya mevcut kaydı güncelleyin.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="education-level">Eğitim Seviyesi *</Label>
                <Select
                  value={educationForm.level}
                  onValueChange={(value) => setEducationForm(prev => ({ ...prev, level: value }))}
                >
                  <SelectTrigger className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400">
                    <SelectValue placeholder="Seviye seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HighSchool">Lise</SelectItem>
                    <SelectItem value="VocationalSchool">Meslek Okulu</SelectItem>
                    <SelectItem value="Associate">Ön Lisans</SelectItem>
                    <SelectItem value="Bachelor">Lisans</SelectItem>
                    <SelectItem value="Master">Yüksek Lisans</SelectItem>
                    <SelectItem value="PhD">Doktora</SelectItem>
                    <SelectItem value="Apprenticeship">Kalfalık</SelectItem>
                    <SelectItem value="Mastership">Ustalık</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="education-degree">Derece *</Label>
                <Input
                  id="education-degree"
                  value={educationForm.degree}
                  onChange={(e) => setEducationForm(prev => ({ ...prev, degree: e.target.value }))}
                  placeholder="Örn: Bilgisayar Mühendisliği"
                  required
                  className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="education-institution">Kurum *</Label>
              <Input
                id="education-institution"
                value={educationForm.institution}
                onChange={(e) => setEducationForm(prev => ({ ...prev, institution: e.target.value }))}
                placeholder="Üniversite veya okul adı"
                required
                className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="education-field">Alan/Bölüm</Label>
                <Input
                  id="education-field"
                  value={educationForm.fieldOfStudy}
                  onChange={(e) => setEducationForm(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
                  placeholder="Alan veya bölüm"
                  className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
              
              <div>
                <Label htmlFor="education-gpa">Not Ortalaması</Label>
                <Input
                  id="education-gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={educationForm.gpa}
                  onChange={(e) => setEducationForm(prev => ({ ...prev, gpa: e.target.value }))}
                  placeholder="0.00 - 4.00"
                  className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="education-start-date">Başlangıç Tarihi</Label>
                <Input
                  id="education-start-date"
                  type="date"
                  value={educationForm.startDate}
                  onChange={(e) => setEducationForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
              
              <div>
                <Label htmlFor="education-graduation-date">Mezuniyet Tarihi</Label>
                <Input
                  id="education-graduation-date"
                  type="date"
                  value={educationForm.graduationDate}
                  onChange={(e) => setEducationForm(prev => ({ ...prev, graduationDate: e.target.value }))}
                  disabled={educationForm.isCurrent}
                  className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="education-country">Ülke</Label>
                <Input
                  id="education-country"
                  value={educationForm.country}
                  onChange={(e) => setEducationForm(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="Ülke"
                  className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
              
              <div>
                <Label htmlFor="education-city">Şehir</Label>
                <Input
                  id="education-city"
                  value={educationForm.city}
                  onChange={(e) => setEducationForm(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Şehir"
                  className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="education-current"
                checked={educationForm.isCurrent}
                onChange={(e) => setEducationForm(prev => ({ ...prev, isCurrent: e.target.checked }))}
                className="rounded border-2 border-gray-300 dark:border-gray-600 w-4 h-4"
              />
              <Label htmlFor="education-current" className="font-normal cursor-pointer">
                Devam ediyor (Mezuniyet tarihi otomatik olarak boş bırakılacak)
              </Label>
            </div>

            <div>
              <Label htmlFor="education-description">Açıklama</Label>
              <Textarea
                id="education-description"
                value={educationForm.description}
                onChange={(e) => setEducationForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Ek bilgiler, başarılar, ödüller vb."
                rows={3}
                className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEducationModalOpen(false)}
              disabled={savingEducation}
            >
              İptal
            </Button>
            <Button
              onClick={handleSaveEducation}
              disabled={savingEducation || !educationForm.degree.trim() || !educationForm.institution.trim()}
            >
              {savingEducation ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Kaydediliyor...
                </>
              ) : (
                editingEducation ? 'Güncelle' : 'Ekle'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
