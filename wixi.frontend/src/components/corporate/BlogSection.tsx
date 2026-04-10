import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/language-context';
import { useEffect, useState } from 'react';
import corporateBlogService from '../../ApiServices/services/CorporateBlogService';
import type { BlogPost } from '../../ApiServices/services/CorporateBlogService';
import { toast } from 'sonner';
import BlogCard from './BlogCard';
import { ArrowRight } from 'lucide-react';

const BlogSection = () => {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const result = await corporateBlogService.getBlogPosts(1, 3);
        if (result.success && result.data) {
          setPosts(result.data.data);
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <section className="flex flex-wrap justify-center dark:bg-darkmode py-16" id="blog">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-baseline justify-between flex-wrap">
          <h2
            className="sm:mb-11 mb-3 text-4xl font-bold text-midnight_text dark:text-white"
            data-aos="fade-right"
            data-aos-delay="200"
            data-aos-duration="1000"
          >
            {t('blog.latest') || 'Latest blog & news'}
          </h2>
          <Link
            to="/blog"
            className="flex items-center gap-3 text-base text-midnight_text dark:text-white dark:hover:text-primary font-medium hover:text-primary sm:pb-0 pb-3"
            data-aos="fade-left"
            data-aos-delay="200"
            data-aos-duration="1000"
          >
            {t('blog.viewMore') || 'View More'}
            <ArrowRight className="h-6 w-6" />
          </Link>
        </div>
        <div className="grid grid-cols-12 gap-7">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-full md:col-span-4 sm:col-span-6 col-span-12"
              >
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              </div>
            ))
          ) : (
            posts.map((blog, i) => (
              <div
                key={blog.id}
                className="w-full md:col-span-4 sm:col-span-6 col-span-12"
                data-aos="fade-up"
                data-aos-delay={`${i * 200}`}
                data-aos-duration="1000"
              >
                <BlogCard {...blog} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;

