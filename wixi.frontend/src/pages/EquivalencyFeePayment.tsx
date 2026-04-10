import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { CreditCard, Lock, ArrowLeft, Info, CheckCircle2, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/language-context';
import { CreditCardDisplay } from '../components/CreditCardDisplay';
import '../components/CreditCardDisplay.css';
import { paymentService, authService, clientService, applicationService, equivalencyFeeSettingsService } from '../ApiServices/services';
import { toast } from 'sonner';
import type { EquivalencyFeeSettingsDto } from '../ApiServices/services/EquivalencyFeeSettingsService';

const EquivalencyFeePayment: React.FC = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [settings, setSettings] = useState<EquivalencyFeeSettingsDto | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  
  const amount = settings?.amount || 200; // Denklik ücreti tutarı (EUR)
  const currency = settings?.currency || 'EUR';

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
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setSettingsLoading(true);
      const data = await equivalencyFeeSettingsService.getPublicSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading equivalency fee settings:', error);
      // Don't show error to user, use defaults
    } finally {
      setSettingsLoading(false);
    }
  };

  const getField = (baseField: string, defaultValue: string = ''): string => {
    if (!settings) return defaultValue;
    const langField = language === 'tr' ? `${baseField}Tr` as keyof EquivalencyFeeSettingsDto :
                     language === 'de' ? `${baseField}De` as keyof EquivalencyFeeSettingsDto :
                     language === 'en' ? `${baseField}En` as keyof EquivalencyFeeSettingsDto :
                     `${baseField}Ar` as keyof EquivalencyFeeSettingsDto;
    const value = settings[langField];
    if (typeof value === 'string') return value || defaultValue;
    // Fallback to Turkish if other language is empty
    if (language !== 'tr') {
      const trValue = settings[`${baseField}Tr` as keyof EquivalencyFeeSettingsDto];
      if (typeof trValue === 'string' && trValue) return trValue;
    }
    return defaultValue;
  };

  const getListField = (baseField: 'whyProcessItems' | 'feeScopeItems', defaultValue: string[] = []): string[] => {
    if (!settings) return defaultValue;
    const langField = language === 'tr' ? `${baseField}Tr` :
                     language === 'de' ? `${baseField}De` :
                     language === 'en' ? `${baseField}En` :
                     `${baseField}Ar`;
    const value = settings[langField as keyof EquivalencyFeeSettingsDto];
    if (Array.isArray(value) && value.length > 0) return value;
    // Fallback to Turkish if other language is empty
    if (language !== 'tr') {
      const trValue = settings[`${baseField}Tr` as keyof EquivalencyFeeSettingsDto];
      if (Array.isArray(trValue) && trValue.length > 0) return trValue;
    }
    return defaultValue;
  };

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

  const updateEquivalencySubSteps = async () => {
    try {
      // Get current user and client
      const currentUser = await authService.getCurrentUser(false);
      if (!currentUser) {
        console.warn('Kullanıcı bilgisi bulunamadı');
        return;
      }

      // Get client data
      const clientResponse: any = await clientService.getClientByUserId(currentUser.id);
      const clientData = clientResponse?.data || clientResponse;
      if (!clientData || !clientData.id) {
        console.warn('Client bilgisi bulunamadı');
        return;
      }

      // Get client applications
      const applications = await applicationService.getClientApplications(clientData.id);
      if (!applications || applications.length === 0) {
        console.warn('Application bulunamadı');
        return;
      }

      // Find the first application (usually there's only one active)
      const application = applications[0];
      if (!application.steps || application.steps.length === 0) {
        console.warn('Application step\'leri bulunamadı');
        return;
      }

      // Find "Denklik İşlemleri" step
      const equivalencyStep = application.steps.find((step: any) => {
        const stepName = (step.name || step.title || '').toLowerCase();
        return stepName.includes('denklik') || stepName.includes('equivalency');
      });

      if (!equivalencyStep || !equivalencyStep.subSteps || equivalencyStep.subSteps.length === 0) {
        console.warn('Denklik İşlemleri step\'i veya sub-step\'leri bulunamadı');
        return;
      }

      // Find sub-steps by name
      const paymentSubStep = equivalencyStep.subSteps.find((subStep: any) => {
        const subStepName = (subStep.name || '').toLowerCase();
        return subStepName.includes('harç') && subStepName.includes('ödeme');
      });

      const documentReadySubStep = equivalencyStep.subSteps.find((subStep: any) => {
        const subStepName = (subStep.name || '').toLowerCase();
        return subStepName.includes('belgesi') && subStepName.includes('hazır');
      });

      // Update 3. sub-step (Denklik Harç Ödemesi Yapıldı) to Completed
      if (paymentSubStep) {
        await applicationService.updateSubStepStatus(paymentSubStep.id, {
          status: 'Completed',
          notes: 'Denklik ücreti ödemesi başarıyla tamamlandı'
        });
        console.log('Denklik Harç Ödemesi sub-step tamamlandı');
      }

      // Update 4. sub-step (Denklik Belgesi Hazır) to InProgress
      if (documentReadySubStep) {
        await applicationService.updateSubStepStatus(documentReadySubStep.id, {
          status: 'InProgress',
          notes: 'Denklik belgesi hazırlama süreci başlatıldı'
        });
        console.log('Denklik Belgesi Hazır sub-step başlatıldı');
      }

      toast.success('Başvuru aşamaları güncellendi');
    } catch (error: any) {
      console.error('Sub-step güncelleme hatası:', error);
      // Don't show error toast to user, just log it
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
        type: 'EquivalencyFee',
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
        toast.success('Denklik ücreti ödemesi başarıyla tamamlandı!');
        
        // Update application sub-steps automatically
        try {
          await updateEquivalencySubSteps();
        } catch (updateError) {
          console.error('Sub-step güncelleme hatası:', updateError);
          // Don't block navigation if update fails
        }
        
        // Navigate back to dashboard
        navigate('/client/dashboard');
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
    <div className="flex flex-col w-full">
      <div className="max-w-6xl mx-auto w-full">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto mb-8 grid-cols-2">
              <TabsTrigger value="description" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {language === 'tr' ? 'Açıklama' : language === 'de' ? 'Beschreibung' : language === 'en' ? 'Description' : 'الوصف'}
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                {language === 'tr' ? 'Ödeme' : language === 'de' ? 'Zahlung' : language === 'en' ? 'Payment' : 'الدفع'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-6">
              {/* Information Section */}
              {!settingsLoading && (
                <Card className="border-l-4 border-l-blue-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="w-6 h-6 text-blue-600" />
                      {getField('whyPayTitle', 'Denklik Ücreti Neden Ödenir?')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                      <p className="text-base leading-relaxed">
                        {getField('whyPayDescription', 'Denklik ücreti, yurtdışında alınan eğitim belgelerinizin Türkiye\'deki eğitim sistemine denkliğinin resmi olarak tanınması için ödenen bir ücrettir.')}
                      </p>
                      
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {getField('whyProcessTitle', 'Denklik İşlemi Neden Gereklidir?')}
                        </h3>
                        <ul className="space-y-2 list-disc list-inside">
                          {getListField('whyProcessItems', [
                            'Yurtdışında alınan diplomaların Türkiye\'de geçerli olması için resmi denklik belgesi gereklidir',
                            'İş başvurularında ve eğitim kurumlarında diploma denkliği talep edilir',
                            'Kamu kurumlarında çalışmak için denklik belgesi zorunludur',
                            'Yükseköğretim kurumlarına başvuru yaparken denklik belgesi istenir'
                          ]).map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-3 mt-6">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {getField('feeScopeTitle', 'Denklik Ücreti Kapsamı')}
                        </h3>
                        <ul className="space-y-2">
                          {getListField('feeScopeItems', [
                            'Belgelerinizin incelenmesi ve değerlendirilmesi',
                            'Resmi denklik belgesinin hazırlanması',
                            'İşlem takibi ve danışmanlık hizmeti',
                            'Gerekli kurumlarla iletişim ve koordinasyon'
                          ]).map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {getField('note') && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Not:</strong> {getField('note')}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="payment" className="space-y-6">
              {/* Order Summary */}
              {!settingsLoading && (
                <Card>
                  <CardHeader>
                    <CardTitle>{getField('paymentSummaryTitle', 'Denklik Ücreti Ödemesi')}</CardTitle>
                    <CardDescription>{getField('paymentSummaryDescription', 'Eğitim Denkliği İşlem Ücreti')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-semibold">{getField('paymentSummaryTitle', 'Denklik İşlem Ücreti')}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {getField('feeItemDescription', 'Yurtdışı eğitim belgelerinizin denklik işlemi için ücret')}
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
              )}

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
                        {language === 'tr' ? 'Ödeme Bilgileri' : language === 'de' ? 'Zahlungsinformationen' : language === 'en' ? 'Payment Information' : 'معلومات الدفع'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 text-xs">
                        <Lock className="w-3 h-3" />
                        {language === 'tr' ? 'Ödeme bilgileriniz güvenli bir şekilde şifrelenmiştir' : language === 'de' ? 'Ihre Zahlungsinformationen sind sicher verschlüsselt' : language === 'en' ? 'Your payment information is securely encrypted' : 'معلومات الدفع الخاصة بك مشفرة بشكل آمن'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">
                            {language === 'tr' ? 'Kart Numarası *' : language === 'de' ? 'Kartennummer *' : language === 'en' ? 'Card Number *' : 'رقم البطاقة *'}
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
                            {language === 'tr' ? 'Test kartı: 5528 7900 0000 0005' : language === 'de' ? 'Testkarte: 5528 7900 0000 0005' : language === 'en' ? 'Test card: 5528 7900 0000 0005' : 'بطاقة اختبار: 5528 7900 0000 0005'}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cardHolder">
                            {language === 'tr' ? 'Kart Sahibi *' : language === 'de' ? 'Karteninhaber *' : language === 'en' ? 'Card Holder *' : 'صاحب البطاقة *'}
                          </Label>
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
                            <Label htmlFor="expiryDate">
                              {language === 'tr' ? 'Son Kullanma *' : language === 'de' ? 'Ablaufdatum *' : language === 'en' ? 'Expiry Date *' : 'تاريخ الانتهاء *'}
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
                            <span>
                              {language === 'tr' ? 'Bu ödeme güvenli bir ödeme sağlayıcı tarafından işlenmektedir' : language === 'de' ? 'Diese Zahlung wird von einem sicheren Zahlungsanbieter verarbeitet' : language === 'en' ? 'This payment is processed by a secure payment provider' : 'يتم معالجة هذه الدفعة بواسطة مزود دفع آمن'}
                            </span>
                          </div>
                          <div className="flex gap-4">
                            <Button
                              type="button"
                              variant="outline"
                              size="lg"
                              onClick={() => navigate('/client/dashboard')}
                              className="flex-1"
                              disabled={processing}
                            >
                              <ArrowLeft className="w-4 h-4 mr-2" />
                              {language === 'tr' ? 'Geri' : language === 'de' ? 'Zurück' : language === 'en' ? 'Back' : 'رجوع'}
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
                                  {language === 'tr' ? 'İşleniyor...' : language === 'de' ? 'Wird verarbeitet...' : language === 'en' ? 'Processing...' : 'جاري المعالجة...'}
                                </>
                              ) : (
                                <>
                                  <Lock className="w-4 h-4 mr-2" />
                                  {language === 'tr' ? `Ödemeyi Tamamla (${amount.toFixed(2)} ${currency})` : language === 'de' ? `Zahlung abschließen (${amount.toFixed(2)} ${currency})` : language === 'en' ? `Complete Payment (${amount.toFixed(2)} ${currency})` : `إتمام الدفع (${amount.toFixed(2)} ${currency})`}
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
            </TabsContent>
          </Tabs>
        </div>
    </div>
  );
};

export default EquivalencyFeePayment;

