import { FaBuilding } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const heroCorporateBlock: BlockDefinition = {
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
};
