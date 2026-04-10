import { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/language-context';

interface ProgressItem {
  title: string;
  progress: number;
}

const WorkProgress = ({ isColorMode }: { isColorMode: boolean }) => {
  const { t } = useLanguage();
  const [progressValues, setProgressValues] = useState<ProgressItem[]>([]);

  useEffect(() => {
    // Default progress data - can be replaced with API call
    setProgressValues([
      { title: t('workProgress.uxResearch') || 'UX Research and Testing', progress: 95 },
      { title: t('workProgress.productManagement') || 'Product Management', progress: 84 },
      { title: t('workProgress.uiDesign') || 'UI & Visual Design', progress: 90 },
    ]);
  }, [t]);

  return (
    <section
      className={`scroll-mt-25 ${
        isColorMode
          ? 'dark:bg-darklight bg-section'
          : 'dark:bg-darkmode bg-white'
      }`}
      id="about"
    >
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid md:grid-cols-12 items-center gap-7">
          <div className="md:col-span-6">
            <div className="relative w-full h-full min-h-[400px] bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl font-bold text-primary">100%</div>
                <div className="text-xl text-grey dark:text-white/70">
                  {t('workProgress.completed') || 'Projects Completed'}
                </div>
              </div>
            </div>
          </div>
          <div
            className="md:col-span-6"
            data-aos="fade-left"
            data-aos-delay="200"
            data-aos-duration="1000"
          >
            <div className="flex gap-2 items-center">
              <span className="w-3 h-3 rounded-full bg-success"></span>
              <span className="font-medium text-midnight_text text-sm dark:text-white/50">
                {t('workProgress.badge') || 'build everything'}
              </span>
            </div>
            <h2 className="pt-9 pb-8 text-midnight_text font-bold dark:text-white text-4xl">
              {t('workProgress.title') || 'Build amazing websites and landing pages with ease'}
            </h2>
            <p className="text-grey dark:text-white/70 text-base font-semibold">
              {t('workProgress.description') || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.'}
            </p>

            <div className="block mx-auto pt-12">
              {progressValues.map((item, index) => (
                <div
                  key={index}
                  className="progress_bar_item flex flex-wrap mb-8"
                >
                  <div className="flex-1 w-auto text-sm font-normal text-grey mb-2 dark:text-white/50">
                    {item.title}
                  </div>
                  <div className="item_value shrink text-sm font-normal text-grey mb-2 dark:text-white/50">
                    {item.progress}%
                  </div>
                  <div className="relative h-1 w-full bg-primary/30 rounded-md">
                    <div
                      className="progress absolute left-0 top-0 bottom-0 h-full bg-primary rounded-md duration-100 ease-in-out"
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkProgress;

