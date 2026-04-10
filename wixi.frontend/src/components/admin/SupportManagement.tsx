import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { 
  MessageSquare, 
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  User,
  Calendar,
  Tag,
  Search,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { supportService } from '../../ApiServices/services';
import type { ISupportTicketResponseDto, ISupportMessageDto } from '../../ApiServices/types/SupportTypes';
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

const SupportManagement: React.FC = () => {
  const [tickets, setTickets] = useState<ISupportTicketResponseDto[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<ISupportTicketResponseDto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      console.log('🎫 Loading all tickets...');
      // Service already parses the response, so data is already an array
      const data = await supportService.getAllTickets();
      console.log('🎫 Tickets Data:', data);
      console.log('🎫 Tickets Array:', Array.isArray(data) ? data : []);
      
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Error loading tickets:', error);
      toast.error('Destek talepleri yüklenirken hata oluştu');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = async (ticket: ISupportTicketResponseDto) => {
    console.log('🎫 Viewing ticket:', ticket);
    // Reload ticket to ensure we have the latest data including messages
    try {
      const response: any = await supportService.getTicketById(ticket.id);
      const fullTicket = response?.data || response;
      console.log('🎫 Full ticket data:', fullTicket);
      setSelectedTicket(fullTicket || ticket);
    } catch (error) {
      console.error('Error loading ticket details:', error);
      // Fallback to the ticket from list if detail fetch fails
      setSelectedTicket(ticket);
    }
    setDetailsDialogOpen(true);
    setNewMessage('');
  };

  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    try {
      setSendingMessage(true);
      // Get current user ID from auth (you may need to implement this)
      const currentUserId = 1; // Placeholder - should come from auth context
      
      await supportService.addMessage({
        ticketId: selectedTicket.id,
        senderId: currentUserId,
        messageText: newMessage
      });

      toast.success('Mesaj gönderildi');
      setNewMessage('');
      
      // Reload ticket to get updated messages
      const response: any = await supportService.getTicketById(selectedTicket.id);
      const updatedTicket = response?.data || response;
      console.log('📝 Updated ticket after message:', updatedTicket);
      
      if (updatedTicket) {
        setSelectedTicket(updatedTicket);
      }
      
      // Update tickets list
      loadTickets();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Mesaj gönderilirken hata oluştu');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleUpdateStatus = async (ticketId: number, newStatus: string) => {
    try {
      await supportService.updateTicketStatus(ticketId, { status: newStatus });
      toast.success('Durum güncellendi');
      loadTickets();
      if (selectedTicket?.id === ticketId) {
        const response: any = await supportService.getTicketById(ticketId);
        const updatedTicket = response?.data || response;
        console.log('📝 Updated ticket after status change:', updatedTicket);
        
        if (updatedTicket) {
          setSelectedTicket(updatedTicket);
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Durum güncellenirken hata oluştu');
    }
  };

  const getStatusColor = (status: string | null | undefined) => {
    if (!status) return 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-400';
    
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-blue-500/20 text-blue-700 dark:bg-blue-500/30 dark:text-blue-400';
      case 'inprogress':
        return 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/30 dark:text-yellow-400';
      case 'resolved':
        return 'bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-400';
      case 'closed':
        return 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string | null | undefined) => {
    if (!priority) return 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-400';
    
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

  const filteredTickets = Array.isArray(tickets)
    ? tickets.filter(ticket => {
        const subject = ticket.subject || '';
        const clientName = ticket.clientName || '';
        const ticketNumber = ticket.ticketNumber || '';
        const status = ticket.status || '';
        const priority = ticket.priority || '';
        
        const matchesSearch = 
          subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || status.toLowerCase() === filterStatus.toLowerCase();
        const matchesPriority = filterPriority === 'all' || priority.toLowerCase() === filterPriority.toLowerCase();
        return matchesSearch && matchesStatus && matchesPriority;
      })
    : [];

  const statistics = {
    total: Array.isArray(tickets) ? tickets.length : 0,
    open: Array.isArray(tickets) ? tickets.filter(t => t.status?.toLowerCase() === 'open').length : 0,
    inProgress: Array.isArray(tickets) ? tickets.filter(t => t.status?.toLowerCase() === 'inprogress').length : 0,
    resolved: Array.isArray(tickets) ? tickets.filter(t => t.status?.toLowerCase() === 'resolved').length : 0,
  };

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Destek Talepleri</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Müşteri destek taleplerini yönetin</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Toplam Talep</p>
                <p className="text-3xl font-bold mt-1">{statistics.total}</p>
              </div>
              <MessageSquare className="w-10 h-10 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Açık</p>
                <p className="text-3xl font-bold mt-1 text-blue-600">{statistics.open}</p>
              </div>
              <Clock className="w-10 h-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">İşleniyor</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{statistics.inProgress}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Çözümlendi</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{statistics.resolved}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Konu, müşteri veya ticket numarası ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Durum Filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="open">Açık</SelectItem>
                <SelectItem value="inprogress">İşleniyor</SelectItem>
                <SelectItem value="resolved">Çözümlendi</SelectItem>
                <SelectItem value="closed">Kapatıldı</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Öncelik Filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Öncelikler</SelectItem>
                <SelectItem value="urgent">Acil</SelectItem>
                <SelectItem value="high">Yüksek</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="low">Düşük</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Destek Talepleri ({filteredTickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">Destek talebi bulunamadı</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                  onClick={() => handleViewTicket(ticket)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{ticket.subject}</h3>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{ticket.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{ticket.clientName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          <span>{ticket.ticketNumber}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(ticket.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{ticket.messageCount} mesaj</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Destek Talebi Detayı</DialogTitle>
            <DialogDescription>
              {selectedTicket?.ticketNumber} - {selectedTicket?.subject}
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
              {/* Ticket Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <label className="text-sm text-gray-500">Müşteri</label>
                  <p className="font-medium">{selectedTicket.clientName || 'Bilinmeyen'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Durum</label>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(selectedTicket.status)}>
                      {selectedTicket.status || 'Belirtilmemiş'}
                    </Badge>
                    <Badge className={getPriorityColor(selectedTicket.priority)}>
                      {selectedTicket.priority || 'Belirtilmemiş'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Oluşturma Tarihi</label>
                  <p className="font-medium">
                    {selectedTicket.createdAt 
                      ? new Date(selectedTicket.createdAt).toLocaleString('tr-TR', { 
                          year: 'numeric', 
                          month: '2-digit', 
                          day: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })
                      : 'Tarih bilgisi yok'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Kategori</label>
                  <p className="font-medium">{selectedTicket.category || 'Belirtilmemiş'}</p>
                </div>
                {selectedTicket.assignedToUserName && (
                  <div>
                    <label className="text-sm text-gray-500">Atanan</label>
                    <p className="font-medium">{selectedTicket.assignedToUserName}</p>
                  </div>
                )}
              </div>

              {/* Status Update */}
              <div className="flex gap-2">
                <Select
                  value={selectedTicket.status}
                  onValueChange={(value) => handleUpdateStatus(selectedTicket.id, value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Açık</SelectItem>
                    <SelectItem value="InProgress">İşleniyor</SelectItem>
                    <SelectItem value="Resolved">Çözümlendi</SelectItem>
                    <SelectItem value="Closed">Kapatıldı</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Messages */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <h3 className="font-semibold mb-3">Mesajlar</h3>
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                    selectedTicket.messages.map((message) => {
                      const senderRole = message.senderRole?.toLowerCase() || '';
                      return (
                      <div
                        key={message.id}
                        className={`p-3 rounded-lg ${
                          senderRole === 'client'
                            ? 'bg-blue-50 dark:bg-blue-900/20 ml-12'
                            : 'bg-gray-100 dark:bg-gray-800 mr-12'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{message.senderName || 'Bilinmeyen'}</span>
                          <span className="text-xs text-gray-500">
                            {message.sentAt 
                              ? new Date(message.sentAt).toLocaleString('tr-TR', { 
                                  year: 'numeric', 
                                  month: '2-digit', 
                                  day: '2-digit', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })
                              : 'Tarih yok'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{message.messageText}</p>
                      </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-gray-500">Henüz mesaj yok</p>
                  )}
                </div>

                {/* Send Message */}
                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Mesajınızı yazın..."
                    rows={2}
                    disabled={sendingMessage}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="px-6"
                  >
                    {sendingMessage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportManagement;

