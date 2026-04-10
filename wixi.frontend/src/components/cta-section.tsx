import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Phone, Mail } from "lucide-react"
import { Link } from "react-router-dom"
import { useLanguage } from "@/contexts/language-context"

export function CTASection() {
  const { t } = useLanguage()

  return (
    <section className="py-24">
      <div className="container px-4 mx-auto">
        <Card className="border-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden relative">
          <CardContent className="relative p-12 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-[var(--font-playfair)]">
                  {t("cta.title")}
                </h2>
                {/* <p className="text-xl text-primary-foreground/90 text-pretty leading-relaxed">{t("cta.subtitle")}</p> */}
                {/* Almanya hayalinizi gerçekleştirin - Yorum satırına alındı */}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button size="lg" variant="secondary" className="text-lg px-8">
                    {t("button.consultation")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8 border-t border-primary-foreground/20">
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>{"+90 533 057 00 31 "}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>info@worklines.de</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
