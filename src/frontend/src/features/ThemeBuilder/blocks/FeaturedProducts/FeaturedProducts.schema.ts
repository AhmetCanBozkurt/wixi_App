import { FaShoppingBag } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const featuredProductsBlock: BlockDefinition = {
  type: 'featured-products',
  name: 'Öne Çıkan Ürünler',
  category: 'commerce',
  icon: FaShoppingBag,
  defaultProps: {
    title: 'Sizin İçin Seçtiklerimiz',
    limit: 4,
    columns: 4,
    sortBy: 'newest',
  },
  propsSchema: [
    { field: 'title',   type: 'text',   label: 'Başlık',       group: 'content'  },
    { field: 'limit',   type: 'number', label: 'Ürün Sayısı',  group: 'advanced' },
    { field: 'columns', type: 'select', label: 'Kolon Sayısı', group: 'style',   options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }] },
    { field: 'sortBy',  type: 'select', label: 'Sıralama',     group: 'advanced', options: [{ value: 'newest', label: 'Yeni' }, { value: 'featured', label: 'Öne Çıkan' }, { value: 'bestselling', label: 'Çok Satan' }] },
  ],
  children: [
    { key: 'title', label: 'Başlık', selector: 'h2' },
  ],
  toCss: (_props, theme) => {
    return [
      `.featured-products h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
      `.featured-products .product-card { border-radius: ${theme.borderRadius.card}; box-shadow: ${theme.shadows.card}; background: ${theme.colors.surface}; }`,
    ].join('\n');
  },
};
