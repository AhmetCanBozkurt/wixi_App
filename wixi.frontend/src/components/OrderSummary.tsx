import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CalendarIcon, Clock, User, Euro } from 'lucide-react';
import { useLanguage } from '../contexts/language-context';

interface OrderSummaryProps {
  selectedMemberName?: string;
  selectedDate?: Date;
  selectedTime?: string | null;
  consultationPrice?: number;
  consultationCurrency?: string;
  onBack: () => void;
  onContinue: () => void;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  selectedMemberName,
  selectedDate,
  selectedTime,
  consultationPrice,
  consultationCurrency = 'EUR',
  onBack,
  onContinue,
}) => {
  const { language } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8 mt-12">
        <h2 className="text-2xl font-semibold mb-2">
          {language === "de" ? "Bestellübersicht" : language === "tr" ? "Sipariş Özeti" : "Order Summary"}
        </h2>
        <p className="text-muted-foreground">
          {language === "de"
            ? "Bitte überprüfen Sie Ihre Bestelldetails"
            : language === "tr"
            ? "Lütfen sipariş detaylarınızı kontrol edin"
            : "Please review your order details"}
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>
              {language === "de" ? "Bestellübersicht" : language === "tr" ? "Sipariş Özeti" : "Order Summary"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{selectedMemberName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                <span>{selectedDate?.toLocaleDateString(language === "tr" ? "tr-TR" : "de-DE")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{selectedTime}</span>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {language === "de" ? "Beratungsgebühr" : language === "tr" ? "Danışmanlık Ücreti" : "Consultation Fee"}
                </span>
                <span className="font-semibold text-lg flex items-center gap-1">
                  <Euro className="w-4 h-4" />
                  {consultationPrice?.toFixed(2) || '50.00'}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  {language === "de" ? "Gesamt" : language === "tr" ? "Toplam" : "Total"}
                </span>
                <span className="font-bold text-xl text-primary flex items-center gap-1">
                  <Euro className="w-5 h-5" />
                  {consultationPrice?.toFixed(2) || '50.00'}
                </span>
              </div>
            </div>
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={onBack}
                className="flex-1"
              >
                {language === "de" ? "Zurück" : language === "tr" ? "Geri" : "Back"}
              </Button>
              <Button
                type="button"
                size="lg"
                onClick={onContinue}
                className="flex-1"
              >
                {language === "de" ? "Zur Zahlung" : language === "tr" ? "Ödemeye Geç" : "Proceed to Payment"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

