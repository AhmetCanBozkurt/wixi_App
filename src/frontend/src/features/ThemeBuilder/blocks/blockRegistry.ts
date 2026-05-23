import {
  FaImage, FaColumns, FaShoppingBag, FaThLarge, FaFileAlt, FaEnvelope,
  FaQuoteLeft, FaClock, FaBullhorn, FaTrademark, FaChartBar,
  FaVideo, FaAlignLeft, FaWpforms, FaCode, FaImages, FaQuestionCircle,
  FaUsers, FaBriefcase, FaNewspaper, FaHistory, FaTh, FaMapMarkerAlt,
} from 'react-icons/fa';
import type { IconType } from 'react-icons';

export type PropFieldType = 'text' | 'textarea' | 'richtext' | 'number' | 'url' | 'color' | 'select' | 'image' | 'boolean' | 'json-array';

export interface RowFieldSchema {
  key: string;
  label: string;
  type: 'text' | 'url' | 'number' | 'textarea';
  placeholder?: string;
}

export interface PropField {
  field: string;
  type: PropFieldType;
  label: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  rows?: number;
  itemSchema?: RowFieldSchema[]; // for json-array: defines per-row fields
}

export interface BlockDefinition {
  type: string;
  name: string;
  category: 'hero' | 'content' | 'commerce' | 'marketing' | 'forms' | 'advanced' | 'corporate';
  icon: IconType;
  defaultProps: Record<string, unknown>;
  propsSchema: PropField[];
}

