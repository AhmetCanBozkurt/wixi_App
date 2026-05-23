import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './StorefrontPage.module.css';
import { storefrontApi } from '../../../entities/StorePage/api/storePageApi';
import { DEFAULT_THEME, themeToVars, mergeTheme } from '../../../entities/StorePage/model/defaultTheme';
import type { StorePage, ThemeConfig, LayoutComponent, Backlink } from '../../../entities/StorePage/model/types';

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

function CustomHtmlBlock({ props }: { props: Record<string, unknown> }) {
  return (
    <div className={styles.sectionInner}>
      <div dangerouslySetInnerHTML={{ __html: (props.html as string) || '' }} />
    </div>
  );
}

// ── Block dispatcher ──────────────────────────────────────────────────────────

function BlockRenderer({ comp, theme, tenantSlug }: { comp: LayoutComponent; theme: ThemeConfig; tenantSlug: string }) {
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
  const [layout, setLayout] = useState<LayoutComponent[]>([]);
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
            setLayout(JSON.parse(pageData.layoutConfigJson) as LayoutComponent[]);
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

        {layout.map(comp => (
          <section key={comp.id} className={styles.section} id={`block-${comp.id}`}>
            <BlockRenderer comp={comp} theme={theme} tenantSlug={tenantSlug!} />
          </section>
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
