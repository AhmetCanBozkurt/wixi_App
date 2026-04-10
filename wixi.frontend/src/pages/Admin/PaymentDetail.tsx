import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  CreditCard,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Copy,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { paymentService, type IPaymentDto } from '../../ApiServices/services/PaymentService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';

const PaymentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<IPaymentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [processingRefund, setProcessingRefund] = useState(false);

  useEffect(() => {
    if (id) {
      loadPayment();
    }
  }, [id]);

  const loadPayment = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getPayment(Number(id));
      setPayment(data);
    } catch (error: any) {
      console.error('Error loading payment:', error);
      toast.error(error.message || 'Ödeme yüklenirken hata oluştu');
      navigate('/admin/payments');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!payment || !refundAmount) {
      toast.error('İade tutarı giriniz');
      return;
    }

    try {
      setProcessingRefund(true);
      const amount = parseFloat(refundAmount);
      
      const { TokenService } = await import('../../ApiServices/services/TokenService');
      const token = await TokenService.getInstance().getToken();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5114'}/api/v1.0/payments/${payment.id}/refund?amount=${amount}&reason=${encodeURIComponent(refundReason || 'Admin iadesi')}`,
        {
          method: 'POST',
          headers,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'İade işlemi başarısız oldu');
      }

      toast.success('İade işlemi başarıyla tamamlandı');
      setRefundDialogOpen(false);
      setRefundAmount('');
      setRefundReason('');
      loadPayment(); // Reload payment data
    } catch (error: any) {
      console.error('Error processing refund:', error);
      toast.error(error.message || 'İade işlemi başarısız oldu');
    } finally {
      setProcessingRefund(false);
    }
  };

  const handleCancel = async () => {
    if (!payment) return;

    try {
      const { TokenService } = await import('../../ApiServices/services/TokenService');
      const token = await TokenService.getInstance().getToken();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5114'}/api/v1.0/payments/${payment.id}/cancel?reason=Admin iptali`,
        {
          method: 'POST',
          headers,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'İptal işlemi başarısız oldu');
      }

      toast.success('Ödeme başarıyla iptal edildi');
      loadPayment();
    } catch (error: any) {
      console.error('Error cancelling payment:', error);
      toast.error(error.message || 'İptal işlemi başarısız oldu');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Kopyalandı');
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Başarılı</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600"><Clock className="w-3 h-3 mr-1" />Beklemede</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Başarısız</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="border-gray-500 text-gray-600"><AlertCircle className="w-3 h-3 mr-1" />İptal</Badge>;
      case 'refunded':
        return <Badge variant="outline" className="border-blue-500 text-blue-600"><RefreshCw className="w-3 h-3 mr-1" />İade</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    const symbol = currency === 'EUR' ? '€' : currency === 'TRY' ? '₺' : currency === 'USD' ? '$' : currency;
    return `${symbol}${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Ödeme bulunamadı</p>
              <Button onClick={() => navigate('/admin/payments')} className="mt-4">
                Geri Dön
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/payments')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Ödeme Detayı</h1>
            <p className="text-muted-foreground mt-1">
              Ödeme No: {payment.paymentNumber}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {payment.status.toLowerCase() === 'completed' && (
            <>
              <Button
                variant="outline"
                onClick={() => setRefundDialogOpen(true)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                İade Et
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
              >
                İptal Et
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status and Amount Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Durum</p>
                <div className="mt-2">{getStatusBadge(payment.status)}</div>
              </div>
              <CreditCard className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Tutar</p>
              <p className="text-2xl font-bold mt-2">
                {formatAmount(payment.amount, payment.currency)}
              </p>
              {payment.exchangeRate && (
                <p className="text-sm text-muted-foreground mt-1">
                  ≈ {formatAmount(payment.paidAmount, 'TRY')} (Kur: {payment.exchangeRate})
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Ödenen Tutar</p>
              <p className="text-2xl font-bold mt-2 text-green-600">
                {formatAmount(payment.paidAmount, payment.currency)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bilgiler</TabsTrigger>
          <TabsTrigger value="customer">Müşteri Bilgileri</TabsTrigger>
          <TabsTrigger value="transactions">İşlem Geçmişi</TabsTrigger>
          <TabsTrigger value="refunds">İadeler</TabsTrigger>
          <TabsTrigger value="items">Öğeler</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Ödeme Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ödeme No:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{payment.paymentNumber}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(payment.paymentNumber)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ödeme Sağlayıcı:</span>
                  <span>{payment.paymentProvider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Iyzico Payment ID:</span>
                  <div className="flex items-center gap-2">
                    {payment.iyzicoPaymentId ? (
                      <>
                        <span className="font-mono text-sm">{payment.iyzicoPaymentId}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(payment.iyzicoPaymentId!)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Conversation ID:</span>
                  <div className="flex items-center gap-2">
                    {payment.iyzicoConversationId ? (
                      <>
                        <span className="font-mono text-sm">{payment.iyzicoConversationId.substring(0, 20)}...</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(payment.iyzicoConversationId!)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Iyzico Durum:</span>
                  <Badge variant="outline">{payment.iyzicoStatus || '-'}</Badge>
                </div>
                {payment.iyzicoErrorCode && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hata Kodu:</span>
                    <Badge variant="destructive">{payment.iyzicoErrorCode}</Badge>
                  </div>
                )}
                {payment.iyzicoErrorMessage && (
                  <div>
                    <span className="text-muted-foreground">Hata Mesajı:</span>
                    <p className="text-sm text-red-600 mt-1">{payment.iyzicoErrorMessage}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tarih Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Oluşturulma:</span>
                  <span>{new Date(payment.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {payment.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ödeme Tarihi:</span>
                    <span>{new Date(payment.paidAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
                {payment.cancelledAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">İptal Tarihi:</span>
                    <span>{new Date(payment.cancelledAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
                {payment.refundedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">İade Tarihi:</span>
                    <span>{new Date(payment.refundedAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
                {payment.expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Son Geçerlilik:</span>
                    <span>{new Date(payment.expiresAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kart Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {payment.cardLastFourDigits ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Son 4 Hanesi:</span>
                      <span className="font-mono">**** {payment.cardLastFourDigits}</span>
                    </div>
                    {payment.cardBrand && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kart Markası:</span>
                        <span>{payment.cardBrand}</span>
                      </div>
                    )}
                    {payment.cardType && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kart Tipi:</span>
                        <span>{payment.cardType}</span>
                      </div>
                    )}
                    {payment.cardHolderName && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kart Sahibi:</span>
                        <span>{payment.cardHolderName}</span>
                      </div>
                    )}
                    {payment.isInstallment && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Taksit:</span>
                        <span>{payment.installmentCount}x</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">Kart bilgisi bulunamadı</p>
                )}
              </CardContent>
            </Card>

            {payment.appointmentId && (
              <Card>
                <CardHeader>
                  <CardTitle>İlişkili Randevu</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="link"
                    onClick={() => navigate(`/admin/appointments-list`)}
                  >
                    Randevu #{payment.appointmentId} <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Customer Tab */}
        <TabsContent value="customer">
          <Card>
            <CardHeader>
              <CardTitle>Müşteri Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ad Soyad</p>
                    <p className="font-medium">{payment.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">E-posta</p>
                    <p className="font-medium">{payment.customerEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Telefon</p>
                    <p className="font-medium">{payment.customerPhone}</p>
                  </div>
                </div>
                {payment.customerIdentityNumber && (
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">TC Kimlik No</p>
                      <p className="font-mono">{payment.customerIdentityNumber}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>İşlem Geçmişi</CardTitle>
            </CardHeader>
            <CardContent>
              {payment.transactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">İşlem geçmişi bulunamadı</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Tip</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Hata</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payment.transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-mono text-sm">
                          {transaction.transactionId}
                        </TableCell>
                        <TableCell>{transaction.type}</TableCell>
                        <TableCell>
                          {transaction.status.toLowerCase() === 'success' ? (
                            <Badge className="bg-green-500">Başarılı</Badge>
                          ) : transaction.status.toLowerCase() === 'failed' ? (
                            <Badge variant="destructive">Başarısız</Badge>
                          ) : (
                            <Badge variant="outline">Beklemede</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatAmount(transaction.amount, transaction.currency)}
                        </TableCell>
                        <TableCell>
                          <div>{new Date(transaction.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                          {transaction.completedAt && (
                            <div className="text-xs text-muted-foreground">
                              Tamamlandı: {new Date(transaction.completedAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {transaction.errorCode && (
                            <div>
                              <Badge variant="destructive" className="text-xs">
                                {transaction.errorCode}
                              </Badge>
                              {transaction.errorMessage && (
                                <p className="text-xs text-red-600 mt-1">
                                  {transaction.errorMessage}
                                </p>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Refunds Tab */}
        <TabsContent value="refunds">
          <Card>
            <CardHeader>
              <CardTitle>İade İşlemleri</CardTitle>
            </CardHeader>
            <CardContent>
              {payment.refunds.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">İade işlemi bulunamadı</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>İade No</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Sebep</TableHead>
                      <TableHead>Tarih</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payment.refunds.map((refund) => (
                      <TableRow key={refund.id}>
                        <TableCell className="font-mono text-sm">
                          {refund.refundNumber}
                        </TableCell>
                        <TableCell>
                          {formatAmount(refund.amount, refund.currency)}
                        </TableCell>
                        <TableCell>
                          {refund.status.toLowerCase() === 'completed' ? (
                            <Badge className="bg-green-500">Tamamlandı</Badge>
                          ) : refund.status.toLowerCase() === 'failed' ? (
                            <Badge variant="destructive">Başarısız</Badge>
                          ) : (
                            <Badge variant="outline">Beklemede</Badge>
                          )}
                        </TableCell>
                        <TableCell>{refund.reason || '-'}</TableCell>
                        <TableCell>
                          <div>{new Date(refund.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                          {refund.completedAt && (
                            <div className="text-xs text-muted-foreground">
                              Tamamlandı: {new Date(refund.completedAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Ödeme Öğeleri</CardTitle>
            </CardHeader>
            <CardContent>
              {payment.items.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Öğe bulunamadı</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ad</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead>Adet</TableHead>
                      <TableHead>Birim Fiyat</TableHead>
                      <TableHead>Toplam</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payment.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.description || '-'}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          {formatAmount(item.unitPrice, payment.currency)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatAmount(item.totalPrice, payment.currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İade İşlemi</DialogTitle>
            <DialogDescription>
              Ödeme için iade işlemi yapın. Maksimum iade tutarı: {formatAmount(payment.paidAmount, payment.currency)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="refundAmount">İade Tutarı *</Label>
              <Input
                id="refundAmount"
                type="number"
                step="0.01"
                max={payment.paidAmount}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="refundReason">İade Sebebi</Label>
              <Textarea
                id="refundReason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="İade sebebini giriniz..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRefundDialogOpen(false);
                setRefundAmount('');
                setRefundReason('');
              }}
            >
              İptal
            </Button>
            <Button
              onClick={handleRefund}
              disabled={processingRefund || !refundAmount}
            >
              {processingRefund ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                'İade Et'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentDetail;

