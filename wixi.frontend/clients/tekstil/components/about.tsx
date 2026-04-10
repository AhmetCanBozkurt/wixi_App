'use client'

import { useEffect, useRef, useState } from "react"
import { Award, Users, Sparkles, Target } from "lucide-react"

const stats = [
  { label: "Yıllık Deneyim", value: "15+", icon: Award },
  { label: "Mutlu Müşteri", value: "200+", icon: Users },
  { label: "Tamamlanan Proje", value: "500+", icon: Sparkles },
  { label: "Yıllık Üretim", value: "50K+", icon: Target },
]

export function About() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="hakkimizda" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2
            className={`text-4xl md:text-5xl font-bold mb-6 tracking-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {"Hakkımızda"}
          </h2>
          <p
            className={`text-lg text-muted-foreground leading-relaxed transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {
              "2008 yılından beri t-shirt, sweatshirt ve okul üniforması üretiminde uzmanlaşmış bir firmayız. Okullar, spor kulüpleri ve kurumsal firmalar için kaliteli, dayanıklı ve uygun fiyatlı giyim çözümleri sunuyoruz. Modern üretim tesisimiz ve deneyimli ekibimizle, müşterilerimizin ihtiyaçlarına özel tasarımlar gerçekleştiriyoruz."
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className={`bg-card p-6 rounded-xl text-center transition-all duration-700 hover:shadow-lg hover:scale-105 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${200 + index * 100}ms` }}
              >
                <Icon className="w-8 h-8 mx-auto mb-4 text-accent" />
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            )
          })}
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mt-16">
          <div
            className={`bg-card p-8 rounded-xl transition-all duration-700 delay-500 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <h3 className="text-2xl font-bold mb-4">{"Misyonumuz"}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {
                "Okullar ve kurumlar için en kaliteli giyim ürünlerini uygun fiyatlarla sunarak, müşteri memnuniyetini ön planda tutmak ve uzun vadeli iş ortaklıkları kurmaktır."
              }
            </p>
          </div>
          <div
            className={`bg-card p-8 rounded-xl transition-all duration-700 delay-600 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <h3 className="text-2xl font-bold mb-4">{"Vizyonumuz"}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {
                "Türkiye'nin en güvenilir okul ve kurumsal giyim tedarikçisi olmak, kalite ve hizmet standartlarımızla sektörde öncü konumda yer almaktır."
              }
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
