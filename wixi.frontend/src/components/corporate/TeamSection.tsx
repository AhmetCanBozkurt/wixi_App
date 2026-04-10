import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { useLanguage } from '../../contexts/language-context';
import { Linkedin, Mail } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  image?: string;
  linkedin?: string;
  email?: string;
}

const TeamSection = () => {
  const { t } = useLanguage();

  // Mock team data - can be replaced with API call
  const teamMembers: TeamMember[] = [
    {
      name: 'John Doe',
      role: t('team.ceo') || 'CEO & Founder',
      image: undefined,
      linkedin: '#',
      email: 'john@example.com',
    },
    {
      name: 'Jane Smith',
      role: t('team.cto') || 'CTO',
      image: undefined,
      linkedin: '#',
      email: 'jane@example.com',
    },
    {
      name: 'Mike Johnson',
      role: t('team.leadDeveloper') || 'Lead Developer',
      image: undefined,
      linkedin: '#',
      email: 'mike@example.com',
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-darkmode">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <div
            className="flex gap-2 items-center justify-center mb-4"
            data-aos="fade-up"
            data-aos-delay="200"
            data-aos-duration="1000"
          >
            <span className="w-3 h-3 rounded-full bg-success"></span>
            <span className="font-medium text-midnight_text text-sm dark:text-white/50">
              {t('team.badge') || 'our team'}
            </span>
          </div>
          <h2
            className="text-4xl font-bold mb-4 text-midnight_text dark:text-white"
            data-aos="fade-up"
            data-aos-delay="200"
            data-aos-duration="1000"
          >
            {t('team.title') || 'Meet Our Team'}
          </h2>
          <p
            className="text-xl text-grey dark:text-white/70"
            data-aos="fade-up"
            data-aos-delay="200"
            data-aos-duration="1000"
          >
            {t('team.subtitle') || 'The talented people behind our success'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {teamMembers.map((member, index) => (
            <Card
              key={index}
              className="text-center hover:shadow-lg transition-shadow bg-white dark:bg-darklight"
              data-aos="fade-up"
              data-aos-delay={`${index * 200}`}
              data-aos-duration="1000"
            >
              <CardHeader>
                <div className="h-32 w-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-32 w-32 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-4xl font-bold">
                      {member.name.charAt(0)}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-midnight_text dark:text-white">{member.name}</h3>
                <p className="text-grey dark:text-white/70">{member.role}</p>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center gap-4">
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-grey hover:text-primary dark:text-white/70 dark:hover:text-primary transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="text-grey hover:text-primary dark:text-white/70 dark:hover:text-primary transition-colors"
                    >
                      <Mail className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
