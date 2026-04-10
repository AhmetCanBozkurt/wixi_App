import React, { useState } from "react";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Upload, Send } from "lucide-react";
import { useLanguage } from "../contexts/language-context";
import FormService, { type EmployeeFormData } from "../ApiServices/services/FormService";
import { useToast } from "../hooks/use-toast";

const FurArbeitnehmer: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [salutation, setSalutation] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [profession, setProfession] = useState<string>("");
  const [experience, setExperience] = useState<string>("");
  const [education, setEducation] = useState<string>("");
  const [germanLevel, setGermanLevel] = useState<string>("");
  const [additionalInfo, setAdditionalInfo] = useState<string>("");
  const [specialRequests, setSpecialRequests] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['.pdf', '.doc', '.docx'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        toast({
          variant: 'destructive',
          title: '❌ Hata',
          description: 'CV dosyası sadece PDF, DOC veya DOCX formatında olabilir.'
        });
        e.target.value = ''; // Clear input
        setFileName('');
        setCvFile(null);
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast({
          variant: 'destructive',
          title: '❌ Hata',
          description: 'CV dosyası en fazla 10MB olabilir.'
        });
        e.target.value = ''; // Clear input
        setFileName('');
        setCvFile(null);
        return;
      }

      setFileName(file.name);
      setCvFile(file);
    } else {
      setFileName('');
      setCvFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!fullName || !email || !phone) {
      toast({
        variant: 'destructive',
        title: '❌ Hata',
        description: 'Lütfen zorunlu alanları doldurun (Ad Soyad, Email, Telefon)'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData: EmployeeFormData = {
        salutation: salutation || undefined,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        profession: profession || undefined,
        experience: experience ? parseInt(experience) : undefined,
        education: education || undefined,
        germanLevel: germanLevel || undefined,
        additionalInfo: additionalInfo || undefined,
        specialRequests: specialRequests || undefined,
        language: t('language') || 'de',
        cvFile: cvFile || undefined // Include CV file if selected
      };

      await FormService.submitEmployeeForm(formData);

      toast({
        variant: 'default',
        title: '✅ Başarılı',
        description: 'Başvurunuz başarıyla gönderildi. En kısa sürede size dönüş yapacağız.'
      });

      // Reset form
      setSalutation("");
      setFullName("");
      setEmail("");
      setPhone("");
      setProfession("");
      setExperience("");
      setEducation("");
      setGermanLevel("");
      setAdditionalInfo("");
      setSpecialRequests("");
      setFileName("");
      setCvFile(null);
      // Reset file input
      const fileInput = document.getElementById("cv-upload") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-background to-muted/20">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">{t("arbeitnehmer.title")}</h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
                {t("arbeitnehmer.subtitle")}
              </p>
            </div>

            {/* Application Form */}
            <div className="bg-card rounded-lg shadow-lg p-8 md:p-10 border max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">{t("arbeitnehmer.form_title")}</h2>
                <p className="text-muted-foreground">
                  {t("arbeitnehmer.form_desc")}
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salutation">{t("arbeitnehmer.salutation")}</Label>
                    <Select value={salutation} onValueChange={setSalutation}>
                      <SelectTrigger id="salutation" className="border border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder={t("arbeitnehmer.salutation_placeholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="herr">{t("arbeitnehmer.salutation_herr")}</SelectItem>
                        <SelectItem value="frau">{t("arbeitnehmer.salutation_frau")}</SelectItem>
                        <SelectItem value="divers">{t("arbeitnehmer.salutation_divers")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullname">{t("arbeitnehmer.fullname")} *</Label>
                    <Input 
                      id="fullname" 
                      placeholder={t("arbeitnehmer.fullname_placeholder")} 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="border border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("arbeitnehmer.email")} *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder={t("arbeitnehmer.email_placeholder")} 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border border-gray-300 dark:border-gray-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("arbeitnehmer.phone")} *</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder={t("arbeitnehmer.phone_placeholder")} 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="border border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>

                {/* Qualifications Section */}
                <div className="pt-4 border-t">
                  <h3 className="text-xl font-semibold mb-4">{t("arbeitnehmer.qualifications")}</h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="profession">{t("arbeitnehmer.profession")}</Label>
                      <Input 
                        id="profession" 
                        placeholder={t("arbeitnehmer.profession_placeholder")} 
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        className="border border-gray-300 dark:border-gray-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">{t("arbeitnehmer.experience")}</Label>
                      <Input 
                        id="experience" 
                        type="number" 
                        placeholder={t("arbeitnehmer.experience_placeholder")} 
                        min="0" 
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="border border-gray-300 dark:border-gray-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="education">{t("arbeitnehmer.education")}</Label>
                      <Select value={education} onValueChange={setEducation}>
                        <SelectTrigger id="education" className="border border-gray-300 dark:border-gray-600">
                          <SelectValue placeholder={t("arbeitnehmer.education_placeholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hauptschule">{t("arbeitnehmer.education_hauptschule")}</SelectItem>
                          <SelectItem value="realschule">{t("arbeitnehmer.education_realschule")}</SelectItem>
                          <SelectItem value="abitur">{t("arbeitnehmer.education_abitur")}</SelectItem>
                          <SelectItem value="ausbildung">{t("arbeitnehmer.education_ausbildung")}</SelectItem>
                          <SelectItem value="bachelor">{t("arbeitnehmer.education_bachelor")}</SelectItem>
                          <SelectItem value="master">{t("arbeitnehmer.education_master")}</SelectItem>
                          <SelectItem value="promotion">{t("arbeitnehmer.education_promotion")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="german-level">{t("arbeitnehmer.german_level")}</Label>
                      <Select value={germanLevel} onValueChange={setGermanLevel}>
                        <SelectTrigger id="german-level" className="border border-gray-300 dark:border-gray-600">
                          <SelectValue placeholder={t("arbeitnehmer.german_placeholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="a1">{t("arbeitnehmer.german_a1")}</SelectItem>
                          <SelectItem value="a2">{t("arbeitnehmer.german_a2")}</SelectItem>
                          <SelectItem value="b1">{t("arbeitnehmer.german_b1")}</SelectItem>
                          <SelectItem value="b2">{t("arbeitnehmer.german_b2")}</SelectItem>
                          <SelectItem value="c1">{t("arbeitnehmer.german_c1")}</SelectItem>
                          <SelectItem value="c2">{t("arbeitnehmer.german_c2")}</SelectItem>
                          <SelectItem value="none">{t("arbeitnehmer.german_none")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="additional-info">{t("arbeitnehmer.additional_info")}</Label>
                      <Textarea
                        id="additional-info"
                        placeholder={t("arbeitnehmer.additional_placeholder")}
                        rows={4}
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                        className="border border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* CV Upload Section */}
                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="cv-upload">{t("arbeitnehmer.cv_upload")}</Label>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        className="relative bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
                        onClick={() => document.getElementById("cv-upload")?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {t("arbeitnehmer.file_select")}
                      </Button>
                      <span className="text-sm text-muted-foreground">{fileName || t("arbeitnehmer.no_file")}</span>
                      <input
                        id="cv-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{t("arbeitnehmer.file_formats")}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="special-requests">{t("arbeitnehmer.special_requests")}</Label>
                    <Textarea
                      id="special-requests"
                      placeholder={t("arbeitnehmer.special_placeholder")}
                      rows={4}
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="border border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6 transition-colors"
                    disabled={isSubmitting}
                  >
                    <Send className="mr-2 h-5 w-5" />
                    {isSubmitting ? 'Gönderiliyor...' : t("arbeitnehmer.submit")}
                  </Button>
                </div>
              </form>
            </div>

            {/* Additional Info */}
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>{t("arbeitnehmer.privacy")}</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FurArbeitnehmer;
