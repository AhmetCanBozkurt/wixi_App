import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, Languages, Briefcase, ArrowRight } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { Link } from "react-router-dom"

export function ServicesOverview() {
  const { t } = useLanguage()

  const services = [
    {
      icon: GraduationCap,
      title: t("services.ausbildung"),
      description: t("services.ausbildung.desc"),
      href: "/services/ausbildung",
    },
    {
      icon: Languages,
      title: t("services.language"),
      description: t("services.language.desc"),
      href: "/services/language",
    },
    {
      icon: Briefcase,
      title: t("services.work"),
      description: t("services.work.desc"),
      href: "/services/work",
    },
  ]

  return (
    <section className="py-24 bg-muted/30">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("services.title")}</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{t("services.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <service.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription className="text-pretty">{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={service.href}>
                  <Button variant="outline" className="w-full">
                    {t("button.learn_more")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
