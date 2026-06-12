import { FaColumns } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const gridColumnBlock: BlockDefinition = {
  type: 'grid-column',
  name: 'Izgara Kolonu',
  category: 'advanced',
  icon: FaColumns,
  defaultProps: {
    span: 6,
  },
  propsSchema: [
    { field: 'span', type: 'number', label: 'Genişlik (1-12)', group: 'style' },
  ],
  toCss: () => '',
};
