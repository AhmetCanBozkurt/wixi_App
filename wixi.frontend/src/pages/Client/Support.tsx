import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { 
  MessageSquare, 
  Send, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Zap,
  Shield,
  Headphones,
  Loader2,
  Clock,
  AlertCircle,
  ArrowRight,
  Eye,
  Tag,
  User,
  Calendar,
  MessageCircle,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { supportService } from '../../ApiServices/services';
import type { ISupportTicketResponseDto, IFAQDto } from '../../ApiServices/types/SupportTypes';
import { useLanguage } from '../../contexts/language-context';

const Support: React.FC = () => {
  const { language } = useLanguage();
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('General');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [expandedTicket, setExpandedTicket] = useState<number | null>(null);
  const [tickets, setTickets] = useState<ISupportTicketResponseDto[]>([]);
  const [faqs, setFaqs] = useState<IFAQDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);
  const [ticketMessages, setTicketMessages] = useState<{ [key: number]: string }>({});
  const [sendingMessage, setSendingMessage] = useState<{ [key: number]: boolean }>({});
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'faq' | 'tickets'>('tickets');

  // Helper function to get FAQ question based on current language
  const getFAQQuestion = (faq: IFAQDto): string => {
    const lang = language.toUpperCase();
    switch (lang) {
      case 'TR':
        return faq.question_TR || faq.question || '';
      case 'EN':
        return faq.question_EN || faq.questionEn || faq.question_TR || faq.question || '';
      case 'DE':
        return faq.question_DE || faq.question_EN || faq.questionEn || faq.question_TR || faq.question || '';
      case 'AR':
        return faq.question_AR || faq.question_TR || faq.question || '';
      default:
        return faq.question_TR || faq.question || '';
    }
  };

  // Helper function to get FAQ answer based on current language
  const getFAQAnswer = (faq: IFAQDto): string => {
    const lang = language.toUpperCase();
    switch (lang) {
      case 'TR':
        return faq.answer_TR || faq.answer || '';
      case 'EN':
        return faq.answer_EN || faq.answerEn || faq.answer_TR || faq.answer || '';
      case 'DE':
        return faq.answer_DE || faq.answer_EN || faq.answerEn || faq.answer_TR || faq.answer || '';
      case 'AR':
        return faq.answer_AR || faq.answer_TR || faq.answer || '';
      default:
        return faq.answer_TR || faq.answer || '';
    }
  };

  // Helper function to get category label in Turkish
  const getCategoryLabel = (category: string | null | undefined): string => {
    if (!category) return 'Genel';
    
    switch (category.toLowerCase()) {
      case 'general':
        return 'Genel';
      case 'documents':
        return 'Belgeler';
      case 'process':
        return 'Süreç';
      case 'recognition':
        return 'Denklik';
      case 'workpermit':
        return 'Çalışma İzni';
      default:
        return category;
    }
  };

  useEffect(() => {
    loadSupportData();
  }, []);

  const loadSupportData = async () => {
    console.log('🚀 Loading support data...');
    setLoading(true);
    
    // Get current user info first
    let currentClientId: number | null = null;
    
    try {
      const { authService } = await import('../../ApiServices/services');
      const currentUser = await authService.getCurrentUser(false);
      
      if (currentUser) {
        // Store current user ID for sending messages
        setCurrentUserId(currentUser.id);
        
        // Get client data by user ID
        try {
          const { clientService } = await import('../../ApiServices/services');
          const clientResponse: any = await clientService.getClientByUserId(currentUser.id);
          const clientData = clientResponse?.data || clientResponse;
          currentClientId = clientData?.id || null;
        } catch (clientError) {
          console.warn('⚠️ Could not load client by user ID:', clientError);
        }
      }
    } catch (userError) {
      console.warn('⚠️ Could not load user info:', userError);
    }
    
    if (!currentClientId) {
      console.warn('⚠️ No client ID found, cannot load tickets');
      setTickets([]);
    } else {
      // Load tickets (independent try-catch)
      try {
        console.log('📞 Fetching tickets for client:', currentClientId);
        const ticketsResponse: any = await supportService.getClientTickets(currentClientId);
        console.log('📊 Tickets Response:', ticketsResponse);
        
        // Extract data from response - backend may return {success, data, count}
        const ticketsData = ticketsResponse?.data || ticketsResponse || [];
        console.log('✅ Tickets Data:', ticketsData);
        
        // Normalize ticket data - map backend fields to frontend expected fields
        const normalizedTickets = (Array.isArray(ticketsData) ? ticketsData : []).map((ticket: any) => ({
          ...ticket,
          // Ensure messages are normalized
          messages: Array.isArray(ticket.messages) ? ticket.messages.map((msg: any) => ({
            ...msg,
            messageText: msg.messageText || msg.message || msg.Message || '',
            sentAt: msg.sentAt || msg.createdAt || msg.CreatedAt || '',
            senderName: msg.senderName || msg.SenderName || 'Unknown',
            senderRole: msg.senderRole || msg.SenderRole || (msg.isFromClient ? 'Client' : 'Support')
          })) : []
        }));
        
        setTickets(normalizedTickets);
      } catch (error) {
        console.error('❌ Error loading tickets:', error);
        console.warn('⚠️ Continuing without tickets...');
        setTickets([]);
        // Don't show error toast - continue loading FAQs
      }
    }

    // Load FAQs (independent try-catch)
    try {
      console.log('📞 Fetching FAQs...');
      const faqsResponse: any = await supportService.getAllFAQs();
      console.log('📊 FAQs Response:', faqsResponse);
      
      // Extract data from response
      const faqsData = faqsResponse?.data || faqsResponse || [];
      console.log('✅ FAQs Data:', faqsData);
      
      // Filter active FAQs
      const activeFaqs = Array.isArray(faqsData) ? faqsData.filter(f => f && f.isActive) : [];
      console.log('✅ Active FAQs:', activeFaqs.length);
      setFaqs(activeFaqs);
    } catch (error) {
      console.error('❌ Error loading FAQs:', error);
      toast.error('SSS yüklenirken hata oluştu');
      setFaqs([]);
    }
    
    console.log('🏁 Support data loading finished');
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      toast.error('Lütfen konu ve mesaj alanlarını doldurun');
      return;
    }

    try {
      setSubmitting(true);
      
      // Get current user info to find client ID
      let currentClientId: number | null = null;
      try {
        const { authService, clientService } = await import('../../ApiServices/services');
        const currentUser = await authService.getCurrentUser(false);
        if (currentUser) {
          const clientResponse: any = await clientService.getClientByUserId(currentUser.id);
          const clientData = clientResponse?.data || clientResponse;
          currentClientId = clientData?.id || null;
        }
      } catch (error) {
        console.error('❌ Error getting client ID:', error);
        toast.error('Müşteri bilgisi alınamadı');
        setSubmitting(false);
        return;
      }
      
      if (!currentClientId) {
        toast.error('Müşteri bilgisi bulunamadı');
        setSubmitting(false);
        return;
      }
      
      await supportService.createTicket({
        clientId: currentClientId,
        subject: subject,
        description: message,
        priority: priority as any,
        category: category
      });
      
      toast.success('Destek talebiniz oluşturuldu. En kısa sürede size dönüş yapacağız.');
      
      // Reset form
      setMessage('');
      setSubject('');
      setPriority('Medium');
      setCategory('General');
      
      // Close modal
      setIsCreateTicketModalOpen(false);
      
      // Ensure we stay on the tickets tab
      setActiveTab('tickets');
      
      // Reload tickets
      await loadSupportData();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Destek talebi oluşturulurken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (ticketId: number) => {
    const messageText = ticketMessages[ticketId]?.trim();
    
    if (!messageText) {
      toast.error('Lütfen mesajınızı yazın');
      return;
    }

    if (!currentUserId) {
      toast.error('Kullanıcı bilgisi bulunamadı');
      return;
    }

    try {
      setSendingMessage(prev => ({ ...prev, [ticketId]: true }));
      
      const result = await supportService.addMessage({
        ticketId: ticketId,
        senderId: currentUserId,
        messageText: messageText
      });

      // Clear message input
      setTicketMessages(prev => ({ ...prev, [ticketId]: '' }));
      
      // Reload tickets to show new message
      await loadSupportData();
      
      toast.success('Mesajınız gönderildi');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Mesaj gönderilirken hata oluştu');
    } finally {
      setSendingMessage(prev => ({ ...prev, [ticketId]: false }));
    }
  };

  const getStatusColor = (status: string | null | undefined) => {
    if (!status) {
      return {
        badge: 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-400',
        border: 'border-gray-300 dark:border-gray-700',
        bg: 'bg-gray-50 dark:bg-gray-800/50',
        icon: 'text-gray-600 dark:text-gray-400'
      };
    }
    
    switch (status.toLowerCase()) {
      case 'open':
        return {
          badge: 'bg-blue-500/20 text-blue-700 dark:bg-blue-500/30 dark:text-blue-400',
          border: 'border-blue-300 dark:border-blue-700',
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          icon: 'text-blue-600 dark:text-blue-400'
        };
      case 'inprogress':
        return {
          badge: 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/30 dark:text-yellow-400',
          border: 'border-yellow-300 dark:border-yellow-700',
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          icon: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'resolved':
        return {
          badge: 'bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-400',
          border: 'border-green-300 dark:border-green-700',
          bg: 'bg-green-50 dark:bg-green-900/20',
          icon: 'text-green-600 dark:text-green-400'
        };
      case 'closed':
        return {
          badge: 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-400',
          border: 'border-gray-300 dark:border-gray-700',
          bg: 'bg-gray-50 dark:bg-gray-800/50',
          icon: 'text-gray-600 dark:text-gray-400'
        };
      default:
        return {
          badge: 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-400',
          border: 'border-gray-300 dark:border-gray-700',
          bg: 'bg-gray-50 dark:bg-gray-800/50',
          icon: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  const getPriorityColor = (priority: string | null | undefined) => {
    if (!priority) {
      return 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-400';
    }
    
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-400';
      case 'high':
        return 'bg-orange-500/20 text-orange-700 dark:bg-orange-500/30 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/30 dark:text-yellow-400';
      case 'low':
        return 'bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string | null | undefined) => {
    if (!status) return 'Bilinmiyor';
    
    switch (status.toLowerCase()) {
      case 'open':
        return 'Açık';
      case 'inprogress':
        return 'İşlemde';
      case 'resolved':
        return 'Çözüldü';
      case 'closed':
        return 'Kapatıldı';
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority: string | null | undefined) => {
    if (!priority) return 'Bilinmiyor';
    
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'Acil';
      case 'high':
        return 'Yüksek';
      case 'medium':
        return 'Orta';
      case 'low':
        return 'Düşük';
      default:
        return priority;
    }
  };

  const getTicketCategoryLabel = (category: string | null | undefined) => {
    if (!category) return 'Genel';
    
    switch (category.toLowerCase()) {
      case 'general':
        return 'Genel';
      case 'technical':
        return 'Teknik';
      case 'billing':
        return 'Ödeme';
      case 'other':
        return 'Diğer';
      default:
        return category;
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Tarih belirtilmemiş';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Geçersiz tarih';
      
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Tarih hatası';
    }
  };

  const getTimeAgo = (dateString: string | null | undefined) => {
    if (!dateString) return 'Tarih belirtilmemiş';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Geçersiz tarih';
      
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Az önce';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} gün önce`;
      return formatDate(dateString);
    } catch (error) {
      return 'Tarih hatası';
    }
  };

  const features = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Hızlı Yanıt',
      description: '24 saat içinde',
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Güvenli İletişim',
      description: 'Şifreli bağlantı',
    },
    {
      icon: <Headphones className="w-5 h-5" />,
      title: 'Uzman Destek',
      description: '7/24 yardım',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
              Destek & Yardım
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Size nasıl yardımcı olabiliriz? Sorularınız için buradayız.
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {features.map((feature, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'faq' | 'tickets')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-12 bg-gray-100 dark:bg-gray-800 p-1">
          <TabsTrigger 
            value="faq" 
            className="flex items-center gap-2 font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400"
          >
            <HelpCircle className="w-4 h-4" />
            Sık Sorulan Sorular
          </TabsTrigger>
          <TabsTrigger 
            value="tickets" 
            className="flex items-center gap-2 font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400"
          >
            <MessageSquare className="w-4 h-4" />
            Destek Taleplerim
          </TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              {faqs.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Henüz SSS bulunmuyor</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {faqs.map((faq) => {
                    const question = getFAQQuestion(faq);
                    const answer = getFAQAnswer(faq);
                    const isExpanded = expandedFaq === faq.id;
                    
                    return (
                      <div
                        key={faq.id}
                        className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <button
                          onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                          className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="font-semibold text-gray-900 dark:text-white flex-1 text-base">
                              {question || `Soru ${faq.id}`}
                            </span>
                            {faq.category && (
                              <Badge variant="outline" className="text-xs flex-shrink-0 border-gray-400 dark:border-gray-500">
                                {getCategoryLabel(faq.category)}
                              </Badge>
                            )}
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-700 dark:text-gray-300 flex-shrink-0 ml-2" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-700 dark:text-gray-300 flex-shrink-0 ml-2" />
                          )}
                        </button>
                        
                        {isExpanded && (
                          <div className="px-5 pb-5 border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mt-4 leading-relaxed">
                              {answer || 'Cevap bulunamadı'}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tickets Tab */}
        <TabsContent value="tickets" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Destek Taleplerim
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Tüm destek taleplerinizi buradan görüntüleyebilir ve yeni talep oluşturabilirsiniz.
                  </p>
                </div>
                <Button
                  onClick={() => setIsCreateTicketModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Talep Oluştur
                </Button>
              </div>

              {tickets.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Henüz destek talebiniz bulunmuyor.
                  </p>
                  <Button
                    onClick={() => setIsCreateTicketModalOpen(true)}
                    variant="outline"
                    className="flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    İlk Talebinizi Oluşturun
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => {
                    const statusColors = getStatusColor(ticket.status);
                    const isExpanded = expandedTicket === ticket.id;
                    
                    return (
                      <div
                        key={ticket.id}
                        className={`border rounded-lg transition-all ${statusColors.border} ${isExpanded ? statusColors.bg : ''}`}
                      >
                        <button
                          onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                          className="w-full p-4 text-left"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-3 mb-2">
                                <div className={`p-2 rounded-lg ${statusColors.bg} ${statusColors.icon}`}>
                                  <MessageSquare className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-base">
                                      {ticket.subject}
                                    </h4>
                                    <Badge className={statusColors.badge} variant="outline">
                                      {getStatusLabel(ticket.status)}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-3 flex-wrap text-sm text-gray-600 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                      <Tag className="w-3 h-3" />
                                      #{ticket.ticketNumber}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {formatDate(ticket.createdAt)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MessageCircle className="w-3 h-3" />
                                      {ticket.messageCount} mesaj
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 flex-wrap mt-2">
                                <Badge className={getPriorityColor(ticket.priority)}>
                                  {getPriorityLabel(ticket.priority)}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {getTicketCategoryLabel(ticket.category)}
                                </Badge>
                                {ticket.lastMessageAt && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Son mesaj: {getTimeAgo(ticket.lastMessageAt)}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </button>
                        
                        {isExpanded && (
                          <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
                            <div className="space-y-4">
                              {/* Ticket Details */}
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Oluşturulma:</span>
                                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                                    {formatDate(ticket.createdAt)}
                                  </p>
                                </div>
                                {ticket.resolvedAt && (
                                  <div>
                                    <span className="text-gray-500 dark:text-gray-400">Çözülme:</span>
                                    <p className="font-medium text-gray-900 dark:text-white mt-1">
                                      {formatDate(ticket.resolvedAt)}
                                    </p>
                                  </div>
                                )}
                                {ticket.assignedToUserName && (
                                  <div className="col-span-2">
                                    <span className="text-gray-500 dark:text-gray-400">Atanan:</span>
                                    <p className="font-medium text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                                      <User className="w-4 h-4" />
                                      {ticket.assignedToUserName}
                                    </p>
                                  </div>
                                )}
                              </div>
                              
                              {/* Description */}
                              <div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                  Açıklama:
                                </span>
                                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                                  {ticket.description}
                                </p>
                              </div>
                              
                              {/* Messages */}
                              {ticket.messages && ticket.messages.length > 0 && (
                                <div className="mb-4">
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                                    Mesajlar ({ticket.messages.length}):
                                  </span>
                                  <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {ticket.messages.map((msg) => (
                                      <div
                                        key={msg.id}
                                        className={`p-3 rounded-lg ${
                                          msg.senderRole === 'Client'
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                            : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                              {msg.senderName}
                                            </span>
                                            <Badge variant="outline" className="text-xs">
                                              {msg.senderRole === 'Client' ? 'Müşteri' : 'Destek'}
                                            </Badge>
                                          </div>
                                          <span className="text-xs text-gray-500">
                                            {formatDate(msg.sentAt)}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                          {msg.messageText}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Message Input - Only show if ticket is open or in progress */}
                              {(ticket.status === 'Open' || ticket.status === 'InProgress' || ticket.status === 'WaitingForCustomer' || ticket.status === 'Reopened') && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                  <Label htmlFor={`ticket-message-${ticket.id}`} className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Yeni Mesaj Gönder
                                  </Label>
                                  <div className="flex gap-2">
                                    <Textarea
                                      id={`ticket-message-${ticket.id}`}
                                      placeholder="Mesajınızı yazın..."
                                      value={ticketMessages[ticket.id] || ''}
                                      onChange={(e) => setTicketMessages(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                                      className="flex-1 min-h-[80px]"
                                      disabled={sendingMessage[ticket.id]}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                          e.preventDefault();
                                          handleSendMessage(ticket.id);
                                        }
                                      }}
                                    />
                                    <Button
                                      onClick={() => handleSendMessage(ticket.id)}
                                      disabled={sendingMessage[ticket.id] || !ticketMessages[ticket.id]?.trim()}
                                      className="self-end"
                                      type="button"
                                    >
                                      {sendingMessage[ticket.id] ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Send className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Ctrl+Enter ile gönderebilirsiniz
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Ticket Modal */}
      <Dialog open={isCreateTicketModalOpen} onOpenChange={setIsCreateTicketModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Yeni Destek Talebi Oluştur</DialogTitle>
            <DialogDescription>
              Destek ekibimize ulaşmak için lütfen aşağıdaki formu doldurun.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="modal-subject">Konu *</Label>
              <Input
                id="modal-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Destek talebinizin konusu"
                required
                disabled={submitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="modal-priority">Öncelik *</Label>
                <select
                  id="modal-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                  disabled={submitting}
                  required
                >
                  <option value="Low">Düşük</option>
                  <option value="Medium">Orta</option>
                  <option value="High">Yüksek</option>
                  <option value="Urgent">Acil</option>
                </select>
              </div>
              <div>
                <Label htmlFor="modal-category">Kategori *</Label>
                <select
                  id="modal-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                  disabled={submitting}
                  required
                >
                  <option value="General">Genel</option>
                  <option value="Technical">Teknik</option>
                  <option value="Billing">Ödeme</option>
                  <option value="Other">Diğer</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="modal-message">Mesajınız *</Label>
              <Textarea
                id="modal-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Detaylı açıklama..."
                rows={6}
                required
                disabled={submitting}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateTicketModalOpen(false)}
                disabled={submitting}
              >
                İptal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Gönder
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Support;
