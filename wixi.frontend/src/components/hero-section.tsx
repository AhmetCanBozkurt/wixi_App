import { Button } from "@/components/ui/button"
import { ArrowRight, User, Building2 } from "lucide-react"
import { Link } from "react-router-dom"
import { useLanguage } from "@/contexts/language-context"
import { isProd } from "@/utils/env"

export function HeroSection() {
  const { t, language } = useLanguage()
  const showPreviewOnlyFeatures = !isProd

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-emerald-50/40"></div>
      
      {/* Germany city skyline silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-5">
        <div className="w-full h-full bg-gradient-to-t from-gray-400 to-transparent" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120'%3E%3Cpath d='M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,85.3C672,75,768,85,864,96C960,107,1056,117,1152,112C1248,107,1344,85,1392,74.7L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z' fill='%23334155'/%3E%3C/svg%3E")`,
               backgroundSize: 'cover',
               backgroundPosition: 'bottom'
             }}>
        </div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-blue-200/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-br from-amber-200/15 to-transparent rounded-full blur-2xl"></div>
      
      <div className="container px-4 py-24 mx-auto lg:py-32 relative z-10">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 items-center">
          {/* Left Column - Main Content */}
          <div className="space-y-8">
            <div className="space-y-8">
              <h1 className="text-5xl font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl font-[var(--font-playfair)] leading-tight">
                {t("hero.title").split("Gerçeğe").length > 1 ? (
                  <>
                    <span className="text-gray-900">{t("hero.title").split("Gerçeğe")[0]}</span>
                    <br />
                    <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-emerald-600 bg-clip-text text-transparent drop-shadow-sm">Gerçeğe</span>
                    <span className="text-gray-900">{t("hero.title").split("Gerçeğe")[1]}</span>
                  </>
                ) : t("hero.title").split("Deutschland").length > 1 ? (
                  <>
                    <span className="text-gray-900">{t("hero.title").split("Deutschland")[0]}</span>
                    <br />
                    <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-emerald-600 bg-clip-text text-transparent drop-shadow-sm">Deutschland</span>
                    <span className="text-gray-900">{t("hero.title").split("Deutschland")[1]}</span>
                  </>
                ) : t("hero.title").split("Dream").length > 1 ? (
                  <>
                    <span className="text-gray-900">{t("hero.title").split("Dream")[0]}</span>
                    <br />
                    <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-emerald-600 bg-clip-text text-transparent drop-shadow-sm">Dream</span>
                    <span className="text-gray-900">{t("hero.title").split("Dream")[1]}</span>
                  </>
                ) : t("hero.title").split("حلمك").length > 1 ? (
                  <>
                    <span className="text-gray-900">{t("hero.title").split("حلمك")[0]}</span>
                    <br />
                    <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-emerald-600 bg-clip-text text-transparent drop-shadow-sm">حلمك</span>
                    <span className="text-gray-900">{t("hero.title").split("حلمك")[1]}</span>
                  </>
                ) : (
                  <span className="text-gray-900">{t("hero.title")}</span>
                )}
              </h1>
              
              <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                {t("hero.subtitle")}
              </p>
            </div>

            {showPreviewOnlyFeatures && (
              <div className="flex flex-col sm:flex-row gap-6">
                <Link to="/references">
                  <Button 
                    size="lg" 
                    className="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 via-blue-700 to-emerald-600 hover:from-blue-700 hover:via-blue-800 hover:to-emerald-700 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/25"
                    style={{
                      boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.1)'
                    }}
                  >
                    {t("button.start_journey")}
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Right Column - Service Cards */}
          <div className="space-y-6">
            <div className="grid gap-6">
              <Link to="/fur-arbeitnehmer" className="group">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-103 border border-white/50 group-hover:border-blue-200/50">
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                      <User className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {t("hero.card.arbeitnehmer.title")}
                    </h3>
                    <p className="text-gray-600 group-hover:text-gray-700 transition-colors font-medium">
                      {t("hero.card.arbeitnehmer.desc")}
                    </p>
                  </div>
                </div>
              </Link>
              
              <Link to="/fur-arbeitgeber" className="group">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-103 border border-white/50 group-hover:border-emerald-200/50">
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                      <Building2 className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                      {t("hero.card.arbeitgeber.title")}
                    </h3>
                    <p className="text-gray-600 group-hover:text-gray-700 transition-colors font-medium">
                      {t("hero.card.arbeitgeber.desc")}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
