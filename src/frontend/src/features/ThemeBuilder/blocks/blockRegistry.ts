import {
  FaImage, FaColumns, FaShoppingBag, FaThLarge, FaFileAlt, FaEnvelope,
  FaQuoteLeft, FaClock, FaBullhorn, FaTrademark, FaChartBar,
  FaVideo, FaAlignLeft, FaWpforms, FaCode, FaImages, FaQuestionCircle,
  FaUsers, FaBriefcase, FaNewspaper, FaHistory, FaTh, FaMapMarkerAlt,
  FaBuilding, FaHandshake, FaDollarSign, FaPhone, FaTrophy,
  FaCheckCircle, FaListAlt, FaBullseye, FaAddressCard, FaStar,
  FaSquare, FaTable,
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import type { ThemeConfig } from '../../../entities/StorePage/model/types';

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
  group?: 'content' | 'visual' | 'style' | 'advanced';
}

export interface ChildElement {
  key: string;       // prop field name — e.g. "title", "subtitle", "buttonText"
  label: string;     // label shown in LayersPanel — e.g. "Başlık", "Alt Başlık"
  selector?: string; // optional CSS selector hint — e.g. "h1", "p", "button"
}

export interface BlockDefinition {
  type: string;
  name: string;
  category: 'hero' | 'content' | 'commerce' | 'marketing' | 'forms' | 'advanced' | 'corporate';
  icon: IconType;
  defaultProps: Record<string, unknown>;
  propsSchema: PropField[];
  children?: ChildElement[];
  isContainer?: boolean;
  toCss?: (props: Record<string, unknown>, theme: ThemeConfig) => string;
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
      { field: 'title',          type: 'text',     label: 'Başlık',               group: 'content' },
      { field: 'subtitle',       type: 'textarea', label: 'Alt Başlık', rows: 2,  group: 'content' },
      { field: 'buttonText',     type: 'text',     label: 'Buton Metni',          group: 'style'   },
      { field: 'buttonLink',     type: 'url',      label: 'Buton Linki',          group: 'style'   },
      { field: 'imageUrl',       type: 'image',    label: 'Arka Plan Görseli',    group: 'visual'  },
      { field: 'overlayOpacity', type: 'number',   label: 'Karartma (0-1)',       group: 'visual'  },
      { field: 'height',         type: 'text',     label: 'Yükseklik (px/vh)',    group: 'visual'  },
    ],
    children: [
      { key: 'title',       label: 'Başlık',       selector: 'h1'         },
      { key: 'subtitle',    label: 'Alt Başlık',   selector: 'p'          },
      { key: 'buttonText',  label: 'Buton',        selector: 'button'     },
      { key: 'imageUrl',    label: 'Arka Plan',    selector: 'div[style]' },
    ],
    toCss: (props, theme) => {
      const height = (props['height'] as string | undefined) ?? '560px';
      return [
        `.hero { min-height: ${height}; font-family: ${theme.typography.fontFamily}; }`,
        `.hero h1 { color: ${theme.colors.text}; font-size: 2.5rem; font-weight: ${theme.typography.headingWeight}; }`,
        `.hero p { color: ${theme.colors.textMuted}; }`,
        `.hero button { background: ${theme.colors.primary}; border-radius: ${theme.borderRadius.button}; }`,
      ].join('\n');
    },
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
      { field: 'title',         type: 'text',     label: 'Başlık',                                                                                            group: 'content' },
      { field: 'subtitle',      type: 'text',     label: 'Alt Başlık',                                                                                        group: 'content' },
      { field: 'text',          type: 'textarea', label: 'Metin', rows: 3,                                                                                    group: 'content' },
      { field: 'buttonText',    type: 'text',     label: 'Buton Metni',                                                                                       group: 'style'   },
      { field: 'buttonLink',    type: 'url',      label: 'Buton Linki',                                                                                       group: 'style'   },
      { field: 'imageUrl',      type: 'image',    label: 'Görsel',                                                                                            group: 'visual'  },
      { field: 'imagePosition', type: 'select',   label: 'Görsel Tarafı', options: [{ value: 'left', label: 'Sol' }, { value: 'right', label: 'Sağ' }],      group: 'visual'  },
    ],
    children: [
      { key: 'title',      label: 'Başlık',     selector: 'h2'     },
      { key: 'subtitle',   label: 'Alt Başlık', selector: 'h3'     },
      { key: 'text',       label: 'Metin',      selector: 'p'      },
      { key: 'buttonText', label: 'Buton',      selector: 'button' },
      { key: 'imageUrl',   label: 'Görsel',     selector: 'img'    },
    ],
    toCss: (props, theme) => {
      return [
        `.hero-split { font-family: ${theme.typography.fontFamily}; }`,
        `.hero-split h2 { color: ${theme.colors.text}; font-weight: ${theme.typography.headingWeight}; }`,
        `.hero-split h3 { color: ${theme.colors.primary}; }`,
        `.hero-split p { color: ${theme.colors.textMuted}; line-height: ${theme.typography.lineHeight}; }`,
        `.hero-split button { background: ${theme.colors.primary}; border-radius: ${theme.borderRadius.button}; }`,
      ].join('\n');
    },
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
      { field: 'title',         type: 'text',    label: 'Başlık',                                                                                       group: 'content' },
      { field: 'text',          type: 'richtext', label: 'Metin',                                                                                        group: 'content' },
      { field: 'imageUrl',      type: 'image',   label: 'Görsel',                                                                                        group: 'visual'  },
      { field: 'imagePosition', type: 'select',  label: 'Görsel Tarafı', options: [{ value: 'left', label: 'Sol' }, { value: 'right', label: 'Sağ' }],  group: 'visual'  },
    ],
    children: [
      { key: 'title',    label: 'Başlık', selector: 'h2'       },
      { key: 'text',     label: 'Metin',  selector: 'div.text' },
      { key: 'imageUrl', label: 'Görsel', selector: 'img'      },
    ],
    toCss: (props, theme) => {
      return [
        `.text-image { font-family: ${theme.typography.fontFamily}; }`,
        `.text-image h2 { color: ${theme.colors.text}; font-weight: ${theme.typography.headingWeight}; }`,
        `.text-image div.text { color: ${theme.colors.textMuted}; line-height: ${theme.typography.lineHeight}; }`,
      ].join('\n');
    },
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
      { field: 'html', type: 'richtext', label: 'İçerik', group: 'content' },
    ],
    children: [
      { key: 'html', label: 'İçerik', selector: 'div' },
    ],
    toCss: (_props, theme) => {
      return [
        `.rich-text { font-family: ${theme.typography.fontFamily}; color: ${theme.colors.text}; line-height: ${theme.typography.lineHeight}; }`,
      ].join('\n');
    },
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
        field: 'items', type: 'json-array', label: 'İstatistikler', group: 'content',
        itemSchema: [
          { key: 'value', label: 'Değer', type: 'text', placeholder: '10.000+' },
          { key: 'label', label: 'Etiket', type: 'text', placeholder: 'Mutlu Müşteri' },
        ],
      },
    ],
    children: [
      { key: 'items', label: 'İstatistikler', selector: 'ul' },
    ],
    toCss: (_props, theme) => {
      return [
        `.stats-bar { background: ${theme.colors.surface}; font-family: ${theme.typography.fontFamily}; }`,
        `.stats-bar .value { color: ${theme.colors.primary}; font-weight: ${theme.typography.headingWeight}; }`,
        `.stats-bar .label { color: ${theme.colors.textMuted}; }`,
      ].join('\n');
    },
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
      { field: 'title',    type: 'text',    label: 'Başlık',          group: 'content'  },
      { field: 'url',      type: 'url',     label: 'YouTube/Vimeo URL', group: 'content' },
      { field: 'autoplay', type: 'boolean', label: 'Otomatik Oynat',  group: 'advanced' },
      { field: 'muted',    type: 'boolean', label: 'Sessiz',          group: 'advanced' },
    ],
    children: [
      { key: 'title', label: 'Başlık',    selector: 'h3'     },
      { key: 'url',   label: 'Video URL', selector: 'iframe' },
    ],
    toCss: (_props, theme) => {
      return [
        `.video-embed h3 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
      ].join('\n');
    },
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
      { field: 'title',   type: 'text',   label: 'Başlık',       group: 'content'  },
      { field: 'limit',   type: 'number', label: 'Ürün Sayısı',  group: 'advanced' },
      { field: 'columns', type: 'select', label: 'Kolon Sayısı', group: 'style',   options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }] },
      { field: 'sortBy',  type: 'select', label: 'Sıralama',     group: 'advanced', options: [{ value: 'newest', label: 'Yeni' }, { value: 'featured', label: 'Öne Çıkan' }, { value: 'bestselling', label: 'Çok Satan' }] },
    ],
    children: [
      { key: 'title', label: 'Başlık', selector: 'h2' },
    ],
    toCss: (_props, theme) => {
      return [
        `.featured-products h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
        `.featured-products .product-card { border-radius: ${theme.borderRadius.card}; box-shadow: ${theme.shadows.card}; background: ${theme.colors.surface}; }`,
      ].join('\n');
    },
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
      { field: 'title',   type: 'text',   label: 'Başlık',          group: 'content'  },
      { field: 'limit',   type: 'number', label: 'Kategori Sayısı', group: 'advanced' },
      { field: 'columns', type: 'select', label: 'Kolon Sayısı',    group: 'style',   options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }] },
    ],
    children: [
      { key: 'title', label: 'Başlık', selector: 'h2' },
    ],
    toCss: (_props, theme) => {
      return [
        `.categories-grid h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
        `.categories-grid .category-card { border-radius: ${theme.borderRadius.card}; }`,
      ].join('\n');
    },
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
      { field: 'title', type: 'text', label: 'Başlık', group: 'content' },
      {
        field: 'logos', type: 'json-array', label: 'Logolar', group: 'content',
        itemSchema: [
          { key: 'imageUrl', label: 'Görsel URL', type: 'url', placeholder: 'https://...' },
          { key: 'link',     label: 'Link (opsiyonel)', type: 'url', placeholder: 'https://...' },
        ],
      },
    ],
    children: [
      { key: 'title', label: 'Başlık',      selector: 'h3' },
      { key: 'logos', label: 'Logo Listesi', selector: 'ul' },
    ],
    toCss: (_props, theme) => {
      return [
        `.brand-logos h3 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; }`,
        `.brand-logos { background: ${theme.colors.surface}; }`,
      ].join('\n');
    },
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
      { field: 'title',          type: 'text',     label: 'Başlık',        group: 'content' },
      { field: 'text',           type: 'textarea', label: 'Açıklama', rows: 2, group: 'content' },
      { field: 'buttonText',     type: 'text',     label: 'Buton Metni',   group: 'style'   },
      { field: 'successMessage', type: 'text',     label: 'Başarı Mesajı', group: 'content' },
    ],
    children: [
      { key: 'title',      label: 'Başlık',    selector: 'h2'     },
      { key: 'text',       label: 'Açıklama',  selector: 'p'      },
      { key: 'buttonText', label: 'Buton',     selector: 'button' },
    ],
    toCss: (_props, theme) => {
      return [
        `.newsletter h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
        `.newsletter p { color: ${theme.colors.textMuted}; }`,
        `.newsletter button { background: ${theme.colors.primary}; border-radius: ${theme.borderRadius.button}; }`,
      ].join('\n');
    },
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
      { field: 'title', type: 'text', label: 'Başlık', group: 'content' },
      {
        field: 'items', type: 'json-array', label: 'Yedek Yorumlar (API yoksa)', group: 'content',
        itemSchema: [
          { key: 'name',   label: 'İsim',        type: 'text',     placeholder: 'Ayşe K.'             },
          { key: 'role',   label: 'Unvan',        type: 'text',     placeholder: 'Müşteri'             },
          { key: 'quote',  label: 'Yorum',        type: 'textarea', placeholder: 'Harika bir deneyim!' },
          { key: 'rating', label: 'Puan (1-5)',   type: 'number',   placeholder: '5'                  },
        ],
      },
    ],
    children: [
      { key: 'title', label: 'Başlık',  selector: 'h2' },
      { key: 'items', label: 'Yorumlar', selector: 'ul' },
    ],
    toCss: (_props, theme) => {
      return [
        `.testimonials h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
        `.testimonials .testimonial-card { background: ${theme.colors.surface}; border-radius: ${theme.borderRadius.card}; box-shadow: ${theme.shadows.card}; }`,
      ].join('\n');
    },
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
      { field: 'title',      type: 'text', label: 'Başlık',              group: 'content'  },
      { field: 'targetDate', type: 'text', label: 'Hedef Tarih (ISO)',   group: 'advanced' },
      { field: 'message',    type: 'text', label: 'Mesaj',               group: 'content'  },
    ],
    children: [
      { key: 'title',   label: 'Başlık', selector: 'h2' },
      { key: 'message', label: 'Mesaj',  selector: 'p'  },
    ],
    toCss: (_props, theme) => {
      return [
        `.countdown h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
        `.countdown .timer-digit { color: ${theme.colors.primary}; font-size: 2rem; }`,
        `.countdown p { color: ${theme.colors.textMuted}; }`,
      ].join('\n');
    },
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
      { field: 'message',         type: 'text',    label: 'Mesaj (Yedek)',   group: 'content'  },
      { field: 'buttonText',      type: 'text',    label: 'Buton Metni',     group: 'style'    },
      { field: 'buttonLink',      type: 'url',     label: 'Buton Linki',     group: 'style'    },
      { field: 'backgroundColor', type: 'color',   label: 'Arka Plan Rengi', group: 'visual'   },
      { field: 'textColor',       type: 'color',   label: 'Yazı Rengi',      group: 'visual'   },
      { field: 'dismissable',     type: 'boolean', label: 'Kapatılabilir',   group: 'advanced' },
    ],
    children: [
      { key: 'message',    label: 'Mesaj', selector: 'span'   },
      { key: 'buttonText', label: 'Buton', selector: 'button' },
    ],
    toCss: (props, _theme) => {
      const bg   = (props['backgroundColor'] as string | undefined) ?? '#ec4899';
      const text = (props['textColor']       as string | undefined) ?? '#ffffff';
      return [
        `.promo-banner { background: ${bg}; color: ${text}; }`,
        `.promo-banner button { color: ${bg}; background: ${text}; }`,
      ].join('\n');
    },
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
      { field: 'sliderId', type: 'text', label: 'Slider ID',   placeholder: 'Slider UUID', group: 'advanced' },
      { field: 'height',   type: 'text', label: 'Yükseklik',   placeholder: '500px',       group: 'visual'   },
    ],
    children: [
      { key: 'sliderId', label: 'Slider ID', selector: 'div' },
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
      { field: 'title',    type: 'text',   label: 'Başlık',                                  group: 'content'  },
      { field: 'category', type: 'text',   label: 'Kategori Filtresi', placeholder: 'Boş = Tümü', group: 'advanced' },
      { field: 'maxItems', type: 'number', label: 'Maksimum Öğe',                             group: 'advanced' },
    ],
    children: [
      { key: 'title', label: 'Başlık', selector: 'h2' },
    ],
    toCss: (_props, theme) => {
      return [
        `.faq h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
        `.faq .faq-item { border-bottom: 1px solid ${theme.colors.border}; }`,
      ].join('\n');
    },
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
      { field: 'title',          type: 'text',    label: 'Başlık',        group: 'content'  },
      { field: 'subtitle',       type: 'text',    label: 'Alt Başlık',    group: 'content'  },
      { field: 'showPhone',      type: 'boolean', label: 'Telefon Alanı', group: 'advanced' },
      { field: 'showSubject',    type: 'boolean', label: 'Konu Alanı',    group: 'advanced' },
      { field: 'buttonText',     type: 'text',    label: 'Buton Metni',   group: 'style'    },
      { field: 'buttonColor',    type: 'color',   label: 'Buton Rengi',   group: 'style'    },
      { field: 'successMessage', type: 'text',    label: 'Başarı Mesajı', group: 'content'  },
    ],
    children: [
      { key: 'title',      label: 'Başlık',         selector: 'h2'     },
      { key: 'subtitle',   label: 'Alt Başlık',      selector: 'p'      },
      { key: 'buttonText', label: 'Gönder Butonu',   selector: 'button' },
    ],
    toCss: (props, theme) => {
      const btnColor = (props['buttonColor'] as string | undefined) ?? theme.colors.primary;
      return [
        `.contact-form h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
        `.contact-form p { color: ${theme.colors.textMuted}; }`,
        `.contact-form button[type="submit"] { background: ${btnColor}; border-radius: ${theme.borderRadius.button}; }`,
        `.contact-form input, .contact-form textarea { border: 1px solid ${theme.colors.border}; border-radius: ${theme.borderRadius.md}; }`,
      ].join('\n');
    },
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
      { field: 'html', type: 'richtext', label: 'HTML Kodu', group: 'content' },
    ],
    children: [
      { key: 'html', label: 'HTML', selector: 'div' },
    ],
  },

  // ── Corporate ────────────────────────────────────────────────────────
  {
    type: 'hero-corporate',
    name: 'Kurumsal Hero',
    category: 'corporate',
    icon: FaBuilding,
    defaultProps: {
      title: 'İşinizi Geleceğe Taşıyın',
      subtitle: 'Stratejik danışmanlık, teknoloji çözümleri ve kurumsal dönüşüm hizmetleriyle işletmenizi bir üst seviyeye taşıyoruz.',
      primaryButtonText: 'Ücretsiz Keşif Görüşmesi',
      primaryButtonLink: '/iletisim',
      secondaryButtonText: 'Başarı Hikayelerini İncele',
      secondaryButtonLink: '/referanslar',
      imageUrl: '',
      trustBadges: [
        { text: 'ISO 9001:2015 Sertifikalı' },
        { text: '500+ Tamamlanan Proje' },
        { text: '15 Yıllık Deneyim' },
        { text: '%98 Müşteri Memnuniyeti' },
      ],
      overlayOpacity: 0.55,
      height: '640px',
      badgeBackgroundColor: 'rgba(255,255,255,0.12)',
    },
    propsSchema: [
      { field: 'title',                type: 'text',     label: 'Ana Başlık',          group: 'content'  },
      { field: 'subtitle',             type: 'textarea', label: 'Alt Başlık', rows: 3,  group: 'content'  },
      { field: 'primaryButtonText',    type: 'text',     label: 'Birincil Buton',      group: 'style'    },
      { field: 'primaryButtonLink',    type: 'url',      label: 'Birincil Buton Linki', group: 'style'   },
      { field: 'secondaryButtonText',  type: 'text',     label: 'İkincil Buton',       group: 'style'    },
      { field: 'secondaryButtonLink',  type: 'url',      label: 'İkincil Buton Linki', group: 'style'    },
      { field: 'imageUrl',             type: 'image',    label: 'Arka Plan Görseli',   group: 'visual'   },
      { field: 'overlayOpacity',       type: 'number',   label: 'Karartma (0-1)',       group: 'visual'   },
      { field: 'height',               type: 'text',     label: 'Yükseklik',           group: 'visual'   },
      {
        field: 'trustBadges', type: 'json-array', label: 'Güven Rozetleri', group: 'content',
        itemSchema: [
          { key: 'text', label: 'Rozet Metni', type: 'text', placeholder: 'ISO 9001 Sertifikalı' },
        ],
      },
    ],
    children: [
      { key: 'title',               label: 'Ana Başlık',    selector: 'h1'     },
      { key: 'subtitle',            label: 'Alt Başlık',    selector: 'p'      },
      { key: 'primaryButtonText',   label: 'Birincil Buton', selector: 'a.btn-primary' },
      { key: 'secondaryButtonText', label: 'İkincil Buton',  selector: 'a.btn-secondary' },
    ],
    toCss: (props, theme) => {
      const height = (props['height'] as string | undefined) ?? '640px';
      return [
        `.hero-corporate { min-height: ${height}; font-family: ${theme.typography.fontFamily}; }`,
        `.hero-corporate h1 { color: #ffffff; font-size: 3rem; font-weight: ${theme.typography.headingWeight}; line-height: 1.2; }`,
        `.hero-corporate .hero-subtitle { color: rgba(255,255,255,0.88); font-size: 1.2rem; line-height: ${theme.typography.lineHeight}; }`,
        `.hero-corporate .btn-primary { background: ${theme.colors.primary}; color: #fff; border-radius: ${theme.borderRadius.button}; padding: 0.9rem 2rem; font-weight: 600; }`,
        `.hero-corporate .btn-secondary { background: transparent; color: #fff; border: 2px solid rgba(255,255,255,0.6); border-radius: ${theme.borderRadius.button}; padding: 0.9rem 2rem; }`,
        `.hero-corporate .trust-badge { background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); border-radius: ${theme.borderRadius.md}; color: #fff; font-size: 0.82rem; }`,
      ].join('\n');
    },
  },
  {
    type: 'about-company',
    name: 'Hakkımızda',
    category: 'corporate',
    icon: FaBuilding,
    defaultProps: {
      title: 'Biz Kimiz?',
      subtitle: '2009\'dan bu yana 500\'den fazla kurumsal müşteriye değer katıyoruz',
      text: 'Wixi olarak, işletmelerin dijital dönüşüm yolculuğunda güvenilir iş ortağı olma misyonuyla kurulduk. Deneyimli ekibimiz, yenilikçi teknoloji çözümleri ve stratejik danışmanlık hizmetleriyle müşterilerimizin rekabet avantajı kazanmasına destek oluyoruz.\n\nMüşteri odaklı yaklaşımımız, şeffaf iletişim anlayışımız ve sonuç garantili projelerimizle sektörde fark yaratıyoruz.',
      imageUrl: '',
      imagePosition: 'right',
      missionTitle: 'Misyonumuz',
      missionText: 'Her ölçekteki işletmeye, sınıf ötesi teknoloji ve danışmanlık hizmetleri sunarak sürdürülebilir büyüme sağlamak.',
      visionTitle: 'Vizyonumuz',
      visionText: 'Türkiye\'nin en güvenilir dijital dönüşüm partneri olmak ve global pazarda güçlü bir iz bırakmak.',
      stats: [
        { value: '15+', label: 'Yıllık Deneyim' },
        { value: '500+', label: 'Tamamlanan Proje' },
        { value: '120+', label: 'Uzman Çalışan' },
        { value: '%98', label: 'Müşteri Memnuniyeti' },
      ],
      showStats: true,
      showMissionVision: true,
    },
    propsSchema: [
      { field: 'title',            type: 'text',     label: 'Başlık',             group: 'content' },
      { field: 'subtitle',         type: 'textarea', label: 'Alt Başlık', rows: 2, group: 'content' },
      { field: 'text',             type: 'richtext', label: 'Ana Metin',           group: 'content' },
      { field: 'imageUrl',         type: 'image',    label: 'Görsel',              group: 'visual'  },
      { field: 'imagePosition',    type: 'select',   label: 'Görsel Tarafı',       group: 'visual',  options: [{ value: 'left', label: 'Sol' }, { value: 'right', label: 'Sağ' }] },
      { field: 'showStats',        type: 'boolean',  label: 'İstatistikler Göster', group: 'advanced' },
      { field: 'showMissionVision',type: 'boolean',  label: 'Misyon/Vizyon Göster', group: 'advanced' },
      { field: 'missionTitle',     type: 'text',     label: 'Misyon Başlığı',      group: 'content' },
      { field: 'missionText',      type: 'textarea', label: 'Misyon Metni', rows: 3, group: 'content' },
      { field: 'visionTitle',      type: 'text',     label: 'Vizyon Başlığı',      group: 'content' },
      { field: 'visionText',       type: 'textarea', label: 'Vizyon Metni', rows: 3, group: 'content' },
      {
        field: 'stats', type: 'json-array', label: 'İstatistikler', group: 'content',
        itemSchema: [
          { key: 'value', label: 'Değer',  type: 'text', placeholder: '500+' },
          { key: 'label', label: 'Etiket', type: 'text', placeholder: 'Tamamlanan Proje' },
        ],
      },
    ],
    children: [
      { key: 'title',       label: 'Başlık',    selector: 'h2'       },
      { key: 'subtitle',    label: 'Alt Başlık', selector: '.subtitle' },
      { key: 'text',        label: 'Ana Metin',  selector: 'div.text' },
      { key: 'imageUrl',    label: 'Görsel',     selector: 'img'      },
      { key: 'missionText', label: 'Misyon',     selector: '.mission' },
      { key: 'visionText',  label: 'Vizyon',     selector: '.vision'  },
    ],
    toCss: (_props, theme) => {
      return [
        `.about-company h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
        `.about-company .subtitle { color: ${theme.colors.primary}; font-weight: 500; }`,
        `.about-company div.text { color: ${theme.colors.textMuted}; line-height: ${theme.typography.lineHeight}; }`,
        `.about-company .mission-box, .about-company .vision-box { background: ${theme.colors.surface}; border-left: 4px solid ${theme.colors.primary}; border-radius: ${theme.borderRadius.md}; }`,
        `.about-company .mission-title, .about-company .vision-title { color: ${theme.colors.primary}; font-weight: ${theme.typography.headingWeight}; }`,
        `.about-company .stat-value { color: ${theme.colors.primary}; font-size: 2rem; font-weight: ${theme.typography.headingWeight}; }`,
        `.about-company .stat-label { color: ${theme.colors.textMuted}; font-size: 0.875rem; }`,
      ].join('\n');
    },
  },
  {
    type: 'team-grid',
    name: 'Ekip Üyeleri',
    category: 'corporate',
    icon: FaUsers,
    defaultProps: {
      title: 'Liderlik Kadromuz',
      subtitle: 'Alanında uzman, tutkulu profesyonellerimizle tanışın',
      items: [
        { name: 'Mehmet Arslan', role: 'CEO & Kurucu', bio: 'Teknoloji ve inovasyona 15 yıllık deneyimle şirketi geleceğe taşıyor. Stanford MBA mezunu.', imageUrl: '', linkedIn: '', twitter: '', email: 'mehmet@ornek.com' },
        { name: 'Zeynep Kaya',  role: 'CTO',           bio: 'Yazılım mimarisi ve ürün geliştirme konusunda 12 yıllık deneyimli teknoloji lideri.', imageUrl: '', linkedIn: '', twitter: '', email: 'zeynep@ornek.com' },
        { name: 'Ali Demir',    role: 'Tasarım Direktörü', bio: 'Kullanıcı deneyimi ve kurumsal kimlik tasarımında ödüllü bir kariyer sürdürüyor.', imageUrl: '', linkedIn: '', twitter: '', email: 'ali@ornek.com' },
        { name: 'Ayşe Yıldız', role: 'İş Geliştirme Müdürü', bio: 'B2B satış ve ortaklık stratejilerinde 10 yıllık güçlü bir sicile sahip.', imageUrl: '', linkedIn: '', twitter: '', email: 'ayse@ornek.com' },
      ],
      columns: '4',
      showBio: true,
      showSocial: true,
      cardStyle: 'card',
    },
    propsSchema: [
      { field: 'title',      type: 'text',     label: 'Başlık',             group: 'content'  },
      { field: 'subtitle',   type: 'textarea', label: 'Alt Başlık', rows: 2, group: 'content'  },
      { field: 'showBio',    type: 'boolean',  label: 'Biyografi Göster',   group: 'advanced' },
      { field: 'showSocial', type: 'boolean',  label: 'Sosyal Linkler',     group: 'advanced' },
      { field: 'cardStyle',  type: 'select',   label: 'Kart Stili',         group: 'style',   options: [{ value: 'card', label: 'Kart' }, { value: 'minimal', label: 'Minimal' }, { value: 'photo', label: 'Fotoğraf Odaklı' }] },
      { field: 'columns',    type: 'select',   label: 'Kolon',              group: 'style',   options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }] },
      {
        field: 'items', type: 'json-array', label: 'Üyeler', group: 'content',
        itemSchema: [
          { key: 'name',     label: 'İsim',          type: 'text'     },
          { key: 'role',     label: 'Unvan',         type: 'text'     },
          { key: 'bio',      label: 'Biyografi',     type: 'textarea' },
          { key: 'imageUrl', label: 'Fotoğraf URL',  type: 'url'      },
          { key: 'linkedIn', label: 'LinkedIn URL',  type: 'url'      },
          { key: 'twitter',  label: 'Twitter URL',   type: 'url'      },
          { key: 'email',    label: 'E-posta',       type: 'text'     },
        ],
      },
    ],
    children: [
      { key: 'title',    label: 'Başlık',     selector: 'h2' },
      { key: 'subtitle', label: 'Alt Başlık', selector: 'p'  },
      { key: 'items',    label: 'Üyeler',     selector: 'ul' },
    ],
    toCss: (_props, theme) => {
      return [
        `.team-grid h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
        `.team-grid .team-subtitle { color: ${theme.colors.textMuted}; line-height: ${theme.typography.lineHeight}; }`,
        `.team-grid .member-card { background: ${theme.colors.surface}; border-radius: ${theme.borderRadius.card}; box-shadow: ${theme.shadows.card}; transition: transform 0.25s, box-shadow 0.25s; }`,
        `.team-grid .member-card:hover { transform: translateY(-6px); box-shadow: 0 12px 32px rgba(0,0,0,0.15); }`,
        `.team-grid .member-name { color: ${theme.colors.text}; font-weight: ${theme.typography.headingWeight}; font-size: 1.1rem; }`,
        `.team-grid .member-role { color: ${theme.colors.primary}; font-size: 0.875rem; font-weight: 500; }`,
        `.team-grid .member-bio { color: ${theme.colors.textMuted}; font-size: 0.875rem; line-height: ${theme.typography.lineHeight}; }`,
        `.team-grid .social-link { color: ${theme.colors.textMuted}; transition: color 0.2s; }`,
        `.team-grid .social-link:hover { color: ${theme.colors.primary}; }`,
      ].join('\n');
    },
  },
  {
    type: 'services-grid',
    name: 'Hizmetler',
    category: 'corporate',
    icon: FaBriefcase,
    defaultProps: {
      title: 'Hizmetlerimiz',
      subtitle: 'İşletmenizin ihtiyaçlarına özel, uçtan uca kurumsal çözümler sunuyoruz',
      layout: 'grid',
      items: [
        { icon: 'FaLaptopCode', title: 'Yazılım Geliştirme', description: 'İşletmenize özel web uygulamaları, mobil çözümler ve kurumsal yazılım sistemleri geliştiriyoruz. Çevik metodoloji ile hızlı ve kaliteli teslimat sağlıyoruz.', iconColor: '#6366f1', buttonText: 'Detaylı Bilgi', buttonLink: '/hizmetler/yazilim' },
        { icon: 'FaChartLine',  title: 'Dijital Danışmanlık', description: 'Dijital dönüşüm stratejisi, süreç iyileştirme ve teknoloji yol haritası konularında uzman danışmanlık hizmeti veriyoruz.', iconColor: '#10b981', buttonText: 'Detaylı Bilgi', buttonLink: '/hizmetler/danismanlik' },
        { icon: 'FaShieldAlt', title: 'Siber Güvenlik', description: 'Kurumsal ağ güvenliği, penetrasyon testleri, KVKK uyumluluk denetimleri ve güvenlik operasyon merkezi hizmetleri sunuyoruz.', iconColor: '#f59e0b', buttonText: 'Detaylı Bilgi', buttonLink: '/hizmetler/guvenlik' },
        { icon: 'FaCloud',     title: 'Bulut Altyapısı', description: 'AWS, Azure ve Google Cloud üzerinde kurumsal altyapı tasarımı, migration ve yönetim hizmetleri ile maliyetlerinizi optimize ediyoruz.', iconColor: '#3b82f6', buttonText: 'Detaylı Bilgi', buttonLink: '/hizmetler/bulut' },
        { icon: 'FaCogs',      title: 'ERP & Entegrasyon', description: 'SAP, Microsoft Dynamics ve özel ERP çözümleri ile tüm iş süreçlerinizi tek platformda yönetin. Sistem entegrasyonu ve otomasyon uzmanlığı.', iconColor: '#8b5cf6', buttonText: 'Detaylı Bilgi', buttonLink: '/hizmetler/erp' },
        { icon: 'FaHeadset',   title: '7/24 Teknik Destek', description: 'Kritik sistemlerinizin kesintisiz çalışması için SLA garantili destek planları, uzaktan erişim desteği ve yerinde teknik servis hizmetleri.', iconColor: '#ec4899', buttonText: 'Detaylı Bilgi', buttonLink: '/hizmetler/destek' },
      ],
      columns: '3',
      showButton: true,
    },
    propsSchema: [
      { field: 'title',      type: 'text',     label: 'Başlık',      group: 'content' },
      { field: 'subtitle',   type: 'textarea', label: 'Alt Başlık', rows: 2, group: 'content' },
      { field: 'layout',     type: 'select',   label: 'Düzen',       group: 'style',  options: [{ value: 'grid', label: 'Izgara' }, { value: 'list', label: 'Liste' }, { value: 'featured', label: 'Öne Çıkan' }] },
      { field: 'showButton', type: 'boolean',  label: 'Buton Göster', group: 'advanced' },
      { field: 'columns',    type: 'select',   label: 'Kolon',       group: 'style',  options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }] },
      {
        field: 'items', type: 'json-array', label: 'Hizmetler', group: 'content',
        itemSchema: [
          { key: 'icon',        label: 'İkon (FA adı)',  type: 'text'     },
          { key: 'title',       label: 'Başlık',         type: 'text'     },
          { key: 'description', label: 'Açıklama',       type: 'textarea' },
          { key: 'iconColor',   label: 'İkon Rengi',     type: 'text',    placeholder: '#6366f1' },
          { key: 'buttonText',  label: 'Buton Metni',    type: 'text'     },
          { key: 'buttonLink',  label: 'Buton Linki',    type: 'url'      },
        ],
      },
    ],
    children: [
      { key: 'title',    label: 'Başlık',    selector: 'h2' },
      { key: 'subtitle', label: 'Alt Başlık', selector: 'p'  },
      { key: 'items',    label: 'Hizmetler', selector: 'ul' },
    ],
    toCss: (_props, theme) => {
      return [
        `.services-grid h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
        `.services-grid .services-subtitle { color: ${theme.colors.textMuted}; line-height: ${theme.typography.lineHeight}; }`,
        `.services-grid .service-card { background: ${theme.colors.surface}; border-radius: ${theme.borderRadius.card}; box-shadow: ${theme.shadows.card}; transition: transform 0.25s, box-shadow 0.25s; border: 1px solid ${theme.colors.border}; }`,
        `.services-grid .service-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.12); }`,
        `.services-grid .service-icon { font-size: 2.5rem; margin-bottom: 1rem; }`,
        `.services-grid .service-title { color: ${theme.colors.text}; font-weight: ${theme.typography.headingWeight}; font-size: 1.15rem; }`,
        `.services-grid .service-description { color: ${theme.colors.textMuted}; line-height: ${theme.typography.lineHeight}; font-size: 0.9rem; }`,
        `.services-grid .service-btn { color: ${theme.colors.primary}; font-weight: 500; font-size: 0.9rem; }`,
      ].join('\n');
    },
  },
  {
    type: 'features-highlight',
    name: 'Özellikler & Avantajlar',
    category: 'corporate',
    icon: FaCheckCircle,
    defaultProps: {
      title: 'Neden Bizi Seçmelisiniz?',
      subtitle: 'Rakiplerimizden farklı kılan güçlü yönlerimizi keşfedin',
      layout: 'grid',
      items: [
        { icon: 'FaAward',      title: 'Sektör Lideri',         description: '15 yıllık deneyimimiz ve 30\'dan fazla sektör ödülüyle alanımızın en güvenilir isimlerinden biriyiz.', color: '#6366f1' },
        { icon: 'FaClock',      title: 'Zamanında Teslimat',    description: 'Son 3 yılda tüm projelerimizin %97\'sini belirlenen süre ve bütçe dahilinde teslim ettik.', color: '#10b981' },
        { icon: 'FaUserCheck',  title: 'Uzman Ekip',            description: '80+ sertifikalı mühendis ve danışmandan oluşan multidisipliner ekibimiz her projeye özgün yaklaşıyor.', color: '#f59e0b' },
        { icon: 'FaShieldAlt', title: 'Güvenlik Önceliği',     description: 'ISO 27001 standartlarında veri güvenliği ve KVKK uyumluluk güvencesiyle verileriniz her zaman koruma altında.', color: '#3b82f6' },
        { icon: 'FaHeadset',   title: 'Proaktif Destek',       description: 'Sorun oluşmadan önce tespit eden izleme sistemleri ve 4 saatlik yanıt garantili destek ekibimiz her an hazır.', color: '#8b5cf6' },
        { icon: 'FaChartLine', title: 'Ölçülebilir Sonuçlar', description: 'Her projede KPI\'lar belirleniyor, ilerleme raporlanıyor ve yatırım getirisi (ROI) şeffaf biçimde takip ediliyor.', color: '#ec4899' },
      ],
      columns: '3',
    },
    propsSchema: [
      { field: 'title',    type: 'text',     label: 'Başlık',             group: 'content' },
      { field: 'subtitle', type: 'textarea', label: 'Alt Başlık', rows: 2, group: 'content' },
      { field: 'layout',   type: 'select',   label: 'Düzen',              group: 'style',  options: [{ value: 'grid', label: 'Izgara' }, { value: 'list', label: 'Liste' }] },
      { field: 'columns',  type: 'select',   label: 'Kolon',              group: 'style',  options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }] },
      {
        field: 'items', type: 'json-array', label: 'Özellikler', group: 'content',
        itemSchema: [
          { key: 'icon',        label: 'İkon (FA adı)', type: 'text'     },
          { key: 'title',       label: 'Başlık',        type: 'text'     },
          { key: 'description', label: 'Açıklama',      type: 'textarea' },
          { key: 'color',       label: 'Renk',          type: 'text',    placeholder: '#6366f1' },
        ],
      },
    ],
    children: [
      { key: 'title',    label: 'Başlık',    selector: 'h2' },
      { key: 'subtitle', label: 'Alt Başlık', selector: 'p'  },
      { key: 'items',    label: 'Özellikler', selector: 'ul' },
    ],
    toCss: (_props, theme) => {
      return [
        `.features-highlight h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
        `.features-highlight .features-subtitle { color: ${theme.colors.textMuted}; line-height: ${theme.typography.lineHeight}; }`,
        `.features-highlight .feature-card { background: ${theme.colors.surface}; border-radius: ${theme.borderRadius.card}; border: 1px solid ${theme.colors.border}; transition: border-color 0.2s; }`,
        `.features-highlight .feature-card:hover { border-color: ${theme.colors.primary}; }`,
        `.features-highlight .feature-title { color: ${theme.colors.text}; font-weight: ${theme.typography.headingWeight}; }`,
        `.features-highlight .feature-description { color: ${theme.colors.textMuted}; line-height: ${theme.typography.lineHeight}; font-size: 0.9rem; }`,
      ].join('\n');
    },
  },
  {
    type: 'process-steps',
    name: 'Nasıl Çalışırız?',
    category: 'corporate',
    icon: FaListAlt,
    defaultProps: {
      title: 'Çalışma Sürecimiz',
      subtitle: 'Her projeyi kanıtlanmış metodolojimizle, şeffaf ve öngörülebilir bir süreçte hayata geçiriyoruz',
      orientation: 'horizontal',
      steps: [
        { stepNumber: '01', icon: 'FaSearch',      title: 'Keşif & Analiz',      description: 'İş hedeflerinizi, mevcut altyapınızı ve rekabet ortamını derinlemesine analiz ediyoruz. Paydaş görüşmeleri ve teknik denetimle ihtiyaç haritasını çıkarıyoruz.' },
        { stepNumber: '02', icon: 'FaLightbulb',   title: 'Strateji & Planlama', description: 'Bulguları sentezleyerek önceliklendirilmiş yol haritası ve çözüm mimarisi oluşturuyoruz. Bütçe, zaman ve kaynak planlamasını netleştiriyoruz.' },
        { stepNumber: '03', icon: 'FaCode',         title: 'Tasarım & Geliştirme', description: 'Çevik metodoloji ile sprint bazlı geliştirme yapıyoruz. Her iki haftada bir demo ile ilerlemeyi paylaşıyor, geri bildirimleri anında entegre ediyoruz.' },
        { stepNumber: '04', icon: 'FaCheckDouble',  title: 'Test & Kalite Güvence', description: 'Otomatik ve manuel test süreçleriyle her bileşeni titizlikle doğruluyoruz. Performans, güvenlik ve kullanıcı kabul testleri raporlanıyor.' },
        { stepNumber: '05', icon: 'FaRocket',       title: 'Canlıya Geçiş',       description: 'Sıfır kesinti hedefiyle kademeli deployment yapıyoruz. Tüm ekibi eğitiyor ve kapsamlı dokümantasyon teslim ediyoruz.' },
        { stepNumber: '06', icon: 'FaHeadset',      title: 'Destek & İyileştirme', description: 'Canlı sonrası izleme, proaktif bakım ve sürekli optimizasyon ile uzun vadeli başarınızı güvence altına alıyoruz.' },
      ],
    },
    propsSchema: [
      { field: 'title',       type: 'text',     label: 'Başlık',             group: 'content' },
      { field: 'subtitle',    type: 'textarea', label: 'Alt Başlık', rows: 3, group: 'content' },
      { field: 'orientation', type: 'select',   label: 'Yön',                group: 'style',  options: [{ value: 'horizontal', label: 'Yatay' }, { value: 'vertical', label: 'Dikey' }] },
      {
        field: 'steps', type: 'json-array', label: 'Adımlar', group: 'content',
        itemSchema: [
          { key: 'stepNumber',  label: 'Adım No',    type: 'text'     },
          { key: 'icon',        label: 'İkon (FA)',   type: 'text'     },
          { key: 'title',       label: 'Başlık',     type: 'text'     },
          { key: 'description', label: 'Açıklama',   type: 'textarea' },
        ],
      },
    ],
    children: [
      { key: 'title',    label: 'Başlık',    selector: 'h2' },
      { key: 'subtitle', label: 'Alt Başlık', selector: 'p'  },
      { key: 'steps',    label: 'Adımlar',   selector: 'ol' },
    ],
    toCss: (_props, theme) => {
      return [
        `.process-steps h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
        `.process-steps .process-subtitle { color: ${theme.colors.textMuted}; line-height: ${theme.typography.lineHeight}; }`,
        `.process-steps .step-card { background: ${theme.colors.surface}; border-radius: ${theme.borderRadius.card}; border: 1px solid ${theme.colors.border}; }`,
        `.process-steps .step-number { background: ${theme.colors.primary}; color: #fff; font-weight: ${theme.typography.headingWeight}; border-radius: 50%; }`,
        `.process-steps .step-title { color: ${theme.colors.text}; font-weight: ${theme.typography.headingWeight}; }`,
        `.process-steps .step-description { color: ${theme.colors.textMuted}; line-height: ${theme.typography.lineHeight}; font-size: 0.9rem; }`,
        `.process-steps .step-connector { background: ${theme.colors.primary}; opacity: 0.3; }`,
      ].join('\n');
    },
  },
  {
    type: 'pricing-plans',
    name: 'Fiyatlandırma',
    category: 'corporate',
    icon: FaDollarSign,
    defaultProps: {
      title: 'Paketler & Fiyatlar',
      subtitle: 'İhtiyacınıza en uygun planı seçin. Tüm planlar 30 gün ücretsiz deneme içerir.',
      showAnnualToggle: true,
      annualDiscountText: '%20 tasarruf et',
      plans: [
        {
          name: 'Başlangıç',
          price: '2.990',
          priceAnnual: '2.392',
          currency: '₺',
          period: '/ay',
          description: 'Küçük ekipler ve girişimler için ideal başlangıç noktası.',
          highlighted: false,
          badge: '',
          buttonText: 'Ücretsiz Dene',
          buttonLink: '/kayit?plan=starter',
          features: [
            { text: '5 kullanıcıya kadar',         included: true  },
            { text: '10 GB depolama alanı',         included: true  },
            { text: 'Temel raporlama',              included: true  },
            { text: 'E-posta desteği',              included: true  },
            { text: 'API erişimi (1.000 istek/gün)', included: false },
            { text: 'Özel entegrasyonlar',          included: false },
            { text: 'Öncelikli destek',             included: false },
            { text: 'SLA garantisi',                included: false },
          ],
        },
        {
          name: 'Profesyonel',
          price: '7.990',
          priceAnnual: '6.392',
          currency: '₺',
          period: '/ay',
          description: 'Büyüyen işletmeler için gelişmiş özellikler ve esneklik.',
          highlighted: true,
          badge: 'En Popüler',
          buttonText: 'Hemen Başla',
          buttonLink: '/kayit?plan=pro',
          features: [
            { text: '25 kullanıcıya kadar',          included: true },
            { text: '100 GB depolama alanı',         included: true },
            { text: 'Gelişmiş raporlama & analitik', included: true },
            { text: 'Öncelikli e-posta & sohbet desteği', included: true },
            { text: 'API erişimi (50.000 istek/gün)', included: true },
            { text: '10 özel entegrasyon',           included: true },
            { text: 'Öncelikli destek',              included: true },
            { text: 'SLA garantisi',                 included: false },
          ],
        },
        {
          name: 'Kurumsal',
          price: 'Teklif Alın',
          priceAnnual: 'Teklif Alın',
          currency: '',
          period: '',
          description: 'Büyük kuruluşlar için özelleştirilebilir, ölçeklenebilir çözümler.',
          highlighted: false,
          badge: 'Özel Fiyatlandırma',
          buttonText: 'Bize Ulaşın',
          buttonLink: '/iletisim?plan=enterprise',
          features: [
            { text: 'Sınırsız kullanıcı',                  included: true },
            { text: 'Sınırsız depolama alanı',             included: true },
            { text: 'Özel raporlama & BI entegrasyonu',    included: true },
            { text: '7/24 telefon & e-posta desteği',      included: true },
            { text: 'Sınırsız API erişimi',                included: true },
            { text: 'Sınırsız özel entegrasyon',           included: true },
            { text: 'Dedicated hesap yöneticisi',          included: true },
            { text: '%99.9 uptime SLA garantisi',          included: true },
          ],
        },
      ],
    },
    propsSchema: [
      { field: 'title',              type: 'text',    label: 'Başlık',              group: 'content'  },
      { field: 'subtitle',           type: 'textarea', label: 'Alt Başlık', rows: 2, group: 'content'  },
      { field: 'showAnnualToggle',   type: 'boolean', label: 'Yıllık/Aylık Geçiş', group: 'advanced' },
      { field: 'annualDiscountText', type: 'text',    label: 'İndirim Etiketi',     group: 'content'  },
      {
        field: 'plans', type: 'json-array', label: 'Paketler', group: 'content',
        itemSchema: [
          { key: 'name',        label: 'Paket Adı',     type: 'text'     },
          { key: 'price',       label: 'Aylık Fiyat',   type: 'text'     },
          { key: 'priceAnnual', label: 'Yıllık Fiyat',  type: 'text'     },
          { key: 'currency',    label: 'Para Birimi',   type: 'text'     },
          { key: 'description', label: 'Açıklama',      type: 'textarea' },
          { key: 'badge',       label: 'Rozet',         type: 'text'     },
          { key: 'buttonText',  label: 'Buton Metni',   type: 'text'     },
          { key: 'buttonLink',  label: 'Buton Linki',   type: 'url'      },
        ],
      },
    ],
    children: [
      { key: 'title',    label: 'Başlık',    selector: 'h2' },
      { key: 'subtitle', label: 'Alt Başlık', selector: 'p'  },
      { key: 'plans',    label: 'Paketler',  selector: 'ul' },
    ],
    toCss: (_props, theme) => {
      return [
        `.pricing-plans h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
        `.pricing-plans .pricing-subtitle { color: ${theme.colors.textMuted}; }`,
        `.pricing-plans .plan-card { background: ${theme.colors.surface}; border-radius: ${theme.borderRadius.card}; border: 2px solid ${theme.colors.border}; transition: border-color 0.2s; }`,
        `.pricing-plans .plan-card.highlighted { border-color: ${theme.colors.primary}; box-shadow: 0 0 0 4px ${theme.colors.primary}22; }`,
        `.pricing-plans .plan-name { color: ${theme.colors.text}; font-weight: ${theme.typography.headingWeight}; }`,
        `.pricing-plans .plan-price { color: ${theme.colors.primary}; font-size: 2.5rem; font-weight: 700; }`,
        `.pricing-plans .plan-badge { background: ${theme.colors.primary}; color: #fff; border-radius: ${theme.borderRadius.md}; font-size: 0.75rem; font-weight: 600; }`,
        `.pricing-plans .feature-item.included { color: ${theme.colors.text}; }`,
        `.pricing-plans .feature-item.excluded { color: ${theme.colors.textMuted}; text-decoration: line-through; opacity: 0.5; }`,
        `.pricing-plans .plan-btn { background: ${theme.colors.primary}; color: #fff; border-radius: ${theme.borderRadius.button}; font-weight: 600; }`,
        `.pricing-plans .toggle-btn.active { background: ${theme.colors.primary}; color: #fff; }`,
      ].join('\n');
    },
  },
  {
    type: 'clients-logos',
    name: 'Müşteri & İş Ortakları',
    category: 'corporate',
    icon: FaHandshake,
    defaultProps: {
      title: 'Güvenilir İş Ortaklarımız',
      subtitle: '200\'den fazla kurumsal müşteri ve global iş ortağıyla büyümeye devam ediyoruz',
      grayscale: true,
      showOnHoverColor: true,
      columns: '6',
      logos: [
        { imageUrl: '', altText: 'Microsoft', url: '' },
        { imageUrl: '', altText: 'SAP',       url: '' },
        { imageUrl: '', altText: 'Oracle',    url: '' },
        { imageUrl: '', altText: 'Garanti BBVA', url: '' },
        { imageUrl: '', altText: 'Koç Holding', url: '' },
        { imageUrl: '', altText: 'Sabancı Holding', url: '' },
      ],
      backgroundStyle: 'plain',
    },
    propsSchema: [
      { field: 'title',           type: 'text',    label: 'Başlık',              group: 'content'  },
      { field: 'subtitle',        type: 'textarea', label: 'Alt Başlık', rows: 2, group: 'content'  },
      { field: 'grayscale',       type: 'boolean', label: 'Gri Ton',             group: 'visual'   },
      { field: 'showOnHoverColor',type: 'boolean', label: 'Hover\'da Renkli',    group: 'visual'   },
      { field: 'columns',         type: 'select',  label: 'Kolon',               group: 'style',   options: [{ value: '3', label: '3' }, { value: '4', label: '4' }, { value: '5', label: '5' }, { value: '6', label: '6' }] },
      { field: 'backgroundStyle', type: 'select',  label: 'Arka Plan',           group: 'visual',  options: [{ value: 'plain', label: 'Sade' }, { value: 'light', label: 'Açık' }, { value: 'dark', label: 'Koyu' }] },
      {
        field: 'logos', type: 'json-array', label: 'Logolar', group: 'content',
        itemSchema: [
          { key: 'imageUrl', label: 'Logo URL',   type: 'url'  },
          { key: 'altText',  label: 'Şirket Adı', type: 'text' },
          { key: 'url',      label: 'Web Sitesi', type: 'url'  },
        ],
      },
    ],
    children: [
      { key: 'title',    label: 'Başlık',    selector: 'h2' },
      { key: 'subtitle', label: 'Alt Başlık', selector: 'p'  },
      { key: 'logos',    label: 'Logolar',   selector: 'ul' },
    ],
    toCss: (_props, theme) => {
      return [
        `.clients-logos h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
        `.clients-logos .logos-subtitle { color: ${theme.colors.textMuted}; }`,
        `.clients-logos .logo-item { transition: opacity 0.2s, filter 0.2s; }`,
        `.clients-logos .logo-item img { filter: grayscale(100%); opacity: 0.5; transition: all 0.3s; }`,
        `.clients-logos .logo-item:hover img { filter: grayscale(0%); opacity: 1; }`,
      ].join('\n');
    },
  },
  {
    type: 'awards-certifications',
    name: 'Ödüller & Sertifikalar',
    category: 'corporate',
    icon: FaTrophy,
    defaultProps: {
      title: 'Ödüller & Sertifikasyonlar',
      subtitle: 'Kalitemizi ve uzmanlığımızı belgeleyen sektör tanınırlıkları',
      items: [
        { year: '2024', name: 'En İnovatif Yazılım Şirketi',      organization: 'Teknoloji Derneği',         imageUrl: '', description: 'Yapay zeka destekli çözümlerimiz bu prestijli ödülü kazandırdı.' },
        { year: '2023', name: 'ISO 27001 Bilgi Güvenliği',         organization: 'BSI Group',                 imageUrl: '', description: 'Tüm süreçlerimizde uluslararası bilgi güvenliği standardı.' },
        { year: '2023', name: 'Yılın En İyi B2B Hizmet Sağlayıcı', organization: 'Deloitte Technology Fast 50', imageUrl: '', description: 'Müşteri memnuniyeti ve büyüme hızımızla değerlendirildik.' },
        { year: '2022', name: 'ISO 9001:2015 Kalite Yönetimi',     organization: 'Bureau Veritas',            imageUrl: '', description: 'Tüm operasyonel süreçlerimiz uluslararası kalite standartlarını karşılıyor.' },
        { year: '2022', name: 'Microsoft Gold Partner',            organization: 'Microsoft',                 imageUrl: '', description: 'Microsoft ekosisteminde en yüksek yetkinlik seviyesi.' },
        { year: '2021', name: 'AWS Advanced Consulting Partner',   organization: 'Amazon Web Services',       imageUrl: '', description: 'Cloud migrasyonu ve yönetiminde üst düzey AWS yetkinliği.' },
      ],
      columns: '3',
    },
    propsSchema: [
      { field: 'title',    type: 'text',    label: 'Başlık',             group: 'content' },
      { field: 'subtitle', type: 'textarea', label: 'Alt Başlık', rows: 2, group: 'content' },
      { field: 'columns',  type: 'select',  label: 'Kolon',              group: 'style',  options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }] },
      {
        field: 'items', type: 'json-array', label: 'Ödüller', group: 'content',
        itemSchema: [
          { key: 'year',         label: 'Yıl',          type: 'text'     },
          { key: 'name',         label: 'Ödül/Sertifika Adı', type: 'text' },
          { key: 'organization', label: 'Veren Kuruluş', type: 'text'    },
          { key: 'imageUrl',     label: 'Logo/Görsel',  type: 'url'      },
          { key: 'description',  label: 'Açıklama',     type: 'textarea' },
        ],
      },
    ],
    children: [
      { key: 'title',    label: 'Başlık',    selector: 'h2' },
      { key: 'subtitle', label: 'Alt Başlık', selector: 'p'  },
      { key: 'items',    label: 'Ödüller',   selector: 'ul' },
    ],
    toCss: (_props, theme) => {
      return [
        `.awards-certifications h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
        `.awards-certifications .awards-subtitle { color: ${theme.colors.textMuted}; }`,
        `.awards-certifications .award-card { background: ${theme.colors.surface}; border-radius: ${theme.borderRadius.card}; border: 1px solid ${theme.colors.border}; transition: border-color 0.2s, box-shadow 0.2s; }`,
        `.awards-certifications .award-card:hover { border-color: ${theme.colors.primary}; box-shadow: ${theme.shadows.card}; }`,
        `.awards-certifications .award-year { color: ${theme.colors.primary}; font-weight: 600; font-size: 0.8rem; }`,
        `.awards-certifications .award-name { color: ${theme.colors.text}; font-weight: ${theme.typography.headingWeight}; }`,
        `.awards-certifications .award-org { color: ${theme.colors.textMuted}; font-size: 0.875rem; }`,
        `.awards-certifications .award-description { color: ${theme.colors.textMuted}; font-size: 0.85rem; line-height: ${theme.typography.lineHeight}; }`,
      ].join('\n');
    },
  },
  {
    type: 'numbers-counter',
    name: 'Sayaç / Rakamlar',
    category: 'corporate',
    icon: FaStar,
    defaultProps: {
      title: 'Rakamlarla Biz',
      subtitle: 'Somut veriler, gerçek başarılar',
      backgroundColor: '',
      backgroundType: 'color',
      items: [
        { value: '500', suffix: '+',  label: 'Tamamlanan Proje',   icon: 'FaCheckCircle', color: '#6366f1' },
        { value: '120', suffix: '+',  label: 'Uzman Çalışan',      icon: 'FaUsers',       color: '#10b981' },
        { value: '15',  suffix: ' yıl', label: 'Sektör Deneyimi',  icon: 'FaHistory',    color: '#f59e0b' },
        { value: '98',  suffix: '%',  label: 'Müşteri Memnuniyeti', icon: 'FaStar',       color: '#3b82f6' },
        { value: '42',  suffix: '+',  label: 'Aktif Ülke',         icon: 'FaGlobe',       color: '#8b5cf6' },
        { value: '30',  suffix: '+',  label: 'Sektör Ödülü',       icon: 'FaTrophy',      color: '#ec4899' },
      ],
      columns: '3',
      animateOnScroll: true,
    },
    propsSchema: [
      { field: 'title',           type: 'text',    label: 'Başlık',            group: 'content'  },
      { field: 'subtitle',        type: 'textarea', label: 'Alt Başlık', rows: 2, group: 'content' },
      { field: 'backgroundType',  type: 'select',  label: 'Arka Plan Tipi',    group: 'visual',  options: [{ value: 'color', label: 'Renk' }, { value: 'gradient', label: 'Degrade' }, { value: 'dark', label: 'Koyu' }] },
      { field: 'backgroundColor', type: 'color',   label: 'Arka Plan Rengi',   group: 'visual'   },
      { field: 'animateOnScroll', type: 'boolean', label: 'Kaydırmada Animasyon', group: 'advanced' },
      { field: 'columns',         type: 'select',  label: 'Kolon',             group: 'style',   options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }, { value: '6', label: '6' }] },
      {
        field: 'items', type: 'json-array', label: 'Sayaçlar', group: 'content',
        itemSchema: [
          { key: 'value',  label: 'Değer',     type: 'text', placeholder: '500'  },
          { key: 'suffix', label: 'Sonek',     type: 'text', placeholder: '+'    },
          { key: 'label',  label: 'Etiket',    type: 'text', placeholder: 'Proje' },
          { key: 'icon',   label: 'İkon (FA)', type: 'text'                       },
          { key: 'color',  label: 'Renk',      type: 'text', placeholder: '#6366f1' },
        ],
      },
    ],
    children: [
      { key: 'title',    label: 'Başlık',    selector: 'h2' },
      { key: 'subtitle', label: 'Alt Başlık', selector: 'p'  },
      { key: 'items',    label: 'Sayaçlar',  selector: 'ul' },
    ],
    toCss: (props, theme) => {
      const bg = (props['backgroundColor'] as string | undefined) ?? theme.colors.surface;
      return [
        `.numbers-counter { background: ${bg}; font-family: ${theme.typography.fontFamily}; }`,
        `.numbers-counter h2 { color: ${theme.colors.text}; font-weight: ${theme.typography.headingWeight}; }`,
        `.numbers-counter .counter-subtitle { color: ${theme.colors.textMuted}; }`,
        `.numbers-counter .counter-value { font-size: 3rem; font-weight: 700; line-height: 1; }`,
        `.numbers-counter .counter-label { color: ${theme.colors.textMuted}; font-size: 0.9rem; margin-top: 0.5rem; }`,
      ].join('\n');
    },
  },
  {
    type: 'cta-banner',
    name: 'Harekete Geçirici Mesaj',
    category: 'corporate',
    icon: FaBullseye,
    defaultProps: {
      headline: 'Dijital Dönüşümünüze Bugün Başlayın',
      subheadline: 'Ücretsiz 30 dakikalık keşif görüşmesiyle işletmeniz için en doğru çözüm yolunu birlikte belirleyelim. Yüzlerce başarı hikayesine siz de adınızı ekleyin.',
      primaryButtonText: 'Ücretsiz Görüşme Ayarla',
      primaryButtonLink: '/iletisim',
      secondaryButtonText: 'Referansları İncele',
      secondaryButtonLink: '/referanslar',
      backgroundColor: '',
      backgroundType: 'gradient',
      overlayOpacity: 0,
      imageUrl: '',
      showSecondaryButton: true,
      highlightText: '30 dakika yeterli',
    },
    propsSchema: [
      { field: 'headline',             type: 'text',    label: 'Ana Başlık',       group: 'content'  },
      { field: 'subheadline',          type: 'textarea', label: 'Alt Başlık', rows: 3, group: 'content' },
      { field: 'highlightText',        type: 'text',    label: 'Vurgu Etiketi',    group: 'content'  },
      { field: 'primaryButtonText',    type: 'text',    label: 'Birincil Buton',   group: 'style'    },
      { field: 'primaryButtonLink',    type: 'url',     label: 'Birincil Linki',   group: 'style'    },
      { field: 'showSecondaryButton',  type: 'boolean', label: 'İkincil Buton',    group: 'advanced' },
      { field: 'secondaryButtonText',  type: 'text',    label: 'İkincil Buton',    group: 'style'    },
      { field: 'secondaryButtonLink',  type: 'url',     label: 'İkincil Linki',    group: 'style'    },
      { field: 'backgroundType',       type: 'select',  label: 'Arka Plan',        group: 'visual',  options: [{ value: 'gradient', label: 'Degrade' }, { value: 'color', label: 'Düz Renk' }, { value: 'image', label: 'Görsel' }] },
      { field: 'backgroundColor',      type: 'color',   label: 'Renk',             group: 'visual'   },
      { field: 'imageUrl',             type: 'image',   label: 'Görsel',           group: 'visual'   },
    ],
    children: [
      { key: 'headline',          label: 'Ana Başlık',    selector: 'h2' },
      { key: 'subheadline',       label: 'Alt Başlık',    selector: 'p'  },
      { key: 'primaryButtonText', label: 'Birincil Buton', selector: 'a.btn-primary' },
    ],
    toCss: (_props, theme) => {
      return [
        `.cta-banner h2 { color: #ffffff; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; font-size: 2.25rem; }`,
        `.cta-banner .cta-subheadline { color: rgba(255,255,255,0.88); line-height: ${theme.typography.lineHeight}; font-size: 1.1rem; }`,
        `.cta-banner .highlight-badge { background: rgba(255,255,255,0.2); color: #fff; border-radius: ${theme.borderRadius.md}; font-size: 0.8rem; font-weight: 600; border: 1px solid rgba(255,255,255,0.35); }`,
        `.cta-banner .btn-primary { background: #fff; color: ${theme.colors.primary}; border-radius: ${theme.borderRadius.button}; font-weight: 700; padding: 0.9rem 2.2rem; }`,
        `.cta-banner .btn-secondary { background: transparent; color: #fff; border: 2px solid rgba(255,255,255,0.55); border-radius: ${theme.borderRadius.button}; padding: 0.9rem 2.2rem; }`,
      ].join('\n');
    },
  },
  {
    type: 'contact-details',
    name: 'İletişim Bilgileri',
    category: 'corporate',
    icon: FaAddressCard,
    defaultProps: {
      title: 'Bize Ulaşın',
      subtitle: 'Sorularınız için 7/24 yanınızdayız. En uygun iletişim kanalından bize ulaşabilirsiniz.',
      address: 'Levent Mahallesi, Büyükdere Cad. No: 121, Kat: 7',
      city: 'Şişli / İstanbul 34394',
      country: 'Türkiye',
      phones: [
        { label: 'Genel Hattımız',      number: '+90 212 555 01 00' },
        { label: 'Teknik Destek',       number: '+90 212 555 01 01' },
        { label: 'WhatsApp İş Hattı',   number: '+90 532 555 01 02' },
      ],
      emails: [
        { label: 'Genel Bilgi',         address: 'info@firma.com' },
        { label: 'Satış & Teklif',      address: 'satis@firma.com' },
        { label: 'Teknik Destek',       address: 'destek@firma.com' },
      ],
      workingHours: [
        { days: 'Pazartesi – Cuma',     hours: '08:00 – 18:00' },
        { days: 'Cumartesi',            hours: '09:00 – 14:00' },
        { days: 'Pazar',                hours: 'Kapalı' },
      ],
      socialLinks: [
        { platform: 'LinkedIn', url: '' },
        { platform: 'Twitter',  url: '' },
        { platform: 'Instagram', url: '' },
      ],
      layout: 'cards',
    },
    propsSchema: [
      { field: 'title',    type: 'text',     label: 'Başlık',             group: 'content' },
      { field: 'subtitle', type: 'textarea', label: 'Alt Başlık', rows: 2, group: 'content' },
      { field: 'address',  type: 'textarea', label: 'Adres Satırı', rows: 2, group: 'content' },
      { field: 'city',     type: 'text',     label: 'Şehir & Posta Kodu', group: 'content' },
      { field: 'country',  type: 'text',     label: 'Ülke',               group: 'content' },
      { field: 'layout',   type: 'select',   label: 'Düzen',              group: 'style',  options: [{ value: 'cards', label: 'Kartlar' }, { value: 'list', label: 'Liste' }, { value: 'split', label: 'Bölünmüş' }] },
      {
        field: 'phones', type: 'json-array', label: 'Telefon Numaraları', group: 'content',
        itemSchema: [
          { key: 'label',  label: 'Etiket', type: 'text' },
          { key: 'number', label: 'Numara', type: 'text' },
        ],
      },
      {
        field: 'emails', type: 'json-array', label: 'E-posta Adresleri', group: 'content',
        itemSchema: [
          { key: 'label',   label: 'Etiket',     type: 'text' },
          { key: 'address', label: 'E-posta',    type: 'text' },
        ],
      },
      {
        field: 'workingHours', type: 'json-array', label: 'Çalışma Saatleri', group: 'content',
        itemSchema: [
          { key: 'days',  label: 'Günler', type: 'text' },
          { key: 'hours', label: 'Saatler', type: 'text' },
        ],
      },
    ],
    children: [
      { key: 'title',    label: 'Başlık',    selector: 'h2' },
      { key: 'subtitle', label: 'Alt Başlık', selector: 'p'  },
    ],
    toCss: (_props, theme) => {
      return [
        `.contact-details h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
        `.contact-details .contact-subtitle { color: ${theme.colors.textMuted}; line-height: ${theme.typography.lineHeight}; }`,
        `.contact-details .info-card { background: ${theme.colors.surface}; border-radius: ${theme.borderRadius.card}; border: 1px solid ${theme.colors.border}; }`,
        `.contact-details .info-card-title { color: ${theme.colors.primary}; font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }`,
        `.contact-details .info-label { color: ${theme.colors.textMuted}; font-size: 0.8rem; }`,
        `.contact-details .info-value { color: ${theme.colors.text}; font-weight: 500; }`,
        `.contact-details a.info-value { color: ${theme.colors.primary}; }`,
        `.contact-details .hours-day { color: ${theme.colors.textMuted}; }`,
        `.contact-details .hours-time { color: ${theme.colors.text}; font-weight: 500; }`,
      ].join('\n');
    },
  },
  {
    type: 'blog-list',
    name: 'Blog Yazıları',
    category: 'corporate',
    icon: FaNewspaper,
    defaultProps: {
      title: 'Blog & Güncel İçerikler',
      subtitle: 'Sektörün nabzını tutan uzman analizleri, teknik rehberler ve şirket haberlerimizi keşfedin',
      limit: 6,
      columns: '3',
      showFeaturedImage: true,
      showAuthor: true,
      showDate: true,
      showReadTime: true,
      showCategory: true,
      viewAllLink: '/blog',
      viewAllText: 'Tüm Yazıları Gör',
      dataSource: 'api',
    },
    propsSchema: [
      { field: 'title',            type: 'text',    label: 'Başlık',           group: 'content'  },
      { field: 'subtitle',         type: 'textarea', label: 'Alt Başlık', rows: 2, group: 'content' },
      { field: 'limit',            type: 'number',  label: 'Yazı Sayısı',      group: 'advanced' },
      { field: 'columns',          type: 'select',  label: 'Kolon',            group: 'style',   options: [{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }] },
      { field: 'showFeaturedImage',type: 'boolean', label: 'Kapak Görseli',    group: 'visual'   },
      { field: 'showAuthor',       type: 'boolean', label: 'Yazar Göster',     group: 'visual'   },
      { field: 'showDate',         type: 'boolean', label: 'Tarih Göster',     group: 'visual'   },
      { field: 'showReadTime',     type: 'boolean', label: 'Okuma Süresi',     group: 'visual'   },
      { field: 'showCategory',     type: 'boolean', label: 'Kategori Göster',  group: 'visual'   },
      { field: 'viewAllLink',      type: 'url',     label: 'Tümünü Gör Linki', group: 'content'  },
      { field: 'viewAllText',      type: 'text',    label: 'Tümünü Gör Metni', group: 'content'  },
    ],
    children: [
      { key: 'title',       label: 'Başlık',    selector: 'h2'  },
      { key: 'subtitle',    label: 'Alt Başlık', selector: 'p'   },
      { key: 'viewAllText', label: 'Tümü Butonu', selector: 'a' },
    ],
    toCss: (_props, theme) => {
      return [
        `.blog-list h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
        `.blog-list .blog-subtitle { color: ${theme.colors.textMuted}; line-height: ${theme.typography.lineHeight}; }`,
        `.blog-list .post-card { background: ${theme.colors.surface}; border-radius: ${theme.borderRadius.card}; box-shadow: ${theme.shadows.card}; border: 1px solid ${theme.colors.border}; transition: transform 0.25s, box-shadow 0.25s; overflow: hidden; }`,
        `.blog-list .post-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.12); }`,
        `.blog-list .post-category { color: ${theme.colors.primary}; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }`,
        `.blog-list .post-title { color: ${theme.colors.text}; font-weight: ${theme.typography.headingWeight}; line-height: 1.3; }`,
        `.blog-list .post-meta { color: ${theme.colors.textMuted}; font-size: 0.8rem; }`,
        `.blog-list .view-all-btn { background: transparent; border: 2px solid ${theme.colors.primary}; color: ${theme.colors.primary}; border-radius: ${theme.borderRadius.button}; font-weight: 600; }`,
      ].join('\n');
    },
  },
  {
    type: 'timeline',
    name: 'Zaman Çizelgesi',
    category: 'corporate',
    icon: FaHistory,
    defaultProps: {
      title: 'Tarihçemiz',
      subtitle: 'Başarıyla dolu bir yolculuğun kilometre taşları',
      orientation: 'alternating',
      items: [
        { year: '2009', title: 'Kuruluş',            description: 'İstanbul\'da 5 kişilik bir ekiple yazılım danışmanlığı hizmetlerine başladık. İlk müşterimiz için kurumsal ERP entegrasyonu teslim ettik.', imageUrl: '', color: '#6366f1' },
        { year: '2012', title: 'İlk Büyük Proje',   description: 'Fortune 500 listesindeki ilk kurumsal müşterimizle anlaşma imzaladık. Ekip 30 kişiye büyüdü, yeni ofisimize taşındık.', imageUrl: '', color: '#10b981' },
        { year: '2015', title: 'Uluslararası Açılım', description: 'Almanya ve Hollanda\'da ofisler açarak Avrupa pazarına giriş yaptık. İlk ISO 9001 sertifikamızı aldık.', imageUrl: '', color: '#f59e0b' },
        { year: '2018', title: 'Teknoloji Atılımı',  description: 'Yapay zeka ve makine öğrenimi alanına yatırım yaptık. Kendi ürün portföyümüzü oluşturmaya başladık. 100 uzman çalışana ulaştık.', imageUrl: '', color: '#3b82f6' },
        { year: '2021', title: 'Pandemi & Dijital Büyüme', description: 'Pandemi döneminde uzaktan çalışmaya sorunsuz geçtik. Dijital dönüşüm talebindeki artışla birlikte ciromuz 2 katına çıktı.', imageUrl: '', color: '#8b5cf6' },
        { year: '2024', title: 'Yeni Dönem',         description: 'Yapay zeka destekli ürün suitemizi piyasaya sürdük. 500. projemizi tamamladık ve 30. sektör ödülümüzü kazandık.', imageUrl: '', color: '#ec4899' },
      ],
    },
    propsSchema: [
      { field: 'title',       type: 'text',     label: 'Başlık',             group: 'content' },
      { field: 'subtitle',    type: 'textarea', label: 'Alt Başlık', rows: 2, group: 'content' },
      { field: 'orientation', type: 'select',   label: 'Dizilim',            group: 'style',  options: [{ value: 'alternating', label: 'Alternatif' }, { value: 'left', label: 'Solda' }, { value: 'right', label: 'Sağda' }] },
      {
        field: 'items', type: 'json-array', label: 'Etkinlikler', group: 'content',
        itemSchema: [
          { key: 'year',        label: 'Yıl / Tarih',  type: 'text'     },
          { key: 'title',       label: 'Başlık',       type: 'text'     },
          { key: 'description', label: 'Açıklama',     type: 'textarea' },
          { key: 'imageUrl',    label: 'Görsel URL',   type: 'url'      },
          { key: 'color',       label: 'Nokta Rengi',  type: 'text',    placeholder: '#6366f1' },
        ],
      },
    ],
    children: [
      { key: 'title',    label: 'Başlık',      selector: 'h2' },
      { key: 'subtitle', label: 'Alt Başlık',  selector: 'p'  },
      { key: 'items',    label: 'Etkinlikler', selector: 'ol' },
    ],
    toCss: (_props, theme) => {
      return [
        `.timeline h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
        `.timeline .timeline-subtitle { color: ${theme.colors.textMuted}; }`,
        `.timeline .timeline-line { background: ${theme.colors.border}; }`,
        `.timeline .timeline-dot { background: ${theme.colors.primary}; border: 3px solid ${theme.colors.surface}; box-shadow: 0 0 0 3px ${theme.colors.primary}33; }`,
        `.timeline .timeline-card { background: ${theme.colors.surface}; border-radius: ${theme.borderRadius.card}; box-shadow: ${theme.shadows.card}; border: 1px solid ${theme.colors.border}; }`,
        `.timeline .timeline-year { color: ${theme.colors.primary}; font-weight: 700; font-size: 1.1rem; }`,
        `.timeline .timeline-title { color: ${theme.colors.text}; font-weight: ${theme.typography.headingWeight}; }`,
        `.timeline .timeline-description { color: ${theme.colors.textMuted}; line-height: ${theme.typography.lineHeight}; font-size: 0.9rem; }`,
      ].join('\n');
    },
  },
  {
    type: 'portfolio-grid',
    name: 'Portfolyo / Referanslar',
    category: 'corporate',
    icon: FaTh,
    defaultProps: {
      title: 'Başarılı Projelerimiz',
      subtitle: 'Farklı sektörlerden 500+ tamamlanan proje. Referans listemizdeki bazı seçkin çalışmalarımız:',
      filterEnabled: true,
      columns: '3',
      items: [
        { title: 'Yapay Zeka Destekli CRM',        category: 'Yazılım',      imageUrl: '', url: '', description: 'Fortune 500 müşterimiz için geliştirilen, makine öğrenimi tabanlı müşteri ilişkileri yönetim platformu. 360° müşteri görünümü ve predictive analytics.', tags: 'AI, CRM, .NET, React' },
        { title: 'Bulut ERP Migrasyonu',           category: 'Bulut',        imageUrl: '', url: '', description: '15.000 çalışanlı üretim firmasının tüm ERP altyapısını on-premise\'den Azure buluta taşıma projesi. Sıfır kesinti, 3 ay teslim.', tags: 'Azure, SAP, Migration' },
        { title: 'Dijital Dönüşüm Danışmanlığı',  category: 'Danışmanlık',  imageUrl: '', url: '', description: 'Geleneksel bir perakende grubunun e-ticaret kanalı açması ve omnichannel stratejisi oluşturması için verilen kapsamlı danışmanlık hizmeti.', tags: 'Danışmanlık, E-ticaret, Strateji' },
        { title: 'Siber Güvenlik Denetimi',        category: 'Güvenlik',     imageUrl: '', url: '', description: 'Fintech şirketi için kapsamlı penetrasyon testi, güvenlik açıkları analizi ve KVKK uyumluluk paketi. 280+ güvenlik açığı tespit edildi ve kapatıldı.', tags: 'Pentest, KVKK, ISO 27001' },
        { title: 'Mobil Saha Yönetim Uygulaması', category: 'Mobil & Web', imageUrl: '', url: '', description: '1.200 saha teknisyeni için geliştirilen iş emri takip, rota optimizasyonu ve gerçek zamanlı raporlama uygulaması. iOS & Android.', tags: 'React Native, Flutter, GPS' },
        { title: 'Otomasyonlu İK Platformu',      category: 'Yazılım',      imageUrl: '', url: '', description: 'İşe alım süreçlerini ucundan ucuna otomatize eden, yapay zeka ile aday eleme yapan SaaS İK platformu. 60% süreç hızlanması sağlandı.', tags: 'SaaS, AI, Node.js, Vue' },
      ],
    },
    propsSchema: [
      { field: 'title',         type: 'text',    label: 'Başlık',            group: 'content'  },
      { field: 'subtitle',      type: 'textarea', label: 'Alt Başlık', rows: 2, group: 'content' },
      { field: 'filterEnabled', type: 'boolean', label: 'Kategori Filtresi', group: 'advanced' },
      { field: 'columns',       type: 'select',  label: 'Kolon',             group: 'style',   options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }] },
      {
        field: 'items', type: 'json-array', label: 'Projeler', group: 'content',
        itemSchema: [
          { key: 'title',       label: 'Proje Adı',   type: 'text'     },
          { key: 'category',    label: 'Kategori',    type: 'text'     },
          { key: 'description', label: 'Açıklama',    type: 'textarea' },
          { key: 'tags',        label: 'Etiketler (virgülle ayır)', type: 'text' },
          { key: 'imageUrl',    label: 'Görsel URL',  type: 'url'      },
          { key: 'url',         label: 'Proje Linki', type: 'url'      },
        ],
      },
    ],
    children: [
      { key: 'title',    label: 'Başlık',    selector: 'h2' },
      { key: 'subtitle', label: 'Alt Başlık', selector: 'p'  },
      { key: 'items',    label: 'Projeler',  selector: 'ul' },
    ],
    toCss: (_props, theme) => {
      return [
        `.portfolio-grid h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
        `.portfolio-grid .portfolio-subtitle { color: ${theme.colors.textMuted}; line-height: ${theme.typography.lineHeight}; }`,
        `.portfolio-grid .filter-btn { border: 1px solid ${theme.colors.border}; border-radius: ${theme.borderRadius.md}; color: ${theme.colors.textMuted}; transition: all 0.2s; }`,
        `.portfolio-grid .filter-btn.active { background: ${theme.colors.primary}; border-color: ${theme.colors.primary}; color: #fff; }`,
        `.portfolio-grid .portfolio-item { border-radius: ${theme.borderRadius.card}; overflow: hidden; box-shadow: ${theme.shadows.card}; border: 1px solid ${theme.colors.border}; transition: transform 0.25s, box-shadow 0.25s; }`,
        `.portfolio-grid .portfolio-item:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.15); }`,
        `.portfolio-grid .item-title { color: ${theme.colors.text}; font-weight: ${theme.typography.headingWeight}; }`,
        `.portfolio-grid .item-category { color: ${theme.colors.primary}; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }`,
        `.portfolio-grid .item-description { color: ${theme.colors.textMuted}; font-size: 0.85rem; line-height: ${theme.typography.lineHeight}; }`,
        `.portfolio-grid .item-tag { background: ${theme.colors.surface}; color: ${theme.colors.textMuted}; border: 1px solid ${theme.colors.border}; border-radius: ${theme.borderRadius.sm ?? '4px'}; font-size: 0.75rem; }`,
      ].join('\n');
    },
  },
  {
    type: 'map-embed',
    name: 'Harita & Lokasyon',
    category: 'corporate',
    icon: FaMapMarkerAlt,
    defaultProps: {
      title: 'Bizi Ziyaret Edin',
      embedUrl: '',
      mapHeight: '420px',
      showContactSidebar: true,
      address: 'Levent Mahallesi, Büyükdere Cad. No: 121, Kat: 7\nŞişli / İstanbul 34394',
      phone: '+90 212 555 01 00',
      email: 'info@firma.com',
      workingHours: 'Pzt–Cum: 08:00–18:00 | Cmt: 09:00–14:00',
      parkingNote: 'Binada ücretsiz otopark mevcuttur.',
    },
    propsSchema: [
      { field: 'title',              type: 'text',    label: 'Başlık',                group: 'content' },
      { field: 'embedUrl',           type: 'url',     label: 'Google Maps Embed URL', group: 'content' },
      { field: 'mapHeight',          type: 'text',    label: 'Harita Yüksekliği',     group: 'visual'  },
      { field: 'showContactSidebar', type: 'boolean', label: 'İletişim Bilgileri',    group: 'advanced' },
      { field: 'address',            type: 'textarea', label: 'Adres', rows: 2,       group: 'content' },
      { field: 'phone',              type: 'text',    label: 'Telefon',               group: 'content' },
      { field: 'email',              type: 'text',    label: 'E-posta',               group: 'content' },
      { field: 'workingHours',       type: 'text',    label: 'Çalışma Saatleri',      group: 'content' },
      { field: 'parkingNote',        type: 'text',    label: 'Park Notu',             group: 'content' },
    ],
    children: [
      { key: 'title',    label: 'Başlık', selector: 'h2'     },
      { key: 'embedUrl', label: 'Harita', selector: 'iframe' },
    ],
    toCss: (_props, theme) => {
      return [
        `.map-embed h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
        `.map-embed .contact-sidebar { background: ${theme.colors.surface}; border-radius: ${theme.borderRadius.card}; border: 1px solid ${theme.colors.border}; }`,
        `.map-embed .sidebar-label { color: ${theme.colors.primary}; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }`,
        `.map-embed .sidebar-value { color: ${theme.colors.text}; font-weight: 500; line-height: 1.4; }`,
        `.map-embed .sidebar-note { color: ${theme.colors.textMuted}; font-size: 0.85rem; }`,
        `.map-embed iframe { border-radius: ${theme.borderRadius.card}; border: 0; }`,
      ].join('\n');
    },
  },
  {
    type: 'phone-contact',
    name: 'Telefon ile İletişim',
    category: 'corporate',
    icon: FaPhone,
    defaultProps: {
      title: 'Hemen Arayın',
      subtitle: 'Uzman ekibimiz sorularınızı yanıtlamak için hazır',
      mainPhone: '+90 212 555 01 00',
      mainPhoneLabel: 'Genel Müdürlük',
      supportPhone: '+90 212 555 01 01',
      supportPhoneLabel: 'Teknik Destek Hattı',
      whatsapp: '+90 532 555 01 02',
      availabilityText: 'Pazartesi – Cuma, 08:00 – 18:00 arası ulaşabilirsiniz',
      buttonText: 'Callback İste',
      buttonLink: '/iletisim#callback',
      backgroundColor: '',
    },
    propsSchema: [
      { field: 'title',            type: 'text',     label: 'Başlık',            group: 'content' },
      { field: 'subtitle',         type: 'textarea', label: 'Alt Başlık', rows: 2, group: 'content' },
      { field: 'mainPhone',        type: 'text',     label: 'Ana Telefon',       group: 'content' },
      { field: 'mainPhoneLabel',   type: 'text',     label: 'Ana Hat Etiketi',   group: 'content' },
      { field: 'supportPhone',     type: 'text',     label: 'Destek Telefonu',   group: 'content' },
      { field: 'supportPhoneLabel',type: 'text',     label: 'Destek Hat Etiketi', group: 'content' },
      { field: 'whatsapp',         type: 'text',     label: 'WhatsApp Numarası', group: 'content' },
      { field: 'availabilityText', type: 'text',     label: 'Mesai Metni',       group: 'content' },
      { field: 'buttonText',       type: 'text',     label: 'Buton Metni',       group: 'style'   },
      { field: 'buttonLink',       type: 'url',      label: 'Buton Linki',       group: 'style'   },
      { field: 'backgroundColor',  type: 'color',    label: 'Arka Plan',         group: 'visual'  },
    ],
    children: [
      { key: 'title',       label: 'Başlık',    selector: 'h2' },
      { key: 'subtitle',    label: 'Alt Başlık', selector: 'p'  },
      { key: 'mainPhone',   label: 'Ana Hat',   selector: 'a.main-phone' },
    ],
    toCss: (_props, theme) => {
      return [
        `.phone-contact h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
        `.phone-contact .phone-subtitle { color: ${theme.colors.textMuted}; line-height: ${theme.typography.lineHeight}; }`,
        `.phone-contact .phone-card { background: ${theme.colors.surface}; border-radius: ${theme.borderRadius.card}; border: 1px solid ${theme.colors.border}; }`,
        `.phone-contact .phone-label { color: ${theme.colors.textMuted}; font-size: 0.8rem; }`,
        `.phone-contact a.phone-number { color: ${theme.colors.text}; font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em; }`,
        `.phone-contact a.phone-number:hover { color: ${theme.colors.primary}; }`,
        `.phone-contact .whatsapp-btn { background: #25D366; color: #fff; border-radius: ${theme.borderRadius.button}; font-weight: 600; }`,
        `.phone-contact .callback-btn { background: ${theme.colors.primary}; color: #fff; border-radius: ${theme.borderRadius.button}; font-weight: 600; }`,
        `.phone-contact .availability { color: ${theme.colors.textMuted}; font-size: 0.85rem; }`,
      ].join('\n');
    },
  },

  // ── Container blocks (Faz 2) ─────────────────────────────────────────────────
  {
    type: 'section-container',
    name: 'Bölüm (Section)',
    category: 'advanced',
    icon: FaSquare,
    isContainer: true,
    defaultProps: {
      backgroundColor: '',
      backgroundType: 'transparent',
      paddingY: '40px',
      paddingX: '0px',
    },
    propsSchema: [
      { field: 'backgroundType', type: 'select', label: 'Arka Plan', group: 'visual',
        options: [{ value: 'transparent', label: 'Şeffaf' }, { value: 'color', label: 'Renk' }, { value: 'surface', label: 'Yüzey' }] },
      { field: 'backgroundColor', type: 'color', label: 'Arka Plan Rengi', group: 'visual' },
      { field: 'paddingY', type: 'text', label: 'Dikey Boşluk', group: 'style' },
      { field: 'paddingX', type: 'text', label: 'Yatay Boşluk', group: 'style' },
    ],
  },
  {
    type: 'grid-row',
    name: 'Izgara Satırı',
    category: 'advanced',
    icon: FaTable,
    isContainer: true,
    defaultProps: {
      columns: 2,
      gap: '16px',
      alignItems: 'stretch',
    },
    propsSchema: [
      { field: 'columns', type: 'select', label: 'Kolon Sayısı', group: 'style',
        options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }, { value: '12', label: '12 (Grid)' }] },
      { field: 'gap', type: 'text', label: 'Aralık', group: 'style' },
      { field: 'alignItems', type: 'select', label: 'Dikey Hizalama', group: 'style',
        options: [{ value: 'stretch', label: 'Uzat' }, { value: 'flex-start', label: 'Üst' }, { value: 'center', label: 'Orta' }, { value: 'flex-end', label: 'Alt' }] },
    ],
  },
  {
    type: 'grid-column',
    name: 'Izgara Kolonu',
    category: 'advanced',
    icon: FaColumns,
    isContainer: true,
    defaultProps: {
      span: 1,
      verticalAlign: 'top',
    },
    propsSchema: [
      { field: 'span', type: 'number', label: 'Kolon Genişliği (1-12)', group: 'style' },
      { field: 'verticalAlign', type: 'select', label: 'Dikey Hizalama', group: 'style',
        options: [{ value: 'top', label: 'Üst' }, { value: 'middle', label: 'Orta' }, { value: 'bottom', label: 'Alt' }, { value: 'stretch', label: 'Uzat' }] },
    ],
  },
];

export const BLOCK_BY_TYPE = Object.fromEntries(BLOCK_REGISTRY.map(b => [b.type, b]));

export const BLOCK_CATEGORIES = {
  hero:      'Hero',
  content:   'İçerik',
  commerce:  'E-Ticaret',
  marketing: 'Pazarlama',
  forms:     'Formlar',
  advanced:  'Gelişmiş',
  corporate: 'Kurumsal',
} as const;

export const CONTAINER_TYPES = new Set(['section-container', 'grid-row', 'grid-column']);
