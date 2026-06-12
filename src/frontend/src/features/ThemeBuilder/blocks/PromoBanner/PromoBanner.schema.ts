import { FaBullhorn } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const promoBannerBlock: BlockDefinition = {
  type: 'promo-banner',
  name: 'Kampanya Bandı',
  category: 'marketing',
  icon: FaBullhorn,
  defaultProps: {
    // dataSource: 'db' — fetches from /store-admin/promo-banners; below props are fallback
    dataSource: 'db',
    message: '🎉 Tüm siparişlerde %20 indirim! Kod: WIXI20',
    buttonText: 'Hemen Al',
    buttonLink: '#',
    backgroundColor: '#ec4899',
    textColor: '#ffffff',
    dismissable: true,
  },
  propsSchema: [
    { field: 'message',         type: 'text',    label: 'Mesaj (Yedek)',   group: 'content'  },
    { field: 'buttonText',      type: 'text',    label: 'Buton Metni',     group: 'style'    },
    { field: 'buttonLink',      type: 'url',     label: 'Buton Linki',     group: 'style'    },
    { field: 'backgroundColor', type: 'color',   label: 'Arka Plan Rengi', group: 'visual'   },
    { field: 'textColor',       type: 'color',   label: 'Yazı Rengi',      group: 'visual'   },
    { field: 'dismissable',     type: 'boolean', label: 'Kapatılabilir',   group: 'advanced' },
  ],
  children: [
    { key: 'message',    label: 'Mesaj', selector: 'span'   },
    { key: 'buttonText', label: 'Buton', selector: 'button' },
  ],
  toCss: (props, _theme) => {
    const bg   = (props['backgroundColor'] as string | undefined) ?? '#ec4899';
    const text = (props['textColor']       as string | undefined) ?? '#ffffff';
    return [
      `.promo-banner { background: ${bg}; color: ${text}; }`,
      `.promo-banner button { color: ${bg}; background: ${text}; }`,
    ].join('\n');
  },
};
