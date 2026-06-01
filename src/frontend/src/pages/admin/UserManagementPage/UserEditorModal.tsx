import React, { useState } from 'react';
import { FaArrowRight, FaArrowLeft, FaSave, FaKey } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { apiClient } from '../../../shared/api/axiosConfig';
import { UserMenuBuilder } from './UserMenuBuilder';
import { UserDetailForm } from './UserDetailForm';
import { Modal, Button } from '../../../shared/ui';
import styles from './UserManagementPage.module.css';

interface UserEditorModalProps {
  userId: string | null;
  userName: string;
  onClose: () => void;
  onSave?: () => void;
}

export const UserEditorModal: React.FC<UserEditorModalProps> = ({ userId, userName, onClose, onSave }) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(userId);
  const [step, setStep] = useState<1 | 2>(1);
  const [localUserName, setLocalUserName] = useState(userName);
  const menuBuilderRef = React.useRef<{ syncHierarchy: () => void } | null>(null);
  const userFormRef = React.useRef<{ handleSave: () => void } | null>(null);

  const isNew = !currentUserId;

  const handleResetPassword = async () => {
    const result = await Swal.fire({
      title: 'Şifre Sıfırla',
      html: `<b>${localUserName}</b> kullanıcısı için yeni şifre belirleyin.`,
      input: 'password',
      inputLabel: 'Yeni Şifre',
      inputPlaceholder: 'En az 6 karakter...',
      inputAttributes: { autocomplete: 'new-password', minlength: '6' },
      showCancelButton: true,
      confirmButtonText: 'Şifreyi Sıfırla',
      cancelButtonText: 'İptal',
      confirmButtonColor: 'var(--color-primary)',
      background: 'var(--surface)',
      color: 'var(--text-main)',
      inputValidator: (value) => {
        if (!value || value.length < 6) return 'Şifre en az 6 karakter olmalıdır.';
      }
    });

    if (!result.isConfirmed || !result.value) return;

    try {
      await apiClient.post(`usermanagement/users/${currentUserId}/reset-password`, { newPassword: result.value });
      toast.success('Şifre başarıyla sıfırlandı.');
    } catch {
      toast.error('Şifre sıfırlama başarısız.');
    }
  };

  const handleSaveInfo = () => {
    userFormRef.current?.handleSave();
  };

  const handleSyncHierarchy = () => {
    menuBuilderRef.current?.syncHierarchy();
  };

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose}
      title={isNew ? 'Yeni Kullanıcı Oluştur' : `Kullanıcı Düzenleme: ${localUserName}`}
      size="xl"
      footer={
        <div style={{ display: 'flex', width: '100%', gap: '12px' }}>
          {step === 2 && (
            <Button variant="ghost" onClick={() => setStep(1)} leftIcon={<FaArrowLeft />}>
              Geri: Kullanıcı Bilgileri
            </Button>
          )}
          <div style={{ flex: 1 }} />
          {step === 1 ? (
            <div style={{ display: 'flex', gap: '12px' }}>
               {!isNew && (
                 <Button variant="ghost" onClick={handleResetPassword} leftIcon={<FaKey />}>
                    Şifre Sıfırla
                 </Button>
               )}
               <Button variant="primary" onClick={handleSaveInfo} leftIcon={<FaSave />}>
                  {isNew ? 'Kullanıcıyı Oluştur' : 'Bilgileri Kaydet'}
               </Button>
               {!isNew && (
                 <Button variant="ghost" onClick={() => setStep(2)} rightIcon={<FaArrowRight />}>
                    İleri: Menü Düzenle
                 </Button>
               )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
               <Button variant="primary" onClick={handleSyncHierarchy} leftIcon={<FaSave />}>
                  Hiyerarşiyi Kaydet
               </Button>
               <Button variant="ghost" onClick={onClose}>
                  Kapat
               </Button>
            </div>
          )}
        </div>
      }
    >
      <div className={styles.premiumModalContent}>
        {!isNew && (
          <div className={styles.stepIndicator}>
            <div className={`${styles.step} ${step === 1 ? styles.active : ''}`} onClick={() => setStep(1)}>
              <span className={styles.stepNumber}>1</span>
              <span className={styles.stepLabel}>Kullanıcı Bilgileri</span>
            </div>
            <div className={styles.stepDivider} />
            <div className={`${styles.step} ${step === 2 ? styles.active : ''}`} onClick={() => setStep(2)}>
              <span className={styles.stepNumber}>2</span>
              <span className={styles.stepLabel}>Menü Yetkileri</span>
            </div>
          </div>
        )}

        <div className={styles.editorBody}>
          {step === 1 ? (
            <UserDetailForm 
              userId={currentUserId} 
              onUserUpdated={(newName, newId) => {
                setLocalUserName(newName);
                setCurrentUserId(newId);
                if (onSave) onSave();
                // If it was a new user, move to next step automatically
                if (isNew) {
                  setStep(2);
                }
              }}
              onNext={() => setStep(2)}
              ref={userFormRef}
            />
          ) : (
            !isNew && (
              <UserMenuBuilder 
                userId={currentUserId!} 
                userName={localUserName} 
                onClose={onClose} 
                isEmbedded={true}
                ref={menuBuilderRef}
              />
            )
          )}
        </div>
      </div>
    </Modal>
  );
};
