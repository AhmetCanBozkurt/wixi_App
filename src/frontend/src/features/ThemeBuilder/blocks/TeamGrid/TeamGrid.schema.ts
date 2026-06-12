import { FaUsers } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const teamGridBlock: BlockDefinition = {
  type: 'team-grid',
  name: 'Ekip Üyeleri',
  category: 'corporate',
  icon: FaUsers,
  defaultProps: {
    title: 'Liderlik Kadromuz',
    subtitle: 'Alanında uzman, tutkulu profesyonellerimizle tanışın',
    items: [
      { name: 'Mehmet Arslan', role: 'CEO & Kurucu', bio: 'Teknoloji ve inovasyona 15 yıllık deneyimle şirketi geleceğe taşıyor. Stanford MBA mezunu.', imageUrl: '', linkedIn: '', twitter: '', email: 'mehmet@ornek.com' },
      { name: 'Zeynep Kaya',  role: 'CTO',           bio: 'Yazılım mimarisi ve ürün geliştirme konusunda 12 yıllık deneyimli teknoloji lideri.', imageUrl: '', linkedIn: '', twitter: '', email: 'zeynep@ornek.com' },
      { name: 'Ali Demir',    role: 'Tasarım Direktörü', bio: 'Kullanıcı deneyimi ve kurumsal kimlik tasarımında ödüllü bir kariyer sürdürüyor.', imageUrl: '', linkedIn: '', twitter: '', email: 'ali@ornek.com' },
      { name: 'Ayşe Yıldız', role: 'İş Geliştirme Müdürü', bio: 'B2B satış ve ortaklık stratejilerinde 10 yıllık güçlü bir sicile sahip.', imageUrl: '', linkedIn: '', twitter: '', email: 'ayse@ornek.com' },
    ],
    columns: '4',
    showBio: true,
    showSocial: true,
    cardStyle: 'card',
  },
  propsSchema: [
    { field: 'title',      type: 'text',     label: 'Başlık',             group: 'content'  },
    { field: 'subtitle',   type: 'textarea', label: 'Alt Başlık', rows: 2, group: 'content'  },
    { field: 'showBio',    type: 'boolean',  label: 'Biyografi Göster',   group: 'advanced' },
    { field: 'showSocial', type: 'boolean',  label: 'Sosyal Linkler',     group: 'advanced' },
    { field: 'cardStyle',  type: 'select',   label: 'Kart Stili',         group: 'style',   options: [{ value: 'card', label: 'Kart' }, { value: 'minimal', label: 'Minimal' }, { value: 'photo', label: 'Fotoğraf Odaklı' }] },
    { field: 'columns',    type: 'select',   label: 'Kolon',              group: 'style',   options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }] },
    {
      field: 'items', type: 'json-array', label: 'Üyeler', group: 'content',
      itemSchema: [
        { key: 'name',     label: 'İsim',          type: 'text'     },
        { key: 'role',     label: 'Unvan',         type: 'text'     },
        { key: 'bio',      label: 'Biyografi',     type: 'textarea' },
        { key: 'imageUrl', label: 'Fotoğraf URL',  type: 'url'      },
        { key: 'linkedIn', label: 'LinkedIn URL',  type: 'url'      },
        { key: 'twitter',  label: 'Twitter URL',   type: 'url'      },
        { key: 'email',    label: 'E-posta',       type: 'text'     },
      ],
    },
  ],
  children: [
    { key: 'title',    label: 'Başlık',     selector: 'h2' },
    { key: 'subtitle', label: 'Alt Başlık', selector: 'p'  },
    { key: 'items',    label: 'Üyeler',     selector: 'ul' },
  ],
  toCss: (_props, theme) => {
    return [
      `.team-grid h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
      `.team-grid .team-subtitle { color: ${theme.colors.textMuted}; line-height: ${theme.typography.lineHeight}; }`,
      `.team-grid .member-card { background: ${theme.colors.surface}; border-radius: ${theme.borderRadius.card}; box-shadow: ${theme.shadows.card}; transition: transform 0.25s, box-shadow 0.25s; }`,
      `.team-grid .member-card:hover { transform: translateY(-6px); box-shadow: 0 12px 32px rgba(0,0,0,0.15); }`,
      `.team-grid .member-name { color: ${theme.colors.text}; font-weight: ${theme.typography.headingWeight}; font-size: 1.1rem; }`,
      `.team-grid .member-role { color: ${theme.colors.primary}; font-size: 0.875rem; font-weight: 500; }`,
      `.team-grid .member-bio { color: ${theme.colors.textMuted}; font-size: 0.875rem; line-height: ${theme.typography.lineHeight}; }`,
      `.team-grid .social-link { color: ${theme.colors.textMuted}; transition: color 0.2s; }`,
      `.team-grid .social-link:hover { color: ${theme.colors.primary}; }`,
    ].join('\n');
  },
};
