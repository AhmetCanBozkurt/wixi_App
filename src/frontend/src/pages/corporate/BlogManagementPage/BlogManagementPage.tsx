import { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaNewspaper, FaTags } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { corpBlogApi } from '../../../entities/CorpBlog/api/corpBlogApi';
import type { BlogCategory, BlogPostListItem } from '../../../entities/CorpBlog/model/types';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { Button } from '../../../shared/ui/Button/Button';
import { Input } from '../../../shared/ui/Input/Input';
import { Select } from '../../../shared/ui/Select/Select';
import { Switch } from '../../../shared/ui/Switch/Switch';
import styles from './BlogManagementPage.module.css';

type Tab = 'posts' | 'categories';

interface PostForm {
  title: string;
  slug: string;
  summary: string;
  contentHtml: string;
  authorName: string;
  readTimeMinutes: number;
  categoryId: string;
  tags: string;
  metaTitle: string;
  metaDescription: string;
  featuredImageUrl: string;
}

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
}

const emptyPostForm = (): PostForm => ({
  title: '', slug: '', summary: '', contentHtml: '', authorName: '',
  readTimeMinutes: 0, categoryId: '', tags: '', metaTitle: '', metaDescription: '', featuredImageUrl: '',
});

const emptyCatForm = (): CategoryForm => ({ name: '', slug: '', description: '', sortOrder: 0 });

