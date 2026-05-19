import { useRef, useState, useCallback, useEffect } from 'react';
import { FaImage, FaUpload, FaTimes } from 'react-icons/fa';
import s from './ImageUploadField.module.css';

interface Props {
  value: string;
  onChange: (url: string) => void;
  onFileStaged?: (file: File | null) => void;
  aspectRatio?: 'square' | 'banner' | 'logo';
  label?: string;
}

export const ImageUploadField = ({ value, onChange, onFileStaged, aspectRatio = 'banner', label }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const handleFiles = useCallback((files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    const blobUrl = URL.createObjectURL(file);
    blobUrlRef.current = blobUrl;
    onChange(blobUrl);
    onFileStaged?.(file);
  }, [onChange, onFileStaged]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const clear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    onChange('');
    onFileStaged?.(null);
    if (inputRef.current) inputRef.current.value = '';
  }, [onChange, onFileStaged]);

  const heightClass = aspectRatio === 'square' ? s.square : aspectRatio === 'logo' ? s.logo : s.banner;

  return (
    <div className={s.root}>
      {label && <span className={s.fieldLabel}>{label}</span>}
      <div
        className={`${s.dropZone} ${heightClass} ${isDragging ? s.dragging : ''}`}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        aria-label="Görsel yükle"
      >
        {value ? (
          <>
            <img
              src={value}
              alt="önizleme"
              className={`${s.preview} ${aspectRatio === 'logo' ? s.previewContain : ''}`}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <button type="button" className={s.clearBtn} onClick={clear} aria-label="Görseli kaldır">
              <FaTimes size={12} />
            </button>
          </>
        ) : (
          <div className={s.placeholder}>
            {isDragging ? <FaUpload size={24} /> : <FaImage size={24} />}
            <span>{isDragging ? 'Bırakın' : 'Görsel seçin veya sürükleyin'}</span>
            <small>JPG, PNG, WEBP, GIF, SVG · maks 10 MB</small>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        className={s.hiddenInput}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
};
