import { Link } from 'react-router-dom';
import s from './LandingFooter.module.css';

export function LandingFooter() {
  return (
    <footer className={s.footer}>
      <div className={`lp-container ${s.inner}`}>
        <div className={s.grid}>
          {/* Brand column */}
          <div className={s.brandCol}>
            <Link to="/" className={s.brand}>
              <span className={s.brandMark}>W</span>
              <span className={s.brandName}>WIXI<span className={s.dim}>APP</span></span>
            </Link>
            <p>KOBİ'ler için modüler SaaS platformu. E-Ticaret, CRM, İK ve dahası tek çatı altında.</p>
            <div className={s.social}>
              <a href="#" aria-label="Twitter" className={s.socialLink}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" aria-label="LinkedIn" className={s.socialLink}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/></svg>
              </a>
              <a href="#" aria-label="Instagram" className={s.socialLink}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" aria-label="YouTube" className={s.socialLink}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12z"/></svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className={s.col}>
            <h4>Ürün</h4>
            <ul>
              <li><Link to="/ozellikler">Özellikler</Link></li>
              <li><Link to="/moduller">Modüller</Link></li>
              <li><Link to="/studyo">Stüdyo</Link></li>
              <li><Link to="/fiyatlandirma">Fiyatlandırma</Link></li>
              <li><Link to="/nasil-calisir">Nasıl Çalışır?</Link></li>
              <li><Link to="/yol-haritasi">Yol Haritası</Link></li>
            </ul>
          </div>
          <div className={s.col}>
            <h4>Kaynaklar</h4>
            <ul>
              <li><Link to="/sss">SSS</Link></li>
              <li><a href="#">Yardım Merkezi</a></li>
              <li><a href="#">Dökümantasyon</a></li>
              <li><a href="#">API</a></li>
            </ul>
          </div>
          <div className={s.col}>
            <h4>Şirket</h4>
            <ul>
              <li><Link to="/hakkimizda">Hakkımızda</Link></li>
              <li><Link to="/iletisim">İletişim</Link></li>
              <li><a href="#">Kariyer</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>
          <div className={s.col}>
            <h4>Yasal</h4>
            <ul>
              <li><Link to="/kullanim-sartlari">Kullanım Şartları</Link></li>
              <li><Link to="/gizlilik">Gizlilik</Link></li>
              <li><Link to="/kvkk">KVKK</Link></li>
              <li><Link to="/cerezler">Çerezler</Link></li>
            </ul>
          </div>
        </div>

        <div className={s.bottom}>
          <div>© 2026 Wixi Teknoloji A.Ş. Tüm hakları saklıdır.</div>
          <div className={s.legal}>
            <span>🇹🇷 Türkçe</span>
            <span>İstanbul, Türkiye</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
