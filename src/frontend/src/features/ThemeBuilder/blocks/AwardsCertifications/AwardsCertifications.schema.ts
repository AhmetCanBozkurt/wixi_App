import { FaTrophy } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const awardsCertificationsBlock: BlockDefinition = {
  type: 'awards-certifications',
  name: 'Ödüller & Sertifikalar',
  category: 'corporate',
  icon: FaTrophy,
  defaultProps: {
    title: 'Ödüller & Sertifikasyonlar',
    subtitle: 'Kalitemizi ve uzmanlığımızı belgeleyen sektör tanınırlıkları',
    items: [
      { year: '2024', name: 'En İnovatif Yazılım Şirketi',      organization: 'Teknoloji Derneği',         imageUrl: '', description: 'Yapay zeka destekli çözümlerimiz bu prestijli ödülü kazandırdı.' },
      { year: '2023', name: 'ISO 27001 Bilgi Güvenliği',         organization: 'BSI Group',                 imageUrl: '', description: 'Tüm süreçlerimizde uluslararası bilgi güvenliği standardı.' },
      { year: '2023', name: 'Yılın En İyi B2B Hizmet Sağlayıcı', organization: 'Deloitte Technology Fast 50', imageUrl: '', description: 'Müşteri memnuniyeti ve büyüme hızımızla değerlendirildik.' },
      { year: '2022', name: 'ISO 9001:2015 Kalite Yönetimi',     organization: 'Bureau Veritas',            imageUrl: '', description: 'Tüm operasyonel süreçlerimiz uluslararası kalite standartlarını karşılıyor.' },
      { year: '2022', name: 'Microsoft Gold Partner',            organization: 'Microsoft',                 imageUrl: '', description: 'Microsoft ekosisteminde en yüksek yetkinlik seviyesi.' },
      { year: '2021', name: 'AWS Advanced Consulting Partner',   organization: 'Amazon Web Services',       imageUrl: '', description: 'Cloud migrasyonu ve yönetiminde üst düzey AWS yetkinliği.' },
    ],
    columns: '3',
  },
  propsSchema: [
    { field: 'title',    type: 'text',    label: 'Başlık',             group: 'content' },
    { field: 'subtitle', type: 'textarea', label: 'Alt Başlık', rows: 2, group: 'content' },
    { field: 'columns',  type: 'select',  label: 'Kolon',              group: 'style',  options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }] },
    {
      field: 'items', type: 'json-array', label: 'Ödüller', group: 'content',
      itemSchema: [
        { key: 'year',         label: 'Yıl',          type: 'text'     },
        { key: 'name',         label: 'Ödül/Sertifika Adı', type: 'text' },
        { key: 'organization', label: 'Veren Kuruluş', type: 'text'    },
        { key: 'imageUrl',     label: 'Logo/Görsel',  type: 'url'      },
        { key: 'description',  label: 'Açıklama',     type: 'textarea' },
      ],
    },
  ],
  children: [
    { key: 'title',    label: 'Başlık',    selector: 'h2' },
    { key: 'subtitle', label: 'Alt Başlık', selector: 'p'  },
    { key: 'items',    label: 'Ödüller',   selector: 'ul' },
  ],
  toCss: (_props, theme) => {
    return [
      `.awards-certifications h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
      `.awards-certifications .awards-subtitle { color: ${theme.colors.textMuted}; }`,
      `.awards-certifications .award-card { background: ${theme.colors.surface}; border-radius: ${theme.borderRadius.card}; border: 1px solid ${theme.colors.border}; transition: border-color 0.2s, box-shadow 0.2s; }`,
      `.awards-certifications .award-card:hover { border-color: ${theme.colors.primary}; box-shadow: ${theme.shadows.card}; }`,
      `.awards-certifications .award-year { color: ${theme.colors.primary}; font-weight: 600; font-size: 0.8rem; }`,
      `.awards-certifications .award-name { color: ${theme.colors.text}; font-weight: ${theme.typography.headingWeight}; }`,
      `.awards-certifications .award-org { color: ${theme.colors.textMuted}; font-size: 0.875rem; }`,
      `.awards-certifications .award-description { color: ${theme.colors.textMuted}; font-size: 0.85rem; line-height: ${theme.typography.lineHeight}; }`,
    ].join('\n');
  },
};
