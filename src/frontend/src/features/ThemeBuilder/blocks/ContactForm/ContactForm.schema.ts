import { FaWpforms } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const contactFormBlock: BlockDefinition = {
  type: 'contact-form',
  name: 'İletişim Formu',
  category: 'forms',
  icon: FaWpforms,
  defaultProps: {
    title: 'Bize Ulaşın',
    subtitle: 'Sorularınız için bize yazın.',
    showPhone: true,
    showSubject: true,
    buttonText: 'Gönder',
    buttonColor: '#ec4899',
    successMessage: 'Mesajınız alındı!',
  },
  propsSchema: [
    { field: 'title',          type: 'text',    label: 'Başlık',        group: 'content'  },
    { field: 'subtitle',       type: 'text',    label: 'Alt Başlık',    group: 'content'  },
    { field: 'showPhone',      type: 'boolean', label: 'Telefon Alanı', group: 'advanced' },
    { field: 'showSubject',    type: 'boolean', label: 'Konu Alanı',    group: 'advanced' },
    { field: 'buttonText',     type: 'text',    label: 'Buton Metni',   group: 'style'    },
    { field: 'buttonColor',    type: 'color',   label: 'Buton Rengi',   group: 'style'    },
    { field: 'successMessage', type: 'text',    label: 'Başarı Mesajı', group: 'content'  },
  ],
  children: [
    { key: 'title',      label: 'Başlık',         selector: 'h2'     },
    { key: 'subtitle',   label: 'Alt Başlık',      selector: 'p'      },
    { key: 'buttonText', label: 'Gönder Butonu',   selector: 'button' },
  ],
  toCss: (props, theme) => {
    const btnColor = (props['buttonColor'] as string | undefined) ?? theme.colors.primary;
    return [
      `.contact-form h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
      `.contact-form p { color: ${theme.colors.textMuted}; }`,
      `.contact-form button[type="submit"] { background: ${btnColor}; border-radius: ${theme.borderRadius.button}; }`,
      `.contact-form input, .contact-form textarea { border: 1px solid ${theme.colors.border}; border-radius: ${theme.borderRadius.md}; }`,
    ].join('\n');
  },
};
