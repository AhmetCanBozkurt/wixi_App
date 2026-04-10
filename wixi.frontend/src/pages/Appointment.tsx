import React, { useState, useEffect } from 'react';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar } from '../components/ui/calendar';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { CalendarIcon, Clock, CheckCircle2, User, Euro } from 'lucide-react';
import { useLanguage } from '../contexts/language-context';
import TeamService, { type TeamMember } from '../ApiServices/services/TeamService';
import { BASE_URL } from '../ApiServices/config/api.config';
import { toast } from 'sonner';
import { PaymentForm } from '../components/PaymentForm';
import { OrderSummary } from '../components/OrderSummary';

const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

interface AppointmentTeamMember extends TeamMember {
  price: number;
  currency?: string;
}

export default function AppointmentPage() {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(1);
  const [teamMembers, setTeamMembers] = useState<AppointmentTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [appointmentId, setAppointmentId] = useState<number | null>(null);

  useEffect(() => {
    loadTeamMembers();
  }, [language]);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const res = await TeamService.getTeamMembers(language);
      if (res.success && res.items) {
        // Filter only members who can provide consultation and add price/currency
        const membersWithPrice: AppointmentTeamMember[] = res.items
          .filter(member => member.canProvideConsultation === true)
          .map(member => ({
            ...member,
            price: member.consultationPrice || 50, // Use consultation price or default
            currency: member.consultationCurrency || 'EUR' // Use consultation currency or default
          }));
        setTeamMembers(membersWithPrice);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Combine selected date and time
      if (!selectedDate || !selectedTime || !selectedMember) {
        return;
      }

      const [hours, minutes] = selectedTime.split(':').map(Number);
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(hours, minutes, 0, 0);
      
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(hours + 1, minutes, 0, 0); // 1 hour appointment

      // Import appointmentService
      const { appointmentService } = await import('../ApiServices/services');
      
      const appointment = await appointmentService.createAppointment({
        title: `Danışmanlık - ${selectedMemberData?.name}`,
        description: formData.message || `Danışmanlık randevusu: ${selectedMemberData?.name}`,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        clientName: formData.name,
        clientEmail: formData.email,
        clientPhone: formData.phone,
        status: 'Pending',
        color: '#3B82F6',
      });

      // Save appointment ID for payment
      setAppointmentId(appointment.id);
      
      // Move to order summary step (step 5)
      setStep(5);
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast.error(
        language === "de" 
          ? "Randevu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin."
          : language === "tr"
          ? "Randevu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin."
          : "An error occurred while creating the appointment. Please try again."
      );
    }
  };

  const isStepComplete = (stepNumber: number) => {
    if (stepNumber === 1) return selectedMember !== null;
    if (stepNumber === 2) return selectedDate !== undefined;
    if (stepNumber === 3) return selectedTime !== null;
    if (stepNumber === 4) return formData.name && formData.email && formData.phone;
    return false;
  };

  const selectedMemberData = teamMembers.find((m) => m.id === selectedMember);

  // Helper to get full image URL (same as admin panel)
  const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    // If URL is already absolute (starts with http:// or https://), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // If URL starts with /, prepend BASE_URL
    if (url.startsWith('/')) {
      return `${BASE_URL}${url}`;
    }
    // Otherwise, assume it's a relative path and add BASE_URL with /
    return `${BASE_URL}/${url}`;
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                {language === "de" ? "Termin bestätigt" : language === "tr" ? "Randevu Onaylandı" : "Appointment Confirmed"}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {language === "de" 
                  ? "Ihr Termin wurde erfolgreich gebucht. Wir werden Sie in Kürze kontaktieren."
                  : language === "tr"
                  ? "Randevunuz başarıyla oluşturuldu. En kısa sürede sizinle iletişime geçeceğiz."
                  : "Your appointment has been successfully booked. We will contact you shortly."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2 text-left">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{selectedMemberData?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedDate?.toLocaleDateString(language === "tr" ? "tr-TR" : "de-DE")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedTime}</span>
                </div>
                {selectedMemberData?.consultationPrice && (
                  <div className="flex items-center gap-2 text-sm pt-2 border-t">
                    <Euro className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">{selectedMemberData?.currency || 'EUR'}{selectedMemberData?.price}</span>
                  </div>
                )}
              </div>
              <Button onClick={() => (window.location.href = "/")} className="w-full">
                {language === "de" ? "Zur Startseite" : language === "tr" ? "Ana Sayfaya Dön" : "Back to Home"}
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              {language === "de" ? "Termin buchen" : language === "tr" ? "Randevu Al" : "Book Appointment"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              {language === "de"
                ? "Buchen Sie eine persönliche Beratung mit einem unserer Experten"
                : language === "tr"
                ? "Uzmanlarımızdan biriyle kişisel bir danışmanlık randevusu alın"
                : "Book a personal consultation with one of our experts"}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-full">
              <Euro className="w-5 h-5" />
              <span className="font-semibold text-lg">
                {language === "de" ? "Beratungsgebühr: €50" : language === "tr" ? "Danışmanlık Ücreti: €50" : "Consultation Fee: €50"}
              </span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12 gap-2">
            {[1, 2, 3, 4, 5, 6].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    step === stepNum
                      ? "bg-primary text-primary-foreground"
                      : isStepComplete(stepNum) || step > stepNum
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isStepComplete(stepNum) && step > stepNum ? <CheckCircle2 className="w-5 h-5" /> : stepNum}
                </div>
                {stepNum < 6 && (
                  <div
                    className={`w-12 md:w-24 h-1 transition-colors ${step > stepNum ? "bg-primary/20" : "bg-muted"}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Select Team Member */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold mb-2">
                  {language === "de" ? "Berater auswählen" : language === "tr" ? "Danışman Seçin" : "Select Consultant"}
                </h2>
                <p className="text-muted-foreground">
                  {language === "de"
                    ? "Wählen Sie einen unserer Experten für Ihre Beratung"
                    : language === "tr"
                    ? "Danışmanlığınız için uzmanlarımızdan birini seçin"
                    : "Choose one of our experts for your consultation"}
                </p>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {teamMembers.map((member) => (
                    <Card
                      key={member.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedMember === member.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedMember(member.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={getImageUrl(member.image)} alt={member.name} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-1">{member.name}</CardTitle>
                            <CardDescription className="text-sm">{member.position}</CardDescription>
                            <Badge variant="secondary" className="mt-2">
                              {member.specializations?.join(", ") || member.experience}
                            </Badge>
                            {member.consultationPrice && (
                              <div className="flex items-center gap-1 mt-3 text-primary font-semibold">
                                <Euro className="w-4 h-4" />
                                <span>{member.currency || 'EUR'}{member.price}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
              <div className="flex justify-center mt-8">
                <Button size="lg" onClick={() => setStep(2)} disabled={!selectedMember} className="min-w-[200px]">
                  {language === "de" ? "Weiter" : language === "tr" ? "Devam Et" : "Continue"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Select Date */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold mb-2">
                  {language === "de" ? "Datum auswählen" : language === "tr" ? "Tarih Seçin" : "Select Date"}
                </h2>
                <p className="text-muted-foreground">
                  {language === "de"
                    ? "Wählen Sie ein verfügbares Datum für Ihren Termin"
                    : language === "tr"
                    ? "Randevunuz için uygun bir tarih seçin"
                    : "Choose an available date for your appointment"}
                </p>
                {selectedMemberData && (
                  <div className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{selectedMemberData.name}</span>
                    {selectedMemberData.consultationPrice && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium text-primary">
                          <Euro className="w-3 h-3" />{selectedMemberData.currency || 'EUR'}{selectedMemberData.price}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                <Card className="w-full max-w-lg shadow-lg border">
                  <CardContent className="p-6">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const checkDate = new Date(date);
                        checkDate.setHours(0, 0, 0, 0);
                        return checkDate < today || date.getDay() === 0 || date.getDay() === 6;
                      }}
                      className="w-full"
                      classNames={{
                        root: "w-full mx-auto",
                        months: "w-full flex justify-center",
                        month: "w-full",
                        month_caption: "flex justify-center pt-1 relative items-center mb-4",
                        caption_label: "text-base font-semibold",
                        nav: "space-x-1 flex items-center justify-between",
                        table: "w-full mx-auto",
                        weekdays: "flex",
                        weekday: "text-muted-foreground rounded-md flex-1 font-normal text-sm text-center",
                        week: "flex w-full mt-2 justify-center",
                        day: "h-9 w-9 text-sm",
                        cell: "text-center",
                      }}
                    />
                    <div className="pt-4 mt-4 border-t space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="h-3 w-3 rounded-full bg-primary"></div>
                        <span>{language === "de" ? "Ausgewähltes Datum" : language === "tr" ? "Seçili Tarih" : "Selected Date"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="h-3 w-3 rounded-full bg-accent border-2 border-primary/30"></div>
                        <span>{language === "de" ? "Heute" : language === "tr" ? "Bugün" : "Today"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground opacity-50">
                        <div className="h-3 w-3 rounded-full bg-muted"></div>
                        <span>{language === "de" ? "Nicht verfügbar" : language === "tr" ? "Müsait değil" : "Not Available"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="flex justify-center gap-4 mt-8">
                <Button variant="outline" size="lg" onClick={() => setStep(1)} className="min-w-[120px]">
                  {language === "de" ? "Zurück" : language === "tr" ? "Geri" : "Back"}
                </Button>
                <Button size="lg" onClick={() => setStep(3)} disabled={!selectedDate} className="min-w-[200px]">
                  {language === "de" ? "Weiter" : language === "tr" ? "Devam Et" : "Continue"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Select Time */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold mb-2">
                  {language === "de" ? "Uhrzeit auswählen" : language === "tr" ? "Saat Seçin" : "Select Time"}
                </h2>
                <p className="text-muted-foreground">
                  {language === "de"
                    ? "Wählen Sie eine verfügbare Uhrzeit"
                    : language === "tr"
                    ? "Uygun bir saat seçin"
                    : "Choose an available time"}
                </p>
                {selectedMemberData && (
                  <div className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{selectedMemberData.name}</span>
                    {selectedMemberData.consultationPrice && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium text-primary">
                          <Euro className="w-3 h-3" />{selectedMemberData.currency || 'EUR'}{selectedMemberData.price}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="max-w-2xl mx-auto">
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      className="h-14 text-base"
                      onClick={() => setSelectedTime(time)}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex justify-center gap-4 mt-8">
                <Button variant="outline" size="lg" onClick={() => setStep(2)} className="min-w-[120px]">
                  {language === "de" ? "Zurück" : language === "tr" ? "Geri" : "Back"}
                </Button>
                <Button size="lg" onClick={() => setStep(4)} disabled={!selectedTime} className="min-w-[200px]">
                  {language === "de" ? "Weiter" : language === "tr" ? "Devam Et" : "Continue"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Contact Information */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold mb-2">
                  {language === "de" ? "Kontaktinformationen" : language === "tr" ? "İletişim Bilgileri" : "Contact Information"}
                </h2>
                <p className="text-muted-foreground">
                  {language === "de"
                    ? "Bitte geben Sie Ihre Kontaktdaten ein"
                    : language === "tr"
                    ? "Lütfen iletişim bilgilerinizi girin"
                    : "Please enter your contact details"}
                </p>
              </div>
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>
                    {language === "de" ? "Zusammenfassung" : language === "tr" ? "Özet" : "Summary"}
                  </CardTitle>
                  <CardDescription>
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{selectedMemberData?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{selectedDate?.toLocaleDateString(language === "tr" ? "tr-TR" : "de-DE")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{selectedTime}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Euro className="w-4 h-4 text-primary" />
                        {selectedMemberData?.consultationPrice && (
                          <>
                            <span className="font-semibold text-primary">{selectedMemberData?.currency || 'EUR'}{selectedMemberData?.price}</span>
                            <span className="text-xs text-muted-foreground">
                              {language === "de" ? "Beratungsgebühr" : language === "tr" ? "Danışmanlık Ücreti" : "Consultation Fee"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {language === "de" ? "Name" : language === "tr" ? "Ad Soyad" : "Name"} *
                      </Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={language === "de" ? "Ihr Name" : language === "tr" ? "Adınız Soyadınız" : "Your Name"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        {language === "de" ? "E-Mail" : language === "tr" ? "E-Posta" : "Email"} *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={language === "de" ? "ihre@email.de" : language === "tr" ? "ornek@email.com" : "your@email.com"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        {language === "de" ? "Telefon" : language === "tr" ? "Telefon" : "Phone"} *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+49 XXX XXX XXXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">
                        {language === "de" ? "Nachricht" : language === "tr" ? "Mesaj" : "Message"}
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={language === "de" ? "Ihre Nachricht (optional)" : language === "tr" ? "Mesajınız (isteğe bağlı)" : "Your message (optional)"}
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <Button type="button" variant="outline" size="lg" onClick={() => setStep(3)} className="flex-1">
                        {language === "de" ? "Zurück" : language === "tr" ? "Geri" : "Back"}
                      </Button>
                      <Button type="submit" size="lg" className="flex-1" disabled={!formData.name || !formData.email || !formData.phone}>
                        {language === "de" ? "Weiter" : language === "tr" ? "Devam Et" : "Continue"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 5: Order Summary */}
          {step === 5 && (
            <OrderSummary
              selectedMemberName={selectedMemberData?.name}
              selectedDate={selectedDate}
              selectedTime={selectedTime || undefined}
              consultationPrice={selectedMemberData?.consultationPrice}
              consultationCurrency={selectedMemberData?.consultationCurrency}
              onBack={() => setStep(4)}
              onContinue={() => setStep(6)}
            />
          )}

          {/* Step 6: Payment */}
          {step === 6 && appointmentId && (
            <PaymentForm
              selectedMemberName={selectedMemberData?.name}
              selectedDate={selectedDate}
              selectedTime={selectedTime || undefined}
              consultationPrice={selectedMemberData?.consultationPrice}
              consultationCurrency={selectedMemberData?.consultationCurrency}
              appointmentId={appointmentId}
              customerName={formData.name}
              customerEmail={formData.email}
              customerPhone={formData.phone}
              onBack={() => setStep(5)}
              onPaymentComplete={(paymentId) => {
                setIsSubmitted(true);
                toast.success(
                  language === "de" 
                    ? "Randevu ve ödeme başarıyla tamamlandı. En kısa sürede size dönüş yapacağız."
                    : language === "tr"
                    ? "Randevu ve ödeme başarıyla tamamlandı. En kısa sürede size dönüş yapacağız."
                    : "Appointment and payment completed successfully. We will contact you shortly."
                );
              }}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

