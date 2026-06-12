import { FaBriefcase } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const servicesGridBlock: BlockDefinition = {
  type: 'services-grid',
  name: 'Hizmetler',
  category: 'corporate',
  icon: FaBriefcase,
  defaultProps: {
    title: 'Hizmetlerimiz',
    subtitle: 'İşletmenizin ihtiyaçlarına özel, uçtan uca kurumsal çözümler sunuyoruz',
    layout: 'grid',
    items: [
      { icon: 'FaLaptopCode', title: 'Yazılım Geliştirme', description: 'İşletmenize özel web uygulamaları, mobil çözümler ve kurumsal yazılım sistemleri geliştiriyoruz. Çevik metodoloji ile hızlı ve kaliteli teslimat sağlıyoruz.', iconColor: '#6366f1', buttonText: 'Detaylı Bilgi', buttonLink: '/hizmetler/yazilim' },
      { icon: 'FaChartLine',  title: 'Dijital Danışmanlık', description: 'Dijital dönüşüm stratejisi, süreç iyileştirme ve teknoloji yol haritası konularında uzman danışmanlık hizmeti veriyoruz.', iconColor: '#10b981', buttonText: 'Detaylı Bilgi', buttonLink: '/hizmetler/danismanlik' },
      { icon: 'FaShieldAlt', title: 'Siber Güvenlik', description: 'Kurumsal ağ güvenliği, penetrasyon testleri, KVKK uyumluluk denetimleri ve güvenlik operasyon merkezi hizmetleri sunuyoruz.', iconColor: '#f59e0b', buttonText: 'Detaylı Bilgi', buttonLink: '/hizmetler/guvenlik' },
      { icon: 'FaCloud',     title: 'Bulut Altyapısı', description: 'AWS, Azure ve Google Cloud üzerinde kurumsal altyapı tasarımı, migration ve yönetim hizmetleri ile maliyetlerinizi optimize ediyoruz.', iconColor: '#3b82f6', buttonText: 'Detaylı Bilgi', buttonLink: '/hizmetler/bulut' },
      { icon: 'FaCogs',      title: 'ERP & Entegrasyon', description: 'SAP, Microsoft Dynamics ve özel ERP çözümleri ile tüm iş süreçlerinizi tek platformda yönetin. Sistem entegrasyonu ve otomasyon uzmanlığı.', iconColor: '#8b5cf6', buttonText: 'Detaylı Bilgi', buttonLink: '/hizmetler/erp' },
      { icon: 'FaHeadset',   title: '7/24 Teknik Destek', description: 'Kritik sistemlerinizin kesintisiz çalışması için SLA garantili destek planları, uzaktan erişim desteği ve yerinde teknik servis hizmetleri.', iconColor: '#ec4899', buttonText: 'Detaylı Bilgi', buttonLink: '/hizmetler/destek' },
    ],
    columns: '3',
    showButton: true,
  },
  propsSchema: [
    { field: 'title',      type: 'text',     label: 'Başlık',      group: 'content' },
    { field: 'subtitle',   type: 'textarea', label: 'Alt Başlık', rows: 2, group: 'content' },
    { field: 'layout',     type: 'select',   label: 'Düzen',       group: 'style',  options: [{ value: 'grid', label: 'Izgara' }, { value: 'list', label: 'Liste' }, { value: 'featured', label: 'Öne Çıkan' }] },
    { field: 'showButton', type: 'boolean',  label: 'Buton Göster', group: 'advanced' },
    { field: 'columns',    type: 'select',   label: 'Kolon',       group: 'style',  options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }] },
    {
      field: 'items', type: 'json-array', label: 'Hizmetler', group: 'content',
      itemSchema: [
        { key: 'icon',        label: 'İkon (FA adı)',  type: 'text'     },
        { key: 'title',       label: 'Başlık',         type: 'text'     },
        { key: 'description', label: 'Açıklama',       type: 'textarea' },
        { key: 'iconColor',   label: 'İkon Rengi',     type: 'text',    placeholder: '#6366f1' },
        { key: 'buttonText',  label: 'Buton Metni',    type: 'text'     },
        { key: 'buttonLink',  label: 'Buton Linki',    type: 'url'      },
      ],
    },
  ],
  children: [
    { key: 'title',    label: 'Başlık',    selector: 'h2' },
    { key: 'subtitle', label: 'Alt Başlık', selector: 'p'  },
    { key: 'items',    label: 'Hizmetler', selector: 'ul' },
  ],
  toCss: (_props, theme) => {
    return [
      `.services-grid h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
      `.services-grid .services-subtitle { color: ${theme.colors.textMuted}; line-height: ${theme.typography.lineHeight}; }`,
      `.services-grid .service-card { background: ${theme.colors.surface}; border-radius: ${theme.borderRadius.card}; box-shadow: ${theme.shadows.card}; transition: transform 0.25s, box-shadow 0.25s; border: 1px solid ${theme.colors.border}; }`,
      `.services-grid .service-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.12); }`,
      `.services-grid .service-icon { font-size: 2.5rem; margin-bottom: 1rem; }`,
      `.services-grid .service-title { color: ${theme.colors.text}; font-weight: ${theme.typography.headingWeight}; font-size: 1.15rem; }`,
      `.services-grid .service-description { color: ${theme.colors.textMuted}; line-height: ${theme.typography.lineHeight}; font-size: 0.9rem; }`,
      `.services-grid .service-btn { color: ${theme.colors.primary}; font-weight: 500; font-size: 0.9rem; }`,
    ].join('\n');
  },
};
