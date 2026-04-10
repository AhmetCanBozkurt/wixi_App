import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface BlogCardProps {
  id: number;
  slug: string;
  title: string;
  summary?: string;
  category?: string;
  featuredImageUrl?: string;
  publishedAt?: string;
  author?: string;
  readingTime?: number;
}

const BlogCard = ({
  slug,
  title,
  summary,
  category,
  featuredImageUrl,
  publishedAt,
}: BlogCardProps) => {
  return (
    <div className="group mb-0 relative">
      <div className="mb-8 overflow-hidden rounded-sm">
        <Link to={`/blog/${slug}`} aria-label="blog cover" className="block">
          {featuredImageUrl ? (
            <img
              src={featuredImageUrl}
              alt={title}
              className="w-full transition group-hover:scale-125 h-64 object-cover"
            />
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-4xl font-bold">
                {title.charAt(0)}
              </span>
            </div>
          )}
        </Link>
      </div>
      {category && (
        <div className="absolute top-0 bg-primary py-2 ml-4 mt-4 px-5 rounded-sm">
          <span className="text-white font-medium text-sm">
            {category}
          </span>
        </div>
      )}
      <div>
        <h3>
          <Link
            to={`/blog/${slug}`}
            className="mb-4 inline-block font-semibold text-midnight_text hover:text-primary dark:text-white dark:hover:text-primary text-[22px] leading-tight"
          >
            {title}
          </Link>
        </h3>
        {publishedAt && (
          <span className="text-sm font-semibold leading-loose text-grey dark:text-white/50">
            {format(new Date(publishedAt), 'dd MMM yyyy')}
          </span>
        )}
      </div>
    </div>
  );
};

export default BlogCard;
