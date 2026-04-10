import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  CheckCircle2, 
  Clock, 
  Circle,
  FileText,
  Briefcase,
  Plane,
  AlertCircle,
  Info,
  Loader2,
  GraduationCap,
  Building2,
  ChevronRight,
  CreditCard,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { applicationService, documentService, clientService, authService, equivalencyFeeSettingsService } from '../../ApiServices/services';
import { API_ROUTES } from '../../ApiServices/config/api.config';
import type { IApplicationResponseDto, IApplicationStepResponseDto } from '../../ApiServices/types/ApplicationTypes';
import type { IDocumentResponseDto } from '../../ApiServices/types/DocumentTypes';
import type { IClientResponseDto } from '../../ApiServices/types/ClientTypes';
import type { ICurrentUser } from '../../ApiServices/types/AuthTypes';
import { useI18n } from '../../hooks/useI18n';
import type { EquivalencyFeeSettingsDto } from '../../ApiServices/services/EquivalencyFeeSettingsService';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { translate, language } = useI18n();
  const [clientName, setClientName] = useState<string>('');
  const [clientData, setClientData] = useState<IClientResponseDto | null>(null);
  const [application, setApplication] = useState<IApplicationResponseDto | null>(null);
  const [selectedStep, setSelectedStep] = useState<IApplicationStepResponseDto | null>(null);
  const [documents, setDocuments] = useState<IDocumentResponseDto[]>([]);
  const [documentStats, setDocumentStats] = useState<{
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    required: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [feeSettings, setFeeSettings] = useState<EquivalencyFeeSettingsDto | null>(null);

  const loadDashboardData = useCallback(async () => {
    console.log('🚀 Starting loadDashboardData...');
    try {
      setLoading(true);
      
      // Get current user info first
      let currentUser: ICurrentUser | null = null;
      let currentClientId: number | null = null;
      
      try {
        currentUser = await authService.getCurrentUser(false);
        if (currentUser) {
          // Set name from user info as fallback
          setClientName(`${currentUser.firstName} ${currentUser.lastName}`);
          
          // Get client data by user ID
          try {
            const clientResponse: any = await clientService.getClientByUserId(currentUser.id);
            const client = clientResponse?.data || clientResponse;
            setClientData(client);
            currentClientId = client?.id || null;
            
            // Use client's full name if available (this is the correct one)
            if (client?.fullName) {
              setClientName(client.fullName);
            } else if (client?.firstName && client?.lastName) {
              setClientName(`${client.firstName} ${client.lastName}`);
            }
          } catch (clientError) {
            console.warn('⚠️ Could not load client by user ID:', clientError);
            // Try to get client by ID if user ID fails
            try {
              const clientResponse: any = await clientService.getClientById(currentUser.id);
              const client = clientResponse?.data || clientResponse;
              if (client) {
                setClientData(client);
                currentClientId = client?.id || null;
                if (client?.fullName) {
                  setClientName(client.fullName);
                } else if (client?.firstName && client?.lastName) {
                  setClientName(`${client.firstName} ${client.lastName}`);
                }
              }
            } catch (fallbackError) {
              console.warn('⚠️ Could not load client data:', fallbackError);
            }
          }
        }
      } catch (userError) {
        console.warn('⚠️ Could not load user info:', userError);
      }
      
      // If we couldn't get client ID, we can't load applications/documents
      if (!currentClientId) {
        console.warn('⚠️ No client ID found, cannot load applications and documents');
        return;
      }
      
      // Load applications - get the first one (there should be only one "İş Bulma Başvurusu")
      try {
        console.log('📞 Fetching applications for client ID:', currentClientId);
        const appsData = await applicationService.getClientApplications(currentClientId, language);
        console.log('📊 Applications Response:', appsData);
        
        const normalizedApps = (Array.isArray(appsData) ? appsData : []).map(app => ({
          ...app,
          steps: Array.isArray(app.steps) ? app.steps.map((step: any) => ({
            ...step,
            name: step.title || step.name || '',
            subSteps: Array.isArray(step.subSteps) ? step.subSteps.map((subStep: any) => ({
              ...subStep,
              isCompleted: subStep.status?.toLowerCase() === 'completed' || false,
              status: subStep.status || 'NotStarted'
            })) : []
          })) : []
        }));
        
        console.log('✅ Normalized Applications:', normalizedApps);
        
        // Get the first application (should be the main "Tam Süreç" application)
        if (normalizedApps.length > 0) {
          const firstApp = normalizedApps[0];
          // Ensure steps are sorted by stepOrder
          if (firstApp.steps && firstApp.steps.length > 0) {
            firstApp.steps = firstApp.steps.sort((a: any, b: any) => a.stepOrder - b.stepOrder);
            // Sort substeps within each step
            firstApp.steps.forEach((step: any) => {
              if (step.subSteps && step.subSteps.length > 0) {
                step.subSteps = step.subSteps.sort((a: any, b: any) => a.subStepOrder - b.subStepOrder);
              }
            });
          }
          console.log('✅ Setting application:', firstApp);
          setApplication(firstApp);
        } else {
          console.warn('⚠️ No applications found for client ID:', currentClientId);
        }
      } catch (appError) {
        console.error('❌ Could not load applications:', appError);
        toast.error('Başvurular yüklenirken hata oluştu: ' + (appError instanceof Error ? appError.message : 'Bilinmeyen hata'));
      }

      // Load documents and document statistics
      try {
        const docsData = await documentService.getClientDocuments(currentClientId, language);
        console.log('📊 Dashboard - Documents Data:', docsData);
        setDocuments(docsData.documents || []);
        // Use API response statistics directly
        setDocumentStats({
          total: docsData.totalDocuments || 0,
          pending: docsData.pendingDocuments || 0,
          accepted: docsData.acceptedDocuments || 0,
          rejected: docsData.rejectedDocuments || 0,
          required: docsData.requiredDocumentCount || 0
        });
        console.log('📊 Dashboard - Document Stats:', {
          total: docsData.totalDocuments || 0,
          pending: docsData.pendingDocuments || 0,
          accepted: docsData.acceptedDocuments || 0,
          rejected: docsData.rejectedDocuments || 0,
          required: docsData.requiredDocumentCount || 0
        });
      } catch (docError) {
        console.warn('⚠️ Could not load documents:', docError);
        setDocuments([]);
        setDocumentStats({ total: 0, pending: 0, accepted: 0, rejected: 0, required: 0 });
      }
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      toast.error('Dashboard verileri yüklenirken hata oluştu: ' + (error as Error).message);
    } finally {
      console.log('🏁 loadDashboardData finished');
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    loadDashboardData();
    loadFeeSettings();
  }, [loadDashboardData]);

  const loadFeeSettings = async () => {
    try {
      const settings = await equivalencyFeeSettingsService.getPublicSettings();
      console.log('✅ Fee settings loaded:', settings);
      setFeeSettings(settings);
    } catch (error) {
      console.error('❌ Error loading fee settings:', error);
      // Use defaults if loading fails
    }
  };

  useEffect(() => {
    // Auto-select first step if application exists and no step selected
    if (application && application.steps && application.steps.length > 0 && !selectedStep) {
      // Select the first step (should be Denklik İşlemleri with StepOrder = 1)
      // Or select the first InProgress step if available
      const sortedSteps = [...application.steps].sort((a: any, b: any) => a.stepOrder - b.stepOrder);
      const inProgressStep = sortedSteps.find((s: any) => s.status?.toLowerCase() === 'inprogress');
      setSelectedStep(inProgressStep || sortedSteps[0]);
    }
  }, [application, selectedStep]);

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

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-400';
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-400';
      case 'inprogress':
        return 'bg-blue-500/20 text-blue-700 dark:bg-blue-500/30 dark:text-blue-400';
      case 'notstarted':
        return 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-400';
      case 'blocked':
        return 'bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/30 dark:text-gray-400';
    }
  };

  const getStatusText = (status?: string) => {
    if (!status) return translate('client.dashboard.status.notStarted', 'Başlamadı');
    switch (status.toLowerCase()) {
      case 'completed':
        return translate('client.dashboard.status.completed', 'Tamamlandı');
      case 'inprogress':
        return translate('client.dashboard.status.inProgress', 'Devam Ediyor');
      case 'notstarted':
        return translate('client.dashboard.status.notStarted', 'Başlamadı');
      case 'blocked':
        return translate('client.dashboard.status.blocked', 'Engellendi');
      default:
        return translate('client.dashboard.status.notStarted', 'Başlamadı');
    }
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

  const getDocumentStats = () => {
    // Use API response statistics if available, otherwise fallback to calculating from documents array
    if (documentStats) {
      return documentStats;
    }
    
    // Fallback: calculate from documents array
    const total = documents.length;
    const pending = documents.filter(d => {
      const status = d.status?.toLowerCase() || '';
      return status === 'pending' || status === 'pendingforreview' || status === 'underreview';
    }).length;
    const accepted = documents.filter(d => {
      const status = d.status?.toLowerCase() || '';
      return status === 'accepted' || status === 'approved' || d.reviewDecision?.toLowerCase() === 'accepted';
    }).length;
    const rejected = documents.filter(d => {
      const status = d.status?.toLowerCase() || '';
      return status === 'rejected' || d.reviewDecision?.toLowerCase() === 'rejected';
    }).length;
    const required = 4; // Default fallback, should come from backend
    
    return { total, pending, accepted, rejected, required };
  };

  // Calculate overall progress based on sub-steps completion
  const getOverallProgress = () => {
    if (!application || !application.steps || application.steps.length === 0) {
      return { percentage: 0, completed: 0, total: 0 };
    }

    let totalSubSteps = 0;
    let completedSubSteps = 0;

    // Count all sub-steps across all steps
    application.steps.forEach((step: any) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const overallProgress = getOverallProgress();
  const docStats = getDocumentStats();

  return (
    <div className="flex flex-col w-full">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
          {translate('client.dashboard.welcomeTitle', 'Hoş geldiniz, {name}!', {
            name: clientName || translate('client.dashboard.defaultName', 'Değerli Danışanımız'),
          })}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {translate(
            'client.dashboard.welcomeSubtitle',
            'Başvuru süreçlerinizin güncel durumu aşağıda yer almaktadır.'
          )}
        </p>
      </div>

      {/* General Progress Card */}
      <Card className="mb-8 border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle>{translate('client.dashboard.overallProgress.title', 'Genel İlerleme')}</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {translate('client.dashboard.overallProgress.description', 'Tüm süreçlerinizin toplu durumu')}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-blue-600">
                {overallProgress.percentage}%
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {translate('client.dashboard.overallProgress.completedLabel', 'Tamamlandı')}
                </p>
                <p className="text-lg font-semibold">
                  {overallProgress.completed}/{overallProgress.total}{' '}
                  {translate('client.dashboard.overallProgress.stepsLabel', 'Alt Adım')}
                </p>
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all flex items-center justify-end pr-2"
              style={{ width: `${overallProgress.percentage}%` }}
            >
              {overallProgress.percentage > 10 && (
                <span className="text-xs text-white font-medium">
                  {overallProgress.percentage}%
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content - Two Columns */}
      {application && application.steps && application.steps.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Application Stages */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{translate('client.dashboard.applicationStages.title', 'Başvuru Aşamaları')}</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {application.steps.map((step, index) => {
                    const isSelected = selectedStep?.id === step.id;
                    
                    // Check if this is a visa step (should not show documents)
                    const stepName = ((step as any).name || (step as any).title || '').toLowerCase();
                    const isVisaStep = stepName.includes('vize') || stepName.includes('visa');
                    
                    // Check if this step has document-related sub-steps (only for non-visa steps)
                    const hasDocumentSubStep = !isVisaStep && step.subSteps?.some(subStep => 
                      subStep.name?.toLowerCase().includes('belgeler') || 
                      subStep.name?.toLowerCase().includes('document') ||
                      subStep.name?.toLowerCase().includes('yüklendi') ||
                      subStep.name?.toLowerCase().includes('uploaded')
                    );
                    
                    // Check if document sub-step is completed
                    const documentSubStep = hasDocumentSubStep ? step.subSteps?.find((s: any) => {
                      const subStepName = (s.name || '').toLowerCase();
                      return subStepName.includes('belgeler') || 
                             subStepName.includes('document') ||
                             subStepName.includes('yüklendi') ||
                             subStepName.includes('uploaded');
                    }) : null;
                    const isDocumentSubStepCompleted = documentSubStep && (documentSubStep.isCompleted || documentSubStep.status?.toLowerCase() === 'completed');
                    
                    // Calculate step progress based on all sub-steps completion (same as right panel)
                    const totalSubSteps = step.subSteps?.length || 0;
                    let stepProgress = 0;
                    
                    if (totalSubSteps > 0) {
                      // Simple calculation: completed sub-steps / total sub-steps
                      const completedSubSteps = step.subSteps?.filter((s: any) => s && (s.isCompleted || s.status?.toLowerCase() === 'completed')).length || 0;
                      stepProgress = Math.round((completedSubSteps / totalSubSteps) * 100);
                    } else {
                      // No sub-steps, use step status
                      stepProgress = step.status?.toLowerCase() === 'completed' ? 100 : step.status?.toLowerCase() === 'inprogress' ? 50 : 0;
                    }

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
                            {getStepIcon((step as any).name || (step as any).title)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-gray-500">
                                {translate('client.dashboard.step.label', 'Adım {number}', { number: index + 1 })}
                              </span>
                              {getStatusIcon(step.status)}
                            </div>
                            <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                              {(step as any).name ||
                                (step as any).title ||
                                translate('client.dashboard.step.fallback', 'Adım {number}', { number: index + 1 })}
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
                                step.status?.toLowerCase() === 'completed' || stepProgress === 100
                                  ? 'bg-green-500'
                                  : step.status?.toLowerCase() === 'inprogress' || stepProgress > 0
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
                            <Badge className={getStatusColor(step.status)} variant="outline">
                              {getStatusText(step.status)}
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
                      <CardTitle>
                        {(selectedStep as any).name ||
                          (selectedStep as any).title ||
                          translate('client.dashboard.step.detailsTitle', 'Adım Detayları')}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {translate(
                          'client.dashboard.step.detailsSubtitle',
                          'Adım {current}/{total}',
                          {
                            current: application.steps.findIndex((s: any) => s.id === selectedStep.id) + 1,
                            total: application.steps.length,
                          }
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedStep.subSteps && selectedStep.subSteps.length > 0
                          ? Math.round((selectedStep.subSteps.filter((s: any) => s && (s.isCompleted || s.status?.toLowerCase() === 'completed')).length / selectedStep.subSteps.length) * 100)
                          : selectedStep.status?.toLowerCase() === 'completed' ? 100 : selectedStep.status?.toLowerCase() === 'inprogress' ? 50 : 0}%
                      </div>
                      <p className="text-xs text-gray-500">
                        {translate('client.dashboard.step.detailsProgress', 'İlerleme')}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Process Steps (Sub-Steps) */}
                  {selectedStep.subSteps && selectedStep.subSteps.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-semibold mb-4">
                        {translate('client.dashboard.subSteps.title', 'İşlem Adımları')}
                      </h4>
                      {selectedStep.subSteps.map((subStep: any, subIndex: number) => {
                        const isCompleted = subStep.isCompleted || subStep.status?.toLowerCase() === 'completed';
                        const isInProgress = subStep.status?.toLowerCase() === 'inprogress';
                        const bgColor = isCompleted
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : isInProgress
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
                        
                        // Check if this is the "Denklik Harç Ödemesi" step
                        const isEquivalencyPaymentStep = subStep.name?.toLowerCase().includes('denklik') && 
                                                         (subStep.name?.toLowerCase().includes('harç') || 
                                                          subStep.name?.toLowerCase().includes('ödeme') ||
                                                          subStep.name?.toLowerCase().includes('fee') ||
                                                          subStep.name?.toLowerCase().includes('payment'));

                        // Check if this is the "Belgeler Yüklendi" step to show document stats
                        // Only show for non-visa steps
                        const stepName = ((selectedStep as any).name || (selectedStep as any).title || '').toLowerCase();
                        const isVisaStep = stepName.includes('vize') || stepName.includes('visa');
                        const isFirstStep = stepName.includes('denklik') || stepName.includes('equivalency');
                        const isDocumentStep = !isVisaStep && (
                          subStep.name?.toLowerCase().includes('belgeler') || 
                          subStep.name?.toLowerCase().includes('document') ||
                          subStep.name?.toLowerCase().includes('yüklendi') ||
                          subStep.name?.toLowerCase().includes('uploaded')
                        );
                        // Hide document details in first step (Denklik İşlemleri) - only show in sidebar
                        const shouldShowDocumentDetails = isDocumentStep && !isFirstStep;

                        // Get document stats for this step
                        const stepDocStats = isDocumentStep ? getDocumentStats() : null;
                        // Calculate approval percentage based on required document count
                        const approvalPercentage = stepDocStats && stepDocStats.required > 0
                          ? Math.round((stepDocStats.accepted / stepDocStats.required) * 100)
                          : 0;

                        return (
                          <div
                            key={subStep.id}
                            className={`p-4 rounded-lg border-2 ${bgColor}`}
                          >
                            <div className="flex items-start gap-3">
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
                                
                                {/* Show Denklik Belgesi if this is "Denklik Belgesi Hazır" sub-step */}
                                {isFirstStep && subStep.name?.toLowerCase().includes('belge') && subStep.name?.toLowerCase().includes('hazır') && (
                                  <div className="mt-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    {documents.filter(doc => 
                                      doc.documentTypeName?.toLowerCase().includes('denklik') && 
                                      doc.status?.toLowerCase() === 'accepted'
                                    ).length > 0 ? (
                                      <div className="space-y-2">
                                        {documents.filter(doc => 
                                          doc.documentTypeName?.toLowerCase().includes('denklik') && 
                                          doc.status?.toLowerCase() === 'accepted'
                                        ).map(doc => (
                                          <div key={doc.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-green-200 dark:border-green-700">
                                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {doc.documentTypeName}
                                              </p>
                                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {translate('client.dashboard.document.uploaded', 'Yüklendi')}: {new Date(doc.uploadedAt).toLocaleDateString('tr-TR')}
                                              </p>
                                            </div>
                                            <div className="flex gap-2 flex-shrink-0">
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={async () => {
                                                  try {
                                                    // Fetch with authorization
                                                    const blob = await documentService.downloadDocument(doc.id);
                                                    const url = URL.createObjectURL(blob);
                                                    
                                                    // Open in new window for preview
                                                    window.open(url, '_blank', 'width=800,height=600');
                                                    
                                                    // Clean up blob URL after a short delay
                                                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                                                  } catch (error) {
                                                    console.error('Error previewing document:', error);
                                                    toast.error('Belge önizlenirken hata oluştu');
                                                  }
                                                }}
                                                className="flex items-center gap-1"
                                              >
                                                <FileText className="w-4 h-4" />
                                                {translate('client.dashboard.document.preview', 'Önizle')}
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={async () => {
                                                  try {
                                                    const blob = await documentService.downloadDocument(doc.id);
                                                    const url = URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = doc.originalFileName || 'document.pdf';
                                                    document.body.appendChild(a);
                                                    a.click();
                                                    document.body.removeChild(a);
                                                    URL.revokeObjectURL(url);
                                                  } catch (error) {
                                                    console.error('Error downloading document:', error);
                                                    toast.error('Belge indirilirken hata oluştu');
                                                  }
                                                }}
                                                className="flex items-center gap-1"
                                              >
                                                <Download className="w-4 h-4" />
                                                {translate('client.dashboard.document.download', 'İndir')}
                                              </Button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                        <Clock className="w-5 h-5" />
                                        <p className="text-sm">
                                          {translate('client.dashboard.document.waiting', 'Denklik belgesi bekleniyor...')}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Document Statistics for "Belgeler Yüklendi" step - Hidden in first step */}
                                {shouldShowDocumentDetails && stepDocStats && (
                                  <div className="mt-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                    <div className="mb-3">
                                      <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        {translate('client.dashboard.documentStatus.title', 'Belge Durumu')}
                                      </h5>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                          {translate('client.dashboard.documentStatus.required', 'Gerekli Belge')}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stepDocStats.required}</p>
                                      </div>
                                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                          {translate('client.dashboard.documentStatus.approved', 'Onaylanan')}
                                        </p>
                                        <p className="text-2xl font-bold text-green-600">{stepDocStats.accepted}</p>
                                      </div>
                                      <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                          {translate('client.dashboard.documentStatus.pending', 'Bekleyen')}
                                        </p>
                                        <p className="text-2xl font-bold text-yellow-600">{stepDocStats.pending}</p>
                                      </div>
                                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                          {translate('client.dashboard.documentStatus.approvalRate', 'Onay Oranı')}
                                        </p>
                                        <p className="text-2xl font-bold text-blue-600">{approvalPercentage}%</p>
                                      </div>
                                    </div>
                                    
                                    {/* Progress bar for document approval */}
                                    {stepDocStats.required > 0 && (
                                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3">
                                        <div
                                          className="bg-green-500 h-3 rounded-full transition-all flex items-center justify-end pr-2"
                                          style={{ width: `${approvalPercentage}%` }}
                                        >
                                          {approvalPercentage > 10 && (
                                            <span className="text-xs text-white font-medium">
                                              {approvalPercentage}%
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Detailed Status text */}
                                    {stepDocStats.required === 0 ? (
                                      <div className="text-center py-2 bg-gray-50 dark:bg-gray-800 rounded">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                          {translate(
                                            'client.dashboard.documentStatus.noRequired',
                                            'Eğitim tipi için gerekli belge bulunamadı'
                                          )}
                                        </p>
                                      </div>
                                    ) : stepDocStats.accepted === stepDocStats.required ? (
                                      <div className="text-center py-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                                        <p className="text-sm text-green-700 dark:text-green-400 font-medium flex items-center justify-center gap-2">
                                          <CheckCircle2 className="w-4 h-4" />
                                          {translate(
                                            'client.dashboard.documentStatus.allApproved',
                                            'Tüm belgeler onaylandı ({accepted}/{required})',
                                            { accepted: stepDocStats.accepted, required: stepDocStats.required }
                                          )}
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="space-y-1 text-center">
                                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                          {translate(
                                            'client.dashboard.documentStatus.summary',
                                            '{accepted} belge onaylandı, {pending} belge onay bekliyor',
                                            { accepted: stepDocStats.accepted, pending: stepDocStats.pending }
                                          )}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                          {translate(
                                            'client.dashboard.documentStatus.remaining',
                                            '{count} belge henüz yüklenmedi',
                                            {
                                              count:
                                                stepDocStats.required -
                                                stepDocStats.accepted -
                                                stepDocStats.pending,
                                            }
                                          )}
                                        </p>
                                        {stepDocStats.rejected > 0 && (
                                          <p className="text-xs text-red-600 dark:text-red-400">
                                            {translate(
                                              'client.dashboard.documentStatus.rejected',
                                              '{count} belge reddedildi',
                                              { count: stepDocStats.rejected }
                                            )}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {isCompleted && subStep.completedAt && !isDocumentStep && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {translate(
                                      'client.dashboard.subStep.completedAt',
                                      'Tamamlandı: {date}',
                                      {
                                        date: new Date(subStep.completedAt).toLocaleDateString('tr-TR', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                        }),
                                      }
                                    )}
                                  </p>
                                )}
                                {isInProgress && !isCompleted && !isDocumentStep && (
                                  <>
                                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1 mb-3">
                                      {translate('client.dashboard.subStep.inProgress', 'Devam ediyor...')}
                                    </p>
                                    {/* Denklik Harç Ödemesi butonu */}
                                    {isEquivalencyPaymentStep && (() => {
                                      const amount = feeSettings?.amount || 200;
                                      const currency = feeSettings?.currency || 'EUR';
                                      const buttonText = language === 'tr' 
                                        ? `Denklik Ücreti Öde (${amount.toFixed(2)} ${currency})`
                                        : language === 'de'
                                        ? `Gleichwertigkeitsgebühr zahlen (${amount.toFixed(2)} ${currency})`
                                        : language === 'en'
                                        ? `Pay Equivalency Fee (${amount.toFixed(2)} ${currency})`
                                        : `دفع رسوم المعادلة (${amount.toFixed(2)} ${currency})`;
                                      return (
                                        <Button
                                          onClick={() => navigate('/client/equivalency-fee-payment')}
                                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                          <CreditCard className="w-4 h-4 mr-2" />
                                          {buttonText}
                                        </Button>
                                      );
                                    })()}
                                  </>
                                )}
                                {!isInProgress && !isCompleted && !isDocumentStep && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {translate('client.dashboard.subStep.notStarted', 'Henüz başlamadı')}
                                  </p>
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
                        {translate('client.dashboard.subSteps.empty', 'Bu aşama için alt adım bulunmamaktadır.')}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/client/documents')}
                      className="flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      {translate('client.dashboard.buttons.uploadDocuments', 'Belge Yükle')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/client/profile')}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {translate('client.dashboard.buttons.viewProfile', 'Profili Görüntüle')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Info className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {translate('client.dashboard.step.selectPrompt', 'Detayları görüntülemek için bir aşama seçin')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {translate('client.dashboard.noApplication.title', 'Başvuru Bulunamadı')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {translate('client.dashboard.noApplication.subtitle', 'Henüz bir başvuru süreciniz bulunmamaktadır.')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {translate(
                'client.dashboard.noApplication.helper',
                'Sistem kayıt sırasında başvuru sürecinizi otomatik olarak başlatacaktır.'
              )}
            </p>
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default Dashboard;
