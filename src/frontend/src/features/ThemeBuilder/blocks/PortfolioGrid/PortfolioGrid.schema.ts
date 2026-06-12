import { FaTh } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const portfolioGridBlock: BlockDefinition = {
  type: 'portfolio-grid',
  name: 'Portfolyo / Referanslar',
  category: 'corporate',
  icon: FaTh,
  defaultProps: {
    title: 'Başarılı Projelerimiz',
    subtitle: 'Farklı sektörlerden 500+ tamamlanan proje. Referans listemizdeki bazı seçkin çalışmalarımız:',
    filterEnabled: true,
    columns: '3',
    items: [
      { title: 'Yapay Zeka Destekli CRM',        category: 'Yazılım',      imageUrl: '', url: '', description: 'Fortune 500 müşterimiz için geliştirilen, makine öğrenimi tabanlı müşteri ilişkileri yönetim platformu. 360° müşteri görünümü ve predictive analytics.', tags: 'AI, CRM, .NET, React' },
      { title: 'Bulut ERP Migrasyonu',           category: 'Bulut',        imageUrl: '', url: '', description: '15.000 çalışanlı üretim firmasının tüm ERP altyapısını on-premise\'den Azure buluta taşıma projesi. Sıfır kesinti, 3 ay teslim.', tags: 'Azure, SAP, Migration' },
      { title: 'Dijital Dönüşüm Danışmanlığı',  category: 'Danışmanlık',  imageUrl: '', url: '', description: 'Geleneksel bir perakende grubunun e-ticaret kanalı açması ve omnichannel stratejisi oluşturması için verilen kapsamlı danışmanlık hizmeti.', tags: 'Danışmanlık, E-ticaret, Strateji' },
      { title: 'Siber Güvenlik Denetimi',        category: 'Güvenlik',     imageUrl: '', url: '', description: 'Fintech şirketi için kapsamlı penetrasyon testi, güvenlik açıkları analizi ve KVKK uyumluluk paketi. 280+ güvenlik açığı tespit edildi ve kapatıldı.', tags: 'Pentest, KVKK, ISO 27001' },
      { title: 'Mobil Saha Yönetim Uygulaması', category: 'Mobil & Web', imageUrl: '', url: '', description: '1.200 saha teknisyeni için geliştirilen iş emri takip, rota optimizasyonu ve gerçek zamanlı raporlama uygulaması. iOS & Android.', tags: 'React Native, Flutter, GPS' },
      { title: 'Otomasyonlu İK Platformu',      category: 'Yazılım',      imageUrl: '', url: '', description: 'İşe alım süreçlerini ucundan ucuna otomatize eden, yapay zeka ile aday eleme yapan SaaS İK platformu. 60% süreç hızlanması sağlandı.', tags: 'SaaS, AI, Node.js, Vue' },
    ],
  },
  propsSchema: [
    { field: 'title',         type: 'text',    label: 'Başlık',            group: 'content'  },
    { field: 'subtitle',      type: 'textarea', label: 'Alt Başlık', rows: 2, group: 'content' },
    { field: 'filterEnabled', type: 'boolean', label: 'Kategori Filtresi', group: 'advanced' },
    { field: 'columns',       type: 'select',  label: 'Kolon',             group: 'style',   options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }] },
    {
      field: 'items', type: 'json-array', label: 'Projeler', group: 'content',
      itemSchema: [
        { key: 'title',       label: 'Proje Adı',   type: 'text'     },
        { key: 'category',    label: 'Kategori',    type: 'text'     },
        { key: 'description', label: 'Açıklama',    type: 'textarea' },
        { key: 'tags',        label: 'Etiketler (virgülle ayır)', type: 'text' },
        { key: 'imageUrl',    label: 'Görsel URL',  type: 'url'      },
        { key: 'url',         label: 'Proje Linki', type: 'url'      },
      ],
    },
  ],
  children: [
    { key: 'title',    label: 'Başlık',    selector: 'h2' },
    { key: 'subtitle', label: 'Alt Başlık', selector: 'p'  },
    { key: 'items',    label: 'Projeler',  selector: 'ul' },
  ],
  toCss: (_props, theme) => {
    return [
      `.portfolio-grid h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
      `.portfolio-grid .portfolio-subtitle { color: ${theme.colors.textMuted}; line-height: ${theme.typography.lineHeight}; }`,
      `.portfolio-grid .filter-btn { border: 1px solid ${theme.colors.border}; border-radius: ${theme.borderRadius.md}; color: ${theme.colors.textMuted}; transition: all 0.2s; }`,
      `.portfolio-grid .filter-btn.active { background: ${theme.colors.primary}; border-color: ${theme.colors.primary}; color: #fff; }`,
      `.portfolio-grid .portfolio-item { border-radius: ${theme.borderRadius.card}; overflow: hidden; box-shadow: ${theme.shadows.card}; border: 1px solid ${theme.colors.border}; transition: transform 0.25s, box-shadow 0.25s; }`,
      `.portfolio-grid .portfolio-item:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.15); }`,
      `.portfolio-grid .item-title { color: ${theme.colors.text}; font-weight: ${theme.typography.headingWeight}; }`,
      `.portfolio-grid .item-category { color: ${theme.colors.primary}; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }`,
      `.portfolio-grid .item-description { color: ${theme.colors.textMuted}; font-size: 0.85rem; line-height: ${theme.typography.lineHeight}; }`,
      `.portfolio-grid .item-tag { background: ${theme.colors.surface}; color: ${theme.colors.textMuted}; border: 1px solid ${theme.colors.border}; border-radius: ${theme.borderRadius.sm ?? '4px'}; font-size: 0.75rem; }`,
    ].join('\n');
  },
};
