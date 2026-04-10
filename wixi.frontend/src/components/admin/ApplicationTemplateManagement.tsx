import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { 
  FileText, 
  Plus,
  Edit,
  Trash2,
  Loader2,
  Search,
  Eye,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Save,
  X,
  ArrowLeft
} from 'lucide-react';
import { applicationService } from '../../ApiServices/services';
import type { IApplicationTemplateDto, IApplicationStepTemplateDto, IApplicationSubStepTemplateDto } from '../../ApiServices/types/ApplicationTypes';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/language-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

const ApplicationTemplateManagement: React.FC = () => {
  const { language } = useLanguage();
  const [templates, setTemplates] = useState<IApplicationTemplateDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<IApplicationTemplateDto | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<IApplicationTemplateDto | null>(null);
  const [saving, setSaving] = useState(false);

  // Helper function to get template name based on current language
  const getTemplateName = (template: IApplicationTemplateDto): string => {
    const lang = language.toUpperCase();
    switch (lang) {
      case 'TR':
        return template.name_TR || template.name || '';
      case 'EN':
        return template.name_EN || template.nameEn || template.name_TR || template.name || '';
      case 'DE':
        return template.name_DE || template.name_EN || template.nameEn || template.name_TR || template.name || '';
      case 'AR':
        return template.name_AR || template.name_TR || template.name || '';
      default:
        return template.name_TR || template.name || '';
    }
  };

  // Helper function to get template description based on current language
  const getTemplateDescription = (template: IApplicationTemplateDto): string => {
    const lang = language.toUpperCase();
    switch (lang) {
      case 'TR':
        return template.description_TR || template.description || '';
      case 'EN':
        return template.description_EN || template.description || '';
      case 'DE':
        return template.description_DE || template.description_EN || template.description || '';
      case 'AR':
        return template.description_AR || template.description_TR || template.description || '';
      default:
        return template.description_TR || template.description || '';
    }
  };

  // Helper function to get step title based on current language
  const getStepTitle = (step: IApplicationStepTemplateDto): string => {
    const lang = language.toUpperCase();
    switch (lang) {
      case 'TR':
        return step.title_TR || step.name || '';
      case 'EN':
        return step.title_EN || step.nameEn || step.name || '';
      case 'DE':
        return step.title_DE || step.title_EN || step.nameEn || step.name || '';
      case 'AR':
        return step.title_AR || step.title_TR || step.name || '';
      default:
        return step.title_TR || step.name || '';
    }
  };

  // Helper function to get step description based on current language
  const getStepDescription = (step: IApplicationStepTemplateDto): string => {
    const lang = language.toUpperCase();
    switch (lang) {
      case 'TR':
        return step.description_TR || step.description || '';
      case 'EN':
        return step.description_EN || step.description || '';
      case 'DE':
        return step.description_DE || step.description_EN || step.description || '';
      case 'AR':
        return step.description_AR || step.description_TR || step.description || '';
      default:
        return step.description_TR || step.description || '';
    }
  };

  // Helper function to get substep name based on current language
  const getSubStepName = (subStep: IApplicationSubStepTemplateDto): string => {
    const lang = language.toUpperCase();
    switch (lang) {
      case 'TR':
        return subStep.name_TR || subStep.name || '';
      case 'EN':
        return subStep.name_EN || subStep.nameEn || subStep.name || '';
      case 'DE':
        return subStep.name_DE || subStep.name_EN || subStep.nameEn || subStep.name || '';
      case 'AR':
        return subStep.name_AR || subStep.name_TR || subStep.name || '';
      default:
        return subStep.name_TR || subStep.name || '';
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      console.log('📋 Loading application templates...');
      // Service already handles response parsing
      const data = await applicationService.getAllTemplates();
      console.log('📋 Raw templates data:', data);
      
      // Map backend response (PascalCase) to frontend format (camelCase) with multi-language support
      const mappedData = Array.isArray(data) ? data.map((template: any) => {
        // Map steps (stepTemplates -> steps for backward compatibility)
        const steps = (template.stepTemplates || template.StepTemplates || []).map((step: any) => ({
          id: step.id || step.Id,
          applicationTemplateId: step.applicationTemplateId || step.ApplicationTemplateId,
          // Multi-language titles
          title_TR: step.title_TR || step.Title_TR || step.name || '',
          title_EN: step.title_EN || step.Title_EN || step.nameEn || '',
          title_DE: step.title_DE || step.Title_DE || '',
          title_AR: step.title_AR || step.Title_AR || '',
          // Multi-language descriptions
          description_TR: step.description_TR || step.Description_TR || step.description || '',
          description_EN: step.description_EN || step.Description_EN || '',
          description_DE: step.description_DE || step.Description_DE || '',
          description_AR: step.description_AR || step.Description_AR || '',
          // Legacy fields for backward compatibility
          name: step.title_TR || step.Title_TR || step.name || '',
          nameEn: step.title_EN || step.Title_EN || step.nameEn || '',
          description: step.description_TR || step.Description_TR || step.description || '',
          // Other fields
          stepOrder: step.stepOrder || step.StepOrder || 0,
          iconName: step.iconName || step.IconName || '',
          isRequired: step.isRequired ?? step.IsRequired ?? true,
          isActive: step.isActive ?? step.IsActive ?? true,
          estimatedDurationDays: step.estimatedDurationDays || step.EstimatedDurationDays || 0,
          // Sub-steps
          subStepTemplates: (step.subStepTemplates || step.SubStepTemplates || []).map((subStep: any) => ({
            id: subStep.id || subStep.Id,
            stepTemplateId: subStep.stepTemplateId || subStep.StepTemplateId,
            // Multi-language names
            name_TR: subStep.name_TR || subStep.Name_TR || subStep.name || '',
            name_EN: subStep.name_EN || subStep.Name_EN || subStep.nameEn || '',
            name_DE: subStep.name_DE || subStep.Name_DE || '',
            name_AR: subStep.name_AR || subStep.Name_AR || '',
            // Multi-language descriptions
            description_TR: subStep.description_TR || subStep.Description_TR || subStep.description || '',
            description_EN: subStep.description_EN || subStep.Description_EN || '',
            description_DE: subStep.description_DE || subStep.Description_DE || '',
            description_AR: subStep.description_AR || subStep.Description_AR || '',
            // Legacy fields
            name: subStep.name_TR || subStep.Name_TR || subStep.name || '',
            nameEn: subStep.name_EN || subStep.Name_EN || subStep.nameEn || '',
            description: subStep.description_TR || subStep.Description_TR || subStep.description || '',
            // Other fields
            subStepOrder: subStep.subStepOrder || subStep.SubStepOrder || 0,
            isRequired: subStep.isRequired ?? subStep.IsRequired ?? true,
            isActive: subStep.isActive ?? subStep.IsActive ?? true,
            estimatedDurationDays: subStep.estimatedDurationDays || subStep.EstimatedDurationDays || 0
          })),
          subSteps: (step.subStepTemplates || step.SubStepTemplates || []).map((subStep: any) => ({
            id: subStep.id || subStep.Id,
            stepTemplateId: subStep.stepTemplateId || subStep.StepTemplateId,
            name_TR: subStep.name_TR || subStep.Name_TR || subStep.name || '',
            name_EN: subStep.name_EN || subStep.Name_EN || subStep.nameEn || '',
            name_DE: subStep.name_DE || subStep.Name_DE || '',
            name_AR: subStep.name_AR || subStep.Name_AR || '',
            description_TR: subStep.description_TR || subStep.Description_TR || subStep.description || '',
            description_EN: subStep.description_EN || subStep.Description_EN || '',
            description_DE: subStep.description_DE || subStep.Description_DE || '',
            description_AR: subStep.description_AR || subStep.Description_AR || '',
            name: subStep.name_TR || subStep.Name_TR || subStep.name || '',
            nameEn: subStep.name_EN || subStep.Name_EN || subStep.nameEn || '',
            description: subStep.description_TR || subStep.Description_TR || subStep.description || '',
            subStepOrder: subStep.subStepOrder || subStep.SubStepOrder || 0,
            isRequired: subStep.isRequired ?? subStep.IsRequired ?? true,
            isActive: subStep.isActive ?? subStep.IsActive ?? true,
            estimatedDurationDays: subStep.estimatedDurationDays || subStep.EstimatedDurationDays || 0
          }))
        }));

        return {
          id: template.id || template.Id,
          // Multi-language names
          name_TR: template.name_TR || template.Name_TR || template.name || '',
          name_EN: template.name_EN || template.Name_EN || template.nameEn || '',
          name_DE: template.name_DE || template.Name_DE || '',
          name_AR: template.name_AR || template.Name_AR || '',
          // Multi-language descriptions
          description_TR: template.description_TR || template.Description_TR || template.description || '',
          description_EN: template.description_EN || template.Description_EN || '',
          description_DE: template.description_DE || template.Description_DE || '',
          description_AR: template.description_AR || template.Description_AR || '',
          // Legacy fields for backward compatibility
          name: template.name_TR || template.Name_TR || template.name || '',
          nameEn: template.name_EN || template.Name_EN || template.nameEn || '',
          description: template.description_TR || template.Description_TR || template.description || '',
          // Other fields
          type: template.type || template.Type || '',
          isActive: template.isActive ?? template.IsActive ?? true,
          isDefault: template.isDefault ?? template.IsDefault ?? false,
          displayOrder: template.displayOrder || template.DisplayOrder || 0,
          iconName: template.iconName || template.IconName || '',
          estimatedDurationDays: template.estimatedDurationDays || template.EstimatedDurationDays || 0,
          minDurationDays: template.minDurationDays || template.MinDurationDays || 0,
          maxDurationDays: template.maxDurationDays || template.MaxDurationDays || 0,
          // Step templates (both camelCase and legacy)
          stepTemplates: steps,
          steps: steps // Legacy field for backward compatibility
        };
      }) : [];
      
      console.log('📋 Mapped templates:', mappedData);
      setTemplates(mappedData);
    } catch (error) {
      console.error('❌ Error loading templates:', error);
      toast.error('Şablonlar yüklenirken hata oluştu');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTemplate = (template: IApplicationTemplateDto) => {
    setSelectedTemplate(template);
    setEditingTemplate(JSON.parse(JSON.stringify(template))); // Deep copy
    setViewDialogOpen(true);
  };

  const handleEditTemplate = () => {
    setEditDialogOpen(true);
    setViewDialogOpen(false);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;

    setSaving(true);
    try {
      // TODO: Implement API call to save template
      // await applicationService.updateTemplate(editingTemplate.id, editingTemplate);
      
      toast.success('Şablon başarıyla güncellendi');
      await loadTemplates();
      setEditDialogOpen(false);
      setViewDialogOpen(false);
      setSelectedTemplate(null);
      setEditingTemplate(null);
    } catch (error) {
      console.error('❌ Error saving template:', error);
      toast.error('Şablon kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleAddStep = () => {
    if (!editingTemplate) return;

    const steps = editingTemplate.stepTemplates || editingTemplate.steps || [];
    const newStep: IApplicationStepTemplateDto = {
      id: Date.now(), // Temporary ID
      applicationTemplateId: editingTemplate.id,
      title_TR: 'Yeni Adım',
      title_EN: 'New Step',
      title_DE: '',
      title_AR: '',
      description_TR: '',
      description_EN: '',
      description_DE: '',
      description_AR: '',
      name: 'Yeni Adım',
      nameEn: 'New Step',
      description: '',
      stepOrder: steps.length + 1,
      estimatedDurationDays: 1,
      isRequired: true,
      isActive: true,
      iconName: '',
      subStepTemplates: [],
      subSteps: []
    };

    setEditingTemplate({
      ...editingTemplate,
      stepTemplates: [...steps, newStep],
      steps: [...steps, newStep]
    });
  };

  const handleUpdateStep = (stepId: number | string, field: keyof IApplicationStepTemplateDto, value: any, legacyField?: keyof IApplicationStepTemplateDto, legacyValue?: any) => {
    if (!editingTemplate) return;

    setEditingTemplate({
      ...editingTemplate,
      stepTemplates: (editingTemplate.stepTemplates || editingTemplate.steps || []).map(step => {
        if (step.id === stepId) {
          const updated: any = { ...step };
          updated[field] = value;
          if (legacyField && legacyValue !== undefined) {
            updated[legacyField] = legacyValue;
          }
          return updated as IApplicationStepTemplateDto;
        }
        return step;
      }),
      steps: (editingTemplate.stepTemplates || editingTemplate.steps || []).map(step => {
        if (step.id === stepId) {
          const updated: any = { ...step };
          updated[field] = value;
          if (legacyField && legacyValue !== undefined) {
            updated[legacyField] = legacyValue;
          }
          return updated as IApplicationStepTemplateDto;
        }
        return step;
      })
    });
  };

  const handleDeleteStep = (stepId: number | string) => {
    if (!editingTemplate) return;

    // Filter and reorder steps
    const filteredSteps = editingTemplate.steps
      ?.filter(step => step.id !== stepId)
      .map((step, index) => ({ ...step, stepOrder: index + 1 })) || [];

    setEditingTemplate({
      ...editingTemplate,
      steps: filteredSteps
    });
  };

  const handleMoveStep = (stepId: number | string, direction: 'up' | 'down') => {
    if (!editingTemplate) return;

    const steps = [...(editingTemplate.stepTemplates || editingTemplate.steps || [])];
    const index = steps.findIndex(s => s.id === stepId);
    
    if (direction === 'up' && index > 0) {
      [steps[index], steps[index - 1]] = [steps[index - 1], steps[index]];
    } else if (direction === 'down' && index < steps.length - 1) {
      [steps[index], steps[index + 1]] = [steps[index + 1], steps[index]];
    }

    // Update step orders
    steps.forEach((step, idx) => {
      step.stepOrder = idx + 1;
    });

    setEditingTemplate({
      ...editingTemplate,
      stepTemplates: steps,
      steps: steps
    });
  };

  const handleAddSubStep = (stepId: number | string) => {
    if (!editingTemplate) return;

    const steps = editingTemplate.stepTemplates || editingTemplate.steps || [];
    const step = steps.find(s => s.id === stepId);
    const subSteps = step?.subStepTemplates || step?.subSteps || [];

    const newSubStep: IApplicationSubStepTemplateDto = {
      id: Date.now(),
      stepTemplateId: typeof stepId === 'number' ? stepId : parseInt(stepId.toString()),
      name_TR: 'Yeni Alt Adım',
      name_EN: 'New Sub Step',
      name_DE: '',
      name_AR: '',
      description_TR: '',
      description_EN: '',
      description_DE: '',
      description_AR: '',
      name: 'Yeni Alt Adım',
      nameEn: 'New Sub Step',
      description: '',
      subStepOrder: subSteps.length + 1,
      isRequired: true,
      isActive: true,
      estimatedDurationDays: 0
    };

    const updatedSteps = steps.map(s => {
      if (s.id === stepId) {
        return {
          ...s,
          subStepTemplates: [...(s.subStepTemplates || []), newSubStep],
          subSteps: [...(s.subSteps || []), newSubStep]
        };
      }
      return s;
    });

    setEditingTemplate({
      ...editingTemplate,
      stepTemplates: updatedSteps,
      steps: updatedSteps
    });
  };

  const handleUpdateSubStep = (stepId: number | string, subStepId: number | string, field: keyof IApplicationSubStepTemplateDto, value: any, legacyField?: keyof IApplicationSubStepTemplateDto, legacyValue?: any) => {
    if (!editingTemplate) return;

    const steps = editingTemplate.stepTemplates || editingTemplate.steps || [];
    const updatedSteps = steps.map(step => {
      if (step.id === stepId) {
        const subSteps = step.subStepTemplates || step.subSteps || [];
        const updatedSubSteps = subSteps.map(subStep => {
          if (subStep.id === subStepId) {
            const updated: any = { ...subStep };
            updated[field] = value;
            if (legacyField && legacyValue !== undefined) {
              updated[legacyField] = legacyValue;
            }
            return updated as IApplicationSubStepTemplateDto;
          }
          return subStep;
        });
        return {
          ...step,
          subStepTemplates: updatedSubSteps,
          subSteps: updatedSubSteps
        };
      }
      return step;
    });

    setEditingTemplate({
      ...editingTemplate,
      stepTemplates: updatedSteps,
      steps: updatedSteps
    });
  };

  const handleDeleteSubStep = (stepId: number | string, subStepId: number | string) => {
    if (!editingTemplate) return;

    const steps = editingTemplate.stepTemplates || editingTemplate.steps || [];
    const updatedSteps = steps.map(step => {
      if (step.id === stepId) {
        const subSteps = step.subStepTemplates || step.subSteps || [];
        const filteredSubSteps = subSteps
          .filter(subStep => subStep.id !== subStepId)
          .map((subStep, index) => ({ ...subStep, subStepOrder: index + 1 }));
        return {
          ...step,
          subStepTemplates: filteredSubSteps,
          subSteps: filteredSubSteps
        };
      }
      return step;
    });

    setEditingTemplate({
      ...editingTemplate,
      stepTemplates: updatedSteps,
      steps: updatedSteps
    });
  };

  const filteredTemplates = Array.isArray(templates)
    ? templates.filter(template =>
        (template.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (template.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      )
    : [];

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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Başvuru Şablonları</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Başvuru türlerini ve adımlarını yönetin</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Yeni Şablon
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Şablon ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{getTemplateName(template)}</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {(template.stepTemplates || template.steps || []).length} Adım
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={template.isActive ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800" : "bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800"}>
                  {template.isActive ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {getTemplateDescription(template) || 'Açıklama yok'}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleViewTemplate(template)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Görüntüle
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    handleViewTemplate(template);
                    handleEditTemplate();
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Şablon Bulunamadı
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Arama kriterlerine uygun şablon bulunamadı.' : 'Henüz şablon oluşturulmamış.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* View Template Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemplate ? getTemplateName(selectedTemplate) : 'Şablon Detayı'}</DialogTitle>
            <DialogDescription>
              {selectedTemplate ? getTemplateDescription(selectedTemplate) : ''}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3 text-lg">Adımlar:</h4>
                {(selectedTemplate.stepTemplates || selectedTemplate.steps || []).length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    Bu şablonda henüz adım tanımlanmamış.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {(selectedTemplate.stepTemplates || selectedTemplate.steps || []).map((step, index) => (
                      <Card key={step.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="py-4">
                          <div className="flex items-start gap-3">
                            <Badge variant="outline" className="mt-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                              {index + 1}
                            </Badge>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">{getStepTitle(step)}</p>
                                  {getStepDescription(step) && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {getStepDescription(step)}
                                    </p>
                                  )}
                                </div>
                                {step.estimatedDurationDays && step.estimatedDurationDays > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    {step.estimatedDurationDays} gün
                                  </Badge>
                                )}
                              </div>
                              {(step.subStepTemplates || step.subSteps || []).length > 0 && (
                                <div className="mt-3 ml-4 space-y-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                                  {(step.subStepTemplates || step.subSteps || []).map((subStep, subIndex) => (
                                    <div key={subStep.id} className="flex items-start gap-2 text-sm">
                                      <span className="text-gray-400 font-medium mt-0.5">{index + 1}.{subIndex + 1}</span>
                                      <div className="flex-1">
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">{getSubStepName(subStep)}</span>
                                        {(subStep.description_TR || subStep.description_EN || subStep.description) && (
                                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            {subStep.description_TR || subStep.description_EN || subStep.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Kapat
            </Button>
            <Button onClick={handleEditTemplate} className="bg-teal-600 hover:bg-teal-700">
              <Edit className="w-4 h-4 mr-2" />
              Düzenle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="!max-w-[95vw] !w-[95vw] max-h-[95vh] overflow-y-auto p-8">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditDialogOpen(false);
                  setViewDialogOpen(true);
                }}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex-1">
                <DialogTitle>Şablon Düzenle: {editingTemplate ? getTemplateName(editingTemplate) : ''}</DialogTitle>
                <DialogDescription>
                  Adımları ve alt adımları düzenleyebilir, sıralayabilir ve yönetebilirsiniz
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {editingTemplate && (
            <div className="space-y-6 px-2">
              {/* Template Info - Multi-language */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="template-name-tr">Şablon Adı (TR) *</Label>
                  <Input
                    id="template-name-tr"
                    value={editingTemplate.name_TR || editingTemplate.name || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name_TR: e.target.value, name: e.target.value })}
                    className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                </div>
                <div>
                  <Label htmlFor="template-name-en">Şablon Adı (EN)</Label>
                  <Input
                    id="template-name-en"
                    value={editingTemplate.name_EN || editingTemplate.nameEn || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name_EN: e.target.value, nameEn: e.target.value })}
                    className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                </div>
                <div>
                  <Label htmlFor="template-name-de">Şablon Adı (DE)</Label>
                  <Input
                    id="template-name-de"
                    value={editingTemplate.name_DE || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name_DE: e.target.value })}
                    className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                </div>
                <div>
                  <Label htmlFor="template-name-ar">Şablon Adı (AR)</Label>
                  <Input
                    id="template-name-ar"
                    value={editingTemplate.name_AR || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name_AR: e.target.value })}
                    className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="template-description-tr">Açıklama (TR)</Label>
                  <Textarea
                    id="template-description-tr"
                    value={editingTemplate.description_TR || editingTemplate.description || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, description_TR: e.target.value, description: e.target.value })}
                    className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                    rows={2}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="template-description-en">Açıklama (EN)</Label>
                  <Textarea
                    id="template-description-en"
                    value={editingTemplate.description_EN || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, description_EN: e.target.value })}
                    className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                    rows={2}
                  />
                </div>
              </div>

              {/* Steps */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-lg">Adımlar</h4>
                  <Button onClick={handleAddStep} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Yeni Adım
                  </Button>
                </div>

                <div className="space-y-4">
                  {(editingTemplate.stepTemplates || editingTemplate.steps || []).map((step, index) => (
                    <Card key={step.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          {/* Step Header */}
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center gap-1 pt-1">
                              <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                {index + 1}
                              </Badge>
                            </div>
                            
                            <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label htmlFor={`step-title-tr-${step.id}`}>Adım Adı (TR) *</Label>
                                  <Input
                                    id={`step-title-tr-${step.id}`}
                                    value={step.title_TR || step.name || ''}
                                    onChange={(e) => handleUpdateStep(step.id, 'title_TR', e.target.value, 'name', e.target.value)}
                                    className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`step-title-en-${step.id}`}>Adım Adı (EN)</Label>
                                  <Input
                                    id={`step-title-en-${step.id}`}
                                    value={step.title_EN || step.nameEn || ''}
                                    onChange={(e) => handleUpdateStep(step.id, 'title_EN', e.target.value, 'nameEn', e.target.value)}
                                    className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`step-duration-${step.id}`}>Tahmini Süre (Gün)</Label>
                                  <Input
                                    id={`step-duration-${step.id}`}
                                    type="number"
                                    value={step.estimatedDurationDays || 0}
                                    onChange={(e) => handleUpdateStep(step.id, 'estimatedDurationDays', parseInt(e.target.value) || 0)}
                                    className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <Label htmlFor={`step-desc-tr-${step.id}`}>Açıklama (TR)</Label>
                                <Textarea
                                  id={`step-desc-tr-${step.id}`}
                                  value={step.description_TR || step.description || ''}
                                  onChange={(e) => handleUpdateStep(step.id, 'description_TR', e.target.value, 'description', e.target.value)}
                                  className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                                  rows={2}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`step-desc-en-${step.id}`}>Açıklama (EN)</Label>
                                <Textarea
                                  id={`step-desc-en-${step.id}`}
                                  value={step.description_EN || ''}
                                  onChange={(e) => handleUpdateStep(step.id, 'description_EN', e.target.value)}
                                  className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                                  rows={2}
                                />
                              </div>

                              {/* Sub Steps */}
                              <div className="mt-4 space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm font-semibold">Alt Adımlar</Label>
                                  <Button
                                    onClick={() => handleAddSubStep(step.id)}
                                    size="sm"
                                    variant="outline"
                                    className="gap-2 text-xs"
                                  >
                                    <Plus className="w-3 h-3" />
                                    Alt Adım Ekle
                                  </Button>
                                </div>
                                {(step.subStepTemplates || step.subSteps || []).length === 0 ? (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                                    Bu adımda alt adım yok
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    {(step.subStepTemplates || step.subSteps || []).map((subStep, subIndex) => (
                                      <Card key={subStep.id} className="bg-gray-50 dark:bg-gray-800/50">
                                        <CardContent className="p-3">
                                          <div className="flex items-start gap-2">
                                            <Badge variant="outline" className="mt-1 text-xs">
                                              {index + 1}.{subIndex + 1}
                                            </Badge>
                                            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2">
                                              <Input
                                                value={subStep.name_TR || subStep.name || ''}
                                                onChange={(e) => handleUpdateSubStep(step.id, subStep.id, 'name_TR', e.target.value, 'name', e.target.value)}
                                                placeholder="Alt adım adı (TR)"
                                                className="text-sm border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                                              />
                                              <Input
                                                value={subStep.name_EN || subStep.nameEn || ''}
                                                onChange={(e) => handleUpdateSubStep(step.id, subStep.id, 'name_EN', e.target.value, 'nameEn', e.target.value)}
                                                placeholder="Alt adım adı (EN)"
                                                className="text-sm border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                                              />
                                            </div>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleDeleteSubStep(step.id, subStep.id)}
                                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </div>
                                          <div className="mt-2">
                                            <Textarea
                                              value={subStep.description_TR || subStep.description || ''}
                                              onChange={(e) => handleUpdateSubStep(step.id, subStep.id, 'description_TR', e.target.value, 'description', e.target.value)}
                                              placeholder="Açıklama (TR)"
                                              className="text-sm border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                                              rows={1}
                                            />
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Step Actions */}
                            <div className="flex flex-col gap-2 pt-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMoveStep(step.id, 'up')}
                                disabled={index === 0}
                                className="h-8 w-8 p-0"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMoveStep(step.id, 'down')}
                                disabled={index === (editingTemplate.steps?.length || 0) - 1}
                                className="h-8 w-8 p-0"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteStep(step.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {(!editingTemplate.steps || editingTemplate.steps.length === 0) && (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400">Henüz adım eklenmemiş</p>
                        <Button onClick={handleAddStep} size="sm" className="mt-4 gap-2">
                          <Plus className="w-4 h-4" />
                          İlk Adımı Ekle
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setViewDialogOpen(true);
              }}
            >
              <X className="w-4 h-4 mr-2" />
              İptal
            </Button>
            <Button onClick={handleSaveTemplate} disabled={saving} className="gap-2">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Kaydet
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Export default component
export default ApplicationTemplateManagement;
