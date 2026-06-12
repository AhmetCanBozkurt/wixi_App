import { FaAlignLeft } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const richTextBlock: BlockDefinition = {
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
};
