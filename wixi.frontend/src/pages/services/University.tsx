import React from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { CheckCircle, Clock, Users, BookOpen, Award, ArrowRight, Globe, GraduationCap, MapPin } from "lucide-react";
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import { Link } from "react-router-dom";
import { useLanguage } from "../../contexts/language-context";

const University: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-accent/10 via-background to-primary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">{t("university.hero.title")}</h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-3xl mx-auto">
              {t("university.hero.subtitle")}
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

      {/* Why Study in Germany */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t("university.why_title")}</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-lg text-muted-foreground mb-6">{t("university.why_desc")}</p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-accent mt-0.5" />
                    <div>
                      <h3 className="font-semibold">{t("university.low_cost")}</h3>
                      <p className="text-muted-foreground">{t("university.low_cost_desc")}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-accent mt-0.5" />
                    <div>
                      <h3 className="font-semibold">{t("university.recognition")}</h3>
                      <p className="text-muted-foreground">{t("university.recognition_desc")}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-accent mt-0.5" />
                    <div>
                      <h3 className="font-semibold">{t("university.job_opportunities")}</h3>
                      <p className="text-muted-foreground">{t("university.job_opportunities_desc")}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-accent mt-0.5" />
                    <div>
                      <h3 className="font-semibold">{t("university.research")}</h3>
                      <p className="text-muted-foreground">{t("university.research_desc")}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-accent/10 to-primary/10 p-8 rounded-2xl">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent">400+</div>
                    <div className="text-sm text-muted-foreground">{t("universities")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent">17,000+</div>
                    <div className="text-sm text-muted-foreground">{t("programs")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent">€0-350</div>
                    <div className="text-sm text-muted-foreground">{t("semester_fee")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent">1,500+</div>
                    <div className="text-sm text-muted-foreground">{t("english_programs")}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Study Programs */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t("university.popular_programs")}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: t("university.engineering"),
                  description: t("university.engineering_desc"),
                  duration: t("duration_3_4_years"),
                  language: t("language_de_en"),
                  icon: "⚙️",
                  programs: t("programs_500_plus"),
                },
                {
                  title: t("university.computer_science"),
                  description: t("university.computer_science_desc"),
                  duration: t("duration_3_4_years"),
                  language: t("language_de_en"),
                  icon: "💻",
                  programs: t("programs_300_plus"),
                },
                {
                  title: t("university.business"),
                  description: t("university.business_desc"),
                  duration: t("duration_3_4_years"),
                  language: t("language_de_en"),
                  icon: "📊",
                  programs: t("programs_400_plus"),
                },
                {
                  title: t("university.medicine"),
                  description: t("university.medicine_desc"),
                  duration: t("duration_6_years"),
                  language: t("language_de"),
                  icon: "🏥",
                  programs: t("programs_200_plus"),
                },
                {
                  title: t("university.social_sciences"),
                  description: t("university.social_sciences_desc"),
                  duration: t("duration_3_4_years"),
                  language: t("language_de_en"),
                  icon: "🧠",
                  programs: t("programs_250_plus"),
                },
                {
                  title: t("university.arts"),
                  description: t("university.arts_desc"),
                  duration: t("duration_3_5_years"),
                  language: t("language_de_en"),
                  icon: "🎨",
                  programs: t("programs_150_plus"),
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
                        <span className="text-sm text-muted-foreground">{t("language")}:</span>
                        <span className="text-sm font-medium">{field.language}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t("programs")}:</span>
                        <span className="text-sm font-medium">{field.programs}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t("university.application_process")}</h2>
            <div className="space-y-8">
              {[
                {
                  step: "1",
                  title: t("university.process.step1"),
                  description: t("university.process.step1_desc"),
                  duration: t("duration_1_week"),
                  icon: <Award className="h-6 w-6" />,
                },
                {
                  step: "2",
                  title: t("university.process.step2"),
                  description: t("university.process.step2_desc"),
                  duration: t("duration_2_weeks"),
                  icon: <BookOpen className="h-6 w-6" />,
                },
                {
                  step: "3",
                  title: t("university.process.step3"),
                  description: t("university.process.step3_desc"),
                  duration: t("duration_6_12_months"),
                  icon: <Globe className="h-6 w-6" />,
                },
                {
                  step: "4",
                  title: t("university.process.step4"),
                  description: t("university.process.step4_desc"),
                  duration: t("duration_4_weeks"),
                  icon: <CheckCircle className="h-6 w-6" />,
                },
                {
                  step: "5",
                  title: t("university.process.step5"),
                  description: t("university.process.step5_desc"),
                  duration: t("duration_2_4_weeks"),
                  icon: <Clock className="h-6 w-6" />,
                },
                {
                  step: "6",
                  title: t("university.process.step6"),
                  description: t("university.process.step6_desc"),
                  duration: t("duration_6_8_weeks"),
                  icon: <Users className="h-6 w-6" />,
                },
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold">
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
              <p className="text-lg text-muted-foreground mb-6">{t("university.contact_info")}</p>
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

      {/* Cities for University Education */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t("university.best_cities")}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: "Berlin",
                  image: "/berlin-city-skyline-with-brandenburg-gate.jpg",
                  description: t("university.city.berlin_desc"),
                  universities: "40+",
                  averageCost: "€300-500/Monat",
                  highlights: [
                    t("university.city.berlin_highlight1"),
                    t("university.city.berlin_highlight2"),
                    t("university.city.berlin_highlight3"),
                    t("university.city.berlin_highlight4"),
                  ],
                  livingCost: t("medium"),
                  studentLife: t("excellent"),
                },
                {
                  name: "München",
                  image: "/munich-city-center-with-traditional-bavarian-archi.jpg",
                  description: t("university.city.munich_desc"),
                  universities: "25+",
                  averageCost: "€350-600/Monat",
                  highlights: [
                    t("university.city.munich_highlight1"),
                    t("university.city.munich_highlight2"),
                    t("university.city.munich_highlight3"),
                    t("university.city.munich_highlight4"),
                  ],
                  livingCost: t("high"),
                  studentLife: t("excellent"),
                },
                {
                  name: "Hamburg",
                  image: "/hamburg-port-city-with-harbor-and-ships.jpg",
                  description: t("university.city.hamburg_desc"),
                  universities: "20+",
                  averageCost: "€300-550/Monat",
                  highlights: [
                    t("university.city.hamburg_highlight1"),
                    t("university.city.hamburg_highlight2"),
                    t("university.city.hamburg_highlight3"),
                    t("university.city.hamburg_highlight4"),
                  ],
                  livingCost: t("medium"),
                  studentLife: t("good"),
                },
                {
                  name: "Heidelberg",
                  image: "/heidelberg-university-town-with-castle.jpg",
                  description: t("university.city.heidelberg_desc"),
                  universities: "15+",
                  averageCost: "€400-650/Monat",
                  highlights: [
                    t("university.city.heidelberg_highlight1"),
                    t("university.city.heidelberg_highlight2"),
                    t("university.city.heidelberg_highlight3"),
                    t("university.city.heidelberg_highlight4"),
                  ],
                  livingCost: t("medium_high"),
                  studentLife: t("excellent"),
                },
                {
                  name: "Dresden",
                  image: "/dresden-city-with-baroque-architecture.jpg",
                  description: t("university.city.dresden_desc"),
                  universities: "12+",
                  averageCost: "€250-450/Monat",
                  highlights: [
                    t("university.city.dresden_highlight1"),
                    t("university.city.dresden_highlight2"),
                    t("university.city.dresden_highlight3"),
                    t("university.city.dresden_highlight4"),
                  ],
                  livingCost: t("low"),
                  studentLife: t("good"),
                },
                {
                  name: "Köln",
                  image: "/cologne-cathedral-and-rhine-river.jpg",
                  description: t("university.city.cologne_desc"),
                  universities: "18+",
                  averageCost: "€300-500/Monat",
                  highlights: [
                    t("university.city.cologne_highlight1"),
                    t("university.city.cologne_highlight2"),
                    t("university.city.cologne_highlight3"),
                    t("university.city.cologne_highlight4"),
                  ],
                  livingCost: t("medium"),
                  studentLife: t("good"),
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
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {city.universities} {t("universities")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span>{city.averageCost}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{city.livingCost}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{city.studentLife}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">{t("highlights")}</h4>
                      <div className="flex flex-wrap gap-2">
                        {city.highlights.map((highlight) => (
                          <span key={highlight} className="bg-accent/10 text-accent px-2 py-1 rounded-md text-xs">
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

      {/* Requirements */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t("university.requirements")}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{t("university.bachelor")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span>{t("university.req.abitur")}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span>{t("university.req.language")}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span>{t("university.req.studienkolleg")}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span>{t("university.req.motivation_bachelor")}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{t("university.master")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
                      <span>{t("university.req.bachelor")}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
                      <span>{t("university.req.gpa")}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
                      <span>{t("university.req.language_cert")}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
                      <span>{t("university.req.recommendation")}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
                      <span>{t("university.req.motivation_master")}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{t("university.phd")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span>{t("university.req.master")}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span>{t("university.req.research_proposal")}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span>{t("university.req.supervisor")}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span>{t("university.req.publications")}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span>{t("university.req.funding")}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default University;
