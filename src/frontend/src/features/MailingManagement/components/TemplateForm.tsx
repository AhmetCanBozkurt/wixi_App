import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import type { MailTemplate } from '../types';
import { FaTimes, FaSave, FaInfoCircle } from 'react-icons/fa';
import styles from './TemplateForm.module.css';

interface TemplateFormProps {
  template?: MailTemplate;
  onSave: (template: Partial<MailTemplate>) => void;
  onCancel: () => void;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({
  template,
  onSave,
  onCancel
}) => {
  const emptyForm: Partial<MailTemplate> = { code: '', subject: '', body: '', category: '', isActive: true };

  const [formData, setFormData] = useState<Partial<MailTemplate>>(
    template ? { ...template } : emptyForm
  );

  const [editorMode, setEditorMode] = useState<'rich' | 'source' | 'preview'>('rich');

  // Handles re-open with a different template (edge case)
  useEffect(() => {
    setFormData(template ? { ...template } : emptyForm);
    setEditorMode('rich');
  }, [template?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.standardModal}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h3>{template ? 'Şablonu Düzenle' : 'Yeni Mail Şablonu'}</h3>
          <button onClick={onCancel} className={styles.closeBtn}>
            <FaTimes />
          </button>
        </div>

        <form className={styles.modalBody} onSubmit={handleSubmit}>
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Şablon Kodu</label>
              <input
                type="text"
                required
                value={formData.code ?? ''}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                placeholder="Örn: WELCOME_EMAIL"
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Kategori</label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                placeholder="Örn: Auth, System"
                className={styles.formInput}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Konu (Subject)</label>
            <input
              type="text"
              required
              value={formData.subject ?? ''}
              onChange={e => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Mail konusu..."
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className={styles.formLabel}>İçerik Editörü</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <FaInfoCircle />
                <span>Değişken kullanmak için {'{{'} field_name {'}}'} formatını kullanın.</span>
              </div>
            </div>
            
            <div className={styles.editorTabs}>
              <button 
                type="button" 
                className={`${styles.editorTab} ${editorMode === 'rich' ? styles.active : ''}`}
                onClick={() => setEditorMode('rich')}
              >
                📝 Görsel Editör
              </button>
              <button 
                type="button" 
                className={`${styles.editorTab} ${editorMode === 'source' ? styles.active : ''}`}
                onClick={() => setEditorMode('source')}
              >
                💻 Kaynak Kod (HTML)
              </button>
              <button 
                type="button" 
                className={`${styles.editorTab} ${editorMode === 'preview' ? styles.active : ''}`}
                onClick={() => setEditorMode('preview')}
              >
                👁️ Önizleme
              </button>
            </div>

            {editorMode === 'rich' && (
              <div className={styles.quillWrapper}>
                <ReactQuill
                  theme="snow"
                  value={formData.body}
                  onChange={(content) => setFormData({ ...formData, body: content })}
                  modules={modules}
                />
              </div>
            )}

            {editorMode === 'source' && (
              <div className={styles.sourceWrapper}>
                <textarea
                  className={styles.sourceCodeArea}
                  value={formData.body || ''}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="<div><h1>HTML Kodunuzu buraya yapıştırabilirsiniz.</h1></div>"
                />
              </div>
            )}

            {editorMode === 'preview' && (
              <div className={styles.previewWrapper}>
                <div dangerouslySetInnerHTML={{ __html: formData.body || '<p style="color:var(--text-muted);">İçerik boş.</p>' }} />
              </div>
            )}
            
          </div>

          <div className={styles.checkboxRow}>
            <label className={styles.switchContainer}>
              <div className={styles.switch}>
                <input
                  type="checkbox"
                  checked={formData.isActive ?? true}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span className={styles.slider}></span>
              </div>
              <span className={styles.switchText}>Aktif Şablon</span>
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button type="button" onClick={onCancel} className={styles.btnCancel}>
            İptal
          </button>
          <button onClick={handleSubmit} className={styles.btnSave}>
            <FaSave />
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};
