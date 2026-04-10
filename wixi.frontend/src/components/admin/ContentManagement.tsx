import React, { useState, useEffect } from 'react';
import { FaSave, FaPalette } from 'react-icons/fa';
import { useToast } from '../../hooks/use-toast';
import ContentSettingsService, { type ContentSettings } from '../../ApiServices/services/ContentSettingsService';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';

const ContentManagement: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contentSettings, setContentSettings] = useState<ContentSettings>({
    footerCompanyDescDe: '',
    footerCompanyDescTr: '',
    footerCompanyDescEn: '',
    footerCompanyDescAr: '',
    facebookUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    linkedInUrl: '',
    aboutMissionText1De: '',
    aboutMissionText1Tr: '',
    aboutMissionText1En: '',
    aboutMissionText1Ar: '',
    aboutMissionText2De: '',
    aboutMissionText2Tr: '',
    aboutMissionText2En: '',
    aboutMissionText2Ar: '',
    contactPhone: '',
    contactEmail: '',
    addressGermany: '',
    addressTurkeyMersin: '',
    addressTurkeyIstanbul: ''
  });

  useEffect(() => {
    loadContentSettings();
  }, []);

  const loadContentSettings = async () => {
    try {
      setLoading(true);
      const res = await ContentSettingsService.getSettings();
      if (res.success && res.settings) {
        setContentSettings(res.settings);
      }
    } catch (error) {
      console.error('Error loading content settings:', error);
      toast({
        title: 'Hata',
        description: 'İçerik ayarları yüklenirken bir hata oluştu.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await ContentSettingsService.updateSettings({
        footerCompanyDescDe: contentSettings.footerCompanyDescDe,
        footerCompanyDescTr: contentSettings.footerCompanyDescTr,
        footerCompanyDescEn: contentSettings.footerCompanyDescEn,
        footerCompanyDescAr: contentSettings.footerCompanyDescAr,
        facebookUrl: contentSettings.facebookUrl,
        instagramUrl: contentSettings.instagramUrl,
        twitterUrl: contentSettings.twitterUrl,
        linkedInUrl: contentSettings.linkedInUrl,
        aboutMissionText1De: contentSettings.aboutMissionText1De,
        aboutMissionText1Tr: contentSettings.aboutMissionText1Tr,
        aboutMissionText1En: contentSettings.aboutMissionText1En,
        aboutMissionText1Ar: contentSettings.aboutMissionText1Ar,
        aboutMissionText2De: contentSettings.aboutMissionText2De,
        aboutMissionText2Tr: contentSettings.aboutMissionText2Tr,
        aboutMissionText2En: contentSettings.aboutMissionText2En,
        aboutMissionText2Ar: contentSettings.aboutMissionText2Ar,
        contactPhone: contentSettings.contactPhone,
        contactEmail: contentSettings.contactEmail,
        addressGermany: contentSettings.addressGermany,
        addressTurkeyMersin: contentSettings.addressTurkeyMersin,
        addressTurkeyIstanbul: contentSettings.addressTurkeyIstanbul
      });
      if (res.success) {
        toast({
          title: 'Başarılı',
          description: 'İçerik ayarları başarıyla kaydedildi!',
        });
      } else {
        toast({
          title: 'Hata',
          description: res.error || 'İçerik ayarları kaydedilirken bir hata oluştu.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error saving content settings:', error);
      toast({
        title: 'Hata',
        description: 'İçerik ayarları kaydedilirken bir hata oluştu.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            İçerik Yönetimi
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Site içeriği ve ayarlarını yönetin
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          <FaSave className="w-4 h-4" />
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Footer Company Description */}
        <Card>
          <CardHeader>
            <CardTitle>Footer - Şirket Açıklaması</CardTitle>
            <CardDescription>Footer'da görünecek şirket açıklaması</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="footerDe">Almanca (De)</Label>
              <Textarea
                id="footerDe"
                value={contentSettings.footerCompanyDescDe}
                onChange={(e) => setContentSettings(prev => ({ ...prev, footerCompanyDescDe: e.target.value }))}
                rows={3}
                className="mt-2 border-black dark:border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="footerTr">Türkçe (Tr)</Label>
              <Textarea
                id="footerTr"
                value={contentSettings.footerCompanyDescTr}
                onChange={(e) => setContentSettings(prev => ({ ...prev, footerCompanyDescTr: e.target.value }))}
                rows={3}
                className="mt-2 border-black dark:border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="footerEn">İngilizce (En)</Label>
              <Textarea
                id="footerEn"
                value={contentSettings.footerCompanyDescEn || ''}
                onChange={(e) => setContentSettings(prev => ({ ...prev, footerCompanyDescEn: e.target.value }))}
                rows={3}
                className="mt-2 border-black dark:border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="footerAr">Arapça (Ar)</Label>
              <Textarea
                id="footerAr"
                value={contentSettings.footerCompanyDescAr || ''}
                onChange={(e) => setContentSettings(prev => ({ ...prev, footerCompanyDescAr: e.target.value }))}
                rows={3}
                className="mt-2 border-black dark:border-gray-300"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media Links */}
        <Card>
          <CardHeader>
            <CardTitle>Sosyal Medya Linkleri</CardTitle>
            <CardDescription>Sosyal medya hesaplarınızın URL'lerini girin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="facebook">Facebook URL</Label>
              <Input
                id="facebook"
                type="url"
                value={contentSettings.facebookUrl || ''}
                onChange={(e) => setContentSettings(prev => ({ ...prev, facebookUrl: e.target.value }))}
                placeholder="https://facebook.com/worklines"
                className="mt-2 border-black dark:border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram URL</Label>
              <Input
                id="instagram"
                type="url"
                value={contentSettings.instagramUrl || ''}
                onChange={(e) => setContentSettings(prev => ({ ...prev, instagramUrl: e.target.value }))}
                placeholder="https://instagram.com/worklines"
                className="mt-2 border-black dark:border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter URL</Label>
              <Input
                id="twitter"
                type="url"
                value={contentSettings.twitterUrl || ''}
                onChange={(e) => setContentSettings(prev => ({ ...prev, twitterUrl: e.target.value }))}
                placeholder="https://twitter.com/worklines"
                className="mt-2 border-black dark:border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input
                id="linkedin"
                type="url"
                value={contentSettings.linkedInUrl || ''}
                onChange={(e) => setContentSettings(prev => ({ ...prev, linkedInUrl: e.target.value }))}
                placeholder="https://linkedin.com/company/worklines"
                className="mt-2 border-black dark:border-gray-300"
              />
            </div>
          </CardContent>
        </Card>

        {/* About Mission Text 1 */}
        <Card>
          <CardHeader>
            <CardTitle>Hakkımızda - Misyon Metni (1. Paragraf)</CardTitle>
            <CardDescription>Hakkımızda sayfasında görünecek ilk paragraf</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mission1De">Almanca (De)</Label>
              <Textarea
                id="mission1De"
                value={contentSettings.aboutMissionText1De}
                onChange={(e) => setContentSettings(prev => ({ ...prev, aboutMissionText1De: e.target.value }))}
                rows={4}
                className="mt-2 border-black dark:border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="mission1Tr">Türkçe (Tr)</Label>
              <Textarea
                id="mission1Tr"
                value={contentSettings.aboutMissionText1Tr}
                onChange={(e) => setContentSettings(prev => ({ ...prev, aboutMissionText1Tr: e.target.value }))}
                rows={4}
                className="mt-2 border-black dark:border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="mission1En">İngilizce (En)</Label>
              <Textarea
                id="mission1En"
                value={contentSettings.aboutMissionText1En || ''}
                onChange={(e) => setContentSettings(prev => ({ ...prev, aboutMissionText1En: e.target.value }))}
                rows={4}
                className="mt-2 border-black dark:border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="mission1Ar">Arapça (Ar)</Label>
              <Textarea
                id="mission1Ar"
                value={contentSettings.aboutMissionText1Ar || ''}
                onChange={(e) => setContentSettings(prev => ({ ...prev, aboutMissionText1Ar: e.target.value }))}
                rows={4}
                className="mt-2 border-black dark:border-gray-300"
              />
            </div>
          </CardContent>
        </Card>

        {/* About Mission Text 2 */}
        <Card>
          <CardHeader>
            <CardTitle>Hakkımızda - Misyon Metni (2. Paragraf)</CardTitle>
            <CardDescription>Hakkımızda sayfasında görünecek ikinci paragraf</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mission2De">Almanca (De)</Label>
              <Textarea
                id="mission2De"
                value={contentSettings.aboutMissionText2De}
                onChange={(e) => setContentSettings(prev => ({ ...prev, aboutMissionText2De: e.target.value }))}
                rows={4}
                className="mt-2 border-black dark:border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="mission2Tr">Türkçe (Tr)</Label>
              <Textarea
                id="mission2Tr"
                value={contentSettings.aboutMissionText2Tr}
                onChange={(e) => setContentSettings(prev => ({ ...prev, aboutMissionText2Tr: e.target.value }))}
                rows={4}
                className="mt-2 border-black dark:border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="mission2En">İngilizce (En)</Label>
              <Textarea
                id="mission2En"
                value={contentSettings.aboutMissionText2En || ''}
                onChange={(e) => setContentSettings(prev => ({ ...prev, aboutMissionText2En: e.target.value }))}
                rows={4}
                className="mt-2 border-black dark:border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="mission2Ar">Arapça (Ar)</Label>
              <Textarea
                id="mission2Ar"
                value={contentSettings.aboutMissionText2Ar || ''}
                onChange={(e) => setContentSettings(prev => ({ ...prev, aboutMissionText2Ar: e.target.value }))}
                rows={4}
                className="mt-2 border-black dark:border-gray-300"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>İletişim Bilgileri</CardTitle>
            <CardDescription>İletişim sayfasında görünecek bilgiler</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contactPhone">Telefon</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={contentSettings.contactPhone || ''}
                onChange={(e) => setContentSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                placeholder="+49 123 456 7890"
                className="mt-2 border-black dark:border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">E-posta</Label>
              <Input
                id="contactEmail"
                type="email"
                value={contentSettings.contactEmail || ''}
                onChange={(e) => setContentSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                placeholder="info@worklines.de"
                className="mt-2 border-black dark:border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="addressGermany">Almanya Adresi</Label>
              <Textarea
                id="addressGermany"
                value={contentSettings.addressGermany || ''}
                onChange={(e) => setContentSettings(prev => ({ ...prev, addressGermany: e.target.value }))}
                rows={3}
                className="mt-2 border-black dark:border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="addressMersin">Türkiye - Mersin Adresi</Label>
              <Textarea
                id="addressMersin"
                value={contentSettings.addressTurkeyMersin || ''}
                onChange={(e) => setContentSettings(prev => ({ ...prev, addressTurkeyMersin: e.target.value }))}
                rows={3}
                className="mt-2 border-black dark:border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="addressIstanbul">Türkiye - İstanbul Adresi</Label>
              <Textarea
                id="addressIstanbul"
                value={contentSettings.addressTurkeyIstanbul || ''}
                onChange={(e) => setContentSettings(prev => ({ ...prev, addressTurkeyIstanbul: e.target.value }))}
                rows={3}
                className="mt-2 border-black dark:border-gray-300"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentManagement;

