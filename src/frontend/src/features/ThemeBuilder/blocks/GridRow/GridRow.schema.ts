import { FaTh } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const gridRowBlock: BlockDefinition = {
  type: 'grid-row',
  name: 'Izgara Satırı',
  category: 'advanced',
  icon: FaTh,
  defaultProps: {
    gap: '16px',
  },
  propsSchema: [
    { field: 'gap', type: 'text', label: 'Boşluk (Gap)', group: 'style' },
  ],
  toCss: () => '',
};
