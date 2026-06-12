import { FaQuestionCircle } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const faqBlock: BlockDefinition = {
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
};
