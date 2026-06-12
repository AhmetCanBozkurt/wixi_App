import { FaThLarge } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const sectionContainerBlock: BlockDefinition = {
  type: 'section-container',
  name: 'Kapsayıcı Kutu',
  category: 'advanced',
  icon: FaThLarge,
  defaultProps: {
    paddingY: '20px',
    paddingX: '20px',
    backgroundColor: '',
    borderRadius: '8px',
  },
  propsSchema: [
    { field: 'paddingY', type: 'text', label: 'Dikey Boşluk', group: 'style' },
    { field: 'paddingX', type: 'text', label: 'Yatay Boşluk', group: 'style' },
    { field: 'backgroundColor', type: 'color', label: 'Arka Plan Rengi', group: 'visual' },
    { field: 'borderRadius', type: 'text', label: 'Kenar Ovalliği', group: 'style' },
  ],
  toCss: (props, theme) => {
    return `.section-container { font-family: ${theme.typography.fontFamily}; }`;
  },
};
