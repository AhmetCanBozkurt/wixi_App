import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './MasterStorefrontPage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5181';

export const MasterStorefrontPage: React.FC = () => {
  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const modules = [
    { id: 'ecommerce', name: 'E-Ticaret', icon: '🛍️', desc: 'Sınırsız ürün, kategori ve sipariş yönetimi.' },
    { id: 'notes', name: 'Notlar & Dokümanlar', icon: '📝', desc: 'Ekibinizle gerçek zamanlı not paylaşımı.' },
    { id: 'crm', name: 'CRM', icon: '🤝', desc: 'Müşteri ilişkileri ve satış takibi.' },
    { id: 'tasks', name: 'Görev Takibi', icon: '✅', desc: 'Projelerinizi ve ekibinizi yönetin.' }
  ];

  const [selectedModules, setSelectedModules] = useState<string[]>(['ecommerce']);

  const toggleModule = (id: string) => {
    if (selectedModules.includes(id)) {
      setSelectedModules(selectedModules.filter(m => m !== id));
    } else {
      setSelectedModules([...selectedModules, id]);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !slug || !email) {
      toast.error('Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/saas/onboarding/register`, {
        storeName,
        slug,
        ownerEmail: email,
        selectedModules
      });

      toast.success(response.data.message);
      // Redirect to admin or show success
      setTimeout(() => {
        window.location.href = response.data.adminUrl;
      }, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="master-storefront">
      <header className="master-header">
        <div className="logo-area">
          <span className="logo-text">WIXI<span>APP</span></span>
        </div>
        <nav>
          <a href="#features">Özellikler</a>
          <a href="#pricing">Fiyatlandırma</a>
          <button className="btn-primary" onClick={() => setShowRegister(true)}>Hemen Başla</button>
        </nav>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-content">
            <h1>İşinizi <span className="gradient-text">Geleceğe</span> Taşıyın.</h1>
            <p>Modüler yapısı ile ihtiyacınız olan tüm araçlar tek bir platformda. E-Ticaret, CRM, Notlar ve daha fazlası.</p>
            <div className="hero-btns">
              <button className="btn-large btn-primary" onClick={() => setShowRegister(true)}>Ücretsiz Deneyin</button>
              <button className="btn-large btn-secondary">Demo İzle</button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="glass-card">
                <div className="card-header">Sistem Özeti</div>
                <div className="stat-row">
                    <span>Aktif Mağazalar</span>
                    <strong>1,250+</strong>
                </div>
                <div className="stat-row">
                    <span>Aylık İşlem</span>
                    <strong>₺4.5M+</strong>
                </div>
            </div>
          </div>
        </section>

        {showRegister && (
          <div className="register-modal-overlay">
            <div className="register-modal">
              <button className="close-btn" onClick={() => setShowRegister(false)}>&times;</button>
              <h2>Mağazanızı Oluşturun</h2>
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label>Mağaza Adı</label>
                  <input 
                    type="text" 
                    placeholder="Örn: My Awesome Shop" 
                    value={storeName} 
                    onChange={e => setStoreName(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label>Mağaza URL (Slug)</label>
                  <div className="slug-input-wrapper">
                    <input 
                      type="text" 
                      placeholder="my-shop" 
                      value={slug} 
                      onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} 
                    />
                    <span className="slug-suffix">.wixi.com</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>E-Posta Adresiniz</label>
                  <input 
                    type="email" 
                    placeholder="admin@example.com" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                  />
                </div>

                <div className="module-selection">
                  <label>Aktif Edilecek Modüller</label>
                  <div className="module-grid">
                    {modules.map(m => (
                      <div 
                        key={m.id} 
                        className={`module-item ${selectedModules.includes(m.id) ? 'active' : ''}`}
                        onClick={() => toggleModule(m.id)}
                      >
                        <span className="module-icon">{m.icon}</span>
                        <span className="module-name">{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Sistem Hazırlanıyor...' : 'Mağazamı Kur'}
                </button>
              </form>
            </div>
          </div>
        )}

        <section id="features" className="features-section">
            <h2 className="section-title">Neden WIXI?</h2>
            <div className="feature-grid">
                {modules.map(m => (
                    <div className="feature-card" key={m.id}>
                        <div className="f-icon">{m.icon}</div>
                        <h3>{m.name}</h3>
                        <p>{m.desc}</p>
                    </div>
                ))}
            </div>
        </section>
      </main>

      <footer className="master-footer">
        <p>&copy; 2026 WixiApp SaaS Platform. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
};
