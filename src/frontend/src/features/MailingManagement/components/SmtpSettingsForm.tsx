import React, { useState, useEffect, useCallback } from 'react';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import styles from './SmtpSettingsForm.module.css';
import { mailingApi } from '../api/mailing';
import type { SmtpSettings } from '../types';
import axios from 'axios';

interface SmtpApiResponse {
  server?: string;
  port?: number;
  username?: string;
  senderName?: string;
  senderEmail?: string;
  enableSsl?: boolean;
}

export const SmtpSettingsForm: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<SmtpSettings>({
    server: '',
    port: 587,
    username: '',
    password: '',
    senderName: '',
    senderEmail: '',
    enableSsl: true,
  });

  const fetchSettings = useCallback(async () => {
    try {
      const data = await mailingApi.getSmtpSettings();
      // Backend may respond with {} when no settings exist yet.
      // Still update form state so the UI doesn't look "stuck".
      const d = data as SmtpApiResponse;
      setFormData(prev => ({
        server: d?.server ?? prev.server ?? '',
        port: d?.port ?? prev.port ?? 587,
        username: d?.username ?? prev.username ?? '',
        password: '', // never hydrate password into the input
        senderName: d?.senderName ?? prev.senderName ?? '',
        senderEmail: d?.senderEmail ?? prev.senderEmail ?? '',
        enableSsl: d?.enableSsl ?? prev.enableSsl ?? true,
      }));
    } catch (error) {
      const ax = axios.isAxiosError(error) ? error : undefined;
      const status = ax?.response?.status;
      const responseData = ax?.response?.data as { error?: string; message?: string } | undefined;
      const msg = responseData?.error || responseData?.message;
      toast.error(`Ayarlar yüklenirken bir hata oluştu${status ? ` (HTTP ${status})` : ''}${msg ? `: ${msg}` : ''}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Important: empty password means "keep existing password" on backend.
      // Don't send empty string, otherwise it can overwrite a valid password.
      const payload: SmtpSettings = {
        ...formData,
        password: formData.password?.trim() ? formData.password : undefined
      };
      await mailingApi.updateSmtpSettings(payload);
      
      // We use SweetAlert2 here for successfully updating settings as requested in global rules
      Swal.fire({
        title: 'Başarılı!',
        text: 'SMTP Ayarları başarıyla güncellendi.',
        icon: 'success',
        confirmButtonText: 'Tamam',
        confirmButtonColor: '#2563eb'
      });
      
    } catch (error) {
      const ax = axios.isAxiosError(error) ? error : undefined;
      const status = ax?.response?.status;
      const responseData = ax?.response?.data as { error?: string; message?: string } | undefined;
      const msg = responseData?.error || responseData?.message;
      toast.error(`SMTP Ayarları güncellenemedi${status ? ` (HTTP ${status})` : ''}${msg ? `: ${msg}` : ''}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.loader}>Ayarlar yükleniyor...</div>;
  }

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.title}>SMTP Bağlantı Ayarları</h3>
      
      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="server">SMTP Sunucu Adresi</label>
            <input
              type="text"
              id="server"
              name="server"
              value={formData.server}
              onChange={handleChange}
              className={styles.input}
              placeholder="smtp.example.com"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="port">Port</label>
            <input
              type="number"
              id="port"
              name="port"
              value={formData.port}
              onChange={handleChange}
              className={styles.input}
              placeholder="587"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="username">Kullanıcı Adı</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={styles.input}
              placeholder="user@example.com"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Şifre</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              placeholder="Şifreyi değiştirmek için yazın"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="senderName">Gönderici Adı</label>
            <input
              type="text"
              id="senderName"
              name="senderName"
              value={formData.senderName}
              onChange={handleChange}
              className={styles.input}
              placeholder="Wixi Sistem"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="senderEmail">Gönderici E-posta</label>
            <input
              type="email"
              id="senderEmail"
              name="senderEmail"
              value={formData.senderEmail}
              onChange={handleChange}
              className={styles.input}
              placeholder="no-reply@example.com"
              required
            />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.switchContainer}>
              <div className={styles.switch}>
                <input
                  type="checkbox"
                  name="enableSsl"
                  checked={formData.enableSsl}
                  onChange={e => {
                  const syntheticEvent = { target: { name: 'enableSsl', type: 'checkbox', checked: e.target.checked, value: '' } } as React.ChangeEvent<HTMLInputElement>;
                  handleChange(syntheticEvent);
                }}
                />
                <span className={styles.slider}></span>
              </div>
              <span className={styles.switchText}>SSL/TLS Kullan (Güvenli Bağlantı)</span>
            </label>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="submit" disabled={saving} className={styles.submitBtn}>
            <Save size={16} />
            {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
};
