'use client'

import { Button } from "../../../src/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section id="ana-sayfa" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('/modern-textile-tshirt-sweatshirt-production.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background/90" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in-up opacity-0" style={{ animationDelay: "0.2s" }}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight text-balance">
              {"Okullar ve Kurumlar İçin"}
              <br />
              {"Özel Tasarım Giyim"}
            </h1>
          </div>

          <div className="animate-fade-in-up opacity-0" style={{ animationDelay: "0.4s" }}>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed text-pretty">
              {
                "T-shirt, sweatshirt ve okul üniformalarında uzman bir firmayız. Okullar, spor kulüpleri ve kurumlar için kaliteli, dayanıklı ve özel tasarım giysiler üretiyoruz."
              }
            </p>
          </div>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.6s" }}
          >
            <Button size="lg" onClick={() => scrollToSection("urunler")} className="group">
              {"Ürünlerimizi Keşfedin"}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => scrollToSection("iletisim")}>
              {"İletişime Geçin"}
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-2 bg-foreground/30 rounded-full" />
        </div>
      </div>
    </section>
  )
}