export default function BlogManagementPage() {
  const [tab, setTab] = useState<Tab>('posts');
  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(false);

  const [postModal, setPostModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPostListItem | null>(null);
  const [postForm, setPostForm] = useState<PostForm>(emptyPostForm());
  const [savingPost, setSavingPost] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);

  const [catModal, setCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<BlogCategory | null>(null);
  const [catForm, setCatForm] = useState<CategoryForm>(emptyCatForm());
  const [savingCat, setSavingCat] = useState(false);
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [postsRes, catsRes] = await Promise.all([
        corpBlogApi.getPosts(),
        corpBlogApi.getCategories(),
      ]);
      setPosts(postsRes.data);
      setCategories(catsRes.data);
    } catch {
      toast.error('Veriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadData(); }, []);

  // ── Posts ─────────────────────────────────────────────────────────
  const openCreatePost = () => {
    setEditingPost(null);
    setPostForm(emptyPostForm());
    setPostModal(true);
  };

  const openEditPost = async (p: BlogPostListItem) => {
    try {
      const res = await corpBlogApi.getPostBySlug(p.slug);
      const full = res.data;
      setPostForm({
        title: full.title, slug: full.slug, summary: full.summary ?? '',
        contentHtml: full.contentHtml ?? '', authorName: full.authorName ?? '',
        readTimeMinutes: full.readTimeMinutes, categoryId: full.categoryId ?? '',
        tags: full.tags ?? '', metaTitle: full.metaTitle ?? '',
        metaDescription: full.metaDescription ?? '', featuredImageUrl: full.featuredImageUrl ?? '',
      });
      setEditingPost(p);
      setPostModal(true);
    } catch {
      toast.error('Gönderi yüklenemedi.');
    }
  };

  const savePost = async () => {
    if (!postForm.title.trim() || !postForm.slug.trim()) {
      toast.error('Başlık ve slug zorunlu.');
      return;
    }
    setSavingPost(true);
    try {
      const payload = {
        ...postForm,
        readTimeMinutes: Number(postForm.readTimeMinutes),
        categoryId: postForm.categoryId || undefined,
      };
      if (editingPost) {
        await corpBlogApi.updatePost(editingPost.id, payload);
        toast.success('Gönderi güncellendi.');
      } else {
        await corpBlogApi.createPost(payload);
        toast.success('Gönderi oluşturuldu.');
      }
      setPostModal(false);
      await loadData();
    } catch {
      toast.error('Kayıt hatası.');
    } finally {
      setSavingPost(false);
    }
  };

  const togglePublish = async (p: BlogPostListItem) => {
    try {
      await corpBlogApi.publishPost(p.id, !p.isPublished);
      await loadData();
    } catch {
      toast.error('Yayın durumu güncellenemedi.');
    }
  };

  const deletePost = async () => {
    if (!deletePostId) return;
    try {
      await corpBlogApi.deletePost(deletePostId);
      toast.success('Gönderi silindi.');
      setDeletePostId(null);
      await loadData();
    } catch {
      toast.error('Silme hatası.');
    }
  };

  // ── Categories ────────────────────────────────────────────────────
  const openCreateCat = () => {
    setEditingCat(null);
    setCatForm(emptyCatForm());
    setCatModal(true);
  };

  const openEditCat = (c: BlogCategory) => {
    setEditingCat(c);
    setCatForm({ name: c.name, slug: c.slug, description: c.description ?? '', sortOrder: c.sortOrder });
    setCatModal(true);
  };

  const saveCat = async () => {
    if (!catForm.name.trim() || !catForm.slug.trim()) {
      toast.error('Ad ve slug zorunlu.');
      return;
    }
    setSavingCat(true);
    try {
      if (editingCat) {
        await corpBlogApi.updateCategory(editingCat.id, { ...catForm, sortOrder: Number(catForm.sortOrder) });
        toast.success('Kategori güncellendi.');
      } else {
        await corpBlogApi.createCategory({ ...catForm, sortOrder: Number(catForm.sortOrder) });
        toast.success('Kategori oluşturuldu.');
      }
      setCatModal(false);
      await loadData();
    } catch {
      toast.error('Kayıt hatası.');
    } finally {
      setSavingCat(false);
    }
  };

  const deleteCat = async () => {
    if (!deleteCatId) return;
    try {
      await corpBlogApi.deleteCategory(deleteCatId);
      toast.success('Kategori silindi.');
      setDeleteCatId(null);
      await loadData();
    } catch {
      toast.error('Silme hatası.');
    }
  };

  const categoryOptions = [
    { label: '— Kategori seçin —', value: '' },
    ...categories.map(c => ({ label: c.name, value: c.id })),
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}><FaNewspaper /> Blog Yönetimi</h1>
          <p className={styles.subtitle}>Kurumsal blog gönderileri ve kategoriler</p>
        </div>
        <Button
          variant="primary"
          onClick={tab === 'posts' ? openCreatePost : openCreateCat}
        >
          <FaPlus /> {tab === 'posts' ? 'Yeni Gönderi' : 'Yeni Kategori'}
        </Button>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'posts' ? styles.tabActive : ''}`} onClick={() => setTab('posts')}>
          <FaNewspaper /> Gönderiler ({posts.length})
        </button>
        <button className={`${styles.tab} ${tab === 'categories' ? styles.tabActive : ''}`} onClick={() => setTab('categories')}>
          <FaTags /> Kategoriler ({categories.length})
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Yükleniyor...</div>
      ) : tab === 'posts' ? (
        <div className={styles.table}>
          <table>
            <thead>
              <tr>
                <th>Başlık</th>
                <th>Yazar</th>
                <th>Kategori</th>
                <th>Yayın</th>
                <th>Tarih</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 && (
                <tr><td colSpan={6} className={styles.empty}>Henüz gönderi yok.</td></tr>
              )}
              {posts.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className={styles.postTitle}>{p.title}</div>
                    <div className={styles.slug}>/{p.slug}</div>
                  </td>
                  <td>{p.authorName || '—'}</td>
                  <td>{categories.find(c => c.id === p.categoryId)?.name || '—'}</td>
                  <td>
                    <Switch
                      label=""
                      checked={p.isPublished}
                      onChange={() => void togglePublish(p)}
                    />
                  </td>
                  <td>{new Date(p.createdAt).toLocaleDateString('tr-TR')}</td>
                  <td className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => void openEditPost(p)}><FaEdit /></button>
                    <button className={styles.deleteBtn} onClick={() => setDeletePostId(p.id)}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.table}>
          <table>
            <thead>
              <tr><th>Ad</th><th>Slug</th><th>Açıklama</th><th>Sıra</th><th></th></tr>
            </thead>
            <tbody>
              {categories.length === 0 && (
                <tr><td colSpan={5} className={styles.empty}>Henüz kategori yok.</td></tr>
              )}
              {categories.map(c => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td className={styles.slug}>{c.slug}</td>
                  <td>{c.description || '—'}</td>
                  <td>{c.sortOrder}</td>
                  <td className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => openEditCat(c)}><FaEdit /></button>
                    <button className={styles.deleteBtn} onClick={() => setDeleteCatId(c.id)}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Post Modal ─────────────────────────────────────────────── */}
      <Modal
        isOpen={postModal}
        onClose={() => setPostModal(false)}
        title={editingPost ? 'Gönderi Düzenle' : 'Yeni Gönderi'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPostModal(false)}>İptal</Button>
            <Button variant="primary" isLoading={savingPost} onClick={() => void savePost()}>Kaydet</Button>
          </>
        }
      >
        <div className={styles.formGrid}>
          <Input label="Başlık *" value={postForm.title} onChange={e => setPostForm(f => ({ ...f, title: e.target.value }))} />
          <Input label="Slug *" value={postForm.slug} onChange={e => setPostForm(f => ({ ...f, slug: e.target.value }))} />
          <Select
            label="Kategori"
            options={categoryOptions}
            value={postForm.categoryId}
            onChange={v => setPostForm(f => ({ ...f, categoryId: String(v) }))}
          />
          <Input label="Yazar" value={postForm.authorName} onChange={e => setPostForm(f => ({ ...f, authorName: e.target.value }))} />
          <Input label="Okuma süresi (dk)" type="number" value={String(postForm.readTimeMinutes)} onChange={e => setPostForm(f => ({ ...f, readTimeMinutes: Number(e.target.value) }))} />
          <Input label="Öne çıkan görsel URL" value={postForm.featuredImageUrl} onChange={e => setPostForm(f => ({ ...f, featuredImageUrl: e.target.value }))} />
          <Input label="Etiketler (virgülle)" value={postForm.tags} onChange={e => setPostForm(f => ({ ...f, tags: e.target.value }))} />
          <div className={styles.fullRow}>
            <label className={styles.textareaLabel}>Özet</label>
            <textarea className={styles.textarea} rows={3} value={postForm.summary} onChange={e => setPostForm(f => ({ ...f, summary: e.target.value }))} />
          </div>
          <div className={styles.fullRow}>
            <label className={styles.textareaLabel}>İçerik (HTML)</label>
            <textarea className={styles.textarea} rows={10} value={postForm.contentHtml} onChange={e => setPostForm(f => ({ ...f, contentHtml: e.target.value }))} />
          </div>
          <Input label="Meta başlık" value={postForm.metaTitle} onChange={e => setPostForm(f => ({ ...f, metaTitle: e.target.value }))} />
          <Input label="Meta açıklama" value={postForm.metaDescription} onChange={e => setPostForm(f => ({ ...f, metaDescription: e.target.value }))} />
        </div>
      </Modal>

      {/* ── Category Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={catModal}
        onClose={() => setCatModal(false)}
        title={editingCat ? 'Kategori Düzenle' : 'Yeni Kategori'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCatModal(false)}>İptal</Button>
            <Button variant="primary" isLoading={savingCat} onClick={() => void saveCat()}>Kaydet</Button>
          </>
        }
      >
        <div className={styles.formGrid}>
          <Input label="Ad *" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Slug *" value={catForm.slug} onChange={e => setCatForm(f => ({ ...f, slug: e.target.value }))} />
          <Input label="Sıra" type="number" value={String(catForm.sortOrder)} onChange={e => setCatForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} />
          <div className={styles.fullRow}>
            <label className={styles.textareaLabel}>Açıklama</label>
            <textarea className={styles.textarea} rows={3} value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} />
          </div>
        </div>
      </Modal>

      {/* ── Delete Post Modal ──────────────────────────────────────── */}
      <Modal
        isOpen={!!deletePostId}
        onClose={() => setDeletePostId(null)}
        title="Gönderiyi Sil"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeletePostId(null)}>Vazgeç</Button>
            <Button variant="danger" onClick={() => void deletePost()}>Evet, Sil</Button>
          </>
        }
      >
        <p>Bu gönderiyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
      </Modal>

      {/* ── Delete Category Modal ──────────────────────────────────── */}
      <Modal
        isOpen={!!deleteCatId}
        onClose={() => setDeleteCatId(null)}
        title="Kategoriyi Sil"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteCatId(null)}>Vazgeç</Button>
            <Button variant="danger" onClick={() => void deleteCat()}>Evet, Sil</Button>
          </>
        }
      >
        <p>Bu kategoriyi silmek istediğinize emin misiniz?</p>
      </Modal>
    </div>
  );
}
