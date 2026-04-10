import React, { useState, useEffect } from 'react';
import { Header } from '../components/header';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/language-context';
import { useToast } from '../hooks/use-toast';
import FormService from '../ApiServices/services/FormService';
import type { ContactFormData } from '../ApiServices/services/FormService';
import ContentSettingsService, { type PublicContentSettings } from '../ApiServices/services/ContentSettingsService';

const Contact: React.FC = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contentSettings, setContentSettings] = useState<PublicContentSettings | null>(null);

  useEffect(() => {
    loadContentSettings();
  }, [language]);

  const loadContentSettings = async () => {
    try {
      const res = await ContentSettingsService.getPublicSettings(language);
      if (res.success && res.settings) {
        setContentSettings(res.settings);
      }
    } catch (error) {
      console.error('Error loading content settings:', error);
    }
  };
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: undefined,
    nationality: '',
    education: '',
    fieldOfStudy: '',
    workExperience: '',
    germanLevel: '',
    englishLevel: '',
    interest: '',
    preferredCity: '',
    timeline: '',
    message: '',
    privacyConsent: false,
    newsletter: false,
    language: language || 'de',
  });

  const handleChange = (field: keyof ContactFormData, value: string | number | boolean | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast({
        variant: 'destructive',
        title: '❌ Hata',
        description: 'Lütfen zorunlu alanları doldurun (Ad, Soyad, Email, Telefon)'
      });
      return;
    }

    if (!formData.privacyConsent) {
      toast({
        variant: 'destructive',
        title: '❌ Hata',
        description: 'Gizlilik politikasını kabul etmelisiniz'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        age: formData.age ? Number(formData.age) : undefined,
        language: language || 'de',
      };

      await FormService.submitContactForm(submitData);

      toast({
        variant: 'default',
        title: '✅ Başarılı',
        description: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.'
      });

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        age: undefined,
        nationality: '',
        education: '',
        fieldOfStudy: '',
        workExperience: '',
        germanLevel: '',
        englishLevel: '',
        interest: '',
        preferredCity: '',
        timeline: '',
        message: '',
        privacyConsent: false,
        newsletter: false,
        language: language || 'de',
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        variant: 'destructive',
        title: '❌ Hata',
        description: 'Form gönderilirken bir hata oluştu. Lütfen tekrar deneyin.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-8 text-balance bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {t("contact.title")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto text-pretty leading-relaxed">
            {t("contact.subtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-16 max-w-7xl mx-auto">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-8">
                <CardTitle className="text-3xl font-bold">{t("contact.form_title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <form className="space-y-8" onSubmit={handleSubmit}>
                  {/* Personal Information */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="firstName" className="text-base font-medium">
                        {t("contact.first_name")} *
                      </Label>
                      <Input 
                        id="firstName" 
                        placeholder={t("contact.first_name_placeholder")} 
                        required 
                        className="h-12 border border-gray-300 dark:border-gray-600"
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="lastName" className="text-base font-medium">
                        {t("contact.last_name")} *
                      </Label>
                      <Input 
                        id="lastName" 
                        placeholder={t("contact.last_name_placeholder")} 
                        required 
                        className="h-12 border border-gray-300 dark:border-gray-600"
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-base font-medium">
                        {t("contact.email_address")} *
                      </Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder={t("contact.email_placeholder")} 
                        required 
                        className="h-12 border border-gray-300 dark:border-gray-600"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="phone" className="text-base font-medium">
                        {t("contact.phone_number")} *
                      </Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder={t("contact.phone_placeholder")} 
                        required 
                        className="h-12 border border-gray-300 dark:border-gray-600"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="age" className="text-base font-medium">
                        {t("contact.age")}
                      </Label>
                      <Input 
                        id="age" 
                        type="number" 
                        placeholder={t("contact.age_placeholder")} 
                        min="16" 
                        max="65" 
                        className="h-12 border border-gray-300 dark:border-gray-600"
                        value={formData.age || ''}
                        onChange={(e) => handleChange('age', e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="nationality" className="text-base font-medium">
                        {t("contact.nationality")}
                      </Label>
                      <Input 
                        id="nationality" 
                        placeholder={t("contact.nationality_placeholder")} 
                        className="h-12 border border-gray-300 dark:border-gray-600"
                        value={formData.nationality}
                        onChange={(e) => handleChange('nationality', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Education Background */}
                  <div className="space-y-6 pt-4 border-t">
                    <h3 className="text-xl font-semibold text-primary">{t("contact.education_background")}</h3>

                    <div className="space-y-3">
                      <Label htmlFor="education" className="text-base font-medium">
                        {t("contact.highest_education")}
                      </Label>
                      <Select value={formData.education} onValueChange={(value) => handleChange('education', value)}>
                        <SelectTrigger className="h-12 border border-gray-300 dark:border-gray-600">
                          <SelectValue placeholder={t("contact.education_placeholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hauptschule">{t("contact.education_hauptschule")}</SelectItem>
                          <SelectItem value="realschule">{t("contact.education_realschule")}</SelectItem>
                          <SelectItem value="gymnasium">{t("contact.education_gymnasium")}</SelectItem>
                          <SelectItem value="bachelor">{t("contact.education_bachelor")}</SelectItem>
                          <SelectItem value="master">{t("contact.education_master")}</SelectItem>
                          <SelectItem value="phd">{t("contact.education_phd")}</SelectItem>
                          <SelectItem value="other">{t("contact.education_other")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="field" className="text-base font-medium">
                        {t("contact.field_of_study")}
                      </Label>
                      <Input 
                        id="field" 
                        placeholder={t("contact.field_placeholder")} 
                        className="h-12 border border-gray-300 dark:border-gray-600"
                        value={formData.fieldOfStudy}
                        onChange={(e) => handleChange('fieldOfStudy', e.target.value)}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="workExperience" className="text-base font-medium">
                        {t("contact.work_experience")}
                      </Label>
                      <Select value={formData.workExperience} onValueChange={(value) => handleChange('workExperience', value)}>
                        <SelectTrigger className="h-12 border border-gray-300 dark:border-gray-600">
                          <SelectValue placeholder={t("contact.experience_placeholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">{t("contact.experience_none")}</SelectItem>
                          <SelectItem value="1-2">{t("contact.experience_1_2")}</SelectItem>
                          <SelectItem value="3-5">{t("contact.experience_3_5")}</SelectItem>
                          <SelectItem value="6-10">{t("contact.experience_6_10")}</SelectItem>
                          <SelectItem value="10+">{t("contact.experience_10_plus")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Language Skills */}
                  <div className="space-y-6 pt-4 border-t">
                    <h3 className="text-xl font-semibold text-primary">{t("contact.language_skills")}</h3>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="germanLevel" className="text-base font-medium">
                          {t("contact.german_level")}
                        </Label>
                        <Select value={formData.germanLevel} onValueChange={(value) => handleChange('germanLevel', value)}>
                          <SelectTrigger className="h-12 border border-gray-300 dark:border-gray-600">
                            <SelectValue placeholder={t("contact.german_placeholder")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{t("contact.german_none")}</SelectItem>
                            <SelectItem value="a1">{t("contact.german_a1")}</SelectItem>
                            <SelectItem value="a2">{t("contact.german_a2")}</SelectItem>
                            <SelectItem value="b1">{t("contact.german_b1")}</SelectItem>
                            <SelectItem value="b2">{t("contact.german_b2")}</SelectItem>
                            <SelectItem value="c1">{t("contact.german_c1")}</SelectItem>
                            <SelectItem value="c2">{t("contact.german_c2")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="englishLevel" className="text-base font-medium">
                          {t("contact.english_level")}
                        </Label>
                        <Select value={formData.englishLevel} onValueChange={(value) => handleChange('englishLevel', value)}>
                          <SelectTrigger className="h-12 border border-gray-300 dark:border-gray-600">
                            <SelectValue placeholder={t("contact.english_placeholder")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{t("contact.english_none")}</SelectItem>
                            <SelectItem value="a1">{t("contact.english_a1")}</SelectItem>
                            <SelectItem value="a2">{t("contact.english_a2")}</SelectItem>
                            <SelectItem value="b1">{t("contact.english_b1")}</SelectItem>
                            <SelectItem value="b2">{t("contact.english_b2")}</SelectItem>
                            <SelectItem value="c1">{t("contact.english_c1")}</SelectItem>
                            <SelectItem value="c2">{t("contact.english_c2")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Interest Areas */}
                  <div className="space-y-6 pt-4 border-t">
                    <h3 className="text-xl font-semibold text-primary">{t("contact.interest_area")}</h3>

                    <div className="space-y-3">
                      <Label htmlFor="interest" className="text-base font-medium">
                        {t("contact.what_interests")}
                      </Label>
                      <Select value={formData.interest} onValueChange={(value) => handleChange('interest', value)}>
                        <SelectTrigger className="h-12 border border-gray-300 dark:border-gray-600">
                          <SelectValue placeholder={t("contact.interest_placeholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ausbildung">{t("contact.interest_ausbildung")}</SelectItem>
                          <SelectItem value="university">{t("contact.interest_university")}</SelectItem>
                          <SelectItem value="language">{t("contact.interest_language")}</SelectItem>
                          <SelectItem value="work">{t("contact.interest_work")}</SelectItem>
                          <SelectItem value="multiple">{t("contact.interest_multiple")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="preferredCity" className="text-base font-medium">
                        {t("contact.preferred_city")}
                      </Label>
                      <Input 
                        id="preferredCity" 
                        placeholder={t("contact.city_placeholder")} 
                        className="h-12 border border-gray-300 dark:border-gray-600"
                        value={formData.preferredCity}
                        onChange={(e) => handleChange('preferredCity', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-3 pt-4 border-t">
                    <Label htmlFor="timeline" className="text-base font-medium">
                      {t("contact.timeline")}
                    </Label>
                    <Select value={formData.timeline} onValueChange={(value) => handleChange('timeline', value)}>
                      <SelectTrigger className="h-12 border border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder={t("contact.timeline_placeholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asap">{t("contact.timeline_asap")}</SelectItem>
                        <SelectItem value="3months">{t("contact.timeline_3months")}</SelectItem>
                        <SelectItem value="6months">{t("contact.timeline_6months")}</SelectItem>
                        <SelectItem value="1year">{t("contact.timeline_1year")}</SelectItem>
                        <SelectItem value="flexible">{t("contact.timeline_flexible")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-3 pt-4 border-t">
                    <Label htmlFor="message" className="text-base font-medium">
                      {t("contact.additional_info")}
                    </Label>
                    <Textarea
                      id="message"
                      placeholder={t("contact.message_placeholder")}
                      rows={5}
                      className="resize-none border border-gray-300 dark:border-gray-600"
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                    />
                  </div>

                  {/* Privacy Consent */}
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        id="privacy" 
                        required 
                        className="mt-1"
                        checked={formData.privacyConsent}
                        onCheckedChange={(checked) => handleChange('privacyConsent', checked === true)}
                      />
                      <Label htmlFor="privacy" className="text-sm leading-relaxed">
                        {t("contact.privacy_consent")}{" "}
                        <a href="/privacy" className="text-primary hover:underline font-medium">
                          {t("contact.privacy_link")}
                        </a>{" "}
                        *
                      </Label>
                    </div>

                   
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t("contact.submitting") || 'Gönderiliyor...'}
                      </>
                    ) : (
                      t("contact.submit")
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information Sidebar */}
          <div className="space-y-8">
            <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl">{t("contact.info_title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{t("contact.phone")}</p>
                    <p className="text-muted-foreground">{contentSettings?.contact?.phone || "+90 533 057 00 31"}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{t("contact.email")}</p>
                    <p className="text-muted-foreground">{contentSettings?.contact?.email || "info@worklines.de"}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold text-lg">{t("contact.address")}</p>

                      {/* Germany Office */}
                      <div className="mt-2">
                        <p className="text-sm font-medium text-foreground">{t("contact.address_germany")}:</p>
                        <p className="text-muted-foreground text-sm whitespace-pre-line">
                          {contentSettings?.contact?.addresses?.germany || "Humboldstraße 25A, 21465 Reinbek\n22179 Hamburg\nDeutschland"}
                        </p>
                      </div>

                      {/* Turkey - Mersin Office */}
                      <div className="mt-3">
                        <p className="text-sm font-medium text-foreground">{t("contact.address_turkey_mersin")}:</p>
                        <p className="text-muted-foreground text-sm whitespace-pre-line">
                          {contentSettings?.contact?.addresses?.turkeyMersin || "Cami Şerif Mahallesi\nİstiklal Caddesi 37/1\nAkdeniz, Mersin"}
                        </p>
                      </div>

                      {/* Turkey - Istanbul Office */}
                      <div className="mt-3">
                        <p className="text-sm font-medium text-foreground">{t("contact.address_turkey_istanbul")}:</p>
                        <p className="text-muted-foreground text-sm whitespace-pre-line">
                          {contentSettings?.contact?.addresses?.turkeyIstanbul || "Caferağa Mahallesi\nModa Caddesi No:28/202 Kat 2\nÖzgür İş Merkezi\n34710 Moda / Kadıköy - İstanbul"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <CardTitle className="text-2xl">{t("contact.why_choose")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-primary rounded-full mt-2"></div>
                  <p className="font-medium">{t("contact.free_consultation")}</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-primary rounded-full mt-2"></div>
                  <p className="font-medium">{t("contact.experienced_advisors")}</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-primary rounded-full mt-2"></div>
                  <p className="font-medium">{t("contact.individual_support")}</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-primary rounded-full mt-2"></div>
                  <p className="font-medium">{t("contact.successful_placements")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;