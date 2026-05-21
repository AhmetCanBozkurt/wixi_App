import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5182/api/v1';

interface ModuleDef {
  id: string;
  name: string;
  icon: string;
}

const MODULES: ModuleDef[] = [
  { id: 'ecommerce', name: 'E-Ticaret', icon: '🛍️' },
  { id: 'notes', name: 'Notlar & Dokümanlar', icon: '📝' },
  { id: 'crm', name: 'CRM', icon: '🤝' },
  { id: 'tasks', name: 'Görev Takibi', icon: '✅' },
];

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan?: string;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
}) => {
  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>(['ecommerce']);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    firstInputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-{2,}/g, '-'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeName.trim() || !slug.trim() || !email.trim()) {
      toast.error('Lütfen tüm alanları doldurun.');
      return;
    }

    if (selectedModules.length === 0) {
      toast.error('En az bir modül seçmelisiniz.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/saas/onboarding/register`, {
        storeName: storeName.trim(),
        slug: slug.trim(),
        ownerEmail: email.trim(),
        selectedModules,
        plan: selectedPlan ?? 'free',
      });

      toast.success(response.data.message ?? 'Mağazanız hazırlanıyor...');
      setTimeout(() => {
        if (response.data.adminUrl) {
          window.location.href = response.data.adminUrl;
        }
      }, 2000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.error ?? 'Bir hata oluştu. Lütfen tekrar deneyin.');
      } else {
        toast.error('Beklenmeyen bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="landing-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={handleOverlayClick}
    >
      <div className="landing-modal-panel" ref={panelRef}>
        <button
          className="landing-modal-close"
          onClick={onClose}
          aria-label="Modalı kapat"
        >
          ✕
        </button>

        <h2 id="modal-title" className="landing-modal-title">
          Mağazanızı Kurun
        </h2>
        <p className="landing-modal-subtitle">
          30 saniyede hazır, kredi kartı gerekmez.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="landing-modal-form-group">
            <label htmlFor="modal-store-name">Mağaza Adı</label>
            <input
              id="modal-store-name"
              ref={firstInputRef}
              type="text"
              placeholder="Örn: My Awesome Shop"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              autoComplete="organization"
            />
          </div>

          <div className="landing-modal-form-group">
            <label htmlFor="modal-slug">Mağaza URL</label>
            <div className="landing-modal-slug-wrap">
              <input
                id="modal-slug"
                type="text"
                placeholder="my-shop"
                value={slug}
                onChange={handleSlugChange}
                autoComplete="off"
              />
              <span className="landing-modal-slug-suffix">.wixi.app</span>
            </div>
          </div>

          <div className="landing-modal-form-group">
            <label htmlFor="modal-email">E-Posta Adresiniz</label>
            <input
              id="modal-email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <span className="landing-modal-modules-label">Aktif Edilecek Modüller</span>
          <div className="landing-modal-modules-grid">
            {MODULES.map((mod) => {
              const pressed = selectedModules.includes(mod.id);
              return (
                <button
                  key={mod.id}
                  type="button"
                  role="button"
                  aria-pressed={pressed}
                  className="landing-modal-module-tile"
                  onClick={() => toggleModule(mod.id)}
                >
                  <span className="landing-modal-module-icon">{mod.icon}</span>
                  <span>{mod.name}</span>
                </button>
              );
            })}
          </div>

          <button
            type="submit"
            className="landing-modal-submit"
            disabled={loading}
          >
            {loading ? 'Sistem Hazırlanıyor...' : 'Mağazamı Kur'}
          </button>
        </form>
      </div>
    </div>
  );
};
