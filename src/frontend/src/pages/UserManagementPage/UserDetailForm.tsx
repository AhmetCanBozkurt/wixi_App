import React, { useState, useEffect } from 'react';
import { FaSave, FaCamera, FaTrashAlt, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../shared/api/axiosConfig';
import styles from './UserManagementPage.module.css';

interface UserDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  isActive: boolean;
  profilePicture: string | null; // Base64 string from server
}

interface UserDetailFormProps {
  userId: string;
  onUserUpdated: (newName: string) => void;
  onNext: () => void;
}

export const UserDetailForm: React.FC<UserDetailFormProps> = ({ userId, onUserUpdated, onNext }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserDetail | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

  if (loading) return <div className={styles.formPlaceholder}>Yükleniyor...</div>;
  if (!user) return <div className={styles.formPlaceholder}>Kullanıcı bulunamadı.</div>;

  return (
    <form className={styles.detailForm} onSubmit={handleSave}>
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
          <div className={styles.formGroup}>
            <label>Ad</label>
            <input 
              type="text" 
              value={user.firstName} 
              onChange={e => setUser({...user, firstName: e.target.value})} 
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Soyad</label>
            <input 
              type="text" 
              value={user.lastName} 
              onChange={e => setUser({...user, lastName: e.target.value})} 
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Kullanıcı Adı</label>
            <input 
              type="text" 
              value={user.username} 
              onChange={e => setUser({...user, username: e.target.value})} 
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>E-Posta</label>
            <input 
              type="email" 
              value={user.email} 
              onChange={e => setUser({...user, email: e.target.value})} 
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Durum</label>
            <label className={styles.switch}>
              <input 
                type="checkbox" 
                checked={user.isActive} 
                onChange={e => setUser({...user, isActive: e.target.checked})} 
              />
              <span className={styles.slider}></span>
              <span className={styles.switchLabel}>{user.isActive ? 'Aktif' : 'Pasif'}</span>
            </label>
          </div>
        </div>
      </div>

      <div className={styles.formActions}>
         <div className={styles.infoNote}>
           <FaInfoCircle /> Bilgileri kaydettikten sonra menü düzenlemeye geçebilirsiniz.
         </div>
         <button type="submit" className={styles.btnSaveMain} disabled={saving}>
           <FaSave /> {saving ? 'Kaydediliyor...' : 'Bilgileri Kaydet'}
         </button>
      </div>
    </form>
  );
};
