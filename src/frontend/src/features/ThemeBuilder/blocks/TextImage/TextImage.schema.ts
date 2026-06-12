import { FaFileAlt } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const textImageBlock: BlockDefinition = {
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
};
