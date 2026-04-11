import React, { useState } from 'react';
import { FaUserEdit, FaSitemap, FaTimes, FaArrowRight, FaArrowLeft, FaSave } from 'react-icons/fa';
import { UserMenuBuilder } from './UserMenuBuilder';
import { UserDetailForm } from './UserDetailForm';
import styles from './UserManagementPage.module.css';

interface UserEditorModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
  onSave?: () => void;
}

export const UserEditorModal: React.FC<UserEditorModalProps> = ({ userId, userName, onClose, onSave }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [localUserName, setLocalUserName] = useState(userName);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.editorModal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.headerInfo}>
            <div className={styles.headerIcon}>
              {step === 1 ? <FaUserEdit /> : <FaSitemap />}
            </div>
            <div>
              <h3>Kullanıcı Düzenleme: {localUserName}</h3>
              <p>{step === 1 ? 'Kullanıcı temel bilgilerini ve profil resmini yönetin.' : 'Kullanıcıya özel menü hiyerarşisini yapılandırın.'}</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><FaTimes /></button>
        </div>

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

        <div className={styles.editorBody}>
          {step === 1 ? (
            <UserDetailForm 
              userId={userId} 
              onUserUpdated={(newName) => {
                setLocalUserName(newName);
              }}
              onNext={() => setStep(2)}
            />
          ) : (
            <UserMenuBuilder 
              userId={userId} 
              userName={localUserName} 
              onClose={onClose} 
              isEmbedded={true}
            />
          )}
        </div>

        <div className={styles.editorFooter}>
           {step === 2 && (
             <button className={styles.btnBack} onClick={() => setStep(1)}>
               <FaArrowLeft /> Geri: Kullanıcı Bilgileri
             </button>
           )}
           <div style={{ flex: 1 }} />
           {step === 1 ? (
             <button className={styles.btnNext} onClick={() => setStep(2)}>
               İleri: Menü Düzenle <FaArrowRight />
             </button>
           ) : (
             <button className={styles.btnFinish} onClick={onClose}>
               Kapat
             </button>
           )}
        </div>
      </div>
    </div>
  );
};
