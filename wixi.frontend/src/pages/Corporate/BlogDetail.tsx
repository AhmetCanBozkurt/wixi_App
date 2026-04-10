import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/language-context';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import BlogCard from '../../components/corporate/BlogCard';
import corporateBlogService from '../../ApiServices/services/CorporateBlogService';
import type { BlogPostDetail } from '../../ApiServices/services/CorporateBlogService';
import { toast } from 'sonner';
import { ArrowLeft, Clock, User, Calendar } from 'lucide-react';

const CorporateBlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useLanguage();
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostDetail['relatedPosts']>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      setLoading(true);
      try {
        const result = await corporateBlogService.getBlogPostBySlug(slug);
        if (result.success && result.data) {
          setPost(result.data);
          setRelatedPosts(result.data.relatedPosts || []);
        } else {
          toast.error(result.error || 'Blog yazısı bulunamadı');
        }
      } catch (error) {
        toast.error('Blog yazısı yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const getLocalizedText = (obj?: {
    tr?: string;
    de?: string;
    en?: string;
    ar?: string;
  }) => {
    if (!obj) return '';
    return obj[language as keyof typeof obj] || obj.tr || '';
  };

  const getLocalizedContent = () => {
    if (!post) return '';
    return getLocalizedText({
      tr: post.content,
      de: post.contentDe,
      en: post.contentEn,
      ar: post.contentAr,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl font-bold mb-4">Blog Yazısı Bulunamadı</h1>
          <p className="text-muted-foreground mb-8">
            Aradığınız blog yazısı bulunamadı veya silinmiş olabilir.
          </p>
          <Button asChild>
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Blog'a Dön
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" asChild className="mb-6 text-white hover:bg-white/10">
              <Link to="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('blog.back') || 'Blog\'a Dön'}
              </Link>
            </Button>
            {post.category && (
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm mb-4">
                {post.category}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {getLocalizedText({
                tr: post.title,
                de: post.titleDe,
                en: post.titleEn,
                ar: post.titleAr,
              })}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm opacity-90">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                {post.author}
              </div>
              {post.publishedAt && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(post.publishedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              )}
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {post.readingTime} {t('blog.minRead') || 'dakika okuma'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {post.featuredImageUrl && (
              <img
                src={post.featuredImageUrl}
                alt={getLocalizedText({
                  tr: post.title,
                  de: post.titleDe,
                  en: post.titleEn,
                  ar: post.titleAr,
                })}
                className="w-full h-auto rounded-lg mb-8"
              />
            )}
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: getLocalizedContent() }}
            />
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts && relatedPosts.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">
              {t('blog.related') || 'İlgili Yazılar'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {relatedPosts.map((relatedPost) => (
                <BlogCard key={relatedPost.id} {...relatedPost} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default CorporateBlogDetail;

