import { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/language-context';
import corporateBlogService from '../../ApiServices/services/CorporateBlogService';
import type { BlogPost } from '../../ApiServices/services/CorporateBlogService';
import { toast } from 'sonner';
import BlogCard from './BlogCard';

const BlogList = () => {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const result = await corporateBlogService.getBlogPosts(1, 100);
        if (result.success && result.data) {
          setPosts(result.data.data);
        }
      } catch (error) {
        toast.error('Blog yazıları yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <section className="flex flex-wrap justify-center pt-8 md:pb-24 pb-16 dark:bg-darkmode" id="blog">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-12 gap-7">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="w-full lg:col-span-4 md:col-span-6 col-span-12"
              >
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              </div>
            ))
          ) : (
            posts.map((blog, i) => (
              <div
                key={blog.id}
                className="w-full lg:col-span-4 md:col-span-6 col-span-12"
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

export default BlogList;

