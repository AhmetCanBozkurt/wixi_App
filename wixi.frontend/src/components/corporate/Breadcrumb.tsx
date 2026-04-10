import { Link } from 'react-router-dom';

interface BreadcrumbLink {
  href: string;
  text: string;
}

interface BreadcrumbProps {
  links: BreadcrumbLink[];
}

const Breadcrumb = ({ links }: BreadcrumbProps) => {
  const lastIndex = links.length - 1;
  return (
    <div className="flex items-baseline flex-wrap justify-center my-[0.9375rem] mx-0">
      {links.map((link, index) => (
        <div key={index} className="flex items-center">
          {index !== lastIndex ? (
            <Link
              to={link.href}
              className="no-underline flex items-center text-midnight_text dark:text-white/70 font-normal md:text-xl text-lg hover:underline after:relative after:content-[''] after:ml-2.5 after:mr-[0.8125rem] after:my-0 after:inline-block after:top-[0.0625rem] after:w-2 after:h-2 after:border-r-2 after:border-solid after:border-b-2 after:border-midnight_text dark:after:border-white after:-rotate-45"
            >
              {link.text}
            </Link>
          ) : (
            <span className="dark:text-white text-midnight_text md:text-xl text-lg mx-2.5">
              {link.text}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default Breadcrumb;

