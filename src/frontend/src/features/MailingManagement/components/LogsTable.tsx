import React from 'react';
import { AdvancedDataTable } from '../../../shared/ui/AdvancedDataTable/AdvancedDataTable';
import type { MailLog } from '../types';
import { FaCheckCircle, FaTimesCircle, FaEye } from 'react-icons/fa';

interface LogsTableProps {
  logs: MailLog[];
  isLoading: boolean;
  onViewBody: (body: string) => void;
}

export const LogsTable: React.FC<LogsTableProps> = ({
  logs,
  isLoading,
  onViewBody
}) => {
  const columns: import('../../../shared/ui/AdvancedDataTable/AdvancedDataTable').ColumnConfig<MailLog>[] = [
    {
      field: 'sentAt',
      title: 'Tarih',
      sortable: true,
      template: (row) => new Date(row.sentAt).toLocaleString('tr-TR')
    },
    {
      field: 'recipient',
      title: 'Alıcı',
      sortable: true,
      template: (row) => <span style={{ fontWeight: 500 }}>{row.recipient}</span>
    },
    {
      field: 'subject',
      title: 'Konu',
      sortable: true
    },
    {
      field: 'isSuccess',
      title: 'Durum',
      template: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {row.isSuccess ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#22c55e', fontSize: '0.875rem' }}>
              <FaCheckCircle /> Başarılı
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '0.875rem' }} title={row.errorMessage}>
              <FaTimesCircle /> Hata
            </span>
          )}
        </div>
      )
    },
    {
      field: 'templateCode',
      title: 'Şablon',
      template: (row) => row.templateCode ? <span style={{ padding: '4px 8px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary)', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace' }}>{row.templateCode}</span> : '-'
    },
    {
      field: 'id',
      title: 'İçerik',
      width: 80,
      template: (row) => (
        <button 
          onClick={() => onViewBody(row.body)}
          style={{ padding: '8px', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '8px', transition: 'background 0.2s' }}
          title="İçeriği Gör"
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <FaEye />
        </button>
      )
    }
  ];

  return (
    <div>
      <div style={{ padding: '0 16px', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)' }}>Gönderim Geçmişi</h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Sistem üzerinden gönderilen son 100 mail kaydı.</p>
      </div>
      
      <AdvancedDataTable<MailLog>
        dataSource={logs}
        columns={columns}
        loading={isLoading}
        pageable={{ pageSize: 15 }}
        toolbar={['search', 'excel']}
        exportTitle="Mail_Gonderim_Gecmisi"
      />
    </div>
  );
};
