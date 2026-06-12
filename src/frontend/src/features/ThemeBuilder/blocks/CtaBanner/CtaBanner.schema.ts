import { FaBullseye } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const ctaBannerBlock: BlockDefinition = {
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
};
