import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FaSave, FaCamera, FaTrashAlt, FaInfoCircle, FaUser, FaEnvelope, FaIdCard, FaPhone, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../shared/api/axiosConfig';
import { Input } from '../../shared/ui/Input/Input';
import styles from './UserManagementPage.module.css';

interface UserDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  isActive: boolean;
  profilePicture: string | null;
  phoneNumber: string | null;
  twoFactorEnabled: boolean;
}

interface UserDetailFormProps {
  userId: string;
  onUserUpdated: (newName: string) => void;
  onNext: () => void;
}

export const UserDetailForm = forwardRef<{ handleSave: () => void }, UserDetailFormProps>(({ userId, onUserUpdated, onNext }, ref) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserDetail | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    handleSave: () => {
      const form = document.getElementById('userDetailForm') as HTMLFormElement;
      form?.requestSubmit();
    }
  }));

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiClient.get<UserDetail>(`usermanagement/users/${userId}`);
        setUser(res.data);
        if (res.data.profilePicture) {
          setPreviewImage(`data:image/jpeg;base64,${res.data.profilePicture}`);
        }
      } catch {
        toast.error('Kullanıcı bilgileri yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Resim boyutu 2MB dan küçük olmalıdır.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewImage(base64String);
        if (user) {
          // Remove prefix like "data:image/jpeg;base64,"
          const binary = base64String.split(',')[1];
          setUser({ ...user, profilePicture: binary });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    if (user) {
      setUser({ ...user, profilePicture: null });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || saving) return;

    setSaving(true);
    try {
      await apiClient.put(`usermanagement/users/${userId}`, user);
      toast.success('Kullanıcı bilgileri güncellendi.');
      onUserUpdated(`${user.firstName} ${user.lastName}`);
    } catch {
      toast.error('Güncelleme sırasında bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    if (!value) return '';
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return `+${phoneNumber}`;
    if (phoneNumberLength < 7) {
      return `+${phoneNumber.slice(0, 2)} (${phoneNumber.slice(2, 5)})`;
    }
    if (phoneNumberLength < 10) {
      return `+${phoneNumber.slice(0, 2)} (${phoneNumber.slice(2, 5)}) ${phoneNumber.slice(5, 8)}`;
    }
    if (phoneNumberLength < 12) {
      return `+${phoneNumber.slice(0, 2)} (${phoneNumber.slice(2, 5)}) ${phoneNumber.slice(5, 8)} ${phoneNumber.slice(8, 10)}`;
    }
    return `+${phoneNumber.slice(0, 2)} (${phoneNumber.slice(2, 5)}) ${phoneNumber.slice(5, 8)} ${phoneNumber.slice(8, 10)} ${phoneNumber.slice(10, 12)}`;
  };

  if (loading) return <div className={styles.formPlaceholder}>Yükleniyor...</div>;
  if (!user) return <div className={styles.formPlaceholder}>Kullanıcı bulunamadı.</div>;

  return (
    <form id="userDetailForm" className={styles.detailForm} onSubmit={handleSave}>
      <div className={styles.formSection}>
        <div className={styles.avatarUploadArea}>
           <div className={styles.avatarPreview}>
             {previewImage ? (
               <img src={previewImage} alt="Profile" />
             ) : (
               <div className={styles.avatarFallback}>
                 {user.firstName[0]}{user.lastName[0]}
               </div>
             )}
             <label className={styles.cameraBtn} htmlFor="profilePic">
               <FaCamera />
             </label>
             <input 
               id="profilePic" 
               type="file" 
               accept="image/*" 
               style={{ display: 'none' }} 
               onChange={handleImageChange}
             />
           </div>
           {previewImage && (
             <button type="button" className={styles.removeAvatarBtn} onClick={handleRemoveImage}>
               <FaTrashAlt /> Kaldır
             </button>
           )}
           <p className={styles.uploadHint}>Maksimum 2MB. Kare oranlı resimler tercih edilir.</p>
        </div>

        <div className={styles.formGrid}>
          <Input 
            label="Ad"
            leftIcon={<FaUser />}
            placeholder="Ad giriniz..."
            value={user.firstName} 
            onChange={e => setUser({...user, firstName: e.target.value})} 
            required
          />
          <Input 
            label="Soyad"
            leftIcon={<FaUser />}
            placeholder="Soyad giriniz..."
            value={user.lastName} 
            onChange={e => setUser({...user, lastName: e.target.value})} 
            required
          />
          <Input 
            label="Kullanıcı Adı"
            leftIcon={<FaIdCard />}
            placeholder="Kullanıcı adı..."
            value={user.username} 
            onChange={e => setUser({...user, username: e.target.value})} 
            required
          />
          <Input 
            label="E-Posta"
            type="email" 
            leftIcon={<FaEnvelope />}
            placeholder="ornek@wixi.com"
            value={user.email} 
            onChange={e => setUser({...user, email: e.target.value})} 
            required
          />
          <Input 
            label="Telefon Numarası"
            leftIcon={<FaPhone />}
            placeholder="+90 (5xx) xxx xx xx"
            value={user.phoneNumber || ''} 
            maxLength={19}
            onChange={e => {
              const formatted = formatPhoneNumber(e.target.value);
              setUser({...user, phoneNumber: formatted});
            }} 
          />
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Güvenlik</label>
            <label className={styles.switch}>
              <input 
                type="checkbox" 
                checked={user.twoFactorEnabled} 
                onChange={e => setUser({...user, twoFactorEnabled: e.target.checked})} 
              />
              <span className={styles.slider}></span>
              <span className={styles.switchLabel}>
                <FaShieldAlt style={{ marginRight: '8px', color: user.twoFactorEnabled ? 'var(--color-success)' : 'var(--text-muted)' }} />
                2-Factor Doğrulama {user.twoFactorEnabled ? 'Aktif' : 'Pasif'}
              </span>
            </label>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Hesap Durumu</label>
            <label className={styles.switch}>
              <input 
                type="checkbox" 
                checked={user.isActive} 
                onChange={e => setUser({...user, isActive: e.target.checked})} 
              />
              <span className={styles.slider}></span>
              <span className={styles.switchLabel}>{user.isActive ? 'Aktif Hesap' : 'Pasif Hesap'}</span>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
});
