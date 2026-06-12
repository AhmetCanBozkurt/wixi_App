import { FaVideo } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const videoEmbedBlock: BlockDefinition = {
  type: 'video-embed',
  name: 'Video',
  category: 'content',
  icon: FaVideo,
  defaultProps: {
    title: 'Tanıtım Videosu',
    url: '',
    autoplay: false,
    muted: true,
  },
  propsSchema: [
    { field: 'title',    type: 'text',    label: 'Başlık',          group: 'content'  },
    { field: 'url',      type: 'url',     label: 'YouTube/Vimeo URL', group: 'content' },
    { field: 'autoplay', type: 'boolean', label: 'Otomatik Oynat',  group: 'advanced' },
    { field: 'muted',    type: 'boolean', label: 'Sessiz',          group: 'advanced' },
  ],
  children: [
    { key: 'title', label: 'Başlık',    selector: 'h3'     },
    { key: 'url',   label: 'Video URL', selector: 'iframe' },
  ],
  toCss: (_props, theme) => {
    return [
      `.video-embed h3 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
    ].join('\n');
  },
};
