import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { CreditCard, Lock, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../contexts/language-context';
import { CreditCardDisplay } from '../../components/CreditCardDisplay';
import '../../components/CreditCardDisplay.css';
import { paymentService, authService, clientService } from '../../ApiServices/services';
import { toast } from 'sonner';

const CVBuilderPayment: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const amount = Number(searchParams.get('amount')) || 20;
  const currency = 'EUR';

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  const [processing, setProcessing] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomerInfo();
  }, []);

  const loadCustomerInfo = async () => {
    try {
      setLoading(true);
      const currentUser = await authService.getCurrentUser(false);
      if (currentUser) {
        try {
          const clientResponse: any = await clientService.getClientByUserId(currentUser.id);
          const clientData = clientResponse?.data || clientResponse;
          if (clientData) {
            setCustomerInfo({
              name: `${clientData.firstName || ''} ${clientData.lastName || ''}`.trim() || currentUser.email || '',
              email: clientData.email || currentUser.email || '',
              phone: clientData.phone || '',
            });
          } else {
            setCustomerInfo({
              name: currentUser.email || '',
              email: currentUser.email || '',
              phone: '',
            });
          }
        } catch {
          setCustomerInfo({
            name: currentUser.email || '',
            email: currentUser.email || '',
            phone: '',
          });
        }
      }
    } catch (error) {
      console.error('Müşteri bilgisi yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

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
        amount: amount,
        currency: currency,
        type: 'CVBuilder',
        method: 'CreditCard',
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        cardHolder: paymentData.cardHolder,
        cardNumber: cardNumber,
        expireMonth: month || '',
        expireYear: fullYear,
        cvc: paymentData.cvv,
      });

      // Check payment status
      if (payment.status === 'Failed' || payment.status === 'failed') {
        const errorMessage = payment.iyzicoErrorMessage || 'Ödeme başarısız oldu';
        toast.error(errorMessage);
        setProcessing(false);
        return;
      }

      if (payment.status === 'Success' || payment.status === 'success' || payment.status === 'Completed' || payment.status === 'completed') {
        toast.success('Ödeme başarıyla tamamlandı!');
        // Navigate to CV Builder with paymentId
        navigate(`/client/cv-builder?paymentId=${payment.id}`);
      } else {
        toast.error('Ödeme beklenmedik bir durumda: ' + payment.status);
        setProcessing(false);
      }
    } catch (error: any) {
      console.error('Ödeme işleme hatası:', error);
      toast.error(error.message || 'Ödeme işlenirken hata oluştu');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <button
          onClick={() => navigate('/client/documents')}
          className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
        >
          Belgeler
        </button>
        <span className="text-gray-500 dark:text-gray-400">/</span>
        <span className="text-gray-900 dark:text-white font-medium">CV Oluştur - Ödeme</span>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        {/* Order Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>CV Oluştur - Ödeme</CardTitle>
            <CardDescription>ATS Uyumlu CV Oluşturma Hizmeti</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold">CV Builder - ATS Uyumlu CV Oluşturma</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Profesyonel CV oluşturun ve ATS sistemlerine uyumlu hale getirin
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {amount.toFixed(2)} {currency}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <div className="relative">
          {/* Credit Card Display */}
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
          
          {/* Payment Form */}
          <div className="w-full relative z-0 -mt-[140px]">
            <Card className="card-form-wrapper pt-[160px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Ödeme Bilgileri
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-xs">
                  <Lock className="w-3 h-3" />
                  Ödeme bilgileriniz güvenli bir şekilde şifrelenmiştir
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Kart Numarası *</Label>
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
                      Test kartı: 5528 7900 0000 0005
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardHolder">Kart Sahibi *</Label>
                    <Input
                      id="cardHolder"
                      required
                      value={paymentData.cardHolder}
                      onChange={(e) => setPaymentData({ ...paymentData, cardHolder: e.target.value.toUpperCase() })}
                      placeholder="AHMET YILMAZ"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Son Kullanma *</Label>
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV *</Label>
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
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Lock className="w-3 h-3" />
                      <span>Bu ödeme güvenli bir ödeme sağlayıcı tarafından işlenmektedir</span>
                    </div>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => navigate('/client/documents')}
                        className="flex-1"
                        disabled={processing}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Geri
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
                            İşleniyor...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Ödemeyi Tamamla ({amount.toFixed(2)} {currency})
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

export default CVBuilderPayment;

