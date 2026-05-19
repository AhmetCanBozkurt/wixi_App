import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FaCamera, FaTrashAlt, FaUser, FaEnvelope, FaIdCard, FaPhone, FaShieldAlt, FaStore } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../shared/api/axiosConfig';
import { Input } from '../../shared/ui/Input/Input';
import { MultiSelect } from '../../shared/ui';
import styles from './UserManagementPage.module.css';

interface UserDetail {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  isActive: boolean;
  profilePicture: string | null;
  phoneNumber: string | null;
  twoFactorEnabled: boolean;
  roles?: string[];
  password?: string;
  tenantId?: string | null;
}

interface UserDetailFormProps {
  userId: string | null;
  onUserUpdated: (newName: string, id: string) => void;
  onNext: () => void;
}

export const UserDetailForm = forwardRef<{ handleSave: () => void }, UserDetailFormProps>(({ userId, onUserUpdated, onNext: _onNext }, ref) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allRoles, setAllRoles] = useState<{ id: string; name: string; description?: string | null }[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [user, setUser] = useState<UserDetail | null>(userId ? null : {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    isActive: true,
    profilePicture: null,
    phoneNumber: '',
    twoFactorEnabled: false,
    tenantId: null
  });
  const [tenants, setTenants] = useState<{ id: string; name: string }[]>([]);
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
        setSelectedRoles(res.data.roles || []);
        if (res.data.profilePicture) {
          setPreviewImage(`data:image/jpeg;base64,${res.data.profilePicture}`);
        }
      } catch {
        toast.error('Kullanıcı bilgileri yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    const fetchRoles = async () => {
      try {
        const res = await apiClient.get<{ items: { id: string; name: string; description?: string | null }[] }>('usermanagement/roles');
        setAllRoles(res.data.items || []);
      } catch {
        // role management is admin feature; keep silent
      }
    };

    const fetchTenants = async () => {
      try {
        const res = await apiClient.get<{ items: { id: string; name: string }[] }>('admin/tenants');
        const rawItems = res.data.items;
        const data = Array.isArray(rawItems) ? rawItems : ((rawItems as any)?.items ?? []);
        setTenants(data);
      } catch {
        // Silent
      }
    };

    if (userId) fetchUser();
    fetchRoles();
    fetchTenants();
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
        // Remove prefix like "data:image/jpeg;base64,"
        const binary = base64String.split(',')[1];
        setUser(prev => prev ? { ...prev, profilePicture: binary } : { firstName: '', lastName: '', email: '', username: '', isActive: true, profilePicture: binary, phoneNumber: null, twoFactorEnabled: false });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setUser(prev => prev ? { ...prev, profilePicture: null } : { firstName: '', lastName: '', email: '', username: '', isActive: true, profilePicture: null, phoneNumber: null, twoFactorEnabled: false });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || saving) return;

    setSaving(true);
    try {
      let newId = userId || '';
      if (!userId) {
        // Create Mode
        const res = await apiClient.post<{ id: string }>('usermanagement/users', user);
        newId = res.data.id;
        toast.success('Yeni kullanıcı başarıyla oluşturuldu.');
      } else {
        // Update Mode
        await apiClient.put(`usermanagement/users/${userId}`, user);
        await apiClient.put(`usermanagement/users/${userId}/roles`, { roles: selectedRoles });
        toast.success('Kullanıcı bilgileri güncellendi.');
      }
      onUserUpdated(`${user.firstName} ${user.lastName}`, newId);
    } catch {
      toast.error('İşlem sırasında bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    if (!value) return '';
    const phoneNumber = value.replace(/[^\d]/g, '');
    const length = phoneNumber.length;
    
    if (length <= 2) return `+${phoneNumber}`;
    if (length <= 5) return `+${phoneNumber.slice(0, 2)} (${phoneNumber.slice(2, 5)})`;
    if (length <= 8) return `+${phoneNumber.slice(0, 2)} (${phoneNumber.slice(2, 5)}) ${phoneNumber.slice(5, 8)}`;
    if (length <= 10) return `+${phoneNumber.slice(0, 2)} (${phoneNumber.slice(2, 5)}) ${phoneNumber.slice(5, 8)} ${phoneNumber.slice(8, 10)}`;
    return `+${phoneNumber.slice(0, 2)} (${phoneNumber.slice(2, 5)}) ${phoneNumber.slice(5, 8)} ${phoneNumber.slice(8, 10)} ${phoneNumber.slice(10, 12)}`;
  };

  if (loading && userId) return <div className={styles.formPlaceholder}>Yükleniyor...</div>;
  
  const displayUser = user || {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    isActive: true,
    profilePicture: null,
    phoneNumber: '',
    twoFactorEnabled: false,
    password: ''
  };

  return (
    <form id="userDetailForm" className={styles.detailForm} onSubmit={handleSave}>
      <div className={styles.formSection}>
        <div className={styles.avatarUploadArea}>
           <div className={styles.avatarPreview}>
             {previewImage ? (
               <img src={previewImage} alt="Profile" />
             ) : (
               <div className={styles.avatarFallback}>
                 {displayUser.firstName || displayUser.lastName ? (
                    <>{(displayUser.firstName?.[0] || '').toUpperCase()}{(displayUser.lastName?.[0] || '').toUpperCase()}</>
                 ) : (
                    <FaUser size={40} style={{ opacity: 0.5 }} />
                 )}
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
            value={displayUser.firstName} 
            onChange={e => setUser({...displayUser, firstName: e.target.value})}
            required
          />
          <Input 
            label="Soyad"
            leftIcon={<FaUser />}
            placeholder="Soyad giriniz..."
            value={displayUser.lastName} 
            onChange={e => setUser({...displayUser, lastName: e.target.value})}
            required
          />
          <Input 
            label="Kullanıcı Adı"
            leftIcon={<FaIdCard />}
            placeholder="Kullanıcı adı..."
            value={displayUser.username} 
            onChange={e => setUser({...displayUser, username: e.target.value})}
            required
          />
          <Input 
            label="E-Posta"
            type="email" 
            leftIcon={<FaEnvelope />}
            placeholder="ornek@wixi.com"
            value={displayUser.email} 
            onChange={e => setUser({...displayUser, email: e.target.value})}
            required
          />
          {!userId && (
            <Input 
              label="Şifre"
              type="password"
              leftIcon={<FaShieldAlt />}
              placeholder="Giriş şifresi..."
              value={displayUser.password || ''}
              onChange={e => setUser({...displayUser, password: e.target.value})}
              required
            />
          )}
          <Input 
            label="Telefon Numarası"
            leftIcon={<FaPhone />}
            placeholder="+90 (5xx) xxx xx xx"
            value={displayUser.phoneNumber || ''} 
            maxLength={19}
            onChange={e => {
              const formatted = formatPhoneNumber(e.target.value);
              setUser({...displayUser, phoneNumber: formatted});
            }} 
          />
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Bağlı Olduğu Mağaza (Tenant)</label>
            <div className={styles.selectWrapper}>
               <FaStore className={styles.inputIcon} />
               <select 
                 className={styles.selectInput}
                 value={displayUser.tenantId || ''}
                 onChange={e => setUser({...displayUser, tenantId: e.target.value || null})}
               >
                 <option value="">Global / Mağaza Yok</option>
                 {tenants.map(t => (
                   <option key={t.id} value={t.id}>{t.name}</option>
                 ))}
               </select>
            </div>
            <p className={styles.inputHint}>Müşteri veya Mağaza Yöneticisi ise bir mağaza seçilmelidir.</p>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Güvenlik</label>
            <label className={styles.switch}>
              <input 
                type="checkbox" 
                checked={displayUser.twoFactorEnabled} 
                onChange={e => setUser({...displayUser, twoFactorEnabled: e.target.checked})}
              />
              <span className={styles.slider}></span>
              <span className={styles.switchLabel}>
                <FaShieldAlt style={{ marginRight: '8px', color: displayUser.twoFactorEnabled ? 'var(--color-success)' : 'var(--text-muted)' }} />
                2-Factor Doğrulama {displayUser.twoFactorEnabled ? 'Aktif' : 'Pasif'}
              </span>
            </label>
          </div>

          {!!userId && allRoles.length > 0 && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Roller</label>
              <MultiSelect
                options={allRoles.map(r => ({ label: r.name, value: r.name }))}
                values={selectedRoles}
                onChange={setSelectedRoles}
                placeholder="Rol seçiniz..."
              />
              <div style={{ marginTop: 6, fontSize: '0.85rem', opacity: 0.8 }}>
                Not: Roller sadece mevcut kullanıcıda güncellenir.
              </div>
            </div>
          )}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Hesap Durumu</label>
            <label className={styles.switch}>
              <input 
                type="checkbox" 
                checked={displayUser.isActive} 
                onChange={e => setUser({...displayUser, isActive: e.target.checked})}
              />
              <span className={styles.slider}></span>
              <span className={styles.switchLabel}>{displayUser.isActive ? 'Aktif Hesap' : 'Pasif Hesap'}</span>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
});
