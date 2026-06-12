import { FaImage } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const heroBlock: BlockDefinition = {
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
};
