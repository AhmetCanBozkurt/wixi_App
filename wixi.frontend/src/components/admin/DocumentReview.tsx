import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Download,
  Eye,
  Filter,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { documentService } from '../../ApiServices/services';
import type { IDocumentResponseDto, IDocumentReviewStatistics } from '../../ApiServices/types/DocumentTypes';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

const DocumentReview: React.FC = () => {
  const [documents, setDocuments] = useState<IDocumentResponseDto[]>([]);
  const [statistics, setStatistics] = useState<IDocumentReviewStatistics | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<IDocumentResponseDto | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<'Accepted' | 'Rejected' | 'MissingInfo'>('Accepted');
  const [reviewNote, setReviewNote] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('📄 Loading document review data...');
      
      // Load statistics
      const statsResponse: any = await documentService.getReviewStatistics();
      console.log('📊 Stats Response:', statsResponse);
      const statsData = statsResponse?.data || statsResponse;
      setStatistics(statsData);

      // Load documents based on filter
      let docsData: IDocumentResponseDto[];
      if (filterStatus === 'all') {
        docsData = await documentService.getPendingDocuments();
      } else {
        docsData = await documentService.getDocumentsByStatus(filterStatus);
      }
      console.log('📄 Documents Response:', docsData);
      
      setDocuments(Array.isArray(docsData) ? docsData : []);
    } catch (error) {
      console.error('❌ Error loading documents:', error);
      toast.error('Belgeler yüklenirken hata oluştu');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (doc: IDocumentResponseDto) => {
    setSelectedDocument(doc);
    setReviewDialogOpen(true);
    setReviewNote('');
    setFeedbackMessage('');
    setReviewDecision('Accepted');
  };

  const handleSubmitReview = async () => {
    if (!selectedDocument) return;

    try {
      setSubmitting(true);
      await documentService.reviewDocument(selectedDocument.id, {
        documentId: selectedDocument.id,
        decision: reviewDecision,
        reviewNote,
        feedbackMessage
      });
      
      toast.success('Belge başarıyla incelendi');
      setReviewDialogOpen(false);
      loadData(); // Reload data
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('İnceleme kaydedilirken hata oluştu');
    } finally {
      setSubmitting(false);
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

  const handleView = async (doc: IDocumentResponseDto) => {
    try {
      const blob = await documentService.downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      toast.success('Belge yeni sekmede açılıyor');
    } catch (error) {
      console.error('Error viewing document:', error);
      toast.error('Belge görüntülenirken hata oluştu');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'underreview':
        return <Eye className="w-5 h-5 text-blue-600" />;
      case 'missinginfo':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/30 dark:text-yellow-400';
      case 'underreview':
        return 'bg-blue-500/20 text-blue-700 dark:bg-blue-500/30 dark:text-blue-400';
      case 'missinginfo':
        return 'bg-orange-500/20 text-orange-700 dark:bg-orange-500/30 dark:text-orange-400';
      default:
        return 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-400';
    }
  };

  if (loading && !statistics) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Belge İnceleme</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Yüklenen belgeleri inceleyin ve onaylayın</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('all')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                <p className="text-2xl font-bold">{statistics.totalDocuments || 0}</p>
                <p className="text-sm text-gray-500">Toplam</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('Pending')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
                <p className="text-2xl font-bold">{statistics.pendingForReview || 0}</p>
                <p className="text-sm text-gray-500">Bekliyor</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('Accepted')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-600 mb-2" />
                <p className="text-2xl font-bold">{statistics.accepted || 0}</p>
                <p className="text-sm text-gray-500">Onaylı</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('Rejected')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <XCircle className="w-8 h-8 mx-auto text-red-600 mb-2" />
                <p className="text-2xl font-bold">{statistics.rejected || 0}</p>
                <p className="text-sm text-gray-500">Reddedildi</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('MissingInfo')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 mx-auto text-orange-600 mb-2" />
                <p className="text-2xl font-bold">{statistics.missingInfo || 0}</p>
                <p className="text-sm text-gray-500">Eksik Bilgi</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Documents List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Belgeler {filterStatus !== 'all' && `(${filterStatus})`}
            </CardTitle>
            {filterStatus !== 'all' && (
              <Button variant="outline" size="sm" onClick={() => setFilterStatus('all')}>
                <Filter className="w-4 h-4 mr-2" />
                Tüm Belgeler
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">Belge bulunmuyor</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {getStatusIcon(doc.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-white">{doc.originalFileName}</p>
                        <Badge className={getStatusBadgeColor(doc.status)}>
                          {doc.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>{doc.clientName}</span>
                        <span>•</span>
                        <span>{doc.documentTypeName}</span>
                        <span>•</span>
                        <span>{doc.fileSizeFormatted}</span>
                        <span>•</span>
                        <span>{new Date(doc.uploadedAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                      {doc.hasReview && doc.feedbackMessage && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Geri Bildirim: {doc.feedbackMessage}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(doc)}
                      title="Görüntüle"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                      title="İndir"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    {(doc.status.toLowerCase() === 'pending' || doc.status.toLowerCase() === 'underreview') && (
                      <Button
                        size="sm"
                        onClick={() => handleReviewClick(doc)}
                      >
                        İncele
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Belge İnceleme</DialogTitle>
            <DialogDescription className="text-base">
              {selectedDocument?.originalFileName} dosyasını inceliyorsunuz
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Document Info */}
            <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <label className="text-gray-600 dark:text-gray-400 font-semibold block mb-1">Müşteri:</label>
                  <p className="font-medium text-gray-900 dark:text-white text-base">
                    {selectedDocument?.clientName || 'Bilinmiyor'}
                  </p>
                  {selectedDocument?.clientCode && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span className="font-semibold">Müşteri Kodu:</span> {selectedDocument.clientCode}
                    </p>
                  )}
                  {selectedDocument?.clientEmail && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span className="font-semibold">E-posta:</span> {selectedDocument.clientEmail}
                    </p>
                  )}
                  {selectedDocument?.clientPhone && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Telefon:</span> {selectedDocument.clientPhone}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-gray-600 dark:text-gray-400 font-semibold block mb-1">Belge Türü:</label>
                  <p className="font-medium text-gray-900 dark:text-white text-base">
                    {selectedDocument?.documentTypeName || 'Bilinmiyor'}
                  </p>
                </div>
                <div>
                  <label className="text-gray-600 dark:text-gray-400 font-semibold block mb-1">Dosya Boyutu:</label>
                  <p className="font-medium text-gray-900 dark:text-white text-base">
                    {selectedDocument?.fileSizeFormatted || 'Bilinmiyor'}
                  </p>
                </div>
                <div>
                  <label className="text-gray-600 dark:text-gray-400 font-semibold block mb-1">Yüklenme Tarihi:</label>
                  <p className="font-medium text-gray-900 dark:text-white text-base">
                    {selectedDocument && new Date(selectedDocument.uploadedAt).toLocaleDateString('tr-TR', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              {/* View and Download Buttons */}
              <div className="flex gap-3 pt-4 border-t-2 border-gray-300 dark:border-gray-600">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedDocument && handleView(selectedDocument)}
                  className="flex-1 border-2 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Belgeyi Görüntüle
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedDocument && handleDownload(selectedDocument)}
                  className="flex-1 border-2 border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/20 font-semibold"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Belgeyi İndir
                </Button>
              </div>
            </div>

            {/* Decision */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Karar</label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={reviewDecision === 'Accepted' ? 'default' : 'outline'}
                  onClick={() => setReviewDecision('Accepted')}
                  className={`w-full h-12 font-semibold transition-all ${
                    reviewDecision === 'Accepted' 
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' 
                      : 'border-2 border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Onayla
                </Button>
                <Button
                  variant={reviewDecision === 'Rejected' ? 'default' : 'outline'}
                  onClick={() => setReviewDecision('Rejected')}
                  className={`w-full h-12 font-semibold transition-all ${
                    reviewDecision === 'Rejected' 
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg' 
                      : 'border-2 border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                  }`}
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Reddet
                </Button>
                <Button
                  variant={reviewDecision === 'MissingInfo' ? 'default' : 'outline'}
                  onClick={() => setReviewDecision('MissingInfo')}
                  className={`w-full h-12 font-semibold transition-all ${
                    reviewDecision === 'MissingInfo' 
                      ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg' 
                      : 'border-2 border-gray-300 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Eksik Bilgi
                </Button>
              </div>
            </div>

            {/* Review Note (Admin) */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">İnceleme Notu (Admin İçin)</label>
              <Textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="İç notlar... (Sadece yöneticiler görebilir)"
                rows={3}
                className="border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Feedback Message (Client) */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Geri Bildirim Mesajı (Müşteri İçin)</label>
              <Textarea
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="Müşteriye gönderilecek mesaj..."
                rows={3}
                className="border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              disabled={submitting}
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                'İncelemeyi Kaydet'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentReview;

