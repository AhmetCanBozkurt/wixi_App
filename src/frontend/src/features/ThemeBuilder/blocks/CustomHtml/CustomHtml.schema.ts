import { FaCode } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const customHtmlBlock: BlockDefinition = {
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
};
