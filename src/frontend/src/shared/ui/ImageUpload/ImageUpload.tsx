import React, { useState, useRef } from 'react';
import styles from './ImageUpload.module.css';
import { FaCamera, FaTrashAlt, FaUpload } from 'react-icons/fa';

interface ImageUploadProps {
  label?: string;
  value?: string | null; // Base64 or URL
  onChange?: (base64: string | null) => void;
  onFileChange?: (file: File | null) => void;
  shape?: 'circle' | 'square';
  size?: number;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  value,
  onChange,
  onFileChange,
  shape = 'circle',
  size = 120,
  error,
  hint = 'Maximum 2MB. JPG, PNG supported.',
  required,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [internalPreview, setInternalPreview] = useState<string | null>(null);

  const preview = value || internalPreview;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File is too large (max 2MB)');
        return;
      }

      onFileChange?.(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setInternalPreview(base64);
        onChange?.(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalPreview(null);
    onChange?.(null);
    onFileChange?.(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={styles.container}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.requiredAsterisk}>*</span>}
        </label>
      )}
      <div 
        className={`${styles.uploadBox} ${styles[shape]} ${error ? styles.hasError : ''}`}
        style={{ width: size, height: size }}
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Upload Preview" className={styles.preview} />
        ) : (
          <div className={styles.placeholder}>
            <FaUpload size={size * 0.25} />
            <span style={{ fontSize: '0.7rem', marginTop: '4px' }}>Yükle</span>
          </div>
        )}
        
        <div className={styles.overlay}>
          <FaCamera size={size * 0.2} />
        </div>

        <input 
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className={styles.hiddenInput}
          onChange={handleFileChange}
        />
      </div>

      <div className={styles.actions}>
        {preview && (
          <button type="button" className={styles.removeBtn} onClick={handleRemove}>
            <FaTrashAlt size={12} /> Kaldır
          </button>
        )}
        {hint && !error && <span className={styles.hint}>{hint}</span>}
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    </div>
  );
};
