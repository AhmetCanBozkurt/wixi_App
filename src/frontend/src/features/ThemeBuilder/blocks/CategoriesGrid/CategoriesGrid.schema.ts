import { FaThLarge } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const categoriesGridBlock: BlockDefinition = {
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
};
