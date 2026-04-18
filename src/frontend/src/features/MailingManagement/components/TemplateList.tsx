import React from 'react';
import { AdvancedDataTable } from '../../../shared/ui/AdvancedDataTable/AdvancedDataTable';
import type { MailTemplate } from '../types';
import { FaEdit, FaTrash, FaPlus, FaPaperPlane } from 'react-icons/fa';

interface TemplateListProps {
  templates: MailTemplate[];
  onEdit: (template: MailTemplate) => void;
  onDelete: (id: string) => void;
  onTest: (template: MailTemplate) => void;
  onAdd: () => void;
  isLoading: boolean;
}

export const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  onEdit,
  onDelete,
  onTest,
  onAdd,
  isLoading
}) => {
  const columns: import('../../../shared/ui/AdvancedDataTable/AdvancedDataTable').ColumnConfig<MailTemplate>[] = [
    {
      field: 'code',
      title: 'Kod',
      sortable: true,
      template: (row) => <span style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>{row.code}</span>
    },
    {
      field: 'subject',
      title: 'Konu',
      sortable: true
    },
    {
      field: 'category',
      title: 'Kategori',
      sortable: true,
      template: (row) => row.category || '-'
    },
    {
      field: 'isActive',
      title: 'Durum',
      template: (row) => (
        <span className={row.isActive ? 'px-2 py-1 bg-success/10 text-success rounded text-xs' : 'px-2 py-1 bg-secondary/10 text-secondary rounded text-xs'}>
          {row.isActive ? 'Aktif' : 'Pasif'}
        </span>
      )
    },
    {
      field: 'id',
      title: 'İşlemler',
      width: 100,
      template: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => onTest(row)}
            style={{ border: 'none', background: 'transparent', color: 'var(--brand-primary, #3b82f6)', cursor: 'pointer', fontSize: '1.1rem' }}
            title="Test Et"
          >
            <FaPaperPlane />
          </button>
          <button 
            onClick={() => onEdit(row)}
            style={{ border: 'none', background: 'transparent', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '1.1rem' }}
            title="Düzenle"
          >
            <FaEdit />
          </button>
          <button 
            onClick={() => onDelete(row.id)}
            style={{ border: 'none', background: 'transparent', color: 'var(--color-danger, #ef4444)', cursor: 'pointer', fontSize: '1.1rem' }}
            title="Sil"
          >
            <FaTrash />
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Mail Şablonları</h3>
        <button
          onClick={onAdd}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
        >
          <FaPlus size={14} />
          Yeni Şablon
        </button>
      </div>
      
      <AdvancedDataTable<MailTemplate>
        dataSource={templates}
        columns={columns}
        loading={isLoading}
        pageable={{ pageSize: 10 }}
        toolbar={['search']}
        exportTitle="Mail_Sablonlari"
      />
    </div>
  );
};
