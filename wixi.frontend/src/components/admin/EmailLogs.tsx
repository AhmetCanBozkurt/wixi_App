import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaEnvelope, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { API_ROUTES } from '../../ApiServices/config/api.config';
import { TokenService } from '../../ApiServices/services/TokenService';
import { tablePreferenceService } from '../../ApiServices/services';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { DataTable, type ColumnDef, type TablePreferenceState } from '../ui/DataTable';
import type { TablePreferenceDto } from '../../ApiServices/types/TablePreferenceTypes';
import { format } from 'date-fns';

interface EmailLog {
  id: number;
  correlationId?: string;
  createdAt: string;
  fromEmail: string;
  fromName?: string;
  toEmails: string;
  ccEmails?: string;
  bccEmails?: string;
  subject?: string;
  bodyHtml?: string;
  bodyText?: string;
  status: number; // 0: Pending, 1: Sent, 2: Failed
  attemptCount: number;
  lastAttemptAt?: string;
  lastError?: string;
  smtpHost?: string;
  smtpPort?: number;
  usedSsl?: boolean;
  usedUserName?: string;
  templateKey?: string;
}

const EMAIL_LOGS_TABLE_KEY = 'admin-email-logs';

const EmailLogs: React.FC = () => {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
  const [tablePreferences, setTablePreferences] = useState<TablePreferenceDto | null>(null);
  const [preferenceLoaded, setPreferenceLoaded] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const pref = await tablePreferenceService.getTablePreference(EMAIL_LOGS_TABLE_KEY);
        setTablePreferences(pref);
      } catch (error) {
        console.error('Email logs table preferences could not be loaded:', error);
      } finally {
        setPreferenceLoaded(true);
      }
    };

    loadPreferences();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const tokenService = TokenService.getInstance();
      const token = await tokenService.getToken(true);
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      const response = await fetch(
        `${API_ROUTES.BASE_URL}/api/v1.0/admin/email/logs?page=1&pageSize=1000`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        }
      );

      if (response.ok) {
        const data = await response.json();
        const logsData = data.items || data;
        
        const mappedLogs = Array.isArray(logsData) ? logsData.map((log: any) => {
          let statusValue = 0;
          const rawStatus = log.status ?? log.Status;
          if (typeof rawStatus === 'string') {
            const statusUpper = rawStatus.toUpperCase();
            if (statusUpper.includes('SENT')) statusValue = 1;
            else if (statusUpper.includes('FAIL')) statusValue = 2;
            else if (statusUpper.includes('QUEUE') || statusUpper.includes('PEND')) statusValue = 0;
          } else {
            statusValue = rawStatus || 0;
          }

          return {
            id: log.id || log.Id,
            correlationId: log.correlationId || log.CorrelationId,
            createdAt: log.createdAt || log.CreatedAt,
            fromEmail: log.fromEmail || log.FromEmail || '',
            fromName: log.fromName || log.FromName,
            toEmails: log.toEmails || log.ToEmails || '',
            ccEmails: log.ccEmails || log.CcEmails,
            bccEmails: log.bccEmails || log.BccEmails,
            subject: log.subject || log.Subject || '',
            bodyHtml: log.bodyHtml || log.BodyHtml,
            bodyText: log.bodyText || log.BodyText,
            status: statusValue,
            attemptCount: log.attemptCount || log.AttemptCount || 0,
            lastAttemptAt: log.lastAttemptAt || log.LastAttemptAt,
            lastError: log.lastError || log.LastError,
            smtpHost: log.smtpHost || log.SmtpHost || '',
            smtpPort: log.smtpPort || log.SmtpPort || 587,
            usedSsl: log.usedSsl ?? log.UsedSsl ?? false,
            usedUserName: log.usedUserName || log.UsedUserName || '',
            templateKey: log.templateKey || log.TemplateKey
          };
        }) : [];
        
        setLogs(mappedLogs);
      }
    } catch (error) {
      console.error('Email logları yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400">
            <FaClock className="mr-1 w-3 h-3" /> Beklemede
          </Badge>
        );
      case 1:
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400">
            <FaCheckCircle className="mr-1 w-3 h-3" /> Gönderildi
          </Badge>
        );
      case 2:
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400">
            <FaTimesCircle className="mr-1 w-3 h-3" /> Hata
          </Badge>
        );
      default:
        return null;
    }
  };

  const columns: ColumnDef<EmailLog>[] = useMemo(
    () => [
      {
        id: 'createdAt',
        header: 'Tarih',
        headerKey: 'admin.emailLogs.table.date',
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
        id: 'fromEmail',
        header: 'Gönderen',
        headerKey: 'admin.emailLogs.table.from',
        translations: {
          tr: 'Gönderen',
          de: 'Absender',
          en: 'From',
          ar: 'من',
        },
        accessorKey: 'fromEmail',
        width: '200px',
        filterType: 'text',
        filterPlaceholder: 'Gönderen ara',
        sortable: true,
        cell: (value, row) => (
          <div className="text-sm">
            {row.fromName ? (
              <>
                <div className="font-medium">{row.fromName}</div>
                <div className="text-xs text-muted-foreground">{value as string}</div>
              </>
            ) : (
              <div>{value as string}</div>
            )}
          </div>
        ),
      },
      {
        id: 'toEmails',
        header: 'Alıcı',
        headerKey: 'admin.emailLogs.table.to',
        translations: {
          tr: 'Alıcı',
          de: 'Empfänger',
          en: 'To',
          ar: 'إلى',
        },
        accessorKey: 'toEmails',
        width: '220px',
        filterType: 'text',
        filterPlaceholder: 'Alıcı ara',
        sortable: true,
        cell: (value) => (
          <div className="text-sm truncate max-w-[200px]" title={value as string}>
            {value as string}
          </div>
        ),
      },
      {
        id: 'subject',
        header: 'Konu',
        headerKey: 'admin.emailLogs.table.subject',
        translations: {
          tr: 'Konu',
          de: 'Betreff',
          en: 'Subject',
          ar: 'الموضوع',
        },
        accessorKey: 'subject',
        width: '300px',
        filterType: 'text',
        filterPlaceholder: 'Konu ara',
        sortable: true,
        cell: (value) => (
          <div className="text-sm truncate max-w-[280px]" title={value as string}>
            {value as string || <span className="text-muted-foreground italic">(Konu yok)</span>}
          </div>
        ),
      },
      {
        id: 'templateKey',
        header: 'Template',
        headerKey: 'admin.emailLogs.table.template',
        translations: {
          tr: 'Template',
          de: 'Vorlage',
          en: 'Template',
          ar: 'القالب',
        },
        accessorKey: 'templateKey',
        width: '180px',
        filterType: 'text',
        filterPlaceholder: 'Template ara',
        sortable: true,
        cell: (value) => (
          value ? (
            <Badge variant="secondary" className="font-mono text-xs">
              {value as string}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-xs">-</span>
          )
        ),
      },
      {
        id: 'status',
        header: 'Durum',
        headerKey: 'admin.emailLogs.table.status',
        translations: {
          tr: 'Durum',
          de: 'Status',
          en: 'Status',
          ar: 'الحالة',
        },
        accessorKey: 'status',
        width: '140px',
        filterType: 'list',
        filterOptions: [
          { label: 'Gönderildi', value: '1' },
          { label: 'Beklemede', value: '0' },
          { label: 'Hata', value: '2' },
        ],
        getFilterValue: (value) => String(value),
        sortable: true,
        cell: (value) => getStatusBadge(value as number),
      },
      {
        id: 'attemptCount',
        header: 'Deneme',
        headerKey: 'admin.emailLogs.table.attempts',
        translations: {
          tr: 'Deneme',
          de: 'Versuche',
          en: 'Attempts',
          ar: 'المحاولات',
        },
        accessorKey: 'attemptCount',
        width: '100px',
        sortable: true,
        cell: (value) => (
          <Badge variant="outline" className={Number(value) > 1 ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}>
            {value}x
          </Badge>
        ),
      },
    ],
    []
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FaEnvelope className="text-blue-600 dark:text-blue-400" />
            E-Mail Logları
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gönderilen tüm e-postaların kayıtları
          </p>
        </div>
        <div className="flex gap-3">
          <Card className="px-4 py-2 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-green-600 dark:text-green-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Başarılı</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-400">
                  {logs.filter(l => l.status === 1).length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2">
              <FaTimesCircle className="text-red-600 dark:text-red-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Hatalı</p>
                <p className="text-lg font-bold text-red-700 dark:text-red-400">
                  {logs.filter(l => l.status === 2).length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Data Table */}
      {preferenceLoaded && (
        <DataTable
          data={logs}
          columns={columns}
          searchPlaceholder="Email, konu, template veya alıcı ara..."
          pageSize={20}
          loading={loading}
          tableKey={EMAIL_LOGS_TABLE_KEY}
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
              await tablePreferenceService.saveTablePreference(EMAIL_LOGS_TABLE_KEY, {
                tableKey: EMAIL_LOGS_TABLE_KEY,
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
          onEdit={(row) => setSelectedLog(row)}
        />
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="!max-w-[98vw] !max-h-[98vh] !w-[98vw] !h-[98vh] overflow-hidden !flex !flex-col p-0 gap-0 !grid-cols-1">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <FaEnvelope className="text-blue-600 dark:text-blue-400 w-7 h-7" />
              Email Detayı
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              E-posta gönderim bilgileri ve içeriği
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1 overflow-hidden p-6 min-h-0">
                {/* Left Column - Email Info */}
                <div className="space-y-4 overflow-y-auto">
                  <div className="flex items-center gap-6 flex-wrap mb-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 block mb-2">Durum</label>
                      <div>{getStatusBadge(selectedLog.status)}</div>
                    </div>
                    {selectedLog.templateKey && (
                      <div>
                        <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 block mb-2">Template</label>
                        <Badge variant="secondary" className="font-mono text-sm px-3 py-1">{selectedLog.templateKey}</Badge>
                      </div>
                    )}
                  </div>

                  <Card className="p-4 border">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">Gönderen</label>
                    <p className="text-base text-gray-900 dark:text-gray-100">
                      {selectedLog.fromName ? `${selectedLog.fromName} <${selectedLog.fromEmail}>` : selectedLog.fromEmail}
                    </p>
                  </Card>

                  <Card className="p-4 border">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">Alıcı</label>
                    <p className="text-base text-gray-900 dark:text-gray-100 break-words">{selectedLog.toEmails}</p>
                  </Card>

                  {(selectedLog.ccEmails || selectedLog.bccEmails) && (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedLog.ccEmails && (
                        <Card className="p-4 border">
                          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">CC</label>
                          <p className="text-sm text-gray-900 dark:text-gray-100 break-words">{selectedLog.ccEmails}</p>
                        </Card>
                      )}
                      {selectedLog.bccEmails && (
                        <Card className="p-4 border">
                          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">BCC</label>
                          <p className="text-sm text-gray-900 dark:text-gray-100 break-words">{selectedLog.bccEmails}</p>
                        </Card>
                      )}
                    </div>
                  )}

                  <Card className="p-4 border">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">Konu</label>
                    <p className="text-base text-gray-900 dark:text-gray-100">{selectedLog.subject || '(Konu yok)'}</p>
                  </Card>

                  <Card className="p-5 border">
                    <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <FaClock className="w-4 h-4" /> Gönderim Bilgileri
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Oluşturma</label>
                        <p className="text-sm text-gray-900 dark:text-gray-100 font-semibold">
                          {format(new Date(selectedLog.createdAt), 'dd.MM.yyyy')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(selectedLog.createdAt), 'HH:mm:ss')}
                        </p>
                      </div>
                      {selectedLog.lastAttemptAt && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Son Deneme</label>
                          <p className="text-sm text-gray-900 dark:text-gray-100 font-semibold">
                            {format(new Date(selectedLog.lastAttemptAt), 'dd.MM.yyyy')}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(selectedLog.lastAttemptAt), 'HH:mm:ss')}
                          </p>
                        </div>
                      )}
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Deneme</label>
                        <Badge variant={selectedLog.attemptCount > 1 ? "destructive" : "secondary"} className="text-sm px-2 py-1">
                          {selectedLog.attemptCount}x
                        </Badge>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">SSL</label>
                        {selectedLog.usedSsl ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 text-sm px-2 py-1">✓ Evet</Badge>
                        ) : (
                          <Badge variant="outline" className="text-sm px-2 py-1">✗ Hayır</Badge>
                        )}
                      </div>
                    </div>
                  </Card>

                  <Card className="p-5 border">
                    <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">SMTP Bilgileri</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Sunucu</label>
                        <p className="text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded border border-gray-300 dark:border-gray-700">
                          {selectedLog.smtpHost ? `${selectedLog.smtpHost}:${selectedLog.smtpPort || 587}` : 'Belirtilmemiş'}
                        </p>
                      </div>
                      {selectedLog.usedUserName && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Kullanıcı</label>
                          <p className="text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded border border-gray-300 dark:border-gray-700">{selectedLog.usedUserName}</p>
                        </div>
                      )}
                    </div>
                  </Card>

                  {selectedLog.correlationId && (
                    <Card className="p-4 border">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">Correlation ID</label>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 break-all">
                        {selectedLog.correlationId}
                      </p>
                    </Card>
                  )}

                  {selectedLog.lastError && (
                    <Card className="p-5 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800">
                      <label className="text-base font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                        <FaTimesCircle className="w-4 h-4" /> Hata Mesajı
                      </label>
                      <pre className="text-sm text-red-900 dark:text-red-200 whitespace-pre-wrap font-mono bg-white dark:bg-red-950/30 p-3 rounded max-h-32 overflow-y-auto border border-red-200 dark:border-red-800">
                        {selectedLog.lastError}
                      </pre>
                    </Card>
                  )}
                </div>

                {/* Right Column - Email Preview */}
                <div className="xl:col-span-1 flex flex-col overflow-hidden min-h-0">
                  <label className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2 flex-shrink-0">
                    <FaEnvelope className="w-4 h-4" /> Email İçeriği
                  </label>
                  <Card className="p-1 bg-gray-50 dark:bg-gray-900 border-2 flex-1 overflow-hidden min-h-0">
                    {selectedLog.bodyHtml ? (
                      <iframe
                        srcDoc={selectedLog.bodyHtml}
                        className="w-full h-full border-0 rounded"
                        title="Email Preview"
                        sandbox="allow-same-origin allow-scripts"
                      />
                    ) : selectedLog.bodyText ? (
                      <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap font-mono p-4 h-full overflow-y-auto">
                        {selectedLog.bodyText}
                      </pre>
                    ) : (
                      <p className="text-base text-gray-500 dark:text-gray-400 italic text-center py-16">
                        İçerik bulunamadı
                      </p>
                    )}
                  </Card>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailLogs;
