import { FaListAlt } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const processStepsBlock: BlockDefinition = {
  type: 'process-steps',
  name: 'Nasıl Çalışırız?',
  category: 'corporate',
  icon: FaListAlt,
  defaultProps: {
    title: 'Çalışma Sürecimiz',
    subtitle: 'Her projeyi kanıtlanmış metodolojimizle, şeffaf ve öngörülebilir bir süreçte hayata geçiriyoruz',
    orientation: 'horizontal',
    steps: [
      { stepNumber: '01', icon: 'FaSearch',      title: 'Keşif & Analiz',      description: 'İş hedeflerinizi, mevcut altyapınızı ve rekabet ortamını derinlemesine analiz ediyoruz. Paydaş görüşmeleri ve teknik denetimle ihtiyaç haritasını çıkarıyoruz.' },
      { stepNumber: '02', icon: 'FaLightbulb',   title: 'Strateji & Planlama', description: 'Bulguları sentezleyerek önceliklendirilmiş yol haritası ve çözüm mimarisi oluşturuyoruz. Bütçe, zaman ve kaynak planlamasını netleştiriyoruz.' },
      { stepNumber: '03', icon: 'FaCode',         title: 'Tasarım & Geliştirme', description: 'Çevik metodoloji ile sprint bazlı geliştirme yapıyoruz. Her iki haftada bir demo ile ilerlemeyi paylaşıyor, geri bildirimleri anında entegre ediyoruz.' },
      { stepNumber: '04', icon: 'FaCheckDouble',  title: 'Test & Kalite Güvence', description: 'Otomatik ve manuel test süreçleriyle her bileşeni titizlikle doğruluyoruz. Performans, güvenlik ve kullanıcı kabul testleri raporlanıyor.' },
      { stepNumber: '05', icon: 'FaRocket',       title: 'Canlıya Geçiş',       description: 'Sıfır kesinti hedefiyle kademeli deployment yapıyoruz. Tüm ekibi eğitiyor ve kapsamlı dokümantasyon teslim ediyoruz.' },
      { stepNumber: '06', icon: 'FaHeadset',      title: 'Destek & İyileştirme', description: 'Canlı sonrası izleme, proaktif bakım ve sürekli optimizasyon ile uzun vadeli başarınızı güvence altına alıyoruz.' },
    ],
  },
  propsSchema: [
    { field: 'title',       type: 'text',     label: 'Başlık',             group: 'content' },
    { field: 'subtitle',    type: 'textarea', label: 'Alt Başlık', rows: 3, group: 'content' },
    { field: 'orientation', type: 'select',   label: 'Yön',                group: 'style',  options: [{ value: 'horizontal', label: 'Yatay' }, { value: 'vertical', label: 'Dikey' }] },
    {
      field: 'steps', type: 'json-array', label: 'Adımlar', group: 'content',
      itemSchema: [
        { key: 'stepNumber',  label: 'Adım No',    type: 'text'     },
        { key: 'icon',        label: 'İkon (FA)',   type: 'text'     },
        { key: 'title',       label: 'Başlık',     type: 'text'     },
        { key: 'description', label: 'Açıklama',   type: 'textarea' },
      ],
    },
  ],
  children: [
    { key: 'title',    label: 'Başlık',    selector: 'h2' },
    { key: 'subtitle', label: 'Alt Başlık', selector: 'p'  },
    { key: 'steps',    label: 'Adımlar',   selector: 'ol' },
  ],
  toCss: (_props, theme) => {
    return [
      `.process-steps h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
      `.process-steps .process-subtitle { color: ${theme.colors.textMuted}; line-height: ${theme.typography.lineHeight}; }`,
      `.process-steps .step-card { background: ${theme.colors.surface}; border-radius: ${theme.borderRadius.card}; border: 1px solid ${theme.colors.border}; }`,
      `.process-steps .step-number { background: ${theme.colors.primary}; color: #fff; font-weight: ${theme.typography.headingWeight}; border-radius: 50%; }`,
      `.process-steps .step-title { color: ${theme.colors.text}; font-weight: ${theme.typography.headingWeight}; }`,
      `.process-steps .step-description { color: ${theme.colors.textMuted}; line-height: ${theme.typography.lineHeight}; font-size: 0.9rem; }`,
      `.process-steps .step-connector { background: ${theme.colors.primary}; opacity: 0.3; }`,
    ].join('\n');
  },
};
