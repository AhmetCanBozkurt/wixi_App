import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { CreditCard, Lock } from 'lucide-react';
import { useLanguage } from '../contexts/language-context';
import { CreditCardDisplay } from './CreditCardDisplay';
import './CreditCardDisplay.css';
import { paymentService } from '../ApiServices/services/PaymentService';
import { toast } from 'sonner';

interface PaymentFormProps {
  selectedMemberName?: string;
  selectedDate?: Date;
  selectedTime?: string | null;
  consultationPrice?: number;
  consultationCurrency?: string;
  appointmentId?: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onBack: () => void;
  onPaymentComplete: (paymentId?: number) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  selectedMemberName,
  selectedDate,
  selectedTime,
  consultationPrice,
  consultationCurrency = 'EUR',
  appointmentId,
  customerName,
  customerEmail,
  customerPhone,
  onBack,
  onPaymentComplete,
}) => {
  const { language } = useLanguage();
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });
  const [processing, setProcessing] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    try {
      // Parse expiry date
      const [month, year] = paymentData.expiryDate.split('/');
      const fullYear = year ? `20${year}` : '';
      
      // Remove spaces from card number
      const cardNumber = paymentData.cardNumber.replace(/\s/g, '');
      
      // Create payment
      const payment = await paymentService.createPayment({
        amount: consultationPrice || 50,
        currency: consultationCurrency,
        type: 'Appointment',
        method: 'CreditCard',
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        cardHolder: paymentData.cardHolder,
        cardNumber: cardNumber,
        expireMonth: month || '',
        expireYear: fullYear,
        cvc: paymentData.cvv,
        appointmentId: appointmentId,
        relatedEntityType: 'Appointment',
        relatedEntityId: appointmentId,
      });

      // Check payment status even if no exception was thrown
      if (payment.status === 'Failed' || payment.status === 'failed') {
        const errorMessage = payment.iyzicoErrorMessage || 
          (language === "de" 
            ? "Zahlung fehlgeschlagen"
            : language === "tr"
            ? "Ödeme başarısız oldu"
            : "Payment failed");
        toast.error(errorMessage);
        setProcessing(false);
        return;
      }

      toast.success(
        language === "de" 
          ? "Zahlung erfolgreich verarbeitet"
          : language === "tr"
          ? "Ödeme başarıyla işlendi"
          : "Payment processed successfully"
      );
      
      onPaymentComplete(payment.id);
    } catch (error: any) {
      console.error('Error processing payment:', error);
      
      // Extract detailed error message
      let errorMessage = error.message || 
        (language === "de" 
          ? "Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut."
          : language === "tr"
          ? "Ödeme başarısız oldu. Lütfen tekrar deneyin."
          : "Payment failed. Please try again.");
      
      // Show detailed error message
      toast.error(errorMessage, {
        duration: 5000, // Show for 5 seconds
      });
      
      setProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const getExpiryMonth = () => {
    return paymentData.expiryDate.split('/')[0] || '';
  };

  const getExpiryYear = () => {
    return paymentData.expiryDate.split('/')[1] || '';
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8 mt-12">
        <h2 className="text-2xl font-semibold mb-2">
          {language === "de" ? "Zahlung" : language === "tr" ? "Ödeme" : "Payment"}
        </h2>
        <p className="text-muted-foreground">
          {language === "de"
            ? "Bitte geben Sie Ihre Zahlungsinformationen ein"
            : language === "tr"
            ? "Lütfen ödeme bilgilerinizi girin"
            : "Please enter your payment information"}
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Payment Form with Credit Card */}
        <div className="relative">
          {/* Credit Card Display - Top, overlapping form */}
          <div className="flex justify-center mb-0 relative z-10">
            <div className="w-full max-w-[340px]">
              <CreditCardDisplay
                cardNumber={paymentData.cardNumber}
                cardHolder={paymentData.cardHolder}
                expiryMonth={getExpiryMonth()}
                expiryYear={getExpiryYear()}
                cvv={paymentData.cvv}
                isFlipped={isCardFlipped}
              />
            </div>
          </div>
          
          {/* Payment Form - Bottom, half overlapping with card */}
          <div className="w-full relative z-0 -mt-[140px]">
            <Card className="card-form-wrapper pt-[160px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                {language === "de" ? "Zahlungsinformationen" : language === "tr" ? "Ödeme Bilgileri" : "Payment Information"}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 text-xs">
                <Lock className="w-3 h-3" />
                {language === "de"
                  ? "Ihre Zahlungsinformationen sind sicher verschlüsselt"
                  : language === "tr"
                  ? "Ödeme bilgileriniz güvenli bir şekilde şifrelenmiştir"
                  : "Your payment information is securely encrypted"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">
                    {language === "de" ? "Kartnummer" : language === "tr" ? "Kart Numarası" : "Card Number"} *
                  </Label>
                  <Input
                    id="cardNumber"
                    required
                    maxLength={19}
                    value={paymentData.cardNumber}
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value);
                      setPaymentData({ ...paymentData, cardNumber: formatted });
                    }}
                    placeholder="5528 7900 0000 0005"
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === "de" 
                      ? "Testkarte: 5528 7900 0000 0005"
                      : language === "tr"
                      ? "Test kartı: 5528 7900 0000 0005"
                      : "Test card: 5528 7900 0000 0005"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardHolder">
                    {language === "de" ? "Karteninhaber" : language === "tr" ? "Kart Sahibi" : "Card Holder"} *
                  </Label>
                  <Input
                    id="cardHolder"
                    required
                    value={paymentData.cardHolder}
                    onChange={(e) => setPaymentData({ ...paymentData, cardHolder: e.target.value.toUpperCase() })}
                    placeholder={language === "de" ? "MAX MUSTERMANN" : language === "tr" ? "AHMET YILMAZ" : "JOHN DOE"}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === "de" 
                      ? "Test: Beliebiger Name"
                      : language === "tr"
                      ? "Test: Herhangi bir isim"
                      : "Test: Any name"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">
                      {language === "de" ? "Ablaufdatum" : language === "tr" ? "Son Kullanma" : "Expiry Date"} *
                    </Label>
                    <Input
                      id="expiryDate"
                      required
                      maxLength={5}
                      value={paymentData.expiryDate}
                      onChange={(e) => {
                        const formatted = formatExpiryDate(e.target.value);
                        setPaymentData({ ...paymentData, expiryDate: formatted });
                      }}
                      placeholder="12/30"
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === "de" 
                        ? "Test: 12/30"
                        : language === "tr"
                        ? "Test: 12/30"
                        : "Test: 12/30"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvv">
                      CVV *
                    </Label>
                    <Input
                      id="cvv"
                      type="password"
                      required
                      maxLength={4}
                      value={paymentData.cvv}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                        setPaymentData({ ...paymentData, cvv: v });
                      }}
                      onFocus={() => setIsCardFlipped(true)}
                      onBlur={() => setIsCardFlipped(false)}
                      placeholder="123"
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === "de" 
                        ? "Test: 123"
                        : language === "tr"
                        ? "Test: 123"
                        : "Test: 123"}
                    </p>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="w-3 h-3" />
                    <span>
                      {language === "de"
                        ? "Diese Zahlung wird von einem sicheren Zahlungsanbieter verarbeitet"
                        : language === "tr"
                        ? "Bu ödeme güvenli bir ödeme sağlayıcı tarafından işlenmektedir"
                        : "This payment is processed by a secure payment provider"}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={onBack}
                      className="flex-1"
                      disabled={processing}
                    >
                      {language === "de" ? "Zurück" : language === "tr" ? "Geri" : "Back"}
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      className="flex-1"
                      disabled={processing || !paymentData.cardNumber || !paymentData.cardHolder || !paymentData.expiryDate || !paymentData.cvv}
                    >
                      {processing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {language === "de" ? "Wird verarbeitet..." : language === "tr" ? "İşleniyor..." : "Processing..."}
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          {language === "de" ? "Zahlung abschicken" : language === "tr" ? "Ödemeyi Tamamla" : "Complete Payment"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

