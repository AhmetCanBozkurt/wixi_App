import { FaStar } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const numbersCounterBlock: BlockDefinition = {
  type: 'numbers-counter',
  name: 'Sayaç / Rakamlar',
  category: 'corporate',
  icon: FaStar,
  defaultProps: {
    title: 'Rakamlarla Biz',
    subtitle: 'Somut veriler, gerçek başarılar',
    backgroundColor: '',
    backgroundType: 'color',
    items: [
      { value: '500', suffix: '+',  label: 'Tamamlanan Proje',   icon: 'FaCheckCircle', color: '#6366f1' },
      { value: '120', suffix: '+',  label: 'Uzman Çalışan',      icon: 'FaUsers',       color: '#10b981' },
      { value: '15',  suffix: ' yıl', label: 'Sektör Deneyimi',  icon: 'FaHistory',    color: '#f59e0b' },
      { value: '98',  suffix: '%',  label: 'Müşteri Memnuniyeti', icon: 'FaStar',       color: '#3b82f6' },
      { value: '42',  suffix: '+',  label: 'Aktif Ülke',         icon: 'FaGlobe',       color: '#8b5cf6' },
      { value: '30',  suffix: '+',  label: 'Sektör Ödülü',       icon: 'FaTrophy',      color: '#ec4899' },
    ],
    columns: '3',
    animateOnScroll: true,
  },
  propsSchema: [
    { field: 'title',           type: 'text',    label: 'Başlık',            group: 'content'  },
    { field: 'subtitle',        type: 'textarea', label: 'Alt Başlık', rows: 2, group: 'content' },
    { field: 'backgroundType',  type: 'select',  label: 'Arka Plan Tipi',    group: 'visual',  options: [{ value: 'color', label: 'Renk' }, { value: 'gradient', label: 'Degrade' }, { value: 'dark', label: 'Koyu' }] },
    { field: 'backgroundColor', type: 'color',   label: 'Arka Plan Rengi',   group: 'visual'   },
    { field: 'animateOnScroll', type: 'boolean', label: 'Kaydırmada Animasyon', group: 'advanced' },
    { field: 'columns',         type: 'select',  label: 'Kolon',             group: 'style',   options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }, { value: '6', label: '6' }] },
    {
      field: 'items', type: 'json-array', label: 'Sayaçlar', group: 'content',
      itemSchema: [
        { key: 'value',  label: 'Değer',     type: 'text', placeholder: '500'  },
        { key: 'suffix', label: 'Sonek',     type: 'text', placeholder: '+'    },
        { key: 'label',  label: 'Etiket',    type: 'text', placeholder: 'Proje' },
        { key: 'icon',   label: 'İkon (FA)', type: 'text'                       },
        { key: 'color',  label: 'Renk',      type: 'text', placeholder: '#6366f1' },
      ],
    },
  ],
  children: [
    { key: 'title',    label: 'Başlık',    selector: 'h2' },
    { key: 'subtitle', label: 'Alt Başlık', selector: 'p'  },
    { key: 'items',    label: 'Sayaçlar',  selector: 'ul' },
  ],
  toCss: (props, theme) => {
    const bg = (props['backgroundColor'] as string | undefined) ?? theme.colors.surface;
    return [
      `.numbers-counter { background: ${bg}; font-family: ${theme.typography.fontFamily}; }`,
      `.numbers-counter h2 { color: ${theme.colors.text}; font-weight: ${theme.typography.headingWeight}; }`,
      `.numbers-counter .counter-subtitle { color: ${theme.colors.textMuted}; }`,
      `.numbers-counter .counter-value { font-size: 3rem; font-weight: 700; line-height: 1; }`,
      `.numbers-counter .counter-label { color: ${theme.colors.textMuted}; font-size: 0.9rem; margin-top: 0.5rem; }`,
    ].join('\n');
  },
};
