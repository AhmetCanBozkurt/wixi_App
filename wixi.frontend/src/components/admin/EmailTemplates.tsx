import React, { useState, useEffect, useRef } from 'react';
import { Save, FileText, CheckCircle, Eye, Globe, Loader2, Plus } from 'lucide-react';
import { API_ROUTES } from '../../ApiServices/config/api.config';
import { TokenService } from '../../ApiServices/services/TokenService';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

interface EmailTemplate {
  id: number;
  key: string;
  // Multi-language display names
  displayName_TR: string;
  displayName_EN: string;
  displayName_DE: string;
  displayName_AR: string;
  // Multi-language subjects
  subject_TR: string;
  subject_EN: string;
  subject_DE: string;
  subject_AR: string;
  // Multi-language bodies
  bodyHtml_TR: string;
  bodyHtml_EN: string;
  bodyHtml_DE: string;
  bodyHtml_AR: string;
  // Legacy fields for backward compatibility
  subject?: string;
  bodyHtml?: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type Language = 'TR' | 'EN' | 'DE' | 'AR';

const EmailTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<Language>('TR');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{ subject: string; bodyHtml: string; language: Language } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [newTemplateKey, setNewTemplateKey] = useState('');
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Form state for each language
  const [formData, setFormData] = useState<{
    displayName_TR: string;
    displayName_EN: string;
    displayName_DE: string;
    displayName_AR: string;
    subject_TR: string;
    subject_EN: string;
    subject_DE: string;
    subject_AR: string;
    bodyHtml_TR: string;
    bodyHtml_EN: string;
    bodyHtml_DE: string;
    bodyHtml_AR: string;
    description: string;
    isActive: boolean;
  }>({
    displayName_TR: '',
    displayName_EN: '',
    displayName_DE: '',
    displayName_AR: '',
    subject_TR: '',
    subject_EN: '',
    subject_DE: '',
    subject_AR: '',
    bodyHtml_TR: '',
    bodyHtml_EN: '',
    bodyHtml_DE: '',
    bodyHtml_AR: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      // Get fallback display name if not set
      const fallbackDisplayName = getTemplateDisplayName(selectedTemplate.key);
      setFormData({
        displayName_TR: selectedTemplate.displayName_TR || fallbackDisplayName,
        displayName_EN: selectedTemplate.displayName_EN || '',
        displayName_DE: selectedTemplate.displayName_DE || '',
        displayName_AR: selectedTemplate.displayName_AR || '',
        subject_TR: selectedTemplate.subject_TR || selectedTemplate.subject || '',
        subject_EN: selectedTemplate.subject_EN || '',
        subject_DE: selectedTemplate.subject_DE || '',
        subject_AR: selectedTemplate.subject_AR || '',
        bodyHtml_TR: selectedTemplate.bodyHtml_TR || selectedTemplate.bodyHtml || '',
        bodyHtml_EN: selectedTemplate.bodyHtml_EN || '',
        bodyHtml_DE: selectedTemplate.bodyHtml_DE || '',
        bodyHtml_AR: selectedTemplate.bodyHtml_AR || '',
        description: selectedTemplate.description || '',
        isActive: selectedTemplate.isActive ?? true
      });
    }
  }, [selectedTemplate]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const tokenService = TokenService.getInstance();
      const token = await tokenService.getToken(true);
      
      if (!token) {
        toast.error('Token bulunamadı. Lütfen tekrar giriş yapın.');
        setLoading(false);
        return;
      }

