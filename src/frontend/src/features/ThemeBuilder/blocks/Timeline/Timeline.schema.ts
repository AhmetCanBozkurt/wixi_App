import { FaHistory } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const timelineBlock: BlockDefinition = {
  type: 'timeline',
  name: 'Zaman Çizelgesi',
  category: 'corporate',
  icon: FaHistory,
  defaultProps: {
    title: 'Tarihçemiz',
    subtitle: 'Başarıyla dolu bir yolculuğun kilometre taşları',
    orientation: 'alternating',
    items: [
      { year: '2009', title: 'Kuruluş',            description: 'İstanbul\'da 5 kişilik bir ekiple yazılım danışmanlığı hizmetlerine başladık. İlk müşterimiz için kurumsal ERP entegrasyonu teslim ettik.', imageUrl: '', color: '#6366f1' },
      { year: '2012', title: 'İlk Büyük Proje',   description: 'Fortune 500 listesindeki ilk kurumsal müşterimizle anlaşma imzaladık. Ekip 30 kişiye büyüdü, yeni ofisimize taşındık.', imageUrl: '', color: '#10b981' },
      { year: '2015', title: 'Uluslararası Açılım', description: 'Almanya ve Hollanda\'da ofisler açarak Avrupa pazarına giriş yaptık. İlk ISO 9001 sertifikamızı aldık.', imageUrl: '', color: '#f59e0b' },
      { year: '2018', title: 'Teknoloji Atılımı',  description: 'Yapay zeka ve makine öğrenimi alanına yatırım yaptık. Kendi ürün portföyümüzü oluşturmaya başladık. 100 uzman çalışana ulaştık.', imageUrl: '', color: '#3b82f6' },
      { year: '2021', title: 'Pandemi & Dijital Büyüme', description: 'Pandemi döneminde uzaktan çalışmaya sorunsuz geçtik. Dijital dönüşüm talebindeki artışla birlikte ciromuz 2 katına çıktı.', imageUrl: '', color: '#8b5cf6' },
      { year: '2024', title: 'Yeni Dönem',         description: 'Yapay zeka destekli ürün suitemizi piyasaya sürdük. 500. projemizi tamamladık ve 30. sektör ödülümüzü kazandık.', imageUrl: '', color: '#ec4899' },
    ],
  },
  propsSchema: [
    { field: 'title',       type: 'text',     label: 'Başlık',             group: 'content' },
    { field: 'subtitle',    type: 'textarea', label: 'Alt Başlık', rows: 2, group: 'content' },
    { field: 'orientation', type: 'select',   label: 'Dizilim',            group: 'style',  options: [{ value: 'alternating', label: 'Alternatif' }, { value: 'left', label: 'Solda' }, { value: 'right', label: 'Sağda' }] },
    {
      field: 'items', type: 'json-array', label: 'Etkinlikler', group: 'content',
      itemSchema: [
        { key: 'year',        label: 'Yıl / Tarih',  type: 'text'     },
        { key: 'title',       label: 'Başlık',       type: 'text'     },
        { key: 'description', label: 'Açıklama',     type: 'textarea' },
        { key: 'imageUrl',    label: 'Görsel URL',   type: 'url'      },
        { key: 'color',       label: 'Nokta Rengi',  type: 'text',    placeholder: '#6366f1' },
      ],
    },
  ],
  children: [
    { key: 'title',    label: 'Başlık',      selector: 'h2' },
    { key: 'subtitle', label: 'Alt Başlık',  selector: 'p'  },
    { key: 'items',    label: 'Etkinlikler', selector: 'ol' },
  ],
  toCss: (_props, theme) => {
    return [
      `.timeline h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
      `.timeline .timeline-subtitle { color: ${theme.colors.textMuted}; }`,
      `.timeline .timeline-line { background: ${theme.colors.border}; }`,
      `.timeline .timeline-dot { background: ${theme.colors.primary}; border: 3px solid ${theme.colors.surface}; box-shadow: 0 0 0 3px ${theme.colors.primary}33; }`,
      `.timeline .timeline-card { background: ${theme.colors.surface}; border-radius: ${theme.borderRadius.card}; box-shadow: ${theme.shadows.card}; border: 1px solid ${theme.colors.border}; }`,
      `.timeline .timeline-year { color: ${theme.colors.primary}; font-weight: 700; font-size: 1.1rem; }`,
      `.timeline .timeline-title { color: ${theme.colors.text}; font-weight: ${theme.typography.headingWeight}; }`,
      `.timeline .timeline-description { color: ${theme.colors.textMuted}; line-height: ${theme.typography.lineHeight}; font-size: 0.9rem; }`,
    ].join('\n');
  },
};
