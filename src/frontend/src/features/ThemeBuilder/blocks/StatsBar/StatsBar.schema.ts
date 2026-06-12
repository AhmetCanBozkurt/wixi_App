import { FaChartBar } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const statsBarBlock: BlockDefinition = {
  type: 'stats-bar',
  name: 'İstatistikler',
  category: 'content',
  icon: FaChartBar,
  defaultProps: {
    items: [
      { icon: 'FaUsers', value: '10.000+', label: 'Mutlu Müşteri' },
      { icon: 'FaBox', value: '5.000+', label: 'Ürün' },
      { icon: 'FaStar', value: '4.9/5', label: 'Ortalama Puan' },
      { icon: 'FaTruck', value: '24s', label: 'Teslimat' },
    ],
  },
  propsSchema: [
    {
      field: 'items', type: 'json-array', label: 'İstatistikler', group: 'content',
      itemSchema: [
        { key: 'value', label: 'Değer', type: 'text', placeholder: '10.000+' },
        { key: 'label', label: 'Etiket', type: 'text', placeholder: 'Mutlu Müşteri' },
      ],
    },
  ],
  children: [
    { key: 'items', label: 'İstatistikler', selector: 'ul' },
  ],
  toCss: (_props, theme) => {
    return [
      `.stats-bar { background: ${theme.colors.surface}; font-family: ${theme.typography.fontFamily}; }`,
      `.stats-bar .value { color: ${theme.colors.primary}; font-weight: ${theme.typography.headingWeight}; }`,
      `.stats-bar .label { color: ${theme.colors.textMuted}; }`,
    ].join('\n');
  },
};
