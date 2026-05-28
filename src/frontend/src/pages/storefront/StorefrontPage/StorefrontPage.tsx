import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './StorefrontPage.module.css';
import { storefrontApi } from '../../../entities/StorePage/api/storePageApi';
import { DEFAULT_THEME, themeToVars, mergeTheme } from '../../../entities/StorePage/model/defaultTheme';
import type { StorePage, ThemeConfig, LayoutComponent, LayoutRow, Backlink } from '../../../entities/StorePage/model/types';
import { migrateLayout } from '../../../features/ThemeBuilder/context/EditorContext';
import { ShadowHtml } from '../../../shared/ui/ShadowHtml/ShadowHtml';

// ── Block renderers ───────────────────────────────────────────────────────────

function HeroBlock({ props, theme }: { props: Record<string, unknown>; theme: ThemeConfig }) {
  const height = (props.height as string) || '560px';
  const opacity = typeof props.overlayOpacity === 'number' ? props.overlayOpacity : 0.4;
  return (
    <div
      className={styles.hero}
      style={{
        height,
        backgroundImage: props.imageUrl ? `url(${props.imageUrl as string})` : 'none',
      }}
    >
      <div
        className={styles.heroOverlay}
        style={{ background: `rgba(0,0,0,${opacity})` }}
      >
        <h1>{props.title as string}</h1>
        {!!props.subtitle && <p>{props.subtitle as string}</p>}
        {!!props.buttonText && (
          <Link to={(props.buttonLink as string) || '#'} className={styles.heroBtn}
            style={{ background: theme.colors.primary }}>
            {props.buttonText as string}
          </Link>
        )}
      </div>
    </div>
  );
}

function HeroSplitBlock({ props, theme }: { props: Record<string, unknown>; theme: ThemeConfig }) {
  const isRight = props.imagePosition === 'right';
  return (
    <div className={`${styles.heroSplit} ${isRight ? '' : styles.reverse}`}>
      <div className={styles.heroSplitText}>
        {!!props.subtitle && <h2 style={{ color: theme.colors.primary }}>{props.subtitle as string}</h2>}
        <h1>{props.title as string}</h1>
        {!!props.text && <p>{props.text as string}</p>}
        {!!props.buttonText && (
          <Link to={(props.buttonLink as string) || '#'} className={styles.heroBtn}
            style={{ background: theme.colors.primary }}>
            {props.buttonText as string}
          </Link>
        )}
      </div>
      <div className={styles.heroSplitImg}>
        {props.imageUrl
          ? <img src={props.imageUrl as string} alt={props.title as string} />
          : <div style={{ height: '360px', background: '#f3f4f6' }} />
        }
      </div>
    </div>
  );
}

