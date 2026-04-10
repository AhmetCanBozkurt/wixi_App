import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  FileText, 
  CheckCircle, 
  Clock,
  PlayCircle,
  XCircle,
  Search,
  Filter,
  Loader2,
  ChevronRight,
  ChevronDown,
  Calendar,
  User,
  TrendingUp
} from 'lucide-react';
import { applicationService } from '../../ApiServices/services';
import type { IApplicationResponseDto, IApplicationStepResponseDto } from '../../ApiServices/types/ApplicationTypes';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';

const ApplicationManagement: React.FC = () => {
  const [applications, setApplications] = useState<IApplicationResponseDto[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<IApplicationResponseDto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      console.log('📋 Loading all applications...');
      const response: any = await applicationService.getAllApplications();
      console.log('📋 Raw API Response:', response);
      
      // Parse API response - handle wrapper object {success, data, count}
      const data = response?.data || response || [];
      console.log('📋 Parsed applications:', data);
      
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Error loading applications:', error);
      toast.error('Başvurular yüklenirken hata oluştu');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (app: IApplicationResponseDto) => {
    setSelectedApplication(app);
    setDetailsDialogOpen(true);
    // Expand all steps by default
    const stepIds = app.steps.map(step => step.id);
    setExpandedSteps(new Set(stepIds));
  };

  const toggleStepExpanded = (stepId: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const getStatusColor = (status: string) => {
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

  const getStepStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'inprogress':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'notstarted':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
      case 'blocked':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'inprogress':
        return <PlayCircle className="w-4 h-4" />;
      case 'notstarted':
        return <Clock className="w-4 h-4" />;
      case 'blocked':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredApplications = Array.isArray(applications) 
    ? applications.filter(app => {
        const matchesSearch = 
          app.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.templateName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || app.status.toLowerCase() === filterStatus.toLowerCase();
        return matchesSearch && matchesStatus;
      })
    : [];

  const statistics = {
    total: Array.isArray(applications) ? applications.length : 0,
    inProgress: Array.isArray(applications) ? applications.filter(a => a.status.toLowerCase() === 'inprogress').length : 0,
    completed: Array.isArray(applications) ? applications.filter(a => a.status.toLowerCase() === 'completed').length : 0,
    draft: Array.isArray(applications) ? applications.filter(a => a.status.toLowerCase() === 'draft').length : 0,
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Başvuru Yönetimi</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Tüm başvuruları inceleyin ve yönetin</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('all')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Toplam Başvuru</p>
                <p className="text-3xl font-bold mt-1">{statistics.total}</p>
              </div>
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('InProgress')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Devam Eden</p>
                <p className="text-3xl font-bold mt-1 text-blue-600">{statistics.inProgress}</p>
              </div>
              <PlayCircle className="w-10 h-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('Completed')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tamamlanan</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{statistics.completed}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('Draft')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Taslak</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{statistics.draft}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Müşteri adı veya başvuru türü ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {filterStatus !== 'all' && (
              <Button variant="outline" onClick={() => setFilterStatus('all')}>
                <Filter className="w-4 h-4 mr-2" />
                Filtreyi Temizle
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Başvurular ({filteredApplications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">Başvuru bulunamadı</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{app.templateName}</h3>
                        <Badge className={getStatusColor(app.status)}>
                          {app.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{app.clientName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(app.startDate).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          <span>{app.completedSteps}/{app.totalSteps} Adım</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>{app.progressPercentage}% Tamamlandı</span>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${app.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleViewDetails(app)}
                      className="ml-4"
                    >
                      Detaylar
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Başvuru Detayları</DialogTitle>
            <DialogDescription>
              {selectedApplication?.templateName} - {selectedApplication?.clientName}
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* Overview */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <label className="text-sm text-gray-500">Müşteri</label>
                  <p className="font-medium">{selectedApplication.clientName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Durum</label>
                  <Badge className={getStatusColor(selectedApplication.status)}>
                    {selectedApplication.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Başlangıç Tarihi</label>
                  <p className="font-medium">{new Date(selectedApplication.startDate).toLocaleDateString('tr-TR')}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">İlerleme</label>
                  <p className="font-medium">{selectedApplication.progressPercentage}%</p>
                </div>
                {selectedApplication.estimatedCompletionDate && (
                  <div>
                    <label className="text-sm text-gray-500">Tahmini Bitiş</label>
                    <p className="font-medium">
                      {new Date(selectedApplication.estimatedCompletionDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                )}
                {selectedApplication.notes && (
                  <div className="col-span-2">
                    <label className="text-sm text-gray-500">Notlar</label>
                    <p className="font-medium">{selectedApplication.notes}</p>
                  </div>
                )}
              </div>

              {/* Steps */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Adımlar</h3>
                <div className="space-y-2">
                  {selectedApplication.steps.map((step) => (
                    <div
                      key={step.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                    >
                      {/* Step Header */}
                      <div
                        className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                          getStepStatusColor(step.status)
                        }`}
                        onClick={() => toggleStepExpanded(step.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStepStatusIcon(step.status)}
                            <div>
                              <p className="font-medium">
                                Adım {step.stepOrder}: {step.name}
                              </p>
                              {step.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{step.status}</Badge>
                            {expandedSteps.has(step.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Sub-Steps */}
                      {expandedSteps.has(step.id) && step.subSteps && step.subSteps.length > 0 && (
                        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Alt Adımlar:</p>
                          <div className="space-y-2">
                            {step.subSteps.map((subStep) => (
                              <div
                                key={subStep.id}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded"
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${
                                    subStep.isCompleted ? 'bg-green-500' : 'bg-gray-400'
                                  }`} />
                                  <span className="text-sm">{subStep.name}</span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {subStep.isCompleted ? 'Tamamlandı' : 'Bekliyor'}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
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

export default ApplicationManagement;

