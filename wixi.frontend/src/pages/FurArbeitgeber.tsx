import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { Building2, Users, FileText, Send } from "lucide-react";
import { useLanguage } from "../contexts/language-context";
import FormService, { type EmployerFormData } from "../ApiServices/services/FormService";
import { useToast } from "../hooks/use-toast";

const FurArbeitgeber: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    industry: "",
    companySize: "",
    positions: "",
    requirements: "",
    message: "",
    specialRequests: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const payload: EmployerFormData = {
        companyName: formData.companyName.trim(),
        contactPerson: formData.contactPerson.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        industry: formData.industry,
        companySize: formData.companySize || undefined,
        positions: formData.positions.trim(),
        requirements: formData.requirements.trim(),
        message: formData.message || undefined,
        specialRequests: formData.specialRequests || undefined,
        language: t("language") || "de",
      };

      await FormService.submitEmployerForm(payload);

      toast({
        variant: "default",
        title: "✅ Başarılı",
        description: "Talebiniz başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz.",
      });

      setFormData({
        companyName: "",
        contactPerson: "",
        email: "",
        phone: "",
        industry: "",
        companySize: "",
        positions: "",
        requirements: "",
        message: "",
        specialRequests: "",
      });
    } catch (error) {
      console.error("Employer form submission error:", error);
      toast({
        variant: "destructive",
        title: "❌ Hata",
        description: "Form gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              {t("arbeitgeber.title")}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              {t("arbeitgeber.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-20 flex-1">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="text-center border-b">
                <CardTitle className="text-3xl mb-2">{t("arbeitgeber.form_title")}</CardTitle>
                <CardDescription className="text-base">
                  {t("arbeitgeber.form_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Company Information */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Building2 className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold">{t("arbeitgeber.company_info")}</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">{t("arbeitgeber.company_name")} *</Label>
                        <Input
                          id="companyName"
                          required
                          value={formData.companyName}
                          onChange={(e) => handleChange("companyName", e.target.value)}
                          placeholder={t("arbeitgeber.company_name_placeholder")}
                          className="border border-gray-300 dark:border-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactPerson">{t("arbeitgeber.contact_person")} *</Label>
                        <Input
                          id="contactPerson"
                          required
                          value={formData.contactPerson}
                          onChange={(e) => handleChange("contactPerson", e.target.value)}
                          placeholder={t("arbeitgeber.contact_person_placeholder")}
                          className="border border-gray-300 dark:border-gray-600"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="email">{t("arbeitgeber.email")} *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          placeholder={t("arbeitgeber.email_placeholder")}
                          className="border border-gray-300 dark:border-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">{t("arbeitgeber.phone")} *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => handleChange("phone", e.target.value)}
                          placeholder={t("arbeitgeber.phone_placeholder")}
                          className="border border-gray-300 dark:border-gray-600"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="industry">{t("arbeitgeber.industry")} *</Label>
                        <Select value={formData.industry} onValueChange={(value) => handleChange("industry", value)}>
                          <SelectTrigger id="industry" className="border border-gray-300 dark:border-gray-600">
                            <SelectValue placeholder={t("arbeitgeber.industry_placeholder")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="it">{t("arbeitgeber.industry_it")}</SelectItem>
                            <SelectItem value="healthcare">{t("arbeitgeber.industry_healthcare")}</SelectItem>
                            <SelectItem value="engineering">{t("arbeitgeber.industry_engineering")}</SelectItem>
                            <SelectItem value="automotive">{t("arbeitgeber.industry_automotive")}</SelectItem>
                            <SelectItem value="finance">{t("arbeitgeber.industry_finance")}</SelectItem>
                            <SelectItem value="hospitality">{t("arbeitgeber.industry_hospitality")}</SelectItem>
                            <SelectItem value="construction">{t("arbeitgeber.industry_construction")}</SelectItem>
                            <SelectItem value="logistics">{t("arbeitgeber.industry_logistics")}</SelectItem>
                            <SelectItem value="other">{t("arbeitgeber.industry_other")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companySize">{t("arbeitgeber.company_size")}</Label>
                        <Select
                          value={formData.companySize}
                          onValueChange={(value) => handleChange("companySize", value)}
                        >
                          <SelectTrigger id="companySize" className="border border-gray-300 dark:border-gray-600">
                            <SelectValue placeholder={t("arbeitgeber.company_size_placeholder")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-10">{t("arbeitgeber.company_size_1_10")}</SelectItem>
                            <SelectItem value="11-50">{t("arbeitgeber.company_size_11_50")}</SelectItem>
                            <SelectItem value="51-200">{t("arbeitgeber.company_size_51_200")}</SelectItem>
                            <SelectItem value="201-500">{t("arbeitgeber.company_size_201_500")}</SelectItem>
                            <SelectItem value="500+">{t("arbeitgeber.company_size_500_plus")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Position Requirements */}
                  <div className="space-y-6 pt-6 border-t">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold">{t("arbeitgeber.position_requirements")}</h3>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="positions">{t("arbeitgeber.positions")} *</Label>
                      <Input
                        id="positions"
                        required
                        value={formData.positions}
                        onChange={(e) => handleChange("positions", e.target.value)}
                        placeholder={t("arbeitgeber.positions_placeholder")}
                        className="border border-gray-300 dark:border-gray-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="requirements">{t("arbeitgeber.requirements")} *</Label>
                      <Textarea
                        id="requirements"
                        required
                        value={formData.requirements}
                        onChange={(e) => handleChange("requirements", e.target.value)}
                        placeholder={t("arbeitgeber.requirements_placeholder")}
                        rows={5}
                        className="border border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-6 pt-6 border-t">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold">{t("arbeitgeber.additional_info")}</h3>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">{t("arbeitgeber.message")}</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        placeholder={t("arbeitgeber.message_placeholder")}
                        rows={4}
                        className="border border-gray-300 dark:border-gray-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialRequests">{t("arbeitgeber.special_requests")}</Label>
                      <Textarea
                        id="specialRequests"
                        value={formData.specialRequests}
                        onChange={(e) => handleChange("specialRequests", e.target.value)}
                        placeholder={t("arbeitgeber.special_placeholder")}
                        rows={4}
                        className="border border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6 transition-colors" disabled={isSubmitting}>
                      <Send className="mr-2 h-5 w-5" />
                      {isSubmitting ? t("common.submitting") || "Gönderiliyor..." : t("arbeitgeber.submit")}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Info Section */}
            <div className="mt-12 grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("arbeitgeber.fast_placement")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t("arbeitgeber.fast_placement_desc")}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("arbeitgeber.legal_support")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t("arbeitgeber.legal_support_desc")}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("arbeitgeber.follow_up")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t("arbeitgeber.follow_up_desc")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FurArbeitgeber;
