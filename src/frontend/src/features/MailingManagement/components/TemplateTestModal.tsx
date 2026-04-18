import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Input, Button } from '../../../shared/ui';
import type { MailTemplate } from '../types';
import styles from './TemplateTestModal.module.css';

function extractPlaceholders(text: string): string[] {
  // Scriban uses {{ ... }}. We keep it simple and extract plain identifiers.
  // Examples: {{ fullName }}, {{ user.name }}, {{ code }}
  const re = /\{\{\s*[-~]?\s*([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)\s*[-~]?\s*\}\}/g;
  const out = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const key = m[1];
    // Skip obvious reserved words (very small list)
    if (!key) continue;
    if (key === 'if' || key === 'for' || key === 'end' || key === 'else') continue;
    out.add(key);
  }
  return Array.from(out).sort((a, b) => a.localeCompare(b));
}

type TemplateTestModalProps = {
  isOpen: boolean;
  template: MailTemplate | null;
  onClose: () => void;
  onSend: (payload: { email: string; variables: Record<string, string> }) => Promise<void>;
  isSending?: boolean;
};

export const TemplateTestModal: React.FC<TemplateTestModalProps> = ({
  isOpen,
  template,
  onClose,
  onSend,
  isSending
}) => {
  const [email, setEmail] = useState('');
  const [vars, setVars] = useState<Record<string, string>>({});

  const keys = useMemo(() => {
    if (!template) return [];
    return Array.from(new Set([
      ...extractPlaceholders(template.subject || ''),
      ...extractPlaceholders(template.body || ''),
    ]));
  }, [template?.id]);

  useEffect(() => {
    if (!isOpen) return;
    setEmail('');
    const defaults: Record<string, string> = {
      fullName: 'Test Kullanıcısı',
      code: '123456',
      resetLink: 'https://wixi.test/reset-password',
    };
    const init: Record<string, string> = {};
    keys.forEach(k => {
      init[k] = defaults[k] ?? '';
    });
    setVars(init);
  }, [isOpen, template?.id, keys.join('|')]);

  const footer = (
    <div className={styles.footer}>
      <Button variant="ghost" onClick={onClose} disabled={!!isSending}>Vazgeç</Button>
      <Button
        variant="primary"
        onClick={() => onSend({ email, variables: vars })}
        isLoading={!!isSending}
        disabled={!template || !email}
      >
        Test Maili Gönder
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={template ? `Şablon Testi: ${template.code}` : 'Şablon Testi'}
      size="lg"
      footer={footer}
    >
      <div className={styles.body}>
        <div className={styles.grid}>
          <Input
            label="Test E-posta Adresi"
            placeholder="ornek@wixi.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {keys.length > 0 && (
          <>
            <div className={styles.sectionHeader}>
              <h4>Şablon Değişkenleri</h4>
              <p>Şablonda kullanılan alanları doldurun. Boş bırakırsanız bazı yerler boş görünür.</p>
            </div>

            <div className={styles.varsGrid}>
              {keys.map((k) => (
                <Input
                  key={k}
                  label={k}
                  placeholder={`${k} değeri...`}
                  value={vars[k] ?? ''}
                  onChange={(e) => setVars(prev => ({ ...prev, [k]: e.target.value }))}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

