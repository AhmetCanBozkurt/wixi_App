import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  X, 
  AlertCircle,
  GraduationCap,
  Briefcase,
  Award,
  Info,
  Loader2,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { documentService, clientService, authService, cvBuilderService } from '../../ApiServices/services';
import type { IDocumentTypeDto, IDocumentResponseDto } from '../../ApiServices/types/DocumentTypes';
import type { DocumentAnalysisDto } from '../../types/CVBuilderTypes';
import { useLanguage } from '../../contexts/language-context';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../hooks/useI18n';

const Documents: React.FC = () => {
  const { language } = useLanguage();
  const { translate } = useI18n();
  const dashboardLabel = translate('client.nav.dashboard', 'Dashboard');
  const documentsLabel = translate('client.nav.documents', 'Belgeler');
  const navigate = useNavigate();
  const [educationTypeId, setEducationTypeId] = useState<number | null>(null);
  const [documentTypes, setDocumentTypes] = useState<IDocumentTypeDto[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<IDocumentResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [clientId, setClientId] = useState<number | null>(null);
  const [documentAnalyses, setDocumentAnalyses] = useState<Record<number, DocumentAnalysisDto>>({});
  const [analyzing, setAnalyzing] = useState<Record<number, boolean>>({});

  // Helper function to get document type name based on current language
  const getDocumentTypeName = (docType: IDocumentTypeDto): string => {
    const lang = language.toUpperCase();
    switch (lang) {
      case 'TR':
        return docType.name_TR || docType.name || '';
      case 'EN':
        return docType.name_EN || docType.name_TR || docType.name || '';
      case 'DE':
        return docType.name_DE || docType.name_EN || docType.name_TR || docType.name || '';
      case 'AR':
        return docType.name_AR || docType.name_TR || docType.name || '';
      default:
        return docType.name_TR || docType.name || '';
    }
  };

  // Helper function to get document type note based on current language
  const getDocumentTypeNote = (docType: IDocumentTypeDto): string | undefined => {
    const lang = language.toUpperCase();
    switch (lang) {
      case 'TR':
        return docType.note_TR || docType.note;
      case 'EN':
        return docType.note_EN || docType.note_TR || docType.note;
      case 'DE':
        return docType.note_DE || docType.note_EN || docType.note_TR || docType.note;
      case 'AR':
        return docType.note_AR || docType.note_TR || docType.note;
      default:
        return docType.note_TR || docType.note;
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (educationTypeId && clientId) {
      loadDocumentTypes(educationTypeId, language);
      loadUploadedDocuments(clientId, language);
    }
  }, [educationTypeId, clientId, language]);

  // Load document analyses when documents are loaded
  useEffect(() => {
    uploadedDocuments.forEach(doc => {
      loadDocumentAnalysis(doc);
    });
  }, [uploadedDocuments]);

  const loadInitialData = async () => {
    console.log('🚀 Loading initial data...');
    try {
      setLoading(true);
      
      // Get current user info first
      let currentClientId: number | null = null;
      
      try {
        const currentUser = await authService.getCurrentUser(false);
        
        if (currentUser) {
          // Get client data by user ID
          try {
            const clientResponse: any = await clientService.getClientByUserId(currentUser.id);
      const clientData = clientResponse?.data || clientResponse;
      console.log('✅ Client Data:', clientData);
            currentClientId = clientData?.id || null;
      
      if (clientData && clientData.educationTypeId) {
        setEducationTypeId(clientData.educationTypeId);
            }
          } catch (clientError) {
            console.warn('⚠️ Could not load client by user ID:', clientError);
          }
        }
      } catch (userError) {
        console.warn('⚠️ Could not load user info:', userError);
      }
      
      if (currentClientId) {
        setClientId(currentClientId);
      } else {
        console.warn('⚠️ No client ID found');
        toast.error('Müşteri bilgisi bulunamadı');
      }
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
      toast.error('Veri yüklenirken hata oluştu');
    } finally {
      console.log('🏁 Initial data loading finished');
      setLoading(false);
    }
  };

  const loadDocumentTypes = async (eduTypeId: number, lang: string) => {
    console.log('📞 Fetching document types for education type:', eduTypeId);
    try {
      const typesResponse: any = await documentService.getDocumentTypesByEducation(eduTypeId, lang);
      console.log('📊 Document Types Response:', typesResponse);
      
      // Extract data from response
      const types = typesResponse?.data || typesResponse || [];
      console.log('✅ Document Types:', types);
      setDocumentTypes(Array.isArray(types) ? types : []);
    } catch (error) {
      console.error('❌ Error loading document types:', error);
      toast.error('Belge türleri yüklenirken hata oluştu');
    }
  };

  const loadUploadedDocuments = async (cliId: number, lang: string) => {
    console.log('📞 Fetching uploaded documents for client:', cliId);
    try {
      const docsResponse: any = await documentService.getClientDocuments(cliId, lang);
      console.log('📊 Documents Response:', docsResponse);
      
      // Extract data from response
      const docsData = docsResponse?.data || docsResponse;
      const documents = docsData?.documents || docsData || [];
      console.log('✅ Documents:', documents);
      
      // Log each document's status for debugging
      if (Array.isArray(documents)) {
        documents.forEach((doc: IDocumentResponseDto) => {
          const decisionValue = doc.reviewDecision || doc.status;
          console.log(`📄 ${doc.documentTypeName}: Status = ${doc.status}, ReviewDecision = ${doc.reviewDecision}, Using = ${decisionValue}, FeedbackMessage = ${doc.feedbackMessage}`);
        });
      }
      
      setUploadedDocuments(Array.isArray(documents) ? documents : []);
    } catch (error) {
      console.error('Error loading uploaded documents:', error);
      toast.error('Yüklenen belgeler yüklenirken hata oluştu');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, documentTypeId: number) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !clientId) return;

    const file = files[0];
    
    // Get the document type to check allowed file types
    const docType = documentTypes.find(dt => dt.id === documentTypeId);
    
    // Check if file type is allowed based on document type settings
    if (docType?.allowedFileTypes) {
      const allowedTypes = docType.allowedFileTypes.split(',').map(t => t.trim().toLowerCase());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const fileType = file.type.toLowerCase();
      
      const isAllowed = allowedTypes.some(allowed => {
        const normalizedAllowed = allowed.toLowerCase();
        return fileExtension === normalizedAllowed || 
               fileType.includes(normalizedAllowed.replace('.', ''));
      });
      
      if (!isAllowed) {
        toast.error(`Bu belge türü için izin verilen dosya formatları: ${docType.allowedFileTypes}`);
        // Reset file input
        event.target.value = '';
        return;
      }
    } else {
      // Fallback: Check if file is PDF or image (backward compatibility)
      if (!file.type.includes('pdf') && !file.type.includes('image')) {
        toast.error('Lütfen sadece PDF veya görsel dosyaları yükleyin.');
        // Reset file input
        event.target.value = '';
        return;
      }
    }

    // Check file size
    const maxSize = docType?.maxFileSizeBytes || 10 * 1024 * 1024; // Default 10MB
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      toast.error(`Dosya boyutu maksimum ${maxSizeMB}MB olmalıdır.`);
      // Reset file input
      event.target.value = '';
      return;
    }

    try {
      setUploading(true);
      const uploadedDoc = await documentService.uploadDocument(file, {
        clientId: clientId,
        documentTypeId: documentTypeId
      });
      
      // Success toast is already shown in DocumentService.uploadDocument
      // Just reload the documents list
      await loadUploadedDocuments(clientId, language);
      
      // Check if this is a CV document and auto-analyze
      if (docType && uploadedDoc?.id) {
        const docTypeName = getDocumentTypeName(docType).toLowerCase();
        const isCV = docTypeName.includes('cv') || docTypeName.includes('curriculum vitae') || 
                     docType.name?.toLowerCase().includes('cv') || 
                     docType.name_TR?.toLowerCase().includes('cv') ||
                     docType.name_EN?.toLowerCase().includes('cv') ||
                     docType.name_DE?.toLowerCase().includes('cv');
        
        if (isCV) {
          // Auto-analyze CV document
          try {
            setAnalyzing(prev => ({ ...prev, [uploadedDoc.id]: true }));
            const analysis = await cvBuilderService.analyzeDocument(uploadedDoc.id);
            // Wait a bit for the analysis to be saved to database
            await new Promise(resolve => setTimeout(resolve, 500));
            // Reload the analysis result to ensure we have the latest data
            const analysisResult = await cvBuilderService.getDocumentAnalysis(uploadedDoc.id);
            if (analysisResult) {
              setDocumentAnalyses(prev => ({ ...prev, [uploadedDoc.id]: analysisResult }));
            } else if (analysis) {
              // Fallback to the analysis from analyzeDocument if getDocumentAnalysis returns null
              setDocumentAnalyses(prev => ({ ...prev, [uploadedDoc.id]: analysis }));
            }
            toast.success('CV belgesi otomatik olarak analiz edildi');
          } catch (analysisError: any) {
            console.error('CV analiz hatası:', analysisError);
            // Don't show error toast for auto-analysis, just log it
          } finally {
            setAnalyzing(prev => ({ ...prev, [uploadedDoc.id]: false }));
          }
        }
      }
      
      // Reset file input
      event.target.value = '';
    } catch (error: any) {
      console.error('Error uploading file:', error);
      // Error toast is already shown in DocumentService.uploadDocument
      // Just log the error here
      
      // Reset file input on error
      event.target.value = '';
    } finally {
      setUploading(false);
    }
  };

  const handleFileDelete = async (documentId: number) => {
    if (!clientId) return;

    try {
      await documentService.deleteDocument(documentId, clientId);
      toast.success('Belge silindi.');
      await loadUploadedDocuments(clientId, language);
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Belge silinirken hata oluştu');
    }
  };

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

  const handleAnalyzeDocument = async (doc: IDocumentResponseDto) => {
    try {
      setAnalyzing(prev => ({ ...prev, [doc.id]: true }));
      const analysis = await cvBuilderService.analyzeDocument(doc.id);
      // Wait a bit for the analysis to be saved to database
      await new Promise(resolve => setTimeout(resolve, 500));
      // Reload the analysis result to ensure we have the latest data
      const analysisResult = await cvBuilderService.getDocumentAnalysis(doc.id);
      if (analysisResult) {
        setDocumentAnalyses(prev => ({ ...prev, [doc.id]: analysisResult }));
      } else if (analysis) {
        // Fallback to the analysis from analyzeDocument if getDocumentAnalysis returns null
        setDocumentAnalyses(prev => ({ ...prev, [doc.id]: analysis }));
      }
      toast.success('Belge analiz edildi');
    } catch (error: any) {
      console.error('Belge analiz hatası:', error);
      toast.error(error.message || 'Belge analiz edilemedi');
    } finally {
      setAnalyzing(prev => ({ ...prev, [doc.id]: false }));
    }
  };

  const loadDocumentAnalysis = async (doc: IDocumentResponseDto) => {
    try {
      const analysis = await cvBuilderService.getDocumentAnalysis(doc.id);
      if (analysis) {
        setDocumentAnalyses(prev => ({ ...prev, [doc.id]: analysis }));
      }
      // If analysis not found (404), it's normal - analysis hasn't been done yet
      // Don't show error, just silently return
    } catch (error: any) {
      // Only log if it's not a 404 (not found is expected)
      if (error.message && !error.message.includes('404') && !error.message.includes('not found')) {
        console.error('Analiz sonucu yüklenirken hata:', error);
      }
    }
  };

  const handleCreateCV = () => {
    // Navigate to payment page for CV Builder (20 Euro)
    navigate('/client/cv-builder-payment?amount=20');
  };

  const isDocumentUploaded = (documentTypeId: number) => {
    return uploadedDocuments.some(doc => doc.documentTypeId === documentTypeId);
  };

  const getUploadProgress = () => {
    const requiredDocs = documentTypes.filter(doc => doc.isRequired);
    const uploadedRequiredDocs = requiredDocs.filter(doc => isDocumentUploaded(doc.id));
    return {
      uploaded: uploadedRequiredDocs.length,
      total: requiredDocs.length,
      percentage: requiredDocs.length > 0 
        ? Math.round((uploadedRequiredDocs.length / requiredDocs.length) * 100)
        : 0
    };
  };

  const getReviewDecisionColor = (reviewDecision: string | null | undefined) => {
    // Normalize the value: trim whitespace and check for empty string
    const normalizedValue = reviewDecision?.trim();
    
    if (!normalizedValue || normalizedValue === '') {
      console.log('🎨 getReviewDecisionColor: Empty or null value, returning default gray');
      return {
        badge: 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-400',
        border: 'border-gray-200 dark:border-gray-700',
        bg: 'bg-white dark:bg-gray-800/50',
        icon: 'text-gray-400 dark:text-gray-500',
        text: 'text-gray-900 dark:text-white',
        feedback: 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300'
      };
    }
    
    const lowerValue = normalizedValue.toLowerCase();
    console.log(`🎨 getReviewDecisionColor: Input="${reviewDecision}", Normalized="${normalizedValue}", Lower="${lowerValue}"`);
    
    switch (lowerValue) {
      case 'accepted':
      case 'approved':
        return {
          badge: 'bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-400',
          border: 'border-green-300 dark:border-green-700',
          bg: 'bg-green-50 dark:bg-green-900/20',
          icon: 'text-green-600 dark:text-green-400',
          text: 'text-green-900 dark:text-green-100',
          feedback: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
        };
      case 'missinginfo':
      case 'needsmoreinfo':
        console.log(`🎨 getReviewDecisionColor: Matched "${lowerValue}" -> YELLOW colors`);
        return {
          badge: 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/30 dark:text-yellow-400',
          border: 'border-yellow-300 dark:border-yellow-700',
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          icon: 'text-yellow-600 dark:text-yellow-400',
          text: 'text-yellow-900 dark:text-yellow-100',
          feedback: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
        };
      case 'rejected':
        console.log(`🎨 getReviewDecisionColor: Matched "${lowerValue}" -> RED colors`);
        return {
          badge: 'bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-400',
          border: 'border-red-300 dark:border-red-700',
          bg: 'bg-red-50 dark:bg-red-900/20',
          icon: 'text-red-600 dark:text-red-400',
          text: 'text-red-900 dark:text-red-100',
          feedback: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
        };
      case 'pending':
      case 'underreview':
        return {
          badge: 'bg-blue-500/20 text-blue-700 dark:bg-blue-500/30 dark:text-blue-400',
          border: 'border-blue-300 dark:border-blue-700',
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          icon: 'text-blue-600 dark:text-blue-400',
          text: 'text-blue-900 dark:text-blue-100',
          feedback: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
        };
      default:
        return {
          badge: 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-400',
          border: 'border-gray-200 dark:border-gray-700',
          bg: 'bg-white dark:bg-gray-800/50',
          icon: 'text-gray-400 dark:text-gray-500',
          text: 'text-gray-900 dark:text-white',
          feedback: 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300'
        };
    }
  };

  const getReviewDecisionLabel = (reviewDecision: string | null | undefined) => {
    const normalizedValue = reviewDecision?.trim();
    if (!normalizedValue || normalizedValue === '') {
      return translate('client.documents.review.pending', 'Beklemede');
    }
    
    switch (normalizedValue.toLowerCase()) {
      case 'accepted':
      case 'approved':
        return translate('client.documents.review.approved', 'Onaylandı');
      case 'missinginfo':
      case 'needsmoreinfo':
        return translate('client.documents.review.missingInfo', 'Eksik Bilgi');
      case 'rejected':
        return translate('client.documents.review.rejected', 'Reddedildi');
      case 'pending':
      case 'underreview':
        return translate('client.documents.review.underReview', 'İnceleniyor');
      default:
        return reviewDecision;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const progress = getUploadProgress();

  return (
    <div className="flex flex-col w-full">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <button 
          onClick={() => window.location.href = '/client/dashboard'}
          className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
        >
          {dashboardLabel}
        </button>
        <span className="text-gray-500 dark:text-gray-400">/</span>
        <span className="text-gray-900 dark:text-white font-medium">{documentsLabel}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-wrap justify-between gap-4 items-start">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-black text-gray-900 dark:text-white">
              {translate('client.documents.headerTitle', 'Belge Yükleme')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {translate(
                'client.documents.headerDescription',
                'Başvuru süreciniz için gerekli belgeleri yükleyin. Tüm belgeler PDF formatında olmalıdır.'
              )}
            </p>
          </div>
          <Button
            onClick={handleCreateCV}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
          >
            <FileText className="w-5 h-5 mr-2" />
            {translate('client.documents.createCvButton', 'CV Oluştur (20 €)')}
          </Button>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {translate('client.documents.progress.title', 'Yükleme İlerlemesi')}
              </span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {translate('client.documents.progress.counter', '{uploaded} / {total} Belge', {
                  uploaded: progress.uploaded,
                  total: progress.total,
                })}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {translate(
                'client.documents.progress.helper',
                '{percentage}% tamamlandı • Zorunlu belgeler yüklenmelidir',
                { percentage: progress.percentage }
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Document Upload Cards */}
      <div className="mb-8">
        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-gray-900 dark:text-white">
                  {translate('client.documents.required.title', 'Gerekli Belgeler')}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {translate('client.documents.required.description', 'Aşağıdaki belgeleri PDF formatında yükleyin')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documentTypes.map((docType) => {
                const isUploaded = isDocumentUploaded(docType.id);
                const uploadedDoc = uploadedDocuments.find(doc => doc.documentTypeId === docType.id);
                
                // Use reviewDecision if available and not empty, otherwise use status
                let decisionValue: string | null = null;
                if (uploadedDoc?.reviewDecision) {
                  const trimmed = String(uploadedDoc.reviewDecision).trim();
                  decisionValue = trimmed || null;
                } else if (uploadedDoc?.status) {
                  const trimmed = String(uploadedDoc.status).trim();
                  decisionValue = trimmed || null;
                }
                
                const colors = getReviewDecisionColor(decisionValue);
                
                // Always use colors if uploaded, even if decisionValue is null (will use default gray)
                // Build className with proper spacing
                const baseClasses = 'p-4 border rounded-lg transition-all';
                let colorClasses: string;
                
                if (isUploaded) {
                  // If uploaded, always use colors based on decision value
                  colorClasses = `${colors.border} ${colors.bg}`.trim();
                } else {
                  // If not uploaded, use neutral colors
                  colorClasses = 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50';
                }
                
                const finalClassName = `${baseClasses} ${colorClasses}`.trim();
                
                // Debug log - always log for uploaded documents
                if (uploadedDoc) {
                  console.log(`🎨 [${getDocumentTypeName(docType)}]`, {
                    docTypeId: docType.id,
                    documentTypeId: uploadedDoc.documentTypeId,
                    reviewDecision: uploadedDoc.reviewDecision,
                    reviewDecisionType: typeof uploadedDoc.reviewDecision,
                    status: uploadedDoc.status,
                    statusType: typeof uploadedDoc.status,
                    decisionValue: decisionValue,
                    decisionValueType: typeof decisionValue,
                    lowerValue: decisionValue?.toLowerCase(),
                    colors: colors,
                    isUploaded: isUploaded,
                    finalBorder: colors.border,
                    finalBg: colors.bg,
                    colorClasses: colorClasses,
                    finalClassName: finalClassName
                  });
                }
                
                return (
                  <div 
                    key={docType.id} 
                    className={finalClassName}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {isUploaded ? (
                          <CheckCircle className={`w-5 h-5 ${colors.icon} flex-shrink-0 mt-0.5`} />
                        ) : (
                          <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`font-medium ${
                              isUploaded 
                                ? colors.text 
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {getDocumentTypeName(docType)}
                            </span>
                            {docType.isRequired && (
                              <Badge variant="destructive" className="text-xs px-1.5 py-0">
                                {translate('client.documents.badge.required', 'Zorunlu')}
                              </Badge>
                            )}
                            {!docType.isRequired && (
                              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                {translate('client.documents.badge.optional', 'İsteğe Bağlı')}
                              </Badge>
                            )}
                            {uploadedDoc && (
                              <Badge className={colors.badge}>
                                {getReviewDecisionLabel(decisionValue)}
                              </Badge>
                            )}
                          </div>
                          {uploadedDoc && (
                            <>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                {uploadedDoc.originalFileName} • {uploadedDoc.fileSizeFormatted}
                              </p>
                              {documentAnalyses[uploadedDoc.id] && (
                                <div className="mt-2 p-2 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                  {documentAnalyses[uploadedDoc.id].isCV && (
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge className="bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-400">
                                        {translate('client.documents.analysis.cvDetected', 'CV Tespit Edildi')}
                                      </Badge>
                                      {documentAnalyses[uploadedDoc.id].atsScore !== undefined && (
                                        <Badge className="bg-blue-500/20 text-blue-700 dark:bg-blue-500/30 dark:text-blue-400">
                                          {translate(
                                            'client.documents.analysis.atsScore',
                                            'ATS Skoru: %{score}',
                                            { score: documentAnalyses[uploadedDoc.id].atsScore ?? 0 }
                                          )}
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                  {documentAnalyses[uploadedDoc.id].recommendations && 
                                   documentAnalyses[uploadedDoc.id].recommendations!.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        {translate('client.documents.analysis.recommendations', 'Öneriler:')}
                                      </p>
                                      <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                                        {documentAnalyses[uploadedDoc.id].recommendations!.map((rec, idx) => (
                                          <li key={idx}>{rec}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                          {uploadedDoc?.feedbackMessage && (
                            <div className={`flex items-start gap-2 mt-2 p-2 rounded ${colors.feedback}`}>
                              <Info className={`w-4 h-4 ${colors.icon} flex-shrink-0 mt-0.5`} />
                              <p className={`text-xs ${colors.text}`}>
                                {uploadedDoc.feedbackMessage}
                              </p>
                            </div>
                          )}
                          {getDocumentTypeNote(docType) && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {getDocumentTypeNote(docType)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {uploadedDoc && (() => {
                          // Check if this is a CV document
                          const docTypeForDoc = documentTypes.find(dt => dt.id === uploadedDoc.documentTypeId);
                          const docTypeName = docTypeForDoc ? getDocumentTypeName(docTypeForDoc).toLowerCase() : '';
                          const isCV = docTypeName.includes('cv') || docTypeName.includes('curriculum vitae') || 
                                       docTypeForDoc?.name?.toLowerCase().includes('cv') || 
                                       docTypeForDoc?.name_TR?.toLowerCase().includes('cv') ||
                                       docTypeForDoc?.name_EN?.toLowerCase().includes('cv') ||
                                       docTypeForDoc?.name_DE?.toLowerCase().includes('cv');
                          
                          return (
                            <>
                              {isCV && analyzing[uploadedDoc.id] && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled
                                >
                                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                  {translate('client.documents.buttons.analyzing', 'Analiz Ediliyor...')}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownload(uploadedDoc)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </>
                          );
                        })()}
                        <Label htmlFor={`file-${docType.id}`} className="cursor-pointer">
                          <input
                            id={`file-${docType.id}`}
                            type="file"
                            accept={docType.allowedFileTypes || ".pdf,.jpg,.jpeg,.png"}
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, docType.id)}
                            disabled={uploading}
                          />
                          <Button 
                            size="sm" 
                            variant={isUploaded ? "outline" : "default"}
                            className={isUploaded ? "border-green-600 dark:border-green-500 text-green-600 dark:text-green-400" : ""}
                            disabled={uploading}
                            asChild
                          >
                            <span>
                              {uploading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4 mr-2" />
                              )}
                                  {isUploaded
                                    ? translate('client.documents.buttons.reupload', 'Yeniden Yükle')
                                    : translate('client.documents.buttons.upload', 'Yükle')}
                            </span>
                          </Button>
                        </Label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Button */}
      {progress.percentage === 100 && (
        <div className="mt-8 p-6 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {translate('client.documents.success.title', 'Tüm Zorunlu Belgeler Yüklendi!')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {translate(
                    'client.documents.success.description',
                    'Başvuru takip sistemine geçerek sürecinizi takip edebilirsiniz.'
                  )}
                </p>
              </div>
            </div>
            <Button 
              size="lg"
              className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
              onClick={() => window.location.href = '/client/dashboard'}
            >
              {translate('client.documents.success.cta', 'Başvuru Takip Sistemine Geç')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
