import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Download, ZoomIn, ZoomOut, Save, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import PersonalInfoForm from '../../components/cv-builder/PersonalInfoForm';
import ExperienceForm from '../../components/cv-builder/ExperienceForm';
import EducationForm from '../../components/cv-builder/EducationForm';
import SkillsForm from '../../components/cv-builder/SkillsForm';
import CVPreview from '../../components/cv-builder/CVPreview';
import type { CVData, Language, Certificate } from '../../types/CVBuilderTypes';
import { cvBuilderService } from '../../ApiServices/services';

const CVBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const sessionId = searchParams.get('sessionId');

  const [cvData, setCvData] = useState<CVData>({
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
    },
    experience: [],
    education: [],
    skills: [],
    languages: [],
    certificates: [],
  });

  const [zoom, setZoom] = useState(75);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load existing CV data if paymentId or sessionId is provided
  useEffect(() => {
    const loadCVData = async () => {
      if (sessionId) {
        try {
          setLoading(true);
          const existingData = await cvBuilderService.getCVDataBySessionId(sessionId);
          if (existingData) {
            // Parse JSON strings to objects
            setCvData({
              personalInfo: typeof existingData.personalInfo === 'string' 
                ? JSON.parse(existingData.personalInfo) 
                : existingData.personalInfo,
              experience: typeof existingData.experience === 'string' 
                ? JSON.parse(existingData.experience) 
                : existingData.experience,
              education: typeof existingData.education === 'string' 
                ? JSON.parse(existingData.education) 
                : existingData.education,
              skills: typeof existingData.skills === 'string' 
                ? JSON.parse(existingData.skills) 
                : existingData.skills,
              languages: typeof existingData.languages === 'string' 
                ? JSON.parse(existingData.languages) 
                : existingData.languages,
              certificates: typeof existingData.certificates === 'string' 
                ? JSON.parse(existingData.certificates) 
                : existingData.certificates,
            });
          }
        } catch (error) {
          console.error('CV verisi yüklenirken hata:', error);
        } finally {
          setLoading(false);
        }
      } else if (paymentId) {
        try {
          setLoading(true);
          const existingData = await cvBuilderService.getCVDataByPaymentId(Number(paymentId));
          if (existingData) {
            // Parse JSON strings to objects
            setCvData({
              personalInfo: typeof existingData.personalInfo === 'string' 
                ? JSON.parse(existingData.personalInfo) 
                : existingData.personalInfo,
              experience: typeof existingData.experience === 'string' 
                ? JSON.parse(existingData.experience) 
                : existingData.experience,
              education: typeof existingData.education === 'string' 
                ? JSON.parse(existingData.education) 
                : existingData.education,
              skills: typeof existingData.skills === 'string' 
                ? JSON.parse(existingData.skills) 
                : existingData.skills,
              languages: typeof existingData.languages === 'string' 
                ? JSON.parse(existingData.languages) 
                : existingData.languages,
              certificates: typeof existingData.certificates === 'string' 
                ? JSON.parse(existingData.certificates) 
                : existingData.certificates,
            });
          }
        } catch (error) {
          console.error('CV verisi yüklenirken hata:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadCVData();
  }, [paymentId, sessionId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Check if paymentId exists, if not redirect to payment
      if (!paymentId) {
        toast.error('Ödeme yapılmadan CV kaydedilemez. Ödeme sayfasına yönlendiriliyorsunuz...');
        setTimeout(() => {
          navigate('/client/cv-builder-payment?amount=20');
        }, 2000);
        return;
      }
      
      const currentSessionId = sessionId || crypto.randomUUID();
      
      // Serialize CV data to JSON strings
      await cvBuilderService.saveCVData({
        sessionId: currentSessionId,
        paymentId: Number(paymentId),
        personalInfo: JSON.stringify(cvData.personalInfo),
        experience: JSON.stringify(cvData.experience),
        education: JSON.stringify(cvData.education),
        skills: JSON.stringify(cvData.skills),
        languages: JSON.stringify(cvData.languages),
        certificates: JSON.stringify(cvData.certificates),
      });
      
      // Update sessionId if it was generated
      if (!sessionId) {
        const url = new URL(window.location.href);
        url.searchParams.set('sessionId', currentSessionId);
        window.history.replaceState({}, '', url.toString());
      }
      
      toast.success('CV başarıyla kaydedildi');
    } catch (error: any) {
      console.error('CV kaydetme hatası:', error);
      toast.error(error.message || 'CV kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      if (!paymentId) {
        toast.error('Ödeme yapılmadan PDF indirilemez. Ödeme sayfasına yönlendiriliyorsunuz...');
        setTimeout(() => {
          navigate('/client/cv-builder-payment?amount=20');
        }, 2000);
        return;
      }
      
      const currentSessionId = sessionId || crypto.randomUUID();
      // First save the CV data
      await cvBuilderService.saveCVData({
        sessionId: currentSessionId,
        paymentId: Number(paymentId),
        personalInfo: JSON.stringify(cvData.personalInfo),
        experience: JSON.stringify(cvData.experience),
        education: JSON.stringify(cvData.education),
        skills: JSON.stringify(cvData.skills),
        languages: JSON.stringify(cvData.languages),
        certificates: JSON.stringify(cvData.certificates),
      });
      
      // Then export to PDF
      const blob = await cvBuilderService.exportCVToPdf(currentSessionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fullName = typeof cvData.personalInfo === 'object' 
        ? cvData.personalInfo.fullName 
        : JSON.parse(cvData.personalInfo as string).fullName || 'CV';
      a.download = `CV_${fullName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('PDF başarıyla indirildi');
    } catch (error: any) {
      console.error('PDF export hatası:', error);
      toast.error(error.message || 'PDF oluşturulamadı');
    }
  };

  const addLanguage = () => {
    const newLang: Language = {
      id: crypto.randomUUID(),
      language: "",
      proficiency: "",
    };
    setCvData({ ...cvData, languages: [...cvData.languages, newLang] });
  };

  const removeLanguage = (id: string) => {
    setCvData({
      ...cvData,
      languages: cvData.languages.filter((lang) => lang.id !== id),
    });
  };

  const updateLanguage = (id: string, field: keyof Language, value: string) => {
    setCvData({
      ...cvData,
      languages: cvData.languages.map((lang) =>
        lang.id === id ? { ...lang, [field]: value } : lang
      ),
    });
  };

  const addCertificate = () => {
    const newCert: Certificate = {
      id: crypto.randomUUID(),
      name: "",
      issuer: "",
      date: "",
    };
    setCvData({ ...cvData, certificates: [...cvData.certificates, newCert] });
  };

  const removeCertificate = (id: string) => {
    setCvData({
      ...cvData,
      certificates: cvData.certificates.filter((cert) => cert.id !== id),
    });
  };

  const updateCertificate = (id: string, field: keyof Certificate, value: string) => {
    setCvData({
      ...cvData,
      certificates: cvData.certificates.map((cert) =>
        cert.id === id ? { ...cert, [field]: value } : cert
      ),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">CV verisi yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-muted/20">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <button
          onClick={() => navigate('/client/dashboard')}
          className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
        >
          Dashboard
        </button>
        <span className="text-gray-500 dark:text-gray-400">/</span>
        <span className="text-gray-900 dark:text-white font-medium">CV Oluştur</span>
      </div>

      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-6">
          {/* Form Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">CV Oluştur</h2>
              <Button
                onClick={handleSave}
                disabled={saving}
                variant="outline"
                size="sm"
              >
                {saving ? 'Kaydediliyor...' : <><Save className="h-4 w-4 mr-2" />Kaydet</>}
              </Button>
            </div>

            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                <TabsTrigger value="personal">Kişisel</TabsTrigger>
                <TabsTrigger value="experience">Deneyim</TabsTrigger>
                <TabsTrigger value="education">Eğitim</TabsTrigger>
                <TabsTrigger value="skills">Beceriler</TabsTrigger>
                <TabsTrigger value="languages">Diller</TabsTrigger>
                <TabsTrigger value="certificates">Sertifikalar</TabsTrigger>
              </TabsList>

              <div className="mt-4">
                <TabsContent value="personal" className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <PersonalInfoForm
                        data={cvData.personalInfo}
                        onChange={(data) => setCvData({ ...cvData, personalInfo: data })}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="experience">
                  <Card>
                    <CardContent className="p-6">
                      <ExperienceForm
                        data={cvData.experience}
                        onChange={(data) => setCvData({ ...cvData, experience: data })}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="education">
                  <Card>
                    <CardContent className="p-6">
                      <EducationForm
                        data={cvData.education}
                        onChange={(data) => setCvData({ ...cvData, education: data })}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="skills">
                  <Card>
                    <CardContent className="p-6">
                      <SkillsForm
                        data={cvData.skills}
                        onChange={(data) => setCvData({ ...cvData, skills: data })}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="languages">
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {cvData.languages.map((lang, index) => (
                          <Card key={lang.id}>
                            <CardContent className="p-4 space-y-3">
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium">Dil {index + 1}</h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeLanguage(lang.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div>
                                <Label>Dil *</Label>
                                <Input
                                  value={lang.language}
                                  onChange={(e) => updateLanguage(lang.id, "language", e.target.value)}
                                  placeholder="Örn: İngilizce"
                                />
                              </div>
                              <div>
                                <Label>Seviye *</Label>
                                <Input
                                  value={lang.proficiency}
                                  onChange={(e) => updateLanguage(lang.id, "proficiency", e.target.value)}
                                  placeholder="Örn: İleri seviye"
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full gap-2"
                          onClick={addLanguage}
                        >
                          <Plus className="h-4 w-4" />
                          Dil Ekle
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="certificates">
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {cvData.certificates.map((cert, index) => (
                          <Card key={cert.id}>
                            <CardContent className="p-4 space-y-3">
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium">Sertifika {index + 1}</h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeCertificate(cert.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div>
                                <Label>Sertifika Adı *</Label>
                                <Input
                                  value={cert.name}
                                  onChange={(e) => updateCertificate(cert.id, "name", e.target.value)}
                                  placeholder="Sertifika adı"
                                />
                              </div>
                              <div>
                                <Label>Veren Kurum *</Label>
                                <Input
                                  value={cert.issuer}
                                  onChange={(e) => updateCertificate(cert.id, "issuer", e.target.value)}
                                  placeholder="Kurum adı"
                                />
                              </div>
                              <div>
                                <Label>Tarih *</Label>
                                <Input
                                  type="month"
                                  value={cert.date}
                                  onChange={(e) => updateCertificate(cert.id, "date", e.target.value)}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full gap-2"
                          onClick={addCertificate}
                        >
                          <Plus className="h-4 w-4" />
                          Sertifika Ekle
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Preview Section */}
          <div className="lg:sticky lg:top-20 h-fit space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Önizleme</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom(Math.max(50, zoom - 25))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="px-3 py-2 text-sm font-medium">{zoom}%</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom(Math.min(100, zoom + 25))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div
              className="overflow-auto border rounded-md bg-gray-100 p-4"
              style={{ maxHeight: "calc(100vh - 200px)" }}
            >
              <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}>
                <CVPreview data={cvData} />
              </div>
            </div>

            <Button
              className="w-full gap-2"
              size="lg"
              onClick={handleDownloadPDF}
            >
              <Download className="h-5 w-5" />
              PDF İndir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVBuilder;

