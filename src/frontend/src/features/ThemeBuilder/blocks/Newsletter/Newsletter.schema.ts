import { FaEnvelope } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const newsletterBlock: BlockDefinition = {
  type: 'newsletter',
  name: 'E-Bülten',
  category: 'marketing',
  icon: FaEnvelope,
  defaultProps: {
    title: 'Fırsatlardan Haberdar Olun',
    text: 'Kampanya ve yenilikleri kaçırmayın.',
    buttonText: 'Abone Ol',
    successMessage: 'Teşekkürler! Abone oldunuz.',
  },
  propsSchema: [
    { field: 'title',          type: 'text',     label: 'Başlık',        group: 'content' },
    { field: 'text',           type: 'textarea', label: 'Açıklama', rows: 2, group: 'content' },
    { field: 'buttonText',     type: 'text',     label: 'Buton Metni',   group: 'style'   },
    { field: 'successMessage', type: 'text',     label: 'Başarı Mesajı', group: 'content' },
  ],
  children: [
    { key: 'title',      label: 'Başlık',    selector: 'h2'     },
    { key: 'text',       label: 'Açıklama',  selector: 'p'      },
    { key: 'buttonText', label: 'Buton',     selector: 'button' },
  ],
  toCss: (_props, theme) => {
    return [
      `.newsletter h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
      `.newsletter p { color: ${theme.colors.textMuted}; }`,
      `.newsletter button { background: ${theme.colors.primary}; border-radius: ${theme.borderRadius.button}; }`,
    ].join('\n');
  },
};
