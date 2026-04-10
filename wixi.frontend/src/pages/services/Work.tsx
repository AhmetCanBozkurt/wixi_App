import React from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { CheckCircle, Users, BookOpen, Award, ArrowRight, Briefcase, TrendingUp, MapPin } from 'lucide-react';
import { Header } from '../../components/header';
import { Footer } from '../../components/footer';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/language-context';

const Work: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">{t("work.hero.title")}</h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-3xl mx-auto">
              {t("work.hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="text-lg px-8">
                  {t("button.consultation")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Work in Germany */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t("work.why_title")}</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-lg text-muted-foreground mb-6">{t("work.why_desc")}</p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold">{t("work.high_salaries")}</h3>
                      <p className="text-muted-foreground">{t("work.high_salaries_desc")}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold">{t("work.job_security")}</h3>
                      <p className="text-muted-foreground">{t("work.job_security_desc")}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold">{t("work.work_life_balance")}</h3>
                      <p className="text-muted-foreground">{t("work.work_life_balance_desc")}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold">{t("work.career_development")}</h3>
                      <p className="text-muted-foreground">{t("work.career_development_desc")}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 rounded-2xl">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">3.2%</div>
                    <div className="text-sm text-muted-foreground">{t("work.unemployment_rate")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">€55,000</div>
                    <div className="text-sm text-muted-foreground">{t("work.average_salary_stat")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">1.6M</div>
                    <div className="text-sm text-muted-foreground">{t("work.open_positions_stat")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">35</div>
                    <div className="text-sm text-muted-foreground">{t("work.weekly_hours")}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Work Visa Types */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t("work.visa_types")}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: t("work.eu_blue_card"),
                  description: t("work.eu_blue_card_desc"),
                  requirements: t("work.visa_requirements.university_degree"),
                  duration: t("work.duration.4_years"),
                  salary: "€56,800+",
                  icon: "🇪🇺",
                  advantages: [
                    t("work.visa_advantages.fast_permanent_residence"),
                    t("work.visa_advantages.family_reunification"),
                    t("work.visa_advantages.eu_free_movement"),
                  ],
                },
                {
                  title: t("work.skilled_worker"),
                  description: t("work.skilled_worker_desc"),
                  requirements: t("work.visa_requirements.vocational_training"),
                  duration: t("work.duration.4_years"),
                  salary: t("market_standard"),
                  icon: "🔧",
                  advantages: [
                    t("work.visa_advantages.wide_profession_range"),
                    t("work.visa_advantages.flexible_conditions"),
                    t("work.visa_advantages.family_bringing_right"),
                  ],
                },
                {
                  title: t("work.job_seeker"),
                  description: t("work.job_seeker_desc"),
                  requirements: t("work.visa_requirements.university_or_vocational"),
                  duration: t("work.duration.6_months"),
                  salary: t("job_search_process"),
                  icon: "🔍",
                  advantages: [
                    t("work.visa_advantages.job_search_opportunity"),
                    t("work.visa_advantages.interview_possibility"),
                    t("work.visa_advantages.networking_opportunity"),
                  ],
                },
                {
                  title: t("work.freelancer"),
                  description: t("work.freelancer_desc"),
                  requirements: t("work.visa_requirements.portfolio_references"),
                  duration: t("work.duration.1_3_years"),
                  salary: t("variable"),
                  icon: "💼",
                  advantages: [
                    t("work.visa_advantages.independent_work"),
                    t("work.visa_advantages.multiple_clients"),
                    t("work.visa_advantages.creative_freedom"),
                  ],
                },
                {
                  title: t("work.startup"),
                  description: t("work.startup_desc"),
                  requirements: t("work.visa_requirements.business_plan"),
                  duration: t("work.duration.3_years"),
                  salary: t("startup_income"),
                  icon: "🚀",
                  advantages: [
                    t("work.visa_advantages.innovation_support"),
                    t("work.visa_advantages.mentor_network"),
                    t("work.visa_advantages.investment_opportunities"),
                  ],
                },
                {
                  title: t("work.seasonal_worker"),
                  description: t("work.seasonal_worker_desc"),
                  requirements: t("work.visa_requirements.company_experience"),
                  duration: t("work.duration.3_years"),
                  salary: t("company_standard"),
                  icon: "🏢",
                  advantages: [
                    t("work.visa_advantages.fast_process"),
                    t("work.visa_advantages.company_support"),
                    t("work.visa_advantages.international_experience"),
                  ],
                },
              ].map((visa, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="text-4xl mb-2">{visa.icon}</div>
                    <CardTitle className="text-xl">{visa.title}</CardTitle>
                    <CardDescription>{visa.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium">{t("requirements")}:</span>
                        <p className="text-sm text-muted-foreground">{visa.requirements}</p>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t("duration")}:</span>
                        <span className="text-sm font-medium">{visa.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t("salary")}:</span>
                        <span className="text-sm font-medium">{visa.salary}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">{t("advantages")}:</span>
                        <ul className="text-sm text-muted-foreground mt-1">
                          {visa.advantages.map((advantage, i) => (
                            <li key={i} className="flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3 text-primary" />
                              <span>{advantage}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cities for Work */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t("work.cities_title")}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: t("work.city_berlin"),
                  image: "/berlin-city-skyline-with-brandenburg-gate.jpg",
                  description: t("work.city_berlin_desc"),
                  jobOpportunities: t("work.city_berlin_opportunities"),
                  averageSalary: "€55,000-75,000",
                  highlights: [
                    t("work.city_berlin_highlight1"),
                    t("work.city_berlin_highlight2"),
                    t("work.city_berlin_highlight3"),
                    t("work.city_berlin_highlight4"),
                  ],
                  livingCost: t("work.city_berlin_cost"),
                  sectors: t("work.city_berlin_sectors"),
                },
                {
                  name: t("work.city_frankfurt"),
                  image: "/frankfurt-financial-district-with-skyscrapers.jpg",
                  description: t("work.city_frankfurt_desc"),
                  jobOpportunities: t("work.city_frankfurt_opportunities"),
                  averageSalary: "€65,000-90,000",
                  highlights: [
                    t("work.city_frankfurt_highlight1"),
                    t("work.city_frankfurt_highlight2"),
                    t("work.city_frankfurt_highlight3"),
                    t("work.city_frankfurt_highlight4"),
                  ],
                  livingCost: t("work.city_frankfurt_cost"),
                  sectors: t("work.city_frankfurt_sectors"),
                },
                {
                  name: t("work.city_munich"),
                  image: "/munich-city-center-with-traditional-bavarian-archi.jpg",
                  description: t("work.city_munich_desc"),
                  jobOpportunities: t("work.city_munich_opportunities"),
                  averageSalary: "€60,000-80,000",
                  highlights: [
                    t("work.city_munich_highlight1"),
                    t("work.city_munich_highlight2"),
                    t("work.city_munich_highlight3"),
                    t("work.city_munich_highlight4"),
                  ],
                  livingCost: t("work.city_munich_cost"),
                  sectors: t("work.city_munich_sectors"),
                },
                {
                  name: t("work.city_hamburg"),
                  image: "/hamburg-port-city-with-harbor-and-ships.jpg",
                  description: t("work.city_hamburg_desc"),
                  jobOpportunities: t("work.city_hamburg_opportunities"),
                  averageSalary: "€50,000-70,000",
                  highlights: [
                    t("work.city_hamburg_highlight1"),
                    t("work.city_hamburg_highlight2"),
                    t("work.city_hamburg_highlight3"),
                    t("work.city_hamburg_highlight4"),
                  ],
                  livingCost: t("work.city_hamburg_cost"),
                  sectors: t("work.city_hamburg_sectors"),
                },
                {
                  name: t("work.city_dusseldorf"),
                  image: "/d-sseldorf-business-district-with-modern-buildings.jpg",
                  description: t("work.city_dusseldorf_desc"),
                  jobOpportunities: t("work.city_dusseldorf_opportunities"),
                  averageSalary: "€58,000-78,000",
                  highlights: [
                    t("work.city_dusseldorf_highlight1"),
                    t("work.city_dusseldorf_highlight2"),
                    t("work.city_dusseldorf_highlight3"),
                    t("work.city_dusseldorf_highlight4"),
                  ],
                  livingCost: t("work.city_dusseldorf_cost"),
                  sectors: t("work.city_dusseldorf_sectors"),
                },
                {
                  name: t("work.city_stuttgart"),
                  image: "/stuttgart-city-with-automotive-industry-buildings.jpg",
                  description: t("work.city_stuttgart_desc"),
                  jobOpportunities: t("work.city_stuttgart_opportunities"),
                  averageSalary: "€55,000-75,000",
                  highlights: [
                    t("work.city_stuttgart_highlight1"),
                    t("work.city_stuttgart_highlight2"),
                    t("work.city_stuttgart_highlight3"),
                    t("work.city_stuttgart_highlight4"),
                  ],
                  livingCost: t("work.city_stuttgart_cost"),
                  sectors: t("work.city_stuttgart_sectors"),
                },
              ].map((city, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <img src={city.image || "/placeholder.svg"} alt={city.name} className="object-cover w-full h-full" />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-2xl font-bold text-white">{city.name}</h3>
                    </div>
                  </div>

                  <CardHeader>
                    <CardDescription className="text-pretty">{city.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span>{city.jobOpportunities}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span>{city.averageSalary}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{city.livingCost}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{city.sectors}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">{t("work.city_highlights")}</h4>
                      <div className="flex flex-wrap gap-2">
                        {city.highlights.map((highlight) => (
                          <span key={highlight} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* In-Demand Sectors */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t("work.sectors_title")}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: t("work.sector_it"),
                  openPositions: "320,000+",
                  avgSalary: "€65,000",
                  growth: "+15%",
                  icon: "💻",
                  skills: ["Python", "Java", "Cloud", "AI/ML"],
                },
                {
                  title: t("work.sector_engineering"),
                  openPositions: "180,000+",
                  avgSalary: "€58,000",
                  growth: "+8%",
                  icon: "⚙️",
                  skills: ["Makine", "Elektrik", "Otomotiv", "Endüstri"],
                },
                {
                  title: t("work.sector_health"),
                  openPositions: "150,000+",
                  avgSalary: "€52,000",
                  growth: "+12%",
                  icon: "🏥",
                  skills: ["Hemşirelik", "Fizyoterapi", "Tıbbi Tekniker", "Bakım"],
                },
                {
                  title: t("work.sector_finance"),
                  openPositions: "85,000+",
                  avgSalary: "€62,000",
                  growth: "+6%",
                  icon: "💰",
                  skills: ["Analiz", "Risk Yönetimi", "Fintech", "Danışmanlık"],
                },
              ].map((sector, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="text-4xl mb-2">{sector.icon}</div>
                    <CardTitle className="text-lg">{sector.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="text-2xl font-bold text-primary">{sector.openPositions}</div>
                        <div className="text-sm text-muted-foreground">{t("work.open_positions")}</div>
                      </div>
                      <div>
                        <div className="text-xl font-semibold">{sector.avgSalary}</div>
                        <div className="text-sm text-muted-foreground">{t("work.average_salary")}</div>
                      </div>
                      <div>
                        <Badge variant="secondary" className="text-green-600">
                          {sector.growth} {t("work.growth")}
                        </Badge>
                      </div>
                      <div></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t("work.application_title")}</h2>
            <div className="space-y-8">
              {[
                {
                  step: "1",
                  title: t("work.application_step1"),
                  description: t("work.application_step1_desc"),
                  duration: t("work.duration.1_week"),
                  icon: <Users className="h-6 w-6" />,
                },
                {
                  step: "2",
                  title: t("work.application_step2"),
                  description: t("work.application_step2_desc"),
                  duration: t("work.duration.1_week"),
                  icon: <BookOpen className="h-6 w-6" />,
                },
                {
                  step: "3",
                  title: t("work.application_step3"),
                  description: t("work.application_step3_desc"),
                  duration: t("work.duration.1_week"),
                  icon: <TrendingUp className="h-6 w-6" />,
                },
                {
                  step: "4",
                  title: t("work.application_step4"),
                  description: t("work.application_step4_desc"),
                  duration: t("work.duration.4_12_weeks"),
                  icon: <Briefcase className="h-6 w-6" />,
                },
                {
                  step: "5",
                  title: t("work.application_step5"),
                  description: t("work.application_step5_desc"),
                  duration: t("work.duration.1_2_weeks"),
                  icon: <Award className="h-6 w-6" />,
                },
                {
                  step: "6",
                  title: t("work.application_step6"),
                  description: t("work.application_step6_desc"),
                  duration: t("work.duration.6_10_weeks"),
                  icon: <MapPin className="h-6 w-6" />,
                },
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                      {item.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {item.icon}
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                    </div>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <p className="text-lg text-muted-foreground mb-6">{t("work.application_cta")}</p>
              <Link to="/contact">
                <Button size="lg" className="text-lg px-8">
                  {t("button.consultation")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Work;
