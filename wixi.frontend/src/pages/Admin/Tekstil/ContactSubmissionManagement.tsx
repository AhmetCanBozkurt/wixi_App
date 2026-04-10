import React, { useState } from 'react';
import { FaEdit, FaTrash, FaCheck, FaClock, FaTimes } from 'react-icons/fa';
import AdvancedDataTable, { type Column } from '../../../components/admin/AdvancedDataTable';
import type { ContactSubmissionDto, UpdateContactSubmissionDto } from '../../../ApiServices/types/TekstilTypes';
import tekstilContactSubmissionService from '../../../ApiServices/services/TekstilContactSubmissionService';
import { toast } from 'sonner';
import { BASE_URL } from '../../../ApiServices/config/api.config';

const API_BASE_URL = BASE_URL;

const ContactSubmissionManagement: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'New': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'InProgress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Resolved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Closed': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return colors[status] || colors['New'];
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      'Low': 'bg-gray-100 text-gray-800',
      'Medium': 'bg-blue-100 text-blue-800',
      'High': 'bg-orange-100 text-orange-800',
      'Urgent': 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors['Low'];
  };

  const columns: Column<ContactSubmissionDto>[] = [
    {
      key: 'fullName',
      header: 'Ad Soyad',
      sortable: true,
      searchable: true
    },
    {
      key: 'email',
      header: 'E-posta',
      sortable: true,
      searchable: true
    },
    {
      key: 'phone',
      header: 'Telefon',
      searchable: true
    },
    {
      key: 'subject',
      header: 'Konu',
      searchable: true
    },
    {
      key: 'status',
      header: 'Durum',
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(value)}`}>
          {value === 'New' ? 'Yeni' : 
           value === 'InProgress' ? 'İşlemde' :
           value === 'Resolved' ? 'Çözüldü' : 'Kapatıldı'}
        </span>
      ),
      width: '120px'
    },
    {
      key: 'priority',
      header: 'Öncelik',
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs ${getPriorityBadge(value)}`}>
          {value === 'Low' ? 'Düşük' :
           value === 'Medium' ? 'Orta' :
           value === 'High' ? 'Yüksek' : 'Acil'}
        </span>
      ),
      width: '100px'
    },
    {
      key: 'languageCode',
      header: 'Dil',
      width: '80px'
    },
    {
      key: 'createdAt',
      header: 'Tarih',
      render: (value) => value ? new Date(value).toLocaleDateString('tr-TR') : '-',
      width: '120px',
      sortable: true
    }
  ];

  const handleUpdateStatus = async (id: number, status: 'New' | 'InProgress' | 'Resolved' | 'Closed') => {
    try {
      const result = await tekstilContactSubmissionService.updateContactSubmission(id, { id, status });
      if (result.success) {
        toast.success('Durum güncellendi');
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error(result.message || 'Güncelleme başarısız');
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Durum güncellenirken hata oluştu');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu form kaydını silmek istediğinizden emin misiniz?')) return;
    
    try {
      const result = await tekstilContactSubmissionService.deleteContactSubmission(id);
      if (result.success) {
        toast.success('Form kaydı başarıyla silindi');
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error(result.message || 'Silme başarısız');
      }
    } catch (error: any) {
      console.error('Error deleting submission:', error);
      toast.error(error.message || 'Form kaydı silinirken hata oluştu');
    }
  };

  const detailModal = (row: ContactSubmissionDto, onClose: () => void) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ad Soyad</label>
          <p className="text-gray-900 dark:text-gray-100">{row.fullName}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-posta</label>
          <p className="text-gray-900 dark:text-gray-100">{row.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefon</label>
          <p className="text-gray-900 dark:text-gray-100">{row.phone || '-'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Konu</label>
          <p className="text-gray-900 dark:text-gray-100">{row.subject || '-'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Durum</label>
          <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(row.status)}`}>
            {row.status === 'New' ? 'Yeni' : 
             row.status === 'InProgress' ? 'İşlemde' :
             row.status === 'Resolved' ? 'Çözüldü' : 'Kapatıldı'}
          </span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Öncelik</label>
          <span className={`px-2 py-1 rounded text-xs ${getPriorityBadge(row.priority)}`}>
            {row.priority === 'Low' ? 'Düşük' :
             row.priority === 'Medium' ? 'Orta' :
             row.priority === 'High' ? 'Yüksek' : 'Acil'}
          </span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dil</label>
          <p className="text-gray-900 dark:text-gray-100">{row.languageCode.toUpperCase()}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kayıt Tarihi</label>
          <p className="text-gray-900 dark:text-gray-100">
            {row.createdAt ? new Date(row.createdAt).toLocaleString('tr-TR') : '-'}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mesaj</label>
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
          {row.message}
        </div>
      </div>

      {row.responseMessage && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yanıt</label>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
            {row.responseMessage}
          </div>
          {row.responseDate && (
            <p className="text-xs text-gray-500 mt-1">
              Yanıt Tarihi: {new Date(row.responseDate).toLocaleString('tr-TR')}
            </p>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t dark:border-gray-700">
        <select
          value={row.status}
          onChange={(e) => handleUpdateStatus(row.id!, e.target.value as any)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="New">Yeni</option>
          <option value="InProgress">İşlemde</option>
          <option value="Resolved">Çözüldü</option>
          <option value="Closed">Kapatıldı</option>
        </select>
        <button
          onClick={() => { onClose(); handleDelete(row.id!); }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          <FaTrash /> Sil
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">İletişim Formları Yönetimi</h1>
      </div>

      <AdvancedDataTable
        key={refreshKey}
        endpoint={`${API_BASE_URL}/api/v1.0/tekstil/contact-submissions`}
        columns={columns}
        detailModal={detailModal}
        getAuthToken={async () => localStorage.getItem('token')}
      />
    </div>
  );
};

export default ContactSubmissionManagement;

