import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';
import { FaTimes } from 'react-icons/fa';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdrop?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={`${styles.modal} ${styles[size]}`}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className={styles.content}>
          {children}
        </div>

        {footer && (
          <div className={styles.footer}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
