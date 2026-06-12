import { FaImages } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const sliderBlock: BlockDefinition = {
  type: 'slider',
  name: 'Slayt Gösterisi',
  category: 'marketing',
  icon: FaImages,
  defaultProps: {
    sliderId: '',
    height: '500px',
  },
  propsSchema: [
    { field: 'sliderId', type: 'text', label: 'Slider ID',   placeholder: 'Slider UUID', group: 'advanced' },
    { field: 'height',   type: 'text', label: 'Yükseklik',   placeholder: '500px',       group: 'visual'   },
  ],
  children: [
    { key: 'sliderId', label: 'Slider ID', selector: 'div' },
  ],
};
