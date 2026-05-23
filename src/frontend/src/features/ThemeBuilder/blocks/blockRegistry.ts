import {
  FaImage, FaColumns, FaShoppingBag, FaThLarge, FaFileAlt, FaEnvelope,
  FaQuoteLeft, FaClock, FaBullhorn, FaTrademark, FaChartBar,
  FaVideo, FaAlignLeft, FaWpforms, FaCode, FaImages, FaQuestionCircle,
  FaUsers, FaBriefcase, FaNewspaper, FaHistory, FaTh, FaMapMarkerAlt,
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
    type: 'team-grid',
    name: 'Ekip Üyeleri',
    category: 'corporate',
    icon: FaUsers,
    defaultProps: {
      title: 'Ekibimiz',
      items: [
        { name: 'Ahmet Yılmaz', role: 'CEO', imageUrl: '', linkedIn: '' },
        { name: 'Ayşe Demir',   role: 'CTO', imageUrl: '', linkedIn: '' },
      ],
      columns: 3,
    },
    propsSchema: [
      { field: 'title',   type: 'text',   label: 'Başlık', group: 'content' },
      { field: 'columns', type: 'select', label: 'Kolon',  group: 'style',  options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }] },
      {
        field: 'items', type: 'json-array', label: 'Üyeler', group: 'content',
        itemSchema: [
          { key: 'name',     label: 'İsim',         type: 'text' },
          { key: 'role',     label: 'Unvan',        type: 'text' },
          { key: 'imageUrl', label: 'Fotoğraf URL', type: 'url'  },
        ],
      },
    ],
    children: [
      { key: 'title', label: 'Başlık', selector: 'h2' },
      { key: 'items', label: 'Üyeler', selector: 'ul' },
    ],
    toCss: (_props, theme) => {
      return [
        `.team-grid h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
        `.team-grid .member-card { background: ${theme.colors.surface}; border-radius: ${theme.borderRadius.card}; box-shadow: ${theme.shadows.card}; }`,
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
      items: [
        { icon: 'FaRocket',   title: 'Hızlı Teslimat', description: 'Aynı gün kargo imkânı.'   },
        { icon: 'FaShieldAlt', title: 'Güvenli Ödeme', description: '256-bit SSL koruması.'    },
        { icon: 'FaHeadset',  title: '7/24 Destek',   description: 'Her zaman yanınızdayız.'   },
      ],
      columns: 3,
    },
    propsSchema: [
      { field: 'title',   type: 'text',   label: 'Başlık', group: 'content' },
      { field: 'columns', type: 'select', label: 'Kolon',  group: 'style',  options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }] },
      {
        field: 'items', type: 'json-array', label: 'Hizmetler', group: 'content',
        itemSchema: [
          { key: 'title',       label: 'Başlık',  type: 'text'     },
          { key: 'description', label: 'Açıklama', type: 'textarea' },
        ],
      },
    ],
    children: [
      { key: 'title', label: 'Başlık',    selector: 'h2' },
      { key: 'items', label: 'Hizmetler', selector: 'ul' },
    ],
    toCss: (_props, theme) => {
      return [
        `.services-grid h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
        `.services-grid .service-card { background: ${theme.colors.surface}; border-radius: ${theme.borderRadius.card}; box-shadow: ${theme.shadows.card}; }`,
      ].join('\n');
    },
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
      { field: 'title',             type: 'text',    label: 'Başlık',        group: 'content'  },
      { field: 'limit',             type: 'number',  label: 'Yazı Sayısı',   group: 'advanced' },
      { field: 'columns',           type: 'select',  label: 'Kolon',         group: 'style',   options: [{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }] },
      { field: 'showFeaturedImage', type: 'boolean', label: 'Kapak Görseli', group: 'visual'   },
    ],
    children: [
      { key: 'title', label: 'Başlık', selector: 'h2' },
    ],
    toCss: (_props, theme) => {
      return [
        `.blog-list h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
        `.blog-list .post-card { background: ${theme.colors.surface}; border-radius: ${theme.borderRadius.card}; box-shadow: ${theme.shadows.card}; }`,
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
      items: [
        { year: '2018', title: 'Kuruluş',   description: 'Şirketimiz kuruldu.'                  },
        { year: '2020', title: 'Büyüme',    description: '100 çalışana ulaştık.'               },
        { year: '2024', title: 'İnovasyon', description: 'Yeni ürün serimizi lansmanladık.'     },
      ],
    },
    propsSchema: [
      { field: 'title', type: 'text', label: 'Başlık', group: 'content' },
      {
        field: 'items', type: 'json-array', label: 'Etkinlikler', group: 'content',
        itemSchema: [
          { key: 'year',        label: 'Yıl / Tarih', type: 'text'     },
          { key: 'title',       label: 'Başlık',      type: 'text'     },
          { key: 'description', label: 'Açıklama',    type: 'textarea' },
        ],
      },
    ],
    children: [
      { key: 'title', label: 'Başlık',     selector: 'h2' },
      { key: 'items', label: 'Etkinlikler', selector: 'ol' },
    ],
    toCss: (_props, theme) => {
      return [
        `.timeline h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
        `.timeline .timeline-item::before { background: ${theme.colors.primary}; }`,
        `.timeline .timeline-year { color: ${theme.colors.primary}; font-weight: ${theme.typography.headingWeight}; }`,
      ].join('\n');
    },
  },
  {
    type: 'portfolio-grid',
    name: 'Portfolyo',
    category: 'corporate',
    icon: FaTh,
    defaultProps: {
      title: 'Projelerimiz',
      items: [
        { title: 'Proje 1', category: 'Web',   imageUrl: '', url: '' },
        { title: 'Proje 2', category: 'Mobil', imageUrl: '', url: '' },
      ],
      columns: 3,
    },
    propsSchema: [
      { field: 'title',   type: 'text',   label: 'Başlık', group: 'content' },
      { field: 'columns', type: 'select', label: 'Kolon',  group: 'style',  options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }] },
      {
        field: 'items', type: 'json-array', label: 'Projeler', group: 'content',
        itemSchema: [
          { key: 'title',    label: 'Başlık',    type: 'text' },
          { key: 'category', label: 'Kategori',  type: 'text' },
          { key: 'imageUrl', label: 'Görsel URL', type: 'url' },
          { key: 'url',      label: 'Proje Linki', type: 'url' },
        ],
      },
    ],
    children: [
      { key: 'title', label: 'Başlık',  selector: 'h2' },
      { key: 'items', label: 'Projeler', selector: 'ul' },
    ],
    toCss: (_props, theme) => {
      return [
        `.portfolio-grid h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
        `.portfolio-grid .portfolio-item { border-radius: ${theme.borderRadius.card}; overflow: hidden; box-shadow: ${theme.shadows.card}; }`,
      ].join('\n');
    },
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
      { field: 'title',    type: 'text', label: 'Başlık',                  group: 'content' },
      { field: 'embedUrl', type: 'url',  label: 'Google Maps Embed URL',   group: 'content' },
      { field: 'height',   type: 'text', label: 'Yükseklik',               group: 'visual'  },
    ],
    children: [
      { key: 'title',    label: 'Başlık', selector: 'h3'     },
      { key: 'embedUrl', label: 'Harita', selector: 'iframe' },
    ],
    toCss: (_props, theme) => {
      return [
        `.map-embed h3 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; }`,
      ].join('\n');
    },
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
