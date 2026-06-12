import { FaNewspaper } from 'react-icons/fa';
import type { BlockDefinition } from '../registry/types';

export const blogListBlock: BlockDefinition = {
  type: 'blog-list',
  name: 'Blog Yazıları',
  category: 'corporate',
  icon: FaNewspaper,
  defaultProps: {
    title: 'Blog & Güncel İçerikler',
    subtitle: 'Sektörün nabzını tutan uzman analizleri, teknik rehberler ve şirket haberlerimizi keşfedin',
    limit: 6,
    columns: '3',
    showFeaturedImage: true,
    showAuthor: true,
    showDate: true,
    showReadTime: true,
    showCategory: true,
    viewAllLink: '/blog',
    viewAllText: 'Tüm Yazıları Gör',
    dataSource: 'api',
  },
  propsSchema: [
    { field: 'title',            type: 'text',    label: 'Başlık',           group: 'content'  },
    { field: 'subtitle',         type: 'textarea', label: 'Alt Başlık', rows: 2, group: 'content' },
    { field: 'limit',            type: 'number',  label: 'Yazı Sayısı',      group: 'advanced' },
    { field: 'columns',          type: 'select',  label: 'Kolon',            group: 'style',   options: [{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }] },
    { field: 'showFeaturedImage',type: 'boolean', label: 'Kapak Görseli',    group: 'visual'   },
    { field: 'showAuthor',       type: 'boolean', label: 'Yazar Göster',     group: 'visual'   },
    { field: 'showDate',         type: 'boolean', label: 'Tarih Göster',     group: 'visual'   },
    { field: 'showReadTime',     type: 'boolean', label: 'Okuma Süresi',     group: 'visual'   },
    { field: 'showCategory',     type: 'boolean', label: 'Kategori Göster',  group: 'visual'   },
    { field: 'viewAllLink',      type: 'url',     label: 'Tümünü Gör Linki', group: 'content'  },
    { field: 'viewAllText',      type: 'text',    label: 'Tümünü Gör Metni', group: 'content'  },
  ],
  children: [
    { key: 'title',       label: 'Başlık',    selector: 'h2'  },
    { key: 'subtitle',    label: 'Alt Başlık', selector: 'p'   },
    { key: 'viewAllText', label: 'Tümü Butonu', selector: 'a' },
  ],
  toCss: (_props, theme) => {
    return [
      `.blog-list h2 { color: ${theme.colors.text}; font-family: ${theme.typography.fontFamily}; font-weight: ${theme.typography.headingWeight}; }`,
      `.blog-list .blog-subtitle { color: ${theme.colors.textMuted}; line-height: ${theme.typography.lineHeight}; }`,
      `.blog-list .post-card { background: ${theme.colors.surface}; border-radius: ${theme.borderRadius.card}; box-shadow: ${theme.shadows.card}; border: 1px solid ${theme.colors.border}; transition: transform 0.25s, box-shadow 0.25s; overflow: hidden; }`,
      `.blog-list .post-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.12); }`,
      `.blog-list .post-category { color: ${theme.colors.primary}; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }`,
      `.blog-list .post-title { color: ${theme.colors.text}; font-weight: ${theme.typography.headingWeight}; line-height: 1.3; }`,
      `.blog-list .post-meta { color: ${theme.colors.textMuted}; font-size: 0.8rem; }`,
      `.blog-list .view-all-btn { background: transparent; border: 2px solid ${theme.colors.primary}; color: ${theme.colors.primary}; border-radius: ${theme.borderRadius.button}; font-weight: 600; }`,
    ].join('\n');
  },
};
