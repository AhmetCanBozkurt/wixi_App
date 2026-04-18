import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import styles from './SmtpSettingsForm.module.css';
import { mailingApi } from '../api/mailing';
import type { SmtpSettings } from '../types';

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

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await mailingApi.getSmtpSettings();
      if (data && Object.keys(data).length > 0) {
        setFormData({
          ...data,
          password: '', // Ensure we don't put undefined or null in the input
        });
      }
    } catch (error) {
      console.error('Failed to fetch SMTP settings:', error);
      toast.error('Ayarlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

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
      await mailingApi.updateSmtpSettings(formData);
      
      // We use SweetAlert2 here for successfully updating settings as requested in global rules
      Swal.fire({
        title: 'Başarılı!',
        text: 'SMTP Ayarları başarıyla güncellendi.',
        icon: 'success',
        confirmButtonText: 'Tamam',
        confirmButtonColor: '#2563eb'
      });
      
    } catch (error) {
      console.error('Failed to update SMTP settings:', error);
      toast.error('SMTP Ayarları güncellenemedi');
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
                  onChange={e => handleChange({ target: { name: 'enableSsl', type: 'checkbox', checked: e.target.checked } } as any)}
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
