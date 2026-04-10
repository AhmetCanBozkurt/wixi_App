import React from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { CheckCircle, Clock, Users, BookOpen, Award, ArrowRight, Briefcase } from "lucide-react";
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import { Link } from "react-router-dom";
import { useLanguage } from "../../contexts/language-context";

const Ausbildung: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/5 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">{t("services.ausbildung.title")}</h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-3xl mx-auto">
              {t("services.ausbildung.subtitle")}
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

      {/* What is Ausbildung */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t("services.ausbildung.what_is")}</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-lg text-muted-foreground mb-6">{t("services.ausbildung.what_is_desc")}</p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold">{t("services.ausbildung.practical_training")}</h3>
                      <p className="text-muted-foreground">{t("services.ausbildung.practical_training_desc")}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold">{t("services.ausbildung.paid_learning")}</h3>
                      <p className="text-muted-foreground">{t("services.ausbildung.paid_learning_desc")}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold">{t("services.ausbildung.job_guarantee")}</h3>
                      <p className="text-muted-foreground">{t("services.ausbildung.job_guarantee_desc")}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 rounded-2xl">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">350+</div>
                    <div className="text-sm text-muted-foreground">{t("services.ausbildung.fields")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">2-3.5</div>
                    <div className="text-sm text-muted-foreground">{t("services.ausbildung.duration")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">€515-1500</div>
                    <div className="text-sm text-muted-foreground">{t("services.ausbildung.salary")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">68%</div>
                    <div className="text-sm text-muted-foreground">{t("services.ausbildung.retention")}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Ausbildung Fields */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              {t("services.ausbildung.popular_fields")}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: t("ausbildung.field.it"),
                  description: t("ausbildung.field.it_desc"),
                  duration: t("ausbildung.field.it_duration"),
                  salary: t("ausbildung.field.it_salary"),
                  icon: "💻",
                },
                {
                  title: t("ausbildung.field.healthcare"),
                  description: t("ausbildung.field.healthcare_desc"),
                  duration: t("ausbildung.field.healthcare_duration"),
                  salary: t("ausbildung.field.healthcare_salary"),
                  icon: "🏥",
                },
                {
                  title: t("ausbildung.field.mechanical"),
                  description: t("ausbildung.field.mechanical_desc"),
                  duration: t("ausbildung.field.mechanical_duration"),
                  salary: t("ausbildung.field.mechanical_salary"),
                  icon: "⚙️",
                },
                {
                  title: t("ausbildung.field.automotive"),
                  description: t("ausbildung.field.automotive_desc"),
                  duration: t("ausbildung.field.automotive_duration"),
                  salary: t("ausbildung.field.automotive_salary"),
                  icon: "🚗",
                },
                {
                  title: t("ausbildung.field.finance"),
                  description: t("ausbildung.field.finance_desc"),
                  duration: t("ausbildung.field.finance_duration"),
                  salary: t("ausbildung.field.finance_salary"),
                  icon: "🏦",
                },
                {
                  title: t("ausbildung.field.hospitality"),
                  description: t("ausbildung.field.hospitality_desc"),
                  duration: t("ausbildung.field.hospitality_duration"),
                  salary: t("ausbildung.field.hospitality_salary"),
                  icon: "🏨",
                },
              ].map((field, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="text-4xl mb-2">{field.icon}</div>
                    <CardTitle className="text-xl">{field.title}</CardTitle>
                    <CardDescription>{field.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t("duration")}:</span>
                        <span className="text-sm font-medium">{field.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t("salary")}:</span>
                        <span className="text-sm font-medium">{field.salary}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              {t("services.ausbildung.application_process")}
            </h2>
            <div className="space-y-8">
              {[
                {
                  step: "1",
                  title: t("ausbildung.step1.title"),
                  description: t("ausbildung.step1.desc"),
                  icon: <Users className="h-6 w-6" />,
                },
                {
                  step: "2",
                  title: t("ausbildung.step2.title"),
                  description: t("ausbildung.step2.desc"),
                  icon: <BookOpen className="h-6 w-6" />,
                },
                {
                  step: "3",
                  title: t("ausbildung.step3.title"),
                  description: t("ausbildung.step3.desc"),
                  icon: <Award className="h-6 w-6" />,
                },
                {
                  step: "4",
                  title: t("ausbildung.step4.title"),
                  description: t("ausbildung.step4.desc"),
                  icon: <CheckCircle className="h-6 w-6" />,
                },
                {
                  step: "5",
                  title: t("ausbildung.step5.title"),
                  description: t("ausbildung.step5.desc"),
                  icon: <Clock className="h-6 w-6" />,
                },
                {
                  step: "6",
                  title: t("ausbildung.step6.title"),
                  description: t("ausbildung.step6.desc"),
                  icon: <Users className="h-6 w-6" />,
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
              <p className="text-lg text-muted-foreground mb-6">{t("ausbildung.contact_info")}</p>
              <Link to="/contact">
                <Button size="lg" className="text-lg px-8">
                  {t("button.contact")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              {t("services.ausbildung.requirements")}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{t("services.ausbildung.general_requirements")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span>{t("ausbildung.req.age")}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span>{t("ausbildung.req.education")}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span>{t("ausbildung.req.german")}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span>{t("ausbildung.req.criminal_record")}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{t("services.ausbildung.required_documents")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span>{t("ausbildung.doc.diploma")}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span>{t("ausbildung.doc.language_cert")}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span>{t("ausbildung.doc.passport")}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span>{t("ausbildung.doc.criminal_record")}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span>{t("ausbildung.doc.health_cert")}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Cities for Ausbildung */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t("services.ausbildung.best_cities")}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: "Stuttgart",
                  image: "/stuttgart-city-with-automotive-industry-buildings.jpg",
                  description: t("ausbildung.city.stuttgart_desc"),
                  companies: t("ausbildung.city.companies_500"),
                  averageSalary: "€900-1200",
                  highlights: [
                    t("ausbildung.city.automotive"),
                    t("ausbildung.city.high_salary"),
                    t("ausbildung.city.job_guarantee"),
                    t("ausbildung.city.tech_center"),
                  ],
                  jobRate: "95%",
                  sectors: t("ausbildung.city.automotive_mechanical"),
                },
                {
                  name: "München",
                  image: "/munich-city-center-with-traditional-bavarian-archi.jpg",
                  description: t("ausbildung.city.munich_desc"),
                  companies: t("ausbildung.city.companies_400"),
                  averageSalary: "€850-1150",
                  highlights: [
                    t("ausbildung.city.diverse_sectors"),
                    t("ausbildung.city.quality_life"),
                    t("ausbildung.city.safe_environment"),
                    t("ausbildung.city.cultural_richness"),
                  ],
                  jobRate: "92%",
                  sectors: t("ausbildung.city.tech_finance"),
                },
                {
                  name: "Hamburg",
                  image: "/hamburg-port-city-with-harbor-and-ships.jpg",
                  description: t("ausbildung.city.hamburg_desc"),
                  companies: t("ausbildung.city.companies_300"),
                  averageSalary: "€800-1100",
                  highlights: [
                    t("ausbildung.city.logistics_center"),
                    t("ausbildung.city.shipping"),
                    t("ausbildung.city.media_sector"),
                    t("ausbildung.city.port_economy"),
                  ],
                  jobRate: "90%",
                  sectors: t("ausbildung.city.logistics_media"),
                },
                {
                  name: "Düsseldorf",
                  image: "/d-sseldorf-business-district-with-modern-buildings.jpg",
                  description: t("ausbildung.city.dusseldorf_desc"),
                  companies: t("ausbildung.city.companies_350"),
                  averageSalary: "€900-1250",
                  highlights: [
                    t("ausbildung.city.business_center"),
                    t("ausbildung.city.international_companies"),
                    t("ausbildung.city.high_salary"),
                    t("ausbildung.city.japanese_culture"),
                  ],
                  jobRate: "93%",
                  sectors: t("ausbildung.city.finance_tech"),
                },
                {
                  name: "Frankfurt",
                  image: "/frankfurt-financial-district-with-skyscrapers.jpg",
                  description: t("ausbildung.city.frankfurt_desc"),
                  companies: t("ausbildung.city.companies_250"),
                  averageSalary: "€950-1300",
                  highlights: [
                    t("ausbildung.city.finance_center"),
                    t("ausbildung.city.banking"),
                    t("ausbildung.city.high_salary"),
                    t("ausbildung.city.international_environment"),
                  ],
                  jobRate: "94%",
                  sectors: t("ausbildung.city.banking_finance"),
                },
                {
                  name: "Köln",
                  image: "/cologne-cathedral-and-rhine-river.jpg",
                  description: t("ausbildung.city.cologne_desc"),
                  companies: t("ausbildung.city.companies_280"),
                  averageSalary: "€750-1050",
                  highlights: [
                    t("ausbildung.city.media_sector"),
                    t("ausbildung.city.art_center"),
                    t("ausbildung.city.affordable_living"),
                    t("ausbildung.city.cultural_events"),
                  ],
                  jobRate: "88%",
                  sectors: t("ausbildung.city.media_art"),
                },
              ].map((city, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <img src={city.image || "/placeholder.svg"} alt={city.name} className="w-full h-full object-cover" />
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
                        <span>{city.companies}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span>{city.averageSalary}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {city.jobRate} {t("ausbildung.city.job_rate")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{city.sectors}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">{t("highlights")}</h4>
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

      <Footer />
    </div>
  );
};

export default Ausbildung;
