import React, { useState, useEffect } from 'react';
import { CreditCard, Save, Loader2, Info, CheckCircle2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import equivalencyFeeSettingsService, { type EquivalencyFeeSettingsDto } from '../../ApiServices/services/EquivalencyFeeSettingsService';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';

const EquivalencyFeeSettingsManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'tr' | 'de' | 'en' | 'ar'>('tr');

  const [formData, setFormData] = useState<EquivalencyFeeSettingsDto>({
    amount: 200,
    currency: 'EUR',
    whyPayTitleTr: '',
    whyPayTitleDe: '',
    whyPayTitleEn: '',
    whyPayTitleAr: '',
    whyPayDescriptionTr: '',
    whyPayDescriptionDe: '',
    whyPayDescriptionEn: '',
    whyPayDescriptionAr: '',
    whyProcessTitleTr: '',
    whyProcessTitleDe: '',
    whyProcessTitleEn: '',
    whyProcessTitleAr: '',
    whyProcessItemsTr: [],
    whyProcessItemsDe: [],
    whyProcessItemsEn: [],
    whyProcessItemsAr: [],
    feeScopeTitleTr: '',
    feeScopeTitleDe: '',
    feeScopeTitleEn: '',
    feeScopeTitleAr: '',
    feeScopeItemsTr: [],
    feeScopeItemsDe: [],
    feeScopeItemsEn: [],
    feeScopeItemsAr: [],
    noteTr: '',
    noteDe: '',
    noteEn: '',
    noteAr: '',
    paymentSummaryTitleTr: '',
    paymentSummaryTitleDe: '',
    paymentSummaryTitleEn: '',
    paymentSummaryTitleAr: '',
    paymentSummaryDescriptionTr: '',
    paymentSummaryDescriptionDe: '',
    paymentSummaryDescriptionEn: '',
    paymentSummaryDescriptionAr: '',
    feeItemDescriptionTr: '',
    feeItemDescriptionDe: '',
    feeItemDescriptionEn: '',
    feeItemDescriptionAr: '',
    isActive: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await equivalencyFeeSettingsService.getSettings();
      setFormData(data);
    } catch (error: any) {
      console.error('Error loading settings:', error);
      toast.error(error.message || 'Ayarlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await equivalencyFeeSettingsService.updateSettings(formData);
      toast.success('Denklik ücreti ayarları başarıyla kaydedildi');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Ayarlar kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const addListItem = (field: keyof EquivalencyFeeSettingsDto, language: 'tr' | 'de' | 'en' | 'ar' = 'tr') => {
    const fieldKey = language === 'tr' ? field : `${field}${language.charAt(0).toUpperCase() + language.slice(1)}` as keyof EquivalencyFeeSettingsDto;
    const currentValue = formData[fieldKey] as string[] || [];
    setFormData(prev => ({
      ...prev,
      [fieldKey]: [...currentValue, '']
    }));
  };

  const updateListItem = (field: keyof EquivalencyFeeSettingsDto, index: number, value: string, language: 'tr' | 'de' | 'en' | 'ar' = 'tr') => {
    const fieldKey = language === 'tr' ? field : `${field}${language.charAt(0).toUpperCase() + language.slice(1)}` as keyof EquivalencyFeeSettingsDto;
    const currentValue = formData[fieldKey] as string[] || [];
    const updated = [...currentValue];
    updated[index] = value;
    setFormData(prev => ({
      ...prev,
      [fieldKey]: updated
    }));
  };

  const removeListItem = (field: keyof EquivalencyFeeSettingsDto, index: number, language: 'tr' | 'de' | 'en' | 'ar' = 'tr') => {
    const fieldKey = language === 'tr' ? field : `${field}${language.charAt(0).toUpperCase() + language.slice(1)}` as keyof EquivalencyFeeSettingsDto;
    const currentValue = formData[fieldKey] as string[] || [];
    const updated = currentValue.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      [fieldKey]: updated
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Denklik Ücreti Ayarları
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Denklik ücreti ve açıklamalarını yönetin
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>

      {/* Language Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setActiveTab('tr')}
          className={`px-4 py-2 font-medium border-b-2 transition-all rounded-t-md ${
            activeTab === 'tr'
              ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-950/50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
        >
          🇹🇷 Türkçe
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('de')}
          className={`px-4 py-2 font-medium border-b-2 transition-all rounded-t-md ${
            activeTab === 'de'
              ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-950/50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
        >
          🇩🇪 Deutsch
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('en')}
          className={`px-4 py-2 font-medium border-b-2 transition-all rounded-t-md ${
            activeTab === 'en'
              ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-950/50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
        >
          🇬🇧 English
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ar')}
          className={`px-4 py-2 font-medium border-b-2 transition-all rounded-t-md ${
            activeTab === 'ar'
              ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-950/50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
        >
          🇸🇦 العربية
        </button>
      </div>

      {/* Fee Amount */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Ücret Bilgileri
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Ücret Tutarı</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          <div>
            <Label>Para Birimi</Label>
            <Input
              value={formData.currency}
              onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
              placeholder="EUR"
            />
          </div>
        </div>
      </Card>

      {/* Why Pay Fee Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Denklik Ücreti Neden Ödenir?
        </h3>
        {activeTab === 'tr' && (
          <div className="space-y-4">
            <div>
              <Label>Başlık (Türkçe)</Label>
              <Input
                value={formData.whyPayTitleTr}
                onChange={(e) => setFormData(prev => ({ ...prev, whyPayTitleTr: e.target.value }))}
                placeholder="Denklik Ücreti Neden Ödenir?"
              />
            </div>
            <div>
              <Label>Açıklama (Türkçe)</Label>
              <Textarea
                value={formData.whyPayDescriptionTr}
                onChange={(e) => setFormData(prev => ({ ...prev, whyPayDescriptionTr: e.target.value }))}
                rows={3}
                placeholder="Denklik ücreti, yurtdışında alınan eğitim belgelerinizin..."
              />
            </div>
          </div>
        )}
        {activeTab === 'de' && (
          <div className="space-y-4">
            <div>
              <Label>Titel (Deutsch)</Label>
              <Input
                value={formData.whyPayTitleDe || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, whyPayTitleDe: e.target.value }))}
              />
            </div>
            <div>
              <Label>Beschreibung (Deutsch)</Label>
              <Textarea
                value={formData.whyPayDescriptionDe || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, whyPayDescriptionDe: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
        )}
        {activeTab === 'en' && (
          <div className="space-y-4">
            <div>
              <Label>Title (English)</Label>
              <Input
                value={formData.whyPayTitleEn || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, whyPayTitleEn: e.target.value }))}
              />
            </div>
            <div>
              <Label>Description (English)</Label>
              <Textarea
                value={formData.whyPayDescriptionEn || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, whyPayDescriptionEn: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
        )}
        {activeTab === 'ar' && (
          <div className="space-y-4" dir="rtl">
            <div>
              <Label>العنوان (عربي)</Label>
              <Input
                value={formData.whyPayTitleAr || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, whyPayTitleAr: e.target.value }))}
                className="text-right"
              />
            </div>
            <div>
              <Label>الوصف (عربي)</Label>
              <Textarea
                value={formData.whyPayDescriptionAr || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, whyPayDescriptionAr: e.target.value }))}
                rows={3}
                className="text-right"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Why Process Necessary Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Denklik İşlemi Neden Gereklidir?
        </h3>
        {activeTab === 'tr' && (
          <div className="space-y-4">
            <div>
              <Label>Başlık (Türkçe)</Label>
              <Input
                value={formData.whyProcessTitleTr}
                onChange={(e) => setFormData(prev => ({ ...prev, whyProcessTitleTr: e.target.value }))}
                placeholder="Denklik İşlemi Neden Gereklidir?"
              />
            </div>
            <div>
              <Label>Maddeler (Türkçe)</Label>
              {(formData.whyProcessItemsTr || []).map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={item}
                    onChange={(e) => updateListItem('whyProcessItemsTr', index, e.target.value, 'tr')}
                    placeholder={`Madde ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeListItem('whyProcessItemsTr', index, 'tr')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addListItem('whyProcessItemsTr', 'tr')}
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Madde Ekle
              </Button>
            </div>
          </div>
        )}
        {activeTab === 'de' && (
          <div className="space-y-4">
            <div>
              <Label>Titel (Deutsch)</Label>
              <Input
                value={formData.whyProcessTitleDe || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, whyProcessTitleDe: e.target.value }))}
              />
            </div>
            <div>
              <Label>Punkte (Deutsch)</Label>
              {(formData.whyProcessItemsDe || []).map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={item}
                    onChange={(e) => updateListItem('whyProcessItemsDe', index, e.target.value, 'de')}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeListItem('whyProcessItemsDe', index, 'de')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addListItem('whyProcessItemsDe', 'de')}
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Punkt Hinzufügen
              </Button>
            </div>
          </div>
        )}
        {activeTab === 'en' && (
          <div className="space-y-4">
            <div>
              <Label>Title (English)</Label>
              <Input
                value={formData.whyProcessTitleEn || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, whyProcessTitleEn: e.target.value }))}
              />
            </div>
            <div>
              <Label>Items (English)</Label>
              {(formData.whyProcessItemsEn || []).map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={item}
                    onChange={(e) => updateListItem('whyProcessItemsEn', index, e.target.value, 'en')}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeListItem('whyProcessItemsEn', index, 'en')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addListItem('whyProcessItemsEn', 'en')}
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        )}
        {activeTab === 'ar' && (
          <div className="space-y-4" dir="rtl">
            <div>
              <Label>العنوان (عربي)</Label>
              <Input
                value={formData.whyProcessTitleAr || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, whyProcessTitleAr: e.target.value }))}
                className="text-right"
              />
            </div>
            <div>
              <Label>العناصر (عربي)</Label>
              {(formData.whyProcessItemsAr || []).map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={item}
                    onChange={(e) => updateListItem('whyProcessItemsAr', index, e.target.value, 'ar')}
                    className="text-right"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeListItem('whyProcessItemsAr', index, 'ar')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addListItem('whyProcessItemsAr', 'ar')}
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                إضافة عنصر
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Fee Scope Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Denklik Ücreti Kapsamı
        </h3>
        {activeTab === 'tr' && (
          <div className="space-y-4">
            <div>
              <Label>Başlık (Türkçe)</Label>
              <Input
                value={formData.feeScopeTitleTr}
                onChange={(e) => setFormData(prev => ({ ...prev, feeScopeTitleTr: e.target.value }))}
                placeholder="Denklik Ücreti Kapsamı"
              />
            </div>
            <div>
              <Label>Maddeler (Türkçe)</Label>
              {(formData.feeScopeItemsTr || []).map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={item}
                    onChange={(e) => updateListItem('feeScopeItemsTr', index, e.target.value, 'tr')}
                    placeholder={`Madde ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeListItem('feeScopeItemsTr', index, 'tr')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addListItem('feeScopeItemsTr', 'tr')}
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Madde Ekle
              </Button>
            </div>
          </div>
        )}
        {activeTab === 'de' && (
          <div className="space-y-4">
            <div>
              <Label>Titel (Deutsch)</Label>
              <Input
                value={formData.feeScopeTitleDe || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, feeScopeTitleDe: e.target.value }))}
              />
            </div>
            <div>
              <Label>Punkte (Deutsch)</Label>
              {(formData.feeScopeItemsDe || []).map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={item}
                    onChange={(e) => updateListItem('feeScopeItemsDe', index, e.target.value, 'de')}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeListItem('feeScopeItemsDe', index, 'de')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addListItem('feeScopeItemsDe', 'de')}
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Punkt Hinzufügen
              </Button>
            </div>
          </div>
        )}
        {activeTab === 'en' && (
          <div className="space-y-4">
            <div>
              <Label>Title (English)</Label>
              <Input
                value={formData.feeScopeTitleEn || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, feeScopeTitleEn: e.target.value }))}
              />
            </div>
            <div>
              <Label>Items (English)</Label>
              {(formData.feeScopeItemsEn || []).map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={item}
                    onChange={(e) => updateListItem('feeScopeItemsEn', index, e.target.value, 'en')}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeListItem('feeScopeItemsEn', index, 'en')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addListItem('feeScopeItemsEn', 'en')}
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        )}
        {activeTab === 'ar' && (
          <div className="space-y-4" dir="rtl">
            <div>
              <Label>العنوان (عربي)</Label>
              <Input
                value={formData.feeScopeTitleAr || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, feeScopeTitleAr: e.target.value }))}
                className="text-right"
              />
            </div>
            <div>
              <Label>العناصر (عربي)</Label>
              {(formData.feeScopeItemsAr || []).map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={item}
                    onChange={(e) => updateListItem('feeScopeItemsAr', index, e.target.value, 'ar')}
                    className="text-right"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeListItem('feeScopeItemsAr', index, 'ar')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addListItem('feeScopeItemsAr', 'ar')}
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                إضافة عنصر
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Payment Summary Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Ödeme Özeti
        </h3>
        {activeTab === 'tr' && (
          <div className="space-y-4">
            <div>
              <Label>Başlık (Türkçe)</Label>
              <Input
                value={formData.paymentSummaryTitleTr}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentSummaryTitleTr: e.target.value }))}
                placeholder="Denklik Ücreti Ödemesi"
              />
            </div>
            <div>
              <Label>Açıklama (Türkçe)</Label>
              <Input
                value={formData.paymentSummaryDescriptionTr}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentSummaryDescriptionTr: e.target.value }))}
                placeholder="Eğitim Denkliği İşlem Ücreti"
              />
            </div>
            <div>
              <Label>Ücret Açıklaması (Türkçe)</Label>
              <Input
                value={formData.feeItemDescriptionTr}
                onChange={(e) => setFormData(prev => ({ ...prev, feeItemDescriptionTr: e.target.value }))}
                placeholder="Yurtdışı eğitim belgelerinizin denklik işlemi için ücret"
              />
            </div>
          </div>
        )}
        {activeTab === 'de' && (
          <div className="space-y-4">
            <div>
              <Label>Titel (Deutsch)</Label>
              <Input
                value={formData.paymentSummaryTitleDe || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentSummaryTitleDe: e.target.value }))}
              />
            </div>
            <div>
              <Label>Beschreibung (Deutsch)</Label>
              <Input
                value={formData.paymentSummaryDescriptionDe || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentSummaryDescriptionDe: e.target.value }))}
              />
            </div>
            <div>
              <Label>Gebührenbeschreibung (Deutsch)</Label>
              <Input
                value={formData.feeItemDescriptionDe || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, feeItemDescriptionDe: e.target.value }))}
              />
            </div>
          </div>
        )}
        {activeTab === 'en' && (
          <div className="space-y-4">
            <div>
              <Label>Title (English)</Label>
              <Input
                value={formData.paymentSummaryTitleEn || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentSummaryTitleEn: e.target.value }))}
              />
            </div>
            <div>
              <Label>Description (English)</Label>
              <Input
                value={formData.paymentSummaryDescriptionEn || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentSummaryDescriptionEn: e.target.value }))}
              />
            </div>
            <div>
              <Label>Fee Description (English)</Label>
              <Input
                value={formData.feeItemDescriptionEn || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, feeItemDescriptionEn: e.target.value }))}
              />
            </div>
          </div>
        )}
        {activeTab === 'ar' && (
          <div className="space-y-4" dir="rtl">
            <div>
              <Label>العنوان (عربي)</Label>
              <Input
                value={formData.paymentSummaryTitleAr || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentSummaryTitleAr: e.target.value }))}
                className="text-right"
              />
            </div>
            <div>
              <Label>الوصف (عربي)</Label>
              <Input
                value={formData.paymentSummaryDescriptionAr || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentSummaryDescriptionAr: e.target.value }))}
                className="text-right"
              />
            </div>
            <div>
              <Label>وصف الرسوم (عربي)</Label>
              <Input
                value={formData.feeItemDescriptionAr || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, feeItemDescriptionAr: e.target.value }))}
                className="text-right"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Note Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Not / Ek Bilgi</h3>
        {activeTab === 'tr' && (
          <Textarea
            value={formData.noteTr || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, noteTr: e.target.value }))}
            rows={3}
            placeholder="Not metni..."
          />
        )}
        {activeTab === 'de' && (
          <Textarea
            value={formData.noteDe || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, noteDe: e.target.value }))}
            rows={3}
          />
        )}
        {activeTab === 'en' && (
          <Textarea
            value={formData.noteEn || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, noteEn: e.target.value }))}
            rows={3}
          />
        )}
        {activeTab === 'ar' && (
          <Textarea
            value={formData.noteAr || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, noteAr: e.target.value }))}
            rows={3}
            className="text-right"
            dir="rtl"
          />
        )}
      </Card>

      {/* Active Status */}
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="w-5 h-5 rounded"
          />
          <Label htmlFor="isActive" className="cursor-pointer">
            Aktif (Public sayfada görünsün)
          </Label>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg" className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
        </Button>
      </div>
    </div>
  );
};

export default EquivalencyFeeSettingsManagement;

