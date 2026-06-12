import { FaBuilding } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const aboutCompanyBlock: BlockDefinition = {
  type: 'about-company',
  name: 'Hakkımızda',
  category: 'corporate',
  icon: FaBuilding,
  defaultProps: {
    title: 'Biz Kimiz?',
    subtitle: '2009\'dan bu yana 500\'den fazla kurumsal müşteriye değer katıyoruz',
    text: 'Wixi olarak, işletmelerin dijital dönüşüm yolculuğunda güvenilir iş ortağı olma misyonuyla kurulduk. Deneyimli ekibimiz, yenilikçi teknoloji çözümleri ve stratejik danışmanlık hizmetleriyle müşterilerimizin rekabet avantajı kazanmasına destek oluyoruz.\n\nMüşteri odaklı yaklaşımımız, şeffaf iletişim anlayışımız ve sonuç garantili projelerimizle sektörde fark yaratıyoruz.',
    imageUrl: '',
    imagePosition: 'right',
    missionTitle: 'Misyonumuz',
    missionText: 'Her ölçekteki işletmeye, sınıf ötesi teknoloji ve danışmanlık hizmetleri sunarak sürdürülebilir büyüme sağlamak.',
    visionTitle: 'Vizyonumuz',
    visionText: 'Türkiye\'nin en güvenilir dijital dönüşüm partneri olmak ve global pazarda güçlü bir iz bırakmak.',
    stats: [
      { value: '15+', label: 'Yıllık Deneyim' },
      { value: '500+', label: 'Tamamlanan Proje' },
      { value: '120+', label: 'Uzman Çalışan' },
      { value: '%98', label: 'Müşteri Memnuniyeti' },
    ],
    showStats: true,
    showMissionVision: true,
  },
  propsSchema: [
    { field: 'title',            type: 'text',     label: 'Başlık',             group: 'content' },
    { field: 'subtitle',         type: 'textarea', label: 'Alt Başlık', rows: 2, group: 'content' },
    { field: 'text',             type: 'richtext', label: 'Ana Metin',           group: 'content' },
    { field: 'imageUrl',         type: 'image',    label: 'Görsel',              group: 'visual'  },
    { field: 'imagePosition',    type: 'select',   label: 'Görsel Tarafı',       group: 'visual',  options: [{ value: 'left', label: 'Sol' }, { value: 'right', label: 'Sağ' }] },
    { field: 'showStats',        type: 'boolean',  label: 'İstatistikler Göster', group: 'advanced' },
    { field: 'showMissionVision',type: 'boolean',  label: 'Misyon/Vizyon Göster', group: 'advanced' },
    { field: 'missionTitle',     type: 'text',     label: 'Misyon Başlığı',      group: 'content' },
    { field: 'missionText',      type: 'textarea', label: 'Misyon Metni', rows: 3, group: 'content' },
    { field: 'visionTitle',      type: 'text',     label: 'Vizyon Başlığı',      group: 'content' },
    { field: 'visionText',       type: 'textarea', label: 'Vizyon Metni', rows: 3, group: 'content' },
    {
      field: 'stats', type: 'json-array', label: 'İstatistikler', group: 'content',
      itemSchema: [
        { key: 'value', label: 'Değer',  type: 'text', placeholder: '500+' },
        { key: 'label', label: 'Etiket', type: 'text', placeholder: 'Tamamlanan Proje' },
      ],
    },
  ],
  children: [
    { key: 'title',       label: 'Başlık',    selector: 'h2'       },
    { key: 'subtitle',    label: 'Alt Başlık', selector: '.subtitle' },
    { key: 'text',        label: 'Ana Metin',  selector: 'div.text' },
    { key: 'imageUrl',    label: 'Görsel',     selector: 'img'      },
    { key: 'missionText', label: 'Misyon',     selector: '.mission' },
    { key: 'visionText',  label: 'Vizyon',     selector: '.vision'  },
  ],
  toCss: (_props, theme) => {
    return [
      `.about-company h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
      `.about-company .subtitle { color: ${theme.colors.primary}; font-weight: 500; }`,
      `.about-company div.text { color: ${theme.colors.textMuted}; line-height: ${theme.typography.lineHeight}; }`,
      `.about-company .mission-box, .about-company .vision-box { background: ${theme.colors.surface}; border-left: 4px solid ${theme.colors.primary}; border-radius: ${theme.borderRadius.md}; }`,
      `.about-company .mission-title, .about-company .vision-title { color: ${theme.colors.primary}; font-weight: ${theme.typography.headingWeight}; }`,
      `.about-company .stat-value { color: ${theme.colors.primary}; font-size: 2rem; font-weight: ${theme.typography.headingWeight}; }`,
      `.about-company .stat-label { color: ${theme.colors.textMuted}; font-size: 0.875rem; }`,
    ].join('\n');
  },
};
