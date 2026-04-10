import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { supportService } from '../../ApiServices/services';
import type { IFAQDto, IFAQCreateDto, IFAQUpdateDto } from '../../ApiServices/types/SupportTypes';
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

const FAQManagement: React.FC = () => {
  const [faqs, setFaqs] = useState<IFAQDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<IFAQDto | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(true);

  // Form state
  const [formData, setFormData] = useState<IFAQCreateDto>({
    category: '',
    question_TR: '',
    question_EN: '',
    question_DE: '',
    question_AR: '',
    answer_TR: '',
    answer_EN: '',
    answer_DE: '',
    answer_AR: '',
    displayOrder: 0,
    isFeatured: false
  });

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    console.log('🚀 Loading FAQs...');
    try {
      setLoading(true);
      const data = await supportService.getAllFAQs();
      console.log('📊 FAQs Response:', data);
      console.log('✅ FAQs Data:', data);
      
      // Map backend response to frontend format with multi-language support
      const mappedData = Array.isArray(data) ? data.map((faq: any) => ({
        ...faq,
        // Ensure multi-language fields exist
        question_TR: faq.question_TR || faq.Question_TR || faq.question || '',
        question_EN: faq.question_EN || faq.Question_EN || faq.questionEn || '',
        question_DE: faq.question_DE || faq.Question_DE || '',
        question_AR: faq.question_AR || faq.Question_AR || '',
        answer_TR: faq.answer_TR || faq.Answer_TR || faq.answer || '',
        answer_EN: faq.answer_EN || faq.Answer_EN || faq.answerEn || '',
        answer_DE: faq.answer_DE || faq.Answer_DE || '',
        answer_AR: faq.answer_AR || faq.Answer_AR || '',
        // Legacy fields for backward compatibility (default to TR)
        question: faq.question_TR || faq.Question_TR || faq.question || '',
        answer: faq.answer_TR || faq.Answer_TR || faq.answer || '',
        questionEn: faq.question_EN || faq.Question_EN || faq.questionEn || '',
        answerEn: faq.answer_EN || faq.Answer_EN || faq.answerEn || ''
      })) : [];
      
      setFaqs(mappedData);
      console.log('✅ FAQs set to state:', mappedData);
    } catch (error) {
      console.error('❌ Error loading FAQs:', error);
      toast.error('SSS listesi yüklenirken hata oluştu');
      setFaqs([]);
    } finally {
      console.log('🏁 FAQs loading finished');
      setLoading(false);
    }
  };

  const handleCreateFAQ = () => {
    setEditingFAQ(null);
    setFormData({
      category: '',
      question_TR: '',
      question_EN: '',
      question_DE: '',
      question_AR: '',
      answer_TR: '',
      answer_EN: '',
      answer_DE: '',
      answer_AR: '',
      displayOrder: faqs.length + 1,
      isFeatured: false
    });
    setFormDialogOpen(true);
  };

  const handleEditFAQ = (faq: IFAQDto) => {
    setEditingFAQ(faq);
    setFormData({
      category: faq.category,
      question_TR: faq.question_TR || faq.question || '',
      question_EN: faq.question_EN || faq.questionEn || '',
      question_DE: faq.question_DE || '',
      question_AR: faq.question_AR || '',
      answer_TR: faq.answer_TR || faq.answer || '',
      answer_EN: faq.answer_EN || faq.answerEn || '',
      answer_DE: faq.answer_DE || '',
      answer_AR: faq.answer_AR || '',
      displayOrder: faq.displayOrder,
      isFeatured: faq.isFeatured || false
    });
    setFormDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.category || !formData.question_TR || !formData.answer_TR) {
      toast.error('Lütfen zorunlu alanları doldurun (Kategori, Soru TR, Cevap TR)');
      return;
    }

    try {
      setSubmitting(true);
      if (editingFAQ) {
        // Update
        const updateDto: IFAQUpdateDto = {
          category: formData.category,
          question_TR: formData.question_TR,
          question_EN: formData.question_EN,
          question_DE: formData.question_DE,
          question_AR: formData.question_AR,
          answer_TR: formData.answer_TR,
          answer_EN: formData.answer_EN,
          answer_DE: formData.answer_DE,
          answer_AR: formData.answer_AR,
          displayOrder: formData.displayOrder,
          isFeatured: formData.isFeatured,
          isActive: editingFAQ.isActive
        };
        await supportService.updateFAQ(editingFAQ.id, updateDto);
      } else {
        // Create
        await supportService.createFAQ(formData);
      }
      
      setFormDialogOpen(false);
      await loadFAQs();
      toast.success(editingFAQ ? 'SSS başarıyla güncellendi' : 'SSS başarıyla oluşturuldu');
    } catch (error) {
      console.error('Error saving FAQ:', error);
      toast.error('SSS kaydedilirken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (faqId: number) => {
    if (!confirm('Bu SSS\'yi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await supportService.deleteFAQ(faqId);
      await loadFAQs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    }
  };


  const filteredFAQs = Array.isArray(faqs) ? faqs.filter(faq => {
    if (!faq) return false;
    
    // Search filter - search across all language fields
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' ||
      (faq.question_TR && faq.question_TR.toLowerCase().includes(searchLower)) ||
      (faq.question_EN && faq.question_EN.toLowerCase().includes(searchLower)) ||
      (faq.question_DE && faq.question_DE.toLowerCase().includes(searchLower)) ||
      (faq.question_AR && faq.question_AR.toLowerCase().includes(searchLower)) ||
      (faq.answer_TR && faq.answer_TR.toLowerCase().includes(searchLower)) ||
      (faq.answer_EN && faq.answer_EN.toLowerCase().includes(searchLower)) ||
      (faq.answer_DE && faq.answer_DE.toLowerCase().includes(searchLower)) ||
      (faq.answer_AR && faq.answer_AR.toLowerCase().includes(searchLower)) ||
      // Legacy fields
      (faq.question && faq.question.toLowerCase().includes(searchLower)) ||
      (faq.answer && faq.answer.toLowerCase().includes(searchLower)) ||
      (faq.questionEn && faq.questionEn.toLowerCase().includes(searchLower));
    
    // Category filter
    const matchesCategory = filterCategory === 'all' || (faq.category && faq.category === filterCategory);
    
    return matchesSearch && matchesCategory;
  }) : [];

  const categories = Array.from(new Set(faqs.map(f => f.category)));

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            SSS Yönetimi
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Sıkça sorulan soruları yönetin
          </p>
        </div>
        <Button onClick={handleCreateFAQ} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Yeni SSS Ekle
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-2 border-gray-400 dark:border-gray-600">
        <CardHeader 
          className="pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filtreler</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setFiltersOpen(!filtersOpen);
              }}
              className="h-8 w-8 p-0"
            >
              {filtersOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        {filtersOpen && (
          <CardContent className="pt-0">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="SSS ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 border-gray-400 dark:border-gray-600"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-[200px] border-2 border-gray-400 dark:border-gray-600">
                  <SelectValue placeholder="Kategori Seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Toplam SSS</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{faqs.length}</p>
              </div>
              <HelpCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Aktif</p>
                <p className="text-2xl font-bold text-green-600">
                  {faqs.filter(f => f.isActive).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ List */}
      <Card>
        <CardHeader>
          <CardTitle>SSS Listesi ({filteredFAQs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Henüz SSS bulunmamaktadır
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFAQs.map((faq) => (
                <div
                  key={faq.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                          className="mt-1"
                        >
                          {expandedFAQ === faq.id ? (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{faq.category}</Badge>
                            <Badge className={faq.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                              {faq.isActive ? 'Aktif' : 'Pasif'}
                            </Badge>
                            <span className="text-xs text-gray-500">Sıra: {faq.displayOrder}</span>
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {faq.question_TR || faq.question || 'İsimsiz'}
                          </p>
                          {(faq.question_EN || faq.questionEn) && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {faq.question_EN || faq.questionEn}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditFAQ(faq)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(faq.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {expandedFAQ === faq.id && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="space-y-4">
                        {/* Turkish */}
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Soru (TR):
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {faq.question_TR || faq.question || ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Cevap (TR):
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {faq.answer_TR || faq.answer || ''}
                          </p>
                        </div>
                        {/* English */}
                        {(faq.question_EN || faq.questionEn) && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Question (EN):
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {faq.question_EN || faq.questionEn}
                            </p>
                          </div>
                        )}
                        {(faq.answer_EN || faq.answerEn) && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Answer (EN):
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {faq.answer_EN || faq.answerEn}
                            </p>
                          </div>
                        )}
                        {/* German */}
                        {faq.question_DE && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Frage (DE):
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {faq.question_DE}
                            </p>
                          </div>
                        )}
                        {faq.answer_DE && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Antwort (DE):
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {faq.answer_DE}
                            </p>
                          </div>
                        )}
                        {/* Arabic */}
                        {faq.question_AR && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              السؤال (AR):
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {faq.question_AR}
                            </p>
                          </div>
                        )}
                        {faq.answer_AR && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              الجواب (AR):
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {faq.answer_AR}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingFAQ ? 'SSS Düzenle' : 'Yeni SSS Ekle'}
            </DialogTitle>
            <DialogDescription>
              Sıkça sorulan soru bilgilerini girin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Kategori *</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Örn: Genel, Başvuru, Ödeme"
                  className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Sıralama</label>
                <Input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
            </div>

            {/* Turkish */}
            <div>
              <label className="text-sm font-medium mb-2 block">Soru (Türkçe) *</label>
              <Textarea
                value={formData.question_TR}
                onChange={(e) => setFormData({ ...formData, question_TR: e.target.value })}
                placeholder="Soru girin..."
                rows={2}
                className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Cevap (Türkçe) *</label>
              <Textarea
                value={formData.answer_TR}
                onChange={(e) => setFormData({ ...formData, answer_TR: e.target.value })}
                placeholder="Cevap girin..."
                rows={4}
                className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            {/* English */}
            <div>
              <label className="text-sm font-medium mb-2 block">Question (English) *</label>
              <Textarea
                value={formData.question_EN}
                onChange={(e) => setFormData({ ...formData, question_EN: e.target.value })}
                placeholder="Enter question..."
                rows={2}
                className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Answer (English) *</label>
              <Textarea
                value={formData.answer_EN}
                onChange={(e) => setFormData({ ...formData, answer_EN: e.target.value })}
                placeholder="Enter answer..."
                rows={4}
                className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            {/* German */}
            <div>
              <label className="text-sm font-medium mb-2 block">Frage (Deutsch) *</label>
              <Textarea
                value={formData.question_DE}
                onChange={(e) => setFormData({ ...formData, question_DE: e.target.value })}
                placeholder="Frage eingeben..."
                rows={2}
                className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Antwort (Deutsch) *</label>
              <Textarea
                value={formData.answer_DE}
                onChange={(e) => setFormData({ ...formData, answer_DE: e.target.value })}
                placeholder="Antwort eingeben..."
                rows={4}
                className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            {/* Arabic */}
            <div>
              <label className="text-sm font-medium mb-2 block">السؤال (العربية) *</label>
              <Textarea
                value={formData.question_AR}
                onChange={(e) => setFormData({ ...formData, question_AR: e.target.value })}
                placeholder="أدخل السؤال..."
                rows={2}
                className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                dir="rtl"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">الجواب (العربية) *</label>
              <Textarea
                value={formData.answer_AR}
                onChange={(e) => setFormData({ ...formData, answer_AR: e.target.value })}
                placeholder="أدخل الجواب..."
                rows={4}
                className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                dir="rtl"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                editingFAQ ? 'Güncelle' : 'Oluştur'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FAQManagement;