export const BLOCK_REGISTRY: BlockDefinition[] = [
  // ── Hero ─────────────────────────────────────────────────────────────
  {
    type: 'hero',
    name: 'Hero Banner',
    category: 'hero',
    icon: FaImage,
    defaultProps: {
      title: 'Yeni Sezon Geldi',
      subtitle: 'Harika fırsatları keşfet',
      buttonText: 'Alışverişe Başla',
      buttonLink: '#',
      imageUrl: '',
      overlayOpacity: 0.4,
      height: '560px',
    },
    propsSchema: [
      { field: 'title', type: 'text', label: 'Başlık' },
      { field: 'subtitle', type: 'textarea', label: 'Alt Başlık', rows: 2 },
      { field: 'buttonText', type: 'text', label: 'Buton Metni' },
      { field: 'buttonLink', type: 'url', label: 'Buton Linki' },
      { field: 'imageUrl', type: 'image', label: 'Arka Plan Görseli' },
      { field: 'overlayOpacity', type: 'number', label: 'Karartma (0-1)' },
      { field: 'height', type: 'text', label: 'Yükseklik (px/vh)' },
    ],
  },
  {
    type: 'hero-split',
    name: 'Bölünmüş Hero',
    category: 'hero',
    icon: FaColumns,
    defaultProps: {
      title: 'Kaliteyi Hissedın',
      subtitle: 'Binlerce ürün, tek platform',
      text: 'Açıklama metninizi buraya yazın.',
      buttonText: 'Keşfet',
      buttonLink: '#',
      imageUrl: '',
      imagePosition: 'right',
    },
    propsSchema: [
      { field: 'title', type: 'text', label: 'Başlık' },
      { field: 'subtitle', type: 'text', label: 'Alt Başlık' },
      { field: 'text', type: 'textarea', label: 'Metin', rows: 3 },
      { field: 'buttonText', type: 'text', label: 'Buton Metni' },
      { field: 'buttonLink', type: 'url', label: 'Buton Linki' },
      { field: 'imageUrl', type: 'image', label: 'Görsel' },
      { field: 'imagePosition', type: 'select', label: 'Görsel Tarafı', options: [{ value: 'left', label: 'Sol' }, { value: 'right', label: 'Sağ' }] },
    ],
  },

  // ── Content ──────────────────────────────────────────────────────────
  {
    type: 'text-image',
    name: 'Metin & Görsel',
    category: 'content',
    icon: FaFileAlt,
    defaultProps: {
      title: 'Hikayemiz',
      text: 'Buraya hikayenizi yazın...',
      imageUrl: '',
      imagePosition: 'left',
    },
    propsSchema: [
      { field: 'title', type: 'text', label: 'Başlık' },
      { field: 'text', type: 'richtext', label: 'Metin' },
      { field: 'imageUrl', type: 'image', label: 'Görsel' },
      { field: 'imagePosition', type: 'select', label: 'Görsel Tarafı', options: [{ value: 'left', label: 'Sol' }, { value: 'right', label: 'Sağ' }] },
    ],
  },
  {
    type: 'rich-text',
    name: 'Zengin Metin',
    category: 'content',
    icon: FaAlignLeft,
    defaultProps: {
      html: '<p>İçeriğinizi buraya yazın.</p>',
    },
    propsSchema: [
      { field: 'html', type: 'richtext', label: 'İçerik' },
    ],
  },
  {
    type: 'stats-bar',
    name: 'İstatistikler',
    category: 'content',
    icon: FaChartBar,
    defaultProps: {
      items: [
        { icon: 'FaUsers', value: '10.000+', label: 'Mutlu Müşteri' },
        { icon: 'FaBox', value: '5.000+', label: 'Ürün' },
        { icon: 'FaStar', value: '4.9/5', label: 'Ortalama Puan' },
        { icon: 'FaTruck', value: '24s', label: 'Teslimat' },
      ],
    },
    propsSchema: [
      {
        field: 'items', type: 'json-array', label: 'İstatistikler',
        itemSchema: [
          { key: 'value', label: 'Değer', type: 'text', placeholder: '10.000+' },
          { key: 'label', label: 'Etiket', type: 'text', placeholder: 'Mutlu Müşteri' },
        ],
      },
    ],
  },
  {
    type: 'video-embed',
    name: 'Video',
    category: 'content',
    icon: FaVideo,
    defaultProps: {
      title: 'Tanıtım Videosu',
      url: '',
      autoplay: false,
      muted: true,
    },
    propsSchema: [
      { field: 'title', type: 'text', label: 'Başlık' },
      { field: 'url', type: 'url', label: 'YouTube/Vimeo URL' },
      { field: 'autoplay', type: 'boolean', label: 'Otomatik Oynat' },
      { field: 'muted', type: 'boolean', label: 'Sessiz' },
    ],
  },

  // ── Commerce ─────────────────────────────────────────────────────────
  {
    type: 'featured-products',
    name: 'Öne Çıkan Ürünler',
    category: 'commerce',
    icon: FaShoppingBag,
    defaultProps: {
      title: 'Sizin İçin Seçtiklerimiz',
      limit: 4,
      columns: 4,
      sortBy: 'newest',
    },
    propsSchema: [
      { field: 'title', type: 'text', label: 'Başlık' },
      { field: 'limit', type: 'number', label: 'Ürün Sayısı' },
      { field: 'columns', type: 'select', label: 'Kolon Sayısı', options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }] },
      { field: 'sortBy', type: 'select', label: 'Sıralama', options: [{ value: 'newest', label: 'Yeni' }, { value: 'featured', label: 'Öne Çıkan' }, { value: 'bestselling', label: 'Çok Satan' }] },
    ],
  },
  {
    type: 'categories-grid',
    name: 'Kategori Listesi',
    category: 'commerce',
    icon: FaThLarge,
    defaultProps: {
      title: 'Kategoriler',
      limit: 6,
      columns: 3,
    },
    propsSchema: [
      { field: 'title', type: 'text', label: 'Başlık' },
      { field: 'limit', type: 'number', label: 'Kategori Sayısı' },
      { field: 'columns', type: 'select', label: 'Kolon Sayısı', options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }] },
    ],
  },
  {
    type: 'brand-logos',
    name: 'Marka Logoları',
    category: 'commerce',
    icon: FaTrademark,
    defaultProps: {
      title: 'Markalarımız',
      logos: [],
    },
    propsSchema: [
      { field: 'title', type: 'text', label: 'Başlık' },
      {
        field: 'logos', type: 'json-array', label: 'Logolar',
        itemSchema: [
          { key: 'imageUrl', label: 'Görsel URL', type: 'url', placeholder: 'https://...' },
          { key: 'link', label: 'Link (opsiyonel)', type: 'url', placeholder: 'https://...' },
        ],
      },
    ],
  },

  // ── Marketing ────────────────────────────────────────────────────────
  {
    type: 'newsletter',
    name: 'E-Bülten',
    category: 'marketing',
    icon: FaEnvelope,
    defaultProps: {
      title: 'Fırsatlardan Haberdar Olun',
      text: 'Kampanya ve yenilikleri kaçırmayın.',
      buttonText: 'Abone Ol',
      successMessage: 'Teşekkürler! Abone oldunuz.',
    },
    propsSchema: [
      { field: 'title', type: 'text', label: 'Başlık' },
      { field: 'text', type: 'textarea', label: 'Açıklama', rows: 2 },
      { field: 'buttonText', type: 'text', label: 'Buton Metni' },
      { field: 'successMessage', type: 'text', label: 'Başarı Mesajı' },
    ],
  },
  {
    type: 'testimonials',
    name: 'Müşteri Yorumları',
    category: 'marketing',
    icon: FaQuoteLeft,
    defaultProps: {
      title: 'Müşterilerimiz Ne Diyor?',
      // dataSource: 'db' — items are fetched from API (/storefront/content/testimonials).
      // The items array below is used as fallback only when no API data is available.
      dataSource: 'db',
      items: [
        { name: 'Ayşe K.', role: 'Müşteri', quote: 'Harika bir alışveriş deneyimi!', rating: 5 },
        { name: 'Mehmet Y.', role: 'Müşteri', quote: 'Kaliteli ürünler, hızlı teslimat.', rating: 5 },
      ],
    },
    propsSchema: [
      { field: 'title', type: 'text', label: 'Başlık' },
      {
        field: 'items', type: 'json-array', label: 'Yedek Yorumlar (API yoksa)',
        itemSchema: [
          { key: 'name', label: 'İsim', type: 'text', placeholder: 'Ayşe K.' },
          { key: 'role', label: 'Unvan', type: 'text', placeholder: 'Müşteri' },
          { key: 'quote', label: 'Yorum', type: 'textarea', placeholder: 'Harika bir deneyim!' },
          { key: 'rating', label: 'Puan (1-5)', type: 'number', placeholder: '5' },
        ],
      },
    ],
  },
  {
    type: 'countdown',
    name: 'Geri Sayım',
    category: 'marketing',
    icon: FaClock,
    defaultProps: {
      title: 'Kampanya Bitiyor!',
      targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      message: 'Bu fırsatı kaçırmayın',
    },
    propsSchema: [
      { field: 'title', type: 'text', label: 'Başlık' },
      { field: 'targetDate', type: 'text', label: 'Hedef Tarih (ISO)' },
      { field: 'message', type: 'text', label: 'Mesaj' },
    ],
  },
  {
    type: 'promo-banner',
    name: 'Kampanya Bandı',
    category: 'marketing',
    icon: FaBullhorn,
    defaultProps: {
      // dataSource: 'db' — fetches from /store-admin/promo-banners; below props are fallback
      dataSource: 'db',
      message: '🎉 Tüm siparişlerde %20 indirim! Kod: WIXI20',
      buttonText: 'Hemen Al',
      buttonLink: '#',
      backgroundColor: '#ec4899',
      textColor: '#ffffff',
      dismissable: true,
    },
    propsSchema: [
      { field: 'message', type: 'text', label: 'Mesaj (Yedek)' },
      { field: 'buttonText', type: 'text', label: 'Buton Metni' },
      { field: 'buttonLink', type: 'url', label: 'Buton Linki' },
      { field: 'backgroundColor', type: 'color', label: 'Arka Plan Rengi' },
      { field: 'textColor', type: 'color', label: 'Yazı Rengi' },
      { field: 'dismissable', type: 'boolean', label: 'Kapatılabilir' },
    ],
  },
  {
    type: 'slider',
    name: 'Slayt Gösterisi',
    category: 'marketing',
    icon: FaImages,
    defaultProps: {
      sliderId: '',
      height: '500px',
    },
    propsSchema: [
      { field: 'sliderId', type: 'text', label: 'Slider ID', placeholder: 'Slider UUID' },
      { field: 'height', type: 'text', label: 'Yükseklik', placeholder: '500px' },
    ],
  },
  {
    type: 'faq',
    name: 'Sık Sorulan Sorular',
    category: 'content',
    icon: FaQuestionCircle,
    defaultProps: {
      title: 'Sık Sorulan Sorular',
      category: '',
      maxItems: 10,
    },
    propsSchema: [
      { field: 'title', type: 'text', label: 'Başlık' },
      { field: 'category', type: 'text', label: 'Kategori Filtresi', placeholder: 'Boş = Tümü' },
      { field: 'maxItems', type: 'number', label: 'Maksimum Öğe' },
    ],
  },

  // ── Forms ─────────────────────────────────────────────────────────────
  {
    type: 'contact-form',
    name: 'İletişim Formu',
    category: 'forms',
    icon: FaWpforms,
    defaultProps: {
      title: 'Bize Ulaşın',
      subtitle: 'Sorularınız için bize yazın.',
      showPhone: true,
      showSubject: true,
      buttonText: 'Gönder',
      buttonColor: '#ec4899',
      successMessage: 'Mesajınız alındı!',
    },
    propsSchema: [
      { field: 'title', type: 'text', label: 'Başlık' },
      { field: 'subtitle', type: 'text', label: 'Alt Başlık' },
      { field: 'showPhone', type: 'boolean', label: 'Telefon Alanı' },
      { field: 'showSubject', type: 'boolean', label: 'Konu Alanı' },
      { field: 'buttonText', type: 'text', label: 'Buton Metni' },
      { field: 'buttonColor', type: 'color', label: 'Buton Rengi' },
      { field: 'successMessage', type: 'text', label: 'Başarı Mesajı' },
    ],
  },

  // ── Advanced ─────────────────────────────────────────────────────────
  {
    type: 'custom-html',
    name: 'Özel HTML',
    category: 'advanced',
    icon: FaCode,
    defaultProps: {
      html: '<!-- Özel HTML kodunuzu buraya yazın -->',
    },
    propsSchema: [
      { field: 'html', type: 'richtext', label: 'HTML Kodu' },
    ],
  },

  // ── Corporate ────────────────────────────────────────────────────────
  {
    type: 'team-grid',
    name: 'Ekip Üyeleri',
    category: 'corporate',
    icon: FaUsers,
    defaultProps: {
      title: 'Ekibimiz',
      items: [
        { name: 'Ahmet Yılmaz', role: 'CEO', imageUrl: '', linkedIn: '' },
        { name: 'Ayşe Demir', role: 'CTO', imageUrl: '', linkedIn: '' },
      ],
      columns: 3,
    },
    propsSchema: [
      { field: 'title', type: 'text', label: 'Başlık' },
      { field: 'columns', type: 'select', label: 'Kolon', options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }] },
      {
        field: 'items', type: 'json-array', label: 'Üyeler', itemSchema: [
          { key: 'name', label: 'İsim', type: 'text' },
          { key: 'role', label: 'Unvan', type: 'text' },
          { key: 'imageUrl', label: 'Fotoğraf URL', type: 'url' },
        ],
      },
    ],
  },
  {
    type: 'services-grid',
    name: 'Hizmetler',
    category: 'corporate',
    icon: FaBriefcase,
    defaultProps: {
      title: 'Hizmetlerimiz',
      items: [
        { icon: 'FaRocket', title: 'Hızlı Teslimat', description: 'Aynı gün kargo imkânı.' },
        { icon: 'FaShieldAlt', title: 'Güvenli Ödeme', description: '256-bit SSL koruması.' },
        { icon: 'FaHeadset', title: '7/24 Destek', description: 'Her zaman yanınızdayız.' },
      ],
      columns: 3,
    },
    propsSchema: [
      { field: 'title', type: 'text', label: 'Başlık' },
      { field: 'columns', type: 'select', label: 'Kolon', options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }] },
      {
        field: 'items', type: 'json-array', label: 'Hizmetler', itemSchema: [
          { key: 'title', label: 'Başlık', type: 'text' },
          { key: 'description', label: 'Açıklama', type: 'textarea' },
        ],
      },
    ],
  },
  {
    type: 'blog-list',
    name: 'Blog Yazıları',
    category: 'corporate',
    icon: FaNewspaper,
    defaultProps: {
      title: 'Blog',
      limit: 3,
      columns: 3,
      showFeaturedImage: true,
      dataSource: 'api',
    },
    propsSchema: [
      { field: 'title', type: 'text', label: 'Başlık' },
      { field: 'limit', type: 'number', label: 'Yazı Sayısı' },
      { field: 'columns', type: 'select', label: 'Kolon', options: [{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }] },
      { field: 'showFeaturedImage', type: 'boolean', label: 'Kapak Görseli' },
    ],
  },
  {
    type: 'timeline',
    name: 'Zaman Çizelgesi',
    category: 'corporate',
    icon: FaHistory,
    defaultProps: {
      title: 'Tarihçemiz',
      items: [
        { year: '2018', title: 'Kuruluş', description: 'Şirketimiz kuruldu.' },
        { year: '2020', title: 'Büyüme', description: '100 çalışana ulaştık.' },
        { year: '2024', title: 'İnovasyon', description: 'Yeni ürün serimizi lansmanladık.' },
      ],
    },
    propsSchema: [
      { field: 'title', type: 'text', label: 'Başlık' },
      {
        field: 'items', type: 'json-array', label: 'Etkinlikler', itemSchema: [
          { key: 'year', label: 'Yıl / Tarih', type: 'text' },
          { key: 'title', label: 'Başlık', type: 'text' },
          { key: 'description', label: 'Açıklama', type: 'textarea' },
        ],
      },
    ],
  },
  {
    type: 'portfolio-grid',
    name: 'Portfolyo',
    category: 'corporate',
    icon: FaTh,
    defaultProps: {
      title: 'Projelerimiz',
      items: [
        { title: 'Proje 1', category: 'Web', imageUrl: '', url: '' },
        { title: 'Proje 2', category: 'Mobil', imageUrl: '', url: '' },
      ],
      columns: 3,
    },
    propsSchema: [
      { field: 'title', type: 'text', label: 'Başlık' },
      { field: 'columns', type: 'select', label: 'Kolon', options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }] },
      {
        field: 'items', type: 'json-array', label: 'Projeler', itemSchema: [
          { key: 'title', label: 'Başlık', type: 'text' },
          { key: 'category', label: 'Kategori', type: 'text' },
          { key: 'imageUrl', label: 'Görsel URL', type: 'url' },
          { key: 'url', label: 'Proje Linki', type: 'url' },
        ],
      },
    ],
  },
  {
    type: 'map-embed',
    name: 'Harita',
    category: 'corporate',
    icon: FaMapMarkerAlt,
    defaultProps: {
      embedUrl: '',
      height: '400px',
      title: 'Konum',
    },
    propsSchema: [
      { field: 'title', type: 'text', label: 'Başlık' },
      { field: 'embedUrl', type: 'url', label: 'Google Maps Embed URL' },
      { field: 'height', type: 'text', label: 'Yükseklik' },
    ],
  },
];

export const BLOCK_BY_TYPE = Object.fromEntries(BLOCK_REGISTRY.map(b => [b.type, b]));

export const BLOCK_CATEGORIES = {
  hero: 'Hero',
  content: 'İçerik',
  commerce: 'E-Ticaret',
  marketing: 'Pazarlama',
  forms: 'Formlar',
  advanced: 'Gelişmiş',
  corporate: 'Kurumsal',
} as const;