function FeaturedProductsBlock({ props, theme, tenantSlug }: { props: Record<string, unknown>; theme: ThemeConfig; tenantSlug: string }) {
  const [products, setProducts] = useState<{ id: string; name: string; slug: string; basePrice: number; mainImageUrl?: string }[]>([]);
  const cols = parseInt(String(props.columns || 4));

  useEffect(() => {
    const limit = parseInt(String(props.limit || 8));
    type ProductItem = { id: string; name: string; slug: string; basePrice: number; mainImageUrl?: string };
    storefrontApi.getProducts(tenantSlug, { featured: true, limit, isActive: true })
      .then((res) => {
        const data = res.data as { items: ProductItem[] };
        const featured = data.items || [];
        if (featured.length > 0) { setProducts(featured); return; }
        // Hiç featured ürün yoksa tüm aktif ürünleri göster
        return storefrontApi.getProducts(tenantSlug, { limit, isActive: true });
      })
      .then((fallback) => {
        if (!fallback) return;
        const data = fallback.data as { items: ProductItem[] };
        setProducts(data.items || []);
      })
      .catch(() => {});
  }, [tenantSlug, props.limit]);

  return (
    <div className={styles.sectionInner}>
      <h2 className={styles.sectionTitle}>{props.title as string}</h2>
      <div
        className={styles.productsGrid}
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {products.map(p => (
          <Link key={p.id} to={`/store/${tenantSlug}/product/${p.slug}`} className={styles.productCard} style={{ textDecoration: 'none' }}>
            <div className={styles.productImg} style={{ background: '#f3f4f6', height: '200px', overflow: 'hidden' }}>
              {p.mainImageUrl && <img src={p.mainImageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <div className={styles.productInfo}>
              <div className={styles.productName}>{p.name}</div>
              <div className={styles.productPrice} style={{ color: theme.colors.primary }}>₺{p.basePrice.toFixed(2)}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function CategoriesGridBlock({ props, tenantSlug }: { props: Record<string, unknown>; theme: ThemeConfig; tenantSlug: string }) {
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const cols = parseInt(String(props.columns || 3));

  useEffect(() => {
    storefrontApi.getCategories(tenantSlug)
      .then((res) => setCategories((res.data as { id: string; name: string; slug: string }[]) || []))
      .catch(() => {});
  }, [tenantSlug]);

  return (
    <div className={styles.sectionInner}>
      <h2 className={styles.sectionTitle}>{props.title as string}</h2>
      <div className={styles.categoriesGrid} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {categories.map(c => (
          <Link key={c.id} to={`/store/${tenantSlug}/category/${c.slug}`} className={styles.categoryCard} style={{ textDecoration: 'none' }}>
            <div className={styles.categoryImg} style={{ background: '#f3f4f6' }} />
            <div className={styles.categoryName}>{c.name}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function TextImageBlock({ props }: { props: Record<string, unknown> }) {
  const isRight = props.imagePosition === 'right';
  return (
    <div className={styles.sectionInner}>
      <div className={`${styles.textImage} ${isRight ? styles.reverse : ''}`}>
        <div className={styles.textImageContent}>
          <h3>{props.title as string}</h3>
          {!!props.text && <p>{props.text as string}</p>}
        </div>
        <div className={styles.textImageImg}>
          {props.imageUrl
            ? <img src={props.imageUrl as string} alt={props.title as string} />
            : <div style={{ height: '360px', background: '#f3f4f6' }} />
          }
        </div>
      </div>
    </div>
  );
}

function StatsBarBlock({ props }: { props: Record<string, unknown> }) {
  const items = (props.items as { icon?: string; value: string; label: string }[]) || [];
  return (
    <div className={styles.statsBar}>
      <div className={styles.statsGrid}>
        {items.map((item, i) => (
          <div key={i} className={styles.statItem}>
            <div className={styles.statValue}>{item.value}</div>
            <div className={styles.statLabel}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TestimonialsBlock({ props, tenantSlug }: { props: Record<string, unknown>; tenantSlug: string }) {
  const fallbackItems = (props.items as { name: string; role: string; quote: string; rating: number }[]) || [];
  const [apiItems, setApiItems] = useState<{ customerName: string; customerTitle?: string; quote: string; rating: number }[]>([]);

  useEffect(() => {
    storefrontApi.getTestimonials(tenantSlug)
      .then((res) => {
        type TestimonialItem = { customerName: string; customerTitle?: string; quote: string; rating: number };
        const data = res.data as { items: TestimonialItem[] } | TestimonialItem[];
        const list = Array.isArray(data) ? data : (data.items ?? []);
        if (list.length > 0) setApiItems(list);
      })
      .catch(() => {});
  }, [tenantSlug]);

  const displayItems = apiItems.length > 0
    ? apiItems.map((t) => ({ name: t.customerName, role: t.customerTitle ?? '', quote: t.quote, rating: t.rating }))
    : fallbackItems;

  return (
    <div className={styles.sectionInner}>
      <h2 className={styles.sectionTitle}>{props.title as string}</h2>
      <div className={styles.testimonialsGrid}
        style={{ gridTemplateColumns: `repeat(auto-fit, minmax(280px, 1fr))` }}>
        {displayItems.map((t, i) => (
          <div key={i} className={styles.testimonialCard}>
            <div className={styles.testimonialStars}>{'★'.repeat(t.rating || 5)}</div>
            <p className={styles.testimonialQuote}>"{t.quote}"</p>
            <div className={styles.testimonialAuthor}>{t.name}</div>
            {!!t.role && <div className={styles.testimonialRole}>{t.role}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function SliderBlock({ props, tenantSlug }: { props: Record<string, unknown>; tenantSlug: string }) {
  const sliderId = (props.sliderId as string) || '';
  const height = (props.height as string) || '500px';

  type Slide = { id: string; imageUrl: string; title?: string; subtitle?: string; buttonText?: string; buttonUrl?: string };
  type SliderData = { autoPlay: boolean; autoPlayInterval: number; showDots: boolean; showArrows: boolean; slides: Slide[] };

  const [sliderData, setSliderData] = useState<SliderData | null>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!sliderId) return;
    storefrontApi.getSlider(tenantSlug, sliderId)
      .then(res => { setSliderData(res.data as SliderData); })
      .catch(() => {/* slider id yoksa boş kalır */});
  }, [sliderId, tenantSlug]);

  useEffect(() => {
    if (!sliderData?.autoPlay || !sliderData.slides.length) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % sliderData.slides.length), sliderData.autoPlayInterval || 4000);
    return () => clearInterval(t);
  }, [sliderData]);

  if (!sliderId) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', color: '#9ca3af' }}>
        Slider ID belirtilmedi
      </div>
    );
  }

  if (!sliderData || sliderData.slides.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', color: '#9ca3af' }}>
        Slayt yükleniyor...
      </div>
    );
  }

  const slide = sliderData.slides[current];
  const prev = () => setCurrent(c => (c - 1 + sliderData.slides.length) % sliderData.slides.length);
  const next = () => setCurrent(c => (c + 1) % sliderData.slides.length);

  return (
    <div style={{ position: 'relative', height, overflow: 'hidden', background: '#111' }}>
      <img src={slide.imageUrl} alt={slide.title || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      {(!!slide.title || !!slide.subtitle || !!slide.buttonText) && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)', color: '#fff', textAlign: 'center', padding: '24px' }}>
          {!!slide.title && <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px' }}>{slide.title}</h2>}
          {!!slide.subtitle && <p style={{ fontSize: '1.1rem', marginBottom: '20px', opacity: 0.9 }}>{slide.subtitle}</p>}
          {!!slide.buttonText && <a href={slide.buttonUrl || '#'} style={{ padding: '10px 28px', background: '#ec4899', color: '#fff', borderRadius: '6px', fontWeight: 700, textDecoration: 'none' }}>{slide.buttonText}</a>}
        </div>
      )}
      {sliderData.showArrows && sliderData.slides.length > 1 && (
        <>
          <button onClick={prev} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.4)', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '18px' }}>‹</button>
          <button onClick={next} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.4)', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '18px' }}>›</button>
        </>
      )}
      {sliderData.showDots && sliderData.slides.length > 1 && (
        <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
          {sliderData.slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{ width: '10px', height: '10px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: i === current ? '#fff' : 'rgba(255,255,255,0.4)' }} />
          ))}
        </div>
      )}
    </div>
  );
}

function FaqBlock({ props, tenantSlug }: { props: Record<string, unknown>; tenantSlug: string }) {
  const title = (props.title as string) || 'Sık Sorulan Sorular';
  const category = (props.category as string) || undefined;
  const maxItems = Number(props.maxItems) || 10;

  type FaqItem = { id: string; question: string; answer: string; category?: string };
  const [items, setItems] = useState<FaqItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    storefrontApi.getFaq(tenantSlug, category)
      .then(res => {
        const data = res.data as { items: FaqItem[] } | FaqItem[];
        const list = Array.isArray(data) ? data : (data.items ?? []);
        setItems(list.slice(0, maxItems));
      })
      .catch(() => {/* ağ hatası */});
  }, [tenantSlug, category, maxItems]);

  return (
    <div className={styles.sectionInner}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '720px', margin: '0 auto' }}>
        {items.length === 0 && (
          <p style={{ textAlign: 'center', color: '#9ca3af' }}>Henüz soru-cevap eklenmedi.</p>
        )}
        {items.map(faq => (
          <div key={faq.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            <button
              onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
              style={{ width: '100%', padding: '14px 18px', fontWeight: 600, cursor: 'pointer', background: 'transparent', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', fontSize: '15px' }}
            >
              {faq.question}
              <span style={{ fontSize: '1.3rem', opacity: 0.5, flexShrink: 0, marginLeft: '12px' }}>{openId === faq.id ? '−' : '+'}</span>
            </button>
            {openId === faq.id && (
              <p style={{ padding: '0 18px 16px', margin: 0, color: '#6b7280', lineHeight: 1.7 }}>{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactFormNewBlock({ props, theme, tenantSlug }: { props: Record<string, unknown>; theme: ThemeConfig; tenantSlug: string }) {
  const showPhone = !!props.showPhone;
  const showSubject = !!props.showSubject;
  const buttonColor = (props.buttonColor as string) || theme.colors.primary;
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await storefrontApi.submitContactNew(tenantSlug, {
        fullName: form.name,
        email: form.email,
        phone: form.phone || undefined,
        subject: form.subject || undefined,
        message: form.message,
      });
      setSubmitted(true);
      toast.success((props.successMessage as string) || 'Mesajınız gönderildi!');
    } catch {
      toast.error('Mesaj gönderilirken hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.sectionInner}>
      <h2 className={styles.sectionTitle}>{(props.title as string) || 'Bize Ulaşın'}</h2>
      {!!props.subtitle && <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '24px' }}>{props.subtitle as string}</p>}
      {submitted
        ? <p style={{ textAlign: 'center', color: theme.colors.success, fontWeight: 600 }}>{(props.successMessage as string) || 'Mesajınız alındı!'}</p>
        : (
          <form className={styles.contactForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Adınız</label>
              <input type="text" className={styles.formInput} required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>E-posta</label>
              <input type="email" className={styles.formInput} required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            {showPhone && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Telefon</label>
                <input type="tel" className={styles.formInput} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
            )}
            {showSubject && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Konu</label>
                <input type="text" className={styles.formInput} value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
              </div>
            )}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Mesajınız</label>
              <textarea className={styles.formTextarea} required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
            </div>
            <button type="submit" className={styles.formSubmit} disabled={isLoading}
              style={{ background: buttonColor }}>
              {isLoading ? 'Gönderiliyor...' : ((props.buttonText as string) || 'Gönder')}
            </button>
          </form>
        )
      }
    </div>
  );
}

function CountdownBlock({ props, theme }: { props: Record<string, unknown>; theme: ThemeConfig }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(props.targetDate as string).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [props.targetDate]);

  return (
    <div className={styles.countdown} style={{ background: theme.colors.primary }}>
      <h3 className={styles.countdownTitle}>{props.title as string}</h3>
      {!!props.message && <p className={styles.countdownMessage}>{props.message as string}</p>}
      <div className={styles.countdownTimer}>
        {[{ v: timeLeft.days, l: 'Gün' }, { v: timeLeft.hours, l: 'Saat' }, { v: timeLeft.minutes, l: 'Dakika' }, { v: timeLeft.seconds, l: 'Saniye' }].map(u => (
          <div key={u.l} className={styles.countdownUnit}>
            <div className={styles.countdownValue}>{String(u.v).padStart(2, '0')}</div>
            <div className={styles.countdownLabel}>{u.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PromoBannerBlock({ props, tenantSlug }: { props: Record<string, unknown>; tenantSlug: string }) {
  const [dismissed, setDismissed] = useState(false);

  type BannerData = { id: string; title: string; subtitle?: string; imageUrl?: string; buttonText?: string; buttonUrl?: string; backgroundColor?: string; textColor?: string; layout: string };
  const [banner, setBanner] = useState<BannerData | null>(null);

  useEffect(() => {
    storefrontApi.getPromoBanners(tenantSlug)
      .then(res => {
        const data = res.data as { items: BannerData[] } | BannerData[];
        const list = Array.isArray(data) ? data : (data.items ?? []);
        if (list.length > 0) setBanner(list[0]);
      })
      .catch(() => {/* statik props'a fall-back */});
  }, [tenantSlug]);

  if (dismissed) return null;

  // DB verisi geldiyse onu göster, yoksa statik props'a düş
  const bg    = banner?.backgroundColor ?? (props.backgroundColor as string) ?? '#ec4899';
  const color = banner?.textColor       ?? (props.textColor      as string) ?? '#ffffff';
  const title = banner?.title           ?? (props.message        as string) ?? '';
  const btnTxt = banner?.buttonText     ?? (props.buttonText     as string);
  const btnUrl = banner?.buttonUrl      ?? (props.buttonLink     as string) ?? '#';

  if (!title) return null;

  return (
    <div className={styles.promoBanner} style={{ background: bg, color }}>
      <span className={styles.promoBannerText}>{title}</span>
      {!!banner?.subtitle && <span style={{ opacity: 0.85, marginLeft: '8px', fontSize: '0.9em' }}>{banner.subtitle}</span>}
      {!!btnTxt && (
        <a href={btnUrl} className={styles.promoBannerBtn} style={{ color }}>
          {btnTxt}
        </a>
      )}
      {!!props.dismissable && (
        <button className={styles.promoBannerClose} onClick={() => setDismissed(true)} style={{ color }} aria-label="Kapat">×</button>
      )}
    </div>
  );
}

function BrandLogosBlock({ props, tenantSlug }: { props: Record<string, unknown>; tenantSlug: string }) {
  const staticLogos = (props.logos as { imageUrl: string; link?: string }[]) || [];
  type BrandItem = { id: string; name: string; logoUrl?: string; websiteUrl?: string };
  const [dbBrands, setDbBrands] = useState<BrandItem[]>([]);

  useEffect(() => {
    storefrontApi.getBrands(tenantSlug)
      .then(res => {
        const data = res.data as BrandItem[];
        if (Array.isArray(data)) setDbBrands(data.filter(b => b.logoUrl));
      })
      .catch(() => {});
  }, [tenantSlug]);

  // DB markalarını (logosu olanlar) tercih et, yoksa tema editöründen gelen statik logolara düş
  const logos: { imageUrl: string; link?: string; name?: string }[] = dbBrands.length > 0
    ? dbBrands.map(b => ({ imageUrl: b.logoUrl!, link: b.websiteUrl, name: b.name }))
    : staticLogos;

  return (
    <div className={styles.sectionInner}>
      {!!props.title && <h2 className={styles.sectionTitle}>{props.title as string}</h2>}
      <div className={styles.brandsGrid}>
        {logos.length === 0
          ? <p style={{ color: '#9ca3af' }}>Henüz marka logosu eklenmedi.</p>
          : logos.map((l, i) => (
            <a key={i} href={l.link || '#'} title={l.name}>
              <img src={l.imageUrl} alt={l.name || 'Marka'} className={styles.brandLogo} />
            </a>
          ))
        }
      </div>
    </div>
  );
}

function VideoEmbedBlock({ props }: { props: Record<string, unknown> }) {
  const url = props.url as string;
  let embedUrl = '';
  if (url) {
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
    if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}${props.autoplay ? '?autoplay=1&mute=1' : ''}`;
    const vimMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimMatch) embedUrl = `https://player.vimeo.com/video/${vimMatch[1]}`;
  }
  return (
    <div className={styles.sectionInner}>
      {!!props.title && <h2 className={styles.sectionTitle}>{props.title as string}</h2>}
      <div className={styles.videoWrapper}>
        {embedUrl
          ? <iframe src={embedUrl} allowFullScreen title={props.title as string} />
          : <div style={{ height: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Geçerli bir YouTube veya Vimeo URL girin</div>
        }
      </div>
    </div>
  );
}

function RichTextBlock({ props }: { props: Record<string, unknown> }) {
  return (
    <div className={styles.sectionInner}>
      <div
        className={styles.richText}
        dangerouslySetInnerHTML={{ __html: (props.html as string) || '' }}
      />
    </div>
  );
}

function NewsletterBlock({ props, theme, tenantSlug }: { props: Record<string, unknown>; theme: ThemeConfig; tenantSlug: string }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await storefrontApi.subscribeNewsletter(tenantSlug, email);
      setSubmitted(true);
      toast.success((props.successMessage as string) || 'Abone oldunuz!');
    } catch {
      toast.error('Abonelik sırasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.newsletter} ${styles.sectionInner}`}>
      <h3>{props.title as string}</h3>
      {!!props.text && <p>{props.text as string}</p>}
      {submitted
        ? <p style={{ color: theme.colors.success, fontWeight: 600 }}>{props.successMessage as string}</p>
        : (
          <form className={styles.newsletterForm} onSubmit={handleSubmit}>
            <input
              type="email"
              className={styles.newsletterInput}
              placeholder="E-posta adresiniz"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button type="submit" className={styles.newsletterBtn} disabled={isLoading}
              style={{ background: theme.colors.primary }}>
              {isLoading ? 'Gönderiliyor...' : (props.buttonText as string || 'Abone Ol')}
            </button>
          </form>
        )
      }
    </div>
  );
}

/**
 * CustomHtmlBlock — Custom HTML + CSS + Script içeriklerini
 * Shadow DOM kullanarak sayfanın geri kalanından tamamen izole eder.
 *
 * - İçerideki <style> ve <script> tag'ları sadece bu shadow root'u etkiler.
 * - Dış sayfanın CSS'i içeri sızmaz.
 */
function CustomHtmlBlock({ props }: { props: Record<string, unknown> }) {
  const html = (props.html as string) || '';
  return (
    <div className={styles.sectionInner}>
      <ShadowHtml
        html={html}
        style={{ display: 'block', width: '100%' }}
        addReset={true}
      />
    </div>
  );
}

// ── Corporate Block Renderers ─────────────────────────────────────────────────

function HeroCorporateBlock({ props, theme }: { props: Record<string, unknown>; theme: ThemeConfig }) {
  const height = (props.height as string) || '640px';
  const opacity = typeof props.overlayOpacity === 'number' ? props.overlayOpacity : 0.55;
  const trustBadges = (props.trustBadges as { text: string }[]) || [];
  return (
    <div style={{
      minHeight: height, position: 'relative',
      backgroundImage: props.imageUrl ? `url(${props.imageUrl as string})` : 'none',
      background: props.imageUrl ? undefined : 'linear-gradient(135deg,#1e293b 0%,#0f172a 100%)',
      backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${opacity})` }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', padding: '80px 48px', width: '100%' }}>
        <h1 style={{ color: '#fff', fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '20px' }}>
          {props.title as string}
        </h1>
        {!!props.subtitle && (
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.15rem', lineHeight: 1.75, marginBottom: '36px', maxWidth: '660px' }}>
            {props.subtitle as string}
          </p>
        )}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '36px' }}>
          {!!props.primaryButtonText && (
            <Link to={(props.primaryButtonLink as string) || '#'} style={{ background: theme.colors.primary, color: '#fff', padding: '14px 32px', borderRadius: theme.borderRadius.button, fontWeight: 700, textDecoration: 'none', fontSize: '1rem' }}>
              {props.primaryButtonText as string}
            </Link>
          )}
          {!!props.secondaryButtonText && (
            <Link to={(props.secondaryButtonLink as string) || '#'} style={{ background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.6)', padding: '14px 32px', borderRadius: theme.borderRadius.button, fontWeight: 600, textDecoration: 'none', fontSize: '1rem' }}>
              {props.secondaryButtonText as string}
            </Link>
          )}
        </div>
        {trustBadges.length > 0 && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {trustBadges.map((b, i) => (
              <span key={i} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500 }}>
                ✓ {b.text}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AboutCompanyBlock({ props, theme }: { props: Record<string, unknown>; theme: ThemeConfig }) {
  const isRight = props.imagePosition !== 'left';
  const stats = (props.stats as { value: string; label: string }[]) || [];
  return (
    <div className={styles.sectionInner}>
      {!!props.subtitle && <p style={{ textAlign: 'center', color: theme.colors.primary, fontWeight: 600, marginBottom: '8px', fontSize: '1.05rem' }}>{props.subtitle as string}</p>}
      <h2 className={styles.sectionTitle}>{props.title as string}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ order: isRight ? 0 : 1 }}>
          <div style={{ color: '#4b5563', lineHeight: 1.85, fontSize: '1.05rem', marginBottom: '24px' }}
            dangerouslySetInnerHTML={{ __html: (props.text as string || '').replace(/\n/g, '<br>') }} />
          {Boolean(props.showMissionVision) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[{ t: props.missionTitle, d: props.missionText }, { t: props.visionTitle, d: props.visionText }].map((mv, i) => (
                <div key={i} style={{ borderLeft: `4px solid ${theme.colors.primary}`, paddingLeft: '16px', background: '#f8fafc', borderRadius: '0 8px 8px 0', padding: '16px 16px 16px 16px' }}>
                  <div style={{ color: theme.colors.primary, fontWeight: 700, marginBottom: '8px', fontSize: '0.95rem' }}>{mv.t as string}</div>
                  <p style={{ fontSize: '0.88rem', color: '#6b7280', margin: 0, lineHeight: 1.65 }}>{mv.d as string}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ order: isRight ? 1 : 0 }}>
          {props.imageUrl
            ? <img src={props.imageUrl as string} alt={props.title as string} style={{ width: '100%', borderRadius: '16px', objectFit: 'cover', maxHeight: '440px' }} />
            : <div style={{ height: '360px', background: `${theme.colors.primary}11`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>🏢</div>
          }
        </div>
      </div>
      {Boolean(props.showStats) && stats.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`, gap: '24px', background: `${theme.colors.primary}08`, borderRadius: '16px', padding: '36px' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.6rem', fontWeight: 800, color: theme.colors.primary, lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: '#6b7280', marginTop: '8px', fontSize: '0.9rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TeamGridBlock({ props, theme }: { props: Record<string, unknown>; theme: ThemeConfig }) {
  const items = (props.items as { name: string; role: string; bio?: string; imageUrl?: string; linkedIn?: string; twitter?: string; email?: string }[]) || [];
  const cols = parseInt(String(props.columns || 3));
  return (
    <div className={styles.sectionInner}>
      <h2 className={styles.sectionTitle}>{props.title as string}</h2>
      {!!props.subtitle && <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '40px', fontSize: '1.05rem' }}>{props.subtitle as string}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cols, 4)}, 1fr)`, gap: '24px' }}>
        {items.map((m, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '32px 20px', textAlign: 'center', transition: 'transform 0.25s, box-shadow 0.25s' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-6px)'; el.style.boxShadow = '0 16px 40px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = ''; }}>
            {m.imageUrl
              ? <img src={m.imageUrl} alt={m.name} style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 16px', display: 'block', border: `3px solid ${theme.colors.primary}33` }} />
              : <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: `${theme.colors.primary}18`, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', color: theme.colors.primary, fontWeight: 700 }}>{m.name.charAt(0)}</div>
            }
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#111827', marginBottom: '4px' }}>{m.name}</div>
            <div style={{ color: theme.colors.primary, fontSize: '0.875rem', fontWeight: 600, marginBottom: '12px' }}>{m.role}</div>
            {Boolean(props.showBio) && m.bio && (
              <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.65, marginBottom: '14px' }}>{m.bio}</p>
            )}
            {Boolean(props.showSocial) && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                {m.linkedIn && <a href={m.linkedIn} target="_blank" rel="noopener noreferrer" style={{ color: '#0a66c2', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>in</a>}
                {m.twitter && <a href={m.twitter} target="_blank" rel="noopener noreferrer" style={{ color: '#1da1f2', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>𝕏</a>}
                {m.email && <a href={`mailto:${m.email}`} style={{ color: theme.colors.primary, fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>✉</a>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ServicesGridBlock({ props, theme }: { props: Record<string, unknown>; theme: ThemeConfig }) {
  const items = (props.items as { icon?: string; title: string; description: string; iconColor?: string; buttonText?: string; buttonLink?: string }[]) || [];
  const cols = parseInt(String(props.columns || 3));
  return (
    <div className={styles.sectionInner}>
      <h2 className={styles.sectionTitle}>{props.title as string}</h2>
      {!!props.subtitle && <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '40px', maxWidth: '700px', margin: '0 auto 40px', fontSize: '1.05rem' }}>{props.subtitle as string}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cols, 3)}, 1fr)`, gap: '24px' }}>
        {items.map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '32px 24px', transition: 'transform 0.25s, box-shadow 0.25s' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 16px 40px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = ''; }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: `${s.iconColor || theme.colors.primary}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', fontSize: '1.6rem' }}>
              <span style={{ color: s.iconColor || theme.colors.primary }}>◈</span>
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827', marginBottom: '12px' }}>{s.title}</h3>
            <p style={{ color: '#6b7280', lineHeight: 1.7, fontSize: '0.9rem', marginBottom: s.buttonText ? '20px' : '0' }}>{s.description}</p>
            {Boolean(props.showButton) && s.buttonText && (
              <Link to={s.buttonLink || '#'} style={{ color: theme.colors.primary, fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
                {s.buttonText} →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FeaturesHighlightBlock({ props, theme }: { props: Record<string, unknown>; theme: ThemeConfig }) {
  const items = (props.items as { icon?: string; title: string; description: string; color?: string }[]) || [];
  const cols = parseInt(String(props.columns || 3));
  return (
    <div className={styles.sectionInner}>
      <h2 className={styles.sectionTitle}>{props.title as string}</h2>
      {!!props.subtitle && <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '40px', maxWidth: '680px', margin: '0 auto 40px', fontSize: '1.05rem' }}>{props.subtitle as string}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cols, 3)}, 1fr)`, gap: '24px' }}>
        {items.map((f, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '28px 24px', display: 'flex', gap: '18px', alignItems: 'flex-start', transition: 'border-color 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = f.color || theme.colors.primary; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'; }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${f.color || theme.colors.primary}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.4rem', color: f.color || theme.colors.primary }}>✦</div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ color: '#6b7280', lineHeight: 1.65, fontSize: '0.88rem', margin: 0 }}>{f.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProcessStepsBlock({ props, theme }: { props: Record<string, unknown>; theme: ThemeConfig }) {
  const steps = (props.steps as { stepNumber: string; icon?: string; title: string; description: string }[]) || [];
  const isVertical = props.orientation === 'vertical';
  return (
    <div className={styles.sectionInner}>
      <h2 className={styles.sectionTitle}>{props.title as string}</h2>
      {!!props.subtitle && <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '48px', maxWidth: '700px', margin: '0 auto 48px', fontSize: '1.05rem' }}>{props.subtitle as string}</p>}
      <div style={{ display: isVertical ? 'flex' : 'grid', flexDirection: isVertical ? 'column' : undefined, gridTemplateColumns: !isVertical ? `repeat(${Math.min(steps.length, 3)}, 1fr)` : undefined, gap: '32px' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '28px 24px', position: 'relative' }}>
            {i < steps.length - 1 && !isVertical && (
              <div style={{ position: 'absolute', top: '36px', right: '-16px', width: '32px', height: '2px', background: `${theme.colors.primary}40`, zIndex: 1 }} />
            )}
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: theme.colors.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, marginBottom: '18px' }}>
              {s.stepNumber}
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', marginBottom: '10px' }}>{s.title}</h3>
            <p style={{ color: '#6b7280', lineHeight: 1.7, fontSize: '0.88rem', margin: 0 }}>{s.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PricingPlansBlock({ props, theme }: { props: Record<string, unknown>; theme: ThemeConfig }) {
  const [isAnnual, setIsAnnual] = useState(false);
  const plans = (props.plans as {
    name: string; price: string; priceAnnual: string; currency: string; period: string;
    description: string; highlighted: boolean; badge: string;
    buttonText: string; buttonLink: string;
    features: { text: string; included: boolean }[];
  }[]) || [];

  return (
    <div className={styles.sectionInner}>
      <h2 className={styles.sectionTitle}>{props.title as string}</h2>
      {!!props.subtitle && <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '32px', maxWidth: '680px', margin: '0 auto 32px' }}>{props.subtitle as string}</p>}
      {Boolean(props.showAnnualToggle) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '40px' }}>
          <span style={{ color: isAnnual ? '#6b7280' : '#111827', fontWeight: isAnnual ? 400 : 600 }}>Aylık</span>
          <button onClick={() => setIsAnnual(v => !v)}
            style={{ width: '52px', height: '28px', borderRadius: '14px', border: 'none', cursor: 'pointer', background: isAnnual ? theme.colors.primary : '#d1d5db', position: 'relative', transition: 'background 0.2s' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: isAnnual ? '27px' : '3px', transition: 'left 0.2s' }} />
          </button>
          <span style={{ color: isAnnual ? '#111827' : '#6b7280', fontWeight: isAnnual ? 600 : 400 }}>
            Yıllık {!!props.annualDiscountText && <span style={{ background: `${theme.colors.primary}18`, color: theme.colors.primary, padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, marginLeft: '6px' }}>{props.annualDiscountText as string}</span>}
          </span>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(plans.length, 3)}, 1fr)`, gap: '24px', alignItems: 'start' }}>
        {plans.map((pl, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: '20px', border: `2px solid ${pl.highlighted ? theme.colors.primary : '#e5e7eb'}`, padding: '36px 28px', position: 'relative', boxShadow: pl.highlighted ? `0 0 0 4px ${theme.colors.primary}18` : 'none' }}>
            {pl.badge && (
              <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: theme.colors.primary, color: '#fff', borderRadius: '8px', padding: '4px 14px', fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{pl.badge}</div>
            )}
            <div style={{ fontWeight: 700, fontSize: '1.15rem', color: '#111827', marginBottom: '8px' }}>{pl.name}</div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '24px', lineHeight: 1.5 }}>{pl.description}</p>
            <div style={{ marginBottom: '28px' }}>
              <span style={{ fontSize: '2.6rem', fontWeight: 800, color: theme.colors.primary }}>{pl.currency}{isAnnual ? pl.priceAnnual : pl.price}</span>
              {pl.period && <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{pl.period}</span>}
            </div>
            <Link to={pl.buttonLink || '#'} style={{ display: 'block', textAlign: 'center', background: pl.highlighted ? theme.colors.primary : 'transparent', color: pl.highlighted ? '#fff' : theme.colors.primary, border: `2px solid ${theme.colors.primary}`, borderRadius: '8px', padding: '12px', fontWeight: 700, textDecoration: 'none', marginBottom: '28px', transition: 'all 0.2s' }}>
              {pl.buttonText}
            </Link>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pl.features?.map((f, j) => (
                <li key={j} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', color: f.included ? '#374151' : '#9ca3af', fontSize: '0.875rem' }}>
                  <span style={{ flexShrink: 0, color: f.included ? '#10b981' : '#d1d5db' }}>{f.included ? '✓' : '✗'}</span>
                  <span style={{ textDecoration: f.included ? 'none' : 'line-through', opacity: f.included ? 1 : 0.6 }}>{f.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClientsLogosBlock({ props, theme }: { props: Record<string, unknown>; theme: ThemeConfig }) {
  const logos = (props.logos as { imageUrl: string; altText: string; url?: string }[]) || [];
  return (
    <div className={styles.sectionInner}>
      <h2 className={styles.sectionTitle}>{props.title as string}</h2>
      {!!props.subtitle && <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '40px' }}>{props.subtitle as string}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '32px 40px', alignItems: 'center' }}>
        {logos.map((l, i) => {
          const img = (
            <img src={l.imageUrl} alt={l.altText} style={{
              height: '44px', maxWidth: '140px', objectFit: 'contain',
              filter: props.grayscale ? 'grayscale(100%)' : 'none',
              opacity: props.grayscale ? 0.5 : 1,
              transition: 'filter 0.3s, opacity 0.3s',
            }}
              onMouseEnter={e => { if (props.grayscale) { const img = e.currentTarget as HTMLImageElement; img.style.filter = 'grayscale(0%)'; img.style.opacity = '1'; } }}
              onMouseLeave={e => { if (props.grayscale) { const img = e.currentTarget as HTMLImageElement; img.style.filter = 'grayscale(100%)'; img.style.opacity = '0.5'; } }}
            />
          );
          if (!l.imageUrl) {
            return <div key={i} style={{ height: '36px', minWidth: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${theme.colors.primary}10`, borderRadius: '6px', padding: '0 16px', color: theme.colors.primary, fontWeight: 600, fontSize: '0.85rem' }}>{l.altText}</div>;
          }
          return l.url
            ? <a key={i} href={l.url} target="_blank" rel="noopener noreferrer">{img}</a>
            : <div key={i}>{img}</div>;
        })}
      </div>
    </div>
  );
}

function AwardsCertificationsBlock({ props, theme }: { props: Record<string, unknown>; theme: ThemeConfig }) {
  const items = (props.items as { year: string; name: string; organization: string; imageUrl?: string; description?: string }[]) || [];
  const cols = parseInt(String(props.columns || 3));
  return (
    <div className={styles.sectionInner}>
      <h2 className={styles.sectionTitle}>{props.title as string}</h2>
      {!!props.subtitle && <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '40px', maxWidth: '640px', margin: '0 auto 40px' }}>{props.subtitle as string}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cols, 3)}, 1fr)`, gap: '20px' }}>
        {items.map((a, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start', transition: 'border-color 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = theme.colors.primary; el.style.boxShadow = `0 4px 20px ${theme.colors.primary}18`; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#e5e7eb'; el.style.boxShadow = ''; }}>
            {a.imageUrl
              ? <img src={a.imageUrl} alt={a.name} style={{ width: '52px', height: '52px', objectFit: 'contain', flexShrink: 0, borderRadius: '8px' }} />
              : <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: `${theme.colors.primary}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.5rem' }}>🏆</div>
            }
            <div>
              <div style={{ fontSize: '0.75rem', color: theme.colors.primary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{a.year}</div>
              <div style={{ fontWeight: 700, color: '#111827', marginBottom: '4px', fontSize: '0.95rem', lineHeight: 1.3 }}>{a.name}</div>
              <div style={{ fontSize: '0.825rem', color: '#6b7280', marginBottom: a.description ? '8px' : '0' }}>— {a.organization}</div>
              {a.description && <p style={{ fontSize: '0.82rem', color: '#9ca3af', margin: 0, lineHeight: 1.5 }}>{a.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NumbersCounterBlock({ props, theme }: { props: Record<string, unknown>; theme: ThemeConfig }) {
  const items = (props.items as { value: string; suffix: string; label: string; color?: string }[]) || [];
  const cols = parseInt(String(props.columns || 3));
  const isDark = props.backgroundType === 'dark';
  const bg = isDark ? '#0f172a' : (props.backgroundColor as string || (props.backgroundType === 'gradient' ? `linear-gradient(135deg,${theme.colors.primary}14,${theme.colors.primary}06)` : '#f8fafc'));
  return (
    <div style={{ background: bg, padding: '64px 0' }}>
      <div className={styles.sectionInner} style={{ paddingTop: 0, paddingBottom: 0 }}>
        {!!props.title && <h2 style={{ textAlign: 'center', fontWeight: 800, fontSize: '2rem', color: isDark ? '#fff' : '#111827', marginBottom: '8px' }}>{props.title as string}</h2>}
        {!!props.subtitle && <p style={{ textAlign: 'center', color: isDark ? 'rgba(255,255,255,0.65)' : '#6b7280', marginBottom: '48px' }}>{props.subtitle as string}</p>}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cols, 6)}, 1fr)`, gap: '40px' }}>
          {items.map((c, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 800, color: c.color || theme.colors.primary, lineHeight: 1, letterSpacing: '-0.02em' }}>
                {c.value}<span style={{ fontSize: '60%' }}>{c.suffix}</span>
              </div>
              <div style={{ color: isDark ? 'rgba(255,255,255,0.65)' : '#6b7280', marginTop: '10px', fontSize: '0.9rem' }}>{c.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CtaBannerBlock({ props, theme }: { props: Record<string, unknown>; theme: ThemeConfig }) {
  const bgStyle: React.CSSProperties =
    props.backgroundType === 'gradient'
      ? { background: `linear-gradient(135deg,${theme.colors.primary},${theme.colors.secondary || theme.colors.primary}cc)` }
      : props.backgroundType === 'image' && props.imageUrl
        ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.55)),url(${props.imageUrl as string})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: (props.backgroundColor as string) || theme.colors.primary };
  return (
    <div style={{ ...bgStyle, padding: '80px 48px', textAlign: 'center' }}>
      {!!props.highlightText && (
        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', padding: '5px 16px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '20px' }}>
          {props.highlightText as string}
        </div>
      )}
      <h2 style={{ color: '#fff', fontSize: 'clamp(1.6rem,4vw,2.6rem)', fontWeight: 800, marginBottom: '16px', lineHeight: 1.25, maxWidth: '800px', margin: '0 auto 16px' }}>
        {props.headline as string}
      </h2>
      {!!props.subheadline && (
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', lineHeight: 1.75, marginBottom: '36px', maxWidth: '660px', margin: '0 auto 36px' }}>
          {props.subheadline as string}
        </p>
      )}
      <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {!!props.primaryButtonText && (
          <Link to={(props.primaryButtonLink as string) || '#'} style={{ background: '#fff', color: theme.colors.primary, padding: '15px 36px', borderRadius: theme.borderRadius.button, fontWeight: 700, textDecoration: 'none', fontSize: '1rem' }}>
            {props.primaryButtonText as string}
          </Link>
        )}
        {Boolean(props.showSecondaryButton) && !!props.secondaryButtonText && (
          <Link to={(props.secondaryButtonLink as string) || '#'} style={{ background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.6)', padding: '15px 36px', borderRadius: theme.borderRadius.button, fontWeight: 600, textDecoration: 'none', fontSize: '1rem' }}>
            {props.secondaryButtonText as string}
          </Link>
        )}
      </div>
    </div>
  );
}

function ContactDetailsBlock({ props, theme }: { props: Record<string, unknown>; theme: ThemeConfig }) {
  const phones = (props.phones as { label: string; number: string }[]) || [];
  const emails = (props.emails as { label: string; address: string }[]) || [];
  const hours  = (props.workingHours as { days: string; hours: string }[]) || [];
  return (
    <div className={styles.sectionInner}>
      <h2 className={styles.sectionTitle}>{props.title as string}</h2>
      {!!props.subtitle && <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '48px', maxWidth: '640px', margin: '0 auto 48px' }}>{props.subtitle as string}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '20px' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '28px' }}>
          <div style={{ fontSize: '0.75rem', color: theme.colors.primary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>📍 Adres</div>
          <p style={{ color: '#374151', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-line' }}>{props.address as string}</p>
          {!!props.city && <p style={{ color: '#6b7280', margin: '4px 0 0' }}>{props.city as string}, {props.country as string}</p>}
        </div>
        {phones.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '28px' }}>
            <div style={{ fontSize: '0.75rem', color: theme.colors.primary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>📞 Telefon</div>
            {phones.map((ph, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '2px' }}>{ph.label}</div>
                <a href={`tel:${ph.number}`} style={{ color: '#111827', fontWeight: 600, textDecoration: 'none', fontSize: '1rem' }}>{ph.number}</a>
              </div>
            ))}
          </div>
        )}
        {emails.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '28px' }}>
            <div style={{ fontSize: '0.75rem', color: theme.colors.primary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>✉️ E-posta</div>
            {emails.map((em, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '2px' }}>{em.label}</div>
                <a href={`mailto:${em.address}`} style={{ color: theme.colors.primary, fontWeight: 600, textDecoration: 'none' }}>{em.address}</a>
              </div>
            ))}
          </div>
        )}
        {hours.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '28px' }}>
            <div style={{ fontSize: '0.75rem', color: theme.colors.primary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>🕐 Çalışma Saatleri</div>
            {hours.map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', gap: '12px' }}>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{h.days}</span>
                <span style={{ color: '#111827', fontWeight: 600, fontSize: '0.875rem', flexShrink: 0 }}>{h.hours}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CorpBlogListBlock({ props, theme }: { props: Record<string, unknown>; theme: ThemeConfig }) {
  type PostItem = { id: string; title: string; slug: string; excerpt?: string; authorName?: string; publishedAt?: string; readTimeMinutes?: number; categoryName?: string; featuredImageUrl?: string };
  const [posts, setPosts] = useState<PostItem[]>([]);
  const cols = parseInt(String(props.columns || 3));

  useEffect(() => {
    // Blog API'ye erişilebilirse yükle, aksi hâlde boş bırak
    fetch(`/api/v1/web-builder/blog/posts?limit=${props.limit || 6}`)
      .then(r => r.json())
      .then(data => setPosts(Array.isArray(data?.items) ? data.items : []))
      .catch(() => {});
  }, [props.limit]);

  return (
    <div className={styles.sectionInner}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h2 className={styles.sectionTitle} style={{ margin: 0 }}>{props.title as string}</h2>
        {!!props.viewAllLink && (
          <Link to={props.viewAllLink as string} style={{ color: theme.colors.primary, fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>
            {(props.viewAllText as string) || 'Tümünü Gör'} →
          </Link>
        )}
      </div>
      {!!props.subtitle && <p style={{ color: '#6b7280', marginBottom: '36px' }}>{props.subtitle as string}</p>}
      {posts.length === 0
        ? <p style={{ textAlign: 'center', color: '#9ca3af' }}>Henüz blog yazısı yayınlanmamış.</p>
        : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cols, 3)}, 1fr)`, gap: '24px' }}>
            {posts.map(post => (
              <Link key={post.id} to={`blog/${post.slug}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', overflow: 'hidden', transition: 'transform 0.25s, box-shadow 0.25s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 12px 30px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = ''; }}>
                {Boolean(props.showFeaturedImage) && (
                  post.featuredImageUrl
                    ? <img src={post.featuredImageUrl} alt={post.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                    : <div style={{ height: '180px', background: `${theme.colors.primary}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>📝</div>
                )}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {Boolean(props.showCategory) && post.categoryName && (
                    <span style={{ fontSize: '0.72rem', color: theme.colors.primary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{post.categoryName}</span>
                  )}
                  <h3 style={{ fontWeight: 700, color: '#111827', fontSize: '1rem', lineHeight: 1.4, marginBottom: '10px' }}>{post.title}</h3>
                  {post.excerpt && <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.6, flex: 1 }}>{post.excerpt}</p>}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '14px', fontSize: '0.75rem', color: '#9ca3af' }}>
                    {Boolean(props.showAuthor) && post.authorName && <span>{post.authorName}</span>}
                    {Boolean(props.showDate) && post.publishedAt && <span>· {new Date(post.publishedAt).toLocaleDateString('tr-TR')}</span>}
                    {Boolean(props.showReadTime) && post.readTimeMinutes && <span>· {post.readTimeMinutes} dk</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      }
    </div>
  );
}

function TimelineBlock({ props, theme }: { props: Record<string, unknown>; theme: ThemeConfig }) {
  const items = (props.items as { year: string; title: string; description: string; imageUrl?: string; color?: string }[]) || [];
  return (
    <div className={styles.sectionInner}>
      <h2 className={styles.sectionTitle}>{props.title as string}</h2>
      {!!props.subtitle && <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '48px', maxWidth: '640px', margin: '0 auto 48px' }}>{props.subtitle as string}</p>}
      <div style={{ position: 'relative', paddingLeft: '32px' }}>
        <div style={{ position: 'absolute', left: '11px', top: 0, bottom: 0, width: '2px', background: '#e5e7eb' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
          {items.map((it, i) => (
            <div key={i} style={{ position: 'relative', display: 'grid', gridTemplateColumns: props.orientation === 'alternating' && i % 2 === 1 ? '1fr auto' : 'auto 1fr', gap: '24px' }}>
              <div style={{ position: 'absolute', left: '-33px', top: '6px', width: '14px', height: '14px', borderRadius: '50%', background: it.color || theme.colors.primary, border: `3px solid #fff`, boxShadow: `0 0 0 3px ${it.color || theme.colors.primary}44` }} />
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '0.875rem', color: it.color || theme.colors.primary, fontWeight: 700, marginBottom: '6px' }}>{it.year}</div>
                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#111827', marginBottom: '10px' }}>{it.title}</h3>
                <p style={{ color: '#6b7280', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>{it.description}</p>
                {it.imageUrl && <img src={it.imageUrl} alt={it.title} style={{ width: '100%', borderRadius: '10px', marginTop: '14px', objectFit: 'cover', maxHeight: '200px' }} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PortfolioGridBlock({ props, theme }: { props: Record<string, unknown>; theme: ThemeConfig }) {
  const items = (props.items as { title: string; category: string; description?: string; tags?: string; imageUrl?: string; url?: string }[]) || [];
  const cols = parseInt(String(props.columns || 3));
  const [activeFilter, setActiveFilter] = useState('Tümü');
  const categories = ['Tümü', ...Array.from(new Set(items.map(it => it.category).filter(Boolean)))];
  const filtered = activeFilter === 'Tümü' ? items : items.filter(it => it.category === activeFilter);

  return (
    <div className={styles.sectionInner}>
      <h2 className={styles.sectionTitle}>{props.title as string}</h2>
      {!!props.subtitle && <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '32px', maxWidth: '680px', margin: '0 auto 32px' }}>{props.subtitle as string}</p>}
      {Boolean(props.filterEnabled) && categories.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '36px' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveFilter(cat)}
              style={{ padding: '7px 18px', borderRadius: '999px', border: `1.5px solid ${activeFilter === cat ? theme.colors.primary : '#e5e7eb'}`, background: activeFilter === cat ? theme.colors.primary : 'transparent', color: activeFilter === cat ? '#fff' : '#6b7280', fontWeight: 500, cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.2s' }}>
              {cat}
            </button>
          ))}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cols, 3)}, 1fr)`, gap: '24px' }}>
        {filtered.map((it, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', overflow: 'hidden', transition: 'transform 0.25s, box-shadow 0.25s' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 16px 40px rgba(0,0,0,0.12)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = ''; }}>
            {it.imageUrl
              ? <img src={it.imageUrl} alt={it.title} style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
              : <div style={{ height: '200px', background: `${theme.colors.primary}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🖼️</div>
            }
            <div style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.72rem', color: theme.colors.primary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{it.category}</div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', marginBottom: '8px' }}>{it.title}</h3>
              {it.description && <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.65, marginBottom: '12px' }}>{it.description}</p>}
              {it.tags && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: it.url ? '14px' : '0' }}>
                  {it.tags.split(',').map(tag => tag.trim()).filter(Boolean).map((tag, j) => (
                    <span key={j} style={{ background: '#f3f4f6', color: '#6b7280', borderRadius: '4px', padding: '2px 8px', fontSize: '0.72rem' }}>{tag}</span>
                  ))}
                </div>
              )}
              {it.url && <a href={it.url} target="_blank" rel="noopener noreferrer" style={{ color: theme.colors.primary, fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>Detayları Gör →</a>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MapEmbedBlock({ props, theme }: { props: Record<string, unknown>; theme: ThemeConfig }) {
  const mapHeight = (props.mapHeight as string) || '420px';
  const showSidebar = Boolean(props.showContactSidebar);
  return (
    <div className={styles.sectionInner}>
      {!!props.title && <h2 className={styles.sectionTitle}>{props.title as string}</h2>}
      <div style={{ display: 'grid', gridTemplateColumns: showSidebar ? '2fr 1fr' : '1fr', gap: '24px', alignItems: 'start' }}>
        {props.embedUrl
          ? <iframe src={props.embedUrl as string} style={{ width: '100%', height: mapHeight, border: 0, borderRadius: '16px' }} allowFullScreen title="Konum" />
          : <div style={{ height: mapHeight, background: '#f3f4f6', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '1rem' }}>Google Maps Embed URL giriniz</div>
        }
        {showSidebar && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { icon: '📍', label: 'Adres', value: props.address as string },
              { icon: '📞', label: 'Telefon', value: props.phone as string, href: `tel:${props.phone}` },
              { icon: '✉️', label: 'E-posta', value: props.email as string, href: `mailto:${props.email}` },
              { icon: '🕐', label: 'Çalışma Saatleri', value: props.workingHours as string },
            ].filter(item => item.value).map((item, i) => (
              <div key={i}>
                <div style={{ fontSize: '0.72rem', color: theme.colors.primary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>{item.icon} {item.label}</div>
                {item.href
                  ? <a href={item.href} style={{ color: '#374151', fontWeight: 500, textDecoration: 'none' }}>{item.value}</a>
                  : <p style={{ color: '#374151', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{item.value}</p>
                }
              </div>
            ))}
            {!!props.parkingNote && <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0, borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>ℹ️ {props.parkingNote as string}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function PhoneContactBlock({ props, theme }: { props: Record<string, unknown>; theme: ThemeConfig }) {
  return (
    <div style={{ background: (props.backgroundColor as string) || '#f8fafc', padding: '64px 0' }}>
      <div className={styles.sectionInner} style={{ paddingTop: 0, paddingBottom: 0 }}>
        <h2 className={styles.sectionTitle}>{props.title as string}</h2>
        {!!props.subtitle && <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '40px', maxWidth: '560px', margin: '0 auto 40px' }}>{props.subtitle as string}</p>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '700px', margin: '0 auto 28px' }}>
          {[[props.mainPhoneLabel, props.mainPhone], [props.supportPhoneLabel, props.supportPhone]].map(([lbl, num], i) => (
            num ? (
              <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '6px' }}>{lbl as string}</div>
                <a href={`tel:${num}`} style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', textDecoration: 'none', display: 'block' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = theme.colors.primary; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#111827'; }}>
                  {num as string}
                </a>
              </div>
            ) : null
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
          {!!props.whatsapp && (
            <a href={`https://wa.me/${String(props.whatsapp).replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
              style={{ background: '#25D366', color: '#fff', padding: '12px 28px', borderRadius: theme.borderRadius.button, fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}>
              📲 WhatsApp
            </a>
          )}
          {!!props.buttonText && (
            <Link to={(props.buttonLink as string) || '#'} style={{ background: theme.colors.primary, color: '#fff', padding: '12px 28px', borderRadius: theme.borderRadius.button, fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}>
              {props.buttonText as string}
            </Link>
          )}
        </div>
        {!!props.availabilityText && <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>🕐 {props.availabilityText as string}</p>}
      </div>
    </div>
  );
}

// ── Block dispatcher ──────────────────────────────────────────────────────────

export function BlockRenderer({ comp, theme, tenantSlug }: { comp: LayoutComponent; theme: ThemeConfig; tenantSlug: string }) {
  const p = comp.props;
  switch (comp.type) {
    case 'hero': return <HeroBlock props={p} theme={theme} />;
    case 'hero-split': return <HeroSplitBlock props={p} theme={theme} />;
    case 'featured-products': return <FeaturedProductsBlock props={p} theme={theme} tenantSlug={tenantSlug} />;
    case 'categories-grid': return <CategoriesGridBlock props={p} theme={theme} tenantSlug={tenantSlug} />;
    case 'text-image': return <TextImageBlock props={p} />;
    case 'rich-text': return <RichTextBlock props={p} />;
    case 'stats-bar': return <StatsBarBlock props={p} />;
    case 'testimonials': return <TestimonialsBlock props={p} tenantSlug={tenantSlug} />;
    case 'countdown': return <CountdownBlock props={p} theme={theme} />;
    case 'promo-banner': return <PromoBannerBlock props={p} tenantSlug={tenantSlug} />;
    case 'brand-logos': return <BrandLogosBlock props={p} tenantSlug={tenantSlug} />;
    case 'video-embed': return <VideoEmbedBlock props={p} />;
    case 'newsletter': return <NewsletterBlock props={p} theme={theme} tenantSlug={tenantSlug} />;
    case 'contact-form': return <ContactFormNewBlock props={p} theme={theme} tenantSlug={tenantSlug} />;
    case 'slider': return <SliderBlock props={p} tenantSlug={tenantSlug} />;
    case 'faq': return <FaqBlock props={p} tenantSlug={tenantSlug} />;
    case 'custom-html': return <CustomHtmlBlock props={p} />;
    // ── Corporate ──
    case 'hero-corporate':        return <HeroCorporateBlock props={p} theme={theme} />;
    case 'about-company':         return <AboutCompanyBlock props={p} theme={theme} />;
    case 'team-grid':             return <TeamGridBlock props={p} theme={theme} />;
    case 'services-grid':         return <ServicesGridBlock props={p} theme={theme} />;
    case 'features-highlight':    return <FeaturesHighlightBlock props={p} theme={theme} />;
    case 'process-steps':         return <ProcessStepsBlock props={p} theme={theme} />;
    case 'pricing-plans':         return <PricingPlansBlock props={p} theme={theme} />;
    case 'clients-logos':         return <ClientsLogosBlock props={p} theme={theme} />;
    case 'awards-certifications': return <AwardsCertificationsBlock props={p} theme={theme} />;
    case 'numbers-counter':       return <NumbersCounterBlock props={p} theme={theme} />;
    case 'cta-banner':            return <CtaBannerBlock props={p} theme={theme} />;
    case 'contact-details':       return <ContactDetailsBlock props={p} theme={theme} />;
    case 'blog-list':             return <CorpBlogListBlock props={p} theme={theme} />;
    case 'timeline':              return <TimelineBlock props={p} theme={theme} />;
    case 'portfolio-grid':        return <PortfolioGridBlock props={p} theme={theme} />;
    case 'map-embed':             return <MapEmbedBlock props={p} theme={theme} />;
    case 'phone-contact':         return <PhoneContactBlock props={p} theme={theme} />;
    default: return (
      <div className={styles.sectionInner} style={{ textAlign: 'center', color: '#9ca3af' }}>
        <p>Bilinmeyen bileşen: {comp.type}</p>
      </div>
    );
  }
}

// ── Main Component ────────────────────────────────────────────────────────────

export const StorefrontPage = () => {
  const { tenantSlug, pageSlug } = useParams<{ tenantSlug: string; pageSlug?: string }>();
  const slug = pageSlug || 'home';

  const [page, setPage] = useState<StorePage | null>(null);
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [layout, setLayout] = useState<LayoutRow[]>([]);
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [customCss, setCustomCss] = useState('');
  const [customJs, setCustomJs] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Apply CSS variables to the storefront root
  useEffect(() => {
    if (!rootRef.current) return;
    const vars = themeToVars(theme);
    for (const [key, value] of Object.entries(vars)) {
      rootRef.current.style.setProperty(key, value);
    }
  }, [theme]);

  useEffect(() => {
    if (!tenantSlug) return;

    const fetchAll = async () => {
      setIsLoading(true);
      setNotFound(false);
      try {
        // Load settings + theme + page in parallel
        const [settingsRes, themeRes, pageRes] = await Promise.all([
          storefrontApi.getSettings(tenantSlug).catch(() => null),
          storefrontApi.getTheme(tenantSlug).catch(() => null),
          storefrontApi.getPage(tenantSlug, slug).catch(() => null),
        ]);

        // Inject store-level custom CSS / JS overrides
        setCustomCss(settingsRes?.data.customCssOverride ?? '');
        setCustomJs(settingsRes?.data.customJsOverride ?? '');

        // Merge global theme
        if (themeRes?.data.themeConfigJson) {
          try {
            const globalTheme = JSON.parse(themeRes.data.themeConfigJson) as Partial<ThemeConfig>;
            setTheme(mergeTheme(DEFAULT_THEME, globalTheme));
          } catch {
            // keep default
          }
        }

        if (!pageRes?.data) {
          setNotFound(true);
          return;
        }

        const pageData = pageRes.data;
        setPage(pageData);

        // Merge page-level theme override on top of global
        if (pageData.themeOverrideJson) {
          try {
            const override = JSON.parse(pageData.themeOverrideJson) as Partial<ThemeConfig>;
            setTheme(prev => mergeTheme(prev, override));
          } catch {
            // keep global
          }
        }

        if (pageData.layoutConfigJson) {
          try {
            const raw = JSON.parse(pageData.layoutConfigJson);
            setLayout(migrateLayout(raw));
          } catch {
            setLayout([]);
          }
        }

        if (pageData.backlinksJson) {
          try {
            setBacklinks(JSON.parse(pageData.backlinksJson) as Backlink[]);
          } catch {
            setBacklinks([]);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    void fetchAll();
  }, [tenantSlug, slug]);

  // Update document title from SEO meta
  useEffect(() => {
    if (page?.metaTitle) document.title = page.metaTitle;
    else if (page?.title) document.title = page.title;
  }, [page]);

  if (isLoading) {
    return (
      <div className={styles.storefront} ref={rootRef}>
        <div className={styles.loading}><p>Yükleniyor...</p></div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className={styles.storefront} ref={rootRef}>
        <div className={styles.empty}>
          <h2>Sayfa Bulunamadı</h2>
          <p>Bu sayfa mevcut değil veya henüz yayınlanmamış.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {customCss && <style dangerouslySetInnerHTML={{ __html: customCss }} />}

      <div className={styles.storefront} ref={rootRef}>
        {layout.length === 0 && (
          <div className={styles.empty}>
            <h2>Mağaza Henüz Tasarlanmamış</h2>
            <p>Admin panelinden tasarım ekleyin.</p>
          </div>
        )}

        {layout.map(row => (
          <div
            key={row.id}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              backgroundColor: row.props.backgroundColor || undefined,
              backgroundImage: row.props.backgroundImage ? `url(${row.props.backgroundImage})` : undefined,
              paddingTop: row.props.paddingY || undefined,
              paddingBottom: row.props.paddingY || undefined,
              paddingLeft: row.props.paddingX || undefined,
              paddingRight: row.props.paddingX || undefined,
              maxWidth: row.props.fullWidth ? '100%' : undefined,
            }}
          >
            {row.columns.map(col => (
              col.component ? (
                <section
                  key={col.id}
                  id={`block-${col.component.id}`}
                  style={{ gridColumn: `span ${col.span}` }}
                >
                  <BlockRenderer comp={col.component} theme={theme} tenantSlug={tenantSlug!} />
                </section>
              ) : (
                <div key={col.id} style={{ gridColumn: `span ${col.span}` }} />
              )
            ))}
          </div>
        ))}

        {backlinks.length > 0 && (
          <nav className={styles.backlinks} aria-label="İlgili Sayfalar">
            {backlinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                className={styles.backlinkItem}
                rel={link.noFollow ? 'nofollow' : undefined}
              >
                {link.anchorText}
              </a>
            ))}
          </nav>
        )}
      </div>

      {customJs && <script dangerouslySetInnerHTML={{ __html: customJs }} />}
    </>
  );
};
