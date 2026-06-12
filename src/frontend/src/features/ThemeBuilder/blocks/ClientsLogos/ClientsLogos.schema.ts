import { FaHandshake } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const clientsLogosBlock: BlockDefinition = {
  type: 'clients-logos',
  name: 'Müşteri & İş Ortakları',
  category: 'corporate',
  icon: FaHandshake,
  defaultProps: {
    title: 'Güvenilir İş Ortaklarımız',
    subtitle: '200\'den fazla kurumsal müşteri ve global iş ortağıyla büyümeye devam ediyoruz',
    grayscale: true,
    showOnHoverColor: true,
    columns: '6',
    logos: [
      { imageUrl: '', altText: 'Microsoft', url: '' },
      { imageUrl: '', altText: 'SAP',       url: '' },
      { imageUrl: '', altText: 'Oracle',    url: '' },
      { imageUrl: '', altText: 'Garanti BBVA', url: '' },
      { imageUrl: '', altText: 'Koç Holding', url: '' },
      { imageUrl: '', altText: 'Sabancı Holding', url: '' },
    ],
    backgroundStyle: 'plain',
  },
  propsSchema: [
    { field: 'title',           type: 'text',    label: 'Başlık',              group: 'content'  },
    { field: 'subtitle',        type: 'textarea', label: 'Alt Başlık', rows: 2, group: 'content'  },
    { field: 'grayscale',       type: 'boolean', label: 'Gri Ton',             group: 'visual'   },
    { field: 'showOnHoverColor',type: 'boolean', label: 'Hover\'da Renkli',    group: 'visual'   },
    { field: 'columns',         type: 'select',  label: 'Kolon',               group: 'style',   options: [{ value: '3', label: '3' }, { value: '4', label: '4' }, { value: '5', label: '5' }, { value: '6', label: '6' }] },
    { field: 'backgroundStyle', type: 'select',  label: 'Arka Plan',           group: 'visual',  options: [{ value: 'plain', label: 'Sade' }, { value: 'light', label: 'Açık' }, { value: 'dark', label: 'Koyu' }] },
    {
      field: 'logos', type: 'json-array', label: 'Logolar', group: 'content',
      itemSchema: [
        { key: 'imageUrl', label: 'Logo URL',   type: 'url'  },
        { key: 'altText',  label: 'Şirket Adı', type: 'text' },
        { key: 'url',      label: 'Web Sitesi', type: 'url'  },
      ],
    },
  ],
  children: [
    { key: 'title',    label: 'Başlık',    selector: 'h2' },
    { key: 'subtitle', label: 'Alt Başlık', selector: 'p'  },
    { key: 'logos',    label: 'Logolar',   selector: 'ul' },
  ],
  toCss: (_props, theme) => {
    return [
      `.clients-logos h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
      `.clients-logos .logos-subtitle { color: ${theme.colors.textMuted}; }`,
      `.clients-logos .logo-item { transition: opacity 0.2s, filter 0.2s; }`,
      `.clients-logos .logo-item img { filter: grayscale(100%); opacity: 0.5; transition: all 0.3s; }`,
      `.clients-logos .logo-item:hover img { filter: grayscale(0%); opacity: 1; }`,
    ].join('\n');
  },
};
