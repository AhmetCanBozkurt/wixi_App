import { FaPhone } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const phoneContactBlock: BlockDefinition = {
  type: 'phone-contact',
  name: 'Telefon ile İletişim',
  category: 'corporate',
  icon: FaPhone,
  defaultProps: {
    title: 'Hemen Arayın',
    subtitle: 'Uzman ekibimiz sorularınızı yanıtlamak için hazır',
    mainPhone: '+90 212 555 01 00',
    mainPhoneLabel: 'Genel Müdürlük',
    supportPhone: '+90 212 555 01 01',
    supportPhoneLabel: 'Teknik Destek Hattı',
    whatsapp: '+90 532 555 01 02',
    availabilityText: 'Pazartesi – Cuma, 08:00 – 18:00 arası ulaşabilirsiniz',
    buttonText: 'Callback İste',
    buttonLink: '/iletisim#callback',
    backgroundColor: '',
  },
  propsSchema: [
    { field: 'title',            type: 'text',     label: 'Başlık',            group: 'content' },
    { field: 'subtitle',         type: 'textarea', label: 'Alt Başlık', rows: 2, group: 'content' },
    { field: 'mainPhone',        type: 'text',     label: 'Ana Telefon',       group: 'content' },
    { field: 'mainPhoneLabel',   type: 'text',     label: 'Ana Hat Etiketi',   group: 'content' },
    { field: 'supportPhone',     type: 'text',     label: 'Destek Telefonu',   group: 'content' },
    { field: 'supportPhoneLabel',type: 'text',     label: 'Destek Hat Etiketi', group: 'content' },
    { field: 'whatsapp',         type: 'text',     label: 'WhatsApp Numarası', group: 'content' },
    { field: 'availabilityText', type: 'text',     label: 'Mesai Metni',       group: 'content' },
    { field: 'buttonText',       type: 'text',     label: 'Buton Metni',       group: 'style'   },
    { field: 'buttonLink',       type: 'url',      label: 'Buton Linki',       group: 'style'   },
    { field: 'backgroundColor',  type: 'color',    label: 'Arka Plan',         group: 'visual'  },
  ],
  children: [
    { key: 'title',       label: 'Başlık',    selector: 'h2' },
    { key: 'subtitle',    label: 'Alt Başlık', selector: 'p'  },
    { key: 'mainPhone',   label: 'Ana Hat',   selector: 'a.main-phone' },
  ],
  toCss: (_props, theme) => {
    return [
      `.phone-contact h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
      `.phone-contact .phone-subtitle { color: ${theme.colors.textMuted}; line-height: ${theme.typography.lineHeight}; }`,
      `.phone-contact .phone-card { background: ${theme.colors.surface}; border-radius: ${theme.borderRadius.card}; border: 1px solid ${theme.colors.border}; }`,
      `.phone-contact .phone-label { color: ${theme.colors.textMuted}; font-size: 0.8rem; }`,
      `.phone-contact a.phone-number { color: ${theme.colors.text}; font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em; }`,
      `.phone-contact a.phone-number:hover { color: ${theme.colors.primary}; }`,
      `.phone-contact .whatsapp-btn { background: #25D366; color: #fff; border-radius: ${theme.borderRadius.button}; font-weight: 600; }`,
      `.phone-contact .callback-btn { background: ${theme.colors.primary}; color: #fff; border-radius: ${theme.borderRadius.button}; font-weight: 600; }`,
      `.phone-contact .availability { color: ${theme.colors.textMuted}; font-size: 0.85rem; }`,
    ].join('\n');
  },
};
