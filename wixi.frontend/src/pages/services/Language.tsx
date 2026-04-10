import React from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { CheckCircle, Clock, Users, BookOpen, Award, ArrowRight, Globe, MapPin } from "lucide-react";
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import { Link } from "react-router-dom";
import { useLanguage } from "../../contexts/language-context";

const Language: React.FC = () => {
  const { t } = useLanguage();

  const languageCities = [
    {
      name: "Berlin",
      image: "/berlin-city-skyline-with-brandenburg-gate.jpg",
      description: t("language.city.berlin_desc"),
      languageSchools: "50+",
      averageCost: "€300-600/ay",
      highlights: [
        t("language.city.multicultural"),
        t("language.city.affordable_living"),
        t("language.city.rich_culture"),
        t("language.city.easy_transport"),
      ],
      livingCost: t("medium"),
      studentLife: t("excellent"),
    },
    {
      name: "Hamburg",
      image: "/hamburg-port-city-with-harbor-and-ships.jpg",
      description: t("language.city.hamburg_desc"),
      languageSchools: "25+",
      averageCost: "€350-650/ay",
      highlights: [
        t("language.city.maritime_air"),
        t("language.city.calm_environment"),
        t("language.city.quality_education"),
        t("language.city.job_opportunities"),
      ],
      livingCost: t("medium"),
      studentLife: t("good"),
    },
    {
      name: "Köln",
      image: "/cologne-cathedral-and-rhine-river.jpg",
      description: t("language.city.cologne_desc"),
      languageSchools: "30+",
      averageCost: "€280-550/ay",
      highlights: [
        t("language.city.affordable_prices"),
        t("language.city.historic_atmosphere"),
        t("language.city.central_location"),
        t("language.city.student_friendly"),
      ],
      livingCost: t("low") + "-" + t("medium"),
      studentLife: t("good"),
    },
    {
      name: "Dresden",
      image: "/dresden-city-with-baroque-architecture.jpg",
      description: t("language.city.dresden_desc"),
      languageSchools: "15+",
      averageCost: "€250-450/ay",
      highlights: [
        t("language.city.low_living_cost"),
        t("language.city.baroque_architecture"),
        t("language.city.calm_environment"),
        t("language.city.quality_education"),
      ],
      livingCost: t("low"),
      studentLife: t("good"),
    },
    {
      name: "Heidelberg",
      image: "/heidelberg-university-town-with-castle.jpg",
      description: t("language.city.heidelberg_desc"),
      languageSchools: "20+",
      averageCost: "€400-700/ay",
      highlights: [
        t("language.city.university_atmosphere"),
        t("language.city.intensive_programs"),
        t("language.city.safe_environment"),
        t("language.city.nature_proximity"),
      ],
      livingCost: t("medium") + "-" + t("high"),
      studentLife: t("excellent"),
    },
    {
      name: "Leipzig",
      image: "/leipzig-city-center-with-historic-buildings.jpg",
      description: t("language.city.leipzig_desc"),
      languageSchools: "18+",
      averageCost: "€270-500/ay",
      highlights: [
        t("language.city.student_city"),
        t("language.city.affordable_prices"),
        t("language.city.young_population"),
        t("language.city.cultural_events"),
      ],
      livingCost: t("low"),
      studentLife: t("excellent"),
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-accent/10 via-background to-primary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">{t("language.hero.title")}</h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-3xl mx-auto">
              {t("language.hero.subtitle")}
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

      {/* Language Programs */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t("language.programs.title")}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: t("language.general_german"),
                  description: t("language.general_german_desc"),
                  duration: "4-12 " + t("duration").toLowerCase(),
                  level: "A1-C2",
                  icon: "🗣️",
                  price: "€300-600/ay",
                },
                {
                  title: t("language.intensive_german"),
                  description: t("language.intensive_german_desc"),
                  duration: "2-8 " + t("duration").toLowerCase(),
                  level: "A1-C1",
                  icon: "⚡",
                  price: "€500-900/ay",
                },
                {
                  title: t("language.business_german"),
                  description: t("language.business_german_desc"),
                  duration: "6-12 " + t("duration").toLowerCase(),
                  level: "B1-C1",
                  icon: "💼",
                  price: "€400-700/ay",
                },
                {
                  title: t("language.exam_prep"),
                  description: t("language.exam_prep_desc"),
                  duration: "4-8 " + t("duration").toLowerCase(),
                  level: "B2-C2",
                  icon: "📝",
                  price: "€350-650/ay",
                },
                {
                  title: t("language.university_prep"),
                  description: t("language.university_prep_desc"),
                  duration: "6-12 ay",
                  level: "A1-C1",
                  icon: "🎓",
                  price: "€400-800/ay",
                },
                {
                  title: t("language.online_german"),
                  description: t("language.online_german_desc"),
                  duration: t("continuous"),
                  level: "A1-C2",
                  icon: "💻",
                  price: "€200-400/ay",
                },
              ].map((program, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="text-4xl mb-2">{program.icon}</div>
                    <CardTitle className="text-xl">{program.title}</CardTitle>
                    <CardDescription>{program.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t("duration")}:</span>
                        <span className="text-sm font-medium">{program.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t("level")}:</span>
                        <span className="text-sm font-medium">{program.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t("price")}:</span>
                        <span className="text-sm font-medium">{program.price}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cities for Language Learning */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t("language.best_cities")}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {languageCities.map((city, index) => (
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
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {city.languageSchools} {t("language_schools")}
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

      {/* Language Learning Process */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t("language.process.title")}</h2>
            <div className="space-y-8">
              {[
                {
                  step: "1",
                  title: t("language.process.step1"),
                  description: t("language.process.step1_desc"),
                  duration: "1 Tag",
                  icon: <Award className="h-6 w-6" />,
                },
                {
                  step: "2",
                  title: t("language.process.step2"),
                  description: t("language.process.step2_desc"),
                  duration: "1 Woche",
                  icon: <BookOpen className="h-6 w-6" />,
                },
                {
                  step: "3",
                  title: t("language.process.step3"),
                  description: t("language.process.step3_desc"),
                  duration: "1 Woche",
                  icon: <MapPin className="h-6 w-6" />,
                },
                {
                  step: "4",
                  title: t("language.process.step4"),
                  description: t("language.process.step4_desc"),
                  duration: "1-2 Wochen",
                  icon: <CheckCircle className="h-6 w-6" />,
                },
                {
                  step: "5",
                  title: t("language.process.step5"),
                  description: t("language.process.step5_desc"),
                  duration: "4-6 Wochen",
                  icon: <Clock className="h-6 w-6" />,
                },
                {
                  step: "6",
                  title: t("language.process.step6"),
                  description: t("language.process.step6_desc"),
                  duration: "1 Woche",
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
              <p className="text-lg text-muted-foreground mb-6">{t("language.contact_info")}</p>
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

      <Footer />
    </div>
  );
};

export default Language;
