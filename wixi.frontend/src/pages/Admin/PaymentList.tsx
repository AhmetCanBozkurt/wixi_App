import React, { useState, useEffect, useMemo } from 'react';
import { CreditCard, CheckCircle2, XCircle, Clock, AlertCircle, User, Mail, Phone, Calendar, Download } from 'lucide-react';
import { toast } from 'sonner';
import { paymentService, type IPaymentDto } from '../../ApiServices/services/PaymentService';
import { tablePreferenceService } from '../../ApiServices/services';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { DataTable, type ColumnDef, type TablePreferenceState } from '../../components/ui/DataTable';
import type { TablePreferenceDto } from '../../ApiServices/types/TablePreferenceTypes';
import { format } from 'date-fns';

const PAYMENT_TABLE_KEY = 'admin-payment-list';

const PaymentList: React.FC = () => {
  const [payments, setPayments] = useState<IPaymentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<IPaymentDto | null>(null);
  const [tablePreferences, setTablePreferences] = useState<TablePreferenceDto | null>(null);
  const [preferenceLoaded, setPreferenceLoaded] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const pref = await tablePreferenceService.getTablePreference(PAYMENT_TABLE_KEY);
        setTablePreferences(pref);
      } catch (error) {
        console.error('Payment table preferences could not be loaded:', error);
      } finally {
        setPreferenceLoaded(true);
      }
    };

    loadPreferences();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const result = await paymentService.getAllPayments({
        page: 1,
        pageSize: 1000,
      });
      setPayments(result.data || []);
    } catch (error: any) {
      console.error('Error loading payments:', error);
      toast.error(error.message || 'Ödemeler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="mr-1 w-3 h-3" /> Tamamlandı
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400">
            <Clock className="mr-1 w-3 h-3" /> Beklemede
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400">
            <XCircle className="mr-1 w-3 h-3" /> Başarısız
          </Badge>
        );
      case 'refunded':
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400">
            <AlertCircle className="mr-1 w-3 h-3" /> İade Edildi
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const columns: ColumnDef<IPaymentDto>[] = useMemo(
    () => [
      {
        id: 'paymentNumber',
        header: 'Ödeme No',
        headerKey: 'admin.payment.table.number',
        translations: {
          tr: 'Ödeme No',
          de: 'Zahlungsnr.',
          en: 'Payment No',
          ar: 'رقم الدفع',
        },
        accessorKey: 'paymentNumber',
        width: '150px',
        filterType: 'text',
        filterPlaceholder: 'Ödeme no ara',
        sortable: true,
        cell: (value) => (
          <div className="font-mono text-sm font-semibold">
            #{value}
          </div>
        ),
      },
      {
        id: 'createdAt',
        header: 'Tarih',
        headerKey: 'admin.payment.table.date',
        translations: {
          tr: 'Tarih',
          de: 'Datum',
          en: 'Date',
          ar: 'تاريخ',
        },
        accessorKey: 'createdAt',
        width: '180px',
        filterType: 'text',
        filterPlaceholder: 'Tarih ara',
        sortable: true,
        cell: (value) => (
          <div className="flex flex-col">
            <span className="text-sm">{format(new Date(value as string), 'dd.MM.yyyy')}</span>
            <span className="text-xs text-muted-foreground">{format(new Date(value as string), 'HH:mm')}</span>
          </div>
        ),
      },
      {
        id: 'customerName',
        header: 'Müşteri',
        headerKey: 'admin.payment.table.customer',
        translations: {
          tr: 'Müşteri',
          de: 'Kunde',
          en: 'Customer',
          ar: 'العميل',
        },
        accessorKey: 'customerName',
        width: '250px',
        filterType: 'text',
        filterPlaceholder: 'Müşteri ara',
        sortable: true,
        cell: (value, row) => (
          <div className="text-sm">
            <div className="flex items-center gap-2 font-medium">
              <User className="w-4 h-4 text-gray-400" />
              {value as string}
            </div>
            {row.customerEmail && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Mail className="w-3 h-3" />
                {row.customerEmail}
              </div>
            )}
            {row.customerPhone && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Phone className="w-3 h-3" />
                {row.customerPhone}
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'amount',
        header: 'Tutar',
        headerKey: 'admin.payment.table.amount',
        translations: {
          tr: 'Tutar',
          de: 'Betrag',
          en: 'Amount',
          ar: 'المبلغ',
        },
        accessorKey: 'amount',
        width: '180px',
        sortable: true,
        cell: (value, row) => (
          <div className="text-sm">
            <div className="font-bold text-lg">
              {formatCurrency(value as number, row.currency)}
            </div>
            {row.exchangeRate && row.exchangeRate !== 1 && (
              <div className="text-xs text-muted-foreground">
                Kur: {row.exchangeRate?.toFixed(4)}
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Durum',
        headerKey: 'admin.payment.table.status',
        translations: {
          tr: 'Durum',
          de: 'Status',
          en: 'Status',
          ar: 'الحالة',
        },
        accessorKey: 'status',
        width: '150px',
        filterType: 'list',
        filterOptions: [
          { label: 'Tamamlandı', value: 'completed' },
          { label: 'Beklemede', value: 'pending' },
          { label: 'Başarısız', value: 'failed' },
          { label: 'İade Edildi', value: 'refunded' },
        ],
        getFilterValue: (value) => String(value).toLowerCase(),
        sortable: true,
        cell: (value) => getStatusBadge(value as string),
      },
      {
        id: 'method',
        header: 'Ödeme Yöntemi',
        headerKey: 'admin.payment.table.method',
        translations: {
          tr: 'Ödeme Yöntemi',
          de: 'Zahlungsmethode',
          en: 'Payment Method',
          ar: 'طريقة الدفع',
        },
        accessorKey: 'method',
        width: '150px',
        filterType: 'list',
        filterOptions: [
          { label: 'Kredi Kartı', value: 'creditcard' },
          { label: 'Banka Transferi', value: 'banktransfer' },
          { label: 'PayPal', value: 'paypal' },
          { label: 'Nakit', value: 'cash' },
        ],
        getFilterValue: (value) => String(value).toLowerCase(),
        sortable: true,
        cell: (value) => {
          const method = String(value).toLowerCase();
          let icon = <CreditCard className="w-4 h-4" />;
          let label = value as string;

          if (method.includes('credit')) {
            icon = <CreditCard className="w-4 h-4" />;
            label = 'Kredi Kartı';
          } else if (method.includes('bank')) {
            icon = <Download className="w-4 h-4" />;
            label = 'Banka Transferi';
          } else if (method.includes('paypal')) {
            icon = <Mail className="w-4 h-4" />;
            label = 'PayPal';
          } else if (method.includes('cash')) {
            icon = <AlertCircle className="w-4 h-4" />;
            label = 'Nakit';
          }

          return (
            <Badge variant="secondary" className="flex items-center gap-1 w-fit">
              {icon}
              {label}
            </Badge>
          );
        },
      },
      {
        id: 'iyzicoPaymentId',
        header: 'Iyzico ID',
        headerKey: 'admin.payment.table.iyzicoId',
        translations: {
          tr: 'Iyzico ID',
          de: 'Iyzico ID',
          en: 'Iyzico ID',
          ar: 'معرف Iyzico',
        },
        accessorKey: 'iyzicoPaymentId',
        width: '200px',
        filterType: 'text',
        filterPlaceholder: 'Iyzico ID ara',
        sortable: true,
        cell: (value) => (
          value ? (
            <div className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border border-gray-300 dark:border-gray-700 truncate max-w-[180px]" title={value as string}>
              {value as string}
            </div>
          ) : (
            <span className="text-muted-foreground text-xs">-</span>
          )
        ),
      },
    ],
    []
  );

  const stats = useMemo(() => {
    const completed = payments.filter(p => p.status?.toLowerCase() === 'completed');
    const pending = payments.filter(p => p.status?.toLowerCase() === 'pending');
    const failed = payments.filter(p => p.status?.toLowerCase() === 'failed');
    const totalAmount = completed.reduce((sum, p) => sum + (p.amount || 0), 0);

    return { completed: completed.length, pending: pending.length, failed: failed.length, totalAmount };
  }, [payments]);

  return (
    <div className="p-6 space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="text-blue-600 dark:text-blue-400" />
            Ödeme Yönetimi
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tüm ödeme işlemlerini görüntüleyin ve yönetin
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2">
              <CreditCard className="text-blue-600 dark:text-blue-400 w-5 h-5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Toplam</p>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-400">{payments.length}</p>
              </div>
            </div>
        </Card>
          <Card className="px-4 py-3 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-green-600 dark:text-green-400 w-5 h-5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Başarılı</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-400">{stats.completed}</p>
              </div>
            </div>
        </Card>
          <Card className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2">
              <Clock className="text-yellow-600 dark:text-yellow-400 w-5 h-5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Beklemede</p>
                <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">{stats.pending}</p>
              </div>
            </div>
        </Card>
          <Card className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2">
              <XCircle className="text-red-600 dark:text-red-400 w-5 h-5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Başarısız</p>
                <p className="text-lg font-bold text-red-700 dark:text-red-400">{stats.failed}</p>
              </div>
            </div>
        </Card>
        </div>
      </div>

      {/* Data Table */}
      {preferenceLoaded && (
        <DataTable
          data={payments}
          columns={columns}
          searchPlaceholder="Ödeme no, müşteri, email veya telefon ara..."
          pageSize={20}
          loading={loading}
          tableKey={PAYMENT_TABLE_KEY}
          initialPreferences={tablePreferences ? {
            tableKey: tablePreferences.tableKey,
            visibleColumns: tablePreferences.visibleColumns || columns.map(c => c.id),
            columnOrder: tablePreferences.columnOrder || columns.map(c => c.id),
            columnFilters: tablePreferences.columnFilters || {},
            sortConfig: {
              key: tablePreferences.sortConfig?.key || 'createdAt',
              direction: (tablePreferences.sortConfig?.direction as 'asc' | 'desc' | null) || 'desc',
            },
            pageSize: tablePreferences.pageSize || 20,
          } : undefined}
          onPreferencesChange={async (state: TablePreferenceState) => {
            try {
              await tablePreferenceService.saveTablePreference(PAYMENT_TABLE_KEY, {
                tableKey: PAYMENT_TABLE_KEY,
                visibleColumns: state.visibleColumns,
                columnOrder: state.columnOrder,
                columnFilters: state.columnFilters,
                sortConfig: {
                  key: state.sortConfig.key || '',
                  direction: state.sortConfig.direction || null,
                },
                pageSize: state.pageSize,
              });
            } catch (error) {
              console.error('Failed to save table preferences:', error);
            }
          }}
          onEdit={(row) => setSelectedPayment(row)}
        />
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <CreditCard className="text-blue-600 dark:text-blue-400 w-7 h-7" />
              Ödeme Detayı
            </DialogTitle>
            <DialogDescription className="text-base">
              Ödeme işlem bilgileri ve detayları
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-6 mt-6">
              {/* Status and Payment Number */}
              <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 block mb-2">Ödeme No</label>
                  <div className="font-mono text-xl font-bold">#{selectedPayment.paymentNumber}</div>
              </div>
              <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 block mb-2">Durum</label>
                  {getStatusBadge(selectedPayment.status)}
                </div>
              </div>

              {/* Customer Information */}
              <Card className="p-5 border">
                <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" /> Müşteri Bilgileri
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Ad Soyad</label>
                    <p className="text-base text-gray-900 dark:text-gray-100">{selectedPayment.customerName}</p>
                  </div>
                  {selectedPayment.customerEmail && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">E-posta</label>
                      <p className="text-base text-gray-900 dark:text-gray-100">{selectedPayment.customerEmail}</p>
            </div>
                  )}
                  {selectedPayment.customerPhone && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Telefon</label>
                      <p className="text-base text-gray-900 dark:text-gray-100">{selectedPayment.customerPhone}</p>
                </div>
                  )}
                </div>
              </Card>

              {/* Payment Information */}
              <Card className="p-5 border">
                <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" /> Ödeme Bilgileri
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Tutar</label>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                    </p>
                </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Ödeme Yöntemi</label>
                    <p className="text-base text-gray-900 dark:text-gray-100">{selectedPayment.method}</p>
                  </div>
                  {selectedPayment.exchangeRate && selectedPayment.exchangeRate !== 1 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Döviz Kuru</label>
                      <p className="text-base text-gray-900 dark:text-gray-100">{selectedPayment.exchangeRate.toFixed(4)}</p>
                  </div>
                )}
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Oluşturma Tarihi</label>
                    <p className="text-base text-gray-900 dark:text-gray-100">
                      {format(new Date(selectedPayment.createdAt), 'dd.MM.yyyy HH:mm')}
                    </p>
                  </div>
                  {selectedPayment.iyzicoPaymentId && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Iyzico Payment ID</label>
                      <p className="text-sm font-mono text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 break-all">
                        {selectedPayment.iyzicoPaymentId}
                      </p>
                  </div>
                )}
                  {selectedPayment.iyzicoConversationId && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Iyzico Conversation ID</label>
                      <p className="text-sm font-mono text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 break-all">
                        {selectedPayment.iyzicoConversationId}
                      </p>
                    </div>
                  )}
                  {selectedPayment.iyzicoStatus && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Iyzico Status</label>
                      <Badge variant="secondary" className="text-sm">
                        {selectedPayment.iyzicoStatus}
                      </Badge>
              </div>
            )}
          </div>
              </Card>

              {/* Additional Information */}
              {(selectedPayment.description || selectedPayment.notes) && (
                <Card className="p-5 border">
                  <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Ek Bilgiler</h4>
                  {selectedPayment.description && (
                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Açıklama</label>
                      <p className="text-base text-gray-900 dark:text-gray-100">{selectedPayment.description}</p>
          </div>
        )}
                  {selectedPayment.notes && (
              <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Notlar</label>
                      <p className="text-base text-gray-900 dark:text-gray-100">{selectedPayment.notes}</p>
              </div>
                  )}
                </Card>
              )}
            </div>
          )}
          </DialogContent>
        </Dialog>
    </div>
  );
};

export default PaymentList;
