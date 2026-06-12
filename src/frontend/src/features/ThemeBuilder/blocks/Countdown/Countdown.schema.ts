import { FaClock } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const countdownBlock: BlockDefinition = {
  type: 'countdown',
  name: 'Geri Sayım',
  category: 'marketing',
  icon: FaClock,
  defaultProps: {
    title: 'Kampanya Bitiyor!',
    targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    message: 'Bu fırsatı kaçırmayın',
  },
  propsSchema: [
    { field: 'title',      type: 'text', label: 'Başlık',              group: 'content'  },
    { field: 'targetDate', type: 'text', label: 'Hedef Tarih (ISO)',   group: 'advanced' },
    { field: 'message',    type: 'text', label: 'Mesaj',               group: 'content'  },
  ],
  children: [
    { key: 'title',   label: 'Başlık', selector: 'h2' },
    { key: 'message', label: 'Mesaj',  selector: 'p'  },
  ],
  toCss: (_props, theme) => {
    return [
      `.countdown h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
      `.countdown .timer-digit { color: ${theme.colors.primary}; font-size: 2rem; }`,
      `.countdown p { color: ${theme.colors.textMuted}; }`,
    ].join('\n');
  },
};
