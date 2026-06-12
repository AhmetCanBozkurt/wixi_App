import { FaTrademark } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const brandLogosBlock: BlockDefinition = {
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
};
