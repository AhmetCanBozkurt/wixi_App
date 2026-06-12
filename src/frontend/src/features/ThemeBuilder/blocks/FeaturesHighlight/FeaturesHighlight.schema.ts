import { FaCheckCircle } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const featuresHighlightBlock: BlockDefinition = {
  type: 'features-highlight',
  name: 'Özellikler & Avantajlar',
  category: 'corporate',
  icon: FaCheckCircle,
  defaultProps: {
    title: 'Neden Bizi Seçmelisiniz?',
    subtitle: 'Rakiplerimizden farklı kılan güçlü yönlerimizi keşfedin',
    layout: 'grid',
    items: [
      { icon: 'FaAward',      title: 'Sektör Lideri',         description: '15 yıllık deneyimimiz ve 30\'dan fazla sektör ödülüyle alanımızın en güvenilir isimlerinden biriyiz.', color: '#6366f1' },
      { icon: 'FaClock',      title: 'Zamanında Teslimat',    description: 'Son 3 yılda tüm projelerimizin %97\'sini belirlenen süre ve bütçe dahilinde teslim ettik.', color: '#10b981' },
      { icon: 'FaUserCheck',  title: 'Uzman Ekip',            description: '80+ sertifikalı mühendis ve danışmandan oluşan multidisipliner ekibimiz her projeye özgün yaklaşıyor.', color: '#f59e0b' },
      { icon: 'FaShieldAlt', title: 'Güvenlik Önceliği',     description: 'ISO 27001 standartlarında veri güvenliği ve KVKK uyumluluk güvencesiyle verileriniz her zaman koruma altında.', color: '#3b82f6' },
      { icon: 'FaHeadset',   title: 'Proaktif Destek',       description: 'Sorun oluşmadan önce tespit eden izleme sistemleri ve 4 saatlik yanıt garantili destek ekibimiz her an hazır.', color: '#8b5cf6' },
      { icon: 'FaChartLine', title: 'Ölçülebilir Sonuçlar', description: 'Her projede KPI\'lar belirleniyor, ilerleme raporlanıyor ve yatırım getirisi (ROI) şeffaf biçimde takip ediliyor.', color: '#ec4899' },
    ],
    columns: '3',
  },
  propsSchema: [
    { field: 'title',    type: 'text',     label: 'Başlık',             group: 'content' },
    { field: 'subtitle', type: 'textarea', label: 'Alt Başlık', rows: 2, group: 'content' },
    { field: 'layout',   type: 'select',   label: 'Düzen',              group: 'style',  options: [{ value: 'grid', label: 'Izgara' }, { value: 'list', label: 'Liste' }] },
    { field: 'columns',  type: 'select',   label: 'Kolon',              group: 'style',  options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }] },
    {
      field: 'items', type: 'json-array', label: 'Özellikler', group: 'content',
      itemSchema: [
        { key: 'icon',        label: 'İkon (FA adı)', type: 'text'     },
        { key: 'title',       label: 'Başlık',        type: 'text'     },
        { key: 'description', label: 'Açıklama',      type: 'textarea' },
        { key: 'color',       label: 'Renk',          type: 'text',    placeholder: '#6366f1' },
      ],
    },
  ],
  children: [
    { key: 'title',    label: 'Başlık',    selector: 'h2' },
    { key: 'subtitle', label: 'Alt Başlık', selector: 'p'  },
    { key: 'items',    label: 'Özellikler', selector: 'ul' },
  ],
  toCss: (_props, theme) => {
    return [
      `.features-highlight h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
      `.features-highlight .features-subtitle { color: ${theme.colors.textMuted}; line-height: ${theme.typography.lineHeight}; }`,
      `.features-highlight .feature-card { background: ${theme.colors.surface}; border-radius: ${theme.borderRadius.card}; border: 1px solid ${theme.colors.border}; transition: border-color 0.2s; }`,
      `.features-highlight .feature-card:hover { border-color: ${theme.colors.primary}; }`,
      `.features-highlight .feature-title { color: ${theme.colors.text}; font-weight: ${theme.typography.headingWeight}; }`,
      `.features-highlight .feature-description { color: ${theme.colors.textMuted}; line-height: ${theme.typography.lineHeight}; font-size: 0.9rem; }`,
    ].join('\n');
  },
};