      const response = await fetch(API_ROUTES.EMAIL_TEMPLATES.BASE, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        // Handle API response format { success: true, items: [...] }
        const data = result?.items || result || [];
        
        // Map backend response to frontend format
        const mappedData = Array.isArray(data) ? data.map((template: any) => {
          const fallbackDisplayName = getTemplateDisplayName(template.key || template.Key || '');
          return {
            ...template,
            displayName_TR: template.displayName_TR || template.DisplayName_TR || fallbackDisplayName,
            displayName_EN: template.displayName_EN || template.DisplayName_EN || '',
            displayName_DE: template.displayName_DE || template.DisplayName_DE || '',
            displayName_AR: template.displayName_AR || template.DisplayName_AR || '',
            subject_TR: template.subject_TR || template.Subject_TR || template.subject || '',
            subject_EN: template.subject_EN || template.Subject_EN || '',
            subject_DE: template.subject_DE || template.Subject_DE || '',
            subject_AR: template.subject_AR || template.Subject_AR || '',
            bodyHtml_TR: template.bodyHtml_TR || template.BodyHtml_TR || template.bodyHtml || '',
            bodyHtml_EN: template.bodyHtml_EN || template.BodyHtml_EN || '',
            bodyHtml_DE: template.bodyHtml_DE || template.BodyHtml_DE || '',
            bodyHtml_AR: template.bodyHtml_AR || template.BodyHtml_AR || '',
            // Legacy fields
            subject: template.subject_TR || template.Subject_TR || template.subject || '',
            bodyHtml: template.bodyHtml_TR || template.BodyHtml_TR || template.bodyHtml || ''
          };
        }) : [];
        
        setTemplates(mappedData);
      }
    } catch (error) {
      console.error('Template\'ler yüklenemedi:', error);
      toast.error('Template\'ler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = async (key: string) => {
    try {
      const tokenService = TokenService.getInstance();
      const token = await tokenService.getToken(true);
      
      if (!token) return;

      const response = await fetch(API_ROUTES.EMAIL_TEMPLATES.BY_KEY(key), {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        // Handle API response format { success: true, item: {...} }
        const data = result?.item || result;
        if (data) {
          const fallbackDisplayName = getTemplateDisplayName(data.key || data.Key || '');
          const mappedTemplate: EmailTemplate = {
            ...data,
            displayName_TR: data.displayName_TR || data.DisplayName_TR || fallbackDisplayName,
            displayName_EN: data.displayName_EN || data.DisplayName_EN || '',
            displayName_DE: data.displayName_DE || data.DisplayName_DE || '',
            displayName_AR: data.displayName_AR || data.DisplayName_AR || '',
            subject_TR: data.subject_TR || data.Subject_TR || data.subject || '',
            subject_EN: data.subject_EN || data.Subject_EN || '',
            subject_DE: data.subject_DE || data.Subject_DE || '',
            subject_AR: data.subject_AR || data.Subject_AR || '',
            bodyHtml_TR: data.bodyHtml_TR || data.BodyHtml_TR || data.bodyHtml || '',
            bodyHtml_EN: data.bodyHtml_EN || data.BodyHtml_EN || '',
            bodyHtml_DE: data.bodyHtml_DE || data.BodyHtml_DE || '',
            bodyHtml_AR: data.bodyHtml_AR || data.BodyHtml_AR || '',
            subject: data.subject_TR || data.Subject_TR || data.subject || '',
            bodyHtml: data.bodyHtml_TR || data.BodyHtml_TR || data.bodyHtml || ''
          };
          setSelectedTemplate(mappedTemplate);
          setActiveLanguage('TR'); // Reset to TR when loading new template
        }
      }
    } catch (error) {
      console.error('Template yüklenemedi:', error);
      toast.error('Template yüklenemedi');
    }
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

    setSaving(true);
    try {
      const tokenService = TokenService.getInstance();
      const token = await tokenService.getToken(true);
      
      if (!token) {
        toast.error('Token bulunamadı. Lütfen tekrar giriş yapın.');
        setSaving(false);
        return;
      }

      // Backend uses POST for upsert, expects EmailTemplateDto with all fields
      const emailTemplateDto = {
        id: selectedTemplate.id,
        key: selectedTemplate.key, // Include updated key
        displayName_TR: formData.displayName_TR,
        displayName_EN: formData.displayName_EN,
        displayName_DE: formData.displayName_DE,
        displayName_AR: formData.displayName_AR,
        subject_TR: formData.subject_TR,
        subject_EN: formData.subject_EN,
        subject_DE: formData.subject_DE,
        subject_AR: formData.subject_AR,
        bodyHtml_TR: formData.bodyHtml_TR,
        bodyHtml_EN: formData.bodyHtml_EN,
        bodyHtml_DE: formData.bodyHtml_DE,
        bodyHtml_AR: formData.bodyHtml_AR,
        description: formData.description,
        isActive: formData.isActive,
        updatedAt: new Date().toISOString()
      };

      const response = await fetch(API_ROUTES.EMAIL_TEMPLATES.BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(emailTemplateDto),
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Email template başarıyla kaydedildi!');
        await loadTemplates();
        // Reload template with updated key
        await loadTemplate(selectedTemplate.key);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || errorData.error || 'Template kaydedilemedi';
        toast.error(errorMessage);
        // If key conflict, reload templates to get updated list
        if (errorMessage.includes('already exists') || errorMessage.includes('key')) {
          await loadTemplates();
        }
      }
    } catch (error) {
      console.error('Template kaydedilemedi:', error);
      toast.error('Template kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const getTemplateDisplayName = (key: string, template?: EmailTemplate, language: Language = 'TR'): string => {
    // If template has display name, use it based on language
    if (template) {
      const displayName = template[`displayName_${language}` as keyof EmailTemplate] as string;
      if (displayName && displayName.trim()) {
        return displayName;
      }
      // Fallback to TR if current language doesn't have display name
      if (template.displayName_TR && template.displayName_TR.trim()) {
        return template.displayName_TR;
      }
    }
    
    // Fallback to hardcoded display names (for backward compatibility)
    const displayNames: Record<string, string> = {
      'ContactForm': '📝 Kontakt Formuları',
      'EmployerForm': '🏢 Arbeitgeber Formuları',
      'EmployeeForm': '👤 Arbeitnehmer Formuları',
      'ClientCode': '🎫 Müşteri Kodu',
      'WelcomeEmail': '👋 Hoş Geldin Emaili',
      'DocumentApproved': '✅ Belge Onaylandı',
      'DocumentRejected': '❌ Belge Reddedildi',
      'ApplicationStatusChanged': '📋 Başvuru Durumu Değişti',
      'PasswordReset': '🔑 Şifre Sıfırlama',
      'EmailVerification': '📧 Email Doğrulama'
    };
    return displayNames[key] || key;
  };

  const getLanguageLabel = (lang: Language) => {
    const labels: Record<Language, string> = {
      'TR': '🇹🇷 Türkçe',
      'EN': '🇬🇧 English',
      'DE': '🇩🇪 Deutsch',
      'AR': '🇸🇦 العربية'
    };
    return labels[lang];
  };

  const handlePreview = async (language: Language = activeLanguage) => {
    if (!selectedTemplate) return;

    setLoadingPreview(true);
    try {
      const subject = formData[`subject_${language}` as keyof typeof formData] as string;
      const bodyHtml = formData[`bodyHtml_${language}` as keyof typeof formData] as string;

      if (!subject || !bodyHtml) {
        toast.error('Ön izleme için subject ve body doldurulmalı');
        setLoadingPreview(false);
        return;
      }

      // Replace placeholders with sample data
      const sampleData = getSampleDataForTemplate(selectedTemplate.key);
      const previewSubject = replacePlaceholders(subject, sampleData);
      const previewBody = replacePlaceholders(bodyHtml, sampleData);
      
      setPreviewData({ subject: previewSubject, bodyHtml: previewBody, language });
      setPreviewOpen(true);
    } catch (error) {
      console.error('Preview oluşturulamadı:', error);
      toast.error('Ön izleme oluşturulamadı');
    } finally {
      setLoadingPreview(false);
    }
  };

  const getSampleDataForTemplate = (key: string): Record<string, string> => {
    const sampleData: Record<string, Record<string, string>> = {
      'ContactForm': {
        FirstName: 'Max',
        LastName: 'Mustermann',
        Email: 'max.mustermann@example.com',
        Phone: '+49 123 456789',
        Message: 'Ich interessiere mich für eine Stelle als Software-Entwickler.'
      },
      'EmployerForm': {
        CompanyName: 'TechCorp GmbH',
        ContactPerson: 'Maria Schmidt',
        Email: 'maria.schmidt@techcorp.de',
        Phone: '+49 30 123456',
        Industry: 'IT & Software',
        Positions: 'Software Developer, DevOps Engineer',
        Requirements: 'Bachelor in Informatik\n3+ Jahre Erfahrung\nGute Deutschkenntnisse'
      },
      'EmployeeForm': {
        Salutation: 'Herr',
        FullName: 'Ahmet Yılmaz',
        Email: 'ahmet.yilmaz@example.com',
        Phone: '+49 176 1234567',
        Profession: 'Software Developer',
        Experience: '5',
        Education: 'Bachelor',
        GermanLevel: 'B2'
      },
      'ClientCode': {
        FullName: 'Max Mustermann',
        ClientCode: 'CL-20250115-12345',
        ExpirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric'
        }),
        RegisterUrl: 'https://worklines.de/register?code=CL-20250115-12345'
      },
      'WelcomeEmail': {
        FirstName: 'Max',
        LastName: 'Mustermann',
        Email: 'max.mustermann@example.com',
        LoginUrl: 'https://worklines.de/login'
      },
      'DocumentApproved': {
        FullName: 'Max Mustermann',
        DocumentType: 'Pasaport',
        DocumentName: 'Passport.pdf',
        ApprovalDate: new Date().toLocaleDateString('de-DE')
      },
      'DocumentRejected': {
        FullName: 'Max Mustermann',
        DocumentType: 'Pasaport',
        DocumentName: 'Passport.pdf',
        RejectionReason: 'Belge net değil, lütfen yeniden yükleyin.'
      },
      'ApplicationStatusChanged': {
        FullName: 'Max Mustermann',
        ApplicationId: 'APP-20250115-001',
        OldStatus: 'Beklemede',
        NewStatus: 'Onaylandı',
        StatusDate: new Date().toLocaleDateString('de-DE')
      },
      'PasswordReset': {
        FirstName: 'Max',
        ResetUrl: 'https://worklines.de/reset-password?token=abc123',
        ExpirationMinutes: '60'
      },
      'EmailVerification': {
        FirstName: 'Max',
        VerificationUrl: 'https://worklines.de/verify-email?token=xyz789',
        ExpirationHours: '24'
      }
    };
    return sampleData[key] || {};
  };

  const replacePlaceholders = (template: string, data: Record<string, string>): string => {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), value || '');
    }
    return result;
  };

  const getPlaceholders = (key: string): string[] => {
    const sampleData = getSampleDataForTemplate(key);
    return Object.keys(sampleData);
  };

  const handleCreateNewTemplate = async () => {
    if (!newTemplateKey.trim()) {
      toast.error('Lütfen template key girin');
      return;
    }

    // Validate key format (alphanumeric and PascalCase)
    const keyPattern = /^[A-Z][a-zA-Z0-9]*$/;
    if (!keyPattern.test(newTemplateKey)) {
      toast.error('Template key sadece harf ve rakam içermeli, PascalCase formatında olmalıdır (örn: WelcomeEmail)');
      return;
    }

    // Check if key already exists
    if (templates.some(t => t.key.toLowerCase() === newTemplateKey.toLowerCase())) {
      toast.error('Bu template key zaten kullanılıyor');
      return;
    }

    setCreatingTemplate(true);
    try {
      const tokenService = TokenService.getInstance();
      const token = await tokenService.getToken(true);
      
      if (!token) {
        toast.error('Token bulunamadı. Lütfen tekrar giriş yapın.');
        setCreatingTemplate(false);
        return;
      }

      // Create new template with empty content for all languages
      // Generate default display name from key
      const defaultDisplayName = newTemplateKey
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();

      const newTemplateDto = {
        id: 0, // New template
        key: newTemplateKey,
        displayName_TR: defaultDisplayName,
        displayName_EN: defaultDisplayName,
        displayName_DE: defaultDisplayName,
        displayName_AR: defaultDisplayName,
        subject_TR: '',
        subject_EN: '',
        subject_DE: '',
        subject_AR: '',
        bodyHtml_TR: '',
        bodyHtml_EN: '',
        bodyHtml_DE: '',
        bodyHtml_AR: '',
        description: `Email template for ${newTemplateKey}`,
        isActive: false, // Start as inactive
        updatedAt: new Date().toISOString()
      };

      const response = await fetch(API_ROUTES.EMAIL_TEMPLATES.BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTemplateDto),
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Yeni template başarıyla oluşturuldu!');
        setShowNewTemplateModal(false);
        setNewTemplateKey('');
        await loadTemplates();
        // Load the newly created template
        await loadTemplate(newTemplateKey);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Template oluşturulamadı');
      }
    } catch (error) {
      console.error('Template oluşturulamadı:', error);
      toast.error('Template oluşturulamadı');
    } finally {
      setCreatingTemplate(false);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Email Template'leri</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Email template'lerini çoklu dil desteğiyle yönetin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Template List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Template'ler</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowNewTemplateModal(true)}
                  className="h-8 px-3"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Yeni
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => loadTemplate(template.key)}
                    className={`w-full text-left p-3 rounded-md transition-colors duration-300 border-2 ${
                      selectedTemplate?.key === template.key
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400'
                        : 'bg-gray-50 dark:bg-gray-800 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {getTemplateDisplayName(template.key, template, 'TR')}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                      {template.isActive ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Aktif
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                          Pasif
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template Editor */}
        <div className="lg:col-span-3">
          {selectedTemplate ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="mb-4">
                      <Label htmlFor="templateKey" className="mb-2">Template Key *</Label>
                      <Input
                        id="templateKey"
                        value={selectedTemplate.key}
                        onChange={(e) => {
                          const newKey = e.target.value.trim();
                          if (newKey && newKey !== selectedTemplate.key) {
                            setSelectedTemplate({ ...selectedTemplate, key: newKey });
                          }
                        }}
                        placeholder="Örn: WelcomeEmail, ClientCode"
                        className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 font-mono"
                        disabled={saving}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Template key'i programatik erişim için kullanılır. PascalCase formatında olmalıdır.
                      </p>
                    </div>
                    <div className="mb-2">
                      <Label htmlFor="description" className="mb-2">Açıklama</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Template açıklaması..."
                        className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Label htmlFor="isActive" className="text-sm">Aktif</Label>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Display Name Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Template Görünen Adı</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="displayName_TR">Görünen Ad (TR) *</Label>
                      <Input
                        id="displayName_TR"
                        value={formData.displayName_TR}
                        onChange={(e) => setFormData({ ...formData, displayName_TR: e.target.value })}
                        placeholder="Örn: Müşteri Kodu, Kontakt Formuları"
                        className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="displayName_EN">Display Name (EN)</Label>
                      <Input
                        id="displayName_EN"
                        value={formData.displayName_EN}
                        onChange={(e) => setFormData({ ...formData, displayName_EN: e.target.value })}
                        placeholder="e.g. Client Code, Contact Forms"
                        className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="displayName_DE">Anzeigename (DE)</Label>
                      <Input
                        id="displayName_DE"
                        value={formData.displayName_DE}
                        onChange={(e) => setFormData({ ...formData, displayName_DE: e.target.value })}
                        placeholder="z.B. Kundencode, Kontaktformulare"
                        className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="displayName_AR">اسم العرض (AR)</Label>
                      <Input
                        id="displayName_AR"
                        value={formData.displayName_AR}
                        onChange={(e) => setFormData({ ...formData, displayName_AR: e.target.value })}
                        placeholder="مثل: رمز العميل، نماذج الاتصال"
                        className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                        dir="rtl"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Template listesinde görünecek isimler. Türkçe zorunludur, diğer diller opsiyoneldir.
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Email İçeriği</h3>
                </div>

                {/* Language Tabs */}
                <Tabs value={activeLanguage} onValueChange={(value) => setActiveLanguage(value as Language)}>
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="TR">🇹🇷 TR</TabsTrigger>
                    <TabsTrigger value="EN">🇬🇧 EN</TabsTrigger>
                    <TabsTrigger value="DE">🇩🇪 DE</TabsTrigger>
                    <TabsTrigger value="AR">🇸🇦 AR</TabsTrigger>
                  </TabsList>

                  {/* Turkish Tab */}
                  <TabsContent value="TR" className="space-y-4">
                    <div>
                      <Label htmlFor="subject_TR">Email Konusu (TR) *</Label>
                      <Input
                        id="subject_TR"
                        value={formData.subject_TR}
                        onChange={(e) => setFormData({ ...formData, subject_TR: e.target.value })}
                        placeholder="Örn: Yeni Kontakt Talebi - {{FirstName}}"
                        className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Placeholder'lar: {getPlaceholders(selectedTemplate.key).map(p => `{{${p}}}`).join(', ')}
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="bodyHtml_TR">HTML İçerik (TR) *</Label>
                      <Textarea
                        id="bodyHtml_TR"
                        value={formData.bodyHtml_TR}
                        onChange={(e) => setFormData({ ...formData, bodyHtml_TR: e.target.value })}
                        rows={15}
                        className="mt-1 font-mono text-sm border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                        placeholder="HTML template içeriği..."
                      />
                    </div>
                  </TabsContent>

                  {/* English Tab */}
                  <TabsContent value="EN" className="space-y-4">
                    <div>
                      <Label htmlFor="subject_EN">Email Subject (EN) *</Label>
                      <Input
                        id="subject_EN"
                        value={formData.subject_EN}
                        onChange={(e) => setFormData({ ...formData, subject_EN: e.target.value })}
                        placeholder="e.g. New Contact Request - {{FirstName}}"
                        className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Placeholders: {getPlaceholders(selectedTemplate.key).map(p => `{{${p}}}`).join(', ')}
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="bodyHtml_EN">HTML Content (EN) *</Label>
                      <Textarea
                        id="bodyHtml_EN"
                        value={formData.bodyHtml_EN}
                        onChange={(e) => setFormData({ ...formData, bodyHtml_EN: e.target.value })}
                        rows={15}
                        className="mt-1 font-mono text-sm border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                        placeholder="HTML template content..."
                      />
                    </div>
                  </TabsContent>

                  {/* German Tab */}
                  <TabsContent value="DE" className="space-y-4">
                    <div>
                      <Label htmlFor="subject_DE">Email Betreff (DE) *</Label>
                      <Input
                        id="subject_DE"
                        value={formData.subject_DE}
                        onChange={(e) => setFormData({ ...formData, subject_DE: e.target.value })}
                        placeholder="z.B. Neue Kontaktanfrage - {{FirstName}}"
                        className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Platzhalter: {getPlaceholders(selectedTemplate.key).map(p => `{{${p}}}`).join(', ')}
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="bodyHtml_DE">HTML Inhalt (DE) *</Label>
                      <Textarea
                        id="bodyHtml_DE"
                        value={formData.bodyHtml_DE}
                        onChange={(e) => setFormData({ ...formData, bodyHtml_DE: e.target.value })}
                        rows={15}
                        className="mt-1 font-mono text-sm border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                        placeholder="HTML Template-Inhalt..."
                      />
                    </div>
                  </TabsContent>

                  {/* Arabic Tab */}
                  <TabsContent value="AR" className="space-y-4">
                    <div>
                      <Label htmlFor="subject_AR">موضوع البريد الإلكتروني (AR) *</Label>
                      <Input
                        id="subject_AR"
                        value={formData.subject_AR}
                        onChange={(e) => setFormData({ ...formData, subject_AR: e.target.value })}
                        placeholder="مثل: طلب اتصال جديد - {{FirstName}}"
                        className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                        dir="rtl"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1" dir="ltr">
                        Placeholders: {getPlaceholders(selectedTemplate.key).map(p => `{{${p}}}`).join(', ')}
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="bodyHtml_AR">محتوى HTML (AR) *</Label>
                      <Textarea
                        id="bodyHtml_AR"
                        value={formData.bodyHtml_AR}
                        onChange={(e) => setFormData({ ...formData, bodyHtml_AR: e.target.value })}
                        rows={15}
                        className="mt-1 font-mono text-sm border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                        placeholder="محتوى قالب HTML..."
                        dir="rtl"
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => handlePreview(activeLanguage)}
                    disabled={loadingPreview}
                  >
                    {loadingPreview ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Yükleniyor...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Ön İzleme ({activeLanguage})
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Kaydet
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Bir template seçin</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Preview Dialog - Full Screen Size */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="!max-w-[98vw] !max-h-[98vh] !w-[98vw] !h-[98vh] overflow-hidden !flex !flex-col p-0 gap-0 !grid-cols-1">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Email Ön İzleme - {previewData?.language && getLanguageLabel(previewData.language as Language)}</DialogTitle>
                <DialogDescription>
                  Template'in nasıl görüneceğinin ön izlemesi (örnek verilerle)
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={previewData?.language === 'TR' ? 'default' : 'outline'}
                  onClick={() => handlePreview('TR')}
                  disabled={loadingPreview}
                >
                  🇹🇷 TR
                </Button>
                <Button
                  size="sm"
                  variant={previewData?.language === 'EN' ? 'default' : 'outline'}
                  onClick={() => handlePreview('EN')}
                  disabled={loadingPreview}
                >
                  🇬🇧 EN
                </Button>
                <Button
                  size="sm"
                  variant={previewData?.language === 'DE' ? 'default' : 'outline'}
                  onClick={() => handlePreview('DE')}
                  disabled={loadingPreview}
                >
                  🇩🇪 DE
                </Button>
                <Button
                  size="sm"
                  variant={previewData?.language === 'AR' ? 'default' : 'outline'}
                  onClick={() => handlePreview('AR')}
                  disabled={loadingPreview}
                >
                  🇸🇦 AR
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          {previewData && (
            <div className="flex flex-col flex-1 overflow-hidden p-6 gap-4 min-h-0">
              <div className="flex-shrink-0">
                <Label>Konu:</Label>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 mt-2">
                  <p className="text-gray-900 dark:text-gray-100">{previewData.subject}</p>
                </div>
              </div>
              
              <div className="flex-1 min-h-0 overflow-hidden">
                <Label>İçerik:</Label>
                <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden mt-2 h-full">
                  <iframe
                    srcDoc={previewData.bodyHtml}
                    className="w-full h-full border-0"
                    title="Email Preview"
                    sandbox="allow-same-origin allow-scripts"
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end px-6 pb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={() => setPreviewOpen(false)} variant="outline">
              Kapat
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Template Modal */}
      <Dialog open={showNewTemplateModal} onOpenChange={setShowNewTemplateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Email Template Ekle</DialogTitle>
            <DialogDescription>
              Yeni bir email template oluşturmak için template key'i girin. Key benzersiz olmalıdır.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="newTemplateKey">Template Key *</Label>
              <Input
                id="newTemplateKey"
                value={newTemplateKey}
                onChange={(e) => setNewTemplateKey(e.target.value.trim())}
                placeholder="Örn: WelcomeEmail, PasswordReset, DocumentApproved"
                className="mt-1 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                disabled={creatingTemplate}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Template key'i programatik erişim için kullanılır. Sadece harf, rakam ve büyük harf kullanın.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 w-full">Örnek Template Key'ler:</p>
              {['WelcomeEmail', 'PasswordReset', 'EmailVerification', 'DocumentApproved', 'DocumentRejected', 'ApplicationStatusChanged'].map((key) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => setNewTemplateKey(key)}
                  disabled={creatingTemplate}
                  className="text-xs"
                >
                  {key}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => {
                setShowNewTemplateModal(false);
                setNewTemplateKey('');
              }}
              disabled={creatingTemplate}
            >
              İptal
            </Button>
            <Button
              onClick={handleCreateNewTemplate}
              disabled={creatingTemplate || !newTemplateKey.trim()}
            >
              {creatingTemplate ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Oluştur
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailTemplates;
