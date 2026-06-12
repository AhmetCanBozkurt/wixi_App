import { FaMapMarkerAlt } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const mapEmbedBlock: BlockDefinition = {
  type: 'map-embed',
  name: 'Harita & Lokasyon',
  category: 'corporate',
  icon: FaMapMarkerAlt,
  defaultProps: {
    title: 'Bizi Ziyaret Edin',
    embedUrl: '',
    mapHeight: '420px',
    showContactSidebar: true,
    address: 'Levent Mahallesi, Büyükdere Cad. No: 121, Kat: 7\nŞişli / İstanbul 34394',
    phone: '+90 212 555 01 00',
    email: 'info@firma.com',
    workingHours: 'Pzt–Cum: 08:00–18:00 | Cmt: 09:00–14:00',
    parkingNote: 'Binada ücretsiz otopark mevcuttur.',
  },
  propsSchema: [
    { field: 'title',              type: 'text',    label: 'Başlık',                group: 'content' },
    { field: 'embedUrl',           type: 'url',     label: 'Google Maps Embed URL', group: 'content' },
    { field: 'mapHeight',          type: 'text',    label: 'Harita Yüksekliği',     group: 'visual'  },
    { field: 'showContactSidebar', type: 'boolean', label: 'İletişim Bilgileri',    group: 'advanced' },
    { field: 'address',            type: 'textarea', label: 'Adres', rows: 2,       group: 'content' },
    { field: 'phone',              type: 'text',    label: 'Telefon',               group: 'content' },
    { field: 'email',              type: 'text',    label: 'E-posta',               group: 'content' },
    { field: 'workingHours',       type: 'text',    label: 'Çalışma Saatleri',      group: 'content' },
    { field: 'parkingNote',        type: 'text',    label: 'Park Notu',             group: 'content' },
  ],
  children: [
    { key: 'title',    label: 'Başlık', selector: 'h2'     },
    { key: 'embedUrl', label: 'Harita', selector: 'iframe' },
  ],
  toCss: (_props, theme) => {
    return [
      `.map-embed h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
      `.map-embed .contact-sidebar { background: ${theme.colors.surface}; border-radius: ${theme.borderRadius.card}; border: 1px solid ${theme.colors.border}; }`,
      `.map-embed .sidebar-label { color: ${theme.colors.primary}; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }`,
      `.map-embed .sidebar-value { color: ${theme.colors.text}; font-weight: 500; line-height: 1.4; }`,
      `.map-embed .sidebar-note { color: ${theme.colors.textMuted}; font-size: 0.85rem; }`,
      `.map-embed iframe { border-radius: ${theme.borderRadius.card}; border: 0; }`,
    ].join('\n');
  },
};
