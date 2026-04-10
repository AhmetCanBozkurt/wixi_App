'use client'

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "../../../src/components/ui/card"
import { Sparkles } from "lucide-react"

const products = [
  {
    title: "T-Shirt Baskı",
    description: "Özel tasarım ve logolu t-shirt üretimi, toptan satış",
    image: "/custom-printed-tshirt-design.jpg",
  },
  {
    title: "Sweatshirt",
    description: "Kaliteli kumaş ve dikişle sweatshirt üretimi",
    image: "/custom-sweatshirt-hoodie-design.jpg",
  },
  {
    title: "Okul Üniforması",
    description: "Okullar için özel tasarım üniforma takımları",
    image: "/school-uniform-shirt-pants.jpg",
  },
  {
    title: "Polo Yaka",
    description: "Kurumsal ve spor kulüpler için polo yaka t-shirt",
    image: "/polo-shirt-corporate-uniform.jpg",
  },
  {
    title: "Kapşonlu Sweatshirt",
    description: "Özel baskı ve nakışlı kapşonlu sweatshirt",
    image: "/hoodie-custom-print-design.jpg",
  },
  {
    title: "Spor Giyim",
    description: "Spor kulüpleri için özel tasarım forma ve eşofman",
    image: "/sports-team-uniform-jersey.jpg",
  },
]

export function Products() {
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
    <section ref={sectionRef} id="urunler" className="py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-accent" />
            <span className="text-sm font-medium text-accent uppercase tracking-wider">{"Ürünlerimiz"}</span>
          </div>
          <h2
            className={`text-4xl md:text-5xl font-bold mb-6 tracking-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {"Geniş Ürün Yelpazemiz"}
          </h2>
          <p
            className={`text-lg text-muted-foreground leading-relaxed transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {"T-shirt'ten sweatshirt'e, okul üniformasından spor giysilerine kadar"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <Card
              key={index}
              className={`group overflow-hidden hover:shadow-xl transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">{product.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
