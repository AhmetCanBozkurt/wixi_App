import { FaColumns } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const heroSplitBlock: BlockDefinition = {
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
};
