import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Edit,
  MessageSquare,
  Upload,
  User,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  Info,
  Download,
  Trash2,
  Circle,
  ChevronRight,
  GraduationCap,
  Building2,
  Plane,
  Pin
} from 'lucide-react';
import { clientService, applicationService, documentService, supportService, clientNoteService } from '../../ApiServices/services';
import DatabaseService from '../../ApiServices/services/DatabaseService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import type { IClientResponseDto } from '../../ApiServices/types/ClientTypes';
import type { IApplicationResponseDto, IApplicationStepResponseDto, IApplicationSubStepResponseDto, IStepUpdateDto, ISubStepUpdateDto } from '../../ApiServices/types/ApplicationTypes';
import type { IDocumentResponseDto } from '../../ApiServices/types/DocumentTypes';
import type { ISupportTicketResponseDto } from '../../ApiServices/types/SupportTypes';
import type { ClientNoteDto, CreateClientNoteDto } from '../../ApiServices/types/ClientNoteTypes';
import { toast } from 'sonner';
import { useI18n } from '../../hooks/useI18n';

const ClientTracking: React.FC = () => {
  const { translate } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<IClientResponseDto | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'documents' | 'applications' | 'support' | 'notes'>('overview');
  const [clients, setClients] = useState<IClientResponseDto[]>([]);
  const [applications, setApplications] = useState<IApplicationResponseDto[]>([]);
  const [documents, setDocuments] = useState<IDocumentResponseDto[]>([]);
  const [supportTickets, setSupportTickets] = useState<ISupportTicketResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<IClientResponseDto | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingClientId, setDeletingClientId] = useState<number | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<IApplicationResponseDto | null>(null);
  const [selectedStep, setSelectedStep] = useState<IApplicationStepResponseDto | null>(null);
  const [updatingStepId, setUpdatingStepId] = useState<number | null>(null);
  const [updatingSubStepId, setUpdatingSubStepId] = useState<number | null>(null);
  const [clientNotes, setClientNotes] = useState<ClientNoteDto[]>([]);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ClientNoteDto | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteIsPinned, setNoteIsPinned] = useState(false);
  const [noteIsVisibleToClient, setNoteIsVisibleToClient] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDocumentType, setUploadDocumentType] = useState('denklik_belgesi');
  const [uploadNotes, setUploadNotes] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadClientDetails(selectedClient.id);
    }
  }, [selectedClient]);

  const loadClients = async () => {
    console.log('🚀 Loading clients...');
    try {
      setLoading(true);
      const response: any = await clientService.getAllClients();
      console.log('📊 Clients Response:', response);
      
      // Extract data from response - backend returns {success, data, count}
      const data = response?.data || response || [];
      console.log('✅ Clients Data:', data);
      
      setClients(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0 && !selectedClient) {
        setSelectedClient(data[0]);
      }
    } catch (error) {
      console.error('❌ Error loading clients:', error);
      toast.error('Müşteriler yüklenirken hata oluştu');
    } finally {
      console.log('🏁 Clients loading finished');
      setLoading(false);
    }
  };

  const loadClientDetails = async (clientId: number) => {
    console.log('📞 Loading details for client:', clientId);
    try {
      setDetailsLoading(true);
      
      // Load applications
      const appsResponse: any = await applicationService.getClientApplications(clientId);
      console.log('📊 Applications Response:', appsResponse);
      const appsData = appsResponse?.data || appsResponse || [];
      const normalizedApps = Array.isArray(appsData) ? appsData.map((app: any) => ({
        ...app,
        steps: Array.isArray(app.steps) ? app.steps.map((step: any) => ({
          ...step,
          name: step.title || step.name || '',
          subSteps: Array.isArray(step.subSteps) ? step.subSteps.map((subStep: any) => ({
            ...subStep,
            isCompleted: subStep.status?.toLowerCase() === 'completed' || subStep.isCompleted || false,
            status: subStep.status || 'NotStarted'
          })) : []
        })) : []
      })) : [];
      setApplications(normalizedApps);
      
      // Update selected application if one is already selected, otherwise auto-select first
      if (normalizedApps.length > 0) {
        const firstApp = normalizedApps[0];
        if (firstApp.steps && firstApp.steps.length > 0) {
          firstApp.steps = firstApp.steps.sort((a: any, b: any) => a.stepOrder - b.stepOrder);
        }
        
        // If an application is already selected, update it with fresh data
        if (selectedApplication) {
          const updatedApp = normalizedApps.find((app: any) => app.id === selectedApplication.id);
          if (updatedApp) {
            setSelectedApplication(updatedApp);
            // If a step is already selected, update it with fresh data
            if (selectedStep) {
              const updatedStep = updatedApp.steps?.find((s: any) => s.id === selectedStep.id);
              if (updatedStep) {
                setSelectedStep(updatedStep);
              } else {
                // Step not found, select first step
                setSelectedStep(updatedApp.steps?.[0] || null);
              }
            }
          } else {
            // Selected application not found, fallback to first app
            setSelectedApplication(firstApp);
            const inProgressStep = firstApp.steps?.find((s: any) => s.status?.toLowerCase() === 'inprogress');
            setSelectedStep(inProgressStep || firstApp.steps?.[0] || null);
          }
        } else {
          // No application selected yet, auto-select first
          setSelectedApplication(firstApp);
          const inProgressStep = firstApp.steps?.find((s: any) => s.status?.toLowerCase() === 'inprogress');
          setSelectedStep(inProgressStep || firstApp.steps?.[0] || null);
        }
      }

      // Load documents
      const docsResponse: any = await documentService.getClientDocuments(clientId);
      console.log('📊 Documents Response:', docsResponse);
      const docsData = docsResponse?.data || docsResponse;
      setDocuments(docsData?.documents || docsData || []);

      // Load client notes
      try {
        console.log('📝 Loading notes for client:', clientId);
        const notesResponse: any = await clientNoteService.getClientNotes(clientId);
        console.log('📝 Notes Response:', notesResponse);
        const notesData = notesResponse?.data || notesResponse || [];
        console.log('📝 Notes Data:', notesData);
        setClientNotes(Array.isArray(notesData) ? notesData : []);
        console.log('📝 Client notes set:', Array.isArray(notesData) ? notesData : []);
      } catch (error: any) {
        console.error('❌ Error loading client notes:', error);
        console.error('❌ Error details:', error.message, error.stack);
        setClientNotes([]);
      }

      // Load support tickets
      try {
        const ticketsResponse: any = await supportService.getClientTickets(clientId);
        const ticketsData = ticketsResponse?.data || ticketsResponse || [];
        setSupportTickets(Array.isArray(ticketsData) ? ticketsData : []);
      } catch (error) {
        console.error('❌ Error loading support tickets:', error);
        setSupportTickets([]);
      }
    } catch (error) {
      console.error('❌ Error loading client details:', error);
      toast.error('Müşteri detayları yüklenirken hata oluştu');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;

    try {
      setDeletingClientId(clientToDelete.id);
      const result = await DatabaseService.cleanupClientData(clientToDelete.id);
      
      toast.success(result.message || `Müşteri '${clientToDelete.fullName}' ve tüm bağlı verileri başarıyla silindi.`);
      
      // Reload clients list
      await loadClients();
      
      // Clear selection if deleted client was selected
      if (selectedClient?.id === clientToDelete.id) {
        setSelectedClient(null);
      }
      
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error(error instanceof Error ? error.message : 'Müşteri silinirken hata oluştu');
    } finally {
      setDeletingClientId(null);
    }
  };

  const handleUploadDocumentForClient = async () => {
    if (!selectedClient || !uploadFile) {
      toast.error('Lütfen bir dosya seçin');
      return;
    }

    try {
      setUploadingDocument(true);
      
      // Use DocumentService to handle authentication properly
      await documentService.uploadDocumentForClient(
        selectedClient.id,
        uploadDocumentType,
        uploadFile,
        uploadNotes || undefined
      );
      
      toast.success('Belge başarıyla yüklendi ve müşteri bilgilendirildi!');
      
      // Reload documents and application details
      if (selectedClient) {
        await loadClientDetails(selectedClient.id);
      }
      
      // Reset form and close dialog
      setUploadDialogOpen(false);
      setUploadFile(null);
      setUploadDocumentType('denklik_belgesi');
      setUploadNotes('');
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error(error instanceof Error ? error.message : 'Belge yüklenirken hata oluştu');
    } finally {
      setUploadingDocument(false);
    }
  };

  const openDeleteDialog = (client: IClientResponseDto, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the client
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

   const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
      case 'suspended':
        return 'bg-yellow-500';
      case 'archived':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'Active': 'Aktif',
      'Inactive': 'Pasif',
      'Suspended': 'Askıda',
      'Archived': 'Arşivlendi'
    };
    return statusMap[status] || status;
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-400';
      case 'inprogress':
        return 'bg-blue-500/20 text-blue-700 dark:bg-blue-500/30 dark:text-blue-400';
      case 'draft':
      case 'submitted':
        return 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/30 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status?: string) => {
    if (!status) return <Circle className="w-5 h-5 text-gray-400" />;
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'inprogress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'notstarted':
        return <Circle className="w-5 h-5 text-gray-400" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-400';
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-400';
      case 'inprogress':
        return 'bg-blue-500/20 text-blue-700 dark:bg-blue-500/30 dark:text-blue-400';
      case 'notstarted':
        return 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-400';
    }
  };

  // Calculate overall progress based on sub-steps completion
  const getApplicationProgress = (app: IApplicationResponseDto) => {
    if (!app || !app.steps || app.steps.length === 0) {
      return { percentage: 0, completed: 0, total: 0 };
    }

    let totalSubSteps = 0;
    let completedSubSteps = 0;

    // Count all sub-steps across all steps
    app.steps.forEach((step: any) => {
      if (step.subSteps && step.subSteps.length > 0) {
        step.subSteps.forEach((subStep: any) => {
          totalSubSteps++;
          if (subStep.isCompleted || subStep.status?.toLowerCase() === 'completed') {
            completedSubSteps++;
          }
        });
      } else {
        // If step has no sub-steps, count the step itself
        totalSubSteps++;
        if (step.status?.toLowerCase() === 'completed') {
          completedSubSteps++;
        }
      }
    });
    
    const percentage = totalSubSteps > 0 ? Math.round((completedSubSteps / totalSubSteps) * 100) : 0;
    
    return { 
      percentage, 
      completed: completedSubSteps, 
      total: totalSubSteps 
    };
  };

  const getStepIcon = (stepName?: string) => {
    if (!stepName) return <FileText className="w-5 h-5" />;
    const nameLower = stepName.toLowerCase();
    if (nameLower.includes('denklik') || nameLower.includes('equivalency')) {
      return <GraduationCap className="w-5 h-5" />;
    } else if (nameLower.includes('iş') || nameLower.includes('job') || nameLower.includes('arbeit') || nameLower.includes('çalışma')) {
      return <Building2 className="w-5 h-5" />;
    } else if (nameLower.includes('vize') || nameLower.includes('visa')) {
      return <Plane className="w-5 h-5" />;
    }
    return <FileText className="w-5 h-5" />;
  };

  const handleUpdateStepStatus = async (stepId: number, newStatus: string) => {
    try {
      setUpdatingStepId(stepId);
      const updateDto: IStepUpdateDto = {
        status: newStatus
      };
      await applicationService.updateStepStatus(stepId, updateDto);
      
      // Reload client details to get updated data
      if (selectedClient) {
        await loadClientDetails(selectedClient.id);
      }
      
      toast.success('Aşama durumu güncellendi');
    } catch (error: any) {
      console.error('Error updating step status:', error);
      toast.error(error.message || 'Aşama durumu güncellenirken hata oluştu');
    } finally {
      setUpdatingStepId(null);
    }
  };

  const handleUpdateSubStepStatus = async (subStepId: number, newStatus: string) => {
    try {
      setUpdatingSubStepId(subStepId);
      const updateDto: ISubStepUpdateDto = {
        status: newStatus
      };
      await applicationService.updateSubStepStatus(subStepId, updateDto);
      
      // Reload client details to get updated data
      if (selectedClient) {
        await loadClientDetails(selectedClient.id);
      }
      
      toast.success('Alt adım durumu güncellendi');
    } catch (error: any) {
      console.error('Error updating substep status:', error);
      toast.error(error.message || 'Alt adım durumu güncellenirken hata oluştu');
    } finally {
      setUpdatingSubStepId(null);
    }
  };

  const getStepStatusLabel = (status: string | null | undefined): string => {
    if (!status) return translate('admin.status.notStarted', 'Başlamadı');
    
    const normalized = status.toLowerCase();
    switch (normalized) {
      case 'completed':
        return translate('admin.status.completed', 'Tamamlandı');
      case 'inprogress':
        return translate('admin.status.inProgress', 'Devam Ediyor');
      case 'notstarted':
        return translate('admin.status.notStarted', 'Başlamadı');
      case 'blocked':
        return translate('admin.status.blocked', 'Engellendi');
      case 'skipped':
        return translate('admin.status.skipped', 'Atlandı');
      case 'onhold':
        return translate('admin.status.onHold', 'Beklemede');
      default:
        return status;
    }
  };

  const getReviewDecisionColor = (reviewDecision: string | null | undefined) => {
    const normalizedValue = reviewDecision?.trim();
    if (!normalizedValue || normalizedValue === '') {
      return {
        badge: 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-400',
        border: 'border-gray-300 dark:border-gray-700',
        bg: 'bg-gray-50 dark:bg-gray-800/50',
        icon: 'text-gray-600 dark:text-gray-400',
        text: 'text-gray-900 dark:text-gray-100',
        feedback: 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
      };
    }
    
    const lowerValue = normalizedValue.toLowerCase();
    
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
        return {
          badge: 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/30 dark:text-yellow-400',
          border: 'border-yellow-300 dark:border-yellow-700',
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          icon: 'text-yellow-600 dark:text-yellow-400',
          text: 'text-yellow-900 dark:text-yellow-100',
          feedback: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
        };
      case 'rejected':
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
          border: 'border-gray-300 dark:border-gray-700',
          bg: 'bg-gray-50 dark:bg-gray-800/50',
          icon: 'text-gray-600 dark:text-gray-400',
          text: 'text-gray-900 dark:text-gray-100',
          feedback: 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
        };
    }
  };

  const getReviewDecisionLabel = (reviewDecision: string | null | undefined) => {
    const normalizedValue = reviewDecision?.trim();
    if (!normalizedValue || normalizedValue === '') return 'Beklemede';
    
    switch (normalizedValue.toLowerCase()) {
      case 'accepted':
      case 'approved':
        return 'Onaylandı';
      case 'missinginfo':
      case 'needsmoreinfo':
        return 'Eksik Bilgi';
      case 'rejected':
        return 'Reddedildi';
      case 'pending':
      case 'underreview':
        return 'İnceleniyor';
      default:
        return reviewDecision || 'Bilinmeyen';
    }
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/30 dark:text-yellow-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-400';
      case 'underreview':
        return 'bg-blue-500/20 text-blue-700 dark:bg-blue-500/30 dark:text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-400';
    }
  };

  const handleDownloadDocument = async (doc: IDocumentResponseDto) => {
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

  const getSupportTicketStatusColor = (status: string | null | undefined) => {
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

  const filteredClients = Array.isArray(clients) ? clients.filter(client =>
    client.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.clientCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Left Panel - Client List */}
      <div className="w-1/3 min-w-[380px] max-w-[420px] flex flex-col bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Müşteriler</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Toplam: {clients.length}</p>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Ad, kod veya email ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Client List */}
        <div className="flex-1 overflow-y-auto">
          {filteredClients.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Müşteri bulunamadı
            </div>
          ) : (
            filteredClients.map((client) => (
              <div
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`p-4 border-l-4 cursor-pointer transition-colors ${
                  selectedClient?.id === client.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-600'
                    : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{client.fullName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{client.email}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Kod: {client.clientCode}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(client.status)} mt-1`} />
                    <AlertDialog open={deleteDialogOpen && clientToDelete?.id === client.id} onOpenChange={(open) => {
                      if (!open) {
                        setDeleteDialogOpen(false);
                        setClientToDelete(null);
                      }
                    }}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => openDeleteDialog(client, e)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          disabled={deletingClientId === client.id}
                        >
                          {deletingClientId === client.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="w-5 h-5" />
                            Müşteriyi ve Tüm Verilerini Sil
                          </AlertDialogTitle>
                          <AlertDialogDescription className="space-y-2">
                            <p>
                              <strong>{clientToDelete?.fullName}</strong> müşterisi ve tüm bağlı verileri kalıcı olarak silinecektir:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              <li>Müşteri profili</li>
                              <li>Yüklenen tüm belgeler</li>
                              <li>Tüm başvurular ve adımları</li>
                              <li>Eğitim bilgileri</li>
                              <li>Destek talepleri ve mesajları</li>
                              <li>Bildirimler</li>
                            </ul>
                            <p className="font-semibold text-red-600 mt-4">
                              Bu işlem geri alınamaz! Devam etmek istediğinizden emin misiniz?
                            </p>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={deletingClientId === client.id}>İptal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteClient}
                            disabled={deletingClientId === client.id}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {deletingClientId === client.id ? 'Siliniyor...' : 'Evet, Sil'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Client Details */}
      {selectedClient && (
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {selectedClient.fullName.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedClient.fullName}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedClient.email}</p>
                <Badge className={`mt-1 ${getStatusColor(selectedClient.status)} text-white`}>
                  {getStatusLabel(selectedClient.status)}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Düzenle
              </Button>
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Not Ekle
              </Button>
              <AlertDialog open={deleteDialogOpen && clientToDelete?.id === selectedClient.id} onOpenChange={(open) => {
                if (!open) {
                  setDeleteDialogOpen(false);
                  setClientToDelete(null);
                }
              }}>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setClientToDelete(selectedClient);
                      setDeleteDialogOpen(true);
                    }}
                    disabled={deletingClientId === selectedClient.id}
                  >
                    {deletingClientId === selectedClient.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Tüm Verilerini Sil
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-5 h-5" />
                      Müşteriyi ve Tüm Verilerini Sil
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>
                        <strong>{selectedClient.fullName}</strong> müşterisi ve tüm bağlı verileri kalıcı olarak silinecektir:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Müşteri profili</li>
                        <li>Yüklenen tüm belgeler ({documents.length} adet)</li>
                        <li>Tüm başvurular ve adımları ({applications.length} adet)</li>
                        <li>Eğitim bilgileri</li>
                        <li>Destek talepleri ve mesajları ({supportTickets.length} adet)</li>
                        <li>Bildirimler</li>
                        <li>Belge incelemeleri</li>
                        <li>Başvuru geçmişi</li>
                      </ul>
                      <p className="font-semibold text-red-600 mt-4">
                        Bu işlem geri alınamaz! Devam etmek istediğinizden emin misiniz?
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deletingClientId === selectedClient.id}>İptal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        if (!selectedClient) return;
                        try {
                          setDeletingClientId(selectedClient.id);
                          const result = await DatabaseService.cleanupClientData(selectedClient.id, false);
                          toast.success(result.message || `Müşteri '${selectedClient.fullName}' ve tüm bağlı verileri başarıyla silindi.`);
                          await loadClients();
                          setSelectedClient(null);
                          setDeleteDialogOpen(false);
                          setClientToDelete(null);
                        } catch (error) {
                          console.error('Error deleting client:', error);
                          toast.error(error instanceof Error ? error.message : 'Müşteri silinirken hata oluştu');
                        } finally {
                          setDeletingClientId(null);
                        }
                      }}
                      disabled={deletingClientId === selectedClient.id}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deletingClientId === selectedClient.id ? 'Siliniyor...' : 'Evet, Sil'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 border-b border-gray-200 dark:border-gray-800">
            <nav className="flex -mb-px space-x-6">
              {(['overview', 'profile', 'applications', 'documents', 'support', 'notes'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {tab === 'overview' && 'Genel Bakış'}
                  {tab === 'profile' && 'Profil'}
                  {tab === 'applications' && 'Başvurular'}
                  {tab === 'documents' && 'Belgeler'}
                  {tab === 'support' && 'Destek Talepleri'}
                  {tab === 'notes' && 'Notlar'}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {detailsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">{applications.length}</p>
                              <p className="text-sm text-gray-500">Başvuru</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Client Info & Recent Applications */}
                    <div className="grid grid-cols-2 gap-6">
                      {/* Client Details */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Müşteri Bilgileri</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Tam Ad:</span>
                            <span className="font-medium">{selectedClient.fullName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">E-posta:</span>
                            <span className="font-medium">{selectedClient.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Telefon:</span>
                            <span className="font-medium">{selectedClient.phone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Uyruk:</span>
                            <span className="font-medium">{selectedClient.nationality || 'Belirtilmemiş'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Kayıt Tarihi:</span>
                            <span className="font-medium">{new Date(selectedClient.registrationDate).toLocaleDateString('tr-TR')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Müşteri Kodu:</span>
                            <span className="font-medium">{selectedClient.clientCode}</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Recent Applications */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Son Başvurular</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {applications.length > 0 ? (
                            <ul className="space-y-3">
                              {applications.slice(0, 3).map((app) => {
                                const progress = getApplicationProgress(app);
                                return (
                                  <li key={app.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{app.templateName}</p>
                                      <div className="mt-2">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-xs text-gray-500 dark:text-gray-400">İlerleme</span>
                                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{progress.percentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                          <div
                                            className={`h-1.5 rounded-full transition-all ${
                                              progress.percentage === 100
                                                ? 'bg-green-500'
                                                : progress.percentage > 0
                                                ? 'bg-blue-500'
                                                : 'bg-gray-400'
                                            }`}
                                            style={{ width: `${progress.percentage}%` }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <Badge className={getApplicationStatusColor(app.status)}>
                                      {app.status}
                                    </Badge>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Henüz başvuru yok</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Documents Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Yüklenen Belgeler</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {documents.length > 0 ? (
                          <div className="space-y-3">
                            {documents.slice(0, 5).map((doc) => {
                              const decisionValue = doc.reviewDecision || doc.status;
                              const colors = getReviewDecisionColor(decisionValue);
                              
                              return (
                                <div
                                  key={doc.id}
                                  className={`p-3 border rounded-lg transition-all ${colors.border} ${colors.bg}`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-2 flex-1">
                                      <CheckCircle className={`w-4 h-4 ${colors.icon} flex-shrink-0 mt-0.5`} />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                          <p className={`text-sm font-medium ${colors.text} truncate`}>
                                            {doc.documentTypeName}
                                          </p>
                                          <Badge className={colors.badge}>
                                            {getReviewDecisionLabel(decisionValue)}
                                          </Badge>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                          {doc.originalFileName}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-500">
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
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDownloadDocument(doc)}
                                      className="flex-shrink-0"
                                    >
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                            {documents.length > 5 && (
                              <div className="text-center pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setActiveTab('documents')}
                                >
                                  Tümünü Gör ({documents.length})
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                              Henüz belge yüklenmemiş
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActiveTab('documents')}
                            >
                              Belgeler Sekmesine Git
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}

                {activeTab === 'profile' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Kişisel Bilgiler</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-gray-500 dark:text-gray-400">Ad</label>
                            <p className="font-medium">{selectedClient.firstName}</p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 dark:text-gray-400">Soyad</label>
                            <p className="font-medium">{selectedClient.lastName}</p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 dark:text-gray-400">E-posta</label>
                            <p className="font-medium">{selectedClient.email}</p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 dark:text-gray-400">Telefon</label>
                            <p className="font-medium">{selectedClient.phone}</p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 dark:text-gray-400">Doğum Tarihi</label>
                            <p className="font-medium">
                              {selectedClient.dateOfBirth 
                                ? new Date(selectedClient.dateOfBirth).toLocaleDateString('tr-TR')
                                : 'Belirtilmemiş'
                              }
                            </p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 dark:text-gray-400">Uyruk</label>
                            <p className="font-medium">{selectedClient.nationality || 'Belirtilmemiş'}</p>
                          </div>
                        </div>
                        {selectedClient.address && (
                          <div>
                            <label className="text-sm text-gray-500 dark:text-gray-400">Adres</label>
                            <p className="font-medium">{selectedClient.address}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Eğitim Geçmişi</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedClient.educationHistory.length > 0 ? (
                          <div className="space-y-4">
                            {selectedClient.educationHistory.map((edu) => (
                              <div key={edu.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <h4 className="font-semibold text-gray-900 dark:text-white">{edu.degree}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{edu.institution}</p>
                                {edu.fieldOfStudy && (
                                  <p className="text-sm text-gray-500 dark:text-gray-500">Alan: {edu.fieldOfStudy}</p>
                                )}
                                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                  {edu.startDate && <span>Başlangıç: {new Date(edu.startDate).toLocaleDateString('tr-TR')}</span>}
                                  {edu.graduationDate && <span>Mezuniyet: {new Date(edu.graduationDate).toLocaleDateString('tr-TR')}</span>}
                                  {edu.isCurrent && <Badge className="bg-blue-500 text-white">Devam Ediyor</Badge>}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">Eğitim bilgisi bulunmuyor</p>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}

                {activeTab === 'applications' && (
                  <>
                    {applications.length > 0 ? (
                      selectedApplication && selectedApplication.steps && selectedApplication.steps.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                          {/* Left Column: Application Stages */}
                          <div className="lg:col-span-1">
                            <Card>
                              <CardHeader>
                                <CardTitle>Başvuru Aşamaları</CardTitle>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  {selectedApplication.templateName}
                                </p>
                              </CardHeader>
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  {selectedApplication.steps.map((step, index) => {
                                    const isSelected = selectedStep?.id === step.id;
                                    const totalSubSteps = step.subSteps?.length || 0;
                                    const completedSubSteps = step.subSteps?.filter((s: any) => 
                                      s && (s.isCompleted || s.status?.toLowerCase() === 'completed')
                                    ).length || 0;
                                    const stepProgress = totalSubSteps > 0 
                                      ? Math.round((completedSubSteps / totalSubSteps) * 100)
                                      : step.status?.toLowerCase() === 'completed' ? 100 
                                      : step.status?.toLowerCase() === 'inprogress' ? 50 
                                      : 0;

                                    return (
                                      <div
                                        key={step.id}
                                        onClick={() => setSelectedStep(step)}
                                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                          isSelected
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : step.status?.toLowerCase() === 'completed'
                                            ? 'border-green-200 bg-green-50 dark:bg-green-900/10'
                                            : step.status?.toLowerCase() === 'inprogress'
                                            ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/10'
                                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                                        }`}
                                      >
                                        <div className="flex items-center gap-3 mb-2">
                                          <div className="flex-shrink-0">
                                            {getStepIcon(step.name || step.title)}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="text-xs font-medium text-gray-500">Adım {index + 1}</span>
                                              {getStatusIcon(step.status)}
                                            </div>
                                            <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                              {step.name || step.title || `Adım ${index + 1}`}
                                            </p>
                                          </div>
                                          {isSelected && (
                                            <ChevronRight className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                          )}
                                        </div>
                                        
                                        {/* Step Progress Bar */}
                                        <div className="mt-2">
                                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                            <div
                                              className={`h-1.5 rounded-full transition-all ${
                                                step.status?.toLowerCase() === 'completed'
                                                  ? 'bg-green-500'
                                                  : step.status?.toLowerCase() === 'inprogress'
                                                  ? 'bg-blue-500'
                                                  : 'bg-gray-400'
                                              }`}
                                              style={{ width: `${stepProgress}%` }}
                                            />
                                          </div>
                                          <div className="flex items-center justify-between mt-1">
                                            <span className="text-xs text-gray-500">
                                              {stepProgress}%
                                            </span>
                                            <Badge className={getStepStatusColor(step.status)} variant="outline">
                                              {getStepStatusLabel(step.status)}
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Right Column: Selected Step Details */}
                          <div className="lg:col-span-3">
                            {selectedStep ? (
                              <Card>
                                <CardHeader>
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <CardTitle>{selectedStep.name || selectedStep.title || 'Adım Detayları'}</CardTitle>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Adım {selectedApplication.steps.findIndex((s: any) => s.id === selectedStep.id) + 1}/{selectedApplication.steps.length}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="text-right">
                                        <div className="text-2xl font-bold text-blue-600">
                                          {selectedStep.subSteps && selectedStep.subSteps.length > 0
                                            ? Math.round((selectedStep.subSteps.filter((s: any) => s && (s.isCompleted || s.status?.toLowerCase() === 'completed')).length / selectedStep.subSteps.length) * 100)
                                            : selectedStep.status?.toLowerCase() === 'completed' ? 100 : selectedStep.status?.toLowerCase() === 'inprogress' ? 50 : 0}%
                                        </div>
                                        <p className="text-xs text-gray-500">İlerleme</p>
                                      </div>
                                      <div className="flex flex-col gap-2">
                                        <Select
                                          value={selectedStep.status || 'NotStarted'}
                                          onValueChange={(value) => handleUpdateStepStatus(selectedStep.id, value)}
                                          disabled={updatingStepId === selectedStep.id}
                                        >
                                          <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Durum Seç" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="NotStarted">Başlamadı</SelectItem>
                                            <SelectItem value="InProgress">Devam Ediyor</SelectItem>
                                            <SelectItem value="Completed">Tamamlandı</SelectItem>
                                            <SelectItem value="Blocked">Engellendi</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        {updatingStepId === selectedStep.id && (
                                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  {/* Process Steps (Sub-Steps) */}
                                  {selectedStep.subSteps && selectedStep.subSteps.length > 0 ? (
                                    <div className="space-y-3">
                                      <h4 className="font-semibold mb-4">İşlem Adımları</h4>
                                      {selectedStep.subSteps.map((subStep: any, subIndex: number) => {
                                        const isCompleted = subStep.isCompleted || subStep.status?.toLowerCase() === 'completed';
                                        const isInProgress = subStep.status?.toLowerCase() === 'inprogress';
                                        const bgColor = isCompleted
                                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                          : isInProgress
                                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';

                                        return (
                                          <div
                                            key={subStep.id}
                                            className={`p-4 rounded-lg border-2 ${bgColor}`}
                                          >
                                            <div className="flex items-start justify-between gap-3">
                                              <div className="flex items-start gap-3 flex-1">
                                                <div className="flex-shrink-0 mt-0.5">
                                                  {isCompleted ? (
                                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                  ) : isInProgress ? (
                                                    <Clock className="w-5 h-5 text-blue-600" />
                                                  ) : (
                                                    <Circle className="w-5 h-5 text-gray-400" />
                                                  )}
                                                </div>
                                                <div className="flex-1">
                                                  <p className="font-medium text-gray-900 dark:text-white mb-1">
                                                    {subIndex + 1}. {subStep.name}
                                                  </p>
                                                  {isCompleted && subStep.completedAt && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                      Tamamlandı: {new Date(subStep.completedAt).toLocaleDateString('tr-TR', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                      })}
                                                    </p>
                                                  )}
                                                  {isInProgress && !isCompleted && subStep.name?.toLowerCase().includes('denklik belgesi hazır') && (
                                                    <div className="mt-3">
                                                      <Button
                                                        onClick={() => setUploadDialogOpen(true)}
                                                        size="sm"
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                      >
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        Denklik Belgesi Yükle
                                                      </Button>
                                                    </div>
                                                  )}
                                                  {isInProgress && !isCompleted && !subStep.name?.toLowerCase().includes('denklik belgesi hazır') && (
                                                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                                                      Devam ediyor...
                                                    </p>
                                                  )}
                                                  {!isInProgress && !isCompleted && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                      Henüz başlamadı
                                                    </p>
                                                  )}
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <Select
                                                  value={subStep.status || (isCompleted ? 'Completed' : isInProgress ? 'InProgress' : 'NotStarted')}
                                                  onValueChange={(value) => handleUpdateSubStepStatus(subStep.id, value)}
                                                  disabled={updatingSubStepId === subStep.id}
                                                >
                                                  <SelectTrigger className="w-[160px]">
                                                    <SelectValue placeholder="Durum" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="NotStarted">Başlamadı</SelectItem>
                                                    <SelectItem value="InProgress">Devam Ediyor</SelectItem>
                                                    <SelectItem value="Completed">Tamamlandı</SelectItem>
                                                  </SelectContent>
                                                </Select>
                                                {updatingSubStepId === subStep.id && (
                                                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="text-center py-8">
                                      <p className="text-gray-500 dark:text-gray-400">
                                        Bu aşama için alt adım bulunmamaktadır.
                                      </p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ) : (
                              <Card>
                                <CardContent className="py-12 text-center">
                                  <Info className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                  <p className="text-gray-500 dark:text-gray-400">
                                    Detayları görüntülemek için bir aşama seçin
                                  </p>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        </div>
                      ) : (
                        <Card>
                          <CardContent className="py-12 text-center">
                            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">
                              Bu başvuru için aşama bulunmamaktadır.
                            </p>
                          </CardContent>
                        </Card>
                      )
                    ) : (
                      <Card>
                        <CardContent className="py-12 text-center">
                          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500 dark:text-gray-400">Henüz başvuru bulunmuyor</p>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}

                {activeTab === 'documents' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Yüklenen Belgeler</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {documents.length > 0 ? (
                        <div className="space-y-4">
                          {documents.map((doc) => {
                            const decisionValue = doc.reviewDecision || doc.status;
                            const colors = getReviewDecisionColor(decisionValue);
                            
                            return (
                              <div
                                key={doc.id}
                                className={`p-4 border rounded-lg transition-all ${colors.border} ${colors.bg}`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start gap-3 flex-1">
                                    <CheckCircle className={`w-5 h-5 ${colors.icon} flex-shrink-0 mt-0.5`} />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className={`font-medium ${colors.text}`}>
                                          {doc.documentTypeName}
                                        </span>
                                        <Badge className={colors.badge}>
                                          {getReviewDecisionLabel(decisionValue)}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        {doc.originalFileName} • {doc.fileSizeFormatted}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-500">
                                        Yüklenme: {new Date(doc.uploadedAt).toLocaleDateString('tr-TR', {
                                          year: 'numeric',
                                          month: '2-digit',
                                          day: '2-digit',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                      {doc.feedbackMessage && (
                                        <div className={`flex items-start gap-2 mt-2 p-2 rounded ${colors.feedback}`}>
                                          <Info className={`w-4 h-4 ${colors.icon} flex-shrink-0 mt-0.5`} />
                                          <p className={`text-xs ${colors.text}`}>
                                            {doc.feedbackMessage}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownloadDocument(doc)}
                                    className="flex-shrink-0"
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    İndir
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Henüz belge yüklenmemiş</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'support' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Destek Talepleri</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {supportTickets.length > 0 ? (
                        <div className="space-y-4">
                          {supportTickets.map((ticket) => {
                            const statusColors = getSupportTicketStatusColor(ticket.status);
                            return (
                              <div
                                key={ticket.id}
                                className={`p-4 border rounded-lg transition-all ${statusColors.border} ${statusColors.bg}`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                      <h4 className="font-semibold text-gray-900 dark:text-white">
                                        {ticket.subject}
                                      </h4>
                                      <Badge className={statusColors.badge}>
                                        {ticket.status || 'Bilinmeyen'}
                                      </Badge>
                                      {ticket.priority && (
                                        <Badge variant="outline">
                                          {ticket.priority}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                      {ticket.description}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                                      <span>#{ticket.ticketNumber}</span>
                                      <span>
                                        {ticket.createdAt 
                                          ? new Date(ticket.createdAt).toLocaleDateString('tr-TR', {
                                              year: 'numeric',
                                              month: '2-digit',
                                              day: '2-digit',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })
                                          : 'Tarih yok'}
                                      </span>
                                      {ticket.messageCount > 0 && (
                                        <span>{ticket.messageCount} mesaj</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Henüz destek talebi bulunmuyor</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'notes' && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Notlar</CardTitle>
                        <Button onClick={() => {
                          setEditingNote(null);
                          setNoteContent('');
                          setNoteIsPinned(false);
                          setNoteIsVisibleToClient(false);
                          setNoteDialogOpen(true);
                        }}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Yeni Not Ekle
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {clientNotes.length === 0 ? (
                          <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center">
                            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Henüz not eklenmemiş
                            </p>
                          </div>
                        ) : (
                          clientNotes.map((note) => (
                            <div
                              key={note.id}
                              className={`p-4 rounded-lg border-2 ${
                                note.isPinned
                                  ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800'
                                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    {note.isPinned && (
                                      <Pin className="w-4 h-4 text-yellow-600" />
                                    )}
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {note.createdByUserName}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {new Date(note.createdAt).toLocaleDateString('tr-TR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                    {note.isVisibleToClient && (
                                      <Badge variant="outline" className="text-xs">
                                        Müşteriye Görünür
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {note.content}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingNote(note);
                                      setNoteContent(note.content);
                                      setNoteIsPinned(note.isPinned);
                                      setNoteIsVisibleToClient(note.isVisibleToClient);
                                      setNoteDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={async () => {
                                      if (confirm('Bu notu silmek istediğinizden emin misiniz?')) {
                                        try {
                                          await clientNoteService.deleteClientNote(selectedClient.id, note.id);
                                          await loadClientDetails(selectedClient.id);
                                          toast.success('Not silindi');
                                        } catch (error: any) {
                                          toast.error(error.message || 'Not silinirken hata oluştu');
                                        }
                                      }
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Upload Document Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="space-y-3 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Müşteri İçin Belge Yükle
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-blue-600">{selectedClient?.fullName}</span> için belge yükleyin. 
              Belge otomatik olarak onaylanacak ve müşteri bilgilendirilecektir.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-6">
            {/* Belge Tipi */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Belge Tipi
              </label>
              <Select value={uploadDocumentType} onValueChange={setUploadDocumentType}>
                <SelectTrigger className="h-11 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500">
                  <SelectValue placeholder="Belge tipi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="denklik_belgesi">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Denklik Belgesi</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="passport">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Pasaport</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="diploma">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-purple-600" />
                      <span>Diploma</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="cv">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-orange-600" />
                      <span>CV</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="language_certificate">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span>Dil Belgesi</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dosya Seçici */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Dosya Seç
              </label>
              <div className="relative">
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadFile(file);
                    }
                  }}
                  className="h-11 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400"
                />
              </div>
              {uploadFile && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      {uploadFile.name}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      Boyut: {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
              {!uploadFile && (
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  PDF, JPG, JPEG veya PNG formatında dosya seçebilirsiniz (Max 10MB)
                </p>
              )}
            </div>

            {/* Not Alanı */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Not (Opsiyonel)
              </label>
              <Textarea
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
                placeholder="Belge hakkında not ekleyin..."
                className="min-h-[120px] border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 resize-none"
                rows={5}
              />
            </div>
          </div>

          <DialogFooter className="gap-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setUploadDialogOpen(false);
                setUploadFile(null);
                setUploadDocumentType('denklik_belgesi');
                setUploadNotes('');
              }}
              disabled={uploadingDocument}
              className="min-w-[100px] border-2"
            >
              İptal
            </Button>
            <Button
              onClick={handleUploadDocumentForClient}
              disabled={uploadingDocument || !uploadFile}
              className="min-w-[160px] bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {uploadingDocument ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Yükle ve Onayla
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingNote ? 'Notu Düzenle' : 'Yeni Not Ekle'}</DialogTitle>
            <DialogDescription>
              {selectedClient && `${selectedClient.fullName} için not ekleyin`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Not İçeriği</label>
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Not içeriğini buraya yazın..."
                className="min-h-[150px]"
                rows={6}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={noteIsPinned}
                  onChange={(e) => setNoteIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="isPinned" className="text-sm font-medium cursor-pointer">
                  Önemli (Sabitle)
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isVisibleToClient"
                  checked={noteIsVisibleToClient}
                  onChange={(e) => setNoteIsVisibleToClient(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="isVisibleToClient" className="text-sm font-medium cursor-pointer">
                  Müşteriye Görünür
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
              İptal
            </Button>
            <Button
              onClick={async () => {
                if (!selectedClient || !noteContent.trim()) {
                  toast.error('Not içeriği boş olamaz');
                  return;
                }

                try {
                  setSavingNote(true);
                  if (editingNote) {
                    await clientNoteService.updateClientNote(selectedClient.id, editingNote.id, {
                      content: noteContent,
                      isPinned: noteIsPinned,
                      isVisibleToClient: noteIsVisibleToClient
                    });
                    toast.success('Not güncellendi');
                  } else {
                    await clientNoteService.createClientNote(selectedClient.id, {
                      clientId: selectedClient.id,
                      content: noteContent,
                      isPinned: noteIsPinned,
                      isVisibleToClient: noteIsVisibleToClient
                    });
                    toast.success('Not eklendi');
                  }
                  await loadClientDetails(selectedClient.id);
                  setNoteDialogOpen(false);
                  setEditingNote(null);
                  setNoteContent('');
                  setNoteIsPinned(false);
                  setNoteIsVisibleToClient(false);
                } catch (error: any) {
                  toast.error(error.message || 'Not kaydedilirken hata oluştu');
                } finally {
                  setSavingNote(false);
                }
              }}
              disabled={savingNote || !noteContent.trim()}
            >
              {savingNote ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                editingNote ? 'Güncelle' : 'Kaydet'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientTracking;
