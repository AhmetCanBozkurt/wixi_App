import { FaAddressCard } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const contactDetailsBlock: BlockDefinition = {
  type: 'contact-details',
  name: 'İletişim Bilgileri',
  category: 'corporate',
  icon: FaAddressCard,
  defaultProps: {
    title: 'Bize Ulaşın',
    subtitle: 'Sorularınız için 7/24 yanınızdayız. En uygun iletişim kanalından bize ulaşabilirsiniz.',
    address: 'Levent Mahallesi, Büyükdere Cad. No: 121, Kat: 7',
    city: 'Şişli / İstanbul 34394',
    country: 'Türkiye',
    phones: [
      { label: 'Genel Hattımız',      number: '+90 212 555 01 00' },
      { label: 'Teknik Destek',       number: '+90 212 555 01 01' },
      { label: 'WhatsApp İş Hattı',   number: '+90 532 555 01 02' },
    ],
    emails: [
      { label: 'Genel Bilgi',         address: 'info@firma.com' },
      { label: 'Satış & Teklif',      address: 'satis@firma.com' },
      { label: 'Teknik Destek',       address: 'destek@firma.com' },
    ],
    workingHours: [
      { days: 'Pazartesi – Cuma',     hours: '08:00 – 18:00' },
      { days: 'Cumartesi',            hours: '09:00 – 14:00' },
      { days: 'Pazar',                hours: 'Kapalı' },
    ],
    socialLinks: [
      { platform: 'LinkedIn', url: '' },
      { platform: 'Twitter',  url: '' },
      { platform: 'Instagram', url: '' },
    ],
    layout: 'cards',
  },
  propsSchema: [
    { field: 'title',    type: 'text',     label: 'Başlık',             group: 'content' },
    { field: 'subtitle', type: 'textarea', label: 'Alt Başlık', rows: 2, group: 'content' },
    { field: 'address',  type: 'textarea', label: 'Adres Satırı', rows: 2, group: 'content' },
    { field: 'city',     type: 'text',     label: 'Şehir & Posta Kodu', group: 'content' },
    { field: 'country',  type: 'text',     label: 'Ülke',               group: 'content' },
    { field: 'layout',   type: 'select',   label: 'Düzen',              group: 'style',  options: [{ value: 'cards', label: 'Kartlar' }, { value: 'list', label: 'Liste' }, { value: 'split', label: 'Bölünmüş' }] },
    {
      field: 'phones', type: 'json-array', label: 'Telefon Numaraları', group: 'content',
      itemSchema: [
        { key: 'label',  label: 'Etiket', type: 'text' },
        { key: 'number', label: 'Numara', type: 'text' },
      ],
    },
    {
      field: 'emails', type: 'json-array', label: 'E-posta Adresleri', group: 'content',
      itemSchema: [
        { key: 'label',   label: 'Etiket',     type: 'text' },
        { key: 'address', label: 'E-posta',    type: 'text' },
      ],
    },
    {
      field: 'workingHours', type: 'json-array', label: 'Çalışma Saatleri', group: 'content',
      itemSchema: [
        { key: 'days',  label: 'Günler', type: 'text' },
        { key: 'hours', label: 'Saatler', type: 'text' },
      ],
    },
  ],
  children: [
    { key: 'title',    label: 'Başlık',    selector: 'h2' },
    { key: 'subtitle', label: 'Alt Başlık', selector: 'p'  },
  ],
  toCss: (_props, theme) => {
    return [
      `.contact-details h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
      `.contact-details .contact-subtitle { color: ${theme.colors.textMuted}; line-height: ${theme.typography.lineHeight}; }`,
      `.contact-details .info-card { background: ${theme.colors.surface}; border-radius: ${theme.borderRadius.card}; border: 1px solid ${theme.colors.border}; }`,
      `.contact-details .info-card-title { color: ${theme.colors.primary}; font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }`,
      `.contact-details .info-label { color: ${theme.colors.textMuted}; font-size: 0.8rem; }`,
      `.contact-details .info-value { color: ${theme.colors.text}; font-weight: 500; }`,
      `.contact-details a.info-value { color: ${theme.colors.primary}; }`,
      `.contact-details .hours-day { color: ${theme.colors.textMuted}; }`,
      `.contact-details .hours-time { color: ${theme.colors.text}; font-weight: 500; }`,
    ].join('\n');
  },
};
