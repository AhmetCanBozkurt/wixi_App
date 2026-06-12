import { FaQuoteLeft } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const testimonialsBlock: BlockDefinition = {
  type: 'testimonials',
  name: 'Müşteri Yorumları',
  category: 'marketing',
  icon: FaQuoteLeft,
  defaultProps: {
    title: 'Müşterilerimiz Ne Diyor?',
    // dataSource: 'db' — items are fetched from API (/storefront/content/testimonials).
    // The items array below is used as fallback only when no API data is available.
    dataSource: 'db',
    items: [
      { name: 'Ayşe K.', role: 'Müşteri', quote: 'Harika bir alışveriş deneyimi!', rating: 5 },
      { name: 'Mehmet Y.', role: 'Müşteri', quote: 'Kaliteli ürünler, hızlı teslimat.', rating: 5 },
    ],
  },
  propsSchema: [
    { field: 'title', type: 'text', label: 'Başlık', group: 'content' },
    {
      field: 'items', type: 'json-array', label: 'Yedek Yorumlar (API yoksa)', group: 'content',
      itemSchema: [
        { key: 'name',   label: 'İsim',        type: 'text',     placeholder: 'Ayşe K.'             },
        { key: 'role',   label: 'Unvan',        type: 'text',     placeholder: 'Müşteri'             },
        { key: 'quote',  label: 'Yorum',        type: 'textarea', placeholder: 'Harika bir deneyim!' },
        { key: 'rating', label: 'Puan (1-5)',   type: 'number',   placeholder: '5'                  },
      ],
    },
  ],
  children: [
    { key: 'title', label: 'Başlık',  selector: 'h2' },
    { key: 'items', label: 'Yorumlar', selector: 'ul' },
  ],
  toCss: (_props, theme) => {
    return [
      `.testimonials h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
      `.testimonials .testimonial-card { background: ${theme.colors.surface}; border-radius: ${theme.borderRadius.card}; box-shadow: ${theme.shadows.card}; }`,
    ].join('\n');
  },
};
