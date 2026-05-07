import React, { useState, useEffect } from 'react';
import { TemplateList } from '../components/TemplateList';
import { TemplateForm } from '../components/TemplateForm';
import { LogsTable } from '../components/LogsTable';
import { SmtpSettingsForm } from '../components/SmtpSettingsForm';
import { TemplateTestModal } from '../components/TemplateTestModal';
import { mailingApi } from '../api/mailing';
import type { MailTemplate, MailLog } from '../types';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { FaMailBulk, FaHistory, FaCog, FaServer } from 'react-icons/fa';
import styles from './MailingManagementPage.module.css';

export const MailingManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'templates' | 'logs' | 'settings'>('templates');
  const [templates, setTemplates] = useState<MailTemplate[]>([]);
  const [logs, setLogs] = useState<MailLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MailTemplate | undefined>();
  const [testingTemplate, setTestingTemplate] = useState<MailTemplate | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Keep logs fresh when user opens the tab
    const refreshLogs = async () => {
      if (activeTab !== 'logs') return;
      try {
        setIsLoading(true);
        const lData = await mailingApi.getLogs();
        setLogs(lData);
      } catch {
        toast.error('Gönderim geçmişi alınamadı');
      } finally {
        setIsLoading(false);
      }
    };
    refreshLogs();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tData, lData] = await Promise.all([
        mailingApi.getTemplates(),
        mailingApi.getLogs()
      ]);
      setTemplates(tData);
      setLogs(lData);
    } catch (error) {
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTemplate(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (template: MailTemplate) => {
    setEditingTemplate(template);
    setIsFormOpen(true);
  };

  const handleSave = async (data: Partial<MailTemplate>) => {
    try {
      await mailingApi.saveTemplate(data);
      toast.success(editingTemplate ? 'Şablon güncellendi' : 'Yeni şablon oluşturuldu');
      setIsFormOpen(false);
      loadData();
    } catch (error) {
      toast.error('Kaydedilirken bir hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Emin misiniz?',
      text: "Bu şablon silinecektir!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#dc2626',
      confirmButtonText: 'Evet, sil!',
      cancelButtonText: 'İptal'
    });

    if (result.isConfirmed) {
      try {
        toast.success('Şablon silindi (Simüle)');
      } catch (error) {
        toast.error('Silme işlemi başarısız');
      }
    }
  };

  const handleViewLogBody = (body: string) => {
    Swal.fire({
      title: 'Mail İçeriği',
      html: `<div style="text-align: left; max-height: 400px; overflow-y: auto; padding: 10px; border: 1px solid var(--border-glass); background: var(--bg-primary); color: var(--text-main); border-radius: 8px;">${body}</div>`,
      width: '800px',
      confirmButtonText: 'Kapat',
      background: 'var(--bg-secondary)',
      color: 'var(--text-main)'
    });
  };

  const handleTest = async (template: MailTemplate) => {
    setTestingTemplate(template);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.iconWrapper}>
            <FaMailBulk />
          </div>
          <div>
            <h1>Mail Yönetimi</h1>
            <p>Şablonları yönetin ve gönderim kayıtlarını izleyin.</p>
          </div>
        </div>
        
        <div className={styles.tabContainer}>
          <button
            onClick={() => setActiveTab('templates')}
            className={`${styles.tabButton} ${activeTab === 'templates' ? styles.active : ''}`}
          >
            <FaCog size={14} /> Şablonlar
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`${styles.tabButton} ${activeTab === 'logs' ? styles.active : ''}`}
          >
            <FaHistory size={14} /> Günlükler
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`${styles.tabButton} ${activeTab === 'settings' ? styles.active : ''}`}
          >
            <FaServer size={14} /> SMTP Ayarları
          </button>
        </div>
      </div>

      <div className={styles.contentArea}>
        {activeTab === 'templates' && (
          <TemplateList
            templates={templates}
            isLoading={isLoading}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onTest={handleTest}
            onDelete={handleDelete}
          />
        )}
        
        {activeTab === 'logs' && (
          <LogsTable
            logs={logs}
            isLoading={isLoading}
            onViewBody={handleViewLogBody}
          />
        )}

        {activeTab === 'settings' && (
          <SmtpSettingsForm />
        )}
      </div>

      {isFormOpen && (
        <TemplateForm
          template={editingTemplate}
          onSave={handleSave}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      <TemplateTestModal
        isOpen={!!testingTemplate}
        template={testingTemplate}
        isSending={isSendingTest}
        onClose={() => {
          if (isSendingTest) return;
          setTestingTemplate(null);
        }}
        onSend={async ({ email, variables }) => {
          if (!testingTemplate) return;
          setIsSendingTest(true);
          try {
            await mailingApi.sendTestMail(testingTemplate.code, email, variables);
            toast.success('Test e-postası gönderildi.');
            setTestingTemplate(null);
            await loadData();
          } catch (error: unknown) {
            const msg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Test maili gönderilemedi. Lütfen SMTP ayarlarınızı kontrol edin.';
            toast.error(msg);
          } finally {
            setIsSendingTest(false);
          }
        }}
      />
    </div>
  );
};
