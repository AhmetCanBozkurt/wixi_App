import { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/language-context';
import corporateService from '../../ApiServices/services/CorporateService';
import type { CorporateStats } from '../../ApiServices/services/CorporateService';
import { toast } from 'sonner';

const StatsSection = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<CorporateStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await corporateService.getStats();
        if (result.success && result.data) {
          setStats(result.data);
        } else {
          // Use default stats if API fails
          setStats({
            totalProjects: 100,
            totalClients: 50,
            totalTestimonials: 30,
            totalTeamMembers: 20,
            yearsOfExperience: 10,
            activeUsers: 1000,
          });
        }
      } catch (error) {
        // Use default stats on error
        setStats({
          totalProjects: 100,
          totalClients: 50,
          totalTestimonials: 30,
          totalTeamMembers: 20,
          yearsOfExperience: 10,
          activeUsers: 1000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsList = stats
    ? [
        {
          value: `${stats.yearsOfExperience}+`,
          description: t('stats.years') || 'Years of Experience',
        },
        {
          value: `${stats.totalProjects}+`,
          description: t('stats.projects') || 'Successful Projects',
        },
        {
          value: `${stats.totalClients}+`,
          description: t('stats.clients') || 'Happy Clients',
        },
        {
          value: '24/7',
          description: t('stats.support') || 'Technical Support',
        },
      ]
    : [];

  if (loading) {
    return (
      <section className="dark:bg-darkmode bg-white py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-center md:justify-between justify-center md:gap-0 gap-9">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-[0.875rem] animate-pulse"
              >
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-12 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="dark:bg-darkmode bg-white py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-center md:justify-between justify-center md:gap-0 gap-9">
          {statsList.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-[0.875rem]"
              data-aos="fade-up"
              data-aos-delay={`${index * 200}`}
              data-aos-duration="1000"
            >
              <span className="text-5xl font-semibold text-midnight_text dark:text-white">
                {stat.value}
              </span>
              <p className="text-base text-grey text-center max-w-[17.8125rem] w-full dark:text-white/50">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
